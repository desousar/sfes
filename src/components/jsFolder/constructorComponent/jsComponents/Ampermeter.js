import Component from "../Component.js";

export default class Ampermeter extends Component {
  constructor({
    symbol,
    valueU = 0,
    directionU = Component.PIN1_TO_PIN0,
    directionI = Component.PIN0_TO_PIN1,
    valueLeft = 0,
    valueTop = 0,
    pins = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
  }) {
    super(
      "Ampermeter",
      symbol,
      pins,
      valueLeft,
      valueTop,
      directionU,
      directionI
    );
    this.valueU = valueU;
  }

  assertMainValue() {
    if (this.valueU == undefined) {
      throw new Error("missing voltage value on " + this.symbol);
    }
  }

  bauteilEqu(A, b, listModel, nb, rowCounter) {
    //1*U=value of src
    let indexI = this.addValueUinListModelANDgetIndex(listModel, nb);
    A[nb].set(rowCounter, indexI, 1); //-> 1*U
    b[nb].set(rowCounter, 0, this.valueU); //-> value of src
  }

  resetCalculatedValues() {
    this.valueR = undefined;
    this.valueI = undefined;
    this.potentialPin0 = undefined;
    this.potentialPin1 = undefined;
  }

  getString() {
    let txt =
      "I_" +
      this.symbol +
      " = " +
      this.valueI +
      " A<br>U_" +
      this.symbol +
      " = " +
      this.valueU +
      " V";
    return txt;
  }

  getPopupResultRow(table) {
    let tr = document.createElement("tr");
    /**
     * left column
     */
    var tdg = document.createElement("td");
    tdg.className = "td";
    tdg.rowSpan = 1;
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
  }
}
