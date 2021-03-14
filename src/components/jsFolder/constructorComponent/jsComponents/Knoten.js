import MultiPinComponent from "../MultiPinComponent";
export { valueLeftPinKnoten, valueTopPinKnoten };

/*
to obtain following value:
STEP1: in GUI create the comp and press ctrl + i
STEP2: put mouse over comp and read dimensions (in px)
condition for Multi-Pin-Komp:
no unnecessary padding
Knoten: Pin at bottom centered
*/
const dimensionLeftKnoten = 25;
const dimensionTopKnoten = 41.8;
const dimensionPinKnoten = 10.47;
//calculate with previous base value
const valueTopPinKnoten = dimensionTopKnoten - dimensionPinKnoten / 2; //36.565
const valueLeftPinKnoten = dimensionLeftKnoten / 2; //12.5

export default class Knoten extends MultiPinComponent {
  static KNOTEN_TO_POTENTIAL = 0;

  constructor({
    symbol,
    valuePotentialSource,
    valueLeft = 0,
    valueTop = 0,
    pins = [{ x: 0, y: 0 }],
  }) {
    super("Knoten", symbol, pins, valueLeft, valueTop);

    this.valuePotentialSource = valuePotentialSource;

    this.valueI = undefined;
    this.directionI = this.KNOTEN_TO_POTENTIAL; //start (Knoten) to end (Potential)
    this.valueU = 0;
    this.directionU = this.directionI;
    this.showPotential = false;
  }
  recalculatePins() {
    let [pinx, piny] = this.pins;
    pinx = this.x + valueLeftPinKnoten;
    piny = this.y + valueTopPinKnoten;

    this.pins[0].x = pinx;
    this.pins[0].y = piny;
  }

  bauteilEqu(A, b, listModel, nb, rowCounter) {
    //1*U=0
    let indexU = this.addValueUinListModelANDgetIndex(listModel, nb);
    A[nb].set(rowCounter, indexU, 1); //-> 1*U
    b[nb].set(rowCounter, 0, 0); //-> equation equals 0
  }

  resetCalculatedValues() {
    this.valuePhi = undefined;
    this.valueI = undefined;
  }

  getString() {
    let txt = this.symbol + "<br>Potential_" + this.symbol;
    if (this.valuePotentialSource !== undefined) {
      txt +=
        " = " +
        this.valuePotentialSource +
        " V<br>I_" +
        this.symbol +
        " = " +
        +this.valueI +
        " A<br>U_" +
        this.symbol +
        " =" +
        +this.valueU +
        " V";
      //après le += faire un template
    } else {
      txt += " = " + this.valuePhi + "V";
    }
    return txt;
  }
}
