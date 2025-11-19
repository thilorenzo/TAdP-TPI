import React from 'react';

function NavBar({ currentView, onChangeView }) {
  return (
    <div className="navbar">
      <button
        className={`nav-button ${currentView === 'crearTurno' ? 'active' : ''}`}
        onClick={() => onChangeView('crearTurno')}
      >
        Solicitar turno
      </button>
      <button
        className={`nav-button ${currentView === 'turnosPendientes' ? 'active' : ''}`}
        onClick={() => onChangeView('turnosPendientes')}
      >
        Ver turnos
      </button>
      <button
        className={`nav-button ${currentView === 'crearChequeo' ? 'active' : ''}`}
        onClick={() => onChangeView('crearChequeo')}
      >
        Registrar chequeo
      </button>
    </div>
  );
}

export default NavBar;
