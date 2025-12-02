/**
 * TimelineRegistry
 * Manages all tracks, layers, and timeline elements
 */
export interface Track {
  id: string;
  type: 'video' | 'audio' | 'effect' | 'text';
  height: number;
  locked?: boolean;
  visible?: boolean;
}

export class TimelineRegistry {
  private tracks: Track[] = [];

  registerTrack(track: Track): void {
    this.tracks.push(track);
  }

  unregisterTrack(trackId: string): void {
    this.tracks = this.tracks.filter(t => t.id !== trackId);
  }

  getTracks(): Track[] {
    return this.tracks;
  }

  getTrack(trackId: string): Track | undefined {
    return this.tracks.find(t => t.id === trackId);
  }

  clear(): void {
    this.tracks = [];
  }
}
