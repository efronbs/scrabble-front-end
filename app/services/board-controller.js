import Service from '@ember/service';
import { inject as service } from '@ember/service';

export const BoardLifecycle = {
  SQUARE_SELECT: "square_select",
  DIRECTION_SELECT: "dir_select",
  WORD_ENTRY: "word_entry",
}

export const BoardActions = {
  CLICK: "click",
}

export default class BoardControllerService extends Service {

  @service boardModel

  constructor() {
    super();

    this.currentLifecycle = BoardLifecycle.SQUARE_SELECT;
  }

  setLifecycle(lifecycle) {
    this.currentLifecycle = lifecycle;
  }

  // processClick()
}
