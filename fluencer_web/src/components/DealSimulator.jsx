import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  CheckCircle2, 
  Shield, 
  Building2, 
  User, 
  Headphones, 
  RefreshCw,
  Sparkles,
  FileCheck,
  Zap
} from 'lucide-react';

export default function DealSimulator() {
  const [activeRole, setActiveRole] = useState('brand');
  const [isLocked, setIsLocked] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'brand',
      name: 'ZARA Brand Official',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      text: 'Hey Ria! Loved your recent fashion reel. We would love to collaborate on our Summer Streetwear Campaign.',
      time: '10:14 AM'
    },
    {
      id: 2,
      sender: 'influencer',
      name: 'Ria Sharma (@ria.style)',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      text: 'Hi Zara team! Thank you so much. I saw the campaign post on Fluencer App. My rate is ₹35,000 for 2 Instagram Reels + 3 Stories.',
      time: '10:16 AM'
    },
    {
      id: 3,
      sender: 'app',
      name: 'Fluencer App Support',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      text: '⚡ Fluencer System: Campaign requirements verified. Brand Escrow deposit ready.',
      time: '10:17 AM'
    },
    {
      id: 4,
      sender: 'brand',
      name: 'ZARA Brand Official',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      text: '₹35,000 works for us! Let us lock the deal on the app so the budget goes into safe Escrow.',
      time: '10:18 AM'
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: activeRole,
      name: activeRole === 'brand' ? 'ZARA Brand Official' : activeRole === 'influencer' ? 'Ria Sharma' : 'Fluencer App Support',
      avatar: activeRole === 'brand' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' 
        : activeRole === 'influencer' 
        ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80'
        : 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMsg('');
  };

  const handleToggleLock = () => {
    setIsLocked(!isLocked);
    if (!isLocked) {
      const lockMsg = {
        id: Date.now(),
        sender: 'app',
        name: 'Fluencer Deal Engine',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
        text: '🔒 DEAL LOCKED! ₹35,000 locked in Fluencer Escrow #FL-9912. Terms & Deliverables binding.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, lockMsg]);
    }
  };

  return (
    <section id="deal-lock" className="py-20 px-4 lg:px-8 bg-[#121218] relative">
      
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="badge-gold mx-auto px-4 py-1">
            <Lock className="w-4 h-4 text-gold" />
            <span>Interactive Deal Lock Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans']">
            Live Chat & <span className="gradient-text-gold">Deal Lock Visualizer</span>
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            Experience how Brands and Influencers text inside the app, consult with the Fluencer App team, and click <strong className="text-emerald-400">Lock Deal</strong> to activate escrow security.
          </p>
        </div>

        {/* Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14141C] p-4 rounded-2xl border border-white/10">
          
          {/* Role Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">Switch View:</span>
            <button
              onClick={() => setActiveRole('brand')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeRole === 'brand'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Brand View
            </button>
            <button
              onClick={() => setActiveRole('influencer')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeRole === 'influencer'
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Influencer View
            </button>
            <button
              onClick={() => setActiveRole('app')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeRole === 'app'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              App Team View
            </button>
          </div>

          {/* Action Button: Lock Deal */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleLock}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
                isLocked
                  ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{isLocked ? 'DEAL LOCKED (#FL-9912)' : 'CLICK TO LOCK DEAL'}</span>
            </button>

            <button
              onClick={() => {
                setIsLocked(false);
                setMessages([
                  {
                    id: 1,
                    sender: 'brand',
                    name: 'ZARA Brand Official',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                    text: 'Hey Ria! Loved your recent fashion reel. We would love to collaborate on our Summer Streetwear Campaign.',
                    time: '10:14 AM'
                  },
                  {
                    id: 2,
                    sender: 'influencer',
                    name: 'Ria Sharma (@ria.style)',
                    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
                    text: 'Hi Zara team! Thank you so much. I saw the campaign post on Fluencer App. My rate is ₹35,000 for 2 Instagram Reels + 3 Stories.',
                    time: '10:16 AM'
                  }
                ]);
              }}
              title="Reset Simulator"
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Chat Window Mockup */}
        <div className="glass-card-static rounded-3xl border border-white/15 overflow-hidden shadow-2xl bg-[#0B0B10]">
          
          {/* Top Bar of Chat */}
          <div className="bg-[#14141C] p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                  className="w-10 h-10 rounded-full object-cover border border-purple-500/50" 
                  alt="Avatar" 
                />
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#14141C] absolute bottom-0 right-0" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  ZARA India × Ria Sharma
                  <span className="badge-neon text-[10px] px-2 py-0">Active Negotiation</span>
                </h4>
                <p className="text-xs text-gray-400">Campaign ID: #CAMP-8841 • Budget: ₹35,000</p>
              </div>
            </div>

            {/* Escrow Status Tag */}
            <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              isLocked 
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' 
                : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
            }`}>
              <Shield className="w-4 h-4" />
              <span>{isLocked ? 'Escrow Funded & Locked' : 'Pending Deal Lock'}</span>
            </div>
          </div>

          {/* Messages Body */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[420px] overflow-y-auto bg-grid-pattern">
            
            {messages.map((msg) => {
              const isBrand = msg.sender === 'brand';
              const isApp = msg.sender === 'app';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-3 max-w-xl ${
                    isBrand ? 'ml-auto flex-row-reverse' : isApp ? 'mx-auto max-w-lg' : 'mr-auto'
                  }`}
                >
                  {!isApp && (
                    <img 
                      src={msg.avatar} 
                      className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10" 
                      alt="User" 
                    />
                  )}

                  <div className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                    isApp 
                      ? 'bg-gradient-to-r from-purple-900/60 to-pink-900/60 border border-purple-500/40 text-purple-200 text-center w-full shadow-lg' 
                      : isBrand 
                      ? 'bg-gradient-to-r from-[#6D28FF] to-[#7C3AED] text-white rounded-tr-none' 
                      : 'bg-[#14141C] border border-white/10 text-gray-200 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-4 font-semibold text-[10px] text-gray-300">
                      <span>{msg.name}</span>
                      <span className="opacity-70">{msg.time}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isLocked && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-center space-y-2 max-w-lg mx-auto shadow-2xl animate-pulse">
                <div className="flex items-center justify-center gap-2 font-bold text-sm text-emerald-300">
                  <FileCheck className="w-5 h-5 text-emerald-400" />
                  Binding Contract Generated & Escrow Locked
                </div>
                <p className="text-xs text-gray-300">
                  Influencer can now submit draft content. Payment will release immediately upon Brand approval inside Fluencer App.
                </p>
              </div>
            )}

          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 bg-[#14141C] border-t border-white/10 flex items-center gap-3">
            <span className="text-xs text-gray-400 font-semibold px-2">
              Typing as <strong className="text-purple-300 uppercase">{activeRole}</strong>:
            </span>
            <input 
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`Type message as ${activeRole}...`}
              className="flex-1 bg-[#0B0B10] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
            <button 
              type="submit"
              className="btn-primary text-xs py-2.5 px-4"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

        </div>

      </div>
    </section>
  );
}
