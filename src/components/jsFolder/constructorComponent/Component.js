import BaseComponent from './BaseComponent.js';
export {
  valueLeftPin0KompRot0,
  valueTopPin0KompRot0,
  valueLeftPin1KompRot0,
  valueTopPin1KompRot0,
  valueLeftPin0KompRot90,
  valueTopPin0KompRot90,
  valueLeftPin1KompRot90,
  valueTopPin1KompRot90,
  centerX2PinsComp,
  centerY2PinsComp
};

/*
to obtain following value:
STEP1: in GUI create the comp and press ctrl + shift + i
STEP2: put mouse over comp with selected inspect tool and read dimensions (in px)
condition for 2-Pins-Komp:
width comp = total width (pin touches horizontal boundaries)
comp vertically in the middle of the total height
=> comp centered AND all 2-Pins-Komp have same dimension !
*/

const dimensionLeft2PinsKomp = 100; //width
const dimensionTop2PinsKomp = 63.33; //height
const dimensionPin2PinsKomp = 5.07;
//calculate with previous base value
const centerX2PinsComp = dimensionLeft2PinsKomp / 2;
const centerY2PinsComp = dimensionTop2PinsKomp / 2;

const valueLeftPin0KompRot0 = dimensionPin2PinsKomp;
const valueTopPin0KompRot0 = dimensionTop2PinsKomp / 2;
const valueLeftPin1KompRot0 = dimensionLeft2PinsKomp - dimensionPin2PinsKomp;
const valueTopPin1KompRot0 = dimensionTop2PinsKomp / 2;
const valueLeftPin0KompRot90 = dimensionLeft2PinsKomp / 2;
const valueTopPin0KompRot90 = -(
  (dimensionLeft2PinsKomp - dimensionTop2PinsKomp) / 2 -
  dimensionPin2PinsKomp
);
const valueLeftPin1KompRot90 = dimensionLeft2PinsKomp / 2;
const valueTopPin1KompRot90 =
  dimensionTop2PinsKomp +
  (dimensionLeft2PinsKomp - dimensionTop2PinsKomp) / 2 -
  dimensionPin2PinsKomp;

export default class Component extends BaseComponent {
  static PIN0_TO_PIN1 = 0;
  static PIN1_TO_PIN0 = 1;

  constructor({
    name,
    symbol,
    pins,
    valueLeft,
    valueTop,
    directionU,
    directionI,
    valR,
    valU,
    valI
  }) {
    super(
      name,
      symbol,
      valueLeft - centerX2PinsComp,
      valueTop - centerY2PinsComp
    );
    this.pins = pins;
    this.rotation = 0;
    this.selected = false;

    this.isMultiPin = false;
    this.showPin1 = true;
    this.showPin2 = true;

    this.valueR = valR;
    this.valueU = valU;
    this.directionU = directionU;
    this.valueI = valI;
    this.directionI = directionI;

    this.potentialPin0 = undefined;
    this.potentialPin1 = undefined;

    this.showUdir0 = false;
    this.showUdir1 = false;
    this.showIdir0 = false;
    this.showIdir1 = false;
  }
  rotateRight() {
    this.rotation += 90;
    this.rotation %= 360;
    this.recalculatePins();
  }

  recalculatePins() {
    let [pin1x, pin2x, pin1y, pin2y] = this.pins;
    if (this.rotation === 0) {
      pin1x = this.x + valueLeftPin0KompRot0;
      pin1y = this.y + valueTopPin0KompRot0;
      pin2x = this.x + valueLeftPin1KompRot0;
      pin2y = this.y + valueTopPin1KompRot0;
    } else if (this.rotation === 90) {
      // TODO change here to adapt to 90°
      pin1x = this.x + valueLeftPin0KompRot90;
      pin1y = this.y + valueTopPin0KompRot90;
      pin2x = this.x + valueLeftPin1KompRot90;
      pin2y = this.y + valueTopPin1KompRot90;
    } else if (this.rotation === 180) {
      // TODO change here to adapt to 180°
      pin1x = this.x + valueLeftPin1KompRot0;
      pin1y = this.y + valueTopPin1KompRot0;
      pin2x = this.x + valueLeftPin0KompRot0;
      pin2y = this.y + valueTopPin0KompRot0;
    } else if (this.rotation === 270) {
      // TODO change here to adapt to 270°
      pin1x = this.x + valueLeftPin1KompRot90;
      pin1y = this.y + valueTopPin1KompRot90;
      pin2x = this.x + valueLeftPin0KompRot90;
      pin2y = this.y + valueTopPin0KompRot90;
    }

    if (this.selected) {
      pin1x += 1;
      pin1y += 1;
      pin2x += 1;
      pin2y += 1;
    }

    this.pins[0].x = pin1x;
    this.pins[0].y = pin1y;
    this.pins[1].x = pin2x;
    this.pins[1].y = pin2y;
    /*
      [0] = pin1
      [1] = pin2
      */
  }

  createElementTDvalueR() {
    let td = document.createElement('td');
    td.className = 'td';
    td.innerHTML = 'valueR ' + this.valueR + ' &#8486;';
    td.style.backgroundColor = '#ffffff';
    return td;
  }
  createElementTDvalueI(calculated) {
    let td = document.createElement('td');
    td.className = 'td';
    td.innerHTML = 'valueI ' + this.valueI + ' A';
    if (calculated) {
      td.style.backgroundColor = '#ddd';
    } else {
      td.style.backgroundColor = '#ffffff';
    }
    return td;
  }
  createElementTDvalueU(calculated) {
    let td = document.createElement('td');
    td.className = 'td';
    td.innerHTML = 'valueU ' + this.valueU + ' V';
    if (calculated) {
      td.style.backgroundColor = '#ddd';
    } else {
      td.style.backgroundColor = '#ffffff';
    }
    return td;
  }
  createElementTDvaluePotentials() {
    // check this.directionU 0:right 1:left
    let td = document.createElement('td');
    td.className = 'td';
    if (this.directionU === 0) {
      td.innerHTML =
        'Potential ' +
        this.potentialPin0 +
        " <span class='mdi mdi-arrow-right'></span> " +
        this.potentialPin1;
    }
    if (this.directionU === 1) {
      td.innerHTML =
        'Potential ' +
        this.potentialPin0 +
        " <span class='mdi mdi-arrow-left'></span> " +
        this.potentialPin1;
    }
    td.style.backgroundColor = '#ddd';
    return td;
  }
}
