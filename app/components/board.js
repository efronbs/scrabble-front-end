import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Cell from '../projectcode/board/model/cell';
import UiClock from '../projectcode/board/view/ui-clock';
import UiComponent from '../projectcode/board/view/component/ui-component';
import SimpleBoardFrameComponent from '../projectcode/board/view/component/simple-board-frame-component';
import BoardImageBackgroundComponent from '../projectcode/board/view/component/board-image-background-component';
import TileComponent from '../projectcode/board/view/component/tile-component';
import ArrowComponent from '../projectcode/board/view/component/arrow-component';
import EventRegistry from '../projectcode/board/view/event/event-registry';
import { clickEventName } from '../projectcode/board/view/event/click-event';
import ClickEmitter from '../projectcode/board/view/event/click-emitter';
import ClickDispatcher from '../projectcode/board/view/event/click-dispatcher';
import { mouseEnterEventName } from '../projectcode/board/view/event/mouse-enter-event';
import { mouseLeaveEventName } from '../projectcode/board/view/event/mouse-leave-event';
import MouseEnterLeaveEmitter from '../projectcode/board/view/event/mouse-enter-leave-emitter';
import MouseEnterLeaveDispatcher from '../projectcode/board/view/event/mouse-enter-leave-dispatcher';
import { keyDownEventName } from '../projectcode/board/view/event/keyboard-events';
import KeyboardEmitter from '../projectcode/board/view/event/keyboard-emitter';
import KeyboardDispatcher from '../projectcode/board/view/event/keyboard-dispatcher';
import BoardModelService from '../services/board-model';
import BoardControllerService from '../services/board-controller';

/**
 * Some predefined z-index values for what layer ui components are rendered.
 * Clients do not have to use this enum, and can set drawing priority as they
 * see fit.
 *
 * There is no defined render order for ui components of the same index.
 */
export const ComponentIndex = {
  BACKGROUND: 0,
  SQUARES: 10,
  FRAME: 20,
  ANIMATIONS: 30
};

const woodBackgroundPath = 'assets/images/wood.jpg';

// TODO this class has way too many responsibilities. Currently acts as
// model, view, and controller for the game board. Should probably split the model
// and controller responsibilities into separate classes. This class should function
// as the view only.
export default class BoardComponent extends Component {

  @service boardModel;
  @service boardController;

  constructor(...args) {
    super(...args);

    // declared but uninitialized
    this.canvasContainer = null;
    this.canvas = null;

    // initialized properties
    this.uiClock = new UiClock();

    //*************************************************************************
    //*************************************************************************
    //*************************************************************************
    /** //TODO INJECT THIS INSTEAD OF INITIALIZING IT!
     * currently initializing these services instead of injecting them because
     * referencing injected objects with mixins that are outside of the ember
     * container requires some special extra handling.
     * see: https://github.com/emberjs/ember.js/issues/11135
     * Addressing this is beyond the scope of my current experience and MVP
     * requirements. HOWEVER, revisiting dependency injection is critical for
     * the scalability of this project and should happen sooner rather than later.
    **/
    this.boardModel = new BoardModelService();
    this.boardController = new BoardControllerService(this.boardModel);
    //*************************************************************************
    //*************************************************************************
    //*************************************************************************

    // ui component tracking
    this.uiComponents = new Array(ComponentIndex.ANIMATIONS + 1);
    this.idToComponent = {};
    this.componentIdToIndex = {};

    // first classed drawing components
    this.boardFrameComponent = null;
    this.boardBackgroundComponent = null;
    // mapping of cell id (retrieved from Cell.idFor) to component for that cell
    // this is functionally used as a way to get the tile component by board location
    // if attempting to retrieve the tile component from a component id (retrieved
    // from componentObject.getId()), uses the idToComponent field.
    this.squareComponents = {};

    // event registry
    this.eventRegistry = new EventRegistry();
  }

  // **********************************
  // ********* INITIALIZATION *********
  // **********************************
  @action init(element) {
    this.initializeCanvas(element)

    this.initializeController();

    this.initializeUiComponents();

    this.initializeEventRegistry();

    // add to the container
    element.appendChild(this.canvas);

    // create and start ui clock to allow for drawing and animations
    this.uiClock.registerObserver(this);
    this.uiClock.start();
  }

  initializeCanvas(element) {
    this.canvasContainer = element;

    // build canvas and initialize with required attributes
    let canvasSideLength = Math.min(this.canvasContainer.offsetHeight, this.canvasContainer.offsetWidth);
    this.canvas = document.createElement("canvas");
    this.canvas.id = "board";
    this.canvas.height = canvasSideLength;
    this.canvas.width = canvasSideLength;
    this.canvas.className = "board"
  }

  initializeController() {
    this.boardController.setBoard(this);
  }

