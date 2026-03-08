import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, ChevronLeft, Send, Sparkles, Globe, Lock } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import Navigation from '../components/Navigation';
import { SealService } from '../services/SealService';

type Industry = 'Journalism' | 'Legal' | 'Photography' | 'VFX' | 'Construction' | 'Enterprise' | 'Social' | 'Government';

interface Question {
    id: string;
    text: string;
    placeholder: string;
}

const industryQuestions: Record<Industry, Question[]> = {
    Journalism: [
        { id: 'q1', text: 'Describe your piece of the news gathering and publishing workflow.', placeholder: 'From source capture to final edit...' },
        { id: 'q2', text: 'How do you currently verify submitted imagery or source materials, citizen-submitted or otherwise?', placeholder: 'Manual checks, metadata analysis, reverse image search...' },
        { id: 'q3', text: 'Tell us about a time a deepfake or manipulated image affected your workflow.', placeholder: 'Almost made it to print/air' },
        { id: 'q4', text: 'What is the cost of a retraction due to unverified content in your organization?', placeholder: 'Legal costs, reputation loss, viewership impact...' },
        { id: 'q5', text: 'How has AI skepticism changed the way you interact with sources?', placeholder: 'Increased friction, extra verification steps...' },
        { id: 'q6', text: 'If you could prove and/or depend upon the "Source of Truth" instantly for any media, how would that change news-cycles?', placeholder: 'Is this an option currently?' }
    ],
    Legal: [
        { id: 'q1', text: 'How is digital evidence typically authenticated in your practice today?', placeholder: 'Chain of custody documentation, expert testimony...' },
        { id: 'q2', text: 'What are the main vulnerabilities in current digital evidence standards?', placeholder: 'Metadata stripping, timestamp manipulation...' },
        { id: 'q3', text: 'How much does "Expert Verification" of digital assets typically cost per file?', placeholder: 'Hours spent, laboratory fees...' },
        { id: 'q4', text: 'Describe a case where "Deepfake" or AI evidence was introduced or suspected.', placeholder: 'How was it handled by the court?' },
        { id: 'q5', text: 'What specific metadata is critical for evidence that current platforms often lose?', placeholder: 'GPS, exact capture device signatures, original hashes...' },
        { id: 'q6', text: 'How would Immutable Proof of Presence change the landscape of digital forensics?', placeholder: 'Streamlined discovery, irrefutable evidence...' }
    ],
    Photography: [
        { id: 'q1', text: 'How do you currently protect your original RAW files and ownership?', placeholder: 'Watermarks, local backups, proprietary software...' },
        { id: 'q2', text: 'What is the biggest challenge in proving you are the original creator of a viral image?', placeholder: 'Copyright theft, social media compression stripping data...' },
        { id: 'q3', text: 'How has the rise of "Photo-realistic" AI impacted your rates or client trust?', placeholder: 'Market saturation, need to prove "Human-taken"...' },
        { id: 'q4', text: 'Have you ever had an image stolen and used in a commercial context without credit?', placeholder: 'How did you find out? How did you react?' },
        { id: 'q5', text: 'What verification tool would make you feel 100% secure in sharing your work online?', placeholder: 'On-chain signing, permanent attribution...' },
        { id: 'q6', text: 'Describe how you envision a "Truth Marketplace" serving professional photographers.', placeholder: 'Direct sales, royalties, verified licenses...' }
    ],
    VFX: [
        { id: 'q1', text: 'Where does "Authenticity" fit into a workflow that is 100% digital manipulation?', placeholder: 'Distinguishing between aesthetic edit and factual manipulation...' },
        { id: 'q2', text: 'How do you track the "Chain of Custody" for multi-studio film assets?', placeholder: 'Version control, shared servers, manual logs...' },
        { id: 'q3', text: 'What percentage of your work is spent fixing "un-verifiable" source materials?', placeholder: 'Reshooting due to low quality or unknown origin...' },
        { id: 'q4', text: 'How could a "Truth Certificate" protect VFX artists from having their work trained on by AI?', placeholder: 'IP protection, verified data lineage...' },
        { id: 'q5', text: 'What is the "Holy Grail" of asset tracking for the entertainment industry?', placeholder: 'Global Registry of Authenticity...' },
        { id: 'q6', text: 'How would you differentiate "Artistic Intent" from "Malicious Deepfakes"?', placeholder: 'Signature layering, intent metadata...' }
    ],
    Construction: [
        { id: 'q1', text: 'How much of your project management relies on photo/video documentation?', placeholder: 'Daily progress logs, inspections, dispute resolution...' },
        { id: 'q2', text: 'Describe a time a planned v. installed dispute led to a delay or legal cost on a job site.', placeholder: 'Insurance claims, contractor disagreements...' },
        { id: 'q3', text: 'How do you verify the exact time/location of "Proof of Progress" photos with what level of accuracy?', placeholder: 'Timestamps, GPS metadata (if not stripped)...' },
        { id: 'q4', text: 'What would the value be of "Undisputable Progressive Truth" for real-time positioning & install verifications?', placeholder: 'Cost savings, reduced liability...' },
        { id: 'q5', text: 'How do you handle visual documentation for distributed teams across many sites?', placeholder: 'Cloud storage, messaging apps, manual reporting...' },
        { id: 'q6', text: 'How could Indelible Blobs streamline the "Final Handover" of a building?', placeholder: 'Historical truth record, transparent build-log...' }
    ],
    Enterprise: [
        { id: 'q1', text: 'What is your organization\'s biggest concern regarding corporate deepfakes?', placeholder: 'CEO fraud, brand reputation, internal communication leaks...' },
        { id: 'q2', text: 'How are internal "Company Truth" announcements verified by employees today?', placeholder: 'Company email, intranet, word of mouth...' },
        { id: 'q3', text: 'Describe your current costs for "Brand Protection" and monitoring online misinformation.', placeholder: 'Agencies, software tools, man-hours...' },
        { id: 'q4', text: 'How could a "Corporate Seal of Truth" on video/audio save your legal team time?', placeholder: 'Reduced fraud, instant verification of executive comms...' },
        { id: 'q5', text: 'What is the main barrier to adopting blockchain-based verification in your workflow?', placeholder: 'Complexity, onboarding, technical overhead...' },
        { id: 'q6', text: 'If every corporate asset was "Indelible," how much market capital could be protected?', placeholder: 'Percentage of brand value, fraud prevention...' }
    ],
    Social: [
        { id: 'q1', text: 'As a creator, how often do you have to verify your identity or content origin?', placeholder: 'Blue checkmarks, linking to other accounts...' },
        { id: 'q2', text: 'How do you handle rumors or accusations of "Faking" content for clout?', placeholder: 'Posting raw clips, behind-the-scenes, explainers...' },
        { id: 'q3', text: 'What percentage of your engagement comes from "Viral Content" vs "Original Thought"?', placeholder: 'Impact of algorithm on truth vs clickbait...' },
        { id: 'q4', text: 'How would a "Verified Origin" badge change your partnership negotiations with brands?', placeholder: 'Premium for authentic eyes, guaranteed genuine content...' },
        { id: 'q5', text: 'Describe the impact of 1:1 Deepfakes on your revenue or personal brand.', placeholder: 'Identity theft, scam accounts, loss of control...' },
        { id: 'q6', text: 'What is the future of "Social Truth"?', placeholder: 'Decentralized identity, peer-to-peer verification...' }
    ],
    Government: [
        { id: 'q1', text: 'How are public service announcements (PSAs) verified as official by the public?', placeholder: 'Official channels, verified social media handles...' },
        { id: 'q2', text: 'What is the national security risk of un-verifiable "State Level" deepfakes?', placeholder: 'Disinformation, election interference, public panic...' },
        { id: 'q3', text: 'Describe current protocols for archiving historical government media.', placeholder: 'Centralized archives, digital preservation standards...' },
        { id: 'q4', text: 'How could Indelible infrastructure help in "Crisis Communication"?', placeholder: 'Real-time verified alerts, irrefutable public safety info...' },
        { id: 'q5', text: 'What is the role of "Transparency" in government-citizen trust today?', placeholder: 'Open data initiatives, FOIA requests...' },
        { id: 'q6', text: 'How would on-chain "Source of Truth" change public policy on misinformation?', placeholder: 'Protocol-level regulation, clear attribution requirements...' }
    ]
};

