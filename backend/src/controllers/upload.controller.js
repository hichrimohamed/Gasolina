const xlsx    = require('xlsx');
const pool    = require('../config/db');
const parsers = require('../parsers');

const FILE_MAP = {
  'venteCarburants':              { parser: parsers.venteCarburants,    table: 'vente_carburants' },
  'VenteProduit':                 { parser: parsers.venteProduit,       table: 'vente_produits' },
  'VenteService':                 { parser: parsers.venteService,       table: 'vente_services' },
  'Liste_des_AchatsCarburants':   { parser: parsers.achatCarburants,    table: 'achat_carburants' },
  'Détails_des_achatsCarburants': { parser: parsers.detailAchat,        table: 'detail_achat_carburants' },
  'Liste_des_Achats':             { parser: parsers.achatProduits,      table: 'achat_produits' },
  'MargeVenteCar':                { parser: parsers.margeVenteCar,      table: 'marge_carburants',  headerRow: 2 },
  'MargeVenteProduit':            { parser: parsers.margeVenteProduit,  table: 'marge_produits',    headerRow: 2 },
  'MargeVenteService':            { parser: parsers.margeVenteService,  table: 'marge_services',    headerRow: 2 },
  'Recette':                      { parser: parsers.recette,            table: 'recettes' },
  'Depense':                      { parser: parsers.depense,            table: 'depenses' },
  'Statistique':                  { parser: parsers.dailyState,         table: 'daily_state' },
  'dailystate':                   { parser: parsers.dailyState,         table: 'daily_state' },
};

// Tables with UNIQUE constraints — use upsert on re-upload
const CONFLICT_COL = {
  'vente_carburants': 'date_vente',
  'daily_state':      'date_stat',
};

exports.uploadFile = async (req, res, next) => {
  try {
    const originalName = req.file.originalname.replace(/\.(xls|xlsx)$/i, '');
    const normalizedName = originalName.normalize('NFC').replace(/\s+/g, '_').replace(/[^\x00-\x7F]/g, '');
    const match = Object.keys(FILE_MAP).sort((a, b) => b.length - a.length).find(k =>
      normalizedName.toLowerCase().includes(k.normalize('NFC').replace(/[^\x00-\x7F]/g, '').toLowerCase())
    );

    if (!match) return res.status(400).json({ error: `Unknown file: ${originalName}` });

    const { parser, table, headerRow } = FILE_MAP[match];

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });
    const sheet    = workbook.Sheets[workbook.SheetNames[0]];
    const rawData  = xlsx.utils.sheet_to_json(sheet, { defval: null, range: headerRow ?? 0 });

    const rows = parser(rawData);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let count = 0;
      const conflictCol = CONFLICT_COL[table];

      // Validate column names: only allow alphanumeric + underscore
      const SAFE_COL = /^[a-z_][a-z0-9_]*$/i;

      for (const row of rows) {
        const keys = Object.keys(row).filter(k => SAFE_COL.test(k));
        if (keys.length === 0) continue;
        const vals   = keys.map(k => row[k]);
        const params = keys.map((_, i) => `$${i + 1}`).join(', ');
        let sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${params})`;

        if (conflictCol) {
          const updateCols = keys
            .filter(k => k !== conflictCol)
            .map(k => `${k}=EXCLUDED.${k}`)
            .join(', ');
          sql += ` ON CONFLICT (${conflictCol}) DO UPDATE SET ${updateCols}`;
        }

        await client.query(sql, vals);
        count++;
      }

      await client.query(
        `INSERT INTO upload_log (filename, table_target, rows_inserted) VALUES ($1, $2, $3)`,
        [req.file.originalname, table, count]
      );
      await client.query('COMMIT');
      res.json({ success: true, table, rows: count });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

exports.getUploadLog = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM upload_log ORDER BY uploaded_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
