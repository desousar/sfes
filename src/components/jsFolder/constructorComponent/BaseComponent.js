import ObjectID from 'bson-objectid';

export default class BaseComponent {
  constructor(name, symbol, valueLeft, valueTop) {
    this.name = name;
    this.symbol = symbol;
    this.uniqueID = new ObjectID().toHexString();
    this.x = valueLeft;
    this.y = valueTop;

    this.showSymbol = false;
    this.selected = false;
  }

  /*-------------------StepB: BauteilGleichungen----------------------*/
  addValueUinListModelANDgetIndex(listModel, nb) {
    if (listModel[nb].indexOf('valueU'.concat(this.uniqueID)) === -1) {
      listModel[nb].push('valueU'.concat(this.uniqueID));
      return listModel[nb].indexOf('valueU'.concat(this.uniqueID));
    } else {
      return listModel[nb].indexOf('valueU'.concat(this.uniqueID));
    }
  }

  addValueIinListModelANDgetIndex(listModel, nb) {
    if (listModel[nb].indexOf('valueI'.concat(this.uniqueID)) === -1) {
      listModel[nb].push('valueI'.concat(this.uniqueID));
      return listModel[nb].indexOf('valueI'.concat(this.uniqueID));
    } else {
      return listModel[nb].indexOf('valueI'.concat(this.uniqueID));
    }
  }
}
