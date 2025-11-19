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

const router = Router();

router.get('/', listarTurnosController);
router.get('/pendientes', listarPendientesController);
router.get('/:id', obtenerTurnoController);

router.post('/', crearTurnoController);
router.post('/:id/confirmar', confirmarTurnoController);
router.post('/:id/completar', completarTurnoController); // 👈 nuevo
router.post('/:id/cancelar', cancelarTurnoController);

module.exports = router;
