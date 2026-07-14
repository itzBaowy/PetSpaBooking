import { useState, useCallback } from "react";

export function useUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      // TODO: Implement actual upload
      return "uploaded-url";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tải tệp lên thất bại";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { upload, isLoading, error };
}
