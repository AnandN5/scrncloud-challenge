import bodyParser from 'body-parser';
import express, { Express, Request, Response } from 'express';
import indexRoute from '../routes/index.route';
import errorHandler from '../middlewares/error.handler';

const app = express();
const BASE_URL = "/"
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(BASE_URL, indexRoute);
app.use(errorHandler)

export default app;