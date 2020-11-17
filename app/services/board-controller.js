import Service from '@ember/service';

import ControllerStateTemplate from '../projectcode/board/controller/controller-state-template';
import { BoardState } from '../projectcode/board/controller/board-state';
import SquareSelectionControllerState from '../projectcode/board/controller/square-selection-controller-state';
import DirectionSelectionControllerState from '../projectcode/board/controller/direction-selection-controller-state';
import WordEntryControllerState from '../projectcode/board/controller/word-entry-controller-state';

const id = 'BoardControllerService';

export default class BoardControllerService extends Service {

  constructor(boardModel) {
    super();

    this.boardModel = boardModel;

    // fields set and used by strategies
    this.arrowComponents = null;
    this.focusedComponent = null;
    this.directionTranslation = null;

    // states to switch between
    this.squareSelectionState = new SquareSelectionControllerState(this);
    this.directionSelectionState = new DirectionSelectionControllerState(this);
    this.wordEntryState = new WordEntryControllerState(this);

    // mapping from state name to state strategy
    this.stateToStrategy = {};
    this.stateToStrategy[BoardState.SQUARE_SELECTION] = this.squareSelectionState;
    this.stateToStrategy[BoardState.DIRECTION_SELECTION] = this.directionSelectionState;
    this.stateToStrategy[BoardState.WORD_ENTRY] = this.wordEntryState;

    this.boardState = this.squareSelectionState;
    this.handModel = null;
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

  getHandModel() {
    if (this.handModel == null) {
      this.handModel = window.gameNamespace.handModel;
    }
    return this.handModel;
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
