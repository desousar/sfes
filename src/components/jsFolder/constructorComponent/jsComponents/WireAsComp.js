import Component from "../Component.js";
import BaseComponent from "../BaseComponent.js";

export default class WireAsComp extends BaseComponent {
  constructor({
    symbol,
    valueU = 0,
    directionU = Component.PIN0_TO_PIN1,
    valueI,
    directionI = Component.PIN0_TO_PIN1,
    pins = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ],
    valueLeft = 0,
    valueTop = 0,
  }) {
    super("WireAsComp", symbol, valueLeft, valueTop);
    this.valueU = valueU;
    this.directionU = directionU;
    this.valueI = valueI;
    this.directionI = directionI;
    this.pins = pins;
  }

  bauteilEqu(A, b, listModel, nb, rowCounter) {
    //1*U=0
    let indexU = this.addValueUinListModelANDgetIndex(listModel, nb);
    A[nb].set(rowCounter, indexU, 1); //-> 1*U
    b[nb].set(rowCounter, 0, 0); //-> equation equals 0
  }
}
