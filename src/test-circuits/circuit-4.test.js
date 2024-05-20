import Knoten from '@/components/jsFolder/constructorComponent/jsComponents/Knoten.js';
import Resistor from '@/components/jsFolder/constructorComponent/jsComponents/Resistor.js';
import VoltageSource from '@/components/jsFolder/constructorComponent/jsComponents/VoltageSource.js';

import Circuit from '@/components/CircuitClass/Circuit.js';

import { unitTest } from '@/test-circuits/test-utils.js';

/*
RandVS.m:
           ^
           |
    -w3----k1--w1--   
    |             |   
    U1            R1  
    |             |   
    -------w2------   
*/

test('RandVS: Resistor and Voltage source', () => {
  let R1 = new Resistor({ symbol: 'R1' });
  R1.valueR = 50;
  let U1 = new VoltageSource({ symbol: 'U1' });
  U1.valueU = 5;
  let k1 = new Knoten({ symbol: 'k1', valuePotentialSource: '10' }); //12V

  let arrayComponents = [R1, U1, k1];
  let original = new Circuit(arrayComponents, []);

  original.createOneWire(k1, 0, R1, 0);
  original.createOneWire(R1, 1, U1, 1);
  original.createOneWire(U1, 0, k1, 0);

  console.log('circuit original created');

  let solutionArray = [[10, 5, 5, 5, 0, 0.1, 0.1, 0]];

  const result = unitTest(original, solutionArray);
  expect(result).toBe(true);
});
