function calcularResultadoChequeo(puntos) {
  if (!Array.isArray(puntos)) {
    throw new Error('El arreglo de puntos es obligatorio');
  }

  if (puntos.length !== 8) {
    throw new Error('Deben enviarse exactamente 8 puntos de chequeo');
  }

  const puntajes = puntos.map((p) => {
    if (typeof p.puntaje !== 'number') {
      throw new Error('Cada punto debe tener un puntaje numérico');
    }
    if (p.puntaje < 1 || p.puntaje > 10) {
      throw new Error('Cada puntaje debe estar entre 1 y 10');
    }
    return p.puntaje;
  });

  const total = puntajes.reduce((acc, val) => acc + val, 0);
  const algunMenor5 = puntajes.some((p) => p < 5);

  let resultado;
  if (total >= 80 && !algunMenor5) {
    resultado = 'SEGURO';
  } else {
    resultado = 'RECHEQUEAR';
  }

  return { total, resultado };
}

module.exports = { calcularResultadoChequeo };