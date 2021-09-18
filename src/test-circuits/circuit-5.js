/* eslint-disable no-unused-vars */
import CurrentSource from '../components/jsFolder/constructorComponent/jsComponents/CurrentSource.js';
import Knoten from '../components/jsFolder/constructorComponent/jsComponents/Knoten.js';
import Klemme from '../components/jsFolder/constructorComponent/jsComponents/Klemme.js';
import Resistor from '../components/jsFolder/constructorComponent/jsComponents/Resistor.js';
import VoltageSource from '../components/jsFolder/constructorComponent/jsComponents/VoltageSource.js';

import Circuit from '../components/jsFolder/constructorComponent/Circuit.js';
import Wire from '../components/jsFolder/constructorComponent/Wire.js';
import CircuitSolver from '../components/jsFolder/constructorComponent/CircuitSolver.js';

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

let R1 = new Resistor({ symbol: 'R1' });
R1.valueR = 50;
let U1 = new VoltageSource({ symbol: 'U1' });
U1.valueU = 5;
let U2 = new VoltageSource({ symbol: 'U2' });
U2.valueU = 5;
let k1 = new Knoten({ symbol: 'k1', valuePotentialSource: '0' }); //12V
let k2 = new Knoten({ symbol: 'k2' });

let w1 = new Wire({
  from: k1.pins[0],
  to: R1.pins[0]
});

let w2 = new Wire({
  from: R1.pins[1],
  to: k2.pins[0]
});

let w3 = new Wire({
  from: k2.pins[0],
  to: U1.pins[1]
});
let w4 = new Wire({
  from: U1.pins[0],
  to: k1.pins[0]
});
let w5 = new Wire({
  from: k1.pins[0],
  to: U2.pins[0]
});
let w6 = new Wire({
  from: U2.pins[1],
  to: k2.pins[0]
});

let arrayComponents = [R1, U1, U2, k1, k2];

let arrayWires = [w1, w2, w3, w4, w5, w6];

let original = new Circuit(arrayComponents, arrayWires);
console.log('circuit original created');

let solver = new CircuitSolver();

try {
  var projection = solver.solve(original);
  unitTest();
} catch (e) {
  console.log('*****ERROR*****', e.message);
}

//unit test => array with solution
function unitTest() {
  let solutionArray = 'undefined';
  if (projection == solutionArray) {
    throw new Error('unit test Solution failed');
  } else {
    return console.log('unit test successfull');
  }
}
