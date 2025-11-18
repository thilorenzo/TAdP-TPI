const { Router } = require('express');
const {
  crearTurnoController,
  listarPendientesController,
  obtenerTurnoController,
  confirmarTurnoController
} = require('../controllers/turnos.controller');

const router = Router();

// GET /api/turnos/pendientes
router.get('/pendientes', listarPendientesController);

// GET /api/turnos/:id
router.get('/:id', obtenerTurnoController);

// POST /api/turnos
router.post('/', crearTurnoController);

// POST /api/turnos/:id/confirmar
router.post('/:id/confirmar', confirmarTurnoController);

module.exports = router;
