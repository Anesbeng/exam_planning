import React, { useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/ExamCalendar.css"; // We'll create this CSS file

const localizer = momentLocalizer(moment);

const ExamCalendar = ({ exams = [] }) => {
    const [view, setView] = useState("week");
    const [date, setDate] = useState(new Date());
    const [selectedExam, setSelectedExam] = useState(null);
    const [showExamDetails, setShowExamDetails] = useState(false);
    const [filterType, setFilterType] = useState("all");

    // Transform exams to calendar events with better error handling
    const events = useMemo(() => {
        if (!exams || !Array.isArray(exams)) return [];

        return exams
            .filter((exam) => {
                if (filterType === "all") return true;
                return exam.type === filterType;
            })
            .map((exam) => {
                try {
                    // Handle missing or invalid data
                    const startDate = exam.date
                        ? new Date(`${exam.date}T${exam.start_time || "09:00"}`)
                        : new Date();
                    const endDate = exam.date
                        ? new Date(`${exam.date}T${exam.end_time || "11:00"}`)
                        : new Date();

                    // Ensure end date is after start date
                    if (endDate <= startDate) {
                        endDate.setHours(startDate.getHours() + 2);
                    }

                    return {
                        id: exam.id || Math.random(),
                        title: `${exam.module || "Unknown Module"}`,
                        subtitle: `${exam.teacher || "No Teacher"} | ${
                            exam.room || "No Room"
                        }`,
                        fullTitle: `${exam.module || "Unknown Module"} | ${
                            exam.teacher || "No Teacher"
                        } | ${exam.room || "No Room"}`,
                        start: startDate,
                        end: endDate,
                        type: exam.type || "examen",
                        module: exam.module,
                        teacher: exam.teacher,
                        room: exam.room,
                        specialite: exam.specialite,
                        niveau: exam.niveau,
                        group: exam.group,
                        semester: exam.semester,
                        date: exam.date,
                        start_time: exam.start_time,
                        end_time: exam.end_time,
                    };
                } catch (error) {
                    console.error(
                        "Error creating event for exam:",
                        exam,
                        error
                    );
                    return null;
                }
            })
            .filter((event) => event !== null);
    }, [exams, filterType]);

    // Custom event styling
    const eventStyleGetter = (event) => {
        let backgroundColor = "#2563eb"; // blue default for examen
        let borderColor = "#1d4ed8";
        let textColor = "white";

        switch (event.type) {
            case "examen":
                backgroundColor = "#2563eb";
                borderColor = "#1d4ed8";
                break;
            case "cc":
                backgroundColor = "#16a34a";
                borderColor = "#15803d";
                break;
            case "rattrapage":
                backgroundColor = "#dc2626";
                borderColor = "#b91c1c";
                break;
            default:
                backgroundColor = "#6b7280";
                borderColor = "#4b5563";
        }

        return {
            style: {
                backgroundColor,
                borderLeft: `4px solid ${borderColor}`,
                color: textColor,
                borderRadius: "6px",
                border: "none",
                padding: "8px 4px",
                fontSize: "0.85rem",
                fontWeight: "500",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                overflow: "hidden",
                textOverflow: "ellipsis",
            },
            className: "exam-calendar-event",
        };
    };

    // Handle event click
    const handleSelectEvent = (event) => {
        setSelectedExam(event);
        setShowExamDetails(true);
    };

    // Handle slot selection (for adding new exams)
    const handleSelectSlot = (slotInfo) => {
        console.log("Selected slot:", slotInfo);
        // You could open a modal to add a new exam here
    };

    // Custom toolbar component
    const CustomToolbar = (toolbar) => {
        const goToBack = () => {
            toolbar.onNavigate("PREV");
        };

        const goToNext = () => {
            toolbar.onNavigate("NEXT");
        };

        const goToCurrent = () => {
            toolbar.onNavigate("TODAY");
            setDate(new Date());
        };

        const changeView = (viewName) => {
            toolbar.onView(viewName);
            setView(viewName);
        };

        return (
            <div className="calendar-toolbar">
                <div className="toolbar-left">
                    <button className="toolbar-btn" onClick={goToBack}>
                        ◀
                    </button>
                    <button
                        className="toolbar-btn today-btn"
                        onClick={goToCurrent}
                    >
                        Aujourd'hui
                    </button>
                    <button className="toolbar-btn" onClick={goToNext}>
                        ▶
                    </button>
                    <span className="current-date">
                        {moment(toolbar.date).format("MMMM YYYY")}
                    </span>
                </div>

                <div className="toolbar-center">
                    <div className="view-buttons">
                        <button
                            className={`view-btn ${
                                view === "month" ? "active" : ""
                            }`}
                            onClick={() => changeView("month")}
                        >
                            Mois
                        </button>
                        <button
                            className={`view-btn ${
                                view === "week" ? "active" : ""
                            }`}
                            onClick={() => changeView("week")}
                        >
                            Semaine
                        </button>
                        <button
                            className={`view-btn ${
                                view === "day" ? "active" : ""
                            }`}
                            onClick={() => changeView("day")}
                        >
                            Jour
                        </button>
                    </div>
                </div>

                <div className="toolbar-right">
                    <select
                        className="type-filter"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Tous les types</option>
                        <option value="examen">Examens</option>
                        <option value="cc">Contrôles Continus</option>
                        <option value="rattrapage">Rattrapages</option>
                    </select>
                </div>
            </div>
        );
    };

    // Custom event component
    const EventComponent = ({ event }) => {
        return (
            <div className="custom-event">
                <div className="event-title">{event.title}</div>
                <div className="event-subtitle">
                    {event.teacher} | {event.room}
                </div>
                <div className="event-time">
                    {moment(event.start).format("HH:mm")} -{" "}
                    {moment(event.end).format("HH:mm")}
                </div>
            </div>
        );
    };

    return (
        <div className="exam-calendar-container">
            <div className="calendar-header">
                <h2>
                    <span className="calendar-icon">📅</span>
                    Planning des Examens
                    <span className="event-count">
                        ({events.length} événements)
                    </span>
                </h2>

                <div className="legend">
                    <div className="legend-item">
                        <span className="legend-color examen"></span>
                        <span>Examen</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color cc"></span>
                        <span>Contrôle Continu</span>
                    </div>
                    <div className="legend-item">
                        <span className="legend-color rattrapage"></span>
                        <span>Rattrapage</span>
                    </div>
                </div>
            </div>

            <div className="calendar-wrapper">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "600px" }}
                    views={["month", "week", "day"]}
                    view={view}
                    onView={setView}
                    date={date}
                    onNavigate={setDate}
                    defaultView="week"
                    eventPropGetter={eventStyleGetter}
                    components={{
                        toolbar: CustomToolbar,
                        event: EventComponent,
                    }}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    popup
                    messages={{
                        today: "Aujourd'hui",
                        previous: "Précédent",
                        next: "Suivant",
                        month: "Mois",
                        week: "Semaine",
                        day: "Jour",
                        agenda: "Agenda",
                        date: "Date",
                        time: "Heure",
                        event: "Événement",
                        noEventsInRange:
                            "Aucun examen prévu pour cette période.",
                    }}
                    culture="fr"
                />
            </div>

            {/* Exam Details Modal */}
            {showExamDetails && selectedExam && (
                <div className="exam-details-modal">
                    <div
                        className="modal-overlay"
                        onClick={() => setShowExamDetails(false)}
                    ></div>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Détails de l'examen</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowExamDetails(false)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="exam-type-badge">
                                <span
                                    className={`type-badge ${selectedExam.type}`}
                                >
                                    {selectedExam.type === "examen"
                                        ? "EXAMEN"
                                        : selectedExam.type === "cc"
                                        ? "CONTROLE CONTINU"
                                        : "RATTRAPAGE"}
                                </span>
                            </div>

                            <div className="exam-info-grid">
                                <div className="info-item">
                                    <span className="info-label">Module:</span>
                                    <span className="info-value">
                                        {selectedExam.module}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">
                                        Enseignant:
                                    </span>
                                    <span className="info-value">
                                        {selectedExam.teacher}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Salle:</span>
                                    <span className="info-value">
                                        {selectedExam.room}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Date:</span>
                                    <span className="info-value">
                                        {moment(selectedExam.date).format(
                                            "DD/MM/YYYY"
                                        )}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Heure:</span>
                                    <span className="info-value">
                                        {selectedExam.start_time} -{" "}
                                        {selectedExam.end_time}
                                    </span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Durée:</span>
                                    <span className="info-value">
                                        {moment(selectedExam.end).diff(
                                            moment(selectedExam.start),
                                            "hours"
                                        )}
                                        h
                                    </span>
                                </div>
                                {selectedExam.specialite && (
                                    <div className="info-item">
                                        <span className="info-label">
                                            Spécialité:
                                        </span>
                                        <span className="info-value">
                                            {selectedExam.specialite}
                                        </span>
                                    </div>
                                )}
                                {selectedExam.niveau && (
                                    <div className="info-item">
                                        <span className="info-label">
                                            Niveau:
                                        </span>
                                        <span className="info-value">
                                            {selectedExam.niveau}
                                        </span>
                                    </div>
                                )}
                                {selectedExam.group && (
                                    <div className="info-item">
                                        <span className="info-label">
                                            Groupe:
                                        </span>
                                        <span className="info-value">
                                            {selectedExam.group}
                                        </span>
                                    </div>
                                )}
                                {selectedExam.semester && (
                                    <div className="info-item">
                                        <span className="info-label">
                                            Semestre:
                                        </span>
                                        <span className="info-value">
                                            {selectedExam.semester}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn-close"
                                onClick={() => setShowExamDetails(false)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamCalendar;
