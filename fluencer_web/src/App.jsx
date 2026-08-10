import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PhotoDemonstration from './components/PhotoDemonstration';
import HowItWorks from './components/HowItWorks';
import BrandWorkflow from './components/BrandWorkflow';
import InfluencerWorkflow from './components/InfluencerWorkflow';
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

// Helper to determine initial tab from URL path or hash
const getTabFromUrl = () => {
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (path.includes('/privacy') || path.includes('/privacy-policy') || hash === '#privacy' || hash === '#privacy-policy') {
    return 'privacy';
  }
  if (path.includes('/how-it-works') || hash === '#how-it-works') {
    return 'how-it-works';
  }
  if (path.includes('/for-brands') || path.includes('/brand-flow') || hash === '#brand-flow') {
    return 'brand-flow';
  }
  if (path.includes('/for-influencers') || path.includes('/influencer-flow') || hash === '#influencer-flow') {
    return 'influencer-flow';
  }
  if (path.includes('/deal-lock') || hash === '#deal-lock') {
    return 'deal-lock';
  }
  if (path.includes('/photo-demo') || hash === '#photo-demo') {
    return 'photo-demo';
  }
  return 'overview';
};

export default function App() {
  const [activeTab, setActiveTab] = useState(getTabFromUrl);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Sync activeTab with URL pushState
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    let targetPath = '/';
    if (tabId === 'privacy') targetPath = '/privacy-policy';
    else if (tabId === 'how-it-works') targetPath = '/how-it-works';
    else if (tabId === 'brand-flow') targetPath = '/for-brands';
    else if (tabId === 'influencer-flow') targetPath = '/for-influencers';
    else if (tabId === 'deal-lock') targetPath = '/deal-lock';
    else if (tabId === 'photo-demo') targetPath = '/photo-demo';

    if (window.location.pathname !== targetPath) {
      window.history.pushState({ tabId }, '', targetPath);
    }
  };

  // Sync state on browser back/forward buttons or hash change
  useEffect(() => {
    const handleLocationChange = () => {
      setActiveTab(getTabFromUrl());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="page-wrapper">
        
        {/* Fixed Navigation Bar */}
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          onOpenContact={() => setContactModalOpen(true)}
          onOpenDownload={() => setDownloadModalOpen(true)}
        />

        {/* Main Content Area */}
        <main style={{ flex: 1 }}>
          {activeTab === 'overview' && (
            <>
              <Hero 
                onExplore={() => {
                  handleTabChange('how-it-works');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenSimulator={() => {
                  handleTabChange('deal-lock');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenPrivacy={() => {
                  handleTabChange('privacy');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownload={() => setDownloadModalOpen(true)}
              />
              <PhotoDemonstration />
              <HowItWorks 
                onOpenSimulator={() => {
                  handleTabChange('deal-lock');
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
                  handleTabChange('deal-lock');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownload={() => setDownloadModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'brand-flow' && (
            <div style={{ paddingTop: '80px' }}>
              <BrandWorkflow 
                onOpenSimulator={() => {
                  handleTabChange('deal-lock');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenDownload={() => setDownloadModalOpen(true)}
              />
            </div>
          )}

          {activeTab === 'influencer-flow' && (
            <div style={{ paddingTop: '80px' }}>
              <InfluencerWorkflow 
                onOpenSimulator={() => {
                  handleTabChange('deal-lock');
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
          setActiveTab={handleTabChange} 
          onOpenContact={() => setContactModalOpen(true)}
          onOpenDownload={() => setDownloadModalOpen(true)}
        />

      </div>
    </ErrorBoundary>
  );
}
