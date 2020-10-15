import EventContract from './event-contract'

export const mouseLeaveEventName = 'mouseleave';

// currently no state, functions as a token object
export default class MouseLeaveEvent extends EventContract {

  constructor(components) {
    super();
    this.components = components;
  }

  getName() {
    return mouseLeaveEventName;
  }
}
