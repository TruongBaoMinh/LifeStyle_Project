
import { StepId, WebhookPayload } from '../types';

export const callWebhook = async (url: string, payload: WebhookPayload): Promise<string> => {
  console.log(`Calling webhook: ${url}`, payload);
  
  // Simulation mode if not a real URL or for demo purposes
  if (!url.startsWith('http')) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `https://picsum.photos/seed/${Math.random()}/1024/1024`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.statusText}`);
    }

    // Expecting JSON with an image/video URL
    const data = await response.json();
    return data.url || data.imageUrl || data.videoUrl || `https://picsum.photos/seed/${Math.random()}/1024/1024`;
  } catch (err) {
    console.error('Webhook error:', err);
    // Return a fallback for demo
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `https://picsum.photos/seed/${Math.random()}/1024/1024`;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};
