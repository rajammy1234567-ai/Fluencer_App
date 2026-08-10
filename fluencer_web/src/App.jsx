import React, { useState, Component } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PhotoDemonstration from './components/PhotoDemonstration';
import HowItWorks from './components/HowItWorks';
import DealSimulator from './components/DealSimulator';
import LegalPolicy from './components/LegalPolicy';
import ContactModal from './components/ContactModal';
import AppDownloadModal from './components/AppDownloadModal';
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
        <div style={{ minHeight: '100vh', backgroundColor: '#0B0B10', color: '#FFFFFF', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '16px' }}>
          <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: 'rgba(127, 29, 29, 0.6)', border: '1px solid rgba(239, 68, 68, 0.5)', maxWidth: '500px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FCA5A5' }}>Something went wrong while rendering</h2>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '8px', fontFamily: 'monospace' }}>{this.state.error?.toString()}</p>
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#7C3AED', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: '#FFFFFF', border: 'none', cursor: 'pointer' }}
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
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div className="page-wrapper">
        
        {/* Fixed Navigation Bar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onOpenContact={() => setContactModalOpen(true)}
          onOpenDownload={() => setDownloadModalOpen(true)}
        />

        {/* Main Content Area */}
        <main style={{ flex: 1 }}>
          {activeTab === 'overview' && (
            <>
              <Hero 
                onExplore={() => {
                  setActiveTab('photo-demo');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenSimulator={() => {
                  setActiveTab('deal-lock');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenPrivacy={() => {
                  setActiveTab('privacy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownload={() => setDownloadModalOpen(true)}
              />
              <PhotoDemonstration />
              <HowItWorks 
                onOpenSimulator={() => {
                  setActiveTab('deal-lock');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownload={() => setDownloadModalOpen(true)}
              />
              <DealSimulator />
              <LegalPolicy />
            </>
          )}

          {activeTab === 'photo-demo' && (
            <div style={{ paddingTop: '80px' }}>
              <PhotoDemonstration />
            </div>
          )}

          {activeTab === 'how-it-works' && (
            <div style={{ paddingTop: '80px' }}>
              <HowItWorks 
                onOpenSimulator={() => {
                  setActiveTab('deal-lock');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownload={() => setDownloadModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'brand-flow' && (
            <div style={{ paddingTop: '80px' }}>
              <HowItWorks 
                onOpenSimulator={() => {
                  setActiveTab('deal-lock');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownload={() => setDownloadModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'influencer-flow' && (
            <div style={{ paddingTop: '80px' }}>
              <HowItWorks 
                onOpenSimulator={() => {
                  setActiveTab('deal-lock');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownload={() => setDownloadModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'deal-lock' && (
            <div style={{ paddingTop: '80px' }}>
              <DealSimulator />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div style={{ paddingTop: '80px' }}>
              <LegalPolicy />
            </div>
          )}
        </main>

        {/* Support Inquiry Contact Modal */}
        <ContactModal 
          isOpen={contactModalOpen} 
          onClose={() => setContactModalOpen(false)} 
        />

        {/* App Download Modal */}
        <AppDownloadModal 
          isOpen={downloadModalOpen} 
          onClose={() => setDownloadModalOpen(false)} 
        />

        {/* Footer */}
        <Footer 
          setActiveTab={setActiveTab} 
          onOpenContact={() => setContactModalOpen(true)}
          onOpenDownload={() => setDownloadModalOpen(true)}
        />

      </div>
    </ErrorBoundary>
  );
}
