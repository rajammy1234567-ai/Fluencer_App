import React, { useState } from 'react';
import { 
  Send, 
  Lock, 
  Shield, 
  Building2, 
  User, 
  Headphones, 
  RefreshCw,
  FileCheck
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
    <section id="deal-lock" style={{ padding: '100px 0', backgroundColor: '#121218', width: '100%' }}>
      <div className="site-container-narrow">
        
        {/* Section Header */}
        <div style={{ textAlign: 'center', margin: '0 auto 40px auto' }}>
          <div className="badge-gold" style={{ marginBottom: '16px' }}>
            <Lock style={{ width: '14px', height: '14px', color: '#F5A623' }} />
            <span>Interactive Deal Lock Engine</span>
          </div>
          <h2 style={{ fontSize: '42px', fontWeight: '800', letterSpacing: '-0.5px', color: '#FFFFFF', marginBottom: '16px' }}>
            Live Chat & <span className="gradient-gold">Deal Lock Visualizer</span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.7)', lineHeight: '1.6' }}>
            Experience how Brands and Influencers text inside the app, consult with the Fluencer App team, and click <strong style={{ color: '#34D399' }}>Lock Deal</strong> to activate escrow security.
          </p>
        </div>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: '#14141C',
          padding: '16px 24px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '24px'
        }}>
          {/* Role Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Switch View:</span>
            <button
              onClick={() => setActiveRole('brand')}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: activeRole === 'brand' ? '#7C3AED' : 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Building2 style={{ width: '14px', height: '14px' }} />
              Brand View
            </button>
            <button
              onClick={() => setActiveRole('influencer')}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: activeRole === 'influencer' ? '#EC4899' : 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <User style={{ width: '14px', height: '14px' }} />
              Influencer View
            </button>
            <button
              onClick={() => setActiveRole('app')}
              style={{
                padding: '6px 14px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                background: activeRole === 'app' ? '#D97706' : 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Headphones style={{ width: '14px', height: '14px' }} />
              App Team View
            </button>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleToggleLock}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                background: isLocked ? '#059669' : 'linear-gradient(135deg, #7C3AED, #EC4899)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: isLocked ? '0 4px 16px rgba(16, 185, 129, 0.4)' : '0 4px 16px rgba(236, 72, 153, 0.4)'
              }}
            >
              <Lock style={{ width: '16px', height: '16px' }} />
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
              style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div className="glass-card-static" style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)', background: '#0B0B10' }}>
          
          {/* Header */}
          <div style={{ background: '#14141C', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                alt="Avatar" 
              />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ZARA India × Ria Sharma
                  <span className="badge-neon" style={{ fontSize: '10px', padding: '2px 8px' }}>Active Negotiation</span>
                </h4>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Campaign ID: #CAMP-8841 • Budget: ₹35,000</p>
              </div>
            </div>

            <div style={{
              padding: '6px 14px',
              borderRadius: '12px',
              border: isLocked ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 166, 35, 0.4)',
              background: isLocked ? 'rgba(6, 78, 59, 0.5)' : 'rgba(120, 53, 15, 0.5)',
              color: isLocked ? '#6EE7B7' : '#FDE68A',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Shield style={{ width: '14px', height: '14px' }} />
              <span>{isLocked ? 'Escrow Funded & Locked' : 'Pending Deal Lock'}</span>
            </div>
          </div>

          {/* Messages */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '420px', overflowY: 'auto', background: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
            {messages.map((msg) => {
              const isBrand = msg.sender === 'brand';
              const isApp = msg.sender === 'app';
              return (
                <div 
                  key={msg.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    maxWidth: '80%',
                    marginLeft: isBrand ? 'auto' : '0',
                    marginRight: isBrand ? '0' : 'auto',
                    flexDirection: isBrand ? 'row-reverse' : 'row'
                  }}
                >
                  {!isApp && (
                    <img 
                      src={msg.avatar} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                      alt="User" 
                    />
                  )}

                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '16px',
                    fontSize: '13px',
                    background: isApp 
                      ? 'linear-gradient(135deg, rgba(88, 28, 135, 0.7), rgba(131, 24, 67, 0.7))' 
                      : isBrand 
                      ? 'linear-gradient(135deg, #6D28FF, #7C3AED)' 
                      : '#14141C',
                    border: isApp ? '1px solid rgba(168, 85, 247, 0.4)' : isBrand ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    color: '#FFFFFF',
                    width: isApp ? '100%' : 'auto'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: '11px', fontWeight: '600', opacity: 0.8, marginBottom: '4px' }}>
                      <span>{msg.name}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p style={{ margin: 0, lineHeight: '1.5' }}>{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {isLocked && (
              <div style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'rgba(6, 78, 59, 0.4)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6EE7B7',
                textAlign: 'center',
                maxWidth: '500px',
                margin: '0 auto'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>
                  <FileCheck style={{ width: '18px', height: '18px', color: '#34D399' }} />
                  Binding Contract Generated & Escrow Locked
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  Influencer can now submit draft content. Payment will release immediately upon Brand approval inside Fluencer App.
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} style={{ background: '#14141C', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase' }}>
              {activeRole}:
            </span>
            <input 
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={`Type message as ${activeRole}...`}
              style={{
                flex: 1,
                background: '#0B0B10',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '10px 16px',
                fontSize: '13px',
                color: '#FFFFFF',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              className="btn-primary"
              style={{ fontSize: '12px', padding: '10px 20px' }}
            >
              <Send style={{ width: '14px', height: '14px' }} />
              <span>Send</span>
            </button>
          </form>

        </div>

      </div>
    </section>
  );
}
