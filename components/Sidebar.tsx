
import React from 'react';
import { StepId } from '../types';

interface SidebarProps {
  currentStep: StepId;
  confirmedSteps: Set<StepId>;
  onStepClick: (step: StepId) => void;
}

const steps = [
  { id: StepId.CHARACTER, label: 'Character Generation', icon: 'fa-user-astronaut' },
  { id: StepId.LIFESTYLE_1, label: 'Lifestyle Image 1', icon: 'fa-camera' },
  { id: StepId.LIFESTYLE_2, label: 'Lifestyle Image 2', icon: 'fa-camera-retro' },
  { id: StepId.DETAIL, label: 'Detail Image', icon: 'fa-magnifying-glass' },
  { id: StepId.VIDEO, label: 'Video Generation', icon: 'fa-film' },
];

const Sidebar: React.FC<SidebarProps> = ({ currentStep, confirmedSteps, onStepClick }) => {
  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-8 border-b border-gray-100">
        <div className="flex items-center gap-3 text-indigo-600 mb-2">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Lifestyle AI</h1>
        </div>
        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Campaign Wizard</p>
      </div>

      <nav className="flex-1 p-6 space-y-2">
        {steps.map((step) => {
          const isConfirmed = confirmedSteps.has(step.id);
          const isActive = currentStep === step.id;
          const isLocked = false;

          return (
            <button
              key={step.id}
              disabled={isLocked}
              onClick={() => onStepClick(step.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 ${isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
                }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isActive
                  ? 'bg-indigo-600 text-white'
                  : isConfirmed
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                {isConfirmed ? <i className="fa-solid fa-check"></i> : step.id}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${isActive ? 'text-indigo-900' : ''}`}>{step.label}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {isConfirmed ? 'COMPLETED' : isActive ? 'IN PROGRESS' : isLocked ? 'LOCKED' : 'READY'}
                </div>
              </div>
              <i className={`fa-solid ${step.icon} ${isActive ? 'text-indigo-400' : 'text-gray-300'}`}></i>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-gray-100">
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-2 uppercase font-bold">Progress</div>
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${(confirmedSteps.size / steps.length) * 100}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 text-right font-medium">
            {confirmedSteps.size} of {steps.length} steps
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
