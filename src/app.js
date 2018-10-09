const express = require('express');

const controllers = require('./controllers');
const middlewares = require('./middlewares');
const starRequestData = require('./models/starRequestData.js');

const app = express();
const PORT = 8000;
const PRUNE_REQUESTS_TIMEOUT = 900000; // 15 minutes

app.use(express.json());
app.use(controllers);
app.use(middlewares.defaultErrorHandler);

setInterval(starRequestData.pruneExpiredRequests, PRUNE_REQUESTS_TIMEOUT);

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
