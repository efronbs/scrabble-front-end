export default class EventRegistry {

  constructor() {
    this.eventToDispatcher = {};
    this.eventToRegisteredComponents = {};
    this.componentIdToRegisteredEvents = {};
  }

  /**
   * Creates a pipe object which an emitter can push events into, which
   * ultimately are forwarded to the relevant subscribed components. Expired
   * emitters are "unregistered" by ceasing to push events into the pipe.
   *
   * @param emitter  The emitter to bind
   */
  bindEmitter(emitter, eventName) {
    emitter.setPipe(new EventPipe(this, eventName));
  }

  /**
   * Registers an event dispatcher. Event dispatchers have a 1 to 1 mapping to
   * events. Registering a new dispatcher for an event that already has a bound
   * dispatcher causes the original dispatcher to be unregistered.
   *
   * @param dispatcher  EventDispatcher implementation. The dispatcher to register.
   */
  bindDispatcher(dispatcher, eventName) {
    this.eventToDispatcher[eventName] = dispatcher;
  }

  /**
   * Forwards an emitted event to the propper dispatcher.
   */
  dispatchEvent(event) {
    if (!(event.getName() in this.eventToDispatcher)) {
      return;
    }

    if (!(event.getName() in this.eventToRegisteredComponents)) {
      return;
    }

    this.eventToDispatcher[event.getName()].dispatchEvent(event, this.eventToRegisteredComponents[event.getName()]);
  }

  /**
   * Removes an event from the registry. This includes deregistering the event
   * from all listening components
   */
  removeEvent(eventName) {
    let componentsToDeregister = this.eventToRegisteredComponents[eventName];
    if (componentsToDeregister != null) {
      let iter = componentsToDeregister[Symbol.iterator]();
      let result = iter.next();
      while (!result.done) {
        let c = result.value;
        let id = c.getId();
        if (!(id in this.componentIdToRegisteredEvents)) {
          result = iter.next();
          continue;
        }

        this.componentIdToRegisteredEvents[id].delete(eventName);
        result = iter.next();
      }
    }

    delete this.eventToDispatcher[eventName];
    delete this.eventToRegisteredComponents[eventName];
  }

  registerComponent(eventName, component) {
    // Add to event registration map
    if (!(eventName in this.eventToRegisteredComponents)) {
      this.eventToRegisteredComponents[eventName] = new Set();
    }
    this.eventToRegisteredComponents[eventName].add(component);

    // also add to reverse lookup
    const id = component.getId();
    if (!(id in this.componentIdToRegisteredEvents)) {
      this.componentIdToRegisteredEvents[id] = new Set();
    }
    this.componentIdToRegisteredEvents[id].add(eventName);
  }

  removeComponent(component) {
    let id = component.getId();
    if (!(id in this.componentIdToRegisteredEvents)) {
      return;
    }

    let eventNames = this.componentIdToRegisteredEvents[id];
    let localEventToComponents = this.eventToRegisteredComponents;
    eventNames.forEach(n => localEventToComponents[n] = localEventToComponents.filter(c => c != component));
  }

  /**
   * Provides an always up to date set of components subscribed to the event with
   * the given name. As such, when a new component subscribes to or unsubscribes
   * from the event, the change will be reflected in the the set returned from
   * this method.
   *
   * THIS SET MUST BE TREATED AS A READ-ONLY VIEW! Mutating the event registry
   * using this set results in undefined behavior. Changes to the event registry
   * must be done through the appropriate public methods.
   *
   * @return the read only view of the set of components subscribed to the event.
   */
  getComponentsForEvent(eventName) {
    if (!(eventName in this.eventToRegisteredComponents)) {
      this.eventToRegisteredComponents[eventName] = new Set();
    }

    return this.eventToRegisteredComponents[eventName];
  }
}

/** // TODO consider adding the ability to close a pipe and publish a flag indicating the pipe is closed */

/**
 * Pipe between emitter and the registry.
 */
class EventPipe {

  /**
   * Constructor.
   *
   * @param registry  EventRegistry to forward events to
   * @param eventName  The type of event that this pipe is bound to.
   */
  constructor(registry, eventName) {
    this.registry = registry;
    this.eventName = eventName;
  }

  /**
   * Consumes an event for
   */
  emit(event) {
    // events that are not of the bound event type are not emitted.
    if (event.getName() !== this.eventName) {
      return;
    }
    this.registry.dispatchEvent(event);
  }
}
