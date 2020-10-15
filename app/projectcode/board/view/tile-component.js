import UiComponent from './ui-component';
import ClickEvent from './click-event';
import { clickEventName } from './click-event';
import { mouseEnterEventName } from './mouse-enter-event';
import { mouseLeaveEventName } from './mouse-leave-event';

export default class TileComponent extends UiComponent {

  constructor(startX, startY, sideLength, cell, controller) {
    super();

    this.startX = startX;
    this.startY = startY;
    this.sideLength = sideLength;
    this.cell = cell;
    this.controller = controller;

    this.canvas == null;
    this.highlighted = false;

    this.eventToHandlerMap = {};
    this.eventToHandlerMap[clickEventName] = e => this.handleClickEvent(e);
    this.eventToHandlerMap[mouseEnterEventName] = e => this.handleMouseEnterEvent(e);
    this.eventToHandlerMap[mouseLeaveEventName] = e => this.handleMouseLeave(e);
  }

  getId() {
    return this.constructor.name + this.startX + this.startY + this.sideLength + this.cell.value;
  }

  draw(ctx) {
    if (this.highlighted) {
      ctx.fillStyle = 'rgba(85, 251, 64, 0.5)';
      ctx.fillRect(this.startX, this.startY, this.sideLength, this.sideLength);
    }
  }

  containsPoint(x, y) {
    return this.inTileRange(this.startX, x) && this.inTileRange(this.startY, y);
  }

  /**
   * Checks if the queriedLocation is inside the tile range. Only handles one
   * dimension.
   */
  inTileRange(startPoint, queriedLocation) {
    let distanceFromStart = queriedLocation - startPoint;
    return distanceFromStart >= 0 && distanceFromStart <= this.sideLength;
  }

  // Event Handling
  eventFired(e) {
    if (e.getName() in this.eventToHandlerMap) {
      this.eventToHandlerMap[e.getName()](e);
    }
  }

  handleClickEvent(clickEvent) {
    console.log("clicked tile for cell: " + this.cell.id);
  }

  handleMouseEnterEvent(mouseEnterEvent) {
    this.highlighted = true;
  }

  handleMouseLeave(mouseLeaveEvent) {
    this.highlighted = false;
  }
}
