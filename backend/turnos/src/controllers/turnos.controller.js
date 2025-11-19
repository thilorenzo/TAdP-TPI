const {
  crearTurno,
  obtenerTurnosPendientes,
  listarTurnos,
  obtenerTurnoPorId,
  confirmarTurno,
  completarTurno,
  cancelarTurno
} = require('../services/turnos.service');

async function crearTurnoController(req, res) {
  const { patente, fechaHora, modelo, marca, anio } = req.body;

  if (!patente || !fechaHora || !modelo || !marca || !anio) {
    return res
      .status(400)
      .json({ message: 'Patente, fechaHora, marca, modelo y año son obligatorios' });
  }

  try {
    const turno = await crearTurno(patente, fechaHora, modelo, marca, anio);
    return res.status(201).json(turno);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || 'Error al crear turno' });
  }
}

async function listarTurnosController(req, res) {
  try {
    const { estado, patente, fecha } = req.query;
    const turnos = await listarTurnos({ estado, patente, fecha });
    return res.json(turnos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al listar turnos' });
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

async function completarTurnoController(req, res) {
  try {
    const { id } = req.params;
    const { puntajeTotal, resultado } = req.body;

    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'id inválido' });
    }

    if (typeof puntajeTotal !== 'number') {
      return res.status(400).json({ message: 'puntajeTotal numérico es obligatorio' });
    }

    if (!resultado) {
      return res.status(400).json({ message: 'resultado es obligatorio' });
    }

    const existe = await obtenerTurnoPorId(id);
    if (!existe) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    const turnoActualizado = await completarTurno(id, puntajeTotal, resultado);
    return res.json(turnoActualizado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al completar turno' });
  }
}

async function cancelarTurnoController(req, res) {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return res.status(400).json({ message: 'id inválido' });
    }

    const existe = await obtenerTurnoPorId(id);
    if (!existe) {
      return res.status(404).json({ message: 'Turno no encontrado' });
    }

    const turnoActualizado = await cancelarTurno(id);
    return res.json(turnoActualizado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al cancelar turno' });
  }
}

module.exports = {
  crearTurnoController,
  listarTurnosController,
  listarPendientesController,
  obtenerTurnoController,
  confirmarTurnoController,
  completarTurnoController,
  cancelarTurnoController
};
