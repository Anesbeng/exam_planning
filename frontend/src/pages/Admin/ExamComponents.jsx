import React, { useMemo } from "react";

/* ================= EXAM FORM COMPONENT ================= */
export const ExamForm = ({
    exam,
    setExam,
    rooms,
    teachers,
    modules,
    levels,
    specialties,
    groups,
    semesters,
    onSubmit,
    onCancel,
    onAutoAssign,
    submitLabel,
    conflictError,
    availableTeachers = [],
}) => {
    const filteredGroups = useMemo(() => {
        return groups.filter((g) => {
            if (typeof g === "object") {
                return (
                    (!exam.niveau || g.level?.name === exam.niveau) &&
                    (!exam.specialite || g.specialty?.name === exam.specialite)
                );
            }
            return true;
        });
    }, [groups, exam.niveau, exam.specialite]);

    const canAutoAssign =
        exam.module && exam.date && exam.startTime && exam.endTime;

    return (
        <div className="add-exam-form">
            {conflictError && (
                <div className="conflict-alert">
                    <strong>⚠️ Conflit détecté :</strong> {conflictError}
                </div>
            )}

            <div className="form-row">
                <div className="form-group">
                    <label>Type d'examen</label>
                    <select
                        value={exam.type}
                        onChange={(e) =>
                            setExam({ ...exam, type: e.target.value })
                        }
                    >
                        <option value="examen">Examen</option>
                        <option value="cc">Contrôle Continu</option>
                        <option value="rattrapage">Rattrapage</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Module *</label>
                    <select
                        value={exam.module}
                        onChange={(e) =>
                            setExam({ ...exam, module: e.target.value })
                        }
                        required
                    >
                        <option value="">Sélectionner un module</option>
                        {modules.map((m) => (
                            <option key={m.id || m._id} value={m.name}>
                                {m.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Enseignant *</label>
                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "flex-end",
                        }}
                    >
                        <select
                            value={exam.teacher}
                            onChange={(e) =>
                                setExam({ ...exam, teacher: e.target.value })
                            }
                            required
                            style={{ flex: 1 }}
                        >
                            <option value="">Sélectionner un enseignant</option>
                            {teachers.map((t) => (
                                <option key={t.id || t._id} value={t.name}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            className="auto-assign-btn"
                            onClick={onAutoAssign}
                            disabled={!canAutoAssign}
                            style={{ minWidth: "160px" }}
                        >
                            <span>⚡</span> Affectation auto
                        </button>
                    </div>

                    {availableTeachers.length > 0 && (
                        <div
                            style={{
                                marginTop: "8px",
                                padding: "8px",
                                background: "#f0f9ff",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                            }}
                        >
                            <strong>
                                Enseignants disponibles (
                                {availableTeachers.length}) :
                            </strong>
                            <div
                                style={{
                                    marginTop: "4px",
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "6px",
                                }}
                            >
                                {availableTeachers
                                    .slice(0, 5)
                                    .map((teacher) => (
                                        <span
                                            key={teacher.id}
                                            style={{
                                                background: "#3b82f6",
                                                color: "white",
                                                padding: "2px 8px",
                                                borderRadius: "12px",
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            {teacher.name}
                                        </span>
                                    ))}
                                {availableTeachers.length > 5 && (
                                    <span style={{ color: "#6b7280" }}>
                                        +{availableTeachers.length - 5} autres
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <small
                        style={{
                            color: "#6b7280",
                            fontSize: "0.8rem",
                            display: "block",
                            marginTop: "4px",
                        }}
                    >
                        {!exam.module
                            ? "⚠️ Sélectionnez d'abord un module"
                            : !canAutoAssign
                            ? "Sélectionnez la date et l'heure pour activer l'affectation automatique"
                            : "✅ Cliquez sur 'Affectation auto' pour trouver un enseignant disponible"}
                    </small>
                </div>

                <div className="form-group">
                    <label>Salle *</label>
                    <select
                        value={exam.room}
                        onChange={(e) =>
                            setExam({ ...exam, room: e.target.value })
                        }
                        required
                    >
                        <option value="">Sélectionner une salle</option>
                        {rooms.map((r) => (
                            <option key={r.id || r._id} value={r.name}>
                                {r.name}{" "}
                                {r.capacity ? `(${r.capacity} places)` : ""}
                            </option>
                        ))}
                    </select>
                    <small style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                        {rooms.length} salle(s) disponible(s) pour ce créneau
                    </small>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Spécialité</label>
                    <select
                        value={exam.specialite}
                        onChange={(e) =>
                            setExam({ ...exam, specialite: e.target.value })
                        }
                    >
                        <option value="">Sélectionner une spécialité</option>
                        {specialties.map((s, index) => (
                            <option
                                key={index}
                                value={typeof s === "object" ? s.name : s}
                            >
                                {typeof s === "object" ? s.name : s}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Niveau</label>
                    <select
                        value={exam.niveau}
                        onChange={(e) =>
                            setExam({ ...exam, niveau: e.target.value })
                        }
                    >
                        <option value="">Sélectionner un niveau</option>
                        {levels.map((l, index) => (
                            <option
                                key={index}
                                value={typeof l === "object" ? l.name : l}
                            >
                                {typeof l === "object" ? l.name : l}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Groupe</label>
                    <select
                        value={exam.group}
                        onChange={(e) =>
                            setExam({ ...exam, group: e.target.value })
                        }
                    >
                        <option value="">Sélectionner un groupe</option>
                        {filteredGroups.map((g, index) => (
                            <option
                                key={index}
                                value={typeof g === "object" ? g.name : g}
                            >
                                {typeof g === "object" ? g.name : g}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Semestre *</label>
                    <select
                        value={exam.semester}
                        onChange={(e) =>
                            setExam({ ...exam, semester: e.target.value })
                        }
                        required
                    >
                        <option value="">Sélectionner un semestre</option>
                        {semesters.map((s, index) => (
                            <option
                                key={index}
                                value={typeof s === "object" ? s.name : s}
                            >
                                {typeof s === "object" ? s.name : s}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="form-row">
                <div className="form-group">
                    <label>Date *</label>
                    <input
                        type="date"
                        value={exam.date}
                        onChange={(e) =>
                            setExam({ ...exam, date: e.target.value })
                        }
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Heure début *</label>
                    <input
                        type="time"
                        value={exam.startTime}
                        onChange={(e) =>
                            setExam({ ...exam, startTime: e.target.value })
                        }
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Heure fin *</label>
                    <input
                        type="time"
                        value={exam.endTime}
                        onChange={(e) =>
                            setExam({ ...exam, endTime: e.target.value })
                        }
                        required
                    />
                </div>
            </div>

            <div className="form-actions">
                <button
                    className="btn-secondary"
                    onClick={onCancel}
                    type="button"
                >
                    Annuler
                </button>
                <button
                    className="btn-primary"
                    onClick={onSubmit}
                    type="button"
                >
                    {submitLabel}
                </button>
            </div>
        </div>
    );
};

/* ================= TABLE SECTION COMPONENT ================= */
export const Section = ({ title, data, onEdit, onDelete, onNotify }) => (
    <div className="exam-section">
        <h2>{title}</h2>

        <table className="exam-table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Module</th>
                    <th>Enseignant</th>
                    <th>Salle</th>
                    <th>Spécialité</th>
                    <th>Niveau</th>
                    <th>Groupe</th>
                    <th>Semestre</th>
                    <th>Date</th>
                    <th>Heures</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td colSpan="11" className="empty">
                            <div className="empty-icon">🔭</div>
                            <p>Aucun examen trouvé</p>
                        </td>
                    </tr>
                ) : (
                    data.map((e) => (
                        <tr key={e.id}>
                            <td>
                                <span className={`type-badge badge-${e.type}`}>
                                    {e.type === "examen"
                                        ? "EX"
                                        : e.type === "cc"
                                        ? "CC"
                                        : "RAT"}
                                </span>
                            </td>
                            <td>
                                <strong>{e.module}</strong>
                            </td>
                            <td>{e.teacher}</td>
                            <td>
                                <span className="room-badge">{e.room}</span>
                            </td>
                            <td>{e.specialite}</td>
                            <td>{e.niveau}</td>
                            <td>{e.group}</td>
                            <td>{e.semester}</td>
                            <td>
                                {e.date
                                    ? new Date(e.date).toLocaleDateString(
                                          "fr-FR"
                                      )
                                    : "N/A"}
                            </td>
                            <td>
                                <span className="time-slot">
                                    {e.start_time || e.startTime} -{" "}
                                    {e.end_time || e.endTime}
                                </span>
                            </td>
                            <td className="actions">
                                <button
                                    className="btn-icon btn-edit"
                                    onClick={() => onEdit(e)}
                                    title="Modifier"
                                >
                                    ✏️
                                </button>
                                <button
                                    className="btn-icon btn-delete"
                                    onClick={() => onDelete(e)}
                                    title="Supprimer"
                                >
                                    🗑️
                                </button>
                                <button
                                    className="btn-icon btn-notify"
                                    onClick={() => onNotify(e)}
                                    title="Notifier l'enseignant"
                                >
                                    📧
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);
