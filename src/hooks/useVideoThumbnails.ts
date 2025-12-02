import { useState, useEffect, useCallback } from 'react';

interface UseVideoThumbnailsOptions {
  videoElement: HTMLVideoElement | null;
  duration: number;
  thumbnailCount?: number;
}

export const useVideoThumbnails = ({
  videoElement,
  duration,
  thumbnailCount = 20,
}: UseVideoThumbnailsOptions) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const extractThumbnails = useCallback(async () => {
    if (!videoElement || duration === 0) return;

    setIsExtracting(true);
    const thumbs: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsExtracting(false);
      return;
    }

    // Set canvas size based on video dimensions
    canvas.width = 160;
    canvas.height = 90;

    const interval = duration / thumbnailCount;
    const originalTime = videoElement.currentTime;

    try {
      for (let i = 0; i < thumbnailCount; i++) {
        const time = i * interval;
        
        // Seek to the time
        videoElement.currentTime = time;
        
        // Wait for the seek to complete
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            videoElement.removeEventListener('seeked', onSeeked);
            resolve();
          };
          videoElement.addEventListener('seeked', onSeeked);
        });

        // Draw the current frame to canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        thumbs.push(dataUrl);
      }

      // Restore original time
      videoElement.currentTime = originalTime;
      
      setThumbnails(thumbs);
    } catch (error) {
      console.error('Error extracting thumbnails:', error);
    } finally {
      setIsExtracting(false);
    }
  }, [videoElement, duration, thumbnailCount]);

  useEffect(() => {
    if (videoElement && duration > 0 && thumbnails.length === 0) {
      extractThumbnails();
    }
  }, [videoElement, duration, thumbnails.length, extractThumbnails]);

  return { thumbnails, isExtracting };
};
