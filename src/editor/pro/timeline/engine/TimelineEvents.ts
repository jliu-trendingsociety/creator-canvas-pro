/**
 * TimelineEvents
 * Event type constants for timeline interactions
 */
export const TimelineEvents = {
  SEEK: 'timeline:seek',
  HOVER: 'timeline:hover',
  SELECT: 'timeline:select',
  TRIM_START: 'timeline:trim:start',
  TRIM_END: 'timeline:trim:end',
  ZOOM: 'timeline:zoom',
  SCROLL: 'timeline:scroll',
  TRACK_SELECT: 'timeline:track:select',
  TRACK_ADD: 'timeline:track:add',
  TRACK_REMOVE: 'timeline:track:remove',
} as const;

export type TimelineEventType = typeof TimelineEvents[keyof typeof TimelineEvents];
