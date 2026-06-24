import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ValidateTransfer = () => {
  const [formData, setFormData] = useState({
    recipientName: '',
    iban: '',
    amount: '',
    note: ''
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bankInfo, setBankInfo] = useState({ valid: false, name: '' });

  const BANK_CODES = {
    "UNIL": "United Bank Limited (UBL)",
    "MEZN": "Meezan Bank",
    "SCBL": "Standard Chartered Bank Pakistan",
    "HABB": "Habib Bank Limited (HBL)",
    "MUCB": "MCB Bank",
    "ALFH": "Bank Alfalah",
    "NBPA": "National Bank of Pakistan",
    "BKIP": "Bank of Punjab",
    "JSBL": "JS Bank",
    "FAYS": "Faysal Bank"
  };

  useEffect(() => {
    const rawIban = formData.iban.replace(/\s/g, '').toUpperCase();
    const PAKISTAN_IBAN_REGEX = /^PK\d{2}[A-Z]{4}\d{16}$/;
    
    if (PAKISTAN_IBAN_REGEX.test(rawIban)) {
      const bankCode = rawIban.substring(4, 8);
      setBankInfo({
        valid: true,
        name: BANK_CODES[bankCode] || "Other Bank"
      });
    } else {
      setBankInfo({ valid: false, name: '' });
    }
  }, [formData.iban]);

  const handleIbanChange = (e) => {
    let val = e.target.value.toUpperCase();
    // Auto-formatting: PK12 ABCD 1234 5678 9012 3456
    val = val.replace(/[^A-Z0-9]/g, '');
    let formatted = '';
    for (let i = 0; i < val.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += val[i];
    }
    setFormData({ ...formData, iban: formatted.substring(0, 29) });
  };

  const handleValidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/v1/banking/validate-transfer`, {
        recipientName: formData.recipientName,
        iban: formData.iban.replace(/\s/g, ''),
        amountPKR: Number(formData.amount),
        transferNote: formData.note
      });
      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Validation failed. Check your input or server status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
      <div className="space-y-2">
        <h2 className="text-3xl font-display font-extrabold text-navy">
          Transfer Validator
        </h2>
        <p className="text-muted font-medium">
          Check if a payment request is safe before you hit send.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8 border border-border">
        <form onSubmit={handleValidate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Recipient Name</label>
            <input
              required
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              placeholder="e.g. Mohammad Asif Khan"
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-navy focus:bg-white transition-all outline-none font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Recipient IBAN</label>
            <div className="relative">
              <input
                required
                type="text"
                value={formData.iban}
                onChange={handleIbanChange}
                placeholder="PK00 BANK 0000 0000 0000 0000"
                className={`w-full p-4 bg-gray-50 border-2 rounded-xl focus:bg-white transition-all outline-none font-mono tracking-wider ${
                  bankInfo.valid ? 'border-emerald-200 focus:border-emerald-500' : 'border-gray-100 focus:border-navy'
                }`}
              />
              {bankInfo.valid && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-emerald-700 capitalize">{bankInfo.name}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Amount (PKR)</label>
              <input
                required
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-navy focus:bg-white transition-all outline-none font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted ml-1">Transfer Note</label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="What is this for?"
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-navy focus:bg-white transition-all outline-none font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-navy text-white rounded-xl font-bold text-lg shadow-lg hover:bg-[#152e55] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Evaluating Risk...
              </>
            ) : 'Validate Transfer'}
          </button>
        </form>
      </div>

      {result && <RiskCard result={result} />}
      
      {error && (
        <div className="bg-rose-50 border-2 border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold text-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}
    </div>
  );
};

const RiskCard = ({ result }) => {
  const { riskLevel, riskScore, behavioralFlags, aiSummary, proceedRecommendation, bankResolved } = result;

  const scoreColor = riskLevel === 'HIGH' ? 'text-danger' : riskLevel === 'MEDIUM' ? 'text-warn' : 'text-safe';
  const bgColor = riskLevel === 'HIGH' ? 'bg-danger/5' : riskLevel === 'MEDIUM' ? 'bg-warn/5' : 'bg-safe/5';
  const borderColor = riskLevel === 'HIGH' ? 'border-danger/20' : riskLevel === 'MEDIUM' ? 'border-warn/20' : 'border-safe/20';

  return (
    <div className={`rounded-2xl p-8 border-2 transition-all animate-fade-in-up ${bgColor} ${borderColor}`}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className={`w-3 h-3 rounded-full animate-pulse ${riskLevel === 'HIGH' ? 'bg-danger' : riskLevel === 'MEDIUM' ? 'bg-warn' : 'bg-safe'}`}></div>
             <span className={`text-xs font-black uppercase tracking-[0.2em] ${scoreColor}`}>{riskLevel} RISK LEVEL</span>
          </div>
          <h3 className="text-2xl font-display font-extrabold text-navy">Security Assessment</h3>
          <p className="text-sm text-muted font-medium mt-1">Transaction to {bankResolved}</p>
        </div>
        <div className="text-center">
           <div className={`text-5xl font-black font-mono transition-all duration-1000 ${scoreColor}`}>
             {riskScore}
           </div>
           <span className="text-[10px] font-bold text-muted uppercase tracking-widest">Risk Score</span>
        </div>
      </div>

      <div className="bg-white/60 p-5 rounded-xl border border-white/40 mb-8 backdrop-blur-sm">
        <p className="text-text font-semibold leading-relaxed">
          {aiSummary}
        </p>
      </div>

      {behavioralFlags && behavioralFlags.length > 0 && (
        <div className="space-y-4 mb-8">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-muted">Behavioral Indicators</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {behavioralFlags.map((flag, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/40 p-3 rounded-lg border border-white/20 text-xs font-bold text-navy">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-navy/40"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                {flag}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-navy/5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${riskLevel === 'HIGH' ? 'bg-danger text-white' : riskLevel === 'MEDIUM' ? 'bg-warn text-white' : 'bg-safe text-white'}`}>
             {riskLevel === 'HIGH' ? '✕' : riskLevel === 'MEDIUM' ? '!' : '✓'}
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted uppercase">Our Verdict</p>
            <p className="text-sm font-black text-navy">{proceedRecommendation.replace(/_/g, ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidateTransfer;
