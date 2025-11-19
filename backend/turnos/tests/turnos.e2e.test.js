const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/prismaClient');

beforeAll(async () => {
  await prisma.turno.deleteMany();
  await prisma.vehiculo.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API Turnos - creación y seguridad', () => {
  test('No permite crear turno si falta patente', async () => {
    const res = await request(app)
      .post('/api/turnos')
      .send({
        fechaHora: '2030-05-10T10:00:00.000Z',
        modelo: 'Kangoo',
        marca: 'Renault',
        anio: 2018
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain('patente');
  });

  test('No permite crear turno si falta fechaHora', async () => {
    const res = await request(app)
      .post('/api/turnos')
      .send({
        patente: 'AAA111',
        modelo: 'Kangoo',
        marca: 'Renault',
        anio: 2018
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain('fecha');
  });

  test('No permite crear turno si faltan marca/modelo/año', async () => {
    const res = await request(app)
      .post('/api/turnos')
      .send({
        patente: 'BBB222',
        fechaHora: '2030-05-10T10:00:00.000Z'
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain('marca');
  });

  test('No permite crear turno en el pasado', async () => {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);

    const res = await request(app)
      .post('/api/turnos')
      .send({
        patente: 'CCC333',
        fechaHora: ayer.toISOString(),
        modelo: 'Onix',
        marca: 'Chevrolet',
        anio: 2020
      });

    expect(res.status).toBe(400);
    expect(res.body.message.toLowerCase()).toContain('pasado');
  });

  test('Crea turno válido correctamente', async () => {
    const res = await request(app)
      .post('/api/turnos')
      .send({
        patente: 'DDD444',
        fechaHora: '2030-05-10T10:00:00.000Z',
        modelo: 'Fiesta',
        marca: 'Ford',
        anio: 2014
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.estado).toBe('PENDIENTE');
  });

  test('No permite dos turnos pendientes para el mismo vehículo', async () => {
    const fecha1 = '2030-05-11T10:00:00.000Z';
    const fecha2 = '2030-05-12T11:00:00.000Z';

    const res1 = await request(app)
      .post('/api/turnos')
      .send({
        patente: 'EEE555',
        fechaHora: fecha1,
        modelo: 'Focus',
        marca: 'Ford',
        anio: 2017
      });

    expect(res1.status).toBe(201);

    const res2 = await request(app)
      .post('/api/turnos')
      .send({
        patente: 'EEE555',
        fechaHora: fecha2,
        modelo: 'Focus',
        marca: 'Ford',
        anio: 2017
      });

    expect(res2.status).toBe(400);
    expect(res2.body.message.toLowerCase()).toContain('turno pendiente');
  });

  test('No permite turno en un horario ya ocupado', async () => {
    const fecha = '2030-05-15T10:00:00.000Z';

    const res1 = await request(app)
      .post('/api/turnos')
      .send({
        patente: 'FFF666',
        fechaHora: fecha,
        modelo: 'Uno',
        marca: 'Fiat',
        anio: 2012
      });

    expect(res1.status).toBe(201);

    const res2 = await request(app)
      .post('/api/turnos')
      .send({
        patente: 'GGG777',
        fechaHora: fecha,
        modelo: 'Corsa',
        marca: 'Chevrolet',
        anio: 2010
      });

    expect(res2.status).toBe(400);
    expect(res2.body.message.toLowerCase()).toContain('horario');
  });

  test('GET /api/turnos sin x-role devuelve 403', async () => {
    const res = await request(app).get('/api/turnos');
    expect(res.status).toBe(403);
    expect(res.body.message.toLowerCase()).toContain('acceso');
  });

  test('GET /api/turnos con x-role: inspector devuelve 200', async () => {
    const res = await request(app)
      .get('/api/turnos')
      .set('x-role', 'inspector');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
