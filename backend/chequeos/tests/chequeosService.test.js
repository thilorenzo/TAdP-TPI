const { calcularResultadoChequeo } = require('../src/services/chequeos.service');

describe('calcularResultadoChequeo', () => {
  test('marca SEGURO con total >= 80 y sin puntajes < 5', () => {
    const puntos = Array(8).fill({ stepId: 1, puntaje: 10 });
    const { total, resultado } = calcularResultadoChequeo(puntos);

    expect(total).toBe(80);
    expect(resultado).toBe('SEGURO');
  });

  test('marca RECHEQUEAR si total < 40', () => {
    const puntos = [
      { stepId: 1, puntaje: 3 },
      { stepId: 2, puntaje: 3 },
      { stepId: 3, puntaje: 3 },
      { stepId: 4, puntaje: 5 },
      { stepId: 5, puntaje: 5 },
      { stepId: 6, puntaje: 5 },
      { stepId: 7, puntaje: 5 },
      { stepId: 8, puntaje: 5 }
    ];
    const { resultado } = calcularResultadoChequeo(puntos);
    expect(resultado).toBe('RECHEQUEAR');
  });

  test('marca RECHEQUEAR si algún puntaje es < 5 aunque total sea alto', () => {
    const puntos = [
      { stepId: 1, puntaje: 10 },
      { stepId: 2, puntaje: 10 },
      { stepId: 3, puntaje: 10 },
      { stepId: 4, puntaje: 10 },
      { stepId: 5, puntaje: 10 },
      { stepId: 6, puntaje: 10 },
      { stepId: 7, puntaje: 10 },
      { stepId: 8, puntaje: 4 }
    ];
    const { resultado } = calcularResultadoChequeo(puntos);
    expect(resultado).toBe('RECHEQUEAR');
  });

  test('lanza error si no hay 8 puntos', () => {
    const puntos = [{ stepId: 1, puntaje: 10 }];
    expect(() => calcularResultadoChequeo(puntos)).toThrow();
  });
});