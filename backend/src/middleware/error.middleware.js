// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) console.error(err.stack);
  else console.error(`[${new Date().toISOString()}] ${err.message}`);

  const status = err.status || 500;
  res.status(status).json({
    error: status < 500 ? err.message : 'Internal Server Error',
  });
};
