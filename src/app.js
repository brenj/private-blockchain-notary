const express = require('express');

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(require('./controllers'));

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
