/**
 * Frame Extractor
 * Client-side video thumbnail generation using Canvas API
 */

export interface FrameExtractionOptions {
  maxThumbnails?: number;
  thumbnailWidth?: number;
  thumbnailHeight?: number;
  quality?: number;
}

/**
 * Extract thumbnails from video element
 */
export const extractVideoThumbnails = async (
  videoElement: HTMLVideoElement,
  duration: number,
  options: FrameExtractionOptions = {}
): Promise<string[]> => {
  const {
    maxThumbnails = 100,
    thumbnailWidth = 160,
    thumbnailHeight = 90,
    quality = 0.8,
  } = options;

  const thumbnails: string[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Failed to get canvas context');
    return [];
  }

  canvas.width = thumbnailWidth;
  canvas.height = thumbnailHeight;

  // Calculate interval between thumbnails
  const interval = duration / maxThumbnails;

  for (let i = 0; i < maxThumbnails; i++) {
    const time = i * interval;
    
    try {
      // Seek to specific time
      videoElement.currentTime = time;
      
      // Wait for seek to complete
      await new Promise<void>((resolve) => {
        const onSeeked = () => {
          videoElement.removeEventListener('seeked', onSeeked);
          resolve();
        };
        videoElement.addEventListener('seeked', onSeeked);
      });

      // Draw frame to canvas
      ctx.drawImage(videoElement, 0, 0, thumbnailWidth, thumbnailHeight);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      thumbnails.push(dataUrl);
      
    } catch (error) {
      console.error(`Failed to extract thumbnail at ${time}s:`, error);
      // Add placeholder on error
      thumbnails.push('');
    }
  }

  return thumbnails;
};

/**
 * Extract a single frame at specific time
 */
export const extractSingleFrame = async (
  videoElement: HTMLVideoElement,
  time: number,
  width: number = 160,
  height: number = 90
): Promise<string> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';

  canvas.width = width;
  canvas.height = height;

  videoElement.currentTime = time;
  
  await new Promise<void>((resolve) => {
    const onSeeked = () => {
      videoElement.removeEventListener('seeked', onSeeked);
      resolve();
    };
    videoElement.addEventListener('seeked', onSeeked);
  });

  ctx.drawImage(videoElement, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.8);
};
