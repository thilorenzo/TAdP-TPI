const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/services/turnos.service', () => ({
  crearTurno: jest.fn(async (patente, fechaHora) => ({
    id: 1,
    vehiculoId: 10,
    vehiculo: { id: 10, patente },
    fechaHora,
    estado: 'PENDIENTE'
  })),
  obtenerTurnosPendientes: jest.fn(async () => []),
  obtenerTurnoPorId: jest.fn(async (id) =>
    id === '1'
      ? {
          id: 1,
          vehiculoId: 10,
          vehiculo: { id: 10, patente: 'AAA111' },
          fechaHora: '2025-11-20T10:00:00Z',
          estado: 'PENDIENTE'
        }
      : null
  ),
  confirmarTurno: jest.fn(async (id) => ({
    id: Number(id),
    vehiculoId: 10,
    vehiculo: { id: 10, patente: 'AAA111' },
    fechaHora: '2025-11-20T10:00:00Z',
    estado: 'CONFIRMADO'
  }))
}));

const turnosService = require('../src/services/turnos.service');

describe('API /api/turnos', () => {
  test('POST /api/turnos crea un turno', async () => {
    const res = await request(app)
      .post('/api/turnos')
      .send({ patente: 'ABC123', fechaHora: '2025-11-20T10:00:00Z' });

    expect(res.statusCode).toBe(201);
    expect(turnosService.crearTurno).toHaveBeenCalled();
    expect(res.body.estado).toBe('PENDIENTE');
  });

  test('GET /api/turnos/pendientes devuelve lista', async () => {
    const res = await request(app).get('/api/turnos/pendientes');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /api/turnos/:id devuelve 404 si no existe', async () => {
    const res = await request(app).get('/api/turnos/999');
    expect(res.statusCode).toBe(404);
  });

  test('POST /api/turnos/:id/confirmar confirma turno existente', async () => {
    const res = await request(app).post('/api/turnos/1/confirmar');
    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('CONFIRMADO');
  });
});
