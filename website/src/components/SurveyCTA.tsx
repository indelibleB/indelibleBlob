import { motion, useScroll, useTransform } from 'framer-motion';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import { useRef } from 'react';

export default function SurveyCTA() {
    const sectionRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

    return (
        <section
            id="survey"
            ref={sectionRef}
            className="py-32 md:py-48 relative overflow-hidden bg-zinc-950/40 backdrop-blur-xl border-t border-zinc-800/50 z-40"
        >
            {/* Background aesthetic glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    style={{ scale }}
                    className="max-w-5xl mx-auto bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-12 md:p-20 text-center backdrop-blur-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-400 to-purple-500 opacity-50" />

                    {/* Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        viewport={{ once: true }}
                        className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-10 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                    >
                        <MessageSquare className="w-12 h-12 text-emerald-400" />
                    </motion.div>

                    {/* Heading */}
                    <h2 className="text-4xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-emerald-400 via-cyan-300 to-emerald-500 bg-clip-text text-transparent tracking-tighter leading-none">
                        Shape the Infrastructure of Truth
                    </h2>

                    {/* Description */}
                    <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                        Your insights will directly influence the development of decentralized verification for high-stakes media.
                    </p>

                    {/* Benefits list */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16 text-center">
                        <div className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm group hover:border-emerald-500/30 transition-all">
                            <div className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4" /> 2 Minutes
                            </div>
                            <p className="text-zinc-400 font-bold text-lg leading-tight">Quick, respectful participation.</p>
                        </div>
                        <div className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm group hover:border-emerald-500/30 transition-all">
                            <div className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-4">Beta Protocol</div>
                            <p className="text-zinc-400 font-bold text-lg leading-tight">Priority access to the Truth Engine.</p>
                        </div>
                        <div className="p-8 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm group hover:border-emerald-500/30 transition-all">
                            <div className="text-emerald-400 font-black text-xs uppercase tracking-widest mb-4">Direct Influence</div>
                            <p className="text-zinc-400 font-bold text-lg leading-tight">Shape the Indelible roadmap.</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <button
                            className="group relative inline-flex items-center px-12 py-6 bg-emerald-500 text-black text-xl font-black rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:shadow-[0_25px_50px_rgba(16,185,129,0.4)]"
                            onClick={() => window.location.href = '/survey'}
                        >
                            Take the Truth Survey
                            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </motion.div>

                    {/* Sovereign Data Note */}
                    <div className="mt-12 flex items-center justify-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest">
                        <Lock className="w-3 h-3" /> Zero-Party Data Sovereignty Guaranteed
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
import { Lock } from 'lucide-react';
