/**
 * Upload a file to Convex storage with progress tracking.
 * Uses XMLHttpRequest for upload progress events.
 */
export async function uploadFileToConvex(
  generateUploadUrl: () => Promise<string>,
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const uploadUrl = await generateUploadUrl();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.storageId);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));

    xhr.open("POST", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}
