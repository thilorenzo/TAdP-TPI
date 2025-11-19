import React from 'react';

function RoleSelector({ role, onChangeRole }) {
  return (
    <div className="role-selector">
      <button
        type="button"
        className={`role-button ${role === 'CLIENTE' ? 'active' : ''}`}
        onClick={() => onChangeRole('CLIENTE')}
      >
        DUEÑO DE VEHÍCULO
      </button>

      <button
        type="button"
        className={`role-button ${role === 'INSPECTOR' ? 'active' : ''}`}
        onClick={() => onChangeRole('INSPECTOR')}
      >
        INSPECTOR
      </button>
    </div>
  );
}

export default RoleSelector;
