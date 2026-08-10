import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  ArrowUpRight
} from 'lucide-react';

export default function Footer({ setActiveTab, onOpenContact }) {
  return (
    <footer style={{
      backgroundColor: '#0B0B10',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      paddingTop: '60px',
      paddingBottom: '40px',
      width: '100%',
      position: 'relative'
    }}>
      <div className="site-container">
        
        <div className="grid-3" style={{ gap: '40px', marginBottom: '40px' }}>
          
          {/* Column 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6D28FF, #EC4899)', padding: '2px' }}>
                <div style={{ width: '100%', height: '100%', backgroundColor: '#0B0B10', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/icon.png" alt="Fluencer" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                </div>
              </div>
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF' }}>
                Fluencer<span style={{ color: '#EC4899' }}>.</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.6' }}>
              Fluencer connects Brands and Influencers in a unified mobile ecosystem. Create campaigns, negotiate pricing, communicate with support, and lock deals securely with Escrow safety.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <span className="badge-neon" style={{ fontSize: '11px' }}>
                <ShieldCheck style={{ width: '12px', height: '12px' }} />
                Verified Escrow
              </span>
              <span className="badge-gold" style={{ fontSize: '11px' }}>
                <Lock style={{ width: '12px', height: '12px' }} />
                Deal Lock Security
              </span>
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#C084FC' }}>
              Navigation & App Flow
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
              <button onClick={() => { setActiveTab('how-it-works'); window.scrollTo(0,0); }} style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                How App Works <ArrowUpRight style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.4)' }} />
              </button>
              <button onClick={() => { setActiveTab('brand-flow'); window.scrollTo(0,0); }} style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Brand Campaign Guide <ArrowUpRight style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.4)' }} />
              </button>
              <button onClick={() => { setActiveTab('influencer-flow'); window.scrollTo(0,0); }} style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Influencer Applications <ArrowUpRight style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.4)' }} />
              </button>
              <button onClick={() => { setActiveTab('deal-lock'); window.scrollTo(0,0); }} style={{ background: 'none', border: 'none', color: 'inherit', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Live Deal Lock Engine <ArrowUpRight style={{ width: '12px', height: '12px', color: 'rgba(255,255,255,0.4)' }} />
              </button>
            </div>
          </div>

          {/* Column 3 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#F472B6' }}>
              Legal & Play Store Compliance
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <button onClick={() => { setActiveTab('privacy'); window.scrollTo(0,0); }} style={{ background: 'none', border: 'none', color: '#34D399', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileText style={{ width: '14px', height: '14px' }} />
                Privacy Policy & Data Rights (Google Play link)
              </button>
              <button onClick={onOpenContact} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', textAlign: 'left', cursor: 'pointer' }}>
                Contact App Support Team
              </button>
            </div>
          </div>

        </div>

        <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
          <p>© 2026 Fluencer Ecosystem. All rights reserved.</p>
          <p>Designed for Brands & Influencers Worldwide</p>
        </div>

      </div>
    </footer>
  );
}
