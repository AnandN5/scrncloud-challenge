import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { port } from './config/config';
import dbConnection from './config/postgresdb';
import logger from './utils/logger';
import app from './config/appConfig';

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