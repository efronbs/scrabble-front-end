import { CancelAction } from './action';
import { BoardState } from './board-state';
import ControllerStateTemplate from './controller-state-template';
import { keyDownEventName } from '../view/event/keyboard-events';
import { TileState } from '../view/component/tile-component';
import TileComponent from '../view/component/tile-component';
import ArrowComponent from '../view/component/arrow-component';
import MathExtended from '../../util/math-extended';


// note: ranges are offset by PI / 4. This makes a clean range without having
// extra logic to check if right is 0 -> PI / 4 or 7PI / 4 -> 2PI
const angleOffset = Math.PI / 4;
const angleRanges = [
  { start: 0, end: Math.PI / 2, direction: 'right' },
  { start: Math.PI / 2, end: Math.PI, direction: 'up' },
  { start: Math.PI, end: (3 * Math.PI) / 2, direction: 'left' },
  { start: (3 * Math.PI) / 2, end: 2 * Math.PI, direction: 'down' },
];

const directionKeyToTranslationPair = {
  'up': {x: 0, y: -1},
  'down': {x: 0, y: 1},
  'left': {x: -1, y: 0},
  'right': {x: 1, y: 0},
};

// TODO extract this into its own class
export default class DirectionSelectionControllerState extends ControllerStateTemplate {

  // TODO add arrow key for directin selection
  processEvent(e) {
    if (e.getName() === keyDownEventName) {
      const stringCode = e.rawEvent.code;
      const asciiCode = e.rawEvent.keyCode;
      if (stringCode === 'Escape') {
          this.handleCancel(new CancelAction());
      }
    }
  }

  handleSelection(action) {
    const selectedComponent = action.component;

    if (selectedComponent instanceof TileComponent) {
      if (selectedComponent !== this.controller.focusedComponent) {
        this.handleCancel(new CancelAction());
      }
    }

    if (selectedComponent instanceof ArrowComponent) {
      // 1. set direction translation on controller
      const directionTranslation = this.determineDirection(selectedComponent);
      this.controller.directionTranslation = directionTranslation

      // 2. deregister both arrows from the board
      this.controller.arrowComponents.forEach(c => this.controller.board.removeComponent(c));
      this.controller.arrowComponents.forEach(c => this.controller.board.eventRegistry.removeComponent(c));

      // 3. null all references to both arrows
      this.controller.arrowComponents = null;

      // 4. set selected square to waiting for input state
      this.controller.focusedComponent.setState(TileState.WAITING_FOR_INPUT);

      // 5. move controller to word entry state
      this.controller.setState(BoardState.WORD_ENTRY);
    }

  }

  handleCancel(action) {
    super.handleCancel(action);

    this.controller.arrowComponents.forEach(c => this.controller.board.removeComponent(c));
    this.controller.arrowComponents = null;
    this.controller.focusedComponent = null;

    this.controller.setState(BoardState.SQUARE_SELECTION);
  }

  determineDirection(arrow) {
    const angle = (arrow.rawRotation + angleOffset) % (2 * Math.PI);
    const direction = angleRanges.filter(range => MathExtended.inRange(angle, range.start, range.end))[0].direction;
    return directionKeyToTranslationPair[direction];
  }
}
