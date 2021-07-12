import BaseComponent from './BaseComponent.js';

export default class MultiPinComponent extends BaseComponent {
  constructor(name, symbol, pins, valueLeft, valueTop) {
    super(name, symbol, valueLeft, valueTop);
    this.pins = pins;
    this.isMultiPin = true;
    this.valuePhi = undefined;
  }

  //used just if MultiPin is a Potentialsource
  bauteilEqu(A, b, listModel, nb, rowCounter) {
    //1*U=0
    let indexU = this.addValueUinListModelANDgetIndex(listModel, nb);
    A[nb].set(rowCounter, indexU, 1); //-> 1*U
    b[nb].set(rowCounter, 0, 0); //-> equation equals 0
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

  getExportString() {
    let data =
      this.symbol + '(' + this.name + ')\n\tvaluePhi: ' + this.valuePhi + ' V';
    return data;
  }
}
