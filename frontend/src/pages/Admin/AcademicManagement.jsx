import React, { useState } from 'react';

const AcademicManagement = () => {
  const [academicYears, setAcademicYears] = useState([
    { id: 1, name: '2023-2024', current: true, startDate: '2023-09-01', endDate: '2024-08-31' },
    { id: 2, name: '2024-2025', current: false, startDate: '2024-09-01', endDate: '2025-08-31' }
  ]);

  const [semesters, setSemesters] = useState([
    { id: 1, name: 'S1', academicYear: '2023-2024', startDate: '2023-09-01', endDate: '2024-01-31' },
    { id: 2, name: 'S2', academicYear: '2023-2024', startDate: '2024-02-01', endDate: '2024-06-30' }
  ]);

  const [levels, setLevels] = useState([
    { id: 1, name: 'Licence 1', code: 'L1' },
    { id: 2, name: 'Licence 2', code: 'L2' },
    { id: 3, name: 'Licence 3', code: 'L3' },
    { id: 4, name: 'Master 1', code: 'M1' },
    { id: 5, name: 'Master 2', code: 'M2' }
  ]);

  const [specialties, setSpecialties] = useState([
    { id: 1, name: 'Informatique', code: 'INFO' },
    { id: 2, name: 'Mathématiques', code: 'MATH' },
    { id: 3, name: 'Physique', code: 'PHYS' }
  ]);

  const [groups, setGroups] = useState([
    { id: 1, name: 'Groupe 1', level: 'L1', specialty: 'Informatique' },
    { id: 2, name: 'Groupe 2', level: 'L1', specialty: 'Informatique' }
  ]);

  return (
    <div className="academic-management">
      <div className="page-header">
        <h1>Gestion Académique</h1>
      </div>

      <div className="academic-sections">
        {/* Années Universitaires */}
        <section className="academic-section">
          <div className="section-header">
            <h2>Années Universitaires</h2>
            <button className="btn-primary">+ Ajouter</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Année</th>
                  <th>Date Début</th>
                  <th>Date Fin</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {academicYears.map(year => (
                  <tr key={year.id}>
                    <td>{year.name}</td>
                    <td>{year.startDate}</td>
                    <td>{year.endDate}</td>
                    <td>
                      <span className={`status ${year.current ? 'active' : 'inactive'}`}>
                        {year.current ? '🟢 Actuelle' : '⚫ Inactive'}
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
        </section>

        {/* Semestres */}
        <section className="academic-section">
          <div className="section-header">
            <h2>Semestres</h2>
            <button className="btn-primary">+ Ajouter</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Semestre</th>
                  <th>Année</th>
                  <th>Date Début</th>
                  <th>Date Fin</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {semesters.map(semester => (
                  <tr key={semester.id}>
                    <td>{semester.name}</td>
                    <td>{semester.academicYear}</td>
                    <td>{semester.startDate}</td>
                    <td>{semester.endDate}</td>
                    <td>
                      <button className="btn-edit">Modifier</button>
                      <button className="btn-delete">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Niveaux */}
        <section className="academic-section">
          <div className="section-header">
            <h2>Niveaux / Parcours</h2>
            <button className="btn-primary">+ Ajouter</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {levels.map(level => (
                  <tr key={level.id}>
                    <td>{level.code}</td>
                    <td>{level.name}</td>
                    <td>
                      <button className="btn-edit">Modifier</button>
                      <button className="btn-delete">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Spécialités */}
        <section className="academic-section">
          <div className="section-header">
            <h2>Spécialités</h2>
            <button className="btn-primary">+ Ajouter</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {specialties.map(specialty => (
                  <tr key={specialty.id}>
                    <td>{specialty.code}</td>
                    <td>{specialty.name}</td>
                    <td>
                      <button className="btn-edit">Modifier</button>
                      <button className="btn-delete">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Groupes */}
        <section className="academic-section">
          <div className="section-header">
            <h2>Groupes Étudiants</h2>
            <button className="btn-primary">+ Ajouter</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Niveau</th>
                  <th>Spécialité</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(group => (
                  <tr key={group.id}>
                    <td>{group.name}</td>
                    <td>{group.level}</td>
                    <td>{group.specialty}</td>
                    <td>
                      <button className="btn-edit">Modifier</button>
                      <button className="btn-delete">Supprimer</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AcademicManagement;