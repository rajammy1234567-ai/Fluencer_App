import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import DealSimulator from './components/DealSimulator';
import PrivacyPolicy from './components/PrivacyPolicy';
import ContactModal from './components/ContactModal';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [contactModalOpen, setContactModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B10] text-white flex flex-col font-['Plus_Jakarta_Sans']">
      
      {/* Fixed Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenContact={() => setContactModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'overview' && (
          <>
            <Hero 
              onExplore={() => {
                setActiveTab('how-it-works');
                const el = document.getElementById('how-it-works');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onOpenSimulator={() => {
                setActiveTab('deal-lock');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenPrivacy={() => {
                setActiveTab('privacy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <HowItWorks 
              onOpenSimulator={() => {
                setActiveTab('deal-lock');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <DealSimulator />
            <PrivacyPolicy />
          </>
        )}

        {activeTab === 'how-it-works' && (
          <div className="pt-24">
            <HowItWorks 
              onOpenSimulator={() => {
                setActiveTab('deal-lock');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {activeTab === 'brand-flow' && (
          <div className="pt-24">
            <HowItWorks 
              onOpenSimulator={() => {
                setActiveTab('deal-lock');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {activeTab === 'influencer-flow' && (
          <div className="pt-24">
            <HowItWorks 
              onOpenSimulator={() => {
                setActiveTab('deal-lock');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {activeTab === 'deal-lock' && (
          <div className="pt-24">
            <DealSimulator />
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="pt-24">
            <PrivacyPolicy />
          </div>
        )}
      </main>

      {/* Support / Inquiry Contact Modal */}
      <ContactModal 
        isOpen={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
      />

      {/* Footer */}
      <Footer 
        setActiveTab={setActiveTab} 
        onOpenContact={() => setContactModalOpen(true)}
      />

    </div>
  );
}
