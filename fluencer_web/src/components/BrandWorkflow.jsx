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

  return (
    <section id="brand-flow" style={{ padding: '100px 0', backgroundColor: '#0B0B10', color: '#FFFFFF', width: '100%' }}>
      <div className="site-container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 50px auto' }}>
          <div className="badge-neon" style={{ marginBottom: '16px' }}>
            <Building2 style={{ width: '14px', height: '14px', color: '#C084FC' }} />
            <span>Dedicated Brand Experience</span>
          </div>
          <h2 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.5px', color: '#FFFFFF', marginBottom: '16px' }}>
            For Brands: <span className="gradient-heading">Scale Influencer Marketing</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            From campaign creation to applicant curation, direct live chat, and escrow deal locking — here is how Brands run high-ROI campaigns on Fluencer.
          </p>
        </div>

        {/* Feature Hero Card */}
        <div className="glass-card-static" style={{
          padding: '40px',
          borderRadius: '28px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          background: 'linear-gradient(135deg, rgba(109, 40, 255, 0.15), rgba(20, 20, 28, 0.8))',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'center',
          marginBottom: '60px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <span className="badge-gold" style={{ width: 'fit-content' }}>Brand Growth Engine</span>
            <h3 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.2' }}>
              Create Campaigns. Text Creators. <br />
              <span className="gradient-gold">Lock Guaranteed Deliverables.</span>
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.6' }}>
              No more endless DMs or unfulfilled deals. Fluencer provides Brands with a streamlined dashboard to post campaigns, text creators directly, consult with our App team, and hold payments safely in escrow.
            </p>
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <button onClick={onOpenSimulator} className="btn-glow-pink">
                <Lock style={{ width: '16px', height: '16px' }} />
                <span>Test Brand Deal Lock</span>
              </button>
              <button onClick={onOpenDownload} className="btn-secondary">
                <Building2 style={{ width: '16px', height: '16px', color: '#C084FC' }} />
                <span>Get Brand Mobile App</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/demo/step1_campaign_add.png" 
              alt="Brand Campaign Dashboard" 
              style={{
                width: '100%',
                maxWidth: '340px',
                borderRadius: '24px',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 25px 60px rgba(109, 40, 255, 0.4)'
              }}
            />
          </div>
        </div>

        {/* 4 Brand Steps Grid */}
        <div className="grid-2" style={{ gap: '24px' }}>
          {brandSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="glass-card"
                style={{
                  padding: '32px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: 'rgba(124, 58, 237, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: step.accent
                    }}>
                      <Icon style={{ width: '22px', height: '22px' }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>STEP {step.number}</span>
                      <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>{step.title}</h4>
                    </div>
                  </div>
                  <span className="badge-neon" style={{ marginLeft: 'auto', fontSize: '10px' }}>{step.badge}</span>
                </div>

                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
                  {step.desc}
                </p>

                <div style={{ background: '#121218', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', marginTop: 'auto' }}>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                    {step.details.map((d, dIdx) => (
                      <li key={dIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 style={{ width: '14px', height: '14px', color: '#34D399' }} />
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
    </section>
  );
}
