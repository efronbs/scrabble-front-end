import EventDispatcherContract from './event-dispatcher-contract';

export default class KeyboardDispatcher extends EventDispatcherContract {

  constructor() {
    super();
  }

  dispatchEvent(e, subscribedComponents) {
    subscribedComponents.forEach(c => c.eventFired(e));
  }
}
