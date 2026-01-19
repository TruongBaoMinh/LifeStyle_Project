
import React, { useState } from 'react';
import { StepId, AppState } from './types';
import { testOpenAIConnection } from './services/openAIService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StepCharacter from './components/steps/StepCharacter';
import StepLifestyle1 from './components/steps/StepLifestyle1';
import StepLifestyle2 from './components/steps/StepLifestyle2';
import StepDetail from './components/steps/StepDetail';
import StepVideo from './components/steps/StepVideo';
import SettingsPanel from './components/SettingsPanel';
import GlobalPromptSection from './components/GlobalPromptSection';

const INITIAL_STATE: AppState = {
  currentStep: StepId.CHARACTER,
  confirmedSteps: new Set(),
  webhookUrl: 'https://n8n.example.com/webhook/lifestyle-gen',
  accessToken: '',
  sharedPrompt: 'High-end luxury aesthetic, clean composition, professional photography, 8k resolution, shot on Hasselblad.',
  data: {
    character: {
      prompt: 'A sophisticated woman in her 30s with a minimalist aesthetic, high-fashion portrait, studio lighting, soft neutral background, highly detailed skin texture.',
    },
    lifestyle1: {
      prompt: 'Woman holding a premium organic skincare bottle in a sunlit modern bathroom, morning light, luxury atmosphere.',
      negativePrompt: 'low quality, blurry, distorted hands, text, watermark',
    },
    lifestyle2: {
      prompt: 'Woman applying facial serum in front of a minimalist vanity mirror, soft focus background, elegant interior.',
      negativePrompt: 'low quality, blurry, distorted hands, text, watermark',
    },
    detail: {
      prompt: 'Close-up macro shot of a sleek glass skincare bottle with silver sleeve detail, water droplets, marble surface.',
    },
    video: {
      selectedImage: 'lifestyle1',
      prompt: 'Cinematic slow zoom into the skincare bottle, luxury transition with soft light leaks.',
    }
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [showSettings, setShowSettings] = useState(false);
  const [isGlobalPromptExpanded, setIsGlobalPromptExpanded] = useState(true);

  const handleTestApi = async () => {
    try {
      alert("Đang gọi OpenAI...");
      const result = await testOpenAIConnection();
      alert("Kết quả: " + result);
    } catch (e) {
      alert("Lỗi: " + e);
    }
  };

  const updateData = (stepKey: keyof AppState['data'], payload: any) => {
    setState(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [stepKey]: { ...prev.data[stepKey], ...payload }
      }
    }));
  };

  const confirmStep = (stepId: StepId) => {
    setState(prev => {
      const nextConfirmed = new Set(prev.confirmedSteps);
      nextConfirmed.add(stepId);

      const nextStep = (stepId < StepId.VIDEO) ? stepId + 1 : stepId;

      return {
        ...prev,
        confirmedSteps: nextConfirmed,
        currentStep: nextStep as StepId
      };
    });
  };

  const setStep = (stepId: StepId) => {
    setState(prev => ({ ...prev, currentStep: stepId }));
  };

  const renderStep = () => {
    switch (state.currentStep) {
      case StepId.CHARACTER:
        return (
          <StepCharacter
            data={state.data.character}
            sharedPrompt={state.sharedPrompt}
            setSharedPrompt={(val: string) => setState(prev => ({ ...prev, sharedPrompt: val }))}
            updateData={(d) => updateData('character', d)}
            isConfirmed={state.confirmedSteps.has(StepId.CHARACTER)}
            onConfirm={() => confirmStep(StepId.CHARACTER)}
            webhookUrl={state.webhookUrl}
            accessToken={state.accessToken}
            setAccessToken={(token: string) => setState(prev => ({ ...prev, accessToken: token }))}
          />
        );
      case StepId.LIFESTYLE_1:
        return (
          <StepLifestyle1
            data={state.data.lifestyle1}
            sharedPrompt={state.sharedPrompt}
            characterImage={state.data.character.image}
            updateData={(d) => updateData('lifestyle1', d)}
            isConfirmed={state.confirmedSteps.has(StepId.LIFESTYLE_1)}
            onConfirm={() => confirmStep(StepId.LIFESTYLE_1)}
            webhookUrl={state.webhookUrl}
          />
        );
      case StepId.LIFESTYLE_2:
        return (
          <StepLifestyle2
            data={state.data.lifestyle2}
            sharedPrompt={state.sharedPrompt}
            characterImage={state.data.character.image}
            updateData={(d) => updateData('lifestyle2', d)}
            isConfirmed={state.confirmedSteps.has(StepId.LIFESTYLE_2)}
            onConfirm={() => confirmStep(StepId.LIFESTYLE_2)}
            webhookUrl={state.webhookUrl}
          />
        );
      case StepId.DETAIL:
        return (
          <StepDetail
            data={state.data.detail}
            sharedPrompt={state.sharedPrompt}
            lifestyle1Image={state.data.lifestyle1.outputImage}
            lifestyle2Image={state.data.lifestyle2.outputImage}
            productImage1={state.data.lifestyle1.productImage}
            productImage2={state.data.lifestyle2.productImage}
            updateData={(d) => updateData('detail', d)}
            isConfirmed={state.confirmedSteps.has(StepId.DETAIL)}
            onConfirm={() => confirmStep(StepId.DETAIL)}
            webhookUrl={state.webhookUrl}
          />
        );
      case StepId.VIDEO:
        return (
          <StepVideo
            data={state.data.video}
            sharedPrompt={state.sharedPrompt}
            lifestyle1Image={state.data.lifestyle1.outputImage}
            lifestyle2Image={state.data.lifestyle2.outputImage}
            updateData={(d) => updateData('video', d)}
            isConfirmed={state.confirmedSteps.has(StepId.VIDEO)}
            onConfirm={() => confirmStep(StepId.VIDEO)}
            webhookUrl={state.webhookUrl}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar
        currentStep={state.currentStep}
        confirmedSteps={state.confirmedSteps}
        onStepClick={setStep}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          onOpenSettings={() => setShowSettings(true)}
          currentStepTitle={Object.keys(StepId)[Object.values(StepId).indexOf(state.currentStep)]}
        />

        <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex justify-end">
            <button
              onClick={handleTestApi}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Test OpenAI API
            </button>
          </div>
          <GlobalPromptSection
            sharedPrompt={state.sharedPrompt}
            setSharedPrompt={(val) => setState(prev => ({ ...prev, sharedPrompt: val }))}
            isExpanded={isGlobalPromptExpanded}
            setIsExpanded={setIsGlobalPromptExpanded}
            hasConfirmedSteps={state.confirmedSteps.size > 0}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {renderStep()}
          </div>
        </div>
      </main>

      {showSettings && (
        <SettingsPanel
          webhookUrl={state.webhookUrl}
          setWebhookUrl={(url) => setState(prev => ({ ...prev, webhookUrl: url }))}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
