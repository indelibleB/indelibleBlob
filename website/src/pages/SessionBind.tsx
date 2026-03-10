import { motion } from 'framer-motion';
import { Link, Fingerprint, Zap } from 'lucide-react';

export default function SessionBind() {
    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col pt-32 pb-20">
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 container mx-auto px-6 relative z-10 w-full max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Link className="w-3 h-3" />
                        Hardware to Wallet
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">
                        WHAT IS <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">SESSION BIND?</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
                        Session Binding is the critical bridge between your physical device and your decentralized identity on the Sui blockchain.
                    </p>
                </motion.div>

                <div className="grid gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl flex flex-col md:flex-row gap-8 items-center"
                    >
                        <div className="w-24 h-24 shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <Fingerprint className="w-10 h-10 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-3">One Wallet, One Device.</h2>
                            <p className="text-zinc-400 leading-relaxed mb-4">
                                By binding your wallet to a specific hardware capture session, you eliminate the need to authorize the wallet for every single photo or video you take.
                            </p>
                            <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Flawless UX, Zero Popups
                            </p>
                        </div>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md"
                        >
                            <h3 className="text-xl font-bold mb-4">Frictionless Capture</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Reality moves fast. The traditional Web3 flow of signing a transaction for every action is too slow for journalism. Session Bind batches authorizations into a single, time-limited cryptographic handshake.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md"
                        >
                            <h3 className="text-xl font-bold mb-4">Proof of Witness</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                A Session Bind acts as a verifiable Proof-of-Witness. It proves mathematically that a specific cryptographic identity was physically holding a specific device at an exact moment in time.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
