
export enum StepId {
  CHARACTER = 1,
  LIFESTYLE_1 = 2,
  LIFESTYLE_2 = 3,
  DETAIL = 4,
  VIDEO = 5
}

export interface AppState {
  currentStep: StepId;
  confirmedSteps: Set<StepId>;
  webhookUrl: string;
  accessToken: string;
  geminiApiKey: string;
  sharedPrompt: string;
  data: {
    character: {
      prompt: string;
      image?: string;
      threadCount?: number;
      variations?: { id: number; prompt: string; image?: string; loading: boolean }[];
    };
    lifestyle1: {
      prompt: string;
      negativePrompt: string;
      productImage?: string;
      characterImage?: string;
      outputImage?: string;
    };
    lifestyle2: {
      prompt: string;
      negativePrompt: string;
      productImage?: string;
      outputImage?: string;
    };
    detail: {
      prompt: string;
      productImage?: string;
      lifestyleRef?: 'lifestyle1' | 'lifestyle2';
      outputImage?: string;
    };
    video: {
      selectedImage: 'lifestyle1' | 'lifestyle2';
      prompt: string;
      outputVideo?: string;
    };
  };
}

export type WebhookPayload = {
  step: StepId;
  data: any;
};
