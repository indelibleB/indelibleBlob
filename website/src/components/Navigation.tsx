import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Menu, X } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ConnectButton } from '@mysten/dapp-kit';

const navItems = [
    { label: 'Problem', href: '#problem', isAnchor: true },
    { label: 'Solution', href: '#solution', isAnchor: true },
    { label: 'Research', href: '/research', isInternal: true },
    { label: 'Verify', href: '/verify', isInternal: true },
    { label: 'Survey', href: '/survey', isInternal: true },
    { label: 'Transparency', href: '/transparency', isInternal: true },
    { label: 'Guides', href: '/guides', isInternal: true },
];

export default function Navigation() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const scrollToSection = (sectionId: string) => {
        const id = sectionId.replace('#', '');
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-lg border-b border-zinc-800' : 'bg-transparent'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between py-4">
                <Link
                    to="/"
                    className="flex items-center gap-2"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <img src="/branding/emoji_size_blob_icon.png" alt="" className="w-8 h-8 rounded-lg" />
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        indelible.Blob
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        item.isAnchor ? (
                            <button
                                key={item.href}
                                onClick={() => scrollToSection(item.href)}
                                className="text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer bg-transparent border-none"
                            >
                                {item.label}
                            </button>
                        ) : item.isInternal ? (
                            <Link
                                key={item.href}
                                to={item.href}
                                className="text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-gray-400 hover:text-emerald-400 transition-colors"
                            >
                                {item.label}
                            </a>
                        )
                    ))}
                    <button
                        className="flex items-center gap-2 px-4 py-2 border border-emerald-500/50 text-emerald-400 rounded-lg text-sm font-semibold hover:bg-emerald-500/10 transition-all"
                        onClick={() => window.open('https://calendly.com/indelible-blob-proton/30min', '_blank')}
                    >
                        <Calendar className="w-4 h-4" />
                        Book Call
                    </button>
                    <div className="flex items-center gap-4 border-l border-zinc-800 pl-6 ml-2">
                        {/* Sui Wallet */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] uppercase font-bold text-cyan-500/80 tracking-widest">Sui</span>
                            <ConnectButton className="!bg-cyan-500/10 !text-cyan-400 !font-bold !rounded-full !h-9 !px-4 hover:!bg-cyan-500/20 transition-all text-xs border border-cyan-500/50" />
                        </div>

                        {/* Solana Wallet */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] uppercase font-bold text-purple-500/80 tracking-widest">Solana</span>
                            <WalletMultiButton className="!bg-zinc-900 !border !border-purple-500/30 !text-white !font-bold !rounded-full !h-9 !px-4 hover:!bg-purple-900/20 hover:!border-purple-500/60 transition-all text-sm" />
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-zinc-900 border-b border-zinc-800"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navItems.map((item) => (
                                item.isAnchor ? (
                                    <button
                                        key={item.href}
                                        onClick={() => { scrollToSection(item.href); setMobileMenuOpen(false); }}
                                        className="text-lg font-medium text-gray-400 hover:text-emerald-400 transition-colors text-left bg-transparent border-none cursor-pointer"
                                    >
                                        {item.label}
                                    </button>
                                ) : item.isInternal ? (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        className="text-lg font-medium text-gray-400 hover:text-emerald-400 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="text-lg font-medium text-gray-400 hover:text-emerald-400 transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </a>
                                )
                            ))}
                            <button
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-black rounded-lg font-bold"
                                onClick={() => {
                                    window.open('https://calendly.com/indelible-blob-proton/30min', '_blank');
                                    setMobileMenuOpen(false);
                                }}
                            >
                                <Calendar className="w-5 h-5" />
                                Book Discovery Call
                            </button>
                            <div className="flex flex-col gap-4 pt-4 border-t border-zinc-800">
                                <div>
                                    <span className="block text-center text-xs text-cyan-500 font-bold uppercase mb-2">Connect Sui</span>
                                    <ConnectButton className="!bg-cyan-500/10 !text-cyan-400 !border !border-cyan-500/50 !w-full !justify-center" />
                                </div>
                                <div>
                                    <span className="block text-center text-xs text-purple-500 font-bold uppercase mb-2">Connect Solana</span>
                                    <WalletMultiButton className="!bg-emerald-500/10 !text-emerald-400 !border !border-emerald-500/50 !w-full !justify-center" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
