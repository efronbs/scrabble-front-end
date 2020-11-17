import Component from '@glimmer/component';
import { action } from '@ember/object';

import HandModelService from '../services/hand-model';

const canvasHeightRatio = .9
const canvasWidthRatio = 1.5;
const borderThickness = 6;
const woodBackgroundPath = 'assets/images/wood.jpg';

export default class HandComponent extends Component {
    constructor(...args) {
      super(...args);

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
      this.handModel = new HandModelService(this.visibleHand);

      /** // TODO: SET THESE VALUES WHERE DI FACTORIES ARE SET UP!
       * Values initialized here are intended to be global values shared between all
       * classes in the system. Thus, they should be either injected or set as properties
       * in some global namespace, likely handled by the ember DI framework. Initialization
       * here is simply a temporary workaround until I do a deep dive into ember's DI
       * framework.
       */
       if (window.gameNamespace == null) {
         window.gameNamespace = {};
       }
       window.gameNamespace.handModel = this.handModel;

      //*************************************************************************
      //*************************************************************************
      //*************************************************************************
    }

    @action init(element) {
      while(
        window.gameNamespace.boardController == null &&
          window.gameNamespace.boardComponent == null
      ) {
        sleep(100);
      }

      this.board = window.gameNamespace.boardComponent;
      this.boardController = window.gameNamespace.boardController;

      this.initializeCanvas(element);

      this.initializeHandBackground();

      element.appendChild(this.canvas);
    }

    initializeCanvas(element) {
      this.canvasContainer = element;

      const canvasContainerHeight = this.canvasContainer.offsetHeight;
      const canvasWidth = Math.floor(this.board.canvas.width * canvasWidthRatio);
      const canvasHeight = Math.floor(canvasContainerHeight * canvasHeightRatio);
      const canvasPadding = (canvasContainerHeight - canvasHeight) / 2;

      this.canvas = document.createElement("canvas");
      this.canvas.id = "hand";
      this.canvas.width = canvasWidth;
      this.canvas.height = canvasHeight;
      this.canvas.style.padding = canvasPadding + 'px 0px ' + canvasPadding + 'px 0px';
      this.canvas.className = 'hand';
    }

    initializeHandBackground() {
      const ctx = this.canvas.getContext('2d');

      const backgroundImage = new Image(this.canvas.width, this.canvas.height);
      backgroundImage.src = woodBackgroundPath;
      // need to give background image time to load
      backgroundImage.onload = () => ctx.drawImage(backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
    }

}
