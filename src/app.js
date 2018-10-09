const express = require('express');

const controllers = require('./controllers');
const middlewares = require('./middlewares');

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(controllers);
app.use(middlewares.defaultErrorHandler);

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
