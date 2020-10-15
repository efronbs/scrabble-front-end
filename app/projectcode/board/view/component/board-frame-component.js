import UiComponent from './ui-component';

/**
 * Extension of the UiComponent interface. Concrete lifecycle for a UI component
 * that draws the board frame. Additionally, provides information on the board
 * that allows other components to draw relative to key locations.
 *
 * Implementors MUST override all methods in this class unless the documentation
 * specifies that overriding is optional.
 */
export default class BoardFrameComponent extends UiComponent {

  /**
   * Provides the dimensions of the board in number of squares. The board is
   * always square, so only 1 value is returned. For example, if the board is
   * 9x9, 9 will be returned.
   *
   * This method should be treated as a convenience method. The model or
   * controller objects should be prefered if possible.
   */
   getBoardDimensions() {
    return -1;
   }

   /**
    * Returns the coordinates for the square specified by row and column values.
    *
    * @throws an error if the row and column do not map to a valid square on the
    *         board.
    */
   coordinatesForSquare(row, column) {
     return -1;
   }
}
