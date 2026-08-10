import React, { useState } from 'react';
import { X, Send, CheckCircle2, PhoneCall, Mail, Building2, User } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'brand',
    message: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card-static w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-purple-500/30 bg-[#14141C] relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">Message Sent Successfully!</h3>
            <p className="text-xs text-gray-300 max-w-xs mx-auto">
              Thank you for reaching out. The Fluencer App Support team will respond to your email within 24 hours.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="btn-primary text-xs py-2.5 px-6 mx-auto"
            >
              Back to Website
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="badge-pink text-xs">
                <PhoneCall className="w-3.5 h-3.5" />
                App Team Support Desk
              </div>
              <h3 className="text-2xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                Talk to Fluencer Team
              </h3>
              <p className="text-xs text-gray-400">
                Brands & Influencers can submit campaign inquiries, integration questions, or support requests.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0B10] rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'brand' })}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'brand' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  I'm a Brand
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'influencer' })}
                  className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    formData.role === 'influencer' ? 'bg-pink-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  I'm an Influencer
                </button>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Your Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0B0B10] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. rahul@brand.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#0B0B10] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Message / Inquiry</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Describe your campaign requirement or app query..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0B0B10] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <button 
                type="submit"
                className="btn-glow-pink w-full justify-center py-3 text-xs"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry to App Team</span>
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
}
