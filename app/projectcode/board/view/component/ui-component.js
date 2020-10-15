/**
 * Interface for a board component. UiComponents are responsible for managing
 * their own state and drawing themselve on the board.
 */
export default class UiComponent {

  /**
   * Return a unique id over all non-equivalent instances of the component.
   */
  getId() {
    return '';
  }

  /**
   * Method for the component to redraw itself.
   *
   * @param ctx  Drawing context. Used to draw this UI element.
   */
  draw(ctx) {
    // override in implementations
    return;
  }

  /**
   *
   */
  step(timeDelta) {
    // override in implementations
    return;
  }

  // TODO this can probably be replaced with registering a callback to the registry
  /**
   * Accepts a forward event.
   */
  eventFired(e) {
    return;
  }


  // TODO: A long while later, consider replacing this with collision boxes.
  //       This will allow components to more directly interact with each other
  //       and allow for more efficient "contains" interaction checks.

  /**
   * Checks if the point defined the provided x, y coordinates overlaps with the
   * component.
   */
  containsPoint(x, y) {
    return false;
  }

  /**
   * Publishes if the object is visible or not.
   */
  isVisible() {
    return true;
  }
}
