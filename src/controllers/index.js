const express = require('express');

const router = express.Router();

router.use(require('./routes.js'));
router.use('/stars', require('./stars.js'));

module.exports = router;
