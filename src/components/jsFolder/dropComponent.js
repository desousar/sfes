export { dropComp };

import {
  valueLeftPin0KompRot0,
  valueTopPin0KompRot0,
  valueLeftPin1KompRot0,
  valueTopPin1KompRot0
} from './constructorComponent/Component.js';
import { valueTopLeftPinKlemme } from './constructorComponent/jsComponents/Klemme.js';
import {
  valueTopPinKnoten,
  valueLeftPinKnoten
} from './constructorComponent/jsComponents/Knoten.js';

import ComponentJS from './constructorComponent/Component.js';

import KnotenJS from './constructorComponent/jsComponents/Knoten.js';
import KlemmeJS from './constructorComponent/jsComponents/Klemme.js';
import ResistorJS from './constructorComponent/jsComponents/Resistor.js';
import CurrentSourceJS from './constructorComponent/jsComponents/CurrentSource.js';
import VoltageSourceJS from './constructorComponent/jsComponents/VoltageSource.js';
import AmpermeterJS from './constructorComponent/jsComponents/Ampermeter.js';
import VoltmeterJS from './constructorComponent/jsComponents/Voltmeter.js';

const dropComp = ({
  withPresValue,
  c_id,
  valueLeft,
  valueTop,
  symbolNumber
}) => {
  const compID = c_id;
  switch (compID) {
    case 'Knoten':
      return new KnotenJS({
        symbol: 'kn' + symbolNumber,
        valueLeft: valueLeft,
        valueTop: valueTop,
        pins: [
          {
            x: valueLeft + valueLeftPinKnoten,
            y: valueTop + valueTopPinKnoten
          }
        ]
      });
    case 'Klemme':
      return new KlemmeJS({
        symbol: 'kl' + symbolNumber,
        valueLeft: valueLeft,
        valueTop: valueTop,
        pins: [
          {
            x: valueLeft + valueTopLeftPinKlemme,
            y: valueTop + valueTopLeftPinKlemme
          }
        ]
      });
    case 'Resistor':
      return new ResistorJS({
        symbol: 'R' + symbolNumber,
        valueLeft: valueLeft,
        valueTop: valueTop,
        pins: [
          {
            x: valueLeft + valueLeftPin0KompRot0,
            y: valueTop + valueTopPin0KompRot0
          },
          {
            x: valueLeft + valueLeftPin1KompRot0,
            y: valueTop + valueTopPin1KompRot0
          }
        ],
        valR: withPresValue ? 1000 : undefined
      });
    case 'VoltageSource':
      return new VoltageSourceJS({
        symbol: 'U' + symbolNumber,
        valueLeft: valueLeft,
        valueTop: valueTop,
        pins: [
          {
            x: valueLeft + valueLeftPin0KompRot0,
            y: valueTop + valueTopPin0KompRot0
          },
          {
            x: valueLeft + valueLeftPin1KompRot0,
            y: valueTop + valueTopPin1KompRot0
          }
        ],
        valU: withPresValue ? 10 : undefined
      });
    case 'CurrentSource':
      return new CurrentSourceJS({
        symbol: 'I' + symbolNumber,
        valueLeft: valueLeft,
        valueTop: valueTop,
        pins: [
          {
            x: valueLeft + valueLeftPin0KompRot0,
            y: valueTop + valueTopPin0KompRot0
          },
          {
            x: valueLeft + valueLeftPin1KompRot0,
            y: valueTop + valueTopPin1KompRot0
          }
        ],
        valI: withPresValue ? 1 : undefined
      });
    case 'Ampermeter':
      return new AmpermeterJS({
        symbol: 'A' + symbolNumber,
        valueLeft: valueLeft,
        valueTop: valueTop,
        pins: [
          {
            x: valueLeft + valueLeftPin0KompRot0,
            y: valueTop + valueTopPin0KompRot0
          },
          {
            x: valueLeft + valueLeftPin1KompRot0,
            y: valueTop + valueTopPin1KompRot0
          }
        ]
      });
    case 'Voltmeter':
      return new VoltmeterJS({
        symbol: 'V' + symbolNumber,
        valueLeft: valueLeft,
        valueTop: valueTop,
        pins: [
          {
            x: valueLeft + valueLeftPin0KompRot0,
            y: valueTop + valueTopPin0KompRot0
          },
          {
            x: valueLeft + valueLeftPin1KompRot0,
            y: valueTop + valueTopPin1KompRot0
          }
        ]
      });
    default:
      return new ComponentJS(c_id, symbolNumber, valueLeft, valueTop, [
        {
          x: valueLeft + valueLeftPin0KompRot0,
          y: valueTop + valueTopPin0KompRot0
        },
        {
          x: valueLeft + valueLeftPin1KompRot0,
          y: valueTop + valueTopPin1KompRot0
        }
      ]);
  }
};
