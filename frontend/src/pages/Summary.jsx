import React from "react";
import { BookOpen, Users, Shield, LogIn } from "lucide-react";
import uniLogo from "./logouni.png";
import teacher from "./teacher.jpg";
import etudiant from "./etudiant.jpg";
import admin from "./admin.jpg";

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
                        onClick={() => navigate("/")}
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
                                <li>• Emplois du temps , PV</li>
                                <li>• Gestion centralisée du département</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER (DARK GLASS) */}
            <footer className="bg-black/40 backdrop-blur-xl border-t border-white/20 text-white py-10">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="font-semibold">
                        © 2025 Université Aboubekr Belkaid
                    </p>
                    <p className="text-white/70 mt-2">
                        Faculté des Sciences – Tlemcen, Algérie
                    </p>
                </div>
            </footer>
        </div>
    );
}
