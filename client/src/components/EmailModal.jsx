import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaExternalLinkAlt, FaLock } from 'react-icons/fa';
import { sendOtp, verifyOtp } from '../services/api';

const EmailModal = ({ isOpen, onClose, event }) => {
    const [step, setStep] = useState('email'); // 'email' or 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [consent, setConsent] = useState(false);

    if (!isOpen || !event) return null;

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (!consent) {
                setError('Please agree to receive updates before continuing.');
                setIsLoading(false);
                return;
            }
            await sendOtp(email);
            setStep('otp');
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to send verification code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await verifyOtp(email, otp);
            setStep('success'); // Move to success step

            // Redirect after 2 seconds
            setTimeout(() => {
                window.open(event.originalUrl, '_blank');
                onClose();
                // Reset state
                setEmail('');
                setOtp('');
                setStep('email');
                setConsent(false);
            }, 2000);

        } catch (err) {
            console.error(err);
            setError('Invalid or expired code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100 relative">
                {step !== 'success' && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                )}

                <div className="text-center mb-6">
                    {step === 'success' ? (
                        <div className="py-8">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaLock className="text-green-600 dark:text-green-400 text-2xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Verified!</h2>
                            <p className="text-slate-600 dark:text-slate-300">
                                Redirecting you to tickets...
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                {step === 'email' ? 'Almost there!' : 'Verify Email'}
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300">
                                {step === 'email' ? (
                                    <>
                                        Enter your email to unlock access to tickets for <br />
                                        <span className="font-semibold text-blue-500">{event.title}</span>
                                    </>
                                ) : (
                                    <>
                                        We've sent a 6-digit code to <br />
                                        <span className="font-semibold text-blue-500">{email}</span>
                                    </>
                                )}
                            </p>
                        </>
                    )}
                </div>

                {step === 'email' && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="sr-only">Email Address</label>
                            <div className="relative">
                                <FaEnvelope className="absolute top-3.5 left-3 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-start space-x-2 text-sm text-slate-600 dark:text-slate-300">
                            <input
                                id="consent"
                                type="checkbox"
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1 h-3 w-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="consent">
                                I agree to receive email updates about new events.
                            </label>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                'CONTINUE'
                            )}
                        </button>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label htmlFor="otp" className="sr-only">Verification Code</label>
                            <div className="relative">
                                <FaLock className="absolute top-3.5 left-3 text-slate-400" />
                                <input
                                    type="text"
                                    id="otp"
                                    required
                                    placeholder="Enter 6-digit code"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-800 dark:text-white placeholder-slate-400 transition-all tracking-widest text-center"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading || otp.length !== 6}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    VERIFY & CONTINUE <FaExternalLinkAlt className="ml-2 text-xs" />
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setStep('email');
                                setConsent(false);
                                setOtp('');
                            }}
                            className="w-full text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Back to Email
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EmailModal;