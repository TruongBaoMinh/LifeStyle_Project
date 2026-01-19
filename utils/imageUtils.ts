/**
 * Converts a File object or Blob to a Base64 string.
 * @param file The file or blob to convert.
 * @returns A promise that resolves to the Base64 string.
 */
export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Validates if the file is an image.
 * @param file The file to validate.
 * @returns True if valid image, false otherwise.
 */
export const validateImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};
