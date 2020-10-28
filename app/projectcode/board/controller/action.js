/**
 * Data objects representing different kinds of actions that can be taken and
 * the data passed along with those actions
 */
 export const ActionName = {
   SELECT: 'select',
   CANCEL: 'cancel',
   SUBMIT: 'submit',
 };

/**
 * Data object for a SelectAction
 */
 export class SelectAction {
   constructor(component) {
     this.name = ActionName.SELECT;
     this.component = component;
   }
 }

 export class CancelAction {
   constructor() {
     this.name = ActionName.CANCEL;
   }
 }
