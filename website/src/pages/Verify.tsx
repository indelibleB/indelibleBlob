import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Search, Upload, CheckCircle2, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function Verify() {
    const [searchParams] = useSearchParams();
    const urlId = searchParams.get('id');
    const [blobId, setBlobId] = useState(urlId || '');
    const [isVerifying, setIsVerifying] = useState(false);
    const [result, setResult] = useState<'success' | 'failure' | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (urlId) {
            setBlobId(urlId);
        }
    }, [urlId]);

    const handleVerify = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');
        if (!blobId) return;

        // Validation for Sui Object ID format (64-char hex with 0x)
        // If it isn't starting with walrus-, we assume it must be a Sui Object ID.
        if (!blobId.startsWith('walrus-') && !/^0x[a-fA-F0-9]{64}$/.test(blobId)) {
            setError("Invalid capture ID format. Must be a 64-character hex with 0x prefix or a Walrus blob ID.");
            setResult(null);
            return;
        }

        setIsVerifying(true);
        setResult(null);

        // Mock verification logic
        setTimeout(() => {
            setIsVerifying(false);
            if (blobId.startsWith('walrus-') || /^0x[a-fA-F0-9]{64}$/.test(blobId)) {
                setResult('success');
            } else {
                setResult('failure');
            }
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col">
            <Navigation />

            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full" />
            </div>

            <main className="flex-1 container mx-auto px-6 pt-32 pb-20 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Shield className="w-3 h-3" />
                        Truth Engine v1.0
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">
                        VERIFY <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">INDELIBLE PROVENANCE</span>
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto font-medium">
                        Paste a Walrus Blob ID or upload a file to verify its immutable existence and chain of custody on the Sui blockchain.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {/* Blob ID Search */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Search className="w-6 h-6 text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold">Search by ID</h2>
                            </div>
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Walrus Blob ID</label>
                                    <input
                                        type="text"
                                        placeholder="Enter walrus-... or 0x..."
                                        className={`w-full bg-black border ${error ? 'border-red-500' : 'border-zinc-700'} rounded-xl p-4 text-emerald-400 font-mono placeholder-zinc-700 focus:outline-none focus:border-emerald-500 transition-all`}
                                        value={blobId}
                                        onChange={(e) => {
                                            setBlobId(e.target.value);
                                            setError('');
                                        }}
                                    />
                                    {error && (
                                        <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isVerifying || !blobId}
                                    className="w-full py-4 bg-emerald-500 text-black font-extrabold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isVerifying ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                            Scanning Truth Ledger...
                                        </>
                                    ) : (
                                        <>
                                            Verify Integrity
                                            <Shield className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                        <p className="text-xs text-zinc-500 mt-8 italic">
                            *Verification occurs via a cryptographic handshake between the Walrus Protocol and Sui.
                        </p>
                    </motion.div>

                    {/* File Upload Verification */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl border-dashed hover:border-emerald-500/30 transition-all group flex flex-col items-center justify-center text-center cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-6 group-hover:bg-emerald-500/10 transition-colors">
                            <Upload className="w-8 h-8 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Drop File to Verify</h2>
                        <p className="text-zinc-400 mb-8 max-w-[240px]">
                            We'll extract the indelible watermark and match it to the global truth ledger.
                        </p>
                        <div className="px-6 py-2 bg-zinc-800 text-zinc-400 rounded-full text-sm font-bold group-hover:bg-zinc-700 transition-colors">
                            Select File
                        </div>
                    </motion.div>
                </div>

                {/* Verification Results */}
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-12 max-w-5xl mx-auto rounded-2xl border p-8 flex flex-col md:flex-row items-center gap-8 ${result === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                            }`}
                    >
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center shrink-0 ${result === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                            }`}>
                            {result === 'success' ? (
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            ) : (
                                <AlertTriangle className="w-10 h-10 text-red-500" />
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className={`text-2xl font-bold mb-2 ${result === 'success' ? 'text-emerald-400' : 'text-red-500'
                                }`}>
                                {result === 'success' ? 'indelible Origin Verified' : 'Integrity Check Failed'}
                            </h3>
                            <p className="text-zinc-400 text-sm mb-4">
                                {result === 'success'
                                    ? 'This content matches the hash anchored on the Sui blockchain at epoch 1402. Origin: Seeker Mobile Capture.'
                                    : 'No matching records found in the Truth Ledger. This content may have been modified or originates from an unverified source.'}
                            </p>
                            {result === 'success' && (
                                <div className="flex flex-wrap gap-4">
                                    <div className="px-4 py-2 bg-black/40 rounded-lg border border-zinc-800 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-400" />
                                        <span className="text-xs font-mono">Epoch: 1402</span>
                                    </div>
                                    <div className="px-4 py-2 bg-black/40 rounded-lg border border-zinc-800 flex items-center gap-2">
                                        <ExternalLink className="w-4 h-4 text-emerald-400" />
                                        <span className="text-xs font-mono">Sui Object: 0x82f...a1d</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {result === 'success' && (
                            <button className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10">
                                View Full Lineage
                            </button>
                        )}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
