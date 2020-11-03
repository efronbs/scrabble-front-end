import { CancelAction } from './action';
import { BoardState } from './board-state';
import ControllerStateTemplate from './controller-state-template';
import { keyDownEventName } from '../view/event/keyboard-events';
import { TileState } from '../view/component/tile-component';

// TODO extract this into its own class
export default class DirectionSelectionControllerState extends ControllerStateTemplate {
  
  processEvent(e) {
    if (e.getName() === keyDownEventName) {
      const stringCode = e.rawEvent.code;
      const asciiCode = e.rawEvent.keyCode;
      if (stringCode === 'Escape') {
          this.handleCancel(new CancelAction());
      }
      if (asciiCode >= 64 && asciiCode <= 90) {
        const enteredChar = String.fromCharCode(asciiCode);
      }
    }
  }

  handleSelection(action) {
    const selectedComponent = action.component;
    if (selectedComponent !== this.controller.focusedComponent) {
      this.handleCancel(new CancelAction());
    }
  }

  handleCancel(action) {
    Object.values(this.controller.board.squareComponents)
      .forEach(
        s => {
          s.setState(TileState.SELECTABLE);
          s.highlightable = true;
    });

    this.controller.arrowComponents.forEach(c => this.controller.board.removeComponent(c));
    this.controller.arrowComponents = null;

    this.controller.setState(BoardState.SQUARE_SELECTION);
  }
}
