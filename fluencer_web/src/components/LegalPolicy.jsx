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
    <section id="privacy" className="py-20 px-4 lg:px-8 bg-[#0B0B10] text-gray-200">
      
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="badge-success mx-auto px-4 py-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Google Play & App Store Compliant</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Privacy Policy & <span className="gradient-text-primary">Data Protection</span>
          </h1>
          <p className="text-xs text-gray-400">
            Effective Date: {lastUpdated} • Fluencer Mobile Application & Web Ecosystem
          </p>
        </div>

        {/* Highlight Card for Store Reviewers */}
        <div className="glass-card p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-[#14141C] to-[#14141C]">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="space-y-1 text-xs sm:text-sm">
              <h3 className="font-bold text-white text-base">Key Privacy Guarantee for Brands & Influencers</h3>
              <p className="text-gray-300 leading-relaxed">
                Fluencer respects your personal and business data. In-app text chats between Brands, Influencers, and the Fluencer App Support team are used strictly for campaign matching, term negotiation, and Deal Lock escrow fulfillment. We do not sell your personal details to third-party data brokers.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Contents Grid */}
        <div className="space-y-8 text-sm">
          
          {/* Section 1: Overview */}
          <div className="glass-card-static p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              1. Overview & Scope
            </h2>
            <p className="text-gray-300 leading-relaxed">
              This Privacy Policy explains how <strong>Fluencer</strong> ("we", "us", or "our") collects, uses, stores, and protects information when you use our mobile application (Android & iOS) and web platform. Fluencer operates as an influencer marketing hub enabling Brands to post campaigns, Influencers to apply, and both parties to text, negotiate, and securely lock deals.
            </p>
          </div>

          {/* Section 2: Data Collection */}
          <div className="glass-card-static p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-400" />
              2. Information We Collect
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-[#121218] p-4 rounded-2xl border border-white/5 space-y-2">
                <h4 className="font-semibold text-purple-300 text-xs uppercase tracking-wider">A. For Brands</h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  <li>• Brand Name, official email & contact phone</li>
                  <li>• Campaign details, budgets & requirement briefs</li>
                  <li>• Payment & Escrow transaction logs</li>
                </ul>
              </div>

              <div className="bg-[#121218] p-4 rounded-2xl border border-white/5 space-y-2">
                <h4 className="font-semibold text-pink-300 text-xs uppercase tracking-wider">B. For Influencers</h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  <li>• Social media handles (Instagram, YouTube, etc.)</li>
                  <li>• Follower counts, engagement metrics & portfolio links</li>
                  <li>• Bank details / UPI ID for payout releases</li>
                </ul>
              </div>
            </div>

            <div className="bg-[#121218] p-4 rounded-2xl border border-white/5 space-y-2">
              <h4 className="font-semibold text-amber-300 text-xs uppercase tracking-wider">C. Communication & Chat Data</h4>
              <p className="text-xs text-gray-300">
                We store in-app messages sent between Brands, Influencers, and the Fluencer App team. This ensures verified Deal Locking, dispute resolution, and contract compliance.
              </p>
            </div>
          </div>

          {/* Section 3: How We Use Information */}
          <div className="glass-card-static p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" />
              3. How We Use Your Information
            </h2>
            <ul className="space-y-2 text-gray-300 text-xs sm:text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Campaign Matching:</strong> Displaying Brand campaigns to relevant Influencers based on niche & metrics.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>In-App Texting & Deal Lock:</strong> Facilitating live text conversations and locking contract terms into Escrow.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>App Support & Moderation:</strong> Allowing the Fluencer team to assist Brands and Influencers in resolving campaign inquiries.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Security & Fraud Prevention:</strong> Protecting payments, preventing fake accounts, and maintaining platform safety.</span>
              </li>
            </ul>
          </div>

          {/* Section 4: Data Storage & Security */}
          <div className="glass-card-static p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-gold" />
              4. Data Security & Storage
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              All user data and messages are stored on encrypted cloud infrastructure using TLS 1.3 in transit and AES-256 at rest. Access to campaign logs and communication is restricted solely to authorized project participants and support staff.
            </p>
          </div>

          {/* Section 5: Rights & Account Deletion */}
          <div className="glass-card-static p-6 sm:p-8 rounded-3xl border border-white/10 space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-400" />
              5. User Rights & Account Deletion
            </h2>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Users can request a copy of their stored profile data or request complete account deletion at any time by contacting our privacy desk. Upon account deletion request, all personal details and active campaign listings are permanently removed within 30 days.
            </p>
          </div>

          {/* Section 6: Contact Information */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-purple-500/30 space-y-4 bg-gradient-to-br from-[#14141C] to-[#1A1025]">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-400" />
              6. Contact Privacy & App Team
            </h2>
            <p className="text-xs text-gray-300">
              For privacy inquiries, Play Store compliance questions, or account assistance, reach out to our team directly:
            </p>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="bg-[#0B0B10] px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-white font-mono">support@fluencer.app</span>
              </div>
              <div className="bg-[#0B0B10] px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-pink-400" />
                <span className="text-white">Fluencer Help & Compliance Desk</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
