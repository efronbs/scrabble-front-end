import EventContract from './event-contract';

export const keyDownEventName = 'keydown';

export class KeyDownEvent extends EventContract {

  constructor(rawEvent) {
    super();
    this.rawEvent = rawEvent;
  }

  getName() {
    return keyDownEventName;
  }
}

// TODO add key hold, key release, and more as required