  initializeUiComponents() {
    // create board component
    this.boardFrameComponent = new SimpleBoardFrameComponent(this.boardModel.boardSize, this.canvas.width);
    this.registerUiComponent(this.boardFrameComponent, ComponentIndex.FRAME);

    // create background component
    let backgroundImage = new Image(this.boardFrameComponent.boardEdgeSize, this.boardFrameComponent.boardEdgeSize);
    backgroundImage.src = woodBackgroundPath;

    this.boardBackgroundComponent = new BoardImageBackgroundComponent(
      backgroundImage,
      this.boardFrameComponent.centeringOffset,
      this.boardFrameComponent.centeringOffset,
      this.boardFrameComponent.boardEdgeSize,
      this.boardFrameComponent.boardEdgeSize
    );
    this.registerUiComponent(this.boardBackgroundComponent, ComponentIndex.BACKGROUND);

    // create all tiles components
    for (let row = 0; row < this.boardModel.boardSize; row++) {
      for (let column = 0; column < this.boardModel.boardSize; column++) {
        let id = Cell.idFor(row, column);
        let coordinates = this.boardFrameComponent.coordinatesForSquare(row, column);
        let newSquare = new TileComponent(
          coordinates['column'],
          coordinates['row'],
          this.boardFrameComponent.squareSideLength,
          this.boardModel.cells[id],
          this.boardController
        );
        this.squareComponents[id] = newSquare;
        this.registerUiComponent(newSquare, ComponentIndex.SQUARES);
      }
    }
  }

  initializeEventRegistry() {
    // emitters

    // currently don't need to track emitters at the board component level.
    // This may change in the future.
    const clickEmitter = new ClickEmitter(this.canvas);
    this.eventRegistry.bindEmitter(clickEmitter, clickEventName);

    const mouseEnterLeaveEmitter = new MouseEnterLeaveEmitter(
      this.canvas,
      this.eventRegistry.getComponentsForEvent(mouseEnterEventName),
      this.eventRegistry.getComponentsForEvent(mouseLeaveEventName)
    );
    this.eventRegistry.bindEmitter(mouseEnterLeaveEmitter, mouseEnterEventName);
    this.eventRegistry.bindEmitter(mouseEnterLeaveEmitter, mouseLeaveEventName);

    const keyboardEmitter = new KeyboardEmitter();
    this.eventRegistry.bindEmitter(keyboardEmitter, keyDownEventName);

    // dispatchers
    let clickDispatcher = new ClickDispatcher(this.componentIdToIndex);
    this.eventRegistry.bindDispatcher(clickDispatcher, clickEventName);

    let mouseEnterLeaveDispatcher = new MouseEnterLeaveDispatcher(this.componentIdToIndex);
    this.eventRegistry.bindDispatcher(mouseEnterLeaveDispatcher, mouseEnterEventName);
    this.eventRegistry.bindDispatcher(mouseEnterLeaveDispatcher, mouseLeaveEventName);

    const keyboardDispatcher = new KeyboardDispatcher();
    this.eventRegistry.bindDispatcher(keyboardDispatcher, keyDownEventName);

    // components
    Object.values(this.squareComponents).forEach(
      s =>  {
        this.eventRegistry.registerComponent(clickEventName, s);
        this.eventRegistry.registerComponent(mouseEnterEventName, s);
        this.eventRegistry.registerComponent(mouseLeaveEventName, s);
    });

    this.eventRegistry.registerComponent(keyDownEventName, this.boardController);
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
  draw(timedelta) {
    let ctx = this.canvas.getContext('2d');

    this.clearCanvas(ctx);
    this.updateUiComponents(timedelta);
    this.drawUiComponents(ctx);
  }

  clearCanvas(ctx) {
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  updateUiComponents(timeDelta) {
    this.uiComponents.forEach(
      (val, index, arr) => {
        if (val != null) {
          val.forEach(c => c.step(timeDelta));
        }
      }
    );
  }

  drawUiComponents(ctx) {
    this.uiComponents.forEach(
      (val, index, arr) => {
        if (val != null) {
          val.forEach(c => c.draw(ctx));
        }
      }
    );
  }

  // ***************************************
  // ********* MANAGING COMPONENTS *********
  // ***************************************

  registerUiComponent(component, zIndex = ComponentIndex.ANIMATIONS) {
    while(zIndex >= this.uiComponents.length) {
      this.uiComponents.push(null);
    }

    if (this.uiComponents[zIndex] == null) {
      this.uiComponents[zIndex] = new Set();
    }

    this.uiComponents[zIndex].add(component);
    this.componentIdToIndex[component.getId()] = zIndex;
  }

  removeComponent(component) {
    let id = component.getId();
    if (!(id in this.componentIdToIndex)) {
      return;
    }

    let zIndex = this.componentIdToIndex[id];
    this.uiComponents[zIndex].delete(component);
    delete this.componentIdToIndex[id];
  }
}
