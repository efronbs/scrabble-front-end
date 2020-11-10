import BaseEventEmitter from './base-event-emitter';
import { keyDownEventName, KeyDownEvent } from './keyboard-events'

export default class KeyboardEmitter extends BaseEventEmitter {

  constructor() {
    super();

    this.eventToPipe = {};

    window.addEventListener('keydown', (e) => this.handleKeyPress(e));
  }

  setPipe(pipe) {
    this.eventToPipe[pipe.eventName] = pipe;
  }

  handleKeyPress(e) {
    // prevents backspace from navigating off page
    if (e.keyCode === 8) {
      e.preventDefault();
    }

    this.eventToPipe[keyDownEventName].emit(new KeyDownEvent(e));
  }
}
