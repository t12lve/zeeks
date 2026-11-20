import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MusicWaves from './components/MusicWaves';
import Specs from './components/Specs';
import CliShowcase from './components/CliShowcase';
import Footer from './components/Footer';

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-[#08090D] text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white antialiased">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <MusicWaves />
        <Specs />
        <CliShowcase />
      </main>
      <Footer />
    </div>
  );
}
