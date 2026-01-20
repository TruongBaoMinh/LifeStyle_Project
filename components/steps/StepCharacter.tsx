
import React, { useState } from 'react';
import { StepId } from '../../types';
import { generatePrompt } from '../../services/openAIService';
import { generateFlow, uploadUserImage } from '../../services/flowService';
import { fileToBase64 } from '../../utils/imageUtils';

interface StepCharacterProps {
  data: { prompt: string; image?: string };
  sharedPrompt: string;
  setSharedPrompt: (prompt: string) => void;
  updateData: (payload: any) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
  webhookUrl: string;
  accessToken: string;
  setAccessToken: (token: string) => void;
}

const StepCharacter: React.FC<StepCharacterProps> = ({
  data, sharedPrompt, setSharedPrompt, updateData, isConfirmed, onConfirm, webhookUrl,
  accessToken, setAccessToken
}) => {
  const [loading, setLoading] = useState(false);
  const [promptLoading, setPromptLoading] = useState(false);
  const [threadCount, setThreadCount] = useState<number>(1);
  const [variations, setVariations] = useState<{ id: number; prompt: string; image?: string; loading: boolean }[]>([]);

  const handleAutoGeneratePrompt = async () => {
    setPromptLoading(true);
    try {
      if (threadCount === 1) {
        const newPrompt = await generatePrompt("A main character for a lifestyle campaign. Describe age, appearance, style, mood.", data.prompt);
        if (newPrompt) {
          updateData({ prompt: newPrompt });
        }
      } else {
        // Multi-thread generation
        const promises = Array.from({ length: threadCount }).map((_, index) =>
          generatePrompt(`A main character for a lifestyle campaign. Variation ${index + 1}. Describe age, appearance, style, mood.`, data.prompt)
            .then(p => ({ p, index }))
        );

        const results = await Promise.all(promises);

        const newVariations = results.map((res, i) => ({
          id: Date.now() + i,
          prompt: res.p || "",
          loading: false
        }));
        setVariations(newVariations);
      }
    } catch (error) {
      alert("Failed to generate prompt");
    } finally {
      setPromptLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!accessToken) {
      alert("Please enter a Google Access Token.");
      return;
    }

    if (threadCount === 1) {
      setLoading(true);
      try {
        const combinedPrompt = `${sharedPrompt}\n\n${data.prompt}`;
        
        const flowResult = await generateFlow(combinedPrompt, accessToken);
        console.log("Flow Result:", flowResult);

        if (flowResult?.media?.[0]?.image?.generatedImage?.fifeUrl) {
          updateData({ image: flowResult.media[0].image.generatedImage.fifeUrl });
        } else {
          console.warn("Unexpected Flow API response structure:", flowResult);
          alert("Image generated but format could not be parsed. Check console.");
        }
      } catch (error) {
        console.error("Generation failed:", error);
        alert("Failed to generate character image");
      } finally {
        setLoading(false);
      }
    } else {
      // Multi-thread generation
      const newVariations = [...variations];
      // Mark all as loading
      setVariations(prev => prev.map(v => ({ ...v, loading: true })));

      try {
        // Execute in parallel
        await Promise.all(newVariations.map(async (variation, index) => {
          if (!variation.prompt) return;
          try {
            const combinedPrompt = `${sharedPrompt}\n\n${variation.prompt}`;
            const flowResult = await generateFlow(combinedPrompt, accessToken);
            if (flowResult?.media?.[0]?.image?.generatedImage?.fifeUrl) {
              newVariations[index].image = flowResult.media[0].image.generatedImage.fifeUrl;
            }
          } catch (e) {
            console.error(`Failed to generate variation ${index}`, e);
          } finally {
            newVariations[index].loading = false;
          }
        }));

        setVariations([...newVariations]);

      } catch (error) {
        console.error("Batch generation failed:", error);
        setVariations(prev => prev.map(v => ({ ...v, loading: false })));
      }
    }
  };

  const handleDownload = async () => {
    if (!data.image) return;
    try {
      const response = await fetch(data.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `character-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
      window.open(data.image, '_blank');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!accessToken) {
      alert("Please enter a Google Access Token first.");
      event.target.value = '';
      return;
    }

    try {
      setLoading(true);
      const base64String = await fileToBase64(file);
      // Remove header to get raw bytes
      const rawBytes = base64String.split(',')[1];

      console.log("Uploading reference image...");
      const response = await uploadUserImage(rawBytes, accessToken, file.type);

      console.log("Upload Response:", response);

      if (response?.mediaGenerationId?.mediaGenerationId) {
        console.log("Media Generation ID:", response.mediaGenerationId.mediaGenerationId);
        alert(`Reference Image Uploaded! Media ID: ${response.mediaGenerationId.mediaGenerationId}`);
      } else {
        console.warn("Upload response missing mediaGenerationId", response);
      }

    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to upload reference image.");
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: Generate Character</h2>
            <p className="text-gray-500">Define the visual identity of your campaign's main character.</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
            <span className="text-sm font-bold text-gray-700">Threads:</span>
            <select
              value={threadCount}
              onChange={(e) => setThreadCount(Number(e.target.value))}
              disabled={isConfirmed || loading || promptLoading}
              className="bg-white border border-gray-300 rounded-md text-sm px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>1 (Single)</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Access Token Input */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
            Google Access Token
          </label>
          <input
            type="text"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
            placeholder="Enter your Google Access Token (ya29...)"
          />
        </div>

        {/* Reference Image Upload */}
        <div>
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">
            Reference Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
          />
        </div>
      </div>

      {threadCount === 1 ? (
        // SINGLE THREAD MODE
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Character Description
                  </label>
                  {!isConfirmed && (
                    <button
                      onClick={handleAutoGeneratePrompt}
                      disabled={promptLoading}
                      className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-200 transition-colors flex items-center gap-1 font-semibold"
                      title="Auto-generate with AI"
                    >
                      {promptLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                      {promptLoading ? 'Generating...' : 'Gen Prompt'}
                    </button>
                  )}
                </div>
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
                  className="w-full h-40 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Describe the character's age, style, appearance, and mood..."
                />
                {isConfirmed && (
                  <div className="absolute top-3 right-3 text-gray-400">
                    <i className="fa-solid fa-lock text-xs"></i>
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={isConfirmed || loading || !data.prompt}
              onClick={handleGenerate}
              className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${isConfirmed
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
                }`}
            >
              {loading ? (
                <><i className="fa-solid fa-spinner animate-spin"></i> Generating...</>
              ) : (
                <><i className="fa-solid fa-wand-magic-sparkles"></i> Generate Character</>
              )}
            </button>
          </div>

          <div className="relative group">
            <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-indigo-200 relative">
              {data.image ? (
                <>
                  <img src={data.image} alt="Generated Character" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                    <button
                      onClick={() => window.open(data.image, '_blank')}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-indigo-600 backdrop-blur-md flex items-center justify-center transition-all shadow-lg transform hover:scale-110"
                      title="View Full Size"
                    >
                      <i className="fa-solid fa-expand"></i>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white text-white hover:text-indigo-600 backdrop-blur-md flex items-center justify-center transition-all shadow-lg transform hover:scale-110"
                      title="Download Image"
                    >
                      <i className="fa-solid fa-download"></i>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8">
                  <i className="fa-solid fa-image text-4xl text-gray-200 mb-4"></i>
                  <p className="text-sm text-gray-400 font-medium">Generated preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        // MULTI THREAD MODE
        <div className="space-y-6">
          <div className="flex gap-4">
            <button
              onClick={handleAutoGeneratePrompt}
              disabled={promptLoading}
              className="flex-1 py-3 bg-indigo-100 text-indigo-700 rounded-xl font-bold hover:bg-indigo-200 transition-all flex justify-center items-center gap-2"
            >
              {promptLoading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
              Gen {threadCount} Prompts
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading || variations.length === 0}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex justify-center items-center gap-2"
            >
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-play"></i>}
              Run All Flows
            </button>
          </div>

          <div className="space-y-4">
            {variations.map((v, idx) => (
              <div key={v.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 items-center">
                <div className="md:col-span-1 font-bold text-gray-400 text-center">#{idx + 1}</div>

                <div className="md:col-span-7">
                  <textarea
                    value={v.prompt}
                    onChange={(e) => {
                      const newV = [...variations];
                      newV[idx].prompt = e.target.value;
                      setVariations(newV);
                    }}
                    className="w-full h-24 p-2 rounded-lg border border-gray-200 text-sm resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Prompt..."
                  />
                </div>

                <div className="md:col-span-3">
                  <div className="aspect-square bg-white rounded-lg border border-gray-200 overflow-hidden relative flex items-center justify-center">
                    {v.loading ? (
                      <i className="fa-solid fa-spinner animate-spin text-indigo-500"></i>
                    ) : v.image ? (
                      <div className="relative group w-full h-full">
                        <img src={v.image} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button onClick={() => window.open(v.image, '_blank')} className="text-white hover:text-indigo-300"><i className="fa-solid fa-expand"></i></button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No Image</span>
                    )}
                  </div>
                </div>

                <div className="md:col-span-1 flex justify-center">
                  <button
                    onClick={() => {
                       updateData({ prompt: v.prompt, image: v.image });
                    }}
                    disabled={!v.image}
                    title="Select this variation"
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${v.image && data.image === v.image
                        ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-md'
                        : 'bg-white border border-gray-200 text-gray-400 hover:bg-gray-100'
                      }`}
                  >
                    <i className="fa-solid fa-check"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <i className="fa-solid fa-circle-check text-indigo-500"></i>
          Requires valid prompt to begin
        </div>
        <button
          disabled={isConfirmed || !data.image}
          onClick={onConfirm}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${isConfirmed || !data.image
            ? 'bg-emerald-50 text-emerald-300 border border-emerald-100 cursor-not-allowed'
            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md shadow-emerald-200 active:scale-[0.98]'
            }`}
        >
          {isConfirmed ? (
            <><i className="fa-solid fa-check-double mr-2"></i> Character Confirmed</>
          ) : (
            'Confirm Character'
          )}
        </button>
      </div>
    </div>
  );
};

export default StepCharacter;
