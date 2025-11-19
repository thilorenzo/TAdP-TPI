const prisma = require('../prismaClient');

async function asegurarVehiculoPorPatente(patente, modelo, marca, anio) {
  let vehiculo = await prisma.vehiculo.findUnique({
    where: { patente }
  });

  if (!vehiculo) {
    vehiculo = await prisma.vehiculo.create({
      data: {
        patente,
        modelo: modelo || null,
        marca: marca || null,
        anio: typeof anio === 'number' ? anio : null
      }
    });
  } else {
    const dataUpdate = {};
    if (modelo && !vehiculo.modelo) dataUpdate.modelo = modelo;
    if (marca && !vehiculo.marca) dataUpdate.marca = marca;
    if (typeof anio === 'number' && !vehiculo.anio) dataUpdate.anio = anio;

    if (Object.keys(dataUpdate).length > 0) {
      vehiculo = await prisma.vehiculo.update({
        where: { id: vehiculo.id },
        data: dataUpdate
      });
    }
  }

  return vehiculo;
}

async function crearTurno(patente, fechaHoraISO, modelo, marca, anio) {
  const fecha = new Date(fechaHoraISO);
  if (isNaN(fecha.getTime())) {
    throw new Error('Fecha/hora inválida');
  }

  const ahora = new Date();
  if (fecha < ahora) {
    throw new Error('No se pueden sacar turnos en una fecha u horario pasado');
  }

  const anioNumero = anio ? Number(anio) : null;
  if (anio && isNaN(anioNumero)) {
    throw new Error('Año inválido');
  }

  const vehiculo = await asegurarVehiculoPorPatente(patente, modelo, marca, anioNumero);

  const turnoPendiente = await prisma.turno.findFirst({
    where: {
      vehiculoId: vehiculo.id,
      estado: 'PENDIENTE'
    }
  });

  if (turnoPendiente) {
    throw new Error('El vehículo ya tiene un turno pendiente');
  }

  const turnoMismoHorario = await prisma.turno.findFirst({
    where: {
      fechaHora: fecha,
      estado: {
        not: 'CANCELADO'
      }
    }
  });

  if (turnoMismoHorario) {
    throw new Error('Ya existe un turno asignado en ese horario');
  }

  const turno = await prisma.turno.create({
    data: {
      vehiculoId: vehiculo.id,
      fechaHora: fecha,
      estado: 'PENDIENTE'
    },
    include: { vehiculo: true }
  });

  return turno;
}

async function obtenerTurnosPendientes() {
  const turnos = await prisma.turno.findMany({
    where: { estado: 'PENDIENTE' },
    include: { vehiculo: true },
    orderBy: { fechaHora: 'asc' }
  });
  return turnos;
}

async function listarTurnos({ estado, patente, fecha }) {
  const where = {};

  if (estado && estado !== 'TODOS') {
    where.estado = estado;
  }

  if (patente) {
    where.vehiculo = { patente };
  }

  if (fecha) {
    const inicio = new Date(`${fecha}T00:00:00`);
    const fin = new Date(`${fecha}T23:59:59.999`);
    where.fechaHora = {
      gte: inicio,
      lt: fin
    };
  }

  const turnos = await prisma.turno.findMany({
    where,
    include: { vehiculo: true },
    orderBy: { fechaHora: 'asc' }
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

async function completarTurno(id, puntajeTotal, resultado) {
  const esRechequeo =
    typeof resultado === 'string' &&
    resultado.toUpperCase().includes('RECHEQ');

  const nuevoEstado = esRechequeo ? 'RECHEQUEAR' : 'COMPLETADO';

  const turno = await prisma.turno.update({
    where: { id: Number(id) },
    data: {
      estado: nuevoEstado,
      puntajeTotal
    },
    include: { vehiculo: true }
  });
  return turno;
}

async function cancelarTurno(id) {
  const turno = await prisma.turno.update({
    where: { id: Number(id) },
    data: { estado: 'CANCELADO' },
    include: { vehiculo: true }
  });
  return turno;
}

module.exports = {
  asegurarVehiculoPorPatente,
  crearTurno,
  obtenerTurnosPendientes,
  listarTurnos,
  obtenerTurnoPorId,
  confirmarTurno,
  completarTurno,
  cancelarTurno
};
