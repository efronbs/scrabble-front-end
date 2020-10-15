import UiComponent from './ui-component';
import BoardFrameComponent from './board-frame-component';

export default class SimpleBoardFrameComponent extends UiComponent {

  /**
   * Constants for drawing the border. Consider providing a way to inject this
   * value in the future.
   */
  borderThickness = 6;

  /**
   * Constructor.
   *
   * @param numRowSquares  The number of playing squares in a row on the board.
   *                       For example, if the board will be 9x9,
   *                       numRowSquares = 9.
   * @param canvasEdgeSize  The size of the edge of the canvas. The canvas is
   *                        assumed to be square.
   */
  constructor(numRowSquares, canvasEdgeSize) {
    super();

    this.numRowSquares = numRowSquares;
    this.canvasEdgeSize = canvasEdgeSize;

    let numLines = numRowSquares - 1;
    let nonSquarePixels = (2 * this.borderThickness) + (numLines * this.borderThickness);
    this.squareSideLength = Math.floor((canvasEdgeSize - nonSquarePixels) / numRowSquares);
    // number of pixels taken up by the board
    this.boardEdgeSize = (this.squareSideLength * numRowSquares) + nonSquarePixels;

    let overflowPixels = this.canvasEdgeSize - this.boardEdgeSize;
    this.centeringOffset = Math.floor(overflowPixels / 2);
  }

  getId() {
    return this.constructor.name + this.numRowSquares + this.canvasEdgeSize
  }

  // DRAWING LOGIC
  draw(ctx) {
    this.drawBorder(ctx);

    let numLines = this.numRowSquares - 1;
    this.drawBoardLines(ctx, numLines, true);
    this.drawBoardLines(ctx, numLines, false);
  }

  drawBorder(ctx) {
    ctx.fillStyle = 'black';
    ctx.lineWidth = this.borderThickness;

    // line width draws in the center of the line, so need to account for
    // line width and the front and back end of drawing
    let start = this.centeringOffset + this.borderThickness / 2;
    // subtract full border thickness as need to account for the half length on
    // both sides of border that isn't specified due to line drawing start location.
    ctx.strokeRect(start, start, this.boardEdgeSize - this.borderThickness, this.boardEdgeSize - this.borderThickness);
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
    ctx.fillStyle = 'black';
    ctx.lineWidth = this.borderThickness;
    for (let i = 0; i < numLines; i++) {

      // line is drawn in middle of thickness, need to add extra offset to start
      // of square to ensure it is drawn correctly. Additionally, line is drawn
      // after square, so another square length space must be added.
      let drawingOffset = this.calculateSquareOffset(i) + this.squareSideLength + (this.borderThickness / 2);
      ctx.beginPath();
      if (vertical == true) {
        ctx.moveTo(drawingOffset, this.centeringOffset);
        ctx.lineTo(drawingOffset, this.boardEdgeSize + this.centeringOffset);
      } else {
        ctx.moveTo(this.centeringOffset, drawingOffset);
        ctx.lineTo(this.boardEdgeSize + this.centeringOffset, drawingOffset);
      }
      ctx.fillStyle = 'black';
      ctx.stroke();
    }
  }

  /**
   * Calculates the offset in pixels from the beginning of the canvas to the
   * start of the given square. As the board is always a square, does not
   * distinguish between horizontal or vertical.
   *
   * @param squareNumber  Integer. The numbered square in the row or column. Square
   *                      location is 0-indexed. For example, to find the start
   *                      of the 3rd square in any row or column,
   *                      squareNumber = 2
   */
  calculateSquareOffset(squareNumber) {
    // initial offset from canvas edge to center board on canvas
    return this.centeringOffset +
        // number of pixels the board's border takes up
        this.borderThickness +
        // number of squares passed
        (squareNumber * this.squareSideLength) +
        // number pixels of square divider passed
        (squareNumber * this.borderThickness);
  }

  // PUBLISHED DRAWING INFORMATION
   getBoardDimensions() {
     return this.numRowSquares;
   }


   coordinatesForSquare(row, column) {
     if (row < 0 || row >= this.numRowSquares || column < 0 || column >= this.numRowSquares) {
       throw 'square: (' + row + ',' + column + ') does not exist on board of size ' + this.numRowSquares;
     }

     return {
       'row': this.calculateSquareOffset(row),
       'column': this.calculateSquareOffset(column),
     };
   }

   // TODO this is not actually coordinates for offset, this is square for coordinates
  // coordinatesForSquare(row, column) {
  //   let rowIndex = this.indexForOffset(row);
  //   let columnIndex = this.indexForOffset(column);
  //
  //   if (rowIndex < 0 || columnIndex < 0) {
  //     throw 'coordinates: ' + row + ',' + column + ' do not map to a valid square';
  //   }
  //
  //   return {
  //     'row' : rowIndex,
  //     'column' : columnIndex,
  //   };
  // }

  indexForOffset(offset) {
    let boardStart = this.centeringOffset + this.borderThickness;
    let boardEnd = boardStart + this.boardEdgeSize;

    // off the board
    if (offset < boardStart || offset > boardEnd) {
      return -1;
    }

    let searchOffset = this.centeringOffset + this.squareSideLength + 2 * this.borderThickness;

    for (var prevIndex = 0; prevIndex < this.numRowSquares; prevIndex++) {
      // search pointer has moved PAST the offset. Previous index is the square
      // the cell must point to, if the coordinate is valid
      if ((searchOffset - offset) > 0) {
        break;
      }
      searchOffset += this.squareSideLength + this.borderThickness;
    }

    // offset must be on the square and not on the border.
    if (offset - (this.calculateSquareOffset(prevIndex) + this.squareSideLength) > 0) {
      return -1;
    }

    return prevIndex;
  }

}
