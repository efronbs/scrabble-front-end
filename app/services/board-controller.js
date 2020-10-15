import Service from '@ember/service';
import { inject as service } from '@ember/service';

// TODO export these
export const BoardState = {
  TILE_SELECTION: 'tileselection',
  DIRECTION_SELECTION: 'directionselection',
};

export const Action = {
  SELECT: 'select'
}

export default class BoardControllerService extends Service {

  @service boardModel

  constructor() {
    super();

    this.boardState = BoardState.TILE_SELECTION;
  }

  setBoard(board) {
    this.board = board;;
  }
}

class TileSelectionStrategy {
  constructor() {
    this.actionToBehavior = {};
    this.actionToBehavior[Action.SELECT] = (component) => handleSelection(component);
  }
}
