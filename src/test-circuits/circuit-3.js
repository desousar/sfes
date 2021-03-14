/* eslint-disable no-unused-vars */
import CurrentSource from "../components/jsFolder/constructorComponent/jsComponents/CurrentSource.js";
import Knoten from "../components/jsFolder/constructorComponent/jsComponents/Knoten.js";
import Klemme from "../components/jsFolder/constructorComponent/jsComponents/Klemme.js";
import Resistor from "../components/jsFolder/constructorComponent/jsComponents/Resistor.js";
import VoltageSource from "../components/jsFolder/constructorComponent/jsComponents/VoltageSource.js";

import Circuit from "../components/jsFolder/constructorComponent/Circuit.js";
import Wire from "../components/jsFolder/constructorComponent/Wire.js";
import CircuitSolver from "../components/jsFolder/constructorComponent/CircuitSolver.js";

/*
    ------R1-------                          ----rB1----
    |             |                          |         |
    w7            w1                        wB1       wB2
    |             |                          |         |
    ----R4---w6---k2--w9--R6--w10--kl1       ----rB2----
*/

let r1 = new Resistor({ symbol: "R1" }); // 100 Ohm
r1.valueR = 100;
let r4 = new Resistor({ symbol: "R4" });
r4.valueR = 180;
let r6 = new Resistor({ symbol: "R6" });
r6.valueR = 270;

let rB1 = new Resistor({ symbol: "rB1" });
rB1.valueR = 40;
let rB2 = new Resistor({ symbol: "rB2" });
rB2.valueR = 40;

let k2 = new Knoten({ symbol: "k2", valuePotentialSource: "12" }); //12V
let kl1 = new Klemme({ symbol: "kl1" });

let w1 = new Wire({
  from: r1.pins[1],
  to: k2.pins[0],
});
let w6 = new Wire({
  from: k2.pins[0],
  to: r4.pins[1],
});
let w7 = new Wire({
  from: r4.pins[0],
  to: r1.pins[0],
});
let w9 = new Wire({
  from: k2.pins[0],
  to: r6.pins[0],
});
let w10 = new Wire({
  from: r6.pins[1],
  to: kl1.pins[0],
});

let wB1 = new Wire({
  from: rB2.pins[1],
  to: rB1.pins[0],
});

let wB2 = new Wire({
  from: rB1.pins[1],
  to: rB2.pins[0],
});

let arrayComponents = [r1, r4, r6, rB1, rB2, k2, kl1];

let arrayWires = [w1, w6, w7, w9, w10, wB1, wB2];

let original = new Circuit(arrayComponents, arrayWires);
console.log("circuit original created");

let solver = new CircuitSolver();

try {
  var projection = solver.solve(original);
} catch (e) {
  console.log("*****ERROR*****", e.message);
}
