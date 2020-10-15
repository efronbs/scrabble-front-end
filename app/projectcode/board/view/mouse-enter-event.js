import EventContract from './event-contract';

export const mouseEnterEventName = 'mouseenter';

// currently no state, functions as a token object
export default class MouseEnterEvent extends EventContract {

  constructor(components) {
    super();
    this.components = components;
  }

  getName() {
    return mouseEnterEventName;
  }
}
