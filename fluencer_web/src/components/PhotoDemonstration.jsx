import React, { useState } from 'react';
import { 
  Camera, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  MessageSquare, 
  PlusCircle, 
  Send, 
  ShieldCheck, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export default function PhotoDemonstration() {
  const [activeStep, setActiveStep] = useState(0);
  const [modalImage, setModalImage] = useState(null);

  const demoSteps = [
    {
      id: 'step-1',
      title: 'Step 1: Brand Adds Campaign',
      badge: 'Brand Campaign Listing',
      badgeClass: 'badge-neon',
      image: '/demo/step1_campaign_add.png',
      hindiDesc: 'Brand apne product/service ke liye budget, deliverables aur niche set karke campaign add karta hai.',
      description: 'Brands log into the Fluencer App, specify budgets, target platforms (Instagram Reels, YouTube Shorts), required deliverables, and target audience filters.',
      icon: PlusCircle,
      accent: '#C084FC'
    },
    {
      id: 'step-2',
      title: 'Step 2: Influencers Apply',
      badge: 'Influencer 1-Tap Apply',
      badgeClass: 'badge-pink',
      image: '/demo/step2_influencer_apply.png',
      hindiDesc: 'Influencers active campaigns dekhte hain aur apne custom pitch/quote ke sath apply karte hain.',
      description: 'Influencers browse matched campaigns on their mobile feed, review requirements, submit custom quotes, and send their applications directly.',
      icon: Send,
      accent: '#F472B6'
    },
    {
      id: 'step-3',
      title: 'Step 3: Direct Live Text Chat',
      badge: 'In-App Negotiation',
      badgeClass: 'badge-gold',
      image: '/demo/step3_chat_negotiate.png',
      hindiDesc: 'Brand aur Influencer live in-app chat me terms, video scripts, aur deliverables discuss karte hain.',
      description: 'Real-time text chat inside Fluencer App enables Brands and Influencers to refine terms, exchange content drafts, and agree on final pricing.',
      icon: MessageSquare,
      accent: '#F5A623'
    },
    {
      id: 'step-4',
      title: 'Step 4: Lock Deal & Escrow Payment',
      badge: 'Secure Contract Lock',
      badgeClass: 'badge-success',
      image: '/demo/step4_deal_lock.png',
      hindiDesc: 'Dono parties agree karke "Lock Deal" press karti hain. Payment safely Escrow me lock ho jata hai.',
      description: 'Clicking "Lock Deal" generates a legally binding contract timestamp #FL-9912. Payment is held in Fluencer Escrow until content is approved.',
      icon: Lock,
      accent: '#34D399'
    }
  ];

  const currentStep = demoSteps[activeStep];
  const Icon = currentStep.icon;

  return (
    <section id="demo-photos" style={{ padding: '100px 0', backgroundColor: '#14141C', width: '100%', position: 'relative' }}>
      <div className="site-container">
        
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 50px auto' }}>
          <div className="badge-neon" style={{ marginBottom: '16px' }}>
            <Camera style={{ width: '14px', height: '14px', color: '#A855F7' }} />
            <span>Visual Photo Walkthrough</span>
          </div>
          <h2 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.5px', color: '#FFFFFF', marginBottom: '16px' }}>
            App Demonstration <span className="gradient-heading">Via Real Photos</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            See exactly how the Fluencer Mobile App interface works across each phase — from campaign post to direct text chat and Escrow Deal Lock.
          </p>
        </div>

        {/* Interactive Step Tabs Selector */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '40px'
        }}>
          {demoSteps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(idx)}
              style={{
                padding: '12px 20px',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                background: activeStep === idx ? 'linear-gradient(135deg, #6D28FF, #7C3AED)' : 'rgba(255, 255, 255, 0.06)',
                color: activeStep === idx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                boxShadow: activeStep === idx ? '0 8px 24px rgba(109, 40, 255, 0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>{step.title}</span>
            </button>
          ))}
        </div>

        {/* Main Photo Demonstration Stage */}
        <div className="glass-card-static" style={{
          padding: '40px',
          borderRadius: '28px',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          background: 'linear-gradient(135deg, #14141C 0%, #0B0B10 100%)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          
          {/* Left: Smartphone Photo Screen */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: '100%',
              maxWidth: '380px',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 58, 237, 0.25)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              position: 'relative',
              backgroundColor: '#0B0B10'
            }}>
              <img 
                src={currentStep.image} 
                alt={currentStep.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'cover'
                }}
              />

              {/* Zoom Trigger Button */}
              <button
                onClick={() => setModalImage(currentStep.image)}
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '16px',
                  background: 'rgba(11, 11, 16, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Maximize2 style={{ width: '14px', height: '14px' }} />
                <span>View Full Photo</span>
              </button>
            </div>
          </div>

          {/* Right: Detailed Explanation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(124, 58, 237, 0.2)',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon style={{ width: '24px', height: '24px', color: currentStep.accent }} />
              </div>
              <div>
                <span className={currentStep.badgeClass} style={{ fontSize: '11px' }}>{currentStep.badge}</span>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginTop: '2px' }}>
                  {currentStep.title}
                </h3>
              </div>
            </div>

            <div style={{
              background: 'rgba(124, 58, 237, 0.12)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              padding: '14px 18px',
              borderRadius: '16px',
              color: '#E9D5FF',
              fontSize: '13px',
              fontWeight: '500',
              lineHeight: '1.6'
            }}>
              💡 <strong>Hindi Summary:</strong> {currentStep.hindiDesc}
            </div>

            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.75)', lineHeight: '1.7' }}>
              {currentStep.description}
            </p>

            {/* Navigation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={() => setActiveStep((prev) => (prev > 0 ? prev - 1 : demoSteps.length - 1))}
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '10px 16px' }}
              >
                <ChevronLeft style={{ width: '16px', height: '16px' }} />
                <span>Previous Photo</span>
              </button>

              <button
                onClick={() => setActiveStep((prev) => (prev < demoSteps.length - 1 ? prev + 1 : 0))}
                className="btn-primary"
                style={{ fontSize: '12px', padding: '10px 18px' }}
              >
                <span>Next Step Photo</span>
                <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

          </div>

        </div>

        {/* Real Brand Campaign Showcase Grid */}
        <div style={{ marginTop: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>
              Active Brand Campaigns & Portfolio Previews
            </h4>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
              Real live campaign listings running on the Fluencer platform.
            </p>
          </div>

          <div className="grid-4" style={{ gap: '20px' }}>
            
            <div className="glass-card-static" style={{ overflow: 'hidden', padding: 0, borderRadius: '20px' }}>
              <img src="/campaign_1.png" alt="Campaign 1" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <span className="badge-neon" style={{ fontSize: '10px' }}>Fashion & Lifestyle</span>
                <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginTop: '6px' }}>Super 60 Apparel Campaign</h5>
                <p style={{ fontSize: '12px', color: '#34D399', fontWeight: '600', marginTop: '4px' }}>Budget: ₹65,000</p>
              </div>
            </div>

            <div className="glass-card-static" style={{ overflow: 'hidden', padding: 0, borderRadius: '20px' }}>
              <img src="/campaign_2.png" alt="Campaign 2" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <span className="badge-pink" style={{ fontSize: '10px' }}>Tech & Gadgets</span>
                <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginTop: '6px' }}>Smart Gear Launch</h5>
                <p style={{ fontSize: '12px', color: '#34D399', fontWeight: '600', marginTop: '4px' }}>Budget: ₹80,000</p>
              </div>
            </div>

            <div className="glass-card-static" style={{ overflow: 'hidden', padding: 0, borderRadius: '20px' }}>
              <img src="/campiagn_3.png" alt="Campaign 3" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <span className="badge-gold" style={{ fontSize: '10px' }}>Beauty & Skincare</span>
                <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginTop: '6px' }}>Glow Skincare Reel</h5>
                <p style={{ fontSize: '12px', color: '#34D399', fontWeight: '600', marginTop: '4px' }}>Budget: ₹40,000</p>
              </div>
            </div>

            <div className="glass-card-static" style={{ overflow: 'hidden', padding: 0, borderRadius: '20px' }}>
              <img src="/campaign_4.png" alt="Campaign 4" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div style={{ padding: '16px' }}>
                <span className="badge-neon" style={{ fontSize: '10px' }}>Fitness & Wellness</span>
                <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', marginTop: '6px' }}>FitPro Supplement Campaign</h5>
                <p style={{ fontSize: '12px', color: '#34D399', fontWeight: '600', marginTop: '4px' }}>Budget: ₹55,000</p>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Lightbox Photo Modal */}
      {modalImage && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          backgroundColor: 'rgba(0,0,0,0.9)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ position: 'relative', maxWidth: '600px', width: '100%' }}>
            <button
              onClick={() => setModalImage(null)}
              style={{
                position: 'absolute',
                top: '-48px',
                right: '0',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#FFFFFF',
                padding: '8px',
                borderRadius: '50%',
                cursor: 'pointer'
              }}
            >
              <Maximize2 style={{ width: '20px', height: '20px' }} />
            </button>
            <img 
              src={modalImage} 
              alt="Full Preview"
              style={{ width: '100%', borderRadius: '20px', border: '2px solid rgba(168, 85, 247, 0.4)', boxShadow: '0 25px 60px rgba(0,0,0,0.9)' }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
