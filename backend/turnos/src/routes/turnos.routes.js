const { Router } = require('express');
const {
  crearTurnoController,
  listarTurnosController,
  listarPendientesController,
  obtenerTurnoController,
  confirmarTurnoController,
  completarTurnoController,
  cancelarTurnoController
} = require('../controllers/turnos.controller');
const { requireInspector } = require('../middlewares/role.middleware');

const router = Router();

router.get('/', requireInspector, listarTurnosController);
router.get('/pendientes', requireInspector, listarPendientesController);
router.get('/:id', requireInspector, obtenerTurnoController);

router.post('/', crearTurnoController);
router.post('/:id/confirmar', requireInspector, confirmarTurnoController);
router.post('/:id/completar', requireInspector, completarTurnoController);
router.post('/:id/cancelar', requireInspector, cancelarTurnoController);

module.exports = router;
