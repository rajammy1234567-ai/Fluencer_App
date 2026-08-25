import React from 'react';
import { 
  Building2, 
  PlusCircle, 
  Users, 
  MessageSquare, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  BarChart3,
  Flame,
  ArrowRight
} from 'lucide-react';

export default function BrandWorkflow({ onOpenSimulator, onOpenDownload }) {
  const brandSteps = [
    {
      number: '01',
      title: 'Post Campaign Brief & Budget',
      badge: 'Campaign Setup',
      desc: 'Set your campaign title, budget limits (e.g. ₹45,000), deliverables (2 Instagram Reels, 1 Story), and target creator niches.',
      icon: PlusCircle,
      accent: '#C084FC',
      details: ['Set fixed or per-influencer budget', 'Target Instagram, YouTube Shorts or UGC', 'Specify content guidelines & hashtags']
    },
    {
      number: '02',
      title: 'Review Creator Applications & Metrics',
      badge: 'Applicant Curation',
      desc: 'Browse creator proposals, view verified follower metrics, engagement rates, and previous brand deal portfolios.',
      icon: BarChart3,
      accent: '#F472B6',
      details: ['Verified audience demographics', '1-click applicant approval', 'Custom quote comparison']
    },
    {
      number: '03',
      title: 'Direct Text Chat & Term Finalization',
      badge: 'Live Negotiation',
      desc: 'Chat directly in-app with selected creators. Discuss content scripts, video angles, timelines, and final payout terms.',
      icon: MessageSquare,
      accent: '#F5A623',
      details: ['In-app live messaging', 'Script & draft reviews', 'Zero external messaging risks']
    },
    {
      number: '04',
      title: 'Lock Deal & Deposit Escrow',
      badge: 'Escrow Security',
      desc: 'Click "Lock Deal" to freeze campaign terms. Your budget is held safely in Fluencer Escrow until you approve the final content.',
      icon: Lock,
      accent: '#34D399',
      details: ['Milestone payment lock #FL-9912', 'Binding contract generated', 'Payout released only on your approval']
    }
  ];

  return <section id="brand-flow" style={{ padding: 'clamp(60px, 10vw, 100px) 0', backgroundColor: '#0B0B10', width: '100%', position: 'relative' }}>
      <div className="site-container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px auto' }}>
          <div className="badge-gold" style={{ marginBottom: '14px' }}>
            <Building2 style={{ width: '14px', height: '14px', color: '#F5A623' }} />
            <span>Dedicated Brand Ecosystem</span>
          </div>
          <h2 className="section-title">
            For Brands: <span className="gradient-heading">Scale Influencer Marketing</span>
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2.2vw, 16px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            From campaign creation to applicant curation, direct live chat, and escrow deal locking — here is how Brands run high-ROI campaigns on Fluencer.
          </p>
        </div>

        {/* Feature Hero Card */}
        <div className="glass-card-static split-grid-responsive" style={{
          padding: 'clamp(20px, 4vw, 40px)',
          borderRadius: '28px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          background: 'linear-gradient(135deg, rgba(109, 40, 255, 0.15), rgba(20, 20, 28, 0.8))',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span className="badge-gold">Brand Growth Engine</span>
            <h3 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.25' }}>
              Create Campaigns. Text Creators. <br />
              <span className="gradient-gold">Lock Guaranteed Deliverables.</span>
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.6' }}>
              No more endless DMs or unfulfilled deals. Fluencer provides Brands with a streamlined dashboard to post campaigns, text creators directly, consult with our App team, and hold payments safely in escrow.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              <button onClick={onOpenSimulator} className="btn-glow-pink" style={{ fontSize: '13px' }}>
                <Lock style={{ width: '15px', height: '15px' }} />
                <span>Test Brand Deal Lock</span>
              </button>
              <button onClick={onOpenDownload} className="btn-secondary" style={{ fontSize: '13px' }}>
                <Building2 style={{ width: '15px', height: '15px', color: '#C084FC' }} />
                <span>Get Brand Mobile App</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="mobile-phone-frame" style={{ width: '100%', maxWidth: '320px' }}>
              <img 
                src="/demo/step1_campaign_add.png" 
                alt="Brand Campaign Dashboard" 
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '24px',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 25px 60px rgba(109, 40, 255, 0.4)',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>

        {/* 4 Brand Steps Grid */}
        <div className="grid-2" style={{ gap: '20px' }}>
          {brandSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="glass-card"
                style={{
                  padding: 'clamp(18px, 3.5vw, 30px)',
                  borderRadius: '22px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '13px',
                      background: 'rgba(124, 58, 237, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.accent,
                      flexShrink: 0
                    }}>
                      <Icon style={{ width: '20px', height: '20px' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>STEP {step.number}</span>
                      <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>{step.title}</h4>
                    </div>
                  </div>
                  <span className="badge-neon" style={{ fontSize: '10px', padding: '2px 8px' }}>{step.badge}</span>
                </div>

                <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                  {step.desc}
                </p>

                <div style={{ background: '#121218', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                    {step.details.map((d, dIdx) => (
                      <li key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: '#34D399', flexShrink: 0 }} />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>;
}
