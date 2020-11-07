import UiComponent from './ui-component';
import ClickEvent from '../event/click-event';
import { clickEventName } from '../event/click-event';
import { mouseEnterEventName } from '../event/mouse-enter-event';
import { mouseLeaveEventName } from '../event/mouse-leave-event';
import { SelectAction, ActionName } from '../../controller/action';
import MathExtended from '../../../util/math-extended';

const fontName = 'Georgia, serif';

// States the tile can be in. Tile has different behaviors based on state
export const TileState = {
  SELECTABLE: 'selectable',
  UNFOCUSED: 'unfocused',
  WAITING_FOR_INPUT: 'waitingforinput',
  ENTERED_NOT_SUBMITTED: 'enterednotsubmitted',
  NOT_SELECTABLE: 'notselectable',
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

    // mutable state
    this.highlightable = true;
    this.fontSize = Math.floor(this.sideLength * .666);
    this.font = this.fontSize + 'px ' + fontName;

    this.canvas == null;

    // event mapping
    this.eventToHandlerMap = {};
    this.eventToHandlerMap[clickEventName] = e => this.handleClickEvent(e);
    this.eventToHandlerMap[mouseEnterEventName] = e => this.handleMouseEnterEvent(e);
    this.eventToHandlerMap[mouseLeaveEventName] = e => this.handleMouseLeaveEvent(e);

    // strategies
    this.selectableStrategy = new SelectableStrategy(this);
    this.unfocusedStrategy = new UnfocusedStrategy(this);
    this.waitingForInputStrategy = new WaitingForInputStrategy(this);
    this.enteredNoSubmittedStrategy = new EnteredNotSubmittedStrategy(this);
    this.notSelectableStrategy = new NotSelectableStrategy(this);

    // state to strategy
    this.stateToStrategy = {}
    this.stateToStrategy[TileState.SELECTABLE] = this.selectableStrategy;
    this.stateToStrategy[TileState.UNFOCUSED] = this.unfocusedStrategy;
    this.stateToStrategy[TileState.WAITING_FOR_INPUT] = this.waitingForInputStrategy
    this.stateToStrategy[TileState.ENTERED_NOT_SUBMITTED] = this.enteredNoSubmittedStrategy;
    this.stateToStrategy[TileState.NOT_SELECTABLE] = this.notSelectableStrategy;

    // initialize strategy to tile selection
    this.currentStrategy = this.selectableStrategy;
  }

  getId() {
    return this.constructor.name + this.startX + this.startY;
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

  drawLetter(ctx) {
    const text = this.cell.value;
    if (text === '') {
      return;
    }

    ctx.fillStyle = 'black';
    ctx.font = this.font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const textLocation = this.centerText(ctx, text);

    ctx.fillText(text, textLocation.x, textLocation.y);
  }

  centerText(ctx, text) {
    const metrics = ctx.measureText(text);
    const offsetX = (this.sideLength / 2) - (metrics.width / 2);
    return {
      x: this.startX + offsetX,
      y: this.startY + (this.sideLength / 6),
    }
  }

  // Forwarding to strategy
  draw(ctx) {
    this.currentStrategy.draw(ctx);
  }

  step(timeDelta) {
    this.currentStrategy.step(timeDelta);
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

// TODO: make base class for all strategies
// TODO: consider extracting strategies to separate javascript file
class SelectableStrategy {
  constructor(tile) {
    this.tile = tile;
    this.highlighted = false;
  }

  draw(ctx) {
    this.tile.drawLetter(ctx);
    if (this.highlighted && this.tile.highlightable) {
      ctx.fillStyle = 'rgba(85, 251, 64, 0.5)';
      ctx.fillRect(this.tile.startX, this.tile.startY, this.tile.sideLength, this.tile.sideLength);
    }
  }

  step(timeDelta) {
    // do nothing
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
    this.tile.drawLetter(ctx);
    ctx.fillStyle = this.shadedFillStyle;
    ctx.fillRect(this.tile.startX, this.tile.startY, this.tile.sideLength, this.tile.sideLength);
  }

  step(timeDelta) {
    // do nothing
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

class WaitingForInputStrategy {
  constructor(tile) {
    this.tile = tile;
    this.visible = true;
    this.timeVisibleMillis = 500;
    this.elapsed = 0;

    // cursor
    this.cursorStartX = this.tile.startX + ((this.tile.sideLength * 2) / 10);
    this.cursorStartY = this.tile.startY + ((this.tile.sideLength) / 6);
    this.cursorWidth = this.tile.sideLength / 20;
    this.cursorHeight = (this.tile.sideLength * 2) / 3;
  }

  draw(ctx) {
    ctx.fillStyle = 'black';
    if (this.visible) {
        // TODO consider only showing cursor if the tile has no value. Otherwise, blink existing value
        ctx.fillRect(this.cursorStartX, this.cursorStartY, this.cursorWidth, this.cursorHeight);
    }
  }

  step(timeDelta) {
    this.elapsed = MathExtended.clamp(this.elapsed + timeDelta, 0, this.timeVisibleMillis);

    if (this.elapsed == this.timeVisibleMillis) {
      this.visible = !this.visible;
      this.elapsed = 0;
    }
  }

  handleClickEvent(event) {
  }

  handleMouseEnterEvent(event) {
  }

  handleMouseLeaveEvent(event) {
  }
}

class EnteredNotSubmittedStrategy {
  constructor(tile) {
    this.tile = tile;
    this.highlighted = false;
  }

  draw(ctx) {
    this.tile.drawLetter(ctx);

    if (this.highlighted && this.tile.highlightable) {
      ctx.fillStyle = 'rgba(85, 251, 64, 0.5)';
      ctx.fillRect(this.tile.startX, this.tile.startY, this.tile.sideLength, this.tile.sideLength);
    } else {
      ctx.fillStyle = 'rgba(56, 105, 215, 0.5)';
      ctx.fillRect(this.tile.startX, this.tile.startY, this.tile.sideLength, this.tile.sideLength);
    }
  }

  step(timeDelta) {
    // do nothing
  }

  handleClickEvent(event) {
  }

  handleMouseEnterEvent(event) {
    this.highlighted = true;
  }

  handleMouseLeaveEvent(event) {
    this.highlighted = false;
  }
}

class NotSelectableStrategy {
  constructor(tile) {
    this.tile = tile;
  }

  draw(ctx) {
    this.tile.drawLetter(ctx);
  }

  step(timeDelta) {
    // do nothing
  }

  handleClickEvent(event) {
  }

  handleMouseEnterEvent(event) {
  }

  handleMouseLeaveEvent(event) {
  }
}
