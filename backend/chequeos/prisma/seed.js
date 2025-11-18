const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const steps = [
    'Luces',
    'Sistema de frenos',
    'Suspensión',
    'Dirección y tren delantero',
    'Neumáticos',
    'Emisiones',
    'Chasis y estructura',
    'Sistema eléctrico / electrónica'
  ];

  for (const nombre of steps) {
    await prisma.step.upsert({
      where: { nombre },
      update: {},
      create: { nombre }
    });
  }

  console.log('Seed ejecutado correctamente ✔️');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
