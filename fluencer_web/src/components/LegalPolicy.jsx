import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  CheckCircle, 
  Mail, 
  Building2, 
  UserCheck, 
  Eye,
  Server,
  HelpCircle
} from 'lucide-react';

export default function LegalPolicy() {
  const lastUpdated = "August 10, 2026";

  return (
    <section id="privacy" style={{ padding: '100px 0', backgroundColor: '#0B0B10', color: 'rgba(255,255,255,0.8)', width: '100%' }}>
      <div className="site-container-narrow">
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div className="badge-success" style={{ marginBottom: '16px' }}>
            <ShieldCheck style={{ width: '14px', height: '14px', color: '#34D399' }} />
            <span>Google Play & App Store Compliant</span>
          </div>
          <h1 className="gradient-heading" style={{ fontSize: '42px', fontWeight: '800', marginBottom: '12px' }}>
            Privacy Policy & Data Protection
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
            Effective Date: {lastUpdated} • Fluencer Mobile Application & Web Ecosystem
          </p>
        </div>

        {/* Highlight Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', borderColor: 'rgba(16, 185, 129, 0.4)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Lock style={{ width: '24px', height: '24px', color: '#34D399' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '4px' }}>Key Privacy Guarantee for Brands & Influencers</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                Fluencer respects your personal and business data. In-app text chats between Brands, Influencers, and the Fluencer App Support team are used strictly for campaign matching, term negotiation, and Deal Lock escrow fulfillment. We do not sell your personal details to third-party data brokers.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="glass-card-static" style={{ padding: '24px', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Building2 style={{ width: '20px', height: '20px', color: '#C084FC' }} />
              1. Overview & Scope
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
              This Privacy Policy explains how <strong>Fluencer</strong> ("we", "us", or "our") collects, uses, stores, and protects information when you use our mobile application (Android & iOS) and web platform. Fluencer operates as an influencer marketing hub enabling Brands to post campaigns, Influencers to apply, and both parties to text, negotiate, and securely lock deals.
            </p>
          </div>

          <div className="glass-card-static" style={{ padding: '24px', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText style={{ width: '20px', height: '20px', color: '#F472B6' }} />
              2. Information We Collect
            </h2>
            <div className="grid-2" style={{ gap: '16px' }}>
              <div style={{ background: '#121218', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#C084FC', textTransform: 'uppercase', marginBottom: '8px' }}>A. For Brands</h4>
                <ul style={{ listStyle: 'none', fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>• Brand Name, official email & contact phone</li>
                  <li>• Campaign details, budgets & requirement briefs</li>
                  <li>• Payment & Escrow transaction logs</li>
                </ul>
              </div>
              <div style={{ background: '#121218', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#F472B6', textTransform: 'uppercase', marginBottom: '8px' }}>B. For Influencers</h4>
                <ul style={{ listStyle: 'none', fontSize: '12px', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>• Social media handles (Instagram, YouTube, etc.)</li>
                  <li>• Follower counts, engagement metrics & portfolio links</li>
                  <li>• Bank details / UPI ID for payout releases</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-card-static" style={{ padding: '24px', borderRadius: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Eye style={{ width: '20px', height: '20px', color: '#34D399' }} />
              3. How We Use Your Information
            </h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
              <li style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: '#34D399', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>Campaign Matching:</strong> Displaying Brand campaigns to relevant Influencers based on niche & metrics.</span>
              </li>
              <li style={{ display: 'flex', gap: '8px' }}>
                <CheckCircle style={{ width: '16px', height: '16px', color: '#34D399', flexShrink: 0, marginTop: '2px' }} />
                <span><strong>In-App Texting & Deal Lock:</strong> Facilitating live text conversations and locking contract terms into Escrow.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '24px', borderRadius: '20px', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Mail style={{ width: '20px', height: '20px', color: '#EC4899' }} />
              4. Contact Privacy & App Team
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
              For privacy inquiries, Play Store compliance questions, or account assistance, reach out to our team directly:
            </p>
            <div style={{ display: 'inline-flex', gap: '12px', background: '#0B0B10', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '13px', color: '#FFFFFF' }}>
              <Mail style={{ width: '16px', height: '16px', color: '#A855F7' }} />
              <span style={{ fontFamily: 'monospace' }}>support@fluencer.app</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
