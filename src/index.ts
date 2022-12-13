import dotenv from 'dotenv';

import express from 'express';
import routes from './routes';

dotenv.config();

const {
  APP_PORT = 3000
} = <any>process.env;

const app = express();

app.use(express.json());
app.use('/', routes);

app.listen(APP_PORT, () => {
  console.log('Server started on port ' + APP_PORT);
});