// src/services/turnos.service.js
const prisma = require('../prismaClient');

async function asegurarVehiculoPorPatente(patente) {
  let vehiculo = await prisma.vehiculo.findUnique({
    where: { patente }
  });

  if (!vehiculo) {
    vehiculo = await prisma.vehiculo.create({
      data: { patente }
    });
  }

  return vehiculo;
}

async function crearTurno(patente, fechaHoraISO) {
  const vehiculo = await asegurarVehiculoPorPatente(patente);

  const turno = await prisma.turno.create({
    data: {
      vehiculoId: vehiculo.id,
      fechaHora: new Date(fechaHoraISO),
      estado: 'PENDIENTE'
    },
    include: { vehiculo: true }
  });

  return turno;
}

async function obtenerTurnosPendientes() {
  const turnos = await prisma.turno.findMany({
    where: { estado: 'PENDIENTE' },
    orderBy: { fechaHora: 'asc' },
    include: { vehiculo: true }
  });
  return turnos;
}

async function obtenerTurnoPorId(id) {
  const turno = await prisma.turno.findUnique({
    where: { id: Number(id) },
    include: { vehiculo: true }
  });
  return turno;
}

async function confirmarTurno(id) {
  const turno = await prisma.turno.update({
    where: { id: Number(id) },
    data: { estado: 'CONFIRMADO' },
    include: { vehiculo: true }
  });
  return turno;
}

module.exports = {
  asegurarVehiculoPorPatente,
  crearTurno,
  obtenerTurnosPendientes,
  obtenerTurnoPorId,
  confirmarTurno
};
