
import React, { useState } from 'react';
import { StepId } from '../../types';
import { callWebhook, fileToBase64 } from '../../services/webhookService';
import { generatePrompt } from '../../services/openAIService';

interface StepLifestyle1Props {
  data: any;
  sharedPrompt: string;
  characterImage?: string;
  updateData: (payload: any) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  webhookUrl: string;
}

const StepLifestyle1: React.FC<StepLifestyle1Props> = ({ data, sharedPrompt, characterImage, updateData, isConfirmed, onConfirm, webhookUrl }) => {
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);

  const handleAutoGeneratePrompt = async () => {
    setPromptLoading(true);
    try {
      const newPrompt = await generatePrompt("A lifestyle photography scene featuring a character and a product. Describe the environment, lighting, and action.", data.prompt);
      if (newPrompt) updateData({ prompt: newPrompt });
    } catch (error) {
      alert("Failed to generate prompt");
    } finally {
      setPromptLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const base64 = await fileToBase64(e.target.files[0]);
      updateData({ productImage: base64 });
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const combinedPrompt = `${sharedPrompt}\n\n${data.prompt}`;
      const imageUrl = await callWebhook(webhookUrl, { 
        step: StepId.LIFESTYLE_1, 
        data: { 
          prompt: combinedPrompt, 
          negativePrompt: data.negativePrompt,
          characterRef: characterImage,
          productRef: data.productImage
        } 
      });
      updateData({ outputImage: imageUrl });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 2: Lifestyle Image 1</h2>
        <p className="text-gray-500">Create the first environmental scene placing your character and product together.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Lifestyle Prompt</label>
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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Negative Prompt (Optional)</label>
            <textarea
              disabled={isConfirmed || loading}
              value={data.negativePrompt}
              onChange={(e) => updateData({ negativePrompt: e.target.value })}
              className="w-full h-16 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm text-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Character Reference</label>
              <div className="aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                {characterImage ? (
                  <img src={characterImage} className="w-full h-full object-cover" alt="Ref" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <i className="fa-solid fa-user"></i>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase">Product Upload</label>
              <div className="aspect-square relative group">
                {data.productImage ? (
                  <div className="w-full h-full rounded-xl overflow-hidden border border-gray-100">
                    <img src={data.productImage} className="w-full h-full object-cover" alt="Product" />
                    {!isConfirmed && (
                      <button 
                        onClick={() => updateData({ productImage: undefined })}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    )}
                  </div>
                ) : (
                  <label className="w-full h-full rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all text-gray-400">
                    <i className="fa-solid fa-cloud-arrow-up text-xl mb-2"></i>
                    <span className="text-[10px] font-bold">UPLOAD</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <button
            disabled={isConfirmed || loading || !data.productImage}
            onClick={handleGenerate}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isConfirmed 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-camera"></i>}
            {loading ? 'Processing Scene...' : 'Generate Image'}
          </button>
        </div>

        <div className="relative">
          <div className="aspect-[4/5] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
            {data.outputImage ? (
              <img src={data.outputImage} alt="Lifestyle 1" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <i className="fa-solid fa-mountain-sun text-4xl text-gray-200 mb-4"></i>
                <p className="text-sm text-gray-400 font-medium">Lifestyle output will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          disabled={isConfirmed || !data.outputImage}
          onClick={onConfirm}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${
            isConfirmed || !data.outputImage
              ? 'bg-emerald-50 text-emerald-300 border border-emerald-100 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
          }`}
        >
          {isConfirmed ? 'Image 1 Confirmed' : 'Confirm Image 1'}
        </button>
      </div>
    </div>
  );
};

export default StepLifestyle1;
