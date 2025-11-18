const { Router } = require('express');
const { crearChequeo, obtenerChequeoPorId } = require('../controllers/chequeos.controller');

const router = Router();

// POST /api/chequeos
router.post('/', crearChequeo);

// GET /api/chequeos/:id
router.get('/:id', obtenerChequeoPorId);

module.exports = router;