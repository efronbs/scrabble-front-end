import ControllerStateTemplate from './controller-state-template';
import ArrowComponent from '../view/component/arrow-component';
import { TileState } from '../view/component/tile-component';
import TileComponent from '../view/component/tile-component';
import { ComponentIndex } from '../../../components/board';
import { BoardState } from './board-state';
import { clickEventName } from '../view/event/click-event';
import { keyDownEventName } from '../view/event/keyboard-events';
import { CancelAction, SubmitAction } from './action';
import Cell from '../model/cell';

// TODO extract this into separate class
export default class WordEntryControllerState extends ControllerStateTemplate {

  constructor(controller) {
    super(controller);

    // mapping of cell id to component. Tracks the components that have been
    // had their value changed as part of the current word entry process.
    // This state is shared between word entries, so it MUST be cleared when
    // an action would move the controller to a different state. For example,
    // on cancel or submit, after all necessary processing of the contained
    // components has been completed, this variable should be set to an empty map.
    this.processedComponents = {};
  }

  // overriden methods
  processEvent(e) {
    if (e.getName() === keyDownEventName) {
      const stringCode = e.rawEvent.code;
      const asciiCode = e.rawEvent.keyCode;
      if (stringCode === 'Escape') {
        this.handleCancel(new CancelAction());
      }
      if (stringCode === 'Enter') {
        this.handleSubmit(new SubmitAction());
      }
      if (asciiCode >= 64 && asciiCode <= 90) {
        const enteredChar = String.fromCharCode(asciiCode);
        this.processInputCharacter(enteredChar);
      }
    }
  }

  handleCancel(action) {
    super.handleCancel(action);

    Object.values(this.processedComponents).forEach(c => c.cell.value = '');
    this.processedComponents = {};
    this.controller.focusedComponent = null;
    this.controller.setState(BoardState.SQUARE_SELECTION);
  }

  handleSelection(action) {
    const selectedComponent = action.component;

    if (selectedComponent instanceof TileComponent) {
      if (selectedComponent !== this.controller.focusedComponent) {
        this.handleCancel(new CancelAction());
      }
    }

     // TODO if selected component is one of the tiles that previously had text
     // entered into it, move back to that tile.
  }

  handleSubmit(action) {
    this.controller.focusedComponent.setState(TileState.NOT_SELECTABLE);

    Object.values(this.controller.board.squareComponents)
      .filter(s => s.getId() !== this.controller.focusedComponent.getId())
      .forEach(
        s => {
          s.setState(TileState.SELECTABLE);
          s.highlightable = true;
    });

    this.processedComponents = {};
    this.controller.focusedComponent = null;
    this.controller.setState(BoardState.SQUARE_SELECTION);
  }

  // private methods
  processInputCharacter(char) {
    const focusedComponent = this.controller.focusedComponent;
    focusedComponent.cell.value = char;
    focusedComponent.highlightable = true;
    focusedComponent.setState(TileState.ENTERED_NOT_SUBMITTED);
    this.processedComponents[focusedComponent.cell.id] = focusedComponent;

    // Move to next cell
    let nextRow = focusedComponent.cell.row + this.controller.directionTranslation.y;
    let nextColumn = focusedComponent.cell.column + this.controller.directionTranslation.x;

    if (nextRow < 0 ||
          nextColumn < 0 ||
          nextRow >= this.controller.boardModel.boardSize ||
          nextColumn >= this.controller.boardModel.boardSize
        ) {
      nextRow = focusedComponent.cell.row;
      nextColumn = focusedComponent.cell.column;
    }

    const nextCellId = Cell.idFor(nextRow, nextColumn);
    const nextComponent = this.controller.board.squareComponents[nextCellId];
    nextComponent.setState(TileState.WAITING_FOR_INPUT);
    this.controller.focusedComponent = nextComponent;
  }
}
