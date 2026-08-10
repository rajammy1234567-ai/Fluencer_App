import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  MessageCircle, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase,
  Users,
  Flame
} from 'lucide-react';

export default function Hero({ onExplore, onOpenSimulator, onOpenPrivacy }) {
  return (
    <section className="relative pt-32 pb-20 px-4 lg:px-8 overflow-hidden bg-radial-glow">
      
      {/* Background Decorative Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-pink-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        
        {/* Top Badge */}
        <div className="flex justify-center mb-6">
          <div className="badge-neon py-1.5 px-4 rounded-full border border-purple-500/30 flex items-center gap-2 animate-bounce">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-200">
              Next-Gen Influencer & Brand Collaboration Hub
            </span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] font-['Plus_Jakarta_Sans']">
            Brands Post Campaigns<span className="text-[#EC4899]">.</span><br />
            Influencers Apply<span className="text-[#7C3AED]">.</span><br />
            <span className="gradient-text-primary">Deals Lock Securely.</span>
          </h1>

          <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            The complete ecosystem connecting <strong className="text-purple-300">Brands</strong> and <strong className="text-pink-300">Influencers</strong>. 
            Create campaigns, negotiate pricing in live chat, communicate with the Fluencer app team, and <strong className="text-emerald-400">lock contracts with escrow safety</strong>.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button 
              onClick={onOpenSimulator}
              className="btn-glow-pink py-3.5 px-6 text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Try Live Deal Lock Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              onClick={onExplore}
              className="btn-secondary py-3.5 px-6 text-sm"
            >
              <Briefcase className="w-4 h-4 text-purple-400" />
              <span>See App Workflow</span>
            </button>

            <button 
              onClick={onOpenPrivacy}
              className="btn-secondary py-3.5 px-5 text-sm bg-white/5 border-white/10"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Privacy Policy</span>
            </button>
          </div>

          {/* Feature Highlights Bar */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs text-gray-400">
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Brand Campaign Listing</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Influencer 1-Tap Apply</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-pink-400" />
              <span>Brand & App Team Support</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>Brand-Influencer Live Chat</span>
            </div>
          </div>
        </div>

        {/* Glass Dashboard Feature Mockup */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="glass-card-static p-4 sm:p-8 rounded-3xl border border-purple-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#14141C]/90 to-[#0B0B10]/95">
            
            {/* Header Mockup Bar */}
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="text-xs font-mono text-gray-400 ml-2">fluencer.app // campaign-dashboard</span>
              </div>
              <div className="badge-success text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Network Active
              </div>
            </div>

            {/* Mockup Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Brand Adds Campaign */}
              <div className="bg-[#121218] border border-white/10 rounded-2xl p-5 hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-neon text-xs">Brand Action</span>
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">1. Add Campaign</h3>
                <p className="text-xs text-gray-400 mb-4">Brands post budget, platform target (Instagram/YouTube), and deliverables.</p>
                <div className="bg-[#14141C] p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="text-[11px] font-semibold text-purple-300">Campaign: Summer Collection 2026</div>
                  <div className="text-[10px] text-gray-400 flex justify-between">
                    <span>Budget: ₹45,000</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Influencer Applies & Chat */}
              <div className="bg-[#121218] border border-white/10 rounded-2xl p-5 hover:border-pink-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-pink text-xs">Influencer & Chat</span>
                  <MessageCircle className="w-4 h-4 text-pink-400" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">2. Apply & Chat</h3>
                <p className="text-xs text-gray-400 mb-4">Influencers apply with quotes. Brand & Influencer negotiate via direct text.</p>
                <div className="bg-[#14141C] p-3 rounded-xl border border-white/5 space-y-2">
                  <div className="text-[10px] bg-purple-900/40 p-2 rounded-lg text-purple-200">
                    <strong>Influencer:</strong> Hi! I love the brand. Quote for 2 Reels + 3 Stories.
                  </div>
                  <div className="text-[10px] bg-pink-900/40 p-2 rounded-lg text-pink-200 text-right">
                    <strong>Brand:</strong> Perfect! Deal terms agreed.
                  </div>
                </div>
              </div>

              {/* Card 3: Deal Lock & App Verification */}
              <div className="bg-[#121218] border border-white/10 rounded-2xl p-5 hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="badge-gold text-xs">Deal Lock</span>
                  <Lock className="w-4 h-4 text-gold" />
                </div>
                <h3 className="font-bold text-white text-base mb-1">3. Lock Deal & Pay</h3>
                <p className="text-xs text-gray-400 mb-4">Click "Lock Deal" to freeze milestone terms. App holds escrow safely.</p>
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-xl text-center space-y-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    DEAL LOCKED #FL-8821
                  </div>
                  <div className="text-[10px] text-gray-300">Escrow Secured • Deliverables Pending</div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Stats Counter Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
          <div className="glass-card-static p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              10,000+
            </div>
            <div className="text-xs text-gray-400 mt-1 font-medium">Active Influencers</div>
          </div>

          <div className="glass-card-static p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-amber-400">
              500+
            </div>
            <div className="text-xs text-gray-400 mt-1 font-medium">Verified Brands</div>
          </div>

          <div className="glass-card-static p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              100%
            </div>
            <div className="text-xs text-gray-400 mt-1 font-medium">Escrow Protection</div>
          </div>

          <div className="glass-card-static p-4 rounded-2xl">
            <div className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-400">
              ₹50M+
            </div>
            <div className="text-xs text-gray-400 mt-1 font-medium">Campaign Volume</div>
          </div>
        </div>

      </div>
    </section>
  );
}
