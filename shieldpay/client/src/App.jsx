import React, { useState } from 'react';
import Navbar from './components/Navbar';
import TabLayout from './components/TabLayout';

import ScanContent from './components/ScanContent';
import ValidateTransfer from './components/ValidateTransfer';
import EducationHub from './components/EducationHub';
import ShieldBot from './components/ShieldBot';

function App() {
  const [activeTab, setActiveTab] = useState('scan');

  const tabs = [
    { 
      id: 'scan', 
      label: 'Scan Content', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
      )
    },
    { 
      id: 'validate', 
      label: 'Validate Transfer', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
      )
    },
    { 
      id: 'learn', 
      label: 'Learn & Earn', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
      )
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'scan': return <ScanContent />;
      case 'validate': return <ValidateTransfer />;
      case 'learn': return <EducationHub />;
      default: return <ScanContent />;
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="pt-16 max-w-4xl mx-auto min-h-screen flex flex-col">
        <TabLayout activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
        <div className="flex-1 p-6 md:p-8">
          {renderContent()}
        </div>
        
        <footer className="p-8 text-center text-muted text-xs border-t border-border mt-auto">
          <p>© 2026 ShieldPay — Powered by Groq & Llama 3 & UBL Digital</p>
        </footer>
        <ShieldBot />
      </main>
    </div>
  );
}

export default App;
