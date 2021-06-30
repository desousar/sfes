import Component from '../Component.js';

export default class Resistor extends Component {
  constructor({
    symbol,
    directionU = Component.PIN0_TO_PIN1,
    directionI = Component.PIN0_TO_PIN1,
    valueLeft = 0,
    valueTop = 0,
    pins = [
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ],
    valR
  }) {
    super({
      name: 'Resistor',
      symbol,
      pins,
      valueLeft,
      valueTop,
      directionU,
      directionI,
      valR
    });
  }

  assertMainValueStr() {
    if (this.valueR == undefined) {
      return 'missing resistance value on ' + this.symbol;
    } else {
      return undefined;
    }
  }

  /**
   * @param {matrix} A
   * @param {vector} b
   * @param {*} listModel
   * @param {number subschaltung} nb
   * @param {*} rowCounter
   */
  bauteilEqu(A, b, listModel, nb, rowCounter) {
    if (this.directionI === this.directionU) {
      //falls beide Pfeile in selben Richtung
      //1*U+(-R)*I=0
      let indexU = this.addValueUinListModelANDgetIndex(listModel, nb);
      A[nb].set(rowCounter, indexU, 1); //-> 1*U
      let indexI = this.addValueIinListModelANDgetIndex(listModel, nb);
      A[nb].set(rowCounter, indexI, -1 * this.valueR); //-> -R*I
      b[nb].set(rowCounter, 0, 0); //-> equation equals 0
    } else {
      //Pfeile in unterschiedliche Richtungen
      //1*U+R*I=0
      let indexU = this.addValueUinListModelANDgetIndex(listModel, nb);
      A[nb].set(rowCounter, indexU, 1); //-> 1*U
      let indexI = this.addValueIinListModelANDgetIndex(listModel, nb);
      A[nb].set(rowCounter, indexI, 1 * this.valueR); //-> R*I
      b[nb].set(rowCounter, 0, 0); //-> equation equals 0
    }
  }

  resetCalculatedValues() {
    this.valueU = undefined;
    this.valueI = undefined;
    this.potentialPin0 = undefined;
    this.potentialPin1 = undefined;
  }

  //Tooltip
  getString() {
    return `
    ${this.symbol} = ${this.valueR} &#8486<br>
    U_${this.symbol} = ${this.valueU} V<br>
    I_${this.symbol} = ${this.valueI} A
    `;
  }

  getExportString() {
    let data =
      this.symbol +
      '(' +
      this.name +
      ')\n\tresistor: ' +
      this.valueR +
      ' Ω\n\tvoltage: ' +
      this.valueU +
      ' V\n\tcurrent: ' +
      this.valueI +
      ' A';
    return data;
  }

  //Pop Up Result
  getPopupResultRow(table) {
    let tr = document.createElement('tr');
    /**
     * left column
     */
    const tdg = document.createElement('td');
    tdg.style.backgroundColor = '#ffffff';
    tdg.className = 'td';
    tdg.rowSpan = 4;
    const textg = document.createTextNode(this.symbol);
    const breakLine = document.createElement('br');
    const type = document.createTextNode('Resistor');
    tdg.appendChild(textg);
    tdg.appendChild(breakLine);
    tdg.appendChild(type);
    tr.appendChild(tdg);
    /**
     * right column
     */
    /*first line*/
    let tdvalueR = this.createElementTDvalueR();
    tr.appendChild(tdvalueR);
    table.appendChild(tr);

    /*other line valueU*/
    let tr2 = document.createElement('tr');
    let tdvalueU = this.createElementTDvalueU(true);
    tr2.appendChild(tdvalueU);
    table.appendChild(tr2);

    /*other line valueI*/
    let tr3 = document.createElement('tr');
    let tdvalueI = this.createElementTDvalueI(true);
    tr3.appendChild(tdvalueI);
    table.appendChild(tr3);

    /*other line valuePotentials*/
    let tr4 = document.createElement('tr');
    let tdvaluePotentials = this.createElementTDvaluePotentials();
    tr4.appendChild(tdvaluePotentials);
    table.appendChild(tr4);
  }
}
