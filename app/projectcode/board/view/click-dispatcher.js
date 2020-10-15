import EventDispatcherContract from './event-dispatcher-contract';
import ClicKEvent from './click-event';

/**
 * Dispatches mouse events to listening components.
 */
export default class ClickDispatcher extends EventDispatcherContract {

  /**
   * Constructor.
   *
   * @param componentIdToZIndex  Mapping of components to z-index. The values in
   *                            this mapping are intended to be mutated by the
   *                            object rendering the components. In this way,
   *                            when components are removed from the rendering
   *                            object they will be removed from the dispatcher.
   */
  constructor(componentIdToZIndex) {
    super();

    this.componentIdToZIndex = componentIdToZIndex;
  }

  /**
   * Dispatches click event to the topmost visible ui component(s) that was
   * clicked on.
   *
   * @param event  The event to dispatch
   * @param subscribedComponents  The set of components subscribed to the event
   */
  dispatchEvent(event, subscribedComponents) {
    // only grab events that the click event occurs over
    let collidedComponents = new Set([...subscribedComponents]
      .filter(c => c.containsPoint(event.x, event.y))
    );

    if (collidedComponents.size <= 0) {
      return;
    }

    let highestLevelComponents = EventDispatcherContract.highestLevelComponents(
      collidedComponents,
      this.componentIdToZIndex
    );

    highestLevelComponents.forEach(c => c.eventFired(event));
  }
}
