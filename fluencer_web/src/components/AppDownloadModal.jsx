import React from 'react';
import { X, Download, Smartphone, QrCode, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

export default function AppDownloadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  // EAS Expo build artifact or direct APK link
  const apkDownloadUrl = "https://expo.dev/accounts/krishna73/projects/Influish_Frontend/builds";

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
        maxWidth: '520px',
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
            Install the Fluencer Android APK built with Expo & EAS, or access Google Play & App Store releases.
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                  Download Android APK (EAS Build)
                </span>
                <span style={{ fontSize: '11px', color: '#34D399', fontWeight: '600' }}>
                  Version 1.0.0 • Verified APK Build
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
              padding: '12px',
              fontSize: '13px',
              fontWeight: '700'
            }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            <span>Download APK / EAS Build Artifact</span>
            <ExternalLink style={{ width: '14px', height: '14px' }} />
          </a>
        </div>

        {/* Store Options Grid */}
        <div className="grid-2" style={{ gap: '12px' }}>
          
          <div style={{
            background: '#121218',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '14px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>Google Play Store</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Listing Submitted</span>
          </div>

          <div style={{
            background: '#121218',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '14px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <span style={{ fontSize: '18px' }}>🍏</span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>Apple App Store</span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>TestFlight Ready</span>
          </div>

        </div>

        {/* Footer Guarantee */}
        <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'center', gap: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', textAlign: 'center', margin: '0 auto' }}>
          <ShieldCheck style={{ width: '16px', height: '16px', color: '#34D399' }} />
          <span>100% Virus Free • Powered by Expo & EAS Build</span>
        </div>

      </div>
    </div>
  );
}
