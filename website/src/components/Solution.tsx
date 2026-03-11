import { motion, useScroll, useTransform } from 'framer-motion';
import { Database, Lock, Zap, Globe, CheckCircle2 } from 'lucide-react';
import { landingCopy } from '../data/copy';
import { useRef } from 'react';

const architecture = [
    { step: '1', title: 'Capture', desc: 'Secure capture on verified hardware' },
    { step: '2', title: 'Store', desc: 'Walrus distributes across nodes' },
    { step: '3', title: 'Anchor', desc: 'Sui records blob ID + metadata' },
    { step: '4', title: 'Signify/Verify', desc: 'Anyone can verify authenticity' },
    { step: '5', title: 'Solana', desc: "Powers Seeker hardware capture and the Truth Marketplace (Under Development, C'mon!)" },
];

export default function Solution() {
    const { solution } = landingCopy;
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], [50, -50]);

    return (
        <section
            id="solution"
            ref={sectionRef}
            className="py-32 md:py-48 relative z-40 overflow-hidden bg-zinc-950/40 backdrop-blur-xl border-y border-zinc-800/50"
        >
            {/* Background Aesthetic Glows */}
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-24"
                >
                    <h2 className="text-4xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-emerald-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent tracking-tighter">
                        {solution.title}
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        {solution.description}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
                    {solution.features.map((feature: any, index: number) => {
                        const Icon = index === 0 ? Database : index === 1 ? Lock : index === 2 ? Zap : Globe;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-8 hover:border-emerald-500/40 transition-all group backdrop-blur-md relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Icon className="w-12 h-12 text-emerald-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform" />
                                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Architecture Flow */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ y: yParallax }}
                    className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden backdrop-blur-2xl"
                >
                    {/* Subtle internal glow */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />

                    <h3 className="text-3xl md:text-5xl font-bold mb-20 text-center text-white tracking-tight">
                        The Immutable Workflow
                    </h3>

                    <div className="relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-[32px] left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 opacity-20" />

                        <div className="grid md:grid-cols-5 gap-8 relative">
                            {architecture.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.15 + 0.3, duration: 0.6 }}
                                    className="relative flex flex-col items-center text-center group"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-400 flex items-center justify-center text-2xl font-black mb-6 relative z-10 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-transform group-hover:scale-110 group-hover:-rotate-3">
                                        {item.step}
                                    </div>
                                    <h4 className="text-2xl font-bold mb-3 text-white group-hover:text-emerald-400 transition-colors">{item.title}</h4>
                                    <p className="text-zinc-400 font-medium leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="mt-20 pt-12 border-t border-zinc-800/50"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-6 max-w-3xl mx-auto text-center md:text-left">
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold mb-2 text-white">Permanent Digital Truth</h4>
                                <p className="text-zinc-400 leading-relaxed">
                                    Every verification event is anchored to the Sui blockchain and stored permanently on Walrus.
                                    The result is a globally accessible, tamper-proof record of authenticity.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
