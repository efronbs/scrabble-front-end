import BaseEventEmitter from './base-event-emitter';
import MouseLeaveEvent from './mouse-leave-event';
import MouseEnterEvent from './mouse-enter-event';
import { mouseEnterEventName } from './mouse-enter-event';
import { mouseLeaveEventName } from './mouse-leave-event';

export default class MouseEnterLeaveEmitter extends BaseEventEmitter {

  constructor(canvas, mouseEnterComponents, mouseLeaveComponents) {
    super();

    this.canvas = canvas;
    this.mouseEnterComponents = mouseEnterComponents;
    this.mouseLeaveComponents = mouseLeaveComponents;
    this.wasEntered = new Set();
    this.eventToPipe = {}

    this.canvas.addEventListener('mousemove', (e) => this.processMouseMoveEvent(e));
    this.canvas.addEventListener('mouseleave', (e) => this.processMouseLeaveEvent());
  }

  setPipe(pipe) {
    this.eventToPipe[pipe.eventName] = pipe;
  }

  processMouseLeaveEvent() {
    this.eventToPipe[mouseLeaveEventName].emit(new MouseLeaveEvent(this.wasEntered));
    this.wasEntered = new Set();
  }

  processMouseMoveEvent(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    let arrayMouseEnter = [...this.mouseEnterComponents];
    let arrayMouseLeave = [...this.mouseLeaveComponents];

    let hoveredComponents = new Set([
        ...this.getAllContaining(x, y, arrayMouseEnter),
        ...this.getAllContaining(x, y, arrayMouseLeave),
    ]);

    // mouse enter
    let entered = new Set();
    for (let i = 0; i < arrayMouseEnter.length; i++) {
      let c = arrayMouseEnter[i];
      if (hoveredComponents.has(c) && !this.wasEntered.has(c)) {
        entered.add(c);
      }
    }

    if (entered.size > 0 && mouseEnterEventName in this.eventToPipe) {
      this.eventToPipe[mouseEnterEventName].emit(new MouseEnterEvent(entered));
    }

    // mouse leave
    let left = new Set();
    for (let i = 0; i < arrayMouseLeave.length; i++) {
      let c = arrayMouseLeave[i];
      if (!hoveredComponents.has(c) && this.wasEntered.has(c)) {
        left.add(c)
      }
    }
    if (left.size > 0 && mouseLeaveEventName in this.eventToPipe) {
      this.eventToPipe[mouseLeaveEventName].emit(new MouseLeaveEvent(left));
    }

    this.wasEntered = hoveredComponents;
  }

  // returns array
  getAllContaining(x, y, arr) {
    return arr.filter(c => c.containsPoint(x,y));
  }
}
