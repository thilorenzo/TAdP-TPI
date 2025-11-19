const prisma = require('../prismaClient');
const { calcularResultadoChequeo } = require('../services/chequeos.service');
const {
  obtenerTurnoPorIdDesdeTurnos,
  marcarTurnoComoCompletado
} = require('../services/turnos.client');

async function crearChequeo(req, res) {
  try {
    const { appointmentId, puntos, observacion } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId es obligatorio' });
    }

    if (!Array.isArray(puntos) || puntos.length === 0) {
      return res.status(400).json({ message: 'Debe enviar los puntos a evaluar' });
    }

    for (const p of puntos) {
      const v = Number(p.puntaje);
      if (isNaN(v) || v < 1 || v > 10) {
        return res.status(400).json({ message: 'Cada puntaje debe estar entre 1 y 10' });
      }
    }

    const turno = await obtenerTurnoPorIdDesdeTurnos(appointmentId);

    if (!turno) {
      return res
        .status(400)
        .json({ message: 'El turno indicado no existe en el servicio de turnos' });
    }

    if (turno.estado !== 'CONFIRMADO') {
      return res
        .status(400)
        .json({ message: 'El turno debe estar CONFIRMADO para poder realizar el chequeo' });
    }

    const { total, resultado } = calcularResultadoChequeo(puntos);

    const requiereObservacion =
      total < 40 || puntos.some((p) => Number(p.puntaje) < 5);

    if (requiereObservacion && (!observacion || !observacion.trim())) {
      return res.status(400).json({
        message:
          'La observación es obligatoria cuando el total es menor a 40 o algún punto tiene puntaje menor que 5'
      });
    }

    const chequeoCreado = await prisma.$transaction(async (tx) => {
      const chequeo = await tx.chequeo.create({
        data: {
          appointmentId,
          total,
          resultado,
          observacion: observacion || null
        }
      });

      const puntosData = puntos.map((p) => ({
        chequeoId: chequeo.id,
        stepId: p.stepId,
        puntaje: p.puntaje
      }));

      await tx.puntoChequeo.createMany({
        data: puntosData
      });

      const chequeoConPuntos = await tx.chequeo.findUnique({
        where: { id: chequeo.id },
        include: {
          puntos: {
            include: { step: true }
          }
        }
      });

      return chequeoConPuntos;
    });

    marcarTurnoComoCompletado(appointmentId, total, resultado);

    return res.status(201).json(chequeoCreado);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || 'Error al crear chequeo' });
  }
}

async function obtenerChequeoPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'id inválido' });
    }

    const chequeo = await prisma.chequeo.findUnique({
      where: { id },
      include: {
        puntos: {
          include: { step: true }
        }
      }
    });

    if (!chequeo) {
      return res.status(404).json({ message: 'Chequeo no encontrado' });
    }

    return res.json(chequeo);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error al obtener chequeo' });
  }
}

module.exports = {
  crearChequeo,
  obtenerChequeoPorId
};
