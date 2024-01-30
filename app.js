import 'dotenv/config';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import favicon from 'express-favicon';
import indexRouter from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use('/', indexRouter);

export default app;