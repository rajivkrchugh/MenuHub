require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info(`MenuChat API running on port ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
})();
