import Knoten from '../components/jsFolder/constructorComponent/jsComponents/Knoten.js';
import Resistor from '../components/jsFolder/constructorComponent/jsComponents/Resistor.js';
import VoltageSource from '../components/jsFolder/constructorComponent/jsComponents/VoltageSource.js';

import Circuit from '../components/jsFolder/constructorComponent/Circuit.js';

import { unitTest } from './test-utils.js';
import ConsistentMatrixInfiniteError from '../CustomError/consistentMatrixInfiniteError.js';

/*
Rand2VS.m:
         ^  --------w1--
          \ |          |
    -w4----k1--w5--    |
    |             |    |
    U1            U2   R1
    |             |    |
    --w3---k2--w6--    |
           |           |
           -------w2----
*/

test('Rand2VS: Resistor and 2 Voltage sources', () => {
  let R1 = new Resistor({ symbol: 'R1' });
  R1.valueR = 50;
  let U1 = new VoltageSource({ symbol: 'U1' });
  U1.valueU = 5;
  let U2 = new VoltageSource({ symbol: 'U2' });
  U2.valueU = 5;
  let k1 = new Knoten({ symbol: 'k1', valuePotentialSource: '0' }); //12V
  let k2 = new Knoten({ symbol: 'k2' });

  let arrayComponents = [R1, U1, U2, k1, k2];
  let original = new Circuit(arrayComponents, []);

  original.createOneWire(k1, 0, R1, 0);
  original.createOneWire(R1, 1, k2, 0);
  original.createOneWire(k2, 0, U1, 1);
  original.createOneWire(U1, 0, k1, 0);
  original.createOneWire(k1, 0, U2, 0);
  original.createOneWire(U2, 1, k2, 0);

  console.log('circuit original created');

  let solutionArray = [];

  expect(() => unitTest(original, solutionArray)).toThrow(
    ConsistentMatrixInfiniteError
  );
});
