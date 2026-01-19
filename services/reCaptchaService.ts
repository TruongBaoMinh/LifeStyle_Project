export const getCaptchaToken = async (): Promise<any> => {
  const apiKey = 'a26604d9-0ded-4409-8fe5-c3f9ce576d15';
  const url = `https://captcha-v3.shop/get-token?apiKey=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching captcha token:', error);
    throw error;
  }
};
