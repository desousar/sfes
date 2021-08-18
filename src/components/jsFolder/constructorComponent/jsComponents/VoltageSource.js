import Component from '../Component.js';

export default class VoltageSource extends Component {
  constructor({
    symbol,
    directionU = Component.PIN0_TO_PIN1,
    directionI = Component.PIN1_TO_PIN0,
    valueLeft = 0,
    valueTop = 0,
    pins = [
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ],
    valU
  }) {
    super({
      name: 'VoltageSource',
      symbol,
      pins,
      valueLeft,
      valueTop,
      directionU,
      directionI,
      valU
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
    if (this.valueU == undefined) {
      return 'missing voltage value on ' + this.symbol;
    } else {
      return undefined;
    }
  }

  bauteilEqu(A, b, listModel, nb, rowCounter) {
    //1*U=value of src
    let indexU = this.addValueUinListModelANDgetIndex(listModel, nb);
    A[nb].set(rowCounter, indexU, 1); //-> 1*U
    b[nb].set(rowCounter, 0, this.valueU); //-> value of src
  }

  resetCalculatedValues() {
    this.valueR = undefined;
    this.valueI = undefined;
    this.potentialPin0 = undefined;
    this.potentialPin1 = undefined;
  }

  getString() {
    if (this.valueP) {
      return `
    ${this.symbol} = ${this.valueU} V<br>
    I_${this.symbol} = ${this.valueI} A<br>
    P_${this.symbol} = ${this.valueP} W<br>
    generated power
    `;
    } else {
      return `
    ${this.symbol} = ${this.valueU} V<br>
    I_${this.symbol} = ${this.valueI} A<br>
    P_${this.symbol} = ${this.valueP} W
    `;
    }
  }

  getExportString() {
    let data =
      this.symbol +
      '(' +
      this.name +
      ')\n\tvoltage: ' +
      this.valueU +
      ' V\n\tcurrent: ' +
      this.valueI +
      ' A\n\tpower: ' +
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
    const type = document.createTextNode('Voltage source');
    tdg.appendChild(textg);
    tdg.appendChild(breakLine);
    tdg.appendChild(type);
    tr.appendChild(tdg);
    /**
     * right column
     */
    /*first line*/
    let tdvalueU = this.createElementTDvalueU(false);
    tr.appendChild(tdvalueU);
    table.appendChild(tr);

    /*other line valueI*/
    let tr2 = document.createElement('tr');
    let tdvalueI = this.createElementTDvalueI(true);
    tr2.appendChild(tdvalueI);
    table.appendChild(tr2);

    /*other line valuePotentials*/
    let tr4 = document.createElement('tr');
    let tdvaluePotentials = this.createElementTDvaluePotentials();
    tr4.appendChild(tdvaluePotentials);
    table.appendChild(tr4);
  }
}
