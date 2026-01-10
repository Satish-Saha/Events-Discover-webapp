import React from 'react';
import { FaCity } from 'react-icons/fa';

const Header = ({ currentPage, onNavigate }) => {
    return (
        <header className="bg-slate-900 text-white py-4 shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <FaCity className="text-2xl text-blue-400" />
                    <h1 className="text-2xl font-bold tracking-tight">Sydney<span className="text-blue-400">Events</span></h1>
                </div>
                <nav>
                    <ul className="flex space-x-6">
                        <li>
                            <button
                                type="button"
                                onClick={() => onNavigate('events')}
                                className={`transition-colors ${
                                    currentPage === 'events'
                                        ? 'text-blue-400 font-semibold'
                                        : 'hover:text-blue-400'
                                }`}
                            >
                                Events
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                onClick={() => onNavigate('about')}
                                className={`transition-colors ${
                                    currentPage === 'about'
                                        ? 'text-blue-400 font-semibold'
                                        : 'hover:text-blue-400'
                                }`}
                            >
                                About
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
