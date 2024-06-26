import Component from '@/components/jsFolder/constructorComponent/Component.js';

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
    this.valueP = this.valueU * dU * this.valueI * dI;
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
    if (this.valueP) {
      return `
    ${this.symbol} = ${this.valueR} &#8486<br>
    U_${this.symbol} = ${this.valueU} V<br>
    I_${this.symbol} = ${this.valueI} A<br>
    P_${this.symbol} = ${this.valueP} W<br>
    consumed power
    `;
    } else {
      return `
    ${this.symbol} = ${this.valueR} &#8486<br>
    U_${this.symbol} = ${this.valueU} V<br>
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
      ')\n\tresistor: ' +
      this.valueR +
      ' Ω\n\tvoltage: ' +
      this.valueU +
      ' V\n\tcurrent: ' +
      this.valueI +
      ' A\n\tpower: ' +
      this.valueP +
      ' W (consume power)';
    return data;
  }

  selection() {
    this.selected = !this.selected;
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
    tdg.rowSpan = 5;
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

    /*other line power valueP*/
    let tr5 = document.createElement('tr');
    let tdvaluePower = this.createElementTDvaluePower();
    tr5.appendChild(tdvaluePower);
    table.appendChild(tr5);
  }

  createElementTDvaluePower() {
    let td = document.createElement('td');
    td.className = 'td';
    td.innerHTML = 'P = ' + this.valueP + ' W (consumed power)';
    td.style.backgroundColor = '#ddd';
    return td;
  }
}
