import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import favicon from 'express-favicon';
import livereload from 'livereload';
import connectLivereload from 'connect-livereload';

import rtIndex from './routes/rtIndex.js';
import rtApi from './routes/rtApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const liveReloadServer = livereload.createServer();
liveReloadServer.watch([
  path.join(__dirname, 'public'), 
  path.join(__dirname, 'views')
]);
app.use(connectLivereload());
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors({
  credentials: true,
  // origin: [
  //   'http://localhost:1111',
  //   'http://localhost:2221',
  //   'http://localhost:2224',
  //   'http://localhost:2225',
  //   'http://localhost:2251',
  //   'http://localhost:2261',
  //   'http://localhost:2226',
  //   'http://localhost:5551',
  //   'http://localhost:5555',
  //   'http://localhost',
  // ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  maxAge: 7200,
}));
app.use(express.json({ limit: '100MB' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use('/api', rtApi);
app.use('/',rtIndex)

export default app;