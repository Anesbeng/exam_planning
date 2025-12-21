import React, { useState } from 'react';
import Modal from '../UI/Modal';
import FileImport from '../UI/FileImport';

const UserManagement = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@uabt.dz',
      role: 'Administrateur',
      status: 'Actif'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Enseignant',
    status: 'Actif'
  });

  const handleAddUser = () => {
    const user = {
      id: users.length + 1,
      ...newUser
    };
    setUsers([...users, user]);
    setShowAddModal(false);
    resetForm();
  };

  const handleImport = (file) => {
    alert(`Utilisateurs importés depuis ${file.name}`);
    setShowImportModal(false);
  };

  const resetForm = () => {
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'Enseignant',
      status: 'Actif'
    });
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>Gestion des Utilisateurs</h1>
        <div className="header-actions">
          <button 
            className="btn-secondary"
            onClick={() => setShowImportModal(true)}
          >
            📁 Importer
          </button>
          <button 
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            + Ajouter Utilisateur
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.lastName}</td>
                <td>{user.firstName}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status ${user.status === 'Actif' ? 'active' : 'inactive'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="btn-edit">Modifier</button>
                  <button className="btn-delete">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Ajouter un Utilisateur"
      >
        <div className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Prénom *</label>
              <input 
                type="text" 
                value={newUser.firstName}
                onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                placeholder="Jean"
              />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input 
                type="text" 
                value={newUser.lastName}
                onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                placeholder="Dupont"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" 
              value={newUser.email}
              onChange={(e) => setNewUser({...newUser, email: e.target.value})}
              placeholder="jean.dupont@uabt.dz"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Rôle *</label>
              <select 
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="Administrateur">Administrateur</option>
                <option value="Enseignant">Enseignant</option>
                <option value="Étudiant">Étudiant</option>
              </select>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select 
                value={newUser.status}
                onChange={(e) => setNewUser({...newUser, status: e.target.value})}
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="btn-secondary"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              Annuler
            </button>
            <button 
              className="btn-primary"
              onClick={handleAddUser}
            >
              Ajouter l'Utilisateur
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Importer des Utilisateurs"
      >
        <FileImport type="utilisateurs" onImport={handleImport} />
      </Modal>
    </div>
  );
};

export default UserManagement;