import React from "react";
import {
    BookOpen,
    Users,
    Shield,
    LogIn,
    Phone,
    Mail,
    MapPin,
    ExternalLink,
} from "lucide-react";
import uniLogo from "./images/logouni.png";
import teacher from "./images/teacher.jpg";
import etudiant from "./images/etudiant.jpg";
import admin from "./images/admin.jpg";

import { useNavigate } from "react-router-dom";

export default function Summary() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#c9d6ff] to-[#e2e2e2] font-montserrat">
            {/* HEADER (GLASS) */}
            <header className="sticky top-0 z-50 bg-white/30 backdrop-blur-xl border-b border-white/40 shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img
                            src={uniLogo}
                            alt="UABT Logo"
                            className="w-12 h-12 object-contain"
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">
                                UABT
                            </h1>
                            <p className="text-sm text-slate-700">
                                Département Informatique
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate("/login")}
                        className="hidden sm:flex items-center gap-2 px-6 py-2 rounded-xl 
                       bg-white/30 backdrop-blur-md border border-white/40
                       text-slate-800 font-semibold shadow hover:bg-white/50 transition"
                    >
                        <LogIn className="w-4 h-4" />
                        Log In
                    </button>
                </div>
            </header>

            {/* HERO */}
            <section className="py-20 text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-slate-800 mb-6">
                        Bienvenue au Département Informatique
                    </h2>
                    <p className="text-lg text-slate-700">
                        La plateforme UABT vous permet de gérer efficacement vos
                        activités académiques : suivi des notes, planning des
                        cours, réclamations, annonces et bien plus encore.
                    </p>
                </div>
            </section>

            {/* ACCESS CARDS */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* ETUDIANTS */}
                    <div
                        className="bg-white/25 backdrop-blur-xl border border-white/30
                          rounded-2xl shadow-xl overflow-hidden
                          hover:bg-white/35 hover:-translate-y-1 transition"
                    >
                        <img
                            src={etudiant}
                            alt="Étudiants"
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Users className="w-8 h-8 text-blue-600" />
                                <h3 className="text-2xl font-bold text-slate-800">
                                    Espace Étudiants
                                </h3>
                            </div>
                            <ul className="space-y-3 text-slate-700">
                                <li>• Planning des cours (CC, EXAM, RATT)</li>
                                <li>• Informations et réclamations</li>
                                <li>• Groupe de chaque étudiant</li>
                                <li>• Accès aux annonces pédagogiques</li>
                            </ul>
                        </div>
                    </div>

                    {/* ENSEIGNANTS */}
                    <div
                        className="bg-white/25 backdrop-blur-xl border border-white/30
                          rounded-2xl shadow-xl overflow-hidden
                          hover:bg-white/35 hover:-translate-y-1 transition"
                    >
                        <img
                            src={teacher}
                            alt="Enseignants"
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <BookOpen className="w-8 h-8 text-green-600" />
                                <h3 className="text-2xl font-bold text-slate-800">
                                    Espace Enseignants
                                </h3>
                            </div>
                            <ul className="space-y-3 text-slate-700">
                                <li>• Plannings de surveillance</li>
                                <li>• Réclamations et conflits d'horaires</li>
                                <li>• Gestion des annonces départementales</li>
                            </ul>
                        </div>
                    </div>

                    {/* ADMIN */}
                    <div
                        className="bg-white/25 backdrop-blur-xl border border-white/30
                          rounded-2xl shadow-xl overflow-hidden
                          hover:bg-white/35 hover:-translate-y-1 transition"
                    >
                        <img
                            src={admin}
                            alt="Administration"
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Shield className="w-8 h-8 text-purple-600" />
                                <h3 className="text-2xl font-bold text-slate-800">
                                    Espace Admin
                                </h3>
                            </div>
                            <ul className="space-y-3 text-slate-700 text-sm">
                                <li>
                                    • Gestion années universitaires & semestres
                                </li>
                                <li>• Gestion enseignants & étudiants</li>
                                <li>• Emplois du temps, PV</li>
                                <li>• Gestion centralisée du département</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* DETAILED FOOTER WITH LINKS (NEW SECTION) */}
            <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* AUTRES LIENS */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-blue-300">
                                AUTRES LIENS
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="https://www.univ-tlemcen.dz"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-300 transition flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Université de Tlemcen
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.mesrs.dz"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-300 transition flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Ministère de l'Enseignement Supérieur
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.progres.mesrs.dz"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-300 transition flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Plateforme PROGRES
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-blue-300 transition flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Bibliothèque Universitaire
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-blue-300 transition flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Plateforme E-Learning
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* ADMINISTRATION */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-green-300">
                                ADMINISTRATION
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-green-300 transition"
                                    >
                                        Département Informatique
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-green-300 transition"
                                    >
                                        Faculté des Sciences
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-green-300 transition"
                                    >
                                        Scolarité
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-green-300 transition"
                                    >
                                        Service des Examens
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-green-300 transition"
                                    >
                                        Rectorat
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* PAGES POPULAIRES */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-purple-300">
                                PAGES POPULAIRES
                            </h3>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-purple-300 transition"
                                    >
                                        Calendrier Universitaire
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-purple-300 transition"
                                    >
                                        Programmes de Formation
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-purple-300 transition"
                                    >
                                        Annonces et Actualités
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-purple-300 transition"
                                    >
                                        Offres de Stage
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-purple-300 transition"
                                    >
                                        Règlement Intérieur
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* CONTACT */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-yellow-300">
                                CONTACT
                            </h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <Phone className="w-4 h-4 mt-1 text-yellow-300 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Tél:</p>
                                        <p>043 21 63 70</p>
                                        <p>043 21 78 77</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Mail className="w-4 h-4 mt-1 text-yellow-300 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">Email:</p>
                                        <p className="break-all">
                                            info@univ-tlemcen.dz
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-1 text-yellow-300 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold">
                                            Adresse:
                                        </p>
                                        <p>Faculté des Sciences</p>
                                        <p>BP 119, 13000</p>
                                        <p>Tlemcen, Algérie</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* DIVIDER */}
                    <div className="border-t border-white/20 my-8"></div>

                    {/* COPYRIGHT */}
                    <div className="text-center text-sm">
                        <p className="font-semibold mb-2">
                            © 2025 Université Aboubekr Belkaid - Tlemcen
                        </p>
                        <p className="text-white/70">
                            Faculté des Sciences – Département Informatique
                        </p>
                        <p className="text-white/70 mt-2">
                            Tous droits réservés
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
