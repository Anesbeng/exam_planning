import React, { useState } from 'react';
import Modal from '../UI/Modal';
import FileImport from '../UI/FileImport';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Martin',
      email: 'jean.martin@uabt.dz',
      specialty: 'Informatique',
      phone: '0550123456',
      status: 'Actif'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [newTeacher, setNewTeacher] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialty: '',
    phone: '',
    status: 'Actif'
  });

  const handleAddTeacher = () => {
    const teacher = {
      id: teachers.length + 1,
      ...newTeacher
    };
    setTeachers([...teachers, teacher]);
    setShowAddModal(false);
    resetForm();
  };

  const handleImport = (file) => {
    alert(`Enseignants importés depuis ${file.name}`);
    setShowImportModal(false);
  };

  const resetForm = () => {
    setNewTeacher({
      firstName: '',
      lastName: '',
      email: '',
      specialty: '',
      phone: '',
      status: 'Actif'
    });
  };

  return (
    <div className="teacher-management">
      <div className="page-header">
        <h1>Gestion des Enseignants</h1>
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
            + Ajouter Enseignant
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
              <th>Spécialité</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map(teacher => (
              <tr key={teacher.id}>
                <td>{teacher.id}</td>
                <td>{teacher.lastName}</td>
                <td>{teacher.firstName}</td>
                <td>{teacher.email}</td>
                <td>{teacher.specialty}</td>
                <td>{teacher.phone}</td>
                <td>
                  <span className={`status ${teacher.status === 'Actif' ? 'active' : 'inactive'}`}>
                    {teacher.status}
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

      {/* Add Teacher Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Ajouter un Enseignant"
      >
        <div className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Prénom *</label>
              <input 
                type="text" 
                value={newTeacher.firstName}
                onChange={(e) => setNewTeacher({...newTeacher, firstName: e.target.value})}
                placeholder="Jean"
              />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input 
                type="text" 
                value={newTeacher.lastName}
                onChange={(e) => setNewTeacher({...newTeacher, lastName: e.target.value})}
                placeholder="Martin"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input 
              type="email" 
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
              placeholder="jean.martin@uabt.dz"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Spécialité</label>
              <input 
                type="text" 
                value={newTeacher.specialty}
                onChange={(e) => setNewTeacher({...newTeacher, specialty: e.target.value})}
                placeholder="Informatique"
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                value={newTeacher.phone}
                onChange={(e) => setNewTeacher({...newTeacher, phone: e.target.value})}
                placeholder="0550123456"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Statut</label>
            <select 
              value={newTeacher.status}
              onChange={(e) => setNewTeacher({...newTeacher, status: e.target.value})}
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
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
              onClick={handleAddTeacher}
            >
              Ajouter l'Enseignant
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Importer des Enseignants"
      >
        <FileImport type="enseignants" onImport={handleImport} />
      </Modal>
    </div>
  );
};

export default TeacherManagement;