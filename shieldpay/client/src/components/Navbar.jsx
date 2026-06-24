import React from 'react';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-navy text-white flex items-center justify-between px-6 z-50 shadow-lg">
      <div className="flex items-center gap-3">
        {/* ShieldPay Logo */}
        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-white"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
          </svg>
        </div>
        <span className="text-xl font-display font-extrabold tracking-tight">ShieldPay</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Official Entry</span>
          <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full border border-white/10">
            UBL Hackathon 2026
          </span>
        </div>
        {/* Mobile Badge */}
        <div className="md:hidden bg-white/20 w-8 h-8 rounded-full flex items-center justify-center border border-white/10">
          <span className="text-[10px] font-bold">26</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
