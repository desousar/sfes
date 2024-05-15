import Component from '@/components/jsFolder/constructorComponent/Component.js';

export default class Inductor extends Component {
  constructor(
    symbolNumber,
    valueLeft,
    valueTop,
    showPin1,
    showPin2,
    rotation,
    selected,
    pins
  ) {
    super(
      'Inductor',
      symbolNumber,
      (valueLeft = valueLeft ? valueLeft : 0),
      (valueTop = valueTop ? valueTop : 0),
      (showPin1 = showPin1 ? showPin1 : true),
      (showPin2 = showPin2 ? showPin2 : true),
      (rotation = rotation ? rotation : 0),
      (selected = selected ? selected : false),
      (pins = pins
        ? pins
        : [
            { x: 0, y: 0 },
            { x: 0, y: 0 }
          ])
    );
  }
}
