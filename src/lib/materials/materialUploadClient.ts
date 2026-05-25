export type MaterialUploadResult = {
  url: string;
  s3Key: string;
  mimeType: string;
  mediaKind: string;
  fileName: string;
  fileSizeBytes: number;
};

type UploadOptions = {
  onProgress: (percent: number) => void;
  signal?: AbortSignal;
};

export function uploadMaterialFile(file: File, options: UploadOptions): Promise<MaterialUploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    const onAbort = () => xhr.abort();

    if (options.signal) {
      if (options.signal.aborted) {
        reject(new DOMException("Upload cancelled.", "AbortError"));
        return;
      }
      options.signal.addEventListener("abort", onAbort, { once: true });
    }

    xhr.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      options.onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
    });

    xhr.addEventListener("load", () => {
      let data: (MaterialUploadResult & { error?: string }) | null = null;
      try {
        data = JSON.parse(xhr.responseText) as MaterialUploadResult & { error?: string };
      } catch {
        reject(new Error("Invalid upload response."));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300 && data) {
        resolve(data);
        return;
      }

      reject(new Error(data?.error ?? `Upload failed (${xhr.status}).`));
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed.")));
    xhr.addEventListener("abort", () => reject(new DOMException("Upload cancelled.", "AbortError")));

    xhr.open("POST", "/api/admin/deployments/materials/upload");
    xhr.withCredentials = true;
    xhr.send(formData);
  });
}
