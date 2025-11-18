jest.mock('../src/prismaClient', () => ({
  vehiculo: {
    findUnique: jest.fn(),
    create: jest.fn()
  },
  turno: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  }
}));

const prisma = require('../src/prismaClient');
const {
  crearTurno,
  obtenerTurnosPendientes
} = require('../src/services/turnos.service');

describe('TurnosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('crearTurno crea vehículo si no existe y luego el turno', async () => {
    prisma.vehiculo.findUnique.mockResolvedValue(null);
    prisma.vehiculo.create.mockResolvedValue({ id: 10, patente: 'ABC123' });
    prisma.turno.create.mockResolvedValue({
      id: 1,
      vehiculoId: 10,
      fechaHora: new Date('2025-11-20T10:00:00Z'),
      estado: 'PENDIENTE',
      vehiculo: { id: 10, patente: 'ABC123' }
    });

    const turno = await crearTurno('ABC123', '2025-11-20T10:00:00Z');

    expect(prisma.vehiculo.findUnique).toHaveBeenCalledWith({
      where: { patente: 'ABC123' }
    });
    expect(prisma.vehiculo.create).toHaveBeenCalled();
    expect(prisma.turno.create).toHaveBeenCalled();
    expect(turno.estado).toBe('PENDIENTE');
  });

  test('obtenerTurnosPendientes llama a prisma.turno.findMany', async () => {
    prisma.turno.findMany.mockResolvedValue([]);
    const turnos = await obtenerTurnosPendientes();
    expect(Array.isArray(turnos)).toBe(true);
    expect(prisma.turno.findMany).toHaveBeenCalled();
  });
});
