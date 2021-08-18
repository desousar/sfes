import Component from '../Component.js';

export default class Voltmeter extends Component {
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
    valI = 0
  }) {
    super({
      name: 'Voltmeter',
      symbol,
      pins,
      valueLeft,
      valueTop,
      directionU,
      directionI,
      valI
    });
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
    return `
    U_${this.symbol} = ${this.valueU} V<br>
    I_${this.symbol} = ${this.valueI} A
    `;
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
      ' A';
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
    tdg.rowSpan = 1;
    var textg = document.createTextNode(this.symbol);
    const breakLine = document.createElement('br');
    const type = document.createTextNode('Voltmeter');
    tdg.appendChild(textg);
    tdg.appendChild(breakLine);
    tdg.appendChild(type);
    tr.appendChild(tdg);
    /**
     * right column
     */
    /*first line*/
    let tdvalueU = this.createElementTDvalueU(true);
    tr.appendChild(tdvalueU);
    table.appendChild(tr);
  }
}
