import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  MessageSquare, 
  Lock, 
  FileText, 
  Download, 
  Menu, 
  X,
  PhoneCall
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenContact }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'how-it-works', label: 'How It Works', icon: Layers },
    { id: 'brand-flow', label: 'For Brands', icon: MessageSquare },
    { id: 'influencer-flow', label: 'For Influencers', icon: ShieldCheck },
    { id: 'deal-lock', label: 'Deal Lock', icon: Lock },
    { id: 'privacy', label: 'Privacy Policy', icon: FileText },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('overview')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#6D28FF] to-[#EC4899] p-[2px] shadow-lg shadow-[#6D28FF]/40">
            <div className="w-full h-full bg-[#0B0B10] rounded-[10px] flex items-center justify-center overflow-hidden">
              <img 
                src="/icon.png" 
                alt="Fluencer Logo" 
                className="w-8 h-8 object-contain transform group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span className="hidden font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 text-lg">F</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
                Fluencer<span className="text-[#EC4899]">.</span>
              </span>
              <span className="badge-neon text-[10px] px-2 py-0.5">App & Web</span>
            </div>
            <p className="text-[10px] text-gray-400 tracking-wider">COLLABORATION PLATFORM</p>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-1 bg-[#14141C]/80 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6D28FF] to-[#7C3AED] text-white shadow-md shadow-[#6D28FF]/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={onOpenContact}
            className="btn-secondary text-xs px-4 py-2"
          >
            <PhoneCall className="w-3.5 h-3.5 text-pink-400" />
            <span>Contact App Support</span>
          </button>
          
          <button 
            onClick={() => handleNavClick('how-it-works')}
            className="btn-primary text-xs px-4 py-2"
          >
            <Download className="w-3.5 h-3.5 text-white" />
            <span>Get App</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 flex flex-col gap-2 pb-4 bg-[#0B0B10]/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6D28FF] to-[#7C3AED] text-white'
                    : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-purple-400" />
                {item.label}
              </button>
            );
          })}

          <div className="pt-2 flex flex-col gap-2 border-t border-white/10 mt-2">
            <button 
              onClick={() => { onOpenContact(); setMobileMenuOpen(false); }}
              className="btn-secondary w-full justify-center text-xs py-2.5"
            >
              <PhoneCall className="w-4 h-4 text-pink-400" />
              <span>Contact Support & App Team</span>
            </button>
            <button 
              onClick={() => { handleNavClick('how-it-works'); }}
              className="btn-primary w-full justify-center text-xs py-2.5"
            >
              <Download className="w-4 h-4" />
              <span>Download Mobile App</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
