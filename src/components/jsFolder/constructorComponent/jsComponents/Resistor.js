import Component from "../Component.js";

export default class Resistor extends Component {
  constructor({
    symbol,
    directionU = Component.PIN0_TO_PIN1,
    directionI = Component.PIN0_TO_PIN1,
    valueLeft = 0,
    valueTop = 0,
    pins = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
  }) {
    super(
      "Resistor",
      symbol,
      pins,
      valueLeft,
      valueTop,
      directionU,
      directionI
    );
  }

  assertMainValue() {
    if (this.valueR == undefined) {
      throw new Error("missing resistance value on " + this.symbol);
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
    ${this.symbol} = ${this.valueR} &#8486 <br>
I_${this.symbol} = ${this.valueI} A <br>
U_${this.symbol} = ${this.valueU} V
    `;
    /*let txt =
      this.symbol +
      " = " +
      this.valueR +
      " &#8486;<br>I_" +
      this.symbol +
      " = " +
      this.valueI +
      " A<br>U_" +
      this.symbol +
      " = " +
      this.valueU +
      " V";
    return txt;*/
  }

  //Pop Up Result
  getPopupResultRow(table) {
    let tr = document.createElement("tr");
    /**
     * left column
     */
    var tdg = document.createElement("td");
    tdg.className = "td";
    tdg.rowSpan = 4;
    var textg = document.createTextNode(this.symbol);
    tdg.appendChild(textg);
    tr.appendChild(tdg);
    /**
     * right column
     */
    /*first line*/
    let tdvalueR = this.createElementTDvalueR();
    tr.appendChild(tdvalueR);
    table.appendChild(tr);

    /*other line valueI*/
    let tr2 = document.createElement("tr");
    let tdvalueI = this.createElementTDvalueI();
    tr2.appendChild(tdvalueI);
    table.appendChild(tr2);

    /*other line valueU*/
    let tr3 = document.createElement("tr");
    let tdvalueU = this.createElementTDvalueU();
    tr3.appendChild(tdvalueU);
    table.appendChild(tr3);

    /*other line valuePotentials*/
    let tr4 = document.createElement("tr");
    let tdvaluePotentials = this.createElementTDvaluePotentials();
    tr4.appendChild(tdvaluePotentials);
    table.appendChild(tr4);
  }
}
