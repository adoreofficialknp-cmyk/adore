const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);

  if (err.name === 'ValidationError' || err.name === 'ZodError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with this value already exists' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error'
  });
};

const notFound = (req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
};

module.exports = { errorHandler, notFound };
