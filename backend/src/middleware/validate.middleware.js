const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateDateRange(req, res, next) {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Query params "from" and "to" are required (YYYY-MM-DD)' });
  }
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return res.status(400).json({ error: 'Date params must be in YYYY-MM-DD format' });
  }
  if (isNaN(Date.parse(from)) || isNaN(Date.parse(to))) {
    return res.status(400).json({ error: 'Invalid date values' });
  }
  if (from > to) {
    return res.status(400).json({ error: '"from" must be before or equal to "to"' });
  }
  next();
}

module.exports = { validateDateRange };
