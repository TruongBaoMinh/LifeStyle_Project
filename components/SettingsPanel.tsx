
import React from 'react';

interface SettingsPanelProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ webhookUrl, setWebhookUrl, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Settings</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">n8n Webhook URL</label>
            <input 
              type="text" 
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="https://n8n.your-instance.com/..."
            />
            <p className="mt-2 text-xs text-gray-500">
              Generated data will be POSTed to this endpoint with step details.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
            <i className="fa-solid fa-circle-info text-amber-500 mt-0.5"></i>
            <div className="text-xs text-amber-800 leading-relaxed">
              If the webhook is invalid or unreachable, the application will default to demo mode with placeholder assets.
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
