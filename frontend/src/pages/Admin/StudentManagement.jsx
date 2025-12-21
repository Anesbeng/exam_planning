import React, { useState } from 'react';
import Modal from '../UI/Modal';
import FileImport from '../UI/FileImport';

const StudentManagement = () => {
  const [students, setStudents] = useState([
    {
      id: 1,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@edu.uabt.dz',
      studentId: 'ETU001',
      level: 'L1',
      specialty: 'Informatique',
      group: 'G1',
      phone: '0550123456'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    level: '',
    specialty: '',
    group: '',
    phone: ''
  });

  const handleAddStudent = () => {
    if (!newStudent.level || !newStudent.specialty || !newStudent.group) {
      alert('Veuillez remplir le niveau, la spécialité et le groupe');
      return;
    }

    const student = {
      id: students.length + 1,
      ...newStudent
    };
    setStudents([...students, student]);
    setShowAddModal(false);
    resetForm();
  };

  const handleImport = (file) => {
    alert(`Étudiants importés depuis ${file.name}`);
    setShowImportModal(false);
  };

  const resetForm = () => {
    setNewStudent({
      firstName: '',
      lastName: '',
      email: '',
      studentId: '',
      level: '',
      specialty: '',
      group: '',
      phone: ''
    });
  };

  return (
    <div className="student-management">
      <div className="page-header">
        <h1>Gestion des Étudiants</h1>
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
            + Ajouter Étudiant
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
              <th>Niveau</th>
              <th>Spécialité</th>
              <th>Groupe</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id}>
                <td>{student.studentId}</td>
                <td>{student.lastName}</td>
                <td>{student.firstName}</td>
                <td>{student.email}</td>
                <td>{student.level}</td>
                <td>{student.specialty}</td>
                <td>{student.group}</td>
                <td>
                  <button className="btn-edit">Modifier</button>
                  <button className="btn-delete">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Student Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Ajouter un Étudiant"
        size="lg"
      >
        <div className="form">
          <div className="form-row">
            <div className="form-group">
              <label>Prénom *</label>
              <input 
                type="text" 
                value={newStudent.firstName}
                onChange={(e) => setNewStudent({...newStudent, firstName: e.target.value})}
                placeholder="Jean"
              />
            </div>
            <div className="form-group">
              <label>Nom *</label>
              <input 
                type="text" 
                value={newStudent.lastName}
                onChange={(e) => setNewStudent({...newStudent, lastName: e.target.value})}
                placeholder="Dupont"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                value={newStudent.email}
                onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                placeholder="jean.dupont@edu.uabt.dz"
              />
            </div>
            <div className="form-group">
              <label>Numéro étudiant</label>
              <input 
                type="text" 
                value={newStudent.studentId}
                onChange={(e) => setNewStudent({...newStudent, studentId: e.target.value})}
                placeholder="ETU001"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Niveau *</label>
              <select 
                value={newStudent.level}
                onChange={(e) => setNewStudent({...newStudent, level: e.target.value})}
              >
                <option value="">Sélectionner</option>
                <option value="L1">Licence 1</option>
                <option value="L2">Licence 2</option>
                <option value="L3">Licence 3</option>
                <option value="M1">Master 1</option>
                <option value="M2">Master 2</option>
              </select>
            </div>
            <div className="form-group">
              <label>Spécialité *</label>
              <select 
                value={newStudent.specialty}
                onChange={(e) => setNewStudent({...newStudent, specialty: e.target.value})}
              >
                <option value="">Sélectionner</option>
                <option value="Informatique">Informatique</option>
                <option value="Mathématiques">Mathématiques</option>
                <option value="Physique">Physique</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Groupe *</label>
              <input 
                type="text" 
                value={newStudent.group}
                onChange={(e) => setNewStudent({...newStudent, group: e.target.value})}
                placeholder="G1"
              />
            </div>
            <div className="form-group">
              <label>Téléphone</label>
              <input 
                type="tel" 
                value={newStudent.phone}
                onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                placeholder="0550123456"
              />
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
              onClick={handleAddStudent}
            >
              Ajouter l'Étudiant
            </button>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Importer des Étudiants"
      >
        <FileImport type="étudiants" onImport={handleImport} />
      </Modal>
    </div>
  );
};

export default StudentManagement;