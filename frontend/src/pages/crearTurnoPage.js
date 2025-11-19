import React, { useState, useEffect } from 'react';
import { crearTurno, obtenerTurnos } from '../services/api';

const HORAS_DISPONIBLES = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function CrearTurnoPage() {
  const [patente, setPatente] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [creado, setCreado] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function cargar() {
      if (!fecha) {
        setHorasOcupadas([]);
        return;
      }
      try {
        const turnos = await obtenerTurnos({ fecha });
        const ocupadas = turnos
          .filter((t) => t.estado !== 'CANCELADO')
          .map((t) => new Date(t.fechaHora).getHours());
        setHorasOcupadas(ocupadas);
      } catch (e) {
        console.error(e);
      }
    }
    cargar();
  }, [fecha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setCreado(null);

    if (!patente || !fecha || !hora) {
      setError('Debe ingresar patente, fecha y hora');
      return;
    }

    try {
      const horaStr = String(hora).padStart(2, '0');
      const fechaHoraISO = new Date(`${fecha}T${horaStr}:00:00`).toISOString();

      const turno = await crearTurno(
        patente.toUpperCase(),
        fechaHoraISO,
        modelo || null,
        marca || null,
        anio || null
      );

      setCreado(turno);
      setMensaje('Turno creado correctamente');
      setPatente('');
      setMarca('');
      setModelo('');
      setAnio('');
      setFecha('');
      setHora('');
      setHorasOcupadas([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const horasDisponibles = HORAS_DISPONIBLES.filter(
    (h) => !horasOcupadas.includes(h)
  );

  return (
    <div className="card">
      <h2 className="card-title">Solicitar turno de revisión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Patente</label>
          <input
            className="form-input"
            value={patente}
            onChange={(e) => setPatente(e.target.value.toUpperCase())}
            placeholder="ABC123"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Marca</label>
          <input
            className="form-input"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            placeholder="Peugeot"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Modelo</label>
          <input
            className="form-input"
            value={modelo}
            onChange={(e) => setModelo(e.target.value)}
            placeholder="208"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Año</label>
          <input
            type="number"
            className="form-input"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            placeholder="2018"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            className="form-input"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={todayStr}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Hora</label>
          <select
            className="form-select"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          >
            <option value="">Seleccionar hora</option>
            {horasDisponibles.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, '0')}:00
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="button-primary">
          Crear turno
        </button>
      </form>

      {error && <div className="message error">{error}</div>}
      {mensaje && <div className="message success">{mensaje}</div>}

      {creado && (
        <div className="card" style={{ marginTop: '12px' }}>
          <h3 className="card-title">Turno creado</h3>
          <p><strong>ID:</strong> {creado.id}</p>
          <p><strong>Patente:</strong> {creado.vehiculo?.patente}</p>
          <p><strong>Marca:</strong> {creado.vehiculo?.marca || '-'}</p>
          <p><strong>Modelo:</strong> {creado.vehiculo?.modelo || '-'}</p>
          <p><strong>Año:</strong> {creado.vehiculo?.anio || '-'}</p>
          <p><strong>Estado:</strong> {creado.estado}</p>
          <p><strong>Fecha/hora:</strong> {new Date(creado.fechaHora).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default CrearTurnoPage;
