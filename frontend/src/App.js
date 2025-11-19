import React, { useState } from 'react';
import NavBar from './components/NavBar';
import CrearTurnoPage from './pages/crearTurnoPage';
import TurnosPendientesPage from './pages/turnosPendientesPage';
import CrearChequeoPage from './pages/crearChequeoPage';

function App() {
  const [view, setView] = useState('crearTurno');

  const renderView = () => {
    if (view === 'crearTurno') return <CrearTurnoPage />;
    if (view === 'turnosPendientes') {
      return (
        <TurnosPendientesPage
          onGoToCrearTurno={() => setView('crearTurno')}
        />
      );
    }
    if (view === 'crearChequeo') {
      return (
        <CrearChequeoPage
          onGoToCrearTurno={() => setView('crearTurno')}
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
        <NavBar currentView={view} onChangeView={setView} />
      </header>
      <main className="app-content">
        {renderView()}
      </main>
    </div>
  );
}

export default App;