export default function Survey() {
    const [industry, setIndustry] = useState<Industry | null>(null);
    const [hasConsented, setHasConsented] = useState(false); // Controls flow (Proceed button clicked)
    const [consentChecked, setConsentChecked] = useState(false); // Controls checkbox UI
    const [step, setStep] = useState(0);
    const [responses, setResponses] = useState<Record<string, string>>({});
    const [email, setEmail] = useState('');
    const { connected: solanaConnected } = useWallet();
    const currentAccount = useCurrentAccount();
    const connected = solanaConnected || !!currentAccount;
    const [submissionMode, setSubmissionMode] = useState<'public' | 'private' | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const industries: Industry[] = ['Journalism', 'Legal', 'Photography', 'VFX', 'Construction', 'Enterprise', 'Social', 'Government'];

    const questions = industry ? industryQuestions[industry] : [];

    const handleNext = () => {
        if (step < questions.length) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            setIndustry(null);
        }
    };

    const handleResponseChange = (id: string, value: string) => {
        setResponses(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // DUAL RAIL STRATEGY
        if (submissionMode === 'private') {
            if (!connected) {
                alert("Please connect your wallet (Top Right) to use Sovereign Mode.");
                return;
            }

            try {
                console.log("Initiating Sovereign Seal Encryption...");
                const sealService = SealService.getInstance();

                // We encrypt the survey data using the email or wallet as the authorized identity
                const surveyData = JSON.stringify({
                    industry,
                    responses,
                    email,
                    timestamp: new Date().toISOString()
                });

                // Use email as identity for the demo, or wallet.toString()
                await sealService.encrypt(surveyData, email);

                setSubmitted(true);
            } catch (error) {
                console.error("Sovereign submission failed:", error);
                alert("Encryption Layer encountered an error. Please try again.");
            }
            return;
        }

        // Public / Formspree Path
        try {
            const response = await fetch("https://formspree.io/f/mpqpwlzk", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    industry,
                    responses,
                    consent: hasConsented
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setSubmitted(true);
            } else {
                alert("Submission failed. Please try again.");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("Network error. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white relative flex flex-col">
            <Navigation />

            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full" />
            </div>

            <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-6 relative z-10">
                <div className="max-w-3xl w-full">
                    {!industry ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 backdrop-blur-xl"
                        >
                            <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                                Join the Truth Engine
                            </h1>
                            <p className="text-lg text-gray-400 mb-10">
                                To build the future of verification, we need to understand your industry's specific challenges. Choose your sector to begin.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {industries.map((ind) => (
                                    <button
                                        key={ind}
                                        onClick={() => setIndustry(ind)}
                                        className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-sm font-semibold group flex flex-col items-center gap-3 text-center"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        {ind}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    ) : !submissionMode ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 md:p-12"
                        >
                            <h2 className="text-3xl font-bold mb-6 text-center">Choose your Verification Path</h2>
                            <p className="text-gray-400 text-center mb-10 max-w-lg mx-auto">
                                How would you like to authenticate your contribution to the Truth Engine?
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={() => setSubmissionMode('public')}
                                    className="p-8 rounded-2xl border border-zinc-700 bg-zinc-800/50 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Globe className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Web 2.0 Identity</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Verify using your email address. Standard encryption. Fast and simple.
                                    </p>
                                </button>

                                <button
                                    onClick={() => {
                                        if (!connected) {
                                            alert("Please connect your wallet (Top Right) to proceed with Sovereign Mode.");
                                        } else {
                                            setSubmissionMode('private');
                                        }
                                    }}
                                    className="p-8 rounded-2xl border border-zinc-700 bg-zinc-800/50 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all group text-left"
                                >
                                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Lock className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Web 3.0 Sovereign</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Cryptographically sign with your wallet. Zero-knowledge proof of origin.
                                    </p>
                                    {!connected && (
                                        <div className="mt-4 px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full inline-block">
                                            Wallet Not Connected
                                        </div>
                                    )}
                                </button>
                            </div>

                            <button
                                onClick={() => setIndustry(null)}
                                className="mt-12 mx-auto flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" /> Go Back
                            </button>
                        </motion.div>
                    ) : !hasConsented ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-8 md:p-12 shadow-2xl shadow-emerald-500/10"
                        >
                            <h2 className="text-2xl font-bold mb-6">
                                {submissionMode === 'public' ? 'Email Verification' : 'Data Sovereignty & Privacy'}
                            </h2>

                            {submissionMode === 'public' ? (
                                <div className="space-y-6">
                                    <p className="text-gray-400">
                                        To maintain the integrity of our dataset, we require email verification for public submissions.
                                    </p>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="researcher@institute.edu"
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-400 transition-all"
                                        />
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 cursor-pointer group" onClick={() => setConsentChecked(!consentChecked)}>
                                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${consentChecked ? 'bg-cyan-500 border-cyan-500' : 'border-zinc-500 group-hover:border-cyan-500'}`}>
                                            {consentChecked && <CheckCircle2 className="w-4 h-4 text-black" />}
                                        </div>
                                        <span className="text-sm text-gray-300 leading-snug">
                                            I consent to my responses being processed via Formspree and stored in the Indelible Blob public dataset.
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 text-gray-400 text-sm md:text-base mb-8">
                                        <p>
                                            At Indelible Blob, we believe truth is a human right. To uphold this, we handle your data with the same integrity we apply to our infrastructure:
                                        </p>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li><strong className="text-white">Sovereign Storage:</strong> Your survey responses are stored as <strong className="text-emerald-400">immutable blobs</strong> on the Walrus Protocol.</li>
                                            <li><strong className="text-white">Identity Protection:</strong> Your wallet signature is your only credential.</li>
                                            <li><strong className="text-white">Zero-Party Data:</strong> No emails, no tracking pixels. Pure cryptographic truth.</li>
                                        </ul>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 mb-8 cursor-pointer group" onClick={() => setConsentChecked(!consentChecked)}>
                                        <div className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${consentChecked ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-500 group-hover:border-emerald-500'}`}>
                                            {consentChecked && <CheckCircle2 className="w-4 h-4 text-black" />}
                                        </div>
                                        <span className="text-sm text-gray-300 leading-snug">
                                            I consent to my responses being stored as an Indelible Blob and used to improve the Truth Engine for the **{industry}** sector.
                                        </span>
                                    </div>
                                </>
                            )}

                            {/* Verification Method Selection - Moved to previous step */}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={() => setHasConsented(true)}
                                    disabled={!consentChecked || (submissionMode === 'public' && !email.includes('@'))}
                                    className={`px-8 py-4 font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${submissionMode === 'public' ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-cyan-500/20' : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'}`}
                                >
                                    Proceed to Survey
                                </button>
                                <button
                                    onClick={() => setSubmissionMode(null)}
                                    className="px-8 py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    ) : !submitted ? (
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 backdrop-blur-xl relative"
                        >
                            {/* Progress bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 rounded-t-2xl overflow-hidden">
                                <motion.div
                                    className="h-full bg-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((step + 1) / (questions.length + 1)) * 100}%` }}
                                />
                            </div>

                            <button
                                onClick={handleBack}
                                className="flex items-center gap-2 text-gray-500 hover:text-emerald-400 mb-8 transition-colors text-sm font-medium"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>

                            {step < questions.length ? (
                                <div className="space-y-8">
                                    <div>
                                        <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest mb-2 block">
                                            {industry} • Question {step + 1} of {questions.length}
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-bold leading-tight">
                                            {questions[step].text}
                                        </h2>
                                    </div>

                                    <textarea
                                        rows={6}
                                        className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none shadow-inner"
                                        placeholder={questions[step].placeholder}
                                        value={responses[questions[step].id] || ''}
                                        onChange={(e) => handleResponseChange(questions[step].id, e.target.value)}
                                    />

                                    <button
                                        onClick={handleNext}
                                        disabled={!responses[questions[step].id]}
                                        className="w-full md:w-auto px-10 py-4 bg-emerald-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        Next Question
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Dual Rail Toggle - Removed from here, moved to Consent Screen */}

                                    <form onSubmit={handleSubmit} className="space-y-8">
                                        <div>
                                            <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest mb-2 block">
                                                Final Step
                                            </span>
                                            <h2 className="text-3xl font-bold">Where should we send your early access invitation?</h2>
                                        </div>

                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-all"
                                            placeholder="you@example.com"
                                            value={email}
                                            readOnly={submissionMode === 'public'} // Read-only if public
                                            onChange={(e) => setEmail(e.target.value)}
                                        />

                                        <button
                                            type="submit"
                                            className="w-full md:w-auto px-10 py-4 bg-emerald-500 text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            Submit & Join Waitlist
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12 backdrop-blur-xl text-center"
                        >
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Thank You, Explorer</h2>
                            <p className="text-gray-400 mb-8 max-w-md mx-auto">
                                Your industry insights are the bedrock of the Truth Engine. We've reserved your spot in the early access program.
                            </p>
                            <div className="flex flex-col md:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="px-8 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors font-semibold"
                                >
                                    Return to Portal
                                </button>
                                <button
                                    onClick={() => window.open('https://calendly.com/indelible-blob-proton/30min', '_blank')}
                                    className="px-8 py-3 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors font-bold shadow-lg shadow-emerald-500/10"
                                >
                                    Book Discovery Call
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main >
        </div >
    );
}
