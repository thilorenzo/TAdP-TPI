const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Ejecutando seed de turnos...');

  const vehiculos = [
    { patente: 'AAA111', marca: 'Ford', modelo: 'Fiesta', anio: 2014 },
    { patente: 'BBB222', marca: 'Chevrolet', modelo: 'Onix', anio: 2018 },
    { patente: 'CCC333', marca: 'Volkswagen', modelo: 'Gol', anio: 2016 }
  ];

  for (const v of vehiculos) {
    await prisma.vehiculo.upsert({
      where: { patente: v.patente },
      update: {},
      create: v
    });
  }

  const turnoData = [
    {
      patente: 'AAA111',
      fechaHora: new Date(Date.now() + 86400000).toISOString(),
      estado: 'PENDIENTE'
    },
    {
      patente: 'BBB222',
      fechaHora: new Date(Date.now() + 2 * 86400000).toISOString(),
      estado: 'PENDIENTE'
    }
  ];

  for (const t of turnoData) {
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { patente: t.patente }
    });

    await prisma.turno.create({
      data: {
        vehiculoId: vehiculo.id,
        fechaHora: t.fechaHora,
        estado: t.estado
      }
    });
  }

  console.log('Seed de turnos ejecutado correctamente ✔️');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
