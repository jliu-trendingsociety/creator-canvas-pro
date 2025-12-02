/**
 * Layout Components for ProEditor
 *
 * These are presentation-only components that compose the ProEditor layout.
 * No business logic, state mutations, or pixel math allowed in layout components.
 *
 * Each component accepts:
 * - State props (read-only)
 * - Action props (callbacks)
 * - Ref props (for direct DOM access when needed)
 * - Children (for composition)
 */

export { LeftPanel, type LeftPanelProps } from './LeftPanel';
export { RightPanel, type RightPanelProps } from './RightPanel';
export { ViewerContainer, type ViewerContainerProps } from './ViewerContainer';
export {
  TimelineContainer,
  type TimelineContainerProps,
} from './TimelineContainer';
