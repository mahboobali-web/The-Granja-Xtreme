import { fetchAPI } from './api';

export const uploadImage = async (file: File, folder: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      try {
        const response = await fetchAPI('/upload', {
          method: 'POST',
          body: { image: base64Image, folder },
        });
        
        if (response.url) {
          resolve(response.url);
        } else {
          reject(new Error('No URL returned from server'));
        }
      } catch (err: any) {
        reject(err);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
  });
};

export const uploadBase64Image = async (base64Image: string, folder: string): Promise<string> => {
  try {
    const response = await fetchAPI('/upload', {
      method: 'POST',
      body: { image: base64Image, folder },
    });
    if (response.url) {
      return response.url;
    }
    throw new Error('No URL returned from server');
  } catch (err: any) {
    throw err;
  }
};
