import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck, Database, Users } from 'lucide-react';
import Sources from '../components/Sources';

export default function Research() {
    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col pt-32 pb-20">
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[150px] rounded-full" />
            </div>

            <main className="flex-1 container mx-auto px-6 relative z-10 w-full max-w-5xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <BookOpen className="w-3 h-3" />
                        Research Initiatives
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                        HELP US BUILD A <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">FAIRER CREATOR ECONOMY</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-3xl mx-auto font-medium">
                        The Indelible Blob protocol is actively studying the mechanics of sovereign ownership. By participating, you help us design better, community-directed economic models.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <BookOpen className="w-6 h-6 text-cyan-400" />
                            Research Objectives
                        </h2>
                        <ul className="space-y-4 text-zinc-300">
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                                <span><strong className="text-white">Revenue Distribution:</strong> Analyzing fair splits between creators and distribution networks.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                                <span><strong className="text-white">Preferences Over Time:</strong> Studying how creator needs evolve as their audiences grow.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                                <span><strong className="text-white">Community-Directed Models:</strong> Testing the viability of decentralized governance and IP control.</span>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                            Privacy & Ethics Guarantee
                        </h2>
                        <ul className="space-y-4 text-zinc-300">
                            <li className="flex items-start gap-3">
                                <Database className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-white block">Data Usage</strong>
                                    Contributed data is utilized exclusively for public datasets and the open Transparency Dashboard.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-white block">Strict Anonymization</strong>
                                    Data is fully anonymized. We enforce a strict <span className="text-emerald-400 font-bold">1000-creator minimum aggregation</span> before any trends are published to ensure individual privacy.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-white block">Voluntary Participation</strong>
                                    Your participation is actively opt-in, non-coercive, and can be withdrawn from the protocol at any time.
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </main>

            <div className="w-full bg-black/50 border-t border-zinc-900 pt-16 mt-auto relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <div className="text-center mb-12 px-6">
                    <h2 className="text-3xl font-bold mb-4">Foundation of Truth</h2>
                    <p className="text-zinc-400">The academic and technical research powering the Indelible Blob protocol.</p>
                </div>
                <div className="pb-12 text-center">
                    <Sources />
                </div>
            </div>
        </div>
    );
}
