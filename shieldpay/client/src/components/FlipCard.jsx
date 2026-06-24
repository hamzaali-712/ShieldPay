import React, { useState } from 'react';

const FlipCard = ({ scenario, redFlags, verdict }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group perspective-1000 w-full h-[400px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full duration-700 preserve-3d transition-all ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front Side */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl shadow-xl border border-border p-8 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-navy/5 rounded-2xl flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-navy"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8 4h-4"/></svg>
          </div>
          <div className="space-y-4">
             <h3 className="text-xl font-display font-extrabold text-navy">New Message Received</h3>
             <div className="bg-gray-50 border border-gray-100 p-6 rounded-2xl text-sm font-medium italic text-text relative">
                <span className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-black text-muted border border-gray-100 rounded">SCENARIO</span>
                "{scenario}"
             </div>
          </div>
          <p className="text-xs font-bold text-muted uppercase tracking-widest animate-pulse">Click card to reveal truth</p>
        </div>

        {/* Back Side */}
        <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl shadow-xl p-8 flex flex-col justify-between ${verdict === 'SCAM' ? 'bg-danger text-white' : 'bg-safe text-white'}`}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Investigation Result</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold border border-white/20">{verdict}</span>
            </div>
            
            <h3 className="text-2xl font-display font-black mb-6 leading-tight">Why this is dangerous:</h3>
            
            <div className="space-y-4">
              {redFlags.map((flag, idx) => (
                <div key={idx} className="flex gap-3 bg-black/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 transition-all hover:bg-black/20">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <p className="text-sm font-semibold">{flag}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Scroll down to start quiz</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;
