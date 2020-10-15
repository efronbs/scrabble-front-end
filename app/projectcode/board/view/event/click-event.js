import EventContract from './event-contract';

export const clickEventName = 'click';

/**
 * Data object representing the information present in a click event.
 */
export default class ClickEvent extends EventContract {

  /**
   * Constructor. All values passed to the constructor are accessible as fields
   * on the data object.
   *
   * @param x  The x value of the mouse on the canvas when the click occurred.
   * @param y  The y value of the mouse on the canvas when the click occurred.
   */
  constructor(x,y,) {
    super();

    this.x = x;
    this.y = y;
  }

  getName() {
    return clickEventName;
  }
}
