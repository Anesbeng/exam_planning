import React, { useState } from 'react';
import Modal from '../UI/Modal';
import FileImport from '../UI/FileImport';

const ModuleManagement = () => {
  const [modules, setModules] = useState([
    {
      id: 1,
      code: 'MATH101',
      name: 'Mathématiques Fondamentales',
      semester: 'S1',
      teacher: 'Dr. Smith',
      credits: 6,
      level: 'L1',
      specialty: 'Informatique'
    }
  ]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [newModule, setNewModule] = useState({
    code: '',
    name: '',
    semester: '',
    teacher: '',
    credits: '',
    level: '',
    specialty: ''
  });

  const handleAddModule = () => {
    const module = {
      id: modules.length + 1,
      ...newModule
    };
    setModules([...modules, module]);
    setShowAddModal(false);
    resetForm();
  };

  const handleImport = (file) => {
    alert(`Modules importés depuis ${file.name}`);
    setShowImportModal(false);
  };

  const resetForm = () => {
    setNewModule({
      code: '',
      name: '',
      semester: '',
      teacher: '',
      credits: '',
      level: '',
      specialty: ''
    });
  };

  return (
    <div className="module-management">
      <div className="page-header">
        <h1>Gestion des Modules</h1>
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
            + Ajouter Module
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Nom</th>
              <th>Semestre</th>
              <th>Enseignant</th>
              <th>Crédits</th>
              <th>Niveau</th>
              <th>Spécialité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(module => (
              <tr key={module.id}>
                <td>{module.code}</td>
                <td>{module.name}</td>
                <td>{module.semester}</td>
                <td>{module.teacher}</td>
                <td>{module.credits}</td>
                <td>{module.level}</td>
                <td>{module.specialty}</td>
                <td>
                  <button className="btn-edit">Modifier</button>
                  <button className="btn-delete">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Module Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Ajouter un Module"
        size="lg"
      >
        <div className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Code du Module *</label>
              <input 
                type="text" 
                value={newModule.code}
                onChange={(e) => setNewModule({...newModule, code: e.target.value})}
                placeholder="MATH101"
              />
            </div>
            <div className="form-group">
              <label>Nom du Module *</label>
              <input 
                type="text" 
                value={newModule.name}
                onChange={(e) => setNewModule({...newModule, name: e.target.value})}
                placeholder="Mathématiques Fondamentales"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Semestre *</label>
              <select 
                value={newModule.semester}
                onChange={(e) => setNewModule({...newModule, semester: e.target.value})}
              >
                <option value="">Sélectionner</option>
                <option value="S1">Semestre 1</option>
                <option value="S2">Semestre 2</option>
                <option value="S3">Semestre 3</option>
                <option value="S4">Semestre 4</option>
              </select>
            </div>
            <div className="form-group">
              <label>Enseignant Responsable *</label>
              <input 
                type="text" 
                value={newModule.teacher}
                onChange={(e) => setNewModule({...newModule, teacher: e.target.value})}
                placeholder="Nom de l'enseignant"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Crédits</label>
              <input 
                type="number" 
                value={newModule.credits}
                onChange={(e) => setNewModule({...newModule, credits: e.target.value})}
                placeholder="6"
              />
            </div>
            <div className="form-group">
              <label>Niveau</label>
              <select 
                value={newModule.level}
                onChange={(e) => setNewModule({...newModule, level: e.target.value})}
              >
                <option value="">Sélectionner</option>
                <option value="L1">Licence 1</option>
                <option value="L2">Licence 2</option>
                <option value="L3">Licence 3</option>
                <option value="M1">Master 1</option>
                <option value="M2">Master 2</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Spécialité</label>
            <select 
              value={newModule.specialty}
              onChange={(e) => setNewModule({...newModule, specialty: e.target.value})}
            >
              <option value="">Sélectionner</option>
              <option value="Informatique">Informatique</option>
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              <option value="Chimie">Chimie</option>
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
              onClick={handleAddModule}
            >
              Ajouter le Module
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Importer des Modules"
      >
        <FileImport type="modules" onImport={handleImport} />
      </Modal>
    </div>
  );
};

export default ModuleManagement;