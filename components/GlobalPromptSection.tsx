
import React from 'react';

interface GlobalPromptSectionProps {
  sharedPrompt: string;
  setSharedPrompt: (val: string) => void;
  isExpanded: boolean;
  setIsExpanded: (val: boolean) => void;
  hasConfirmedSteps: boolean;
}

const GlobalPromptSection: React.FC<GlobalPromptSectionProps> = ({ 
  sharedPrompt, 
  setSharedPrompt, 
  isExpanded, 
  setIsExpanded,
  hasConfirmedSteps 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-earth-americas"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Global Prompt (Applied to All Steps)</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Shared Context & Style</p>
          </div>
        </div>
        <i className={`fa-solid fa-chevron-down transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 pt-2 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Shared Prompt</label>
              {hasConfirmedSteps && (
                <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-100">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  Changes will only apply to subsequent steps
                </div>
              )}
            </div>
            <textarea
              value={sharedPrompt}
              onChange={(e) => setSharedPrompt(e.target.value)}
              className="w-full h-24 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
              placeholder="Enter global style directions, lighting preferences, or quality keywords..."
            />
            <p className="mt-2 text-[11px] text-gray-500 italic">
              This prompt will be appended to every step prompt and sent with each webhook request.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalPromptSection;
