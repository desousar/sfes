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
    this.valueP = undefined;
  }

  calculatePower() {
    /**
     * directionU = 0 => pin0 -> pin1
     * directionI = 0 => pin0 -> pin1
     */
    let dI;
    this.directionI === 0 ? (dI = 1) : (dI = -1);
    let dU;
    this.directionI === 0 ? (dU = 1) : (dU = -1);
    this.valueP = -1 * this.valueU * dU * this.valueI * dI;
  }

  assertMainValueStr() {
    if (this.valueI == undefined) {
      return 'missing current value on ' + this.symbol;
    } else {
      return undefined;
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
    if (this.valueP) {
      return `
    ${this.symbol} = ${this.valueI} A<br>
    U_${this.symbol} = ${this.valueU} V<br>
    P_${this.symbol} = ${this.valueP} W<br>
    generated power
    `;
    } else {
      return `
    ${this.symbol} = ${this.valueI} A<br>
    U_${this.symbol} = ${this.valueU} V<br>
    P_${this.symbol} = ${this.valueP} W
    `;
    }
  }

  getExportString() {
    let data =
      this.symbol +
      '(' +
      this.name +
      ')\n\tcurrent: ' +
      this.valueI +
      ' A\n\tvoltage: ' +
      this.valueU +
      ' V\n\tpower: ' +
      this.valueP +
      ' W (generated power)';
    return data;
  }

  selection() {
    this.selected = !this.selected;
  }

  getPopupResultRow(table) {
    let tr = document.createElement('tr');
    /**
     * left column
     */
    var tdg = document.createElement('td');
    tdg.style.backgroundColor = '#ffffff';
    tdg.className = 'td';
    tdg.rowSpan = 3;
    var textg = document.createTextNode(this.symbol);
    const breakLine = document.createElement('br');
    const type = document.createTextNode('Current source');
    tdg.appendChild(textg);
    tdg.appendChild(breakLine);
    tdg.appendChild(type);
    tr.appendChild(tdg);
    /**
     * right column
     */
    /*first line*/
    let tdvalueI = this.createElementTDvalueI(false);
    tr.appendChild(tdvalueI);
    table.appendChild(tr);

    /*other line valueU*/
    let tr3 = document.createElement('tr');
    let tdvalueU = this.createElementTDvalueU(true);
    tr3.appendChild(tdvalueU);
    table.appendChild(tr3);

    /*other line valuePotentials*/
    let tr4 = document.createElement('tr');
    let tdvaluePotentials = this.createElementTDvaluePotentials();
    tr4.appendChild(tdvaluePotentials);
    table.appendChild(tr4);
  }
}
