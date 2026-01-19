
import React, { useState } from 'react';
import { StepId } from '../../types';
import { callWebhook } from '../../services/webhookService';
import { generatePrompt } from '../../services/openAIService';

interface StepDetailProps {
  data: any;
  sharedPrompt: string;
  lifestyle1Image?: string;
  lifestyle2Image?: string;
  productImage1?: string;
  productImage2?: string;
  updateData: (payload: any) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  webhookUrl: string;
}

const StepDetail: React.FC<StepDetailProps> = ({ 
  data, 
  sharedPrompt,
  lifestyle1Image, 
  lifestyle2Image, 
  productImage1, 
  productImage2,
  updateData, 
  isConfirmed, 
  onConfirm, 
  webhookUrl 
}) => {
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const activeProduct = productImage1 || productImage2;

  const handleAutoGeneratePrompt = async () => {
    setPromptLoading(true);
    try {
      const newPrompt = await generatePrompt("A macro close-up detail shot of a product. Focus on texture, material, packaging details, and lighting.", data.prompt);
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
      const combinedPrompt = `${sharedPrompt}\n\n${data.prompt}`;
      const imageUrl = await callWebhook(webhookUrl, { 
        step: StepId.DETAIL, 
        data: { 
          prompt: combinedPrompt,
          productRef: activeProduct,
          lifestyleRef: data.lifestyleRef === 'lifestyle1' ? lifestyle1Image : lifestyle2Image
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 4: Detail Shot</h2>
        <p className="text-gray-500">Highlight specific features like texture, packaging, or the sleek sleeve design.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Detail Focus Prompt</label>
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
                className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm"
                placeholder="E.g., Macro shot of the silver branding, soft studio lighting..."
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

          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">References</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-400 block">PRODUCT</span>
                <div className="aspect-square bg-gray-50 border border-gray-100 rounded-lg overflow-hidden">
                  {activeProduct && <img src={activeProduct} className="w-full h-full object-cover" alt="Product" />}
                </div>
              </div>
              <button 
                disabled={isConfirmed || !lifestyle1Image}
                onClick={() => updateData({ lifestyleRef: 'lifestyle1' })}
                className={`space-y-1 text-left ${data.lifestyleRef === 'lifestyle1' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Context 1</span>
                <div className={`aspect-square rounded-lg overflow-hidden border-2 ${data.lifestyleRef === 'lifestyle1' ? 'border-indigo-500' : 'border-gray-100'}`}>
                  {lifestyle1Image && <img src={lifestyle1Image} className="w-full h-full object-cover" alt="Life 1" />}
                </div>
              </button>
              <button 
                disabled={isConfirmed || !lifestyle2Image}
                onClick={() => updateData({ lifestyleRef: 'lifestyle2' })}
                className={`space-y-1 text-left ${data.lifestyleRef === 'lifestyle2' ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
              >
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Context 2</span>
                <div className={`aspect-square rounded-lg overflow-hidden border-2 ${data.lifestyleRef === 'lifestyle2' ? 'border-indigo-500' : 'border-gray-100'}`}>
                  {lifestyle2Image && <img src={lifestyle2Image} className="w-full h-full object-cover" alt="Life 2" />}
                </div>
              </button>
            </div>
          </div>

          <button
            disabled={isConfirmed || loading || !activeProduct}
            onClick={handleGenerate}
            className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
              isConfirmed 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
            }`}
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-magnifying-glass"></i>}
            {loading ? 'Capturing Details...' : 'Generate Detail Image'}
          </button>
        </div>

        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
            {data.outputImage ? (
              <img src={data.outputImage} alt="Detail" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-8">
                <i className="fa-solid fa-microscope text-4xl text-gray-200 mb-4"></i>
                <p className="text-sm text-gray-400 font-medium">Macro/Detail output will appear here</p>
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
              : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-100'
          }`}
        >
          {isConfirmed ? 'Detail Confirmed' : 'Confirm Detail Image'}
        </button>
      </div>
    </div>
  );
};

export default StepDetail;
