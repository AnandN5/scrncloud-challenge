import express from 'express';
import bodyParser from 'body-parser';
import { Request, Response } from 'express';
import indexRoute from '../routes/index.route';
import errorHandler from '../middlewares/error.handler';

const app = express();
const BASE_URL = '/';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(BASE_URL, indexRoute);
app.use(errorHandler);

app.get('/', async (req: Request, res: Response) => {
    res.status(200).json({
        message: 'Nothing to see here, go to /fulfillments',
    });
});

export default app;
