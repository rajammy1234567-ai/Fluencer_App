import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  Lock, 
  FileText, 
  Download, 
  PhoneCall,
  Camera
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenContact, onOpenDownload }) {
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="glass-nav">
      <div className="site-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('overview')} 
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6D28FF, #EC4899)',
            padding: '2px',
            boxShadow: '0 8px 20px rgba(109, 40, 255, 0.4)'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0B0B10',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src="/icon.png" 
                alt="Fluencer Logo" 
                style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px', color: '#FFFFFF' }}>
                Fluencer<span style={{ color: '#EC4899' }}>.</span>
              </span>
              <span className="badge-neon" style={{ fontSize: '10px', padding: '2px 8px' }}>App & Web</span>
            </div>
            <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.8px' }}>COLLABORATION PLATFORM</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(20, 20, 28, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '30px',
          padding: '6px 16px'
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
                  padding: '6px 14px',
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
                <Icon style={{ width: '14px', height: '14px', color: isActive ? '#FFFFFF' : '#A855F7' }} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onOpenContact}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '10px 16px' }}
          >
            <PhoneCall style={{ width: '14px', height: '14px', color: '#EC4899' }} />
            <span>Contact Support</span>
          </button>
          
          <button 
            onClick={onOpenDownload}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '10px 18px' }}
          >
            <Download style={{ width: '14px', height: '14px', color: '#FFFFFF' }} />
            <span>Get App</span>
          </button>
        </div>

      </div>
    </nav>
  );
}
