const TURNOS_API_URL = 'http://localhost:3001/api/turnos';
const CHEQUEOS_API_URL = 'http://localhost:3002/api/chequeos';

function buildInspectorHeaders(role, withJson) {
  const headers = {};
  if (withJson) headers['Content-Type'] = 'application/json';
  if (role === 'INSPECTOR') headers['x-role'] = 'inspector';
  return headers;
}

export async function crearTurno(patente, fechaHora, modelo, marca, anio) {
  const res = await fetch(TURNOS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patente, fechaHora, modelo, marca, anio })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear turno');
  }

  return res.json();
}

export async function obtenerTurnos({ estado, patente, fecha } = {}, role) {
  const params = new URLSearchParams();
  if (estado && estado !== 'TODOS') params.append('estado', estado);
  if (patente) params.append('patente', patente);
  if (fecha) params.append('fecha', fecha);

  const url = params.toString()
    ? `${TURNOS_API_URL}?${params.toString()}`
    : TURNOS_API_URL;

  const res = await fetch(url, {
    headers: buildInspectorHeaders(role, false)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al obtener turnos');
  }
  return res.json();
}

export async function confirmarTurno(id, role) {
  const res = await fetch(`${TURNOS_API_URL}/${id}/confirmar`, {
    method: 'POST',
    headers: buildInspectorHeaders(role, false)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al confirmar turno');
  }
  return res.json();
}

export async function cancelarTurno(id, role) {
  const res = await fetch(`${TURNOS_API_URL}/${id}/cancelar`, {
    method: 'POST',
    headers: buildInspectorHeaders(role, false)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al cancelar turno');
  }
  return res.json();
}

export async function buscarTurnoConfirmadoPorPatente(patente, role) {
  const turnos = await obtenerTurnos({ estado: 'CONFIRMADO', patente }, role);
  if (!turnos || turnos.length === 0) {
    throw new Error('No hay un turno confirmado para esa patente');
  }
  return turnos[0];
}

export async function crearChequeo(appointmentId, puntos, observacion, role) {
  const res = await fetch(CHEQUEOS_API_URL, {
    method: 'POST',
    headers: buildInspectorHeaders(role, true),
    body: JSON.stringify({ appointmentId, puntos, observacion })
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al crear chequeo');
  }

  return res.json();
}
