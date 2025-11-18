const prisma = require('../prismaClient');
const { calcularResultadoChequeo } = require('../services/chequeos.service');

async function crearChequeo(req, res) {
  try {
    const { appointmentId, puntos, observacion } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ message: 'appointmentId es obligatorio' });
    }

    const { total, resultado } = calcularResultadoChequeo(puntos);

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
            include: {
              step: true
            }
          }
        }
      });

      return chequeoConPuntos;
    });

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