import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { sources } from '../data/sources';
import { useState, useRef, useEffect } from 'react';

export default function Sources() {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const nextSource = () => {
        setActiveIndex((prev) => (prev + 1) % sources.length);
    };

    const prevSource = () => {
        setActiveIndex((prev) => (prev - 1 + sources.length) % sources.length);
    };

    // Auto-advance logic for a "flywheel" feel
    useEffect(() => {
        const timer = setInterval(nextSource, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section id="sources" className="py-24 bg-zinc-950/40 backdrop-blur-xl border-t border-zinc-800/50 relative z-40 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                            The Truth Ledger
                        </h2>
                    </div>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        Scrutinized, referenced, and immutable metadata grounding every claim in peer-reviewed reality.
                    </p>
                </motion.div>

                {/* 3D Flywheel Area */}
                <div className="relative height-[500px] flex items-center justify-center perspective-[1000px] py-20" ref={containerRef}>
                    <div className="relative w-full max-w-5xl h-[400px] flex items-center justify-center">
                        <AnimatePresence mode="popLayout">
                            {sources.map((source, index) => {
                                // Calculate position relative to active index for circular layout
                                let offset = index - activeIndex;
                                if (offset < -Math.floor(sources.length / 2)) offset += sources.length;
                                if (offset > Math.floor(sources.length / 2)) offset -= sources.length;

                                const isActive = offset === 0;
                                const isVisible = Math.abs(offset) <= 2;

                                if (!isVisible) return null;

                                return (
                                    <motion.div
                                        key={source.id}
                                        initial={{ opacity: 0, scale: 0.8, x: offset * 300, z: -200 }}
                                        animate={{
                                            opacity: 1 - Math.abs(offset) * 0.3,
                                            scale: isActive ? 1.05 : 0.85 - Math.abs(offset) * 0.1,
                                            x: offset * 320,
                                            z: isActive ? 100 : -100 * Math.abs(offset),
                                            rotateY: offset * -25,
                                            zIndex: 10 - Math.abs(offset),
                                        }}
                                        exit={{ opacity: 0, scale: 0.5, z: -300 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 260,
                                            damping: 20,
                                            opacity: { duration: 0.2 }
                                        }}
                                        className={`absolute w-full max-w-md bg-zinc-900/80 backdrop-blur-2xl border ${isActive ? 'border-emerald-500/50 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]' : 'border-zinc-800'} rounded-2xl p-8 cursor-pointer group transition-all duration-500`}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <div className="flex items-start justify-between mb-6">
                                            <span className={`text-[10px] font-mono px-3 py-1 rounded-full transition-colors ${isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                VERIFIED SOURCE #{source.id}
                                            </span>
                                            <span className="text-xs text-zinc-500 font-mono italic">{source.year}</span>
                                        </div>

                                        <h3 className={`text-xl font-bold mb-4 leading-tight transition-colors ${isActive ? 'text-white' : 'text-zinc-400'} group-hover:text-emerald-400`}>
                                            {source.title}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-[0.2em]">
                                                {source.source}
                                            </p>
                                        </div>

                                        <div className="relative mb-6">
                                            <p className={`text-sm italic leading-relaxed pl-4 border-l-2 ${isActive ? 'border-emerald-500 text-zinc-300' : 'border-zinc-700 text-zinc-500'} group-hover:border-emerald-400 transition-colors`}>
                                                "{source.note}"
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <a
                                                href={source.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-emerald-400 font-bold hover:text-emerald-300 transition-all group/link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Verify Claim
                                                <ExternalLink className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                            </a>

                                            {isActive && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Navigation Overlays */}
                    <div className="absolute inset-x-0 flex justify-between items-center pointer-events-none px-4 md:px-20">
                        <button
                            onClick={prevSource}
                            className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all pointer-events-auto backdrop-blur-md"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextSource}
                            className="p-4 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all pointer-events-auto backdrop-blur-md"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    {sources.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            className={`h-1 transition-all duration-300 rounded-full ${i === activeIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-zinc-800 hover:bg-zinc-700'}`}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mt-20 text-center"
                >
                    <div className="p-8 bg-zinc-900/20 border border-emerald-500/5 rounded-2xl max-w-4xl mx-auto backdrop-blur-sm">
                        <p className="text-[11px] text-zinc-500 uppercase tracking-widest mb-2 font-bold">Bottom-Up Market Validation</p>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Total projections represent a tiered adoption scale starting from the Pacific Northwest (PNW) and expanding globally.
                            Our models account for <span className="text-emerald-400/80">5.56B internet users</span> and a growing <span className="text-emerald-400/80">$8.5B 3D verification market</span>.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Background Aesthetic Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
            <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
        </section>
    );
}
