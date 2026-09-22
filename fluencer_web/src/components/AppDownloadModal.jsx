import React, { useState } from 'react';
import { X, Download, Smartphone, ExternalLink, Check, Copy, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AppDownloadModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Direct generated APK artifact URL from EAS Build
  const cdnDownloadUrl = "https://expo.dev/artifacts/eas/-3pQQTmIcKR2VEOFRI0G2VV6iqsxz6b2J5FXNSASdpM.apk";
  const directApkUrl = "/download-apk";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cdnDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
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
        boxShadow: '0 25px 60px rgba(109, 40, 255, 0.3)',
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

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/icon.png" 
            alt="Fluencer App Icon" 
            style={{ 
              width: '52px', 
              height: '52px', 
              borderRadius: '14px',
              boxShadow: '0 4px 16px rgba(109, 40, 255, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              objectFit: 'cover',
              flexShrink: 0
            }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="badge-neon" style={{ width: 'fit-content', fontSize: '10px', padding: '2px 8px' }}>
              <Smartphone style={{ width: '12px', height: '12px', color: '#A855F7' }} />
              <span>Official Android Release</span>
            </div>
            <h3 style={{ fontSize: 'clamp(18px, 3.5vw, 22px)', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              Download Fluencer App
            </h3>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.5', margin: 0 }}>
          Direct download of the official Fluencer Android App (v1.0.0). Built live with full Razorpay Live Gateway, Deal-Lock escrow, and campaign chat.
        </p>

        {/* Download Box */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(109, 40, 255, 0.15), rgba(236, 72, 153, 0.15))',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              }}>
                <Download style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', display: 'block' }}>
                  fluencer.apk
                </span>
                <span style={{ fontSize: '11px', color: '#34D399', fontWeight: '600' }}>
                  111 MB • Android 8.0+ • Verified APK
                </span>
              </div>
            </div>
            <span style={{ 
              fontSize: '11px', 
              background: 'rgba(16, 185, 129, 0.15)', 
              color: '#34D399', 
              border: '1px solid rgba(16, 185, 129, 0.3)', 
              borderRadius: '8px', 
              padding: '3px 8px',
              fontWeight: '600'
            }}>
              v1.0.0 Live
            </span>
          </div>

          {/* Primary Direct Download Button */}
          <a 
            href={cdnDownloadUrl}
            download="fluencer.apk"
            className="btn-glow-pink"
            style={{
              justifyContent: 'center',
              textDecoration: 'none',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Download style={{ width: '18px', height: '18px' }} />
            <span>Download APK Directly (Instant)</span>
          </a>

          {/* Secondary Server Download Button */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <a 
              href={directApkUrl}
              download="fluencer.apk"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
                padding: '10px 8px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.8)',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center'
              }}
            >
              <span>Server Mirror</span>
              <ExternalLink style={{ width: '12px', height: '12px', opacity: 0.7 }} />
            </a>

            <button 
              onClick={handleCopyLink}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 8px',
                fontSize: '12px',
                fontWeight: '600',
                color: copied ? '#34D399' : 'rgba(255, 255, 255, 0.8)',
                background: copied ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                border: copied ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer'
              }}
            >
              {copied ? <Check style={{ width: '13px', height: '13px' }} /> : <Copy style={{ width: '13px', height: '13px' }} />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Quick 3-Step Installation Guide */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.8)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck style={{ width: '14px', height: '14px', color: '#A855F7' }} />
            Quick Android Install Guide
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.4' }}>
            <div>1. Click <strong style={{ color: '#FFFFFF' }}>Download APK Directly</strong> above.</div>
            <div>2. If Chrome shows <em>"File might be harmful"</em>, tap <strong style={{ color: '#34D399' }}>Download anyway</strong>.</div>
            <div>3. Open the downloaded <strong style={{ color: '#FFFFFF' }}>fluencer.apk</strong> and tap <strong style={{ color: '#A855F7' }}>Install</strong>.</div>
          </div>
        </div>

      </div>
    </div>
  );
}
