import { motion, useScroll, useTransform } from 'framer-motion';
import { AlertTriangle, TrendingDown, Shield } from 'lucide-react';
import { landingCopy } from '../data/copy';
import { useRef } from 'react';

export default function ProblemStatement() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const yParallax = useTransform(scrollYProgress, [0, 1], [50, -50]);
    const { problem } = landingCopy;

    return (
        <section
            id="problem"
            ref={sectionRef}
            className="py-32 md:py-48 relative z-30 overflow-hidden bg-black/40 backdrop-blur-xl border-y border-zinc-800/50"
        >
            {/* Background Aesthetic Glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        style={{ y: yParallax }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-6 font-mono text-[10px] uppercase font-bold text-red-400 tracking-widest">
                            <AlertTriangle className="w-3 h-3" />
                            System Integrity Warning
                        </div>
                        <h2 className="text-4xl md:text-7xl font-bold text-white mb-8 tracking-tighter leading-none">
                            {problem.title}
                        </h2>
                        <p className="text-xl text-zinc-400 leading-relaxed max-w-xl">
                            {problem.description}
                        </p>
                    </motion.div>

                    <div className="grid gap-6">
                        {problem.stats.map((item: any, index: number) => {
                            const Icon = index === 0 ? AlertTriangle : index === 1 ? TrendingDown : Shield;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2, duration: 0.6 }}
                                    className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl hover:border-zinc-700/50 transition-all group backdrop-blur-md relative overflow-hidden"
                                >
                                    {/* Subtle internal glow */}
                                    <div className={`absolute -right-4 -top-4 w-32 h-32 blur-[60px] opacity-20 pointer-events-none transition-opacity group-hover:opacity-40 ${index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-emerald-500'}`} />

                                    <div className="flex items-start gap-6 relative z-10">
                                        <div className={`p-4 rounded-2xl bg-zinc-900 border border-zinc-800 transition-all group-hover:scale-110 group-hover:rotate-3 ${item.color}`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <div className={`text-5xl md:text-6xl font-bold mb-2 ${item.color} tabular-nums tracking-tighter`}>
                                                {item.value}
                                            </div>
                                            <p className="text-zinc-400 font-medium text-lg leading-snug">
                                                {item.label}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
