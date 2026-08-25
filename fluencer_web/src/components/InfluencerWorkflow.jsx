import React from 'react';
import { 
  UserCheck, 
  Send, 
  MessageSquare, 
  Lock, 
  CheckCircle2, 
  Sparkles,
  Wallet,
  Star,
  Download,
  ArrowRight
} from 'lucide-react';

export default function InfluencerWorkflow({ onOpenSimulator, onOpenDownload }) {
  const creatorSteps = [
    {
      number: '01',
      title: 'Browse Matched Brand Campaigns',
      badge: '1-Tap Discovery',
      desc: 'Explore campaign feed tailored to your niche (Fashion, Tech, Fitness, Skincare). View brand budgets, guidelines, and sample links.',
      icon: Star,
      accent: '#F472B6',
      details: ['Filter by niche & payout rates', 'Transparent budget limits (₹30k - ₹1.5L)', 'Instant brand brief access']
    },
    {
      number: '02',
      title: 'Apply with Custom Pitch & Rates',
      badge: 'Pitch Proposal',
      desc: 'Submit your 1-tap application with your standard reel rates or custom pitch proposal note. Highlight your portfolio links.',
      icon: Send,
      accent: '#C084FC',
      details: ['Submit custom rates & deliverables', 'Include past viral reel links', 'Instant brand notification']
    },
    {
      number: '03',
      title: 'Negotiate Terms in Live Text Chat',
      badge: 'In-App Messaging',
      desc: 'Chat directly with Brand Managers inside Fluencer App. Finalize video concept scripts, delivery timelines, and exact pricing.',
      icon: MessageSquare,
      accent: '#F5A623',
      details: ['In-app direct messaging', 'Share draft preview links', 'Safe, protected communication']
    },
    {
      number: '04',
      title: 'Lock Deal & Instant Bank Payouts',
      badge: 'Escrow Release',
      desc: 'Once the deal is locked, brand funds are frozen in Escrow. As soon as your content is approved, payment releases straight to your Bank / UPI.',
      icon: Wallet,
      accent: '#34D399',
      details: ['100% Guaranteed Escrow protection', 'Automated milestone payout release', 'Direct Bank / UPI transfer']
    }
  ];

  return (
    <section id="influencer-flow" style={{ padding: 'clamp(60px, 10vw, 100px) 0', backgroundColor: '#0B0B10', width: '100%', position: 'relative' }}>
      <div className="site-container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px auto' }}>
          <div className="badge-pink" style={{ marginBottom: '14px' }}>
            <Sparkles style={{ width: '14px', height: '14px', color: '#F472B6' }} />
            <span>Dedicated Influencer Ecosystem</span>
          </div>
          <h2 className="section-title">
            For Influencers: <span className="gradient-heading">Monetize Your Content</span>
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2.2vw, 16px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            Discover top brand deals, pitch your rates, text brand managers in-app, and get paid 100% guaranteed escrow payouts.
          </p>
        </div>

        {/* Feature Hero Card */}
        <div className="glass-card-static split-grid-responsive" style={{
          padding: 'clamp(20px, 4vw, 40px)',
          borderRadius: '28px',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(11, 11, 16, 0.9))',
          marginBottom: '40px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span className="badge-pink">Creator Monetization Engine</span>
            <h3 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.25' }}>
              Apply to Top Brands. Text Direct. <br />
              <span className="gradient-heading">Get 100% Guaranteed Payouts.</span>
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.6' }}>
              Say goodbye to delayed payments and ghosting brands. Fluencer guarantees that brand budgets are locked in Escrow before you start creating, ensuring 100% payment safety.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', flexWrap: 'wrap' }}>
              <button onClick={onOpenDownload} className="btn-glow-pink" style={{ fontSize: '13px' }}>
                <Download style={{ width: '15px', height: '15px' }} />
                <span>Get Creator Mobile App</span>
              </button>
              <button onClick={onOpenSimulator} className="btn-secondary" style={{ fontSize: '13px' }}>
                <Lock style={{ width: '15px', height: '15px', color: '#F472B6' }} />
                <span>Try Creator Chat Demo</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="mobile-phone-frame" style={{ width: '100%', maxWidth: '320px' }}>
              <img 
                src="/demo/step2_influencer_apply.png" 
                alt="Influencer Application Screen" 
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '24px',
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 25px 60px rgba(236, 72, 153, 0.4)',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>

        {/* 4 Creator Steps Grid */}
        <div className="grid-2" style={{ gap: '20px' }}>
          {creatorSteps.map((step, idx) => {
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
                      background: 'rgba(236, 72, 153, 0.2)',
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
                  <span className="badge-pink" style={{ fontSize: '10px', padding: '2px 8px' }}>{step.badge}</span>
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
    </section>
  );
}
