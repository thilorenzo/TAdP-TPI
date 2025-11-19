const { Router } = require('express');
const { crearChequeo, obtenerChequeoPorId } = require('../controllers/chequeos.controller');
const { requireInspector } = require('../middlewares/role.middleware');

const router = Router();

router.post('/', requireInspector, crearChequeo);
router.get('/:id', requireInspector, obtenerChequeoPorId);

module.exports = router;
