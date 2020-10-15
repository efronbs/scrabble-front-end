import UiComponent from './ui-component';
import ClickEvent from '../event/click-event';
import { clickEventName } from '../event/click-event';
import { mouseEnterEventName } from '../event/mouse-enter-event';
import { mouseLeaveEventName } from '../event/mouse-leave-event';

export const TileState = {
  TILE_SELECTION: 'tileselection',
  DIRECTION_SELECTION: 'directionselection',
};

export default class TileComponent extends UiComponent {

  constructor(startX, startY, sideLength, cell, controller) {
    super();

    // internal state
    this.startX = startX;
    this.startY = startY;
    this.sideLength = sideLength;
    this.cell = cell;
    this.controller = controller;

    this.canvas == null;
    this.focused = false;

    // event mapping
    this.eventToHandlerMap = {};
    this.eventToHandlerMap[clickEventName] = e => this.handleClickEvent(e);
    this.eventToHandlerMap[mouseEnterEventName] = e => this.handleMouseEnterEvent(e);
    this.eventToHandlerMap[mouseLeaveEventName] = e => this.handleMouseLeaveEvent(e);

    // strategies
    this.tileSelectionStrategy = new TileSelectionStrategy(this);

    // fst state to strategy
    this.stateToStrategy = {}
    this.stateToStrategy[TileState.TILE_SELECTION] = this.tileSelectionStrategy;

    // initialize strategy to tile selection
    this.currentStrategy = this.tileSelectionStrategy
  }

  getId() {
    return this.constructor.name + this.startX + this.startY + this.sideLength + this.cell.value;
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

  // Forwarding to strategy
  draw(ctx) {
    this.currentStrategy.draw(ctx);
  }

  eventFired(e) {
    if (e.getName() in this.eventToHandlerMap) {
      this.eventToHandlerMap[e.getName()](e);
    }
  }

  handleClickEvent(event) {
    this.currentStrategy.handleClickEvent(event);
  }

  handleMouseEnterEvent(event) {
    this.currentStrategy.handleMouseEnterEvent(event);
  }

  handleMouseLeaveEvent(event) {
    this.currentStrategy.handleMouseLeaveEvent(event);
  }
}

class TileSelectionStrategy {
  constructor(tile) {
    this.tile = tile;
    this.highlighted = false;
  }

  draw(ctx) {
    if (this.highlighted) {
      ctx.fillStyle = 'rgba(85, 251, 64, 0.5)';
      ctx.fillRect(this.tile.startX, this.tile.startY, this.tile.sideLength, this.tile.sideLength);
    }
  }

  handleClickEvent(event) {
    /** // TODO implement state change */
    this.tile.controller.
  }

  handleMouseEnterEvent(event) {
    this.highlighted = true;
  }

  handleMouseLeaveEvent(event) {
    this.highlighted = false;
  }
}

class DirectionSelectionStrategy {
  constructor(tile) {
    this.tile = tile;
  }

  draw(ctx) {
    if (! this.tile.focused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(this.tile.startX, this.tile.startY, this.tile.sideLength, this.tile.sideLength);
    }
  }

  handleClickEvent(event) {
    /** // TODO implement state change */
  }

  handleMouseEnterEvent(event) {
    this.highlighted = true;
  }

  handleMouseLeaveEvent(event) {
    this.highlighted = false;
  }
}
