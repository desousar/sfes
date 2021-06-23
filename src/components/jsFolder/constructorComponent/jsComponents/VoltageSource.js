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
  }

  assertMainValue() {
    if (this.valueU == undefined) {
      throw new Error('missing voltage value on ' + this.symbol);
    }
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
    return `
    ${this.symbol} = ${this.valueU} V<br>
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
    const type = document.createTextNode('VoltageSource');
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
