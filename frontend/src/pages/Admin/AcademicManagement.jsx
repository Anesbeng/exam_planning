import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Modal from "../UI/Modal";
import "../../styles/academic-management.css";

const AcademicManagement = () => {
    /* ================= DATA ================= */
    const [years, setYears] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [levels, setLevels] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [groups, setGroups] = useState([]);

    /* ================= UI ================= */
    const [modal, setModal] = useState(null); // year | semester | level | specialty | group
    const [editing, setEditing] = useState(null); // object

    /* ================= FORMS ================= */
    const emptyForms = {
        year: { name: "", start_date: "", end_date: "", is_current: false },
        semester: {
            name: "",
            academic_year_id: "",
            start_date: "",
            end_date: "",
        },
        level: { code: "", name: "" },
        specialty: { code: "", name: "" },
        group: { name: "", level_id: "", specialty_id: "" },
    };

    const [form, setForm] = useState(emptyForms.year);

    /* ================= FETCH ================= */
    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        const [y, s, l, sp, g] = await Promise.all([
            api.get("/academic-years"),
            api.get("/semesters"),
            api.get("/levels"),
            api.get("/specialties"),
            api.get("/groups"),
        ]);

        setYears(y.data.academic_years);
        setSemesters(s.data.semesters);
        setLevels(l.data.levels);
        setSpecialties(sp.data.specialties);
        setGroups(g.data.groups);
    };

    /* ================= OPEN MODAL ================= */
    const openAdd = (type) => {
        setModal(type);
        setEditing(null);
        setForm(emptyForms[type]);
    };

    const openEdit = (type, data) => {
        setModal(type);
        setEditing(data);
        setForm({ ...data });
    };

    const closeModal = () => {
        setModal(null);
        setEditing(null);
    };

    /* ================= SUBMIT ================= */
    const submit = async () => {
        try {
            const map = {
                year: "/academic-years",
                semester: "/semesters",
                level: "/levels",
                specialty: "/specialties",
                group: "/groups",
            };

            if (editing) {
                await api.put(`${map[modal]}/${editing.id}`, form);
            } else {
                await api.post(map[modal], form);
            }

            closeModal();
            fetchAll();
        } catch (error) {
            console.error(error.response?.data);
            alert(
                error.response?.data?.message ||
                    JSON.stringify(error.response?.data?.errors)
            );
        }
    };

    const remove = async (type, id) => {
        if (!window.confirm("Supprimer ?")) return;

        const map = {
            year: "/academic-years",
            semester: "/semesters",
            level: "/levels",
            specialty: "/specialties",
            group: "/groups",
        };

        await api.delete(`${map[type]}/${id}`);
        fetchAll();
    };

    return (
        <div className="academic-management">
            <h1>Gestion Académique</h1>

            {/* ========== YEARS ========== */}
            <Section
                title="Années universitaires"
                onAdd={() => openAdd("year")}
            >
                <Table headers={["Année", "Début", "Fin", "Statut", "Actions"]}>
                    {years.map((y) => (
                        <Row
                            key={y.id}
                            cols={[
                                y.name,
                                y.start_date,
                                y.end_date,
                                y.is_current ? "Actuelle" : "Inactive",
                            ]}
                            onEdit={() => openEdit("year", y)}
                            onDelete={() => remove("year", y.id)}
                        />
                    ))}
                </Table>
            </Section>

            {/* ========== SEMESTERS ========== */}
            <Section title="Semestres" onAdd={() => openAdd("semester")}>
                <Table headers={["Nom", "Année", "Début", "Fin", "Actions"]}>
                    {semesters.map((s) => (
                        <Row
                            key={s.id}
                            cols={[
                                s.name,
                                s.academic_year.name,
                                s.start_date,
                                s.end_date,
                            ]}
                            onEdit={() => openEdit("semester", s)}
                            onDelete={() => remove("semester", s.id)}
                        />
                    ))}
                </Table>
            </Section>

            {/* ========== LEVELS ========== */}
            <Section title="Niveaux" onAdd={() => openAdd("level")}>
                <Table headers={["Code", "Nom", "Actions"]}>
                    {levels.map((l) => (
                        <Row
                            key={l.id}
                            cols={[l.code, l.name]}
                            onEdit={() => openEdit("level", l)}
                            onDelete={() => remove("level", l.id)}
                        />
                    ))}
                </Table>
            </Section>

            {/* ========== SPECIALTIES ========== */}
            <Section title="Spécialités" onAdd={() => openAdd("specialty")}>
                <Table headers={["Code", "Nom", "Actions"]}>
                    {specialties.map((s) => (
                        <Row
                            key={s.id}
                            cols={[s.code, s.name]}
                            onEdit={() => openEdit("specialty", s)}
                            onDelete={() => remove("specialty", s.id)}
                        />
                    ))}
                </Table>
            </Section>

            {/* ========== GROUPS ========== */}
            <Section title="Groupes" onAdd={() => openAdd("group")}>
                <Table headers={["Nom", "Niveau", "Spécialité", "Actions"]}>
                    {groups.map((g) => (
                        <Row
                            key={g.id}
                            cols={[g.name, g.level.name, g.specialty.name]}
                            onEdit={() => openEdit("group", g)}
                            onDelete={() => remove("group", g.id)}
                        />
                    ))}
                </Table>
            </Section>

            {/* ========== MODAL ========== */}
            {modal && (
                <Modal isOpen onClose={closeModal} title="Gestion">
                    <DynamicForm
                        type={modal}
                        form={form}
                        setForm={setForm}
                        years={years}
                        levels={levels}
                        specialties={specialties}
                    />

                    <div className="form-actions">
                        <button className="btn-secondary" onClick={closeModal}>
                            Annuler
                        </button>
                        <button className="btn-primary" onClick={submit}>
                            {editing ? "Modifier" : "Enregistrer"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

/* ================= COMPONENTS ================= */

const Section = ({ title, onAdd, children }) => (
    <section className="academic-section">
        <div className="section-header">
            <h2>{title}</h2>
            <button className="btn-primary" onClick={onAdd}>
                + Ajouter
            </button>
        </div>
        {children}
    </section>
);

const Table = ({ headers, children }) => (
    <table className="data-table">
        <thead>
            <tr>
                {headers.map((h) => (
                    <th key={h}>{h}</th>
                ))}
            </tr>
        </thead>
        <tbody>{children}</tbody>
    </table>
);

const Row = ({ cols, onEdit, onDelete }) => (
    <tr>
        {cols.map((c, i) => (
            <td key={i}>{c}</td>
        ))}
        <td>
            <button className="btn-edit" onClick={onEdit}>
                ✏️
            </button>
            <button className="btn-delete" onClick={onDelete}>
                🗑️
            </button>
        </td>
    </tr>
);

/* ================= FORM ================= */

const DynamicForm = ({ type, form, setForm, years, levels, specialties }) => {
    if (type === "year")
        return (
            <>
                <input
                    placeholder="2024-2025"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                    }
                />
                <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                    }
                />
                <label>
                    <input
                        type="checkbox"
                        checked={form.is_current}
                        onChange={(e) =>
                            setForm({ ...form, is_current: e.target.checked })
                        }
                    />
                    Année actuelle
                </label>
            </>
        );

    if (type === "semester")
        return (
            <>
                <input
                    placeholder="S1 / S2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <select
                    value={form.academic_year_id}
                    onChange={(e) =>
                        setForm({ ...form, academic_year_id: e.target.value })
                    }
                >
                    <option value="">Année</option>
                    {years.map((y) => (
                        <option key={y.id} value={y.id}>
                            {y.name}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                        setForm({ ...form, start_date: e.target.value })
                    }
                />
                <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                        setForm({ ...form, end_date: e.target.value })
                    }
                />
            </>
        );

    if (type === "level")
        return (
            <>
                <input
                    placeholder="L1 / M1"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
                <input
                    placeholder="Licence 1"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
            </>
        );

    if (type === "specialty")
        return (
            <>
                <input
                    placeholder="INFO"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
                <input
                    placeholder="Informatique"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
            </>
        );

    if (type === "group")
        return (
            <>
                <input
                    placeholder="Groupe 1"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <select
                    value={form.level_id}
                    onChange={(e) =>
                        setForm({ ...form, level_id: e.target.value })
                    }
                >
                    <option value="">Niveau</option>
                    {levels.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.name}
                        </option>
                    ))}
                </select>
                <select
                    value={form.specialty_id}
                    onChange={(e) =>
                        setForm({ ...form, specialty_id: e.target.value })
                    }
                >
                    <option value="">Spécialité</option>
                    {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </>
        );
};

export default AcademicManagement;
