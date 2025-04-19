import app from './config/appConfig';
import http, { get } from 'http';
import { port } from './config/config';
import dbConnection from "./config/postgresdb";
import logger from './utils/logger';

logger.debug('This is a debug log');
logger.info('This is an info log');
logger.warn('This is a warning log');
logger.error('This is an error log');

console.log('Starting Device Service...');
const db = dbConnection;
db.connect().then(() => {
  logger.info('Database connected');
  const server = http.createServer(app);
  server.listen(port, () => {
    logger.info(`API started at http://localhost:${port}`);
  });
}).catch((error) => {
  console.log('Database connection error:', error);
  logger.error('Database connection error:', error);
});