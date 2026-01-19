
import React from 'react';

interface HeaderProps {
  onOpenSettings: () => void;
  currentStepTitle: string;
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, currentStepTitle }) => {
  return (
    <header className="h-20 bg-white border-b border-gray-200 px-8 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">Active Workspace</h2>
        <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
          {currentStepTitle.replace(/_/g, ' ')}
          <span className="text-gray-300">/</span>
          <span className="text-indigo-600 font-medium">Session #4920</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSettings}
          className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
        >
          <i className="fa-solid fa-gear text-lg"></i>
        </button>
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>
        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            JD
          </div>
          <div className="text-xs">
            <div className="font-bold text-gray-700">Jane Doe</div>
            <div className="text-gray-400">Pro Account</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
