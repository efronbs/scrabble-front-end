import BaseEventEmitter from './base-event-emitter';
import ClickEvent from './click-event';

export default class ClickEmitter extends BaseEventEmitter {

  constructor(canvas) {
    super();

    this.canvas = canvas;
    this.canvas.addEventListener('click', (e) => this.processClickEvent(e));
  }

  processClickEvent(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const clickEvent = new ClickEvent(x, y);
    this.pipe.emit(clickEvent);
  }
}
