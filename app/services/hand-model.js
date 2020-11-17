import Service from '@ember/service';

export default class HandModelService extends Service {

  constructor() {
    super();
    this.visibleHand = [];

    // initialization
    ['a', 'b', 'c', 'd', 'e', 'f', 'g']
      .map(c => c.toUpperCase())
      .forEach(l => this.visibleHand.push(l));
  }
}
