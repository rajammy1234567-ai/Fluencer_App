import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  MessageCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase,
  Flame,
  Download
} from 'lucide-react';

export default function Hero({ onExplore, onOpenSimulator, onOpenPrivacy, onOpenDownload }) {
  return (
    <section style={{
      paddingTop: 'clamp(100px, 14vw, 140px)',
      paddingBottom: 'clamp(40px, 8vw, 80px)',
      width: '100%',
      position: 'relative',
      background: 'radial-gradient(circle at 50% 10%, rgba(124, 58, 237, 0.22) 0%, rgba(236, 72, 153, 0.08) 45%, rgba(11, 11, 16, 0) 70%)'
    }}>
      <div className="site-container">
        
        {/* Top Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="badge-neon" style={{ padding: '6px 16px', borderRadius: '30px', textAlign: 'center' }}>
            <Sparkles style={{ width: '14px', height: '14px', color: '#A855F7', flexShrink: 0 }} />
            <span style={{ fontSize: 'clamp(11px, 2.5vw, 13px)' }}>Next-Gen Influencer & Brand Collaboration Hub</span>
          </div>
        </div>

        {/* Hero Title */}
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto', marginBottom: '32px' }}>
          <h1 className="hero-title gradient-heading">
            Brands Post Campaigns<span style={{ color: '#EC4899' }}>.</span><br />
            Influencers Apply<span style={{ color: '#7C3AED' }}>.</span><br />
            Deals Lock Securely.
          </h1>

          <p style={{
            fontSize: 'clamp(14px, 2.5vw, 18px)',
            color: 'rgba(255, 255, 255, 0.75)',
            lineHeight: '1.6',
            maxWidth: '720px',
            margin: '0 auto 28px auto'
          }}>
            The complete ecosystem connecting <strong style={{ color: '#C084FC' }}>Brands</strong> and <strong style={{ color: '#F472B6' }}>Influencers</strong>. 
            Create campaigns, negotiate pricing in live chat, communicate with the Fluencer app team, and <strong style={{ color: '#34D399' }}>lock contracts with escrow safety</strong>.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px' }}>
            <button 
              onClick={onOpenDownload}
              className="btn-glow-pink"
              style={{ 
                fontSize: 'clamp(13px, 2vw, 15px)',
                padding: '12px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: '0 8px 25px rgba(16, 185, 129, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                cursor: 'pointer'
              }}
            >
              <Download style={{ width: '18px', height: '18px', color: '#FFFFFF' }} />
              <span style={{ fontWeight: '700' }}>Download Android App (.APK)</span>
            </button>

            <button 
              onClick={onOpenSimulator}
              className="btn-secondary"
              style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}
            >
              <Lock style={{ width: '16px', height: '16px', color: '#A855F7' }} />
              <span>Try Deal Lock Engine</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>

            <button 
              onClick={onExplore}
              className="btn-secondary"
              style={{ fontSize: 'clamp(12px, 2vw, 14px)' }}
            >
              <Briefcase style={{ width: '16px', height: '16px', color: '#A855F7' }} />
              <span>See App Workflow</span>
            </button>

            <button 
              onClick={onOpenPrivacy}
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', fontSize: 'clamp(12px, 2vw, 14px)' }}
            >
              <ShieldCheck style={{ width: '16px', height: '16px', color: '#34D399' }} />
              <span>Privacy Policy</span>
            </button>
          </div>

          {/* Feature Highlights Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '28px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 style={{ width: '13px', height: '13px', color: '#34D399', flexShrink: 0 }} />
              <span>Brand Campaign Listing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 style={{ width: '13px', height: '13px', color: '#A855F7', flexShrink: 0 }} />
              <span>Influencer 1-Tap Apply</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 style={{ width: '13px', height: '13px', color: '#EC4899', flexShrink: 0 }} />
              <span>Brand & Support Desk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 style={{ width: '13px', height: '13px', color: '#F5A623', flexShrink: 0 }} />
              <span>Brand-Influencer Live Chat</span>
            </div>
          </div>
        </div>

        {/* Dashboard Mockup Card */}
        <div className="glass-card-static" style={{ padding: 'clamp(16px, 3vw, 32px)', marginTop: '36px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>
                fluencer.app // dashboard
              </span>
            </div>
            <div className="badge-success" style={{ fontSize: '11px', padding: '4px 10px' }}>
              <span>Live Network Active</span>
            </div>
          </div>

          {/* 3 Columns */}
          <div className="grid-3">
            
            {/* Card 1 */}
            <div style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge-neon" style={{ fontSize: '10px' }}>Brand Action</span>
                <Flame style={{ width: '16px', height: '16px', color: '#F97316' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>1. Add Campaign</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>Brands post budget, platform target (Instagram/YouTube), and deliverables.</p>
              <div style={{ background: '#14141C', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#C084FC', marginBottom: '3px' }}>Campaign: Summer Streetwear</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Budget: ₹45,000</span>
                  <span style={{ color: '#34D399', fontWeight: '600' }}>Active</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge-pink" style={{ fontSize: '10px' }}>Influencer & Chat</span>
                <MessageCircle style={{ width: '16px', height: '16px', color: '#F472B6' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>2. Apply & Chat</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>Influencers apply with quotes. Brand & Influencer negotiate via direct text.</p>
              <div style={{ background: '#14141C', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '10px', background: 'rgba(124, 58, 237, 0.2)', padding: '6px 8px', borderRadius: '6px', color: '#E9D5FF' }}>
                  <strong>Influencer:</strong> Quote for 2 Reels + 3 Stories.
                </div>
                <div style={{ fontSize: '10px', background: 'rgba(236, 72, 153, 0.2)', padding: '6px 8px', borderRadius: '6px', color: '#FBCFE8', textAlign: 'right' }}>
                  <strong>Brand:</strong> Perfect! Deal terms agreed.
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="badge-gold" style={{ fontSize: '10px' }}>Deal Lock</span>
                <Lock style={{ width: '16px', height: '16px', color: '#F5A623' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>3. Lock Deal & Pay</h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginBottom: '14px' }}>Click "Lock Deal" to freeze milestone terms. App holds escrow safely.</p>
              <div style={{ background: 'rgba(6, 78, 59, 0.4)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '10px 12px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#6EE7B7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldCheck style={{ width: '14px', height: '14px' }} />
                  DEAL LOCKED #FL-8821
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>Escrow Secured • Deliverables Active</div>
              </div>
            </div>

          </div>

        </div>

        {/* Stats Row */}
        <div className="grid-4" style={{ marginTop: '36px' }}>
          <div className="glass-card-static" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '800', color: '#C084FC' }}>10,000+</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Active Influencers</div>
          </div>
          <div className="glass-card-static" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '800', color: '#F472B6' }}>500+</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Verified Brands</div>
          </div>
          <div className="glass-card-static" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '800', color: '#34D399' }}>100%</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Escrow Protection</div>
          </div>
          <div className="glass-card-static" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '800', color: '#F5A623' }}>₹50M+</div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>Campaign Volume</div>
          </div>
        </div>

      </div>
    </section>
  );
}
