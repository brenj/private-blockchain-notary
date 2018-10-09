const express = require('express');

const middlewares = require('./middlewares');

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(require('./controllers'));
app.use(middlewares.defaultErrorHandler);

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
