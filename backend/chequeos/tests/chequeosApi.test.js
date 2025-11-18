const request = require('supertest');
const app = require('../src/app');

jest.mock('../src/prismaClient', () => ({
  chequeo: {
    create: jest.fn().mockResolvedValue({ id: 1 }),
    findUnique: jest.fn()
  },
  puntoChequeo: {
    createMany: jest.fn().mockResolvedValue({})
  },
  $transaction: (fn) => fn(module.exports.default)
}));

describe('POST /api/chequeos', () => {
  test('devuelve 201 cuando se crea un chequeo válido', async () => {
    const puntos = Array.from({ length: 8 }).map((_, i) => ({
      stepId: i + 1,
      puntaje: 10
    }));

    const res = await request(app)
      .post('/api/chequeos')
      .send({ appointmentId: 123, puntos });

    expect(res.statusCode).toBe(201);
  });
});
