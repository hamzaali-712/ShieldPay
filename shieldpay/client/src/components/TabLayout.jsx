import React from 'react';

const TabLayout = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="flex justify-center p-4 bg-white/50 backdrop-blur-sm sticky top-16 z-40 border-b border-border">
      <div className="flex bg-gray-200/50 p-1 rounded-xl gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-navy text-white shadow-md scale-105' 
                : 'text-muted hover:text-navy hover:bg-white'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {tab.icon}
              {tab.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabLayout;
