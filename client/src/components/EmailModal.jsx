import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import { subscribeEmail } from '../services/api';

const EmailModal = ({ isOpen, onClose, event }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [consent, setConsent] = useState(false);

    if (!isOpen || !event) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            if (!consent) {
                setError('Please agree to receive updates before continuing.');
                setIsLoading(false);
                return;
            }
            await subscribeEmail(email);
            // Redirect to original URL
            window.open(event.originalUrl, '_blank');
            onClose();
            setEmail('');
            setConsent(false);
        } catch (err) {
            console.error(err);
            setError('Failed to subscribe. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all scale-100 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Almost there!</h2>
                    <p className="text-slate-600 dark:text-slate-300">
                        Enter your email to unlock access to tickets for <br />
                        <span className="font-semibold text-blue-500">{event.title}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                            <>
                                CONTINUE TO TICKETS <FaExternalLinkAlt className="ml-2 text-xs" />
                            </>
                        )}
                    </button>

                    <p className="text-xs text-center text-slate-400 mt-4">
                        We only use your email to send event updates. No spam, and you can unsubscribe at any time.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default EmailModal;