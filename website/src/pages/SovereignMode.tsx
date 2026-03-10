import { motion } from 'framer-motion';
import { EyeOff, Shield, Key } from 'lucide-react';

export default function SovereignMode() {
    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col pt-32 pb-20">
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/10 blur-[130px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[130px] rounded-full" />
            </div>

            <main className="flex-1 container mx-auto px-6 relative z-10 w-full max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <EyeOff className="w-3 h-3" />
                        Maximum Privacy
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter">
                        SOVEREIGN <span className="text-white">ENCRYPTED MODE (🧿)</span>
                    </h1>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
                        Protecting journalists, activists, and creators in hostile environments. Sovereign Mode guarantees that your captures are seen only by you, until you choose otherwise.
                    </p>
                </motion.div>

                <div className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black/60 border border-red-500/30 rounded-2xl p-8 md:p-12 backdrop-blur-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Shield className="w-48 h-48 text-red-500" />
                        </div>

                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                <Shield className="w-6 h-6 text-red-400" />
                                Secured by the Seal Protocol (Walrus)
                            </h2>
                            <p className="text-zinc-300 leading-relaxed mb-8">
                                Entering Sovereign Mode activates military-grade local device encryption (AES-GCM). Your media is encrypted on-device the millisecond it hits the sensor, before it is ever written to storage or uploaded.
                            </p>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="bg-zinc-900/80 p-6 rounded-xl border border-zinc-800">
                                    <Key className="w-6 h-6 text-purple-400 mb-3" />
                                    <h3 className="font-bold mb-2">You Hold the Keys</h3>
                                    <p className="text-sm text-zinc-400">
                                        The encryption keys are derived directly from your connected Web3 wallet. Without your wallet signature, the data is computationally impossible to decrypt.
                                    </p>
                                </div>
                                <div className="bg-zinc-900/80 p-6 rounded-xl border border-zinc-800">
                                    <EyeOff className="w-6 h-6 text-cyan-400 mb-3" />
                                    <h3 className="font-bold mb-2">Zero Knowledge</h3>
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
            </main>
        </div>
    );
}
