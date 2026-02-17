import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import * as THREE from 'three';
import { Calendar, ArrowRight } from 'lucide-react';
import { landingCopy } from '../data/copy';

function InteractiveBlob({ scrollYProgress }: { scrollYProgress: any }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<any>(null);

    const scale = useTransform(scrollYProgress, [0, 0.5, 1], [2.5, 4, 1.5]);
    const positionY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -2, 2]);
    const positionX = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [2, -3, 3, 0]);
    const distort = useTransform(scrollYProgress, [0, 0.5, 1], [0.4, 0.8, 0.2]);
    const speed = useTransform(scrollYProgress, [0, 0.5, 1], [2, 5, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.8, 1], [0.9, 0.4, 0.2, 0.4, 0.9]);

    const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });
    const smoothY = useSpring(positionY, { stiffness: 100, damping: 30 });
    const smoothX = useSpring(positionX, { stiffness: 100, damping: 30 });
    const smoothOpacity = useSpring(opacity, { stiffness: 100, damping: 30 });

    useFrame(() => {
        if (!meshRef.current) return;
        meshRef.current.position.y = smoothY.get();
        meshRef.current.position.x = smoothX.get();
        meshRef.current.scale.setScalar(smoothScale.get());
        if (materialRef.current) materialRef.current.opacity = smoothOpacity.get();
        meshRef.current.rotation.x += 0.001;
        meshRef.current.rotation.y += 0.002;
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 128, 128]} />
                <MeshDistortMaterial
                    ref={materialRef}
                    color="#14F195"
                    emissive="#9945FF"
                    emissiveIntensity={0.5}
                    attach="material"
                    distort={distort.get() as any}
                    speed={speed.get() as any}
                    roughness={0.1}
                    metalness={0.9}
                    transparent={true}
                />
            </mesh>
        </Float>
    );
}

export default function BlobHero() {
    const { scrollYProgress } = useScroll();
    const { hero } = landingCopy;

    return (
        <div className="relative min-h-[120vh] flex items-center overflow-hidden bg-black text-white">
            <div className="fixed inset-0 pointer-events-none z-0">
                <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <pointLight position={[-10, -10, -5]} intensity={0.5} color="#14F195" />
                    <InteractiveBlob scrollYProgress={scrollYProgress} />
                </Canvas>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(20,241,149,0.05)_0%,_transparent_70%)] pointer-events-none" />
            </div>

            <div className="container mx-auto px-6 relative z-40 py-20 pointer-events-none">
                <div className="max-w-3xl pointer-events-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            {hero.badge}
                        </motion.div>

                        <motion.h1
                            initial="hidden"
                            animate="visible"
                            className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tighter"
                        >
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                transition={{ duration: 0.8 }}
                                className="mb-4"
                            >
                                {hero.title}
                            </motion.div>
                            <motion.div
                                variants={{
                                    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.4 } },
                                }}
                                className="flex flex-wrap gap-x-[0.15em]"
                            >
                                {hero.titleGradient.split("").map((char, index) => (char === " " ? (
                                    <span key={index} className="w-[0.2em]">&nbsp;</span>
                                ) : (
                                    <motion.span
                                        key={index}
                                        variants={{
                                            hidden: { y: 60, opacity: 0, scale: 0.8 },
                                            visible: {
                                                y: 0, opacity: 1, scale: 1,
                                                transition: { type: "spring", damping: 10, stiffness: 100 }
                                            }
                                        }}
                                        className="inline-block bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent"
                                    >
                                        {char}
                                    </motion.span>
                                )))}
                            </motion.div>
                        </motion.h1>

                        <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-xl leading-relaxed">
                            {hero.description}
                        </p>

                        <div className="flex flex-wrap gap-6 items-center pt-4 relative z-50">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = '/survey';
                                }}
                                className="group px-8 py-4 bg-emerald-500 text-black rounded-full font-bold text-lg hover:bg-white transition-all flex items-center gap-2 shadow-2xl shadow-emerald-500/20 cursor-pointer relative z-[60] pointer-events-auto"
                            >
                                {hero.ctaSurvey}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                className="text-emerald-400 font-bold hover:text-white transition-colors flex items-center gap-2 cursor-pointer relative z-[60] pointer-events-auto"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    window.open('https://calendly.com/indelible-blob-proton/30min', '_blank');
                                }}
                            >
                                <Calendar className="w-5 h-5" />
                                {hero.ctaCall}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.6 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10"
            >
                <div className="flex flex-col items-center gap-4">
                    <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-[0.2em]">Begin Exploration</span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-5 h-8 border-2 border-emerald-500/30 rounded-full flex justify-center p-1"
                    >
                        <div className="w-1 h-2 bg-emerald-500 rounded-full" />
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
