import React, { useState } from 'react';
import { 
  PlusCircle, 
  Send, 
  MessageSquare, 
  Lock, 
  CheckCircle, 
  Layers, 
  Sparkles, 
  Headphones, 
  ArrowRight,
  Maximize2
} from 'lucide-react';

export default function HowItWorks({ onOpenSimulator }) {
  const [modalImage, setModalImage] = useState(null);

  const steps = [
    {
      stepNumber: '01',
      badge: 'Brand Action',
      badgeClass: 'badge-neon',
      title: 'Brand Adds Campaign',
      hindiDesc: 'Brand apne product/service ke liye budget, platforms (Reels/YouTube) & deliverables set karke campaign add karta hai.',
      description: 'Brands log into the Fluencer App, set campaign budgets, select target platforms (Instagram Reels, YouTube Shorts, UGC), niche categories, and post detailed deliverables for influencers.',
      image: '/demo/step1_campaign_add.png',
      details: [
        'Define deliverables (2 Instagram Reels, 1 Story)',
        'Set total campaign budget or per-influencer rate',
        'Filter target followers & engagement demographics'
      ],
      icon: PlusCircle,
      accentColor: '#C084FC',
      borderGlow: 'rgba(168, 85, 247, 0.35)'
    },
    {
      stepNumber: '02',
      badge: 'Influencer Action',
      badgeClass: 'badge-pink',
      title: 'Influencers Browse & Apply',
      hindiDesc: 'Influencer matching campaigns dekhte hain aur apne rate/pitch ke saath 1-tap request bhejte hain.',
      description: 'Influencers browse active campaign listings on their mobile feed, review requirements & payment terms, submit custom proposals, and apply instantly.',
      image: '/demo/step2_influencer_apply.png',
      details: [
        'View campaign brief, budget & sample links',
        'Submit custom quote & previous work links',
        'Instant alert sent to the Brand dashboard'
      ],
      icon: Send,
      accentColor: '#F472B6',
      borderGlow: 'rgba(236, 72, 153, 0.35)'
    },
    {
      stepNumber: '03',
      badge: 'App Team Managed',
      badgeClass: 'badge-gold',
      title: 'Brand & App Support Coordination',
      hindiDesc: 'Brand aur Fluencer App support team aapas me custom strategy, verification aur requirements clear karte hain.',
      description: 'Brands can text or schedule calls with the Fluencer App support team for managed campaigns, custom contract verification, influencer curation, and platform assistance.',
      image: '/demo/step1_campaign_add.png',
      details: [
        'Dedicated Campaign Manager support from App Team',
        'Brand profile & campaign brief verification',
        'Platform compliance & contract review'
      ],
      icon: Headphones,
      accentColor: '#F5A623',
      borderGlow: 'rgba(245, 166, 35, 0.35)'
    },
    {
      stepNumber: '04',
      badge: 'In-App Negotiation',
      badgeClass: 'badge-neon',
      title: 'Brand & Influencer Direct Live Chat',
      hindiDesc: 'Apply hone ke baad Brand aur Influencer live text chat me deliverables, script aur price final karte hain.',
      description: 'Brand opens live text chat inside the app with applied influencers, discusses content scripts, agrees on final pricing, and refines timelines.',
      image: '/demo/step3_chat_negotiate.png',
      details: [
        'Real-time text chat with media attachments',
        'Deliverable adjustments & content timeline agreement',
        'Zero external risks — all chats safely logged'
      ],
      icon: MessageSquare,
      accentColor: '#A855F7',
      borderGlow: 'rgba(168, 85, 247, 0.4)'
    },
    {
      stepNumber: '05',
      badge: 'Contract Lock & Escrow',
      badgeClass: 'badge-success',
      title: 'Lock Deal & Escrow Payment',
      hindiDesc: 'Dono parties agree karke "Lock Deal" dabate hain aur payment safe Escrow deposit me lock ho jata hai.',
      description: 'Once agreed on terms, clicking "Lock Deal" generates a binding timestamp contract #FL-9912. Payment is held securely in Fluencer Escrow until content is approved.',
      image: '/demo/step4_deal_lock.png',
      details: [
        'Milestone funds held safely in Fluencer Escrow',
        'Automated contract lock with timestamp #FL-9912',
        'Instant payout release upon Brand approval'
      ],
      icon: Lock,
      accentColor: '#34D399',
      borderGlow: 'rgba(16, 185, 129, 0.45)'
    }
  ];

  return <section id="how-it-works" style={{ padding: 'clamp(60px, 10vw, 100px) 0', backgroundColor: '#0B0B10', width: '100%', position: 'relative' }}>
      <div className="site-container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 40px auto' }}>
          <div className="badge-neon" style={{ marginBottom: '14px' }}>
            <Layers style={{ width: '14px', height: '14px', color: '#A855F7' }} />
            <span>Complete 4-Step App Workflow</span>
          </div>
          <h2 className="section-title">
            How <span className="gradient-heading">Fluencer Works</span> (With App Photos)
          </h2>
          <p style={{ fontSize: 'clamp(13px, 2.2vw, 16px)', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            See real screenshot demonstrations of how Brands post campaigns, Influencers apply, both text in live chat, and deals lock with Escrow safety.
          </p>
        </div>

        {/* Steps List with App Photos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="glass-card split-grid-responsive"
                style={{
                  padding: 'clamp(20px, 4vw, 40px)',
                  borderRadius: '28px',
                  borderColor: step.borderGlow,
                  background: 'linear-gradient(135deg, rgba(20, 20, 28, 0.8), rgba(11, 11, 16, 0.9))'
                }}
              >
                {/* Text Content Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #14141C, #121218)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
                      flexShrink: 0
                    }}>
                      <Icon style={{ width: '24px', height: '24px', color: step.accentColor }} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>STEP {step.stepNumber}</span>
                        <span className={step.badgeClass} style={{ fontSize: '10px', padding: '2px 8px' }}>{step.badge}</span>
                      </div>
                      <h3 className="card-title" style={{ color: '#FFFFFF', marginTop: '2px' }}>
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#E9D5FF',
                    fontStyle: 'italic',
                    background: 'rgba(124, 58, 237, 0.15)',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    lineHeight: '1.6'
                  }}>
                    💡 <strong>Hindi Guide:</strong> {step.hindiDesc}
                  </div>

                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.6' }}>
                    {step.description}
                  </p>

                  <div style={{ background: '#121218', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.8)', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Key Demonstration Points</span>
                      <Sparkles style={{ width: '13px', height: '13px', color: '#F5A623' }} />
                    </div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.65)' }}>
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <CheckCircle style={{ width: '15px', height: '15px', color: '#34D399', flexShrink: 0, marginTop: '2px' }} />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* App Photo Demonstration Column */}
                <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', width: '100%' }}>
                  <div className="mobile-phone-frame" style={{
                    width: '100%',
                    maxWidth: '340px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px ' + step.borderGlow,
                    border: '2px solid rgba(255, 255, 255, 0.15)',
                    position: 'relative',
                    backgroundColor: '#0B0B10'
                  }}>
                    <img 
                      src={step.image} 
                      alt={step.title}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'cover'
                      }}
                    />

                    {/* Zoom Button */}
                    <button
                      onClick={() => setModalImage(step.image)}
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        background: 'rgba(11, 11, 16, 0.85)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#FFFFFF',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Maximize2 style={{ width: '12px', height: '12px' }} />
                      <span>Zoom Photo</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}

        </div>

        {/* CTA Box */}
        <div className="glass-card-static" style={{
          marginTop: '50px',
          padding: 'clamp(24px, 5vw, 40px)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #14141C 0%, #1A1025 50%, #14141C 100%)',
          border: '1px solid rgba(236, 72, 153, 0.3)'
        }}>
          <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <span className="badge-pink">Live Chat & Lock Engine</span>
            <h3 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.25' }}>
              Want to see how Brand & Influencer text and lock deals live?
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Try our embedded deal locking visualizer right here in your browser to experience the real-time chat and contract confirmation.
            </p>
            <button 
              onClick={onOpenSimulator}
              className="btn-glow-pink"
              style={{ marginTop: '6px', fontSize: 'clamp(12px, 2vw, 14px)' }}
            >
              <Lock style={{ width: '16px', height: '16px' }} />
              <span>Launch Live Deal Lock Engine</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

      </div>

      {/* Lightbox Photo Modal */}
      {modalImage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          backgroundColor: 'rgba(0,0,0,0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{ position: 'relative', maxWidth: '500px', width: '100%' }}>
            <button
              onClick={() => setModalImage(null)}
              style={{
                position: 'absolute',
                top: '-44px',
                right: '0',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#FFFFFF',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Maximize2 style={{ width: '18px', height: '18px' }} />
            </button>
            <img 
              src={modalImage} 
              alt="Full Preview"
              style={{ width: '100%', borderRadius: '18px', border: '2px solid rgba(168, 85, 247, 0.5)', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}
            />
          </div>
        </div>
      )}
    </section>;
}
