import React from 'react';
import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-gray-50">
    <Navbar />
    <main className="flex-1">{children}</main>
    <footer className="text-center text-xs text-gray-400 py-6 border-t border-gray-100 mt-8">
      KrishiFlow — Smart Procurement Slot & Queue Management System · Built for Smart India Hackathon 2026 ·
      Ministry of Consumer Affairs, Food & Public Distribution
    </footer>
  </div>
);

export default MainLayout;
