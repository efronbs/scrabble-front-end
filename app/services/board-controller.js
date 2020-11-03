import Service from '@ember/service';

import ControllerStateTemplate from '../projectcode/board/controller/controller-state-template';
import { BoardState } from '../projectcode/board/controller/board-state';
import SquareSelectionControllerState from '../projectcode/board/controller/square-selection-controller-state';
import DirectionSelectionControllerState from '../projectcode/board/controller/direction-selection-controller-state';

const id = 'BoardControllerService';

export default class BoardControllerService extends Service {

  constructor(boardModel) {
    super();

    this.boardModel = boardModel;

    // states to switch between
    this.squareSelectionState = new SquareSelectionControllerState(this);
    this.directionSelectionState = new DirectionSelectionControllerState(this);
    this.wordEntryState = new WordEntryState(this);

    // mapping from state name to state strategy
    this.stateToStrategy = {};
    this.stateToStrategy[BoardState.SQUARE_SELECTION] = this.squareSelectionState;
    this.stateToStrategy[BoardState.DIRECTION_SELECTION] = this.directionSelectionState;
    this.stateToStrategy[BoardState.WORD_ENTRY] = this.wordEntryState;

    this.boardState = this.squareSelectionState;
  }

  // implementing some methods from ui component to subscribe to events.
  // if I need to do this more than exactly here I should extract a separate contract
  // for event subscribers
  getId() {
    return id;
  }

  setBoard(board) {
    this.board = board;;
  }

  processAction(action) {
    this.boardState.processAction(action);
  }

  setState(state) {
    this.boardState = this.stateToStrategy[state] || this.boardState;
  }

  eventFired(e) {
    this.boardState.processEvent(e);
  }
}

// TODO extract this into separate class
class WordEntryState extends ControllerStateTemplate {
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

  handleCancel() {
    // TODO: fill this in
  }

  handleSubmit() {
    // TODO: fill this in
  }
}
