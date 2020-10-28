import Service from '@ember/service';

import ControllerStateTemplate from '../projectcode/board/controller/controller-state-template';
import { BoardState } from '../projectcode/board/controller/board-state';
import SquareSelectionControllerState from '../projectcode/board/controller/square-selection-controller-state';
import { keyDownEventName } from '../projectcode/board/view/event/keyboard-events';
import { CancelAction } from '../projectcode/board/controller/action';
import { TileState } from '../projectcode/board/view/component/tile-component';

const id = 'BoardControllerService';

export default class BoardControllerService extends Service {

  constructor(boardModel) {
    super();

    this.boardModel = boardModel;

    // states to switch between
    this.squareSelectionState = new SquareSelectionControllerState(this);
    this.directionSelectionState = new DirectionSelectionState(this);
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


// TODO extract this into its own class
class DirectionSelectionState extends ControllerStateTemplate {
  processEvent(e) {
    if (e.getName() === keyDownEventName && e.rawEvent.code === 'Escape') {
      this.handleCancel(new CancelAction());
    }
  }

  handleSelection(action) {
    // TODO: fill this in
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

class WordEntryState extends ControllerStateTemplate {
  handleCancel() {
    // TODO: fill this in
  }

  handleSubmit() {
    // TODO: fill this in
  }
}
