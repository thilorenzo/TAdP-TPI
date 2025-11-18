const {
  crearTurno,
  obtenerTurnosPendientes,
  obtenerTurnoPorId,
  confirmarTurno
} = require('../services/turnos.service');

async function crearTurnoController(req, res) {
  try {
    const { patente, fechaHora } = req.body;

    if (!patente || !fechaHora) {
      return res.status(400).json({ message: 'patente y fechaHora son obligatorios' });
    }

    const turno = await crearTurno(patente, fechaHora);
    return res.status(201).json(turno);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al crear turno' });
  }
}

async function listarPendientesController(_req, res) {
  try {
    const turnos = await obtenerTurnosPendientes();
    return res.json(turnos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al listar turnos pendientes' });
  }
}

async function obtenerTurnoController(req, res) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'id inválido' });
    }

    const turno = await obtenerTurnoPorId(id);
    if (!turno) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }
    return res.json(turno);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener turno' });
  }
}

async function confirmarTurnoController(req, res) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'id inválido' });
    }

    const existe = await obtenerTurnoPorId(id);
    if (!existe) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    const turnoActualizado = await confirmarTurno(id);
    return res.json(turnoActualizado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al confirmar turno' });
  }
}

module.exports = {
  crearTurnoController,
  listarPendientesController,
  obtenerTurnoController,
  confirmarTurnoController
};
