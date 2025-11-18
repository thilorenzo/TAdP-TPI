const express = require('express');
const cors = require('cors');
const turnosRoutes = require('./routes/turnos.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/turnos', turnosRoutes);

module.exports = app;
