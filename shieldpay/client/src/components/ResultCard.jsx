import React, { useEffect, useState } from 'react';

const ResultCard = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md border-l-4 border-gray-200 p-6 space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded-md skeleton"></div>
        <div className="h-4 w-full bg-gray-200 rounded-md skeleton"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded-md skeleton"></div>
        <div className="pt-4 space-y-2">
          <div className="h-2 w-full bg-gray-100 rounded-full"></div>
          <div className="h-4 w-12 bg-gray-100 rounded-md"></div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { classification, confidenceScore, threatType, redFlags, explanation, recommendedAction } = result;

  const config = {
    SAFE: { color: '#00A86B', label: 'Safe', badge: 'bg-emerald-100 text-emerald-800' },
    SUSPICIOUS: { color: '#D97706', label: 'Suspicious', badge: 'bg-amber-100 text-amber-800' },
    DANGEROUS: { color: '#DC2626', label: 'Dangerous', badge: 'bg-rose-100 text-rose-800' }
  };

  const { color, label, badge } = config[classification] || config.SUSPICIOUS;

  return (
    <div 
      className="bg-white rounded-xl shadow-md border-l-4 overflow-hidden transition-all duration-500 animate-fade-in-up"
      style={{ borderLeftColor: color }}
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badge}`}>
              {label}
            </span>
            <h3 className="text-xl font-bold mt-2 text-navy">
              {threatType || "Content Analysis"}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-navy/80">
              {confidenceScore}<span className="text-sm text-muted">%</span>
            </span>
            <p className="text-[10px] text-muted uppercase font-bold">Confidence</p>
          </div>
        </div>

        {/* Confidence Meter */}
        <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${confidenceScore}%`, 
              backgroundColor: color 
            }}
          />
        </div>

        <p className="text-text font-medium leading-relaxed mb-6">
          {explanation}
        </p>

        {redFlags && redFlags.length > 0 && (
          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted">Red Flags Detected</h4>
            <div className="space-y-2">
              {redFlags.map((flag, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm font-medium animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <svg className="text-rose-500 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  {flag}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-navy/5 rounded-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-navy"><path d="m22 10-6 6-6-6"/><path d="M16 4v12"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Recommended Action</p>
              <p className="text-sm font-bold text-navy">{recommendedAction}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
