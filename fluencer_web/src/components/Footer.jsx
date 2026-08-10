import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  MessageSquare, 
  FileText, 
  Download, 
  Heart,
  ArrowUpRight
} from 'lucide-react';

export default function Footer({ setActiveTab, onOpenContact }) {
  return (
    <footer className="bg-[#0B0B10] border-t border-white/10 pt-16 pb-12 px-4 lg:px-8 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-64 bg-purple-900/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D28FF] to-[#EC4899] p-[2px]">
                <div className="w-full h-full bg-[#0B0B10] rounded-[10px] flex items-center justify-center">
                  <img src="/icon.png" alt="Fluencer" className="w-7 h-7 object-contain" />
                </div>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                Fluencer<span className="text-[#EC4899]">.</span>
              </span>
            </div>

            <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
              Fluencer connects Brands and Influencers in a unified mobile ecosystem. Create campaigns, negotiate pricing, communicate with support, and lock deals securely with Escrow safety.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="badge-neon text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Verified Escrow Escrow
              </span>
              <span className="badge-gold text-xs">
                <Lock className="w-3.5 h-3.5 text-gold" />
                Deal Lock Security
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">Navigation & App Flow</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => { setActiveTab('how-it-works'); window.scrollTo(0,0); }} className="hover:text-purple-300 flex items-center gap-1">
                  How App Works <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('brand-flow'); window.scrollTo(0,0); }} className="hover:text-purple-300 flex items-center gap-1">
                  Brand Campaign Guide <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('influencer-flow'); window.scrollTo(0,0); }} className="hover:text-purple-300 flex items-center gap-1">
                  Influencer Applications <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('deal-lock'); window.scrollTo(0,0); }} className="hover:text-purple-300 flex items-center gap-1">
                  Live Deal Simulator <ArrowUpRight className="w-3 h-3 text-gray-500" />
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400">Legal & Play Store Compliance</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              <li>
                <button onClick={() => { setActiveTab('privacy'); window.scrollTo(0,0); }} className="hover:text-pink-300 flex items-center gap-1.5 font-semibold text-emerald-400">
                  <FileText className="w-3.5 h-3.5" />
                  Privacy Policy & Data Rights (Google Play link)
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-pink-300 flex items-center gap-1">
                  Contact App Support Team
                </button>
              </li>
            </ul>

            <div className="pt-2">
              <div className="p-3 bg-[#14141C] border border-white/10 rounded-2xl space-y-2">
                <span className="text-[11px] font-semibold text-white block">Download Fluencer App</span>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/5 border border-white/10 p-2 rounded-xl text-center text-[10px] text-gray-300 font-semibold">
                    🤖 Google Play
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 p-2 rounded-xl text-center text-[10px] text-gray-300 font-semibold">
                    🍏 App Store
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 Fluencer Platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Crafted for <span className="text-purple-400 font-semibold">Brands</span> & <span className="text-pink-400 font-semibold">Influencers</span> worldwide
          </p>
        </div>

      </div>
    </footer>
  );
}
