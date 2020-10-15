/**
 * Data object representing a cell on a game board. Cells are defined by their
 * location on the board and the value they carry. Cells also contain an id
 * property to make map lookups easier.
 *
 * The id is based solely on the cell's position on a board, but is NOT affected
 * by the board on which it is placed. Thus, ANY TWO CELLS WITH THE SAME BOARD
 * COORDINATES ARE GUARANTEED TO HAVE THE SAME ID, REGARDLESS OF THEIR VALUE AND
 * THE BOARD THEY ARE PLACED ON. The calculation for an ID is considered to be
 * an implementation detail and may change at any time.
 */
export default class Cell {
  constructor(row, column) {
      this.row = row;
      this.column = column;
      this.id = Cell.idFor(this.row, this.column);
      this.value = '';
  };

  /**
   * Generates the ID for a cell with board position defined by the row and
   * column parameters.
   */
  static idFor(row, column) {
    return row + ',' + column;
  }
}
