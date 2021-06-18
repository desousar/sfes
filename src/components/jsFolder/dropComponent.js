export { dropComp };

import {
  valueLeftPin0KompRot0,
  valueTopPin0KompRot0,
  valueLeftPin1KompRot0,
  valueTopPin1KompRot0,
  centerX2PinsComp,
  centerY2PinsComp
} from './constructorComponent/Component.js';

import ComponentJS from './constructorComponent/Component.js';

import KnotenJS from './constructorComponent/jsComponents/Knoten.js';
import KlemmeJS from './constructorComponent/jsComponents/Klemme.js';
import ResistorJS from './constructorComponent/jsComponents/Resistor.js';
import CurrentSourceJS from './constructorComponent/jsComponents/CurrentSource.js';
import VoltageSourceJS from './constructorComponent/jsComponents/VoltageSource.js';
import AmpermeterJS from './constructorComponent/jsComponents/Ampermeter.js';
import VoltmeterJS from './constructorComponent/jsComponents/Voltmeter.js';

let nb = 0;
const valLeftPin0KompRot0 = valueLeftPin0KompRot0 - centerX2PinsComp;
const valTopPin0KompRot0 = valueTopPin0KompRot0 - centerY2PinsComp;
const valLeftPin1KompRot0 = valueLeftPin1KompRot0 - centerX2PinsComp;
const valTopPin1KompRot0 = valueTopPin1KompRot0 - centerY2PinsComp;

const dropComp = ({ withPresValue, c_id, valueLeft, valueTop }) => {
  if (c_id === 'Knoten') {
    const comp = new KnotenJS({
      symbol: 'kn' + nb,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft,
          y: valueTop
        }
      ]
    });
    nb = nb + 1;
    return comp;
  } else if (c_id === 'Klemme') {
    const comp = new KlemmeJS({
      symbol: 'kl' + nb,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft,
          y: valueTop
        }
      ]
    });
    nb = nb + 1;
    return comp;
  } else if (c_id === 'Resistor') {
    const comp = new ResistorJS({
      symbol: 'R' + nb,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft + valLeftPin0KompRot0,
          y: valueTop + valTopPin0KompRot0
        },
        {
          x: valueLeft + valLeftPin1KompRot0,
          y: valueTop + valTopPin1KompRot0
        }
      ],
      valR: withPresValue ? 1000 : undefined
    });
    nb = nb + 1;
    return comp;
  } else if (c_id === 'VoltageSource') {
    const comp = new VoltageSourceJS({
      symbol: 'U' + nb,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft + valLeftPin0KompRot0,
          y: valueTop + valTopPin0KompRot0
        },
        {
          x: valueLeft + valLeftPin1KompRot0,
          y: valueTop + valTopPin1KompRot0
        }
      ],
      valU: withPresValue ? 10 : undefined
    });
    nb = nb + 1;
    return comp;
  } else if (c_id === 'CurrentSource') {
    const comp = new CurrentSourceJS({
      symbol: 'I' + nb,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft + valLeftPin0KompRot0,
          y: valueTop + valTopPin0KompRot0
        },
        {
          x: valueLeft + valLeftPin1KompRot0,
          y: valueTop + valTopPin1KompRot0
        }
      ],
      valI: withPresValue ? 1 : undefined
    });
    nb = nb + 1;
    return comp;
  } else if (c_id === 'Ampermeter') {
    const comp = new AmpermeterJS({
      symbol: 'A' + nb,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft + valLeftPin0KompRot0,
          y: valueTop + valTopPin0KompRot0
        },
        {
          x: valueLeft + valLeftPin1KompRot0,
          y: valueTop + valTopPin1KompRot0
        }
      ]
    });
    nb = nb + 1;
    return comp;
  } else if (c_id === 'Voltmeter') {
    const comp = new VoltmeterJS({
      symbol: 'V' + nb,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft + valLeftPin0KompRot0,
          y: valueTop + valTopPin0KompRot0
        },
        {
          x: valueLeft + valLeftPin1KompRot0,
          y: valueTop + valTopPin1KompRot0
        }
      ]
    });
    nb = nb + 1;
    return comp;
  } else {
    const comp = new ComponentJS(c_id, nb, valueLeft, valueTop, [
      {
        x: valueLeft + valLeftPin0KompRot0,
        y: valueTop + valTopPin0KompRot0
      },
      {
        x: valueLeft + valLeftPin1KompRot0,
        y: valueTop + valTopPin1KompRot0
      }
    ]);
    nb = nb + 1;
    return comp;
  }
};
