import CurrentSource from "../components/jsFolder/constructorComponent/jsComponents/CurrentSource.js";
import Knoten from "../components/jsFolder/constructorComponent/jsComponents/Knoten.js";
import Klemme from "../components/jsFolder/constructorComponent/jsComponents/Klemme.js";
import Resistor from "../components/jsFolder/constructorComponent/jsComponents/Resistor.js";
import VoltageSource from "../components/jsFolder/constructorComponent/jsComponents/VoltageSource.js";

import Circuit from "../components/jsFolder/constructorComponent/Circuit.js";
import Wire from "../components/jsFolder/constructorComponent/Wire.js";
import CircuitSolver from "../components/jsFolder/constructorComponent/CircuitSolver.js";

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

let r1 = new Resistor({ symbol: "R1" }); // 100 Ohm
r1.valueR = 100;
let r2 = new Resistor({ symbol: "R2" });
r2.valueR = 50;
let r3 = new Resistor({ symbol: "R3" });
r3.valueR = 120;
let r4 = new Resistor({ symbol: "R4" });
r4.valueR = 180;
let r5 = new Resistor({ symbol: "R5" });
r5.valueR = 40;
let r6 = new Resistor({ symbol: "R6" });
r6.valueR = 60;
let u1 = new VoltageSource({ symbol: "U1" }); //200 Volt
u1.valueU = 200;
let i1 = new CurrentSource({ symbol: "I1" }); // 5 Amper
i1.valueI = 5;
let i2 = new CurrentSource({ symbol: "I2" });
i2.valueI = 5;

let k1 = new Knoten({ symbol: "k1" });
let k2 = new Knoten({ symbol: "k2" });
let k3 = new Knoten({ symbol: "k3" });
let k4 = new Knoten({ symbol: "k4" });
let k5 = new Knoten({ symbol: "k5" });
let k6 = new Knoten({ symbol: "k6" });
let k7 = new Knoten({ symbol: "k7" });
let k8 = new Knoten({ symbol: "k8", valuePotentialSource: 12 });
let kl1 = new Klemme({ symbol: "kl1" });
let kl2 = new Klemme({ symbol: "kl2" });

let w1 = new Wire({
  from: k1.pins[0] /*seul possibilité pour Knoten*/,
  to: i1.pins[0] /* ou i1.pins[1] */,
});
let w2 = new Wire({
  from: i1.pins[1],
  to: k6.pins[0],
});
let w3 = new Wire({
  from: k6.pins[0],
  to: k7.pins[0],
});
let w4 = new Wire({
  from: k6.pins[0],
  to: i2.pins[1],
});
let w5 = new Wire({
  from: i2.pins[0],
  to: k8.pins[0],
});
let w6 = new Wire({
  from: k8.pins[0],
  to: u1.pins[1],
});
let w7 = new Wire({
  from: u1.pins[0],
  to: k7.pins[0],
});
let w8 = new Wire({
  from: k7.pins[0],
  to: r5.pins[1],
});
let w9 = new Wire({
  from: r5.pins[0],
  to: k4.pins[0],
});
let w10 = new Wire({
  from: kl1.pins[0],
  to: k4.pins[0],
});
let w11 = new Wire({
  from: k2.pins[0],
  to: kl1.pins[0],
});
let w12 = new Wire({
  from: k2.pins[0],
  to: r2.pins[1],
});
let w13 = new Wire({
  from: r2.pins[0],
  to: k1.pins[0],
});
let w14 = new Wire({
  from: k1.pins[0],
  to: r1.pins[0],
});
let w15 = new Wire({
  from: r1.pins[1],
  to: k3.pins[0],
});
let w16 = new Wire({
  from: k3.pins[0],
  to: r3.pins[1],
});
let w17 = new Wire({
  from: r3.pins[0],
  to: k2.pins[0],
});
let w18 = new Wire({
  from: k3.pins[0],
  to: kl2.pins[0],
});
let w19 = new Wire({
  from: kl2.pins[0],
  to: k5.pins[0],
});
let w20 = new Wire({
  from: k5.pins[0],
  to: r4.pins[1],
});
let w21 = new Wire({
  from: r4.pins[0],
  to: k4.pins[0],
});
let w22 = new Wire({
  from: k5.pins[0],
  to: r6.pins[1],
});
let w23 = new Wire({
  from: r6.pins[0],
  to: k8.pins[0],
});

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
  kl2,
];

let arrayWires = [
  w1,
  w2,
  w3,
  w4,
  w5,
  w6,
  w7,
  w8,
  w9,
  w10,
  w11,
  w12,
  w13,
  w14,
  w15,
  w16,
  w17,
  w18,
  w19,
  w20,
  w21,
  w22,
  w23,
];

let original = new Circuit(arrayComponents, arrayWires);
console.log("circuit original created");

let solver = new CircuitSolver();

try {
  var projection = solver.solve(original);
  unitTest();
} catch (e) {
  console.log("*****ERROR*****", e.message);
}

//unit test => array with solution
function unitTest() {
  let solutionArray = [
    -151.030303,
    33.818182,
    -20.727273,
    33.818182,
    -20.727273,
    212,
    212,
    12,
    33.818182,
    -20.727273,
    -130.30303,
    -184.848485,
    54.545455,
    54.545455,
    -178.181818,
    32.727273,
    363.030303,
    200,
    200,
    0,
    0,
    0,
    0,
    0,
    0,
    -1.30303,
    -3.69697,
    0.454545,
    0.30303,
    -4.454545,
    0.545455,
    5,
    5,
    -5.545455,
    0,
    -4.151515,
    -4.151515,
    -0.848485,
    -0.848485,
    10,
  ];
  for (let i = 0; i < projection.listOfSubCircuit.length; i++) {
    projection.result[i].mtx.forEach((comp) => {
      let tempIndex = myIndexOf(comp[i], solutionArray);
      if (tempIndex === -1) {
        throw new Error("unit test Solution failed");
      } else {
        solutionArray.splice(tempIndex, 1);
      }
    });
  }
  if (solutionArray.length === 0) {
    return console.log("unit test successfull");
  }
}

function myIndexOf(o, solutionArray) {
  for (var i = 0; i < solutionArray.length; i++) {
    if (solutionArray[i] == o) {
      return i;
    }
  }
  return -1;
}

/*
npm install esm

cd sfes\src\test-circuits
node -r esm circuit-1.js

In Default Shell = bash
node -r esm circuit-3.js > debug.txt
*/
