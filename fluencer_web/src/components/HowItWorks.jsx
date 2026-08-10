import React, { useState } from 'react';
import { 
  PlusCircle, 
  Send, 
  MessageSquare, 
  Lock, 
  CheckCircle, 
  Layers, 
  Sparkles, 
  UserCheck, 
  Building2, 
  Headphones, 
  ArrowRight
} from 'lucide-react';

export default function HowItWorks({ onOpenSimulator }) {
  const steps = [
    {
      stepNumber: '01',
      badge: 'Brand Campaign Add',
      badgeClass: 'badge-neon',
      title: 'Brand Adds Campaign',
      hindiDesc: 'Brand apne product/service ke liye campaign create karta hai.',
      description: 'Brands log in to the Fluencer App, set campaign budgets, platform preferences (Instagram Reels, YouTube Shorts, UGC), niche filters, and detailed instructions.',
      details: [
        'Define deliverables (e.g. 2 Instagram Reels, 1 Story)',
        'Set total budget or per-influencer budget limits',
        'Target follower count & engagement demographics'
      ],
      icon: PlusCircle,
      accentColor: '#C084FC',
      borderGlow: 'rgba(168, 85, 247, 0.3)'
    },
    {
      stepNumber: '02',
      badge: 'Influencer Apply',
      badgeClass: 'badge-pink',
      title: 'Influencers Apply to Campaign',
      hindiDesc: 'Influencer campaign dekhte hain aur apply button par click karke request bhejte hain.',
      description: 'Influencers browse active campaigns matching their profile, view requirements, and submit their application with custom pitch or standard rates.',
      details: [
        'View brand brief, sample links & payment breakdown',
        'Submit pitch note & previous portfolio links',
        'Instant notification sent to the Brand dashboard'
      ],
      icon: Send,
      accentColor: '#F472B6',
      borderGlow: 'rgba(236, 72, 153, 0.3)'
    },
    {
      stepNumber: '03',
      badge: 'Brand & App Coordination',
      badgeClass: 'badge-gold',
      title: 'Brand & App Team Communication',
      hindiDesc: 'Brand aur Fluencer App team aapas me baat karke campaign features and support clear karte hain.',
      description: 'Brands can text or schedule calls with the Fluencer App support team for managed campaigns, custom contracts, influencer verification, and platform assistance.',
      details: [
        'Dedicated Campaign Manager support from Fluencer App',
        'Brand verification & custom contract review',
        'Platform guidelines & compliance verification'
      ],
      icon: Headphones,
      accentColor: '#F5A623',
      borderGlow: 'rgba(245, 166, 35, 0.3)'
    },
    {
      stepNumber: '04',
      badge: 'Direct Negotiation Chat',
      badgeClass: 'badge-neon',
      title: 'Brand & Influencer Direct Live Chat',
      hindiDesc: 'Apply hone ke baad Brand aur Influencer aapas me in-app chat karke deal negotiate karte hain.',
      description: 'Brand reviews influencer applications, opens live text chat inside the app, discusses content guidelines, content scripts, and final pricing.',
      details: [
        'Real-time text chat with media attachments & video previews',
        'Deliverable adjustments & timeline confirmation',
        'Zero external messaging risks — everything logged safely'
      ],
      icon: MessageSquare,
      accentColor: '#A855F7',
      borderGlow: 'rgba(168, 85, 247, 0.4)'
    },
    {
      stepNumber: '05',
      badge: 'Deal Lock (Contract Finalized)',
      badgeClass: 'badge-success',
      title: 'Lock Deal & Escrow Payment',
      hindiDesc: 'Dono parties agree karke "Lock Deal" dabate hain aur amount safe deposit me chala jata hai.',
      description: 'Once agreed on terms, either party clicks "Lock Deal". The Brand deposits payment into Fluencer Escrow, locking the terms until content is delivered and approved.',
      details: [
        'Milestone funds held safely in Fluencer Escrow',
        'Automated contract lock with timestamp & terms',
        'Release payout to Influencer upon Brand content approval'
      ],
      icon: Lock,
      accentColor: '#34D399',
      borderGlow: 'rgba(16, 185, 129, 0.4)'
    }
  ];

  return (
    <section id="how-it-works" style={{ padding: '100px 0', backgroundColor: '#0B0B10', width: '100%' }}>
      <div className="site-container">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 60px auto' }}>
          <div className="badge-neon" style={{ marginBottom: '16px' }}>
            <Layers style={{ width: '14px', height: '14px', color: '#A855F7' }} />
            <span>Complete App Ecosystem</span>
          </div>
          <h2 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.5px', color: '#FFFFFF', marginBottom: '16px' }}>
            How <span className="gradient-heading">Fluencer Works</span> Step-by-Step
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            From campaign creation to direct chat, App team support, and secure Deal Locking — here is how Brands and Influencers collaborate seamlessly inside the mobile app.
          </p>
        </div>

        {/* Steps Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className="glass-card"
                style={{
                  padding: '32px',
                  borderRadius: '24px',
                  borderColor: step.borderGlow,
                  display: 'grid',
                  gridTemplateColumns: '1fr 2fr 1fr',
                  gap: '32px',
                  alignItems: 'start'
                }}
              >
                {/* Left: Step number & Icon */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, #14141C, #121218)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon style={{ width: '28px', height: '28px', color: step.accentColor }} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>STEP</span>
                      <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'monospace', color: '#FFFFFF' }}>{step.stepNumber}</div>
                    </div>
                  </div>
                  <div>
                    <span className={step.badgeClass}>{step.badge}</span>
                  </div>
                </div>

                {/* Center: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF' }}>{step.title}</h3>
                  <p style={{
                    fontSize: '13px',
                    color: '#E9D5FF',
                    fontStyle: 'italic',
                    background: 'rgba(124, 58, 237, 0.15)',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(168, 85, 247, 0.2)'
                  }}>
                    💡 {step.hindiDesc}
                  </p>
                  <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.72)', lineHeight: '1.6' }}>
                    {step.description}
                  </p>
                </div>

                {/* Right: Key Features */}
                <div style={{ background: '#121218', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.8)', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Key Features</span>
                    <Sparkles style={{ width: '14px', height: '14px', color: '#F5A623' }} />
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <CheckCircle style={{ width: '14px', height: '14px', color: '#34D399', flexShrink: 0, marginTop: '2px' }} />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            );
          })}

        </div>

        {/* CTA Callout Box */}
        <div className="glass-card-static" style={{
          marginTop: '60px',
          padding: '40px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #14141C 0%, #1A1025 50%, #14141C 100%)',
          border: '1px solid rgba(236, 72, 153, 0.3)'
        }}>
          <div style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <span className="badge-pink">Interactive Demo Engine</span>
            <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF' }}>
              Want to see how Brand & Influencer text and lock deals live?
            </h3>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Try our embedded deal locking visualizer right here in your browser to experience the real-time chat and contract confirmation.
            </p>
            <button 
              onClick={onOpenSimulator}
              className="btn-glow-pink"
              style={{ marginTop: '8px' }}
            >
              <Lock style={{ width: '16px', height: '16px' }} />
              <span>Launch Live Deal Lock Engine</span>
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
