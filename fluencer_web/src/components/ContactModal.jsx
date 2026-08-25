import React, { useState } from 'react';
import { X, Send, CheckCircle2, PhoneCall, Building2, User } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'brand',
    message: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 3000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      <div className="glass-card-static" style={{
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 'clamp(20px, 4vw, 32px)',
        borderRadius: '24px',
        border: '1px solid rgba(168, 85, 247, 0.35)',
        backgroundColor: '#14141C',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              color: '#34D399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}>
              <CheckCircle2 style={{ width: '28px', height: '28px' }} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              Message Sent Successfully!
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', maxWidth: '340px', lineHeight: '1.5', margin: 0 }}>
              Thank you for reaching out. The Fluencer App Support team will respond to your email within 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="btn-primary"
              style={{ fontSize: '12px', padding: '10px 24px', marginTop: '8px' }}
            >
              Back to Website
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="badge-pink" style={{ width: 'fit-content', fontSize: '10px', padding: '2px 8px' }}>
                <PhoneCall style={{ width: '12px', height: '12px' }} />
                <span>App Team Support Desk</span>
              </div>
              <h3 style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: '800', color: '#FFFFFF', margin: '4px 0 0 0' }}>
                Talk to Fluencer Team
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.5', margin: 0 }}>
                Brands & Influencers can submit campaign inquiries, integration questions, or support requests.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Role Toggle */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                padding: '4px',
                backgroundColor: '#0B0B10',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'brand' })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    background: formData.role === 'brand' ? '#7C3AED' : 'transparent',
                    color: formData.role === 'brand' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <Building2 style={{ width: '14px', height: '14px' }} />
                  <span>I'm a Brand</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'influencer' })}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                    background: formData.role === 'influencer' ? '#EC4899' : 'transparent',
                    color: formData.role === 'influencer' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'
                  }}
                >
                  <User style={{ width: '14px', height: '14px' }} />
                  <span>I'm an Influencer</span>
                </button>
              </div>

              {/* Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Your Name
                </label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#0B0B10',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. rahul@brand.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#0B0B10',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Message */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Message / Inquiry
                </label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Describe your campaign requirement or app query..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    backgroundColor: '#0B0B10',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    fontSize: '12px',
                    color: '#FFFFFF',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Submit */}
              <button 
                type="submit"
                className="btn-glow-pink"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: '12px',
                  fontWeight: '700',
                  marginTop: '4px'
                }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
                <span>Submit Inquiry to App Team</span>
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
}

