import BaseComponent from './BaseComponent.js';

export default class MultiPinComponent extends BaseComponent {
  constructor(name, symbol, pins, valueLeft, valueTop) {
    super(name, symbol, valueLeft, valueTop);
    this.pins = pins;
    this.isMultiPin = true;
    this.valuePhi = undefined;
  }
  //function
  addValuePHIinListModelANDgetIndex(listModel, nb) {
    if (listModel[nb].indexOf('valuePhi'.concat(this.uniqueID)) === -1) {
      listModel[nb].push('valuePhi'.concat(this.uniqueID));
      return listModel[nb].indexOf('valuePhi'.concat(this.uniqueID));
    } else {
      return listModel[nb].indexOf('valuePhi'.concat(this.uniqueID));
    }
  }
}
