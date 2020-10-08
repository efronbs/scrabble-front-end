import Component from '@glimmer/component';
import { action } from '@ember/object';


// TODO this class has way too many responsibilities. Currently acts as
// model, view, and controller for the game board. Should probably split the model
// and controller responsibilities into separate classes. This class should function
// as the view only.
export default class BoardComponent extends Component {

  static BOARD_SIZE = 9;

  constructor(...args) {
    super(...args);

    // declared but uninitialized
    this.canvasContainer = null;
    this.canvas = null;
    this.boardEdgeSize = -1;
    this.squareSideLength = -1;

    // initialized properties
    this.highlightedCell = null;
    this.boardBorderThickness= 2;
    this.squareBorderThickness = 6;
    this.cells = {};
    for (let i = 0; i < BoardComponent.BOARD_SIZE; i++) {
      for (let j = 0; j < BoardComponent.BOARD_SIZE; j++) {
        let newCell = new BoardComponent.Cell(i, j);
        this.cells[newCell.id] = newCell;
      }
    }
  }

  // **********************************
  // ******** STATE MANAGEMENT ********
  // **********************************

  /**
   * Calculates and sets the state of the board. This method should be called
   * whenever the canvas needs to be drawn. For example, when it is first
   * initialized or after window resizing.
   */
  setBoardState() {
    // General algorithm:
    // We want all squares on the board to be evenly sized. Thus, a board edge
    // should be sized to largest possible value, within the container, which after
    // subtracting the amount of pixels dedicated to borders, can be divided evenly
    // among all squares.

    // TODO consider making numLine and/or nonSquarePixels instance properties
    // pixels on board taken up by the frame lines.
    let numLines = BoardComponent.BOARD_SIZE - 1;
    let nonSquarePixels = (2 * this.boardBorderThickness) + (numLines * this.squareBorderThickness);
    let containerSize = Math.min(this.canvasContainer.offsetHeight, this.canvasContainer.offsetWidth);
    this.squareSideLength = Math.floor((containerSize - nonSquarePixels) / BoardComponent.BOARD_SIZE);
    this.boardEdgeSize = (this.squareSideLength * BoardComponent.BOARD_SIZE) + nonSquarePixels;
  }

  // ***********************************
  // ********* DRAWING METHODS *********
  // ***********************************

  /**
   * Draws the entire scene. Current strategy is to redraw whenever the board
   * needs to be updated. However, in the future a more advanced drawing method
   * should be written to only clear what needs to be cleared and to only redraw
   * what needs to be redrawn.
   */
  draw() {
    this.clearCanvas();

    this.drawBoardFrame();
    this.drawHighlightedSquare();

    // debugging code
    // console.log(this.cells['2,7'])
    // console.log("board border thickness: " + this.boardBorderThickness);
    // console.log("square border thickness: " + this.squareBorderThickness);
    // console.log("square side length: " + this.squareSideLength);
    // let coords = this.cellToCoordinates(this.cells['2,7'])
    // console.log("coords for 2,7: " + coords['row'] + ', ' + coords['column']);
    // console.log("calculated cell for prev coords: " + this.coordinatesToCell(coords['row'], coords['column']).id);
    // console.log("calculated cell for coords 57, 57: " + this.coordinatesToCell(529,529));
  }

