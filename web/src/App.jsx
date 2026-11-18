import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StudioRack from './components/StudioRack';
import Features from './components/Features';
import Comparison from './components/Comparison';
import CliShowcase from './components/CliShowcase';
import DownloadSection from './components/DownloadSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <div id="top" className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <StudioRack />
        <Features />
        <Comparison />
        <CliShowcase />
        <DownloadSection />
      </main>
      <Footer />
    </div>
  );
}
