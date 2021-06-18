import Component from '../Component.js';

export default class CurrentSource extends Component {
  constructor({
    symbol,
    directionU = Component.PIN1_TO_PIN0,
    directionI = Component.PIN0_TO_PIN1,
    valueLeft = 0,
    valueTop = 0,
    pins = [
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ],
    valI
  }) {
    super({
      name: 'CurrentSource',
      symbol,
      pins,
      valueLeft,
      valueTop,
      directionU,
      directionI,
      valI
    });
  }

  assertMainValue() {
    if (this.valueI == undefined) {
      throw new Error('missing current value on ' + this.symbol);
    }
  }

  bauteilEqu(A, b, listModel, nb, rowCounter) {
    //1*I=value of src
    let indexI = this.addValueIinListModelANDgetIndex(listModel, nb);
    A[nb].set(rowCounter, indexI, 1); //-> 1*I
    b[nb].set(rowCounter, 0, this.valueI); //-> value of src
  }

  resetCalculatedValues() {
    this.valueR = undefined;
    this.valueU = undefined;
    this.potentialPin0 = undefined;
    this.potentialPin1 = undefined;
  }

  getString() {
    return `
    ${this.symbol} = ${this.valueI} A<br>
    U_${this.symbol} = ${this.valueU} V
    `;
  }

  getPopupResultRow(table) {
    let tr = document.createElement('tr');
    /**
     * left column
     */
    var tdg = document.createElement('td');
    tdg.className = 'td';
    tdg.rowSpan = 3;
    var textg = document.createTextNode(this.symbol);
    tdg.appendChild(textg);
    tr.appendChild(tdg);
    /**
     * right column
     */
    /*first line*/
    let tdvalueI = this.createElementTDvalueI();
    tr.appendChild(tdvalueI);
    table.appendChild(tr);

    /*other line valueU*/
    let tr3 = document.createElement('tr');
    let tdvalueU = this.createElementTDvalueU();
    tr3.appendChild(tdvalueU);
    table.appendChild(tr3);

    /*other line valuePotentials*/
    let tr4 = document.createElement('tr');
    let tdvaluePotentials = this.createElementTDvaluePotentials();
    tr4.appendChild(tdvaluePotentials);
    table.appendChild(tr4);
  }
}
