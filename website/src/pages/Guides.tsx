import { motion } from 'framer-motion';
import { Shield, Award, Cpu, Lock, Link as LinkIcon, Fingerprint, Zap, EyeOff, Key } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function Guides() {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname.replace('/', '');
        if (path && path !== 'guides') {
            const element = document.getElementById(path);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location]);

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col pt-32 pb-20">
            {/* Common Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 container mx-auto px-6 relative z-10 w-full max-w-4xl space-y-32">

                {/* TEEPIN SECTION */}
                <section id="teepin" className="scroll-mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <Cpu className="w-3 h-3" />
                            Hardware Attestation
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">
                            UNDERSTANDING <span className="text-white">TEEPIN</span> PROVENANCE
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
                            The indelible.Blob protocol grades the cryptographic integrity of captured media based on the hardware execution environment of the capturing device.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* GOLD Grade */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
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
                                    <h3 className="text-3xl font-black text-yellow-400">GOLD</h3>
                                </div>
                                <h4 className="text-xl font-bold mb-4">Hardware Attested</h4>
                                <p className="text-zinc-400 mb-6 leading-relaxed">
                                    Achieved when media is captured within a <strong>Trusted Execution Environment (TEE)</strong> or via dedicated secure hardware (like the Solana Seeker).
                                </p>
                                <ul className="space-y-3 text-sm text-zinc-300">
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-500" />Sensor-level cryptographic signature.</li>
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-500" />Mathematically impossible to spoof or deepfake.</li>
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-yellow-500" />Zero reliance on software-level operating systems.</li>
                                </ul>
                            </div>
                        </motion.div>

                        {/* SILVER Grade */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
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
                                    <h3 className="text-3xl font-black text-zinc-300">SILVER</h3>
                                </div>
                                <h4 className="text-xl font-bold mb-4">Software Validated</h4>
                                <p className="text-zinc-400 mb-6 leading-relaxed">
                                    Achieved when media is captured via standard smartphone operating systems (iOS/Android) using rigorous software-level runtime checks.
                                </p>
                                <ul className="space-y-3 text-sm text-zinc-300">
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-zinc-400" />Application integrity checks verified.</li>
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-zinc-400" />Kernel-level hooks monitored for manipulation.</li>
                                    <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-zinc-400" />Highly secure, but relies on the host OS.</li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>

                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md text-center">
                        <h4 className="text-xl font-bold mb-4">Why TEEPIN Matters</h4>
                        <p className="text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                            In an era of generative AI, metadata is no longer enough. TEEPIN (Trusted Execution Environment Personal Identification Number) anchors the absolute timeline of a piece of media to physical hardware signatures, creating a permanent, undisputable record of reality.
                        </p>
                    </div>
                </section>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

                {/* SESSION BIND SECTION */}
                <section id="session-bind-guide" className="scroll-mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <LinkIcon className="w-3 h-3" />
                            Hardware to Wallet
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">
                            WHAT IS <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">SESSION BIND?</span>
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
                            Session Binding is the critical bridge between your physical device and your decentralized identity on the Sui blockchain.
                        </p>
                    </motion.div>

                    <div className="grid gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl flex flex-col md:flex-row gap-8 items-center"
                        >
                            <div className="w-24 h-24 shrink-0 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                <Fingerprint className="w-10 h-10 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-3">One Wallet, One Device.</h3>
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
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md"
                            >
                                <h4 className="text-xl font-bold mb-4">Frictionless Capture</h4>
                                <p className="text-zinc-400 leading-relaxed">
                                    Reality moves fast. The traditional Web3 flow of signing a transaction for every action is too slow. Session Bind batches authorizations into a single, time-limited cryptographic handshake.
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md"
                            >
                                <h4 className="text-xl font-bold mb-4">Proof of Witness</h4>
                                <p className="text-zinc-400 leading-relaxed">
                                    A Session Bind acts as a verifiable Proof-of-Witness. It proves mathematically that a specific cryptographic identity was physically holding a specific device at an exact moment in time.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Divider */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

                {/* SOVEREIGN MODE SECTION */}
                <section id="sovereign-guide" className="scroll-mt-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <EyeOff className="w-3 h-3" />
                            Maximum Privacy
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">
                            SOVEREIGN <span className="text-white">ENCRYPTED MODE (🧿)</span>
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
                            Protecting journalists, activists, and creators in hostile environments. Sovereign Mode guarantees that your captures are seen only by you, until you choose otherwise.
                        </p>
                    </motion.div>

                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-black/60 border border-red-500/30 rounded-2xl p-8 md:p-12 backdrop-blur-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Shield className="w-48 h-48 text-red-500" />
                            </div>

                            <div className="relative z-10 max-w-2xl">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-red-400" />
                                    Secured by the Seal Protocol
                                </h3>
                                <p className="text-zinc-300 leading-relaxed mb-8">
                                    Entering Sovereign Mode activates local device encryption (AES-GCM). Your media is encrypted on-device the millisecond it hits the sensor, before it is ever written to storage or uploaded.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div className="bg-zinc-900/80 p-6 rounded-xl border border-zinc-800">
                                        <Key className="w-6 h-6 text-purple-400 mb-3" />
                                        <h4 className="font-bold mb-2">You Hold the Keys</h4>
                                        <p className="text-sm text-zinc-400">
                                            The encryption keys are derived directly from your connected Web3 wallet. Without your wallet signature, the data is computationally impossible to decrypt.
                                        </p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-6 rounded-xl border border-zinc-800">
                                        <EyeOff className="w-6 h-6 text-cyan-400 mb-3" />
                                        <h4 className="font-bold mb-2">Zero Knowledge</h4>
                                        <p className="text-sm text-zinc-400">
                                            Even if the decentralized storage layer (Walrus) is completely compromised, the attackers only receive unintelligible cipher-text blocks.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8 backdrop-blur-md text-center">
                            <p className="text-zinc-400 max-w-2xl mx-auto italic text-sm">
                                "The right to record truth must be paired with the right to protect the person recording it."
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
