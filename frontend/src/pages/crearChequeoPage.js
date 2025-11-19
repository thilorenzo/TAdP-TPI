import React, { useState, useEffect } from 'react';
import { crearChequeo, buscarTurnoConfirmadoPorPatente } from '../services/api';

const STEPS = [
  { id: 1, nombre: 'Luces' },
  { id: 2, nombre: 'Sistema de frenos' },
  { id: 3, nombre: 'Suspensión' },
  { id: 4, nombre: 'Dirección y tren delantero' },
  { id: 5, nombre: 'Neumáticos' },
  { id: 6, nombre: 'Emisiones' },
  { id: 7, nombre: 'Chasis y estructura' },
  { id: 8, nombre: 'Sistema eléctrico / electrónica' }
];

function CrearChequeoPage({ onGoToCrearTurno, role }) {
  const [patente, setPatente] = useState('');
  const [puntajes, setPuntajes] = useState({});
  const [observacion, setObservacion] = useState('');
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [turnoUsado, setTurnoUsado] = useState(null);

  useEffect(() => {
    const inicial = {};
    STEPS.forEach((s) => { inicial[s.id] = 10; });
    setPuntajes(inicial);
  }, []);

  const handleBuscarTurno = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setResultado(null);
    setTurnoUsado(null);

    if (!patente) {
      setError('Debe indicar una patente');
      return;
    }

    try {
      const turno = await buscarTurnoConfirmadoPorPatente(patente.toUpperCase(), role);
      setTurnoUsado(turno);
      setMensaje(`Turno confirmado encontrado para la patente ${patente.toUpperCase()}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePuntaje = (stepId, value) => {
    const num = Number(value);
    setPuntajes((prev) => ({
      ...prev,
      [stepId]: isNaN(num) ? '' : num
    }));
  };

  const handleRegistrarChequeo = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setResultado(null);

    if (!turnoUsado) {
      setError('Primero debe buscar y seleccionar un turno confirmado por patente');
      return;
    }

    const puntosArray = STEPS.map((s) => ({
      stepId: s.id,
      puntaje: Number(puntajes[s.id] || 0)
    }));

    try {
      const resp = await crearChequeo(turnoUsado.id, puntosArray, observacion, role);
      setMensaje('Chequeo registrado correctamente');
      setResultado(resp);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">Registrar chequeo de vehículo</h2>

      <form onSubmit={handleBuscarTurno}>
        <div className="form-group">
          <label className="form-label">Patente</label>
          <input
            className="form-input"
            value={patente}
            onChange={(e) => setPatente(e.target.value.toUpperCase())}
            placeholder="Ej: ABC123"
          />
        </div>
        <button type="submit" className="button-primary">
          Buscar turno confirmado
        </button>
      </form>

      {error && <div className="message error">{error}</div>}
      {mensaje && <div className="message success">{mensaje}</div>}

      {turnoUsado && (
        <div className="card" style={{ marginTop: '12px' }}>
          <h3 className="card-title">Turno seleccionado</h3>
          <p><strong>ID turno:</strong> {turnoUsado.id}</p>
          <p><strong>Patente:</strong> {turnoUsado.vehiculo?.patente}</p>
          <p><strong>Modelo:</strong> {turnoUsado.vehiculo?.modelo || '-'}</p>
          <p><strong>Fecha/hora:</strong> {new Date(turnoUsado.fechaHora).toLocaleString()}</p>
          <p><strong>Estado:</strong> {turnoUsado.estado}</p>
        </div>
      )}

      {turnoUsado && (
        <form onSubmit={handleRegistrarChequeo} style={{ marginTop: '12px' }}>
          <div className="form-group">
            <label className="form-label">Puntajes (1 a 10)</label>
            <table className="table">
              <thead>
                <tr>
                  <th>Punto</th>
                  <th>Puntaje</th>
                </tr>
              </thead>
              <tbody>
                {STEPS.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nombre}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        className="form-input"
                        style={{ width: '70px' }}
                        value={puntajes[s.id] ?? ''}
                        onChange={(e) => handleChangePuntaje(s.id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-group">
            <label className="form-label">Observación</label>
            <textarea
              className="form-textarea"
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Observaciones para el dueño del vehículo (si requiere rechequeo)..."
            />
          </div>

          <button type="submit" className="button-primary">
            Registrar chequeo
          </button>
        </form>
      )}

      {resultado && (
        <div className="card" style={{ marginTop: '12px' }}>
          <h3 className="card-title">Resultado del chequeo</h3>
          <p><strong>ID chequeo:</strong> {resultado.id}</p>
          <p><strong>ID turno:</strong> {resultado.appointmentId}</p>
          <p><strong>Total:</strong> {resultado.total}</p>
          <p><strong>Resultado:</strong> {resultado.resultado}</p>
          {resultado.observacion && (
            <p><strong>Observación:</strong> {resultado.observacion}</p>
          )}

          {resultado.resultado === 'RECHEQUEO' && onGoToCrearTurno && (
            <button
              type="button"
              className="button-secondary"
              style={{ marginTop: '8px' }}
              onClick={onGoToCrearTurno}
            >
              Nuevo turno
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CrearChequeoPage;
