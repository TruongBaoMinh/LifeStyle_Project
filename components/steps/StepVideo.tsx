
import React, { useState } from 'react';
import { StepId } from '../../types';
import { callWebhook } from '../../services/webhookService';
import { generatePrompt } from '../../services/openAIService';

interface StepVideoProps {
  data: any;
  sharedPrompt: string;
  lifestyle1Image?: string;
  lifestyle2Image?: string;
  updateData: (payload: any) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  webhookUrl: string;
}

const StepVideo: React.FC<StepVideoProps> = ({ 
  data, 
  sharedPrompt,
  lifestyle1Image, 
  lifestyle2Image, 
  updateData, 
  isConfirmed, 
  onConfirm, 
  webhookUrl 
}) => {
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);

  const handleAutoGeneratePrompt = async () => {
    setPromptLoading(true);
    try {
      const newPrompt = await generatePrompt("A cinematic video motion prompt. Describe camera movement (zoom, pan, tilt), lighting changes, or slow motion effects suitable for a lifestyle product video.", data.prompt);
      if (newPrompt) updateData({ prompt: newPrompt });
    } catch (error) {
      alert("Failed to generate prompt");
    } finally {
      setPromptLoading(false);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const sourceImage = data.selectedImage === 'lifestyle1' ? lifestyle1Image : lifestyle2Image;
      const combinedPrompt = `${sharedPrompt}\n\n${data.prompt}`;
      const videoUrl = await callWebhook(webhookUrl, { 
        step: StepId.VIDEO, 
        data: { 
          prompt: combinedPrompt,
          sourceImage
        } 
      });
      updateData({ outputVideo: videoUrl });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 5: Motion & Video</h2>
          <p className="text-gray-500">Add cinematic motion to your chosen lifestyle scene.</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Final Step</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Select Source Scene</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                disabled={isConfirmed || !lifestyle1Image}
                onClick={() => updateData({ selectedImage: 'lifestyle1' })}
                className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all ${
                  data.selectedImage === 'lifestyle1' ? 'border-indigo-600 scale-[1.02] shadow-lg shadow-indigo-100' : 'border-gray-200 opacity-60'
                }`}
              >
                {lifestyle1Image && <img src={lifestyle1Image} className="w-full h-full object-cover" alt="L1" />}
                {data.selectedImage === 'lifestyle1' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-bold">LIFESTYLE 1</div>
              </button>

              <button
                disabled={isConfirmed || !lifestyle2Image}
                onClick={() => updateData({ selectedImage: 'lifestyle2' })}
                className={`relative aspect-video rounded-2xl overflow-hidden border-2 transition-all ${
                  data.selectedImage === 'lifestyle2' ? 'border-indigo-600 scale-[1.02] shadow-lg shadow-indigo-100' : 'border-gray-200 opacity-60'
                }`}
              >
                {lifestyle2Image && <img src={lifestyle2Image} className="w-full h-full object-cover" alt="L2" />}
                {data.selectedImage === 'lifestyle2' && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px]">
                    <i className="fa-solid fa-check"></i>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-bold">LIFESTYLE 2</div>
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Motion Prompt</label>
              <div className="flex items-center gap-1.5 text-indigo-500 text-[10px] font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                <i className="fa-solid fa-link text-[8px]"></i>
                Shared Prompt Applied
              </div>
            </div>
            <div className="relative">
              <textarea
                disabled={isConfirmed || loading}
                value={data.prompt}
                onChange={(e) => updateData({ prompt: e.target.value })}
                className="w-full h-24 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm"
              />
              {!isConfirmed && (
                <button
                  onClick={handleAutoGeneratePrompt}
                  disabled={promptLoading}
                  className="absolute bottom-3 right-3 text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-md hover:bg-indigo-200 transition-colors flex items-center gap-1"
                  title="Auto-generate with AI"
                >
                  {promptLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                  {promptLoading ? 'Writing...' : 'AI Write'}
                </button>
              )}
              {isConfirmed && (
                <div className="absolute top-3 right-3 text-gray-400">
                  <i className="fa-solid fa-lock text-xs"></i>
                </div>
              )}
            </div>
          </div>

          <button
            disabled={isConfirmed || loading || (!lifestyle1Image && !lifestyle2Image)}
            onClick={handleGenerate}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isConfirmed 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            }`}
          >
            {loading ? (
              <><i className="fa-solid fa-clapperboard animate-bounce"></i> Animating Sequence...</>
            ) : (
              <><i className="fa-solid fa-film"></i> Generate Video</>
            )}
          </button>
        </div>

        <div className="relative">
          <div className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex flex-col items-center justify-center">
            {data.outputVideo ? (
              <div className="w-full h-full group relative">
                 <video 
                   src={data.outputVideo} 
                   autoPlay 
                   loop 
                   muted 
                   playsInline 
                   className="w-full h-full object-cover"
                   poster={data.selectedImage === 'lifestyle1' ? lifestyle1Image : lifestyle2Image}
                 />
              </div>
            ) : (
              <div className="text-center p-8">
                <i className="fa-solid fa-video text-4xl text-gray-200 mb-4"></i>
                <p className="text-sm text-gray-400 font-medium">Video preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-400 italic">
          <i className="fa-solid fa-circle-info mr-1"></i>
          Completing this step will finalize your campaign assets.
        </div>
        <button
          disabled={isConfirmed || !data.outputVideo}
          onClick={onConfirm}
          className={`px-10 py-4 rounded-xl font-bold transition-all ${
            isConfirmed || !data.outputVideo
              ? 'bg-emerald-50 text-emerald-300 border border-emerald-100 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xl shadow-emerald-200'
          }`}
        >
          {isConfirmed ? 'Campaign Finalized' : 'Confirm & Finish Campaign'}
        </button>
      </div>
    </div>
  );
};

export default StepVideo;
