import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  Lock, 
  FileText, 
  Download, 
  PhoneCall,
  Camera,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenContact, onOpenDownload }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'photo-demo', label: 'Photo Demo', icon: Camera },
    { id: 'how-it-works', label: 'How It Works', icon: Layers },
    { id: 'brand-flow', label: 'For Brands', icon: MessageSquare },
    { id: 'influencer-flow', label: 'For Influencers', icon: ShieldCheck },
    { id: 'deal-lock', label: 'Deal Lock Engine', icon: Lock },
    { id: 'privacy', label: 'Privacy Policy', icon: FileText },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className="glass-nav">
        <div className="site-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('overview')} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6D28FF, #EC4899)',
              padding: '2px',
              boxShadow: '0 8px 20px rgba(109, 40, 255, 0.4)',
              flexShrink: 0
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#0B0B10',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img 
                  src="/icon.png" 
                  alt="Fluencer Logo" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '19px', fontWeight: '800', letterSpacing: '-0.5px', color: '#FFFFFF' }}>
                  Fluencer<span style={{ color: '#EC4899' }}>.</span>
                </span>
                <span className="badge-neon" style={{ fontSize: '9px', padding: '2px 6px' }}>App & Web</span>
              </div>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.6px', margin: 0 }}>COLLABORATION PLATFORM</p>
            </div>
          </div>

          {/* Desktop Links (Hidden on Tablet / Mobile) */}
          <div className="desktop-only" style={{
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(20, 20, 28, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '30px',
            padding: '5px 12px'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'linear-gradient(135deg, #6D28FF, #7C3AED)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                    boxShadow: isActive ? '0 4px 14px rgba(109, 40, 255, 0.4)' : 'none'
                  }}
                >
                  <Icon style={{ width: '13px', height: '13px', color: isActive ? '#FFFFFF' : '#A855F7' }} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Desktop Action CTAs */}
          <div className="desktop-only" style={{ alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={onOpenContact}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '9px 14px' }}
            >
              <PhoneCall style={{ width: '13px', height: '13px', color: '#EC4899' }} />
              <span>Contact Support</span>
            </button>
            
            <button 
              onClick={onOpenDownload}
              className="btn-primary"
              style={{ fontSize: '12px', padding: '9px 16px' }}
            >
              <Download style={{ width: '13px', height: '13px', color: '#FFFFFF' }} />
              <span>Get App</span>
            </button>
          </div>

          {/* Mobile Right Controls (Hamburger & Quick Download) */}
          <div className="mobile-only" style={{ alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onOpenDownload}
              className="btn-primary"
              style={{ padding: '8px 12px', fontSize: '11px', borderRadius: '10px' }}
              title="Download Fluencer APK"
            >
              <Download style={{ width: '13px', height: '13px' }} />
              <span>Get App</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X style={{ width: '20px', height: '20px', color: '#EC4899' }} />
              ) : (
                <Menu style={{ width: '20px', height: '20px', color: '#C084FC' }} />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Horizontal Scrollable Tab Strip */}
        <div className="mobile-only" style={{
          marginTop: '10px',
          padding: '0 12px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <div className="scroll-pills-bar" style={{ width: 'max-content' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 11px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: isActive ? '1px solid rgba(168, 85, 247, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isActive ? 'linear-gradient(135deg, #6D28FF, #7C3AED)' : 'rgba(20, 20, 28, 0.8)',
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.75)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Icon style={{ width: '12px', height: '12px', color: isActive ? '#FFFFFF' : '#A855F7' }} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

      </nav>

      {/* Mobile Slide-Down Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#A855F7', marginBottom: '4px' }}>
              Explore Platform
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    backgroundColor: isActive ? 'rgba(109, 40, 255, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: isActive ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                    color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isActive ? '#7C3AED' : 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ width: '16px', height: '16px', color: '#FFFFFF' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.label}</span>
                  </div>
                  <ChevronRight style={{ width: '16px', height: '16px', color: 'rgba(255,255,255,0.4)' }} />
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenContact();
              }}
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              <PhoneCall style={{ width: '15px', height: '15px', color: '#EC4899' }} />
              <span>Contact Support Desk</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDownload();
              }}
              className="btn-glow-pink"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
            >
              <Download style={{ width: '15px', height: '15px', color: '#FFFFFF' }} />
              <span>Download Android APK (Direct)</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
