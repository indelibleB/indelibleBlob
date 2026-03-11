import { motion } from 'framer-motion';
import { Shield, Award, Cpu, Lock } from 'lucide-react';

export default function Teepin() {
    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col pt-32 pb-20">
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 blur-[120px] rounded-full" />
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-zinc-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 container mx-auto px-6 relative z-10 w-full max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Cpu className="w-3 h-3" />
                        Hardware Attestation
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">
                        UNDERSTANDING <span className="text-white">TEEPIN</span> PROVENANCE
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
                        The indelible.Blob protocol grades the cryptographic integrity of captured media based on the hardware execution environment of the capturing device.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {/* GOLD Grade */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-zinc-900/50 border border-yellow-500/30 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden group hover:border-yellow-400/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Award className="w-32 h-32 text-yellow-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-yellow-500/20 rounded-xl">
                                    <Award className="w-6 h-6 text-yellow-400" />
                                </div>
                                <h2 className="text-3xl font-black text-yellow-400">GOLD</h2>
                            </div>
                            <h3 className="text-xl font-bold mb-4">Hardware Attested</h3>
                            <p className="text-zinc-400 mb-6 leading-relaxed">
                                Achieved when media is captured within a <strong>Trusted Execution Environment (TEE)</strong> or via dedicated secure hardware (like the Solana Seeker).
                            </p>
                            <ul className="space-y-3 text-sm text-zinc-300">
                                <li className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-yellow-500" />
                                    Sensor-level cryptographic signature.
                                </li>
                                <li className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-yellow-500" />
                                    Mathematically impossible to spoof or deepfake.
                                </li>
                                <li className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-yellow-500" />
                                    Zero reliance on software-level operating systems.
                                </li>
                            </ul>
                        </div>
                    </motion.div>

                    {/* SILVER Grade */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900/50 border border-zinc-500/30 rounded-2xl p-8 backdrop-blur-xl relative overflow-hidden group hover:border-zinc-400/50 transition-colors"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Lock className="w-32 h-32 text-zinc-300" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-zinc-500/20 rounded-xl">
                                    <Award className="w-6 h-6 text-zinc-300" />
                                </div>
                                <h2 className="text-3xl font-black text-zinc-300">SILVER</h2>
                            </div>
                            <h3 className="text-xl font-bold mb-4">Software Validated</h3>
                            <p className="text-zinc-400 mb-6 leading-relaxed">
                                Achieved when media is captured via standard smartphone operating systems (iOS/Android) using rigorous software-level runtime checks.
                            </p>
                            <ul className="space-y-3 text-sm text-zinc-300">
                                <li className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-zinc-400" />
                                    Application integrity checks verified.
                                </li>
                                <li className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-zinc-400" />
                                    Kernel-level hooks monitored for manipulation.
                                </li>
                                <li className="flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-zinc-400" />
                                    Highly secure, but relies on the host OS.
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>

                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md text-center">
                    <h3 className="text-xl font-bold mb-4">Why TEEPIN Matters</h3>
                    <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        In an era of generative AI, metadata is no longer enough. TEEPIN (Trusted Execution Environment Personal Identification Number) anchors the absolute timeline of a piece of media to physical hardware signatures, creating a permanent, undisputable record of reality.
                    </p>
                </div>
            </main>
        </div>
    );
}
