const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');

jest.mock('../src/services/turnos.client', () => ({
  obtenerTurnoPorIdDesdeTurnos: jest.fn().mockResolvedValue({
    id: 123,
    vehiculo: { patente: 'AAA111' },
    estado: 'CONFIRMADO',
    fechaHora: '2030-05-10T10:00:00.000Z'
  }),
  marcarTurnoComoCompletado: jest.fn().mockResolvedValue(null)
}));

beforeAll(async () => {
  await prisma.chequeo.deleteMany();
});

afterAll(async () => {
  jest.resetAllMocks();
  await prisma.$disconnect();
});

describe('API Chequeos - validaciones de negocio y roles', () => {
  test('POST /api/chequeos sin x-role devuelve 403', async () => {
    const res = await request(app)
      .post('/api/chequeos')
      .send({
        appointmentId: 123,
        puntos: [],
        observacion: ''
      });

    expect(res.status).toBe(403);
    expect(res.body.message.toLowerCase()).toContain('acceso');
  });

  test('Con rol inspector y puntajes válidos devuelve 201', async () => {
    const res = await request(app)
      .post('/api/chequeos')
      .set('x-role', 'inspector')
      .send({
        appointmentId: 123,
        puntos: [
          { stepId: 1, puntaje: 10 },
          { stepId: 2, puntaje: 10 },
          { stepId: 3, puntaje: 10 },
          { stepId: 4, puntaje: 10 },
          { stepId: 5, puntaje: 10 },
          { stepId: 6, puntaje: 10 },
          { stepId: 7, puntaje: 10 },
          { stepId: 8, puntaje: 10 }
        ],
        observacion: ''
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.total).toBe(80);
  });

  test('Puntaje fuera de 1-10 devuelve 400', async () => {
    const res = await request(app)
      .post('/api/chequeos')
      .set('x-role', 'inspector')
      .send({
        appointmentId: 123,
        puntos: [
          { stepId: 1, puntaje: 0 },
          { stepId: 2, puntaje: 10 },
          { stepId: 3, puntaje: 10 },
          { stepId: 4, puntaje: 10 },
          { stepId: 5, puntaje: 10 },
          { stepId: 6, puntaje: 10 },
          { stepId: 7, puntaje: 10 },
          { stepId: 8, puntaje: 10 }
        ],
        observacion: 'Prueba'
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain('puntaje');
  });

  test('Total < 40 y sin observación devuelve 400', async () => {
    const res = await request(app)
      .post('/api/chequeos')
      .set('x-role', 'inspector')
      .send({
        appointmentId: 123,
        puntos: [
          { stepId: 1, puntaje: 4 },
          { stepId: 2, puntaje: 4 },
          { stepId: 3, puntaje: 4 },
          { stepId: 4, puntaje: 4 },
          { stepId: 5, puntaje: 4 },
          { stepId: 6, puntaje: 4 },
          { stepId: 7, puntaje: 4 },
          { stepId: 8, puntaje: 4 }
        ],
        observacion: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain('observación es obligatoria'.toLowerCase());
  });

  test('Total < 40 con observación devuelve 201', async () => {
    const res = await request(app)
      .post('/api/chequeos')
      .set('x-role', 'inspector')
      .send({
        appointmentId: 123,
        puntos: [
          { stepId: 1, puntaje: 4 },
          { stepId: 2, puntaje: 4 },
          { stepId: 3, puntaje: 4 },
          { stepId: 4, puntaje: 4 },
          { stepId: 5, puntaje: 4 },
          { stepId: 6, puntaje: 4 },
          { stepId: 7, puntaje: 4 },
          { stepId: 8, puntaje: 4 }
        ],
        observacion: 'Vehículo con múltiples observaciones'
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(32);
    expect(res.body.resultado.toUpperCase()).toContain('RECHEQ');
  });

  test('Un punto < 5 y sin observación devuelve 400 aunque el total sea >= 40', async () => {
    const res = await request(app)
      .post('/api/chequeos')
      .set('x-role', 'inspector')
      .send({
        appointmentId: 123,
        puntos: [
          { stepId: 1, puntaje: 10 },
          { stepId: 2, puntaje: 10 },
          { stepId: 3, puntaje: 10 },
          { stepId: 4, puntaje: 3 },
          { stepId: 5, puntaje: 10 },
          { stepId: 6, puntaje: 10 },
          { stepId: 7, puntaje: 10 },
          { stepId: 8, puntaje: 10 }
        ],
        observacion: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain('observación es obligatoria'.toLowerCase());
  });

  test('Un punto < 5 con observación devuelve 201', async () => {
    const res = await request(app)
      .post('/api/chequeos')
      .set('x-role', 'inspector')
      .send({
        appointmentId: 123,
        puntos: [
          { stepId: 1, puntaje: 10 },
          { stepId: 2, puntaje: 10 },
          { stepId: 3, puntaje: 10 },
          { stepId: 4, puntaje: 3 },
          { stepId: 5, puntaje: 10 },
          { stepId: 6, puntaje: 10 },
          { stepId: 7, puntaje: 10 },
          { stepId: 8, puntaje: 10 }
        ],
        observacion: 'Falla en el punto 4, requiere rechequeo'
      });

    expect(res.status).toBe(201);
    expect(res.body.total).toBe(73);
    expect(res.body.resultado.toUpperCase()).toContain('RECHEQ');
  });
});
