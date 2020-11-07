import ControllerStateTemplate from './controller-state-template';
import ArrowComponent from '../view/component/arrow-component';
import { TileState } from '../view/component/tile-component';
import TileComponent from '../view/component/tile-component';
import { ComponentIndex } from '../../../components/board';
import { BoardState } from './board-state';
import { clickEventName } from '../view/event/click-event';

export default class SquareSelectionControllerState extends ControllerStateTemplate {

  constructor(controller) {
    super(controller);
  }

  handleSelection(action) {
    const selectedComponent = action.component;

    // component MUST be a tile-component
    if (!(selectedComponent instanceof TileComponent)) {
      console.log('non tile component selected');
      return;
    }

    const arrowComponents = this.buildArrowComponents(selectedComponent);
    arrowComponents.forEach(c => this.controller.board.registerUiComponent(c, ComponentIndex.ANIMATIONS));
    arrowComponents.forEach(c => this.controller.board.eventRegistry.registerComponent(clickEventName, c));

    Object.values(this.controller.board.squareComponents)
      .filter(s => s.getId() !== selectedComponent.getId())
      .forEach(s => s.setState(TileState.UNFOCUSED));

    selectedComponent.highlightable = false;

    this.controller.arrowComponents = arrowComponents;
    this.controller.focusedComponent = selectedComponent;
    this.controller.setState(BoardState.DIRECTION_SELECTION);
  }

  buildArrowComponents(selectedComponent) {
    const components = [];
    const cell = selectedComponent.cell;

    // horizontal cell
    if (cell.column < this.controller.boardModel.boardSize - 1) {
      const startPoint = {
        x: selectedComponent.startX + selectedComponent.sideLength,
        y: selectedComponent.startY + (selectedComponent.sideLength / 2)
      };
      const angle = 0;

      components.push(new ArrowComponent(startPoint.x, startPoint.y, selectedComponent.sideLength, this.controller, angle));
    }

    if (cell.row < this.controller.boardModel.boardSize - 1) {
      const startPoint = {
        x: selectedComponent.startX + (selectedComponent.sideLength / 2),
        y: selectedComponent.startY + (selectedComponent.sideLength)
      };
      const angle = 270;

      components.push(new ArrowComponent(startPoint.x, startPoint.y, selectedComponent.sideLength, this.controller, angle));
    }

    return components;
  }
}
