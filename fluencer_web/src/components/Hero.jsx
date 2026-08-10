import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  MessageCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase,
  Flame
} from 'lucide-react';

export default function Hero({ onExplore, onOpenSimulator, onOpenPrivacy }) {
  return (
    <section style={{
      paddingTop: '140px',
      paddingBottom: '80px',
      width: '100%',
      position: 'relative',
      background: 'radial-gradient(circle at 50% 10%, rgba(124, 58, 237, 0.22) 0%, rgba(236, 72, 153, 0.08) 45%, rgba(11, 11, 16, 0) 70%)'
    }}>
      <div className="site-container">
        
        {/* Top Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div className="badge-neon" style={{ padding: '8px 20px', borderRadius: '30px' }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#A855F7' }} />
            <span>Next-Gen Influencer & Brand Collaboration Hub</span>
          </div>
        </div>

        {/* Hero Title */}
        <div style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto', marginBottom: '40px' }}>
          <h1 className="gradient-heading" style={{
            fontSize: '54px',
            fontWeight: '800',
            lineHeight: '1.15',
            letterSpacing: '-1px',
            marginBottom: '20px'
          }}>
            Brands Post Campaigns<span style={{ color: '#EC4899' }}>.</span><br />
            Influencers Apply<span style={{ color: '#7C3AED' }}>.</span><br />
            Deals Lock Securely.
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.72)',
            lineHeight: '1.6',
            maxWidth: '720px',
            margin: '0 auto 32px auto'
          }}>
            The complete ecosystem connecting <strong style={{ color: '#C084FC' }}>Brands</strong> and <strong style={{ color: '#F472B6' }}>Influencers</strong>. 
            Create campaigns, negotiate pricing in live chat, communicate with the Fluencer app team, and <strong style={{ color: '#34D399' }}>lock contracts with escrow safety</strong>.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <button 
              onClick={onOpenSimulator}
              className="btn-glow-pink"
            >
              <Lock style={{ width: '18px', height: '18px' }} />
              <span>Try Live Deal Lock Engine</span>
              <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>

            <button 
              onClick={onExplore}
              className="btn-secondary"
            >
              <Briefcase style={{ width: '18px', height: '18px', color: '#A855F7' }} />
              <span>See App Workflow</span>
            </button>

            <button 
              onClick={onOpenPrivacy}
              className="btn-secondary"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              <ShieldCheck style={{ width: '18px', height: '18px', color: '#34D399' }} />
              <span>Privacy Policy</span>
            </button>
          </div>

          {/* Feature Highlights Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '36px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#34D399' }} />
              <span>Brand Campaign Listing</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#A855F7' }} />
              <span>Influencer 1-Tap Apply</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#EC4899' }} />
              <span>Brand & App Team Support</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <CheckCircle2 style={{ width: '14px', height: '14px', color: '#F5A623' }} />
              <span>Brand-Influencer Live Chat</span>
            </div>
          </div>
        </div>

        {/* Dashboard Mockup Card */}
        <div className="glass-card-static" style={{ padding: '32px', marginTop: '48px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', marginLeft: '12px' }}>
                fluencer.app // campaign-dashboard
              </span>
            </div>
            <div className="badge-success" style={{ marginLeft: 'auto' }}>
              <span>Live Network Active</span>
            </div>
          </div>

          {/* 3 Columns */}
          <div className="grid-3">
            
            {/* Card 1 */}
            <div style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge-neon">Brand Action</span>
                <Flame style={{ width: '18px', height: '18px', color: '#F97316' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>1. Add Campaign</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Brands post budget, platform target (Instagram/YouTube), and deliverables.</p>
              <div style={{ background: '#14141C', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#C084FC', marginBottom: '4px' }}>Campaign: Summer Collection 2026</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Budget: ₹45,000</span>
                  <span style={{ color: '#34D399', fontWeight: '600' }}>Active</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge-pink">Influencer & Chat</span>
                <MessageCircle style={{ width: '18px', height: '18px', color: '#F472B6' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>2. Apply & Chat</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Influencers apply with quotes. Brand & Influencer negotiate via direct text.</p>
              <div style={{ background: '#14141C', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '11px', background: 'rgba(124, 58, 237, 0.2)', padding: '8px', borderRadius: '8px', color: '#E9D5FF' }}>
                  <strong>Influencer:</strong> Hi! I love the brand. Quote for 2 Reels + 3 Stories.
                </div>
                <div style={{ fontSize: '11px', background: 'rgba(236, 72, 153, 0.2)', padding: '8px', borderRadius: '8px', color: '#FBCFE8', textAlign: 'right' }}>
                  <strong>Brand:</strong> Perfect! Deal terms agreed.
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div style={{ background: '#121218', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="badge-gold">Deal Lock</span>
                <Lock style={{ width: '18px', height: '18px', color: '#F5A623' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '6px' }}>3. Lock Deal & Pay</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>Click "Lock Deal" to freeze milestone terms. App holds escrow safely.</p>
              <div style={{ background: 'rgba(6, 78, 59, 0.4)', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '12px', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#6EE7B7', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldCheck style={{ width: '16px', height: '16px' }} />
                  DEAL LOCKED #FL-8821
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>Escrow Secured • Deliverables Pending</div>
              </div>
            </div>

          </div>

        </div>

        {/* Stats Row */}
        <div className="grid-4" style={{ marginTop: '48px' }}>
          <div className="glass-card-static" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#C084FC' }}>10,000+</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Active Influencers</div>
          </div>
          <div className="glass-card-static" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#F472B6' }}>500+</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Verified Brands</div>
          </div>
          <div className="glass-card-static" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#34D399' }}>100%</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Escrow Protection</div>
          </div>
          <div className="glass-card-static" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#F5A623' }}>₹50M+</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>Campaign Volume</div>
          </div>
        </div>

      </div>
    </section>
  );
}
