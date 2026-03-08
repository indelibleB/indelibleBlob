import { motion } from 'framer-motion';
import { ShieldCheck, PieChart, Database, Activity, Info } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function Transparency() {

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col">
            <Navigation />

            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full" />
            </div>

            <main className="flex-1 container mx-auto px-6 pt-32 pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Activity className="w-3 h-3" />
                        Protocol Transparency v1.0
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                        TRANSPARENCY <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">HUB</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
                        Real-time, anonymized insights into the global truth ecosystem. We believe that for information to be verifiable, the system must be transparent.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-16">
                    {[
                        { label: 'Immutable Blobs', value: '0', icon: Database },
                        { label: 'Public Insights', value: '0', icon: PieChart },
                        { label: 'Protocol Health', value: '100%', icon: ShieldCheck },
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm"
                        >
                            <stat.icon className="w-8 h-8 text-emerald-400/30 mb-4" />
                            <div className="text-3xl font-black mb-1">{stat.value}</div>
                            <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Anonymized Trends */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold flex items-center gap-3">
                                <PieChart className="w-5 h-5 text-emerald-400" />
                                Collective Industry Concerns
                            </h2>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                                <Info className="w-3 h-3" />
                                Live Data Feed
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded-xl bg-black/20">
                            <Activity className="w-8 h-8 mb-4 opacity-50 animate-pulse" />
                            <p className="font-medium">System Initialized.</p>
                            <p className="text-xs opacity-60">Awaiting first public signals...</p>
                        </div>
                    </motion.div>

                    {/* Live Truth Ledger (Public) */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-8 backdrop-blur-md"
                    >
                        <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                            <Database className="w-5 h-5 text-purple-400" />
                            Global Truth Ledger
                        </h2>
                        <div className="space-y-4 font-mono text-[10px]">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-800 opacity-70">
                                <span className="text-emerald-500">GENESIS_BLOCK_INIT</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-600 italic">Now</span>
                                    <span className="text-emerald-400/80 font-bold">ONLINE</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
                            <p className="text-xs animate-pulse">Scanning for Blobs...</p>
                        </div>
                        <p className="text-[10px] text-zinc-500 mt-6 text-center italic">
                            All data is publicly auditable via the Sui blockchain and Walrus Protocol.
                        </p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
