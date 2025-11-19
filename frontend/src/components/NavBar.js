import React from 'react';

function NavBar({ currentView, onChangeView, role }) {
  const isInspector = role === 'INSPECTOR';

  return (
    <nav className="navbar">
      <button
        className={currentView === 'crearTurno' ? 'nav-button active' : 'nav-button'}
        onClick={() => onChangeView('crearTurno')}
      >
        Solicitar turno
      </button>
      {isInspector && (
        <>
          <button
            className={currentView === 'turnosPendientes' ? 'nav-button active' : 'nav-button'}
            onClick={() => onChangeView('turnosPendientes')}
          >
            Ver turnos
          </button>
          <button
            className={currentView === 'crearChequeo' ? 'nav-button active' : 'nav-button'}
            onClick={() => onChangeView('crearChequeo')}
          >
            Registrar chequeo
          </button>
        </>
      )}
    </nav>
  );
}

export default NavBar;
