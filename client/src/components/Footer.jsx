import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-950 text-slate-400 py-8 mt-12">
            <div className="container mx-auto px-4 text-center">
                <p>&copy; {new Date().getFullYear()} Sydney Events Listing. All rights reserved.</p>
                <p className="mt-2 text-sm">Use of this site is for demonstration purposes.</p>
            </div>
        </footer>
    );
};

export default Footer;
