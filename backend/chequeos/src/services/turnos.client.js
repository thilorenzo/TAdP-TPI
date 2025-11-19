require('dotenv').config();

const TURNOS_SERVICE_URL = process.env.TURNOS_SERVICE_URL || 'http://localhost:3001';

async function obtenerTurnoPorIdDesdeTurnos(appointmentId) {
  const url = `${TURNOS_SERVICE_URL}/api/turnos/${appointmentId}`;

  try {
    const res = await fetch(url, {
      headers: {
        'x-role': 'inspector'
      }
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error llamando al servicio de turnos:', err.message);
    return null;
  }
}

async function marcarTurnoComoCompletado(appointmentId, puntajeTotal, resultado) {
  const url = `${TURNOS_SERVICE_URL}/api/turnos/${appointmentId}/completar`;

  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-role': 'inspector'
      },
      body: JSON.stringify({ puntajeTotal, resultado })
    });
  } catch (err) {
    console.error('Error llamando a completar turno:', err.message);
  }
}

module.exports = {
  obtenerTurnoPorIdDesdeTurnos,
  marcarTurnoComoCompletado
};
