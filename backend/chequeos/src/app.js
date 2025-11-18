const express = require('express');
const cors = require('cors');
const chequeosRoutes = require('./routes/chequeos.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/chequeos', chequeosRoutes);

module.exports = app;