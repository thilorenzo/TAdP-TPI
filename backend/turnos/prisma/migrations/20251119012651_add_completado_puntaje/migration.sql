-- AlterEnum
ALTER TYPE "EstadoTurno" ADD VALUE 'COMPLETADO';

-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "puntajeTotal" INTEGER;
