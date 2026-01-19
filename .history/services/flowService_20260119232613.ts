
const PROJECT_ID = "18a6fd06-98a7-47be-9ce3-5a45086e23bb";
const API_URL = `https://aisandbox-pa.googleapis.com/v1/projects/${PROJECT_ID}/flowMedia:batchGenerateImages`;
const UPLOAD_URL = "https://aisandbox-pa.googleapis.com/v1:uploadUserImage";

// WARNING: This token will expire. It should ideally be passed in or fetched dynamically.
const HARDCODED_AUTH_TOKEN = "";

export const generateFlow = async (prompt: string, recaptchaToken: string , accessToken : string ) => {
    const sessionId = `;${Date.now()}`;
    
    const payload = {
        clientContext: {
            recaptchaToken: recaptchaToken,
            sessionId: sessionId,
            projectId: PROJECT_ID,
            tool: "PINHOLE"
        },
        requests: [
            {
                clientContext: {
                    recaptchaToken: recaptchaToken,
                    sessionId: sessionId,
                    projectId: PROJECT_ID,
                    tool: "PINHOLE"
                },
                seed: 899726, // You might want to make this random
                imageModelName: "GEM_PIX_2",
                imageAspectRatio: "IMAGE_ASPECT_RATIO_PORTRAIT",
                prompt: prompt,
                imageInputs: []
            }
        ]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'sec-ch-ua-platform': '"Windows"',
                'Authorization': `Bearer ${accessToken}`,
                'Referer': 'https://labs.google/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                'Content-Type': 'text/plain;charset=UTF-8',
                'sec-ch-ua-mobile': '?0'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Generate Flow Error:", error);
        throw error;
    }
};

export const uploadUserImage = async (rawImageBytes: string, accessToken: string, mimeType: string = "image/jpeg") => {
    const sessionId = `;${Date.now()}`;
    
    const payload = {
        imageInput: {
            rawImageBytes: rawImageBytes,
            mimeType: mimeType,
            isUserUploaded: true,
            aspectRatio: "IMAGE_ASPECT_RATIO_PORTRAIT"
        },
        clientContext: {
            sessionId: sessionId,
            tool: "ASSET_MANAGER"
        }
    };

    try {
        const response = await fetch(UPLOAD_URL, {
            method: 'POST',
            headers: {
                'sec-ch-ua-platform': '"Windows"',
                'Authorization': `Bearer ${accessToken}`,
                'Referer': 'https://labs.google/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
                'Content-Type': 'text/plain;charset=UTF-8',
                'sec-ch-ua-mobile': '?0'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Upload Image Error:", error);
        throw error;
    }
};