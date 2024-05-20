import CurrentSource from '@/components/jsFolder/constructorComponent/jsComponents/CurrentSource.js';
import Knoten from '@/components/jsFolder/constructorComponent/jsComponents/Knoten.js';
import Klemme from '@/components/jsFolder/constructorComponent/jsComponents/Klemme.js';
import Resistor from '@/components/jsFolder/constructorComponent/jsComponents/Resistor.js';
import VoltageSource from '@/components/jsFolder/constructorComponent/jsComponents/VoltageSource.js';

import Circuit from '@/components/CircuitClass/Circuit.js';

import { unitTest } from '@/test-circuits/test-utils.js';

/*
   -----------------I1-------w2-------------------------k6---w4--I2--w5--
   |                                                    |               |
   w1                                                   w3              |
   |                                                    |               |
   k1--w13--R2--w12--k2--w11--kl1--w10---k4--w9--R5--w8--k7--w7--U1--w6--k8
   |                 |                  |                               |
   R1                R3                 R4                              w23
   |                 |                  |                               |
   w15---------------k3--w18--kl2--w19--k5----------w22--------------R6--
*/

test('complet big circuit', () => {
  let r1 = new Resistor({ symbol: 'R1' }); // 100 Ohm
  r1.valueR = 100;
  let r2 = new Resistor({ symbol: 'R2' });
  r2.valueR = 50;
  let r3 = new Resistor({ symbol: 'R3' });
  r3.valueR = 120;
  let r4 = new Resistor({ symbol: 'R4' });
  r4.valueR = 180;
  let r5 = new Resistor({ symbol: 'R5' });
  r5.valueR = 40;
  let r6 = new Resistor({ symbol: 'R6' });
  r6.valueR = 60;
  let u1 = new VoltageSource({ symbol: 'U1' }); //200 Volt
  u1.valueU = 200;
  let i1 = new CurrentSource({ symbol: 'I1' }); // 5 Amper
  i1.valueI = 5;
  let i2 = new CurrentSource({ symbol: 'I2' });
  i2.valueI = 5;

  let k1 = new Knoten({ symbol: 'k1' });
  let k2 = new Knoten({ symbol: 'k2' });
  let k3 = new Knoten({ symbol: 'k3' });
  let k4 = new Knoten({ symbol: 'k4' });
  let k5 = new Knoten({ symbol: 'k5' });
  let k6 = new Knoten({ symbol: 'k6' });
  let k7 = new Knoten({ symbol: 'k7' });
  let k8 = new Knoten({ symbol: 'k8', valuePotentialSource: 12 });
  let kl1 = new Klemme({ symbol: 'kl1' });
  let kl2 = new Klemme({ symbol: 'kl2' });

  let arrayComponents = [
    r1,
    r2,
    r3,
    r4,
    r5,
    r6,
    u1,
    i1,
    i2,
    k1,
    k2,
    k3,
    k4,
    k5,
    k6,
    k7,
    k8,
    kl1,
    kl2
  ];
  let original = new Circuit(arrayComponents, []);

  original.createOneWire(k1, 0, i1, 0);
  original.createOneWire(i1, 1, k6, 0);
  original.createOneWire(k6, 0, k7, 0);
  original.createOneWire(k6, 0, i2, 1);
  original.createOneWire(i2, 0, k8, 0);
  original.createOneWire(k8, 0, u1, 1);
  original.createOneWire(u1, 0, k7, 0);
  original.createOneWire(k7, 0, r5, 1);
  original.createOneWire(r5, 0, k4, 0);
  original.createOneWire(kl1, 0, k4, 0);
  original.createOneWire(k2, 0, kl1, 0);
  original.createOneWire(k2, 0, r2, 1);
  original.createOneWire(r2, 0, k1, 0);
  original.createOneWire(k1, 0, r1, 0);
  original.createOneWire(r1, 1, k3, 0);
  original.createOneWire(k3, 0, r3, 1);
  original.createOneWire(r3, 0, k2, 0);
  original.createOneWire(k3, 0, kl2, 0);
  original.createOneWire(kl2, 0, k5, 0);
  original.createOneWire(k5, 0, r4, 1);
  original.createOneWire(r4, 0, k4, 0);
  original.createOneWire(k5, 0, r6, 1);
  original.createOneWire(r6, 0, k8, 0);

  console.log('circuit original created');

  let solutionArray = [
    [
      -151.030303, 33.818182, -20.727273, 33.818182, -20.727273, 212, 212, 12,
      33.818182, -20.727273, -130.30303, -184.848485, 54.545455, 54.545455,
      -178.181818, 32.727273, 363.030303, 200, 200, 0, 0, 0, 0, 0, 0, -1.30303,
      -3.69697, 0.454545, 0.30303, -4.454545, 0.545455, 5, 5, -5.545455, 0,
      -4.151515, -4.151515, -0.848485, -0.848485, 10
    ]
  ];

  const result = unitTest(original, solutionArray);
  expect(result).toBe(true);
});
