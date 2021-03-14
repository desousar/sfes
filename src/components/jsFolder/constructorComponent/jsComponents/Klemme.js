import MultiPinComponent from "../MultiPinComponent";
export { valueTopLeftPinKlemme };

/*
to obtain following value:
STEP1: in GUI create the comp and press ctrl + i
STEP2: put mouse over comp and read dimensions (in px)
condition for Multi-Pin-Komp:
no unnecessary padding
Klemme centered
*/
const dimensionLeftTopKlemme = 11.29;
//calculate with previous base value
const valueTopLeftPinKlemme = dimensionLeftTopKlemme / 2; //5.645

export default class Klemme extends MultiPinComponent {
  constructor({
    symbol,
    valueLeft = 0,
    valueTop = 0,
    pins = [{ x: 0, y: 0 }],
  }) {
    super("Klemme", symbol, pins, valueLeft, valueTop);
  }
  recalculatePins() {
    let [pinx, piny] = this.pins;
    pinx = this.x + valueTopLeftPinKlemme;
    piny = this.y + valueTopLeftPinKlemme;

    this.pins[0].x = pinx;
    this.pins[0].y = piny;
  }

  resetCalculatedValues() {
    this.valuePhi = undefined;
  }

  getString() {
    let txt = this.symbol;
    return txt;
  }
}