  clearCanvas() {
    let ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.boardEdgeSize, this.boardEdgeSize);
  }

  drawBoardFrame() {
    let ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'black';

    // TODO consider splitting outline and board squares when it is time to
    // draw more complex board shapes.

    //outline first
    // multiply by 2 as start point is middle pixel of the line, so half the
    // border will be rendered off the canvas
    ctx.lineWidth = 2 * this.boardBorderThickness;
    ctx.strokeRect(0, 0, this.boardEdgeSize, this.boardEdgeSize);

    // squares

    // 1 less line than number of squares on board
    let numLines = BoardComponent.BOARD_SIZE - 1;

    // draw vertical then horizontal
    this.drawBoardLines(ctx, numLines, true);
    this.drawBoardLines(ctx, numLines,  false);
  }

  /**
   * Draws the horizontal or vertical lines on the board.
   *
   * @param ctx  Object. 2d context of the canvas to draw on.
   * @param numLines  Integer. The number of lines to draw on the board.
   * @param vertical  Boolean. Whether the lines should be drawn vertically or
   *                  horizontally. True for vertical, false for horizontal.
   */
  drawBoardLines(ctx, numLines, vertical) {
    ctx.lineWidth = this.squareBorderThickness;
    for (let i = 0; i < numLines; i++) {

      // line is drawn in middle of thickness, need to add extra offset to start
      // of square to ensure it is drawn correctly. Additionally, line is drawn
      // after square, so another square length space must be added.
      let drawingOffset = this.calculateSquareOffset(i) + this.squareSideLength + (this.squareBorderThickness / 2);
      ctx.beginPath();
      if (vertical == true) {
        ctx.moveTo(drawingOffset, 0);
        ctx.lineTo(drawingOffset, this.boardEdgeSize);
      } else {
        ctx.moveTo(0, drawingOffset);
        ctx.lineTo(this.boardEdgeSize, drawingOffset);
      }
      ctx.fillStyle = 'black';
      ctx.stroke();
    }
  }

  drawHighlightedSquare() {
    // snapshot highlighted cell, prevent race condition where cell is not null
    // but is then nulled
    let cell = this.highlightedCell;
    if (cell == null) {
      return;
    }
    let startCoords = this.cellToCoordinates(cell);
    let ctx = this.canvas.getContext('2d');
    ctx.fillStyle = 'rgba(85, 251, 64, 0.5)';
    ctx.fillRect(startCoords['row'], startCoords['column'], this.squareSideLength, this.squareSideLength);
  }

  /**
   * Calculates the offset in pixels from the beginning of the board to the
   * start of the given square. As the board is always a square, does not
   * distinguish between horizontal or vertical.
   *
   * @param squareNumber  Integer. The numbered square in the row or column. Square
   *                      location is 0-indexed. For example, to find the start
   *                      of the 3rd square in any row or column,
   *                      squareNumber = 2
   */
  calculateSquareOffset(squareNumber) {
    // initial offset is the number of pixels the board's border takes up
    return (this.boardBorderThickness) +
        // number pixels of square divider passed
        (squareNumber * this.squareBorderThickness) +
        // number of squares passed
        ((squareNumber) * this.squareSideLength);
  }

  // ************************************
  // ******** CELL AND UTILITIES ********
  // ************************************

  /**
   * Object that represents the value of a specific square on the board. Not
   * intended for use outside of this class.
   */
  static Cell = class {
    constructor(row, column) {
        this.row = row;
        this.column = column;
        this.id = row + ',' + column;
        this.value = '';
    };
  }

  /**
   * Covnverts a BoardComponent.Cell to coordinates for the top left of the cell
   * on the board
   */
  cellToCoordinates(cell) {
    return {
      'row': this.calculateSquareOffset(cell.row),
      'column': this.calculateSquareOffset(cell.column),
    }
  }

  /**
   * Converts the given coorindates to the cell that they cross over. If the
   * coordinates do not cross any cell, null is returned
   */
  coordinatesToCell(row, column) {
    let rowIndex = this.indexForOffset(row);
    let columnIndex = this.indexForOffset(column);
    if (rowIndex < 0 || columnIndex < 0) {
      return null;
    }
    let key = rowIndex + ',' + columnIndex;
    return this.cells[rowIndex + ',' + columnIndex];
  }

  /**
   * Calculates the index for a cell given an offset into the board in pixels.
   * Offest may be either horizontal or vertical units. As the board is a square
   * it doesn't matter. If the offset does not fall on a square (such as on a
   * divider or off the board), -1 is returned;
   */
  indexForOffset(offset) {
    // off the board
    if (offset < this.boardBorderThickness || offset >= this.boardEdgeSize) {
      return -1;
    }

    let searchOffset = this.boardBorderThickness + this.squareSideLength + this.squareBorderThickness;

    for (var prevIndex = 0; prevIndex < BoardComponent.BOARD_SIZE; prevIndex++) {
      // search pointer has moved PAST the offset. Previous index is the square
      // the cell must point to, if the coordinate is valid
      if ((searchOffset - offset) > 0) {
        break;
      }
      searchOffset += this.squareSideLength + this.squareBorderThickness;
    }

    // offset must be on the square and not on the border.
    if (offset - (this.calculateSquareOffset + this.squareSideLength) > 0) {
      return -1;
    }

    return prevIndex;
  }

  // ***************************************
  // ******** ACTIONS AND LISTENERS ********
  // ***************************************
  @action initBoard(element) {
    this.canvasContainer = element;
    this.setBoardState();

    // build canvas and initialize with required attributes
    this.canvas = document.createElement("canvas");
    this.canvas.id = "board";
    this.canvas.height = this.boardEdgeSize;
    this.canvas.width = this.boardEdgeSize;
    this.canvas.className = "board"

    // add event listeners
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseleave', (e) => { this.highlightedCell = null; this.draw(); });

    // finally, add to the container
    element.appendChild(this.canvas);

    this.draw();
  }

  handleMouseMove(event) {
    let relX = event.clientX - this.canvas.offsetLeft;
    let relY = event.clientY - this.canvas.offsetTop;
    let cell = this.coordinatesToCell(relX, relY);

    if (cell == null) {
      this.highlightedCell = null;
      return;
    }

    this.highlightedCell = cell;
    this.draw();
  }

}
