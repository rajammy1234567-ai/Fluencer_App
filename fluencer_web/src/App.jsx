import React, { useState, Component } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import DealSimulator from './components/DealSimulator';
import PrivacyPolicy from './components/PrivacyPolicy';
import ContactModal from './components/ContactModal';
import Footer from './components/Footer';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Fluencer Web Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B0B10] text-white p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/50 max-w-xl">
            <h2 className="text-xl font-bold text-red-400">Something went wrong while rendering</h2>
            <p className="text-xs text-gray-300 mt-2 font-mono">{this.state.error?.toString()}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-purple-600 rounded-xl text-xs font-bold text-white hover:bg-purple-500"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [contactModalOpen, setContactModalOpen] = useState(false);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
