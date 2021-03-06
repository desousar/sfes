export { dropComp, resetNbFromComp };

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
let nbKn = 0;
let nbKl = 0;
let nbR = 0;
let nbCs = 0;
let nbVs = 0;
let nbAM = 0;
let nbVM = 0;
const valLeftPin0KompRot0 = valueLeftPin0KompRot0 - centerX2PinsComp;
const valTopPin0KompRot0 = valueTopPin0KompRot0 - centerY2PinsComp;
const valLeftPin1KompRot0 = valueLeftPin1KompRot0 - centerX2PinsComp;
const valTopPin1KompRot0 = valueTopPin1KompRot0 - centerY2PinsComp;

const resetNbFromComp = () => {
  nb = 0;
  nbKn = 0;
  nbKl = 0;
  nbR = 0;
  nbCs = 0;
  nbVs = 0;
  nbAM = 0;
  nbVM = 0;
};

const dropComp = ({ withPresValue, c_id, valueLeft, valueTop }) => {
  if (c_id === 'Knoten') {
    const comp = new KnotenJS({
      symbol: 'kn' + nbKn,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft,
          y: valueTop
        }
      ]
    });
    nbKn = nbKn + 1;
    return comp;
  } else if (c_id === 'Klemme') {
    const comp = new KlemmeJS({
      symbol: 'kl' + nbKl,
      valueLeft: valueLeft,
      valueTop: valueTop,
      pins: [
        {
          x: valueLeft,
          y: valueTop
        }
      ]
    });
    nbKl = nbKl + 1;
    return comp;
  } else if (c_id === 'Resistor') {
    const comp = new ResistorJS({
      symbol: 'R' + nbR,
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
    nbR = nbR + 1;
    return comp;
  } else if (c_id === 'VoltageSource') {
    const comp = new VoltageSourceJS({
      symbol: 'U' + nbVs,
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
    nbVs = nbVs + 1;
    return comp;
  } else if (c_id === 'CurrentSource') {
    const comp = new CurrentSourceJS({
      symbol: 'I' + nbCs,
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
    nbCs = nbCs + 1;
    return comp;
  } else if (c_id === 'Ampermeter') {
    const comp = new AmpermeterJS({
      symbol: 'AM' + nbAM,
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
    nbAM = nbAM + 1;
    return comp;
  } else if (c_id === 'Voltmeter') {
    const comp = new VoltmeterJS({
      symbol: 'VM' + nbVM,
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
    nbVM = nbVM + 1;
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
