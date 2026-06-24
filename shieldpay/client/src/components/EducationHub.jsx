import React, { useState } from 'react';
import FlipCard from './FlipCard';

const EducationHub = () => {
  const [activeModule, setActiveModule] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [quizState, setQuizState] = useState({ active: false, currentQ: 0, finished: false, answers: [] });

  const modules = [
    {
      title: "Fake Prize SMS",
      scenario: "Congratulations! You've won a Samsung Galaxy S24 in UBL's 25th Anniversary draw! Your ticket #UBL2025-7742 was selected. Claim your prize: bit.ly/ubl-win-2025 — Offer expires in 24 hours!",
      redFlags: ["Urgency/time pressure", "URL is not ubl.com", "UBL doesn't run prize draws via SMS", "No personalization"],
      verdict: "SCAM",
      questions: [
        { q: "What is the biggest red flag here?", options: ["The URL", "The prize value", "The company name"], correct: 0 },
        { q: "What should you do immediately?", options: ["Click the link", "Call UBL official number", "Forward to friends"], correct: 1 },
        { q: "Legitimate banks primarily contact you via?", options: ["Random SMS links", "Official app notifications", "WhatsApp messages"], correct: 1 }
      ]
    },
    {
        title: "WhatsApp Freelance Scam",
        scenario: "Client DMs you on WhatsApp: \"I need a logo ASAP. I'll pay Rs. 8,000 advance via JazzCash right now. Just send your number and full name. I'm in Dubai so can't do a call.\"",
        redFlags: ["Advance payment pressure", "No formal brief", "Requesting personal info upfront", "Can't do a call (verification failure)"],
        verdict: "SCAM",
        questions: [
          { q: "Why is the client avoiding a call?", options: ["They are busy", "They might be using a fake identity", "Poor signal"], correct: 1 },
          { q: "Where should freelance payments happen?", options: ["JazzCash/EasyPaisa directly", "Official platform (Fiverr/Upwork)", "Bank transfer before contract"], correct: 1 },
          { q: "Is 'Rs. 8000 advance' a sign of a good client?", options: ["Yes, they are generous", "No, it's often a bait for info", "Maybe, if they are from Dubai"], correct: 1 }
        ]
    },
    {
        title: "Spoofed Payment Gateway",
        scenario: "You're buying concert tickets online. The checkout page looks exactly like JazzCash. It asks for your card number, expiry, CVV, and your JazzCash PIN. The URL is: jazzc4sh-payments.pk",
        redFlags: ["URL has '4' not 'a'", "No HTTPS lock", "Asking for PIN (gateways never do)", "Pressure to complete"],
        verdict: "SCAM",
        questions: [
            { q: "What is wrong with the URL?", options: ["Too long", "Spelled with '4' instead of 'a'", "Ends in .pk"], correct: 1 },
            { q: "When should you enter your PIN?", options: ["When the page looks real", "Never on a website (only in official app)", "If the amount is small"], correct: 1 },
            { q: "What does 'Spoofed' mean?", options: ["Safe to use", "A fake copy of a real site", "A fast payment method"], correct: 1 }
        ]
    },
    {
        title: "Fake Scholarship Portal",
        scenario: "You see a Facebook ad: \"HEC & UBL Joint Scholarship 2025 — Rs. 50,000 for students! Apply now at hec-ubl-scholarship.com — Application fee: Rs. 500 via EasyPaisa\"",
        redFlags: ["Application fees for scholarships are always fake", "Domain is not hec.gov.pk", "Advertised on Facebook not official channels", "Vague eligibility"],
        verdict: "SCAM",
        questions: [
            { q: "What the biggest red flag in scholarship ads?", options: ["The scholarship amount", "The application fee", "The deadine"], correct: 1 },
            { q: "What is the official domain of HEC?", options: ["hec.gov.pk", "hec-scholarship.com", "hec.com.pk"], correct: 0 },
            { q: "UBL scholarships are usually found where?", options: ["Facebook groups", "Official UBL app or website", "WhatsApp status"], correct: 1 }
        ]
    },
    {
        title: "Advance Fee Fraud",
        scenario: "WhatsApp message: \"Brother, I'm selling my Honda Civic 2019 for only Rs. 18 lakh, going to Canada urgently. Send Rs. 50,000 advance to hold the car via IBFT. I'll deliver tomorrow.\"",
        redFlags: ["Below-market price", "IBFT advance for unverified deal", "Won't meet in person", "Pressure framing"],
        verdict: "SCAM",
        questions: [
            { q: "Why is the price so low?", options: ["The seller is generous", "To create urgent desire and bypass logic", "The car is old"], correct: 1 },
            { q: "What is an 'Advance Fee' scam?", options: ["Paying for something safely", "Paying money upfront for a promise that's never kept", "A discount for early payment"], correct: 1 },
            { q: "Safe way to buy a used car?", options: ["IBFT advance", "In-person inspection and document check", "Trusting the WhatsApp Seller"], correct: 1 }
        ]
    }
  ];

  const handleAnswer = (index) => {
    const isCorrect = index === modules[activeModule].questions[quizState.currentQ].correct;
    const newAnswers = [...quizState.answers, isCorrect];
    
    if (isCorrect) {
      setScore(s => s + 10);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }

    if (quizState.currentQ < 2) {
      setQuizState({ ...quizState, currentQ: quizState.currentQ + 1, answers: newAnswers });
    } else {
      setQuizState({ ...quizState, finished: true, answers: newAnswers });
      setCompletedModules([...completedModules, activeModule]);
    }
  };

  const currentModule = modules[activeModule];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">
      <header className="flex justify-between items-end">
        <div className="space-y-2">
          <h2 className="text-3xl font-display font-extrabold text-navy">Learn & Earn</h2>
          <p className="text-muted font-medium">Master the art of scam detection and earn badges.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-border text-center">
             <p className="text-[10px] font-black text-muted uppercase">Score</p>
             <p className="text-xl font-black text-navy">{score}</p>
          </div>
          <div className="bg-navy px-4 py-2 rounded-xl shadow-lg text-center text-white">
             <p className="text-[10px] font-black opacity-60 uppercase">Streak</p>
             <p className="text-xl font-black">{streak} 🔥</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-2">
           <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 ml-1">Learning Path</h4>
           {modules.map((m, idx) => (
             <button
               key={idx}
               onClick={() => {
                 setActiveModule(idx);
                 setQuizState({ active: false, currentQ: 0, finished: false, answers: [] });
               }}
               className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between group ${
                 activeModule === idx ? 'bg-navy text-white shadow-md scale-105' : 'bg-white hover:bg-gray-50 border border-border'
               }`}
             >
               <span className="text-xs font-bold truncate pr-2">{m.title}</span>
               {completedModules.includes(idx) ? (
                 <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><path d="M20 6 9 17l-5-5"/></svg>
                 </div>
               ) : (
                 <div className="w-2 h-2 rounded-full bg-gray-200 group-hover:bg-navy/20"></div>
               )}
             </button>
           ))}
        </aside>

        <div className="md:col-span-3 space-y-8">
           <FlipCard 
             scenario={currentModule.scenario} 
             redFlags={currentModule.redFlags} 
             verdict={currentModule.verdict} 
           />

           {!quizState.active && !quizState.finished && (
             <button
               onClick={() => setQuizState({ ...quizState, active: true })}
               className="w-full py-6 bg-navy text-white rounded-2xl font-black text-xl shadow-xl hover:shadow-navy/20 hover:-translate-y-1 transition-all flex items-center justify-center gap-4 group"
             >
               Start Module Quiz
               <svg className="group-hover:translate-x-2 transition-transform" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
             </button>
           )}

           {quizState.active && !quizState.finished && (
             <div className="bg-white p-8 rounded-2xl shadow-xl border border-border space-y-8 animate-fade-in-up">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-black text-navy uppercase tracking-widest">Question {quizState.currentQ + 1}/3</span>
                   <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className={`h-1.5 w-8 rounded-full ${i <= quizState.currentQ ? 'bg-navy' : 'bg-gray-100'}`}></div>
                      ))}
                   </div>
                </div>
                
                <h3 className="text-2xl font-display font-extrabold text-navy leading-snug">
                   {currentModule.questions[quizState.currentQ].q}
                </h3>

                <div className="space-y-3">
                   {currentModule.questions[quizState.currentQ].options.map((opt, i) => (
                     <button
                       key={i}
                       onClick={() => handleAnswer(i)}
                       className="w-full p-5 bg-gray-50 hover:bg-navy/5 border-2 border-gray-100 hover:border-navy text-left text-sm font-bold text-navy rounded-xl transition-all"
                     >
                       <span className="inline-block w-8 h-8 rounded-lg bg-white border border-border text-center leading-8 mr-4 text-xs font-black">
                         {String.fromCharCode(65 + i)}
                       </span>
                       {opt}
                     </button>
                   ))}
                </div>
             </div>
           )}

           {quizState.finished && (
             <div className="bg-emerald-50 p-10 rounded-2xl border-4 border-emerald-100 text-center space-y-6 animate-fade-in-up">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl mx-auto flex items-center justify-center border-4 border-emerald-200">
                   <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00A86B" strokeWidth="3"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10.01-3-3"/></svg>
                </div>
                <div className="space-y-2">
                   <h3 className="text-3xl font-display font-black text-emerald-900">Module Complete!</h3>
                   <p className="text-emerald-700 font-bold">You've mastered identifying {currentModule.title}.</p>
                </div>
                <div className="flex justify-center gap-2">
                   {quizState.answers.map((wasCorrect, i) => (
                     <div key={i} className={`px-4 py-2 rounded-lg font-black text-xs ${wasCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        Q{i+1}: {wasCorrect ? '✓' : '✕'}
                     </div>
                   ))}
                </div>
                <button
                  onClick={() => {
                    const next = (activeModule + 1) % modules.length;
                    setActiveModule(next);
                    setQuizState({ active: false, currentQ: 0, finished: false, answers: [] });
                  }}
                  className="px-8 py-3 bg-navy text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Next Challenge
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default EducationHub;
