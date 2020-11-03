import { ActionName } from './action';

const noop = a => {};

/**
 * Template for all state objects that define the behavior of the board controller
 * This is the super class for all state implementations. A diagram of the fst
 * defining the controller states and applicable actions on those states is shown
 * below.
 */
 // Board state FST
 //
 //  start ----> select <-------[CANCEL]--|
 //          |-> square                   |
 //          |       |                    |
 //          |       |>--[SELECT]--> select direction
 //          |                            |
 //          |                            |
 //          |------[CANCEL]-----< word <-|
 //          |------[SUBMIT]-----< entry
 //
 //

export default class ControllerStateTemplate {

  constructor(controller) {
    this.controller = controller;

    this.actionToBehavior = {};
    this.actionToBehavior[ActionName.SELECT] = (a) => this.handleSelection(a);
    this.actionToBehavior[ActionName.CANCEL] = (a) => this.handleCancel(a);
    this.actionToBehavior[ActionName.SUBMIT] = (a) => this.handleSubmit(a);
  }

  processAction(action) {
    const actionHandler = this.actionToBehavior[action.name] || noop;
    actionHandler(action);
  }

  handleSelection(action) {
    // BASE CASE DO NOTHING
  }

  handleCancel(action) {
    // BASE CASE DO NOTHING
  }

  handleSubmit(action) {
    // BASE CEASE DO NOTHING
  }

  processEvent(e) {
    // BASE CASE DO NOTHING
  }
}
