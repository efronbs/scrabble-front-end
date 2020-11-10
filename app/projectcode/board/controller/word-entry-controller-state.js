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
    this.firstComponent = null;
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

      // TODO backspace should set the value in the current cell to empty string
      // and move back to the previous space. If you hit backspace with no letters
      // entered just wait on current space (consider cancelling entry instead)
      if (asciiCode === 8) {
        this.handleBackspace();
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
    this.firstComponent = null;
    this.controller.focusedComponent = null;
    this.controller.setState(BoardState.SQUARE_SELECTION);
  }

  handleSelection(action) {
    const selectedComponent = action.component;

    if (selectedComponent instanceof TileComponent) {
      if (selectedComponent === this.controller.focusedComponent) {
        // do nothing
        return;
      }
      if (selectedComponent.cell.id in this.processedComponents) {
        this.moveToSelectedComponent(selectedComponent);
        return;
      }
    }

    // all other cases just cancel
    this.handleCancel(new CancelAction());
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
    this.firstComponent = null;
    this.controller.focusedComponent = null;
    this.controller.setState(BoardState.SQUARE_SELECTION);
  }

  // private methods

  // TODO: make this skip over already entered characters
  processInputCharacter(char) {
    const focusedComponent = this.controller.focusedComponent;
    focusedComponent.cell.value = char;
    focusedComponent.highlightable = true;
    focusedComponent.setState(TileState.ENTERED_NOT_SUBMITTED);

    if (this.firstComponent == null) {
      this.firstComponent = focusedComponent;
    }

    this.processedComponents[focusedComponent.cell.id] = focusedComponent;

    // Move to next cell
    let foundNextViableSquare = false;
    let nextRow = focusedComponent.cell.row;
    let nextColumn = focusedComponent.cell.column;
    while (!foundNextViableSquare) {
      nextRow = nextRow + this.controller.directionTranslation.y;
      nextColumn = nextColumn + this.controller.directionTranslation.x;

      if (nextRow < 0 ||
        nextColumn < 0 ||
        nextRow >= this.controller.boardModel.boardSize ||
        nextColumn >= this.controller.boardModel.boardSize
      ) {
        nextRow = focusedComponent.cell.row;
        nextColumn = focusedComponent.cell.column;
        break;
      }

      let nextId = Cell.idFor(nextRow, nextColumn)
      let nextComponent = this.controller.board.squareComponents[nextId];
      if (nextComponent.cell.value === '') {
        foundNextViableSquare = true;
      }
    }

    const nextComponent = this.controller.board.squareComponents[Cell.idFor(nextRow, nextColumn)];
    nextComponent.setState(TileState.WAITING_FOR_INPUT);
    this.controller.focusedComponent = nextComponent;
  }

  // TODO: make this skip over squares the were not proessed
  handleBackspace() {
    const focusedComponent = this.controller.focusedComponent;

    // 1. Always clear the value of the current cell if there is one
    focusedComponent.cell.value = '';

    // 2. If the current cell is the first cell to type into, do nothing
    if (this.firstComponent.getId() === focusedComponent.getId()) {
      return
    }

    // 3. otherwise, prepare move to previous component
    const prevRow = focusedComponent.cell.row - this.controller.directionTranslation.y;
    const prevColumn = focusedComponent.cell.column - this.controller.directionTranslation.x;
    const prevCellId = Cell.idFor(prevRow, prevColumn);
    if (!prevCellId in this.processedComponents) {
      return;
    }
    const prevComponent = this.processedComponents[prevCellId];

    // 4. current component should return to unfocused state
    focusedComponent.setState(TileState.UNFOCUSED);

    // 5. set previous component
    prevComponent.setState(TileState.WAITING_FOR_INPUT);
    this.controller.focusedComponent = prevComponent;
  }

  // TODO: do NOT allow movement onto squares that have not been processed
  moveToSelectedComponent(selectedComponent) {
    if (this.controller.focusedComponent.cell.value !== '') {
      this.controller.focusedComponent.setState(TileState.ENTERED_NOT_SUBMITTED);
    } else {
      this.controller.focusedComponent.setState(TileState.UNFOCUSED);
    }
    this.controller.focusedComponent = selectedComponent;
    this.controller.focusedComponent.setState(TileState.WAITING_FOR_INPUT);
  }
}
