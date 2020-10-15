import EventDispatcherContract from './event-dispatcher-contract';

export default class MouseEnterLeaveDispatcher extends EventDispatcherContract {

  constructor(componentsToZIndex) {
    super();
    this.componentsToZIndex = componentsToZIndex;
  }

  dispatchEvent(event, subscribedComponents) {
    let highestLevelComponents = EventDispatcherContract.highestLevelComponents(
      event.components,
      this.componentsToZIndex
    );

    highestLevelComponents
      .filter(c => subscribedComponents.has(c))
      .forEach(c =>c.eventFired(event));
  }
}
