import React, { useState } from 'react';
import axios from 'axios';
import ResultCard from './ResultCard';

const ScanContent = () => {
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('sms');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const samples = {
    sms: `🚨 URGENT: Your UBL account has been SUSPENDED due to suspicious activity! \nTo avoid permanent closure, verify your identity within 2 hours.\nClick here: http://ubl-verify-pk.netlify.app/secure\nEnter your CNIC + ATM PIN to reactivate. \nUBL Customer Care: 111-825-888`,
    whatsapp: `Hi! I found your profile on Fiverr. I want to order a logo design for Rs. 15,000. \nI'll send payment via JazzCash advance before you start. \nJust send me your JazzCash number and full name. I'm traveling so reply fast — need it today!`,
    url: `http://jazzcash-login-portal-pk.xyz/verify-account`,
    email: `Subject: HEC Scholarship Fund Update\n\nDear Student,\nYour annual scholarship of Rs. 120,000 has been approved. To claim your first installment, wire a processing fee of Rs. 1,000 to the HEC Treasurer via EasyPaisa: 0345-XXXXXXX.`,
    other: `Facebook Ad: "Get an iPhone 15 for just Rs. 5,000! Warehouse clearance sale. Limited stock. DM to pay via Bank Transfer."`
  };

  const handleTrySample = () => {
    setContent(samples[contentType] || samples.sms);
  };

  const handleScan = async () => {
    if (!content.trim()) return;
    
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/analyze/content`, {
        content,
        contentType
      });
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to scan content. Please check if backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-extrabold text-navy leading-tight">
          Scam Content Analyzer
        </h2>
        <p className="text-muted font-medium">
          Paste any message, URL, or email to check if it's a scam.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-1 border border-border">
        <div className="flex gap-1 p-1">
          {['sms', 'whatsapp', 'url', 'email', 'other'].map((type) => (
            <button
              key={type}
              onClick={() => setContentType(type)}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                contentType === type ? 'bg-navy text-white' : 'text-muted hover:bg-gray-100'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="relative group">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste that sus message here..."
          className="w-full h-48 p-5 bg-white border-2 border-gray-100 rounded-2xl focus:border-navy focus:ring-0 transition-all text-text font-medium leading-relaxed resize-none shadow-sm"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted bg-gray-100 px-2 py-1 rounded">
            {content.length} CHARS
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleScan}
          disabled={loading || !content.trim()}
          className={`flex-[2] py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
            loading || !content.trim() 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-navy text-white hover:bg-[#152e55] active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Analysing with fraud radar...
            </span>
          ) : (
            'Scan Content'
          )}
        </button>
        
        <button
          onClick={handleTrySample}
          className="flex-1 py-4 bg-white border-2 border-navy text-navy font-bold rounded-xl hover:bg-navy/5 transition-all text-sm"
        >
          Try a Sample
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold text-sm animate-fade-in-up">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <ResultCard result={result} isLoading={loading} />
    </div>
  );
};

export default ScanContent;
