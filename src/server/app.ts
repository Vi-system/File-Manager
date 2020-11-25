import morgan from 'morgan';
import express from 'express';
import dotenv from 'dotenv';
import { join, resolve } from 'path';

dotenv.config();

//Import routes
import routes from './router/index.routes';

//Declarations:
const app = express();

//Settings:
app.set('port', process.env.PORT || 3000);
app.set('files', join(__dirname, './uploads'));
app.set('temp', join(__dirname, './temp'));

//Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));

//Routes
app.use(routes);

export const filesRoot = app.get('files');
export const filesTemp = app.get('temp');
export default app;
