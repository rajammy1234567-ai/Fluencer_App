import React, { useState } from 'react';
import { 
  PlusCircle, 
  Send, 
  MessageSquare, 
  Lock, 
  ShieldCheck, 
  CheckCircle, 
  Smartphone,
  Layers,
  Sparkles,
  UserCheck,
  Building2,
  Headphones,
  ArrowRight
} from 'lucide-react';

export default function HowItWorks({ onOpenSimulator }) {
  const [activeWorkflowTab, setActiveWorkflowTab] = useState('all');

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
      accentColor: 'text-purple-400',
      borderGlow: 'border-purple-500/30'
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
      accentColor: 'text-pink-400',
      borderGlow: 'border-pink-500/30'
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
      accentColor: 'text-gold',
      borderGlow: 'border-amber-500/30'
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
      accentColor: 'text-purple-300',
      borderGlow: 'border-purple-500/40'
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
      accentColor: 'text-emerald-400',
      borderGlow: 'border-emerald-500/40'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 lg:px-8 relative bg-[#0B0B10]">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-pink-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="badge-neon mx-auto px-4 py-1">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Complete App Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
            How <span className="gradient-text-primary">Fluencer Works</span> Step-by-Step
          </h2>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            From campaign creation to direct chat, App team support, and secure Deal Locking — here is how Brands and Influencers collaborate seamlessly inside the mobile app.
          </p>
        </div>

        {/* Roles Filter Selector */}
        <div className="flex justify-center mb-12">
          <div className="bg-[#14141C] p-1.5 rounded-2xl border border-white/10 flex gap-2">
            <button
              onClick={() => setActiveWorkflowTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeWorkflowTab === 'all'
                  ? 'bg-gradient-to-r from-[#6D28FF] to-[#7C3AED] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Full 5-Step Workflow
            </button>

            <button
              onClick={() => setActiveWorkflowTab('brand')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeWorkflowTab === 'brand'
                  ? 'bg-gradient-to-r from-[#6D28FF] to-[#EC4899] text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Brand Journey
            </button>

            <button
              onClick={() => setActiveWorkflowTab('influencer')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeWorkflowTab === 'influencer'
                  ? 'bg-gradient-to-r from-[#EC4899] to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Influencer Journey
            </button>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="space-y-8 relative">
          
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx}
                className={`glass-card p-6 sm:p-8 rounded-3xl border ${step.borderGlow} relative overflow-hidden transition-all duration-300`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Number & Icon */}
                  <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#14141C] to-[#121218] border border-white/15 flex items-center justify-center shadow-inner">
                        <Icon className={`w-7 h-7 ${step.accentColor}`} />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-gray-400 tracking-wider">STEP</span>
                        <div className="text-3xl font-extrabold font-mono text-white">{step.stepNumber}</div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`${step.badgeClass} text-xs`}>{step.badge}</span>
                    </div>
                  </div>

                  {/* Middle Column: Details */}
                  <div className="lg:col-span-6 space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-white font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-purple-300 font-medium italic bg-purple-950/40 p-2.5 rounded-xl border border-purple-800/30">
                      💡 {step.hindiDesc}
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Right Column: Key Takeaways */}
                  <div className="lg:col-span-3 bg-[#121218] p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="text-xs font-semibold text-gray-300 border-b border-white/10 pb-2 flex items-center justify-between">
                      <span>Key Features</span>
                      <Sparkles className="w-3.5 h-3.5 text-gold" />
                    </div>
                    <ul className="space-y-1.5 text-xs text-gray-400">
                      {step.details.map((detail, dIdx) => (
                        <li key={dIdx} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </div>
            );
          })}

        </div>

        {/* Callout Box to Try Deal Simulator */}
        <div className="mt-16 glass-card-static p-8 rounded-3xl border border-pink-500/30 text-center bg-gradient-to-r from-[#14141C] via-[#1A1025] to-[#14141C] relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="badge-pink text-xs">Interactive Feature</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Want to see how Brand & Influencer text and lock deals live?
            </h3>
            <p className="text-sm text-gray-300">
              Try our embedded deal locking visualizer right here in your browser to experience the real-time chat and contract confirmation.
            </p>
            <button 
              onClick={onOpenSimulator}
              className="btn-glow-pink py-3 px-6 text-xs mx-auto"
            >
              <Lock className="w-4 h-4" />
              <span>Launch Live Deal Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
