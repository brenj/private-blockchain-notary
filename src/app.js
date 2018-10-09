const express = require('express');

const config = require('../config.js');
const controllers = require('./controllers');
const middlewares = require('./middlewares');
const starRequestData = require('./models/starRequestData.js');

const app = express();

app.use(express.json());
app.use(controllers);
app.use(middlewares.defaultErrorHandler);

setInterval(
  starRequestData.pruneExpiredRequests, config.PRUNE_REQUESTS_TIMEOUT);

app.listen(
  config.PORT, () => console.log(`App listening on port ${config.PORT}`));
