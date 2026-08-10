import React from 'react';
import { X, Download, Smartphone, ExternalLink } from 'lucide-react';

export default function AppDownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // Direct generated APK artifact URL from EAS Build
  const apkDownloadUrl = "https://expo.dev/artifacts/eas/zK5PUWVA3L6krH-b1k-DLUdJfgEz4y5fEQ_p3Fj5CBI.apk";

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
        padding: '32px',
        borderRadius: '28px',
        border: '1px solid rgba(168, 85, 247, 0.35)',
        backgroundColor: '#14141C',
        position: 'relative',
        boxShadow: '0 25px 60px rgba(109, 40, 255, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.6)',
            cursor: 'pointer'
          }}
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="badge-neon" style={{ width: 'fit-content' }}>
            <Smartphone style={{ width: '14px', height: '14px', color: '#A855F7' }} />
            <span>Fluencer Mobile Ecosystem</span>
          </div>
          <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF' }}>
            Download Fluencer App
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: '1.5' }}>
            Install the Fluencer Android APK built live via Expo EAS Build.
          </p>
        </div>

        {/* Primary Download Button */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(109, 40, 255, 0.15), rgba(236, 72, 153, 0.15))',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF'
              }}>
                <Download style={{ width: '22px', height: '22px' }} />
              </div>
              <div>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', display: 'block' }}>
                  Download Android APK (Direct Link)
                </span>
                <span style={{ fontSize: '11px', color: '#34D399', fontWeight: '600' }}>
                  Fluencer-v1.0.0.apk • EAS Build Ready
                </span>
              </div>
            </div>
          </div>

          <a 
            href={apkDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glow-pink"
            style={{
              justifyContent: 'center',
              textDecoration: 'none',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '700'
            }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            <span>Download Direct APK File</span>
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </a>
        </div>

      </div>
    </div>
  );
}
