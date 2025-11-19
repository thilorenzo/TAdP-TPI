-- DropForeignKey
ALTER TABLE "PuntoChequeo" DROP CONSTRAINT "PuntoChequeo_chequeoId_fkey";

-- AddForeignKey
ALTER TABLE "PuntoChequeo" ADD CONSTRAINT "PuntoChequeo_chequeoId_fkey" FOREIGN KEY ("chequeoId") REFERENCES "Chequeo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
