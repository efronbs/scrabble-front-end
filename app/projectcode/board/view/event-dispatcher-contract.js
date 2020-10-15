/**
 * Contract defining the required behavior of an event dispatcher.
 */
export default class EventDispatcherContract {

  /**
   * Dispatches the provided event to the relevant subscribed components.
   *
   * @param event  The event to dispatch
   * @param subscribedComponents  Set. The components that are subscribed to the
   *                              event
   */
  dispatchEvent(event, subscribedComponents) {
    return;
  }

  static highestLevelComponents(componentsToCheck, componentIdToIndex) {
    let maxIndex = -1;
    let maxComponents = [];
    let iter = componentsToCheck[Symbol.iterator]();
    let result = iter.next();
    while (!result.done) {
      let componentToCheck = result.value;
      let zIndex = componentIdToIndex[componentToCheck.getId()];
      if (!componentToCheck.isVisible() || zIndex == null) {
        result = iter.next();
        continue;
      }

      if (zIndex == maxIndex) {
        maxComponents.push(componentToCheck);
      }
      if (zIndex >= maxIndex) {
        maxIndex = zIndex;
        maxComponents = [componentToCheck];
      }
      result = iter.next();
    }

    return maxComponents;
  }
}
