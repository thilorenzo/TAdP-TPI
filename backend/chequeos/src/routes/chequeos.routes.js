const { Router } = require('express');
const { crearChequeo, obtenerChequeoPorId } = require('../controllers/chequeos.controller');

const router = Router();

router.post('/', crearChequeo);

router.get('/:id', obtenerChequeoPorId);

module.exports = router;
