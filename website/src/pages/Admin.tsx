import { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Mail, Database, ShieldCheck, Lock, Key, Activity } from 'lucide-react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

export default function Admin() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const stats = [
        { label: 'Waitlist Entries', value: '1,402', change: '+12%', icon: Users },
        { label: 'Storage Usage', value: '124GB', change: '+5%', icon: Database },
        { label: 'Admin Logs', value: '42', change: 'Clean', icon: ShieldCheck },
        { label: 'Network SLA', value: '99.9%', change: 'Stable', icon: Activity },
    ];

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col">
            <Navigation />

            {/* Admin-specific Background */}
            <div className="fixed inset-0 pointer-events-none opacity-30">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 container mx-auto px-6 pt-32 pb-20 relative z-10">
                {!isLoggedIn ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md mx-auto bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10 backdrop-blur-xl text-center shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                            <Key className="w-8 h-8 text-red-400" />
                        </div>
                        <h1 className="text-3xl font-bold mb-4 italic tracking-tight">Access Secure Shell</h1>
                        <p className="text-zinc-400 mb-10 leading-relaxed text-sm">
                            Administrative identity verification required. Connect your Hardware Security Module (HSM) or use your protocol-authorized zkLogin.
                        </p>
                        <div className="space-y-4">
                            <button
                                onClick={() => setIsLoggedIn(true)}
                                className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
                            >
                                <Lock className="w-5 h-5" />
                                zkLogin Authorize
                            </button>
                            <button className="w-full py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all">
                                Connect Hardware Key
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="space-y-12">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                        >
                            <div>
                                <div className="text-red-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Protocol Admin Access Only</div>
                                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">INTERNAL <span className="text-white/30">MANAGEMENT</span></h1>
                                <p className="text-zinc-500 font-medium">Full administrative control over protocol metadata and user contributions.</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-red-500/50 transition-all text-sm font-bold flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Review Waitlist
                                </button>
                                <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-bold flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4" />
                                    Rotate Access Keys
                                </button>
                            </div>
                        </motion.div>

                        {/* Admin Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {stats.map((stat, index) => (
                                <div key={index} className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl">
                                    <stat.icon className="w-6 h-6 text-zinc-700 mb-4" />
                                    <div className="text-3xl font-black mb-1">{stat.value}</div>
                                    <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Analysis Hub */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                        <LayoutDashboard className="w-5 h-5 text-emerald-400" />
                                        Pattern Analysis Insights
                                    </h2>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {[
                                            { title: 'Identity Verification Requests', count: '482', risk: 'Low' },
                                            { title: 'Walrus Ingress Peaks', count: '12', risk: 'Low' },
                                            { title: 'Sui Transaction Volume', count: '1.2k', risk: 'Normal' },
                                            { title: 'Unusual Access Attempts', count: '0', risk: 'Safe' }
                                        ].map((item, i) => (
                                            <div key={i} className="p-4 bg-black/40 border border-zinc-800 rounded-xl">
                                                <div className="text-xs text-zinc-500 font-bold mb-2 uppercase tracking-tighter">{item.title}</div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xl font-black">{item.count}</span>
                                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded">{item.risk}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
                                    <h2 className="text-xl font-bold mb-8">Detailed Industry Responses</h2>
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="p-4 bg-zinc-800/10 border border-zinc-800/50 rounded-xl text-sm italic text-zinc-400">
                                                "I'm worried about metadata manipulation in legal cases. We need a way to prove that the GPS coordinates weren't altered after capture..."
                                                <span className="block mt-2 text-[10px] text-zinc-600 font-bold uppercase not-italic">Ref: Legal Sector Intake #482</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8">
                                <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-red-400" />
                                    Security Audit Log
                                </h2>
                                <div className="space-y-4 font-mono text-[10px]">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 opacity-50">
                                            <span>AUTH_Z_PROTOCOL_UP</span>
                                            <span className="text-zinc-600">Jan 20, 22:45</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-8 py-3 bg-red-500/10 border border-red-500/20 text-xs font-bold rounded-xl hover:bg-red-500/20 transition-all uppercase tracking-widest text-red-400">
                                    View Detailed Logs
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

// Re-defining Layout component (Lucide fix)
// Removed conflicting local Activity component
