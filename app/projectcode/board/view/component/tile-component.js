import UiComponent from './ui-component';
import ClickEvent from '../event/click-event';
import { clickEventName } from '../event/click-event';
import { mouseEnterEventName } from '../event/mouse-enter-event';
import { mouseLeaveEventName } from '../event/mouse-leave-event';
import { SelectAction, ActionName } from '../../controller/action';

// States the tile can be in. Tile has different behaviors based on state
export const TileState = {
  SELECTABLE: 'selectable',
  UNFOCUSED: 'unfocused',
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
    this.highlightable = true;

    this.canvas == null;

    // event mapping
    this.eventToHandlerMap = {};
    this.eventToHandlerMap[clickEventName] = e => this.handleClickEvent(e);
    this.eventToHandlerMap[mouseEnterEventName] = e => this.handleMouseEnterEvent(e);
    this.eventToHandlerMap[mouseLeaveEventName] = e => this.handleMouseLeaveEvent(e);

    // strategies
    this.selectableStrategy = new SelectableStrategy(this);
    this.UnfocusedStrategy = new UnfocusedStrategy(this);

    // state to strategy
    this.stateToStrategy = {}
    this.stateToStrategy[TileState.SELECTABLE] = this.selectableStrategy;
    this.stateToStrategy[TileState.UNFOCUSED] = this.UnfocusedStrategy;

    // initialize strategy to tile selection
    this.currentStrategy = this.selectableStrategy;
  }

  getId() {
    return this.constructor.name + this.startX + this.startY + this.sideLength + this.cell.value;
  }

  setState(stateName) {
    this.currentStrategy = this.stateToStrategy[stateName] || this.currentStrategy;
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

class SelectableStrategy {
  constructor(tile) {
    this.tile = tile;
    this.highlighted = false;
  }

  draw(ctx) {
    if (this.highlighted && this.tile.highlightable) {
      ctx.fillStyle = 'rgba(85, 251, 64, 0.5)';
      ctx.fillRect(this.tile.startX, this.tile.startY, this.tile.sideLength, this.tile.sideLength);
    }
  }

  handleClickEvent(event) {
    this.tile.controller.processAction(new SelectAction(this.tile));
  }

  handleMouseEnterEvent(event) {
    this.highlighted = true;
  }

  handleMouseLeaveEvent(event) {
    this.highlighted = false;
  }
}

class UnfocusedStrategy {
  constructor(tile) {
    this.tile = tile;
    this.shadedFillStyle = 'rgba(0, 0, 0, 0.5)';
  }

  draw(ctx) {
    ctx.fillStyle = this.shadedFillStyle;
    ctx.fillRect(this.tile.startX, this.tile.startY, this.tile.sideLength, this.tile.sideLength);
  }

  handleClickEvent(event) {
    this.tile.controller.processAction(new SelectAction(this.tile));
  }

  handleMouseEnterEvent(event) {
    // nothing when unfocused
  }

  handleMouseLeaveEvent(event) {
    // nothing when unfocused
  }
}
