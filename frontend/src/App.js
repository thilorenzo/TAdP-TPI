import React, { useState } from 'react';
import NavBar from './components/NavBar';
import RoleSelector from './components/RoleSelector';
import CrearTurnoPage from './pages/crearTurnoPage';
import TurnosPendientesPage from './pages/turnosPendientesPage';
import CrearChequeoPage from './pages/crearChequeoPage';

function App() {
  const [view, setView] = useState('crearTurno');
  const [role, setRole] = useState('CLIENTE');

  const handleChangeRole = (newRole) => {
    setRole(newRole);
    if (newRole === 'CLIENTE' && view !== 'crearTurno') {
      setView('crearTurno');
    }
  };

  const renderView = () => {
    if (view === 'crearTurno') return <CrearTurnoPage />;
    if (view === 'turnosPendientes') {
      return (
        <TurnosPendientesPage
          onGoToCrearTurno={() => setView('crearTurno')}
          role={role}
        />
      );
    }
    if (view === 'crearChequeo') {
      return (
        <CrearChequeoPage
          onGoToCrearTurno={() => setView('crearTurno')}
          role={role}
        />
      );
    }
    return null;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-header-title">Control de estado de vehículos</h1>
        <p className="app-header-subtitle">
          Sistema de turnos y chequeos – Trabajo Práctico Integrador
        </p>
        <RoleSelector role={role} onChangeRole={handleChangeRole} />
        <NavBar currentView={view} onChangeView={setView} role={role} />
      </header>
      <main className="app-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
