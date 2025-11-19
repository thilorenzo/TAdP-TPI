import React, { useEffect, useState } from 'react';
import { obtenerTurnos, confirmarTurno, cancelarTurno } from '../services/api';

const ESTADOS_FILTRO = ['TODOS', 'PENDIENTE', 'CONFIRMADO', 'CANCELADO', 'COMPLETADO', 'RECHEQUEAR'];

function TurnosPendientesPage({ onGoToCrearTurno }) {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [sortField, setSortField] = useState('fechaHora');
  const [sortDirection, setSortDirection] = useState('asc');

  const cargarTurnos = async () => {
    setLoading(true);
    setError(null);
    setMensaje(null);
    try {
      const data = await obtenerTurnos();
      setTurnos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTurnos();
  }, []);

  const handleConfirmar = async (id) => {
    setError(null);
    setMensaje(null);
    try {
      await confirmarTurno(id);
      setMensaje(`Turno ${id} confirmado`);
      await cargarTurnos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelar = async (id) => {
    setError(null);
    setMensaje(null);
    try {
      await cancelarTurno(id);
      setMensaje(`Turno ${id} cancelado`);
      await cargarTurnos();
    } catch (err) {
      setError(err.message);
    }
  };

  const existeTurnoFuturoParaVehiculo = (turnoBase) => {
    const ahora = new Date();
    return turnos.some((t) => {
      if (!t.vehiculo || !turnoBase.vehiculo) return false;
      const mismaPatente = t.vehiculo.patente === turnoBase.vehiculo.patente;
      const fechaTurno = new Date(t.fechaHora);
      const futuro = fechaTurno > ahora;
      const activo = t.estado !== 'CANCELADO';
      return t.id !== turnoBase.id && mismaPatente && futuro && activo;
    });
  };

  const turnosFiltradosPorEstado =
    estadoFiltro === 'TODOS'
      ? turnos
      : turnos.filter((t) => t.estado === estadoFiltro);

  const turnosFiltrados = turnosFiltradosPorEstado.filter((t) => {
    const texto = [
      t.id,
      t.vehiculo?.patente,
      t.vehiculo?.marca,
      t.vehiculo?.modelo,
      t.estado
    ]
      .join(' ')
      .toLowerCase();
    return texto.includes(busqueda.toLowerCase());
  });

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortValue = (t, field) => {
    if (field === 'id') return t.id || 0;
    if (field === 'patente') return (t.vehiculo?.patente || '').toLowerCase();
    if (field === 'vehiculo') {
      const texto = `${t.vehiculo?.marca || ''} ${t.vehiculo?.modelo || ''} ${t.vehiculo?.anio || ''}`;
      return texto.toLowerCase().trim();
    }
    if (field === 'fechaHora') return new Date(t.fechaHora).getTime();
    if (field === 'estado') return (t.estado || '').toLowerCase();
    if (field === 'puntaje') {
      if (typeof t.puntajeTotal === 'number') return t.puntajeTotal;
      return -1;
    }
    return 0;
  };

  const turnosOrdenados = [...turnosFiltrados].sort((a, b) => {
    const aVal = getSortValue(a, sortField);
    const bVal = getSortValue(b, sortField);

    let comp = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comp = aVal.localeCompare(bVal);
    } else {
      comp = aVal === bVal ? 0 : aVal < bVal ? -1 : 1;
    }

    return sortDirection === 'asc' ? comp : -comp;
  });

  const renderSortArrow = (field) => {
    if (field !== sortField) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  return (
    <div className="card">
      <h2 className="card-title">Turnos</h2>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ maxWidth: 260 }}>
          <label className="form-label">Filtrar por estado</label>
          <select
            className="form-select"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            {ESTADOS_FILTRO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ maxWidth: 260 }}>
          <label className="form-label">Buscar</label>
          <input
            className="form-input"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Patente, vehículo, estado..."
          />
        </div>
      </div>

      {loading && <div className="message">Cargando turnos...</div>}
      {error && <div className="message error">{error}</div>}
      {mensaje && <div className="message success">{mensaje}</div>}

      {!loading && turnosOrdenados.length === 0 && (
        <div className="message">No hay turnos para el filtro seleccionado.</div>
      )}

      {!loading && turnosOrdenados.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                ID{renderSortArrow('id')}
              </th>
              <th onClick={() => handleSort('patente')} style={{ cursor: 'pointer' }}>
                Patente{renderSortArrow('patente')}
              </th>
              <th onClick={() => handleSort('vehiculo')} style={{ cursor: 'pointer' }}>
                Vehículo{renderSortArrow('vehiculo')}
              </th>
              <th onClick={() => handleSort('fechaHora')} style={{ cursor: 'pointer' }}>
                Fecha y hora{renderSortArrow('fechaHora')}
              </th>
              <th onClick={() => handleSort('estado')} style={{ cursor: 'pointer' }}>
                Estado{renderSortArrow('estado')}
              </th>
              <th onClick={() => handleSort('puntaje')} style={{ cursor: 'pointer' }}>
                Puntaje{renderSortArrow('puntaje')}
              </th>
              <th>
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {turnosOrdenados.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.vehiculo?.patente}</td>
                <td>
                  {t.vehiculo?.marca} {t.vehiculo?.modelo} ({t.vehiculo?.anio || 'N/D'})
                </td>
                <td>{new Date(t.fechaHora).toLocaleString()}</td>
                <td>
                  <span className={`status-pill status-${t.estado.toLowerCase()}`}>
                    {t.estado}
                  </span>
                </td>
                <td>
                  {t.estado === 'COMPLETADO' || t.estado === 'RECHEQUEAR'
                    ? (t.puntajeTotal ?? '-')
                    : '-'}
                </td>
                <td>
                  {t.estado === 'PENDIENTE' && (
                    <>
                      <button
                        className="button-secondary"
                        onClick={() => handleConfirmar(t.id)}
                        style={{ marginRight: '6px' }}
                      >
                        Confirmar
                      </button>
                      <button
                        className="button-secondary"
                        onClick={() => handleCancelar(t.id)}
                      >
                        Cancelar
                      </button>
                    </>
                  )}

                  {t.estado === 'RECHEQUEAR' &&
                    onGoToCrearTurno &&
                    !existeTurnoFuturoParaVehiculo(t) && (
                      <button
                        className="button-secondary"
                        onClick={onGoToCrearTurno}
                      >
                        Nuevo turno
                      </button>
                    )}

                  {t.estado !== 'PENDIENTE' &&
                    !(t.estado === 'RECHEQUEAR' && !existeTurnoFuturoParaVehiculo(t)) &&
                    <span>-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TurnosPendientesPage;
