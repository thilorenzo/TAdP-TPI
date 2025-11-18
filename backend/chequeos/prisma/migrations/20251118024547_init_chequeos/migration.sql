-- CreateEnum
CREATE TYPE "ResultadoChequeo" AS ENUM ('SEGURO', 'RECHEQUEAR');

-- CreateTable
CREATE TABLE "Chequeo" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "resultado" "ResultadoChequeo" NOT NULL,
    "observacion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chequeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuntoChequeo" (
    "id" SERIAL NOT NULL,
    "chequeoId" INTEGER NOT NULL,
    "stepId" INTEGER NOT NULL,
    "puntaje" INTEGER NOT NULL,

    CONSTRAINT "PuntoChequeo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Step" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Step_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Step_nombre_key" ON "Step"("nombre");

-- AddForeignKey
ALTER TABLE "PuntoChequeo" ADD CONSTRAINT "PuntoChequeo_chequeoId_fkey" FOREIGN KEY ("chequeoId") REFERENCES "Chequeo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuntoChequeo" ADD CONSTRAINT "PuntoChequeo_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "Step"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
