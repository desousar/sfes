import { expect, test } from 'vitest';

import Knoten from '@/components/jsFolder/constructorComponent/jsComponents/Knoten.js';
import Klemme from '@/components/jsFolder/constructorComponent/jsComponents/Klemme.js';
import Resistor from '@/components/jsFolder/constructorComponent/jsComponents/Resistor.js';
import VoltageSource from '@/components/jsFolder/constructorComponent/jsComponents/VoltageSource.js';

import Circuit from '@/components/CircuitClass/Circuit.js';

import { unitTest } from '@/test-circuits/test-utils.js';

/*
    ------R1-------                          ----rB1----
    |             |                          |         |
    w7            w1                        wB1       wB2
    |             |                          |         |
    ----R4---w6---k2--w9--R6--w10--kl1       ----U1-----
*/

test('2 circuits', () => {
  let r1 = new Resistor({ symbol: 'R1' }); // 100 Ohm
  r1.valueR = 100;
  let r4 = new Resistor({ symbol: 'R4' });
  r4.valueR = 180;
  let r6 = new Resistor({ symbol: 'R6' });
  r6.valueR = 270;

  let rB1 = new Resistor({ symbol: 'rB1' });
  rB1.valueR = 40;
  let U1 = new VoltageSource({ symbol: 'U1' });
  U1.valueU = 5;

  let k2 = new Knoten({ symbol: 'k2', valuePotentialSource: '12' }); //12V
  let kl1 = new Klemme({ symbol: 'kl1' });

  let arrayComponents = [r1, r4, r6, rB1, U1, k2, kl1];
  let original = new Circuit(arrayComponents, []);

  original.createOneWire(r1, 1, k2, 0);
  original.createOneWire(k2, 0, r4, 1);
  original.createOneWire(r4, 0, r1, 0);
  original.createOneWire(k2, 0, r6, 0);
  original.createOneWire(r6, 1, kl1, 0);

  original.createOneWire(U1, 1, rB1, 0);
  original.createOneWire(rB1, 1, U1, 0);

  console.log('circuit original created');

  let solutionArray = [
    [0, 0, 0, 0, 0, 0, 0, 0, 12, 12, 12],
    [0, -0.125, 0.125, 0, 5, -5, 0, -5]
  ];
  const result = unitTest(original, solutionArray);
  expect(result).toBe(true);
});
