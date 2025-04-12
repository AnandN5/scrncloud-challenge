import app from './config/appConfig';
import http, { get } from 'http';
import { port } from './config/config';
import dbConnection from "./config/postgresdb";
import logger from './utils/logger';


console.log('Starting Inventory Service...');
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