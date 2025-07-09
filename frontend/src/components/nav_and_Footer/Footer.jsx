import React from 'react';
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white relative mt-16">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:16px_16px]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="col-span-1 lg:col-span-2">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-6">
              Batch Buddy
            </h3>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Your intelligent academic companion for a better learning experience.
              Manage schedules, track attendance, and never miss important deadlines.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">About</Link></li>
              <li><Link to="/features" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Features</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Connect</h4>
            <ul className="space-y-4">
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Twitter</a></li>
              <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">LinkedIn</a></li>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">GitHub</a></li>
              <li><a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block">Discord</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="md:flex md:items-center md:justify-between text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Batch Buddy. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-8">
              <Link to="/terms" className="hover:text-white transition-all">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-white transition-all">Privacy Policy</Link>
              <Link to="/cookies" className="hover:text-white transition-all">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 