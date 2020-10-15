import Service from '@ember/service';

import Cell from '../projectcode/board/model/cell';

export default class BoardModelService extends Service {

  boardSize = 9;
  cells = {};

  constructor() {
    super();

    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        let newCell = new Cell(i, j);
        this.cells[newCell.id] = newCell;
      }
    }
  }
}
