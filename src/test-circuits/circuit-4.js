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
RandVS.m:
           ^
           |
    -w3----k1--w1--   
    |             |   
    U1            R1  
    |             |   
    -------w2------   
*/

let R1 = new Resistor({ symbol: "R1" });
R1.valueR = 50;
R1.valueU = 5; //can give non-main value too (here valueU for a Resistor)
let U1 = new VoltageSource({ symbol: "U1" });
U1.valueU = 5;
let k1 = new Knoten({ symbol: "k1", valuePotentialSource: "10" }); //12V

let w1 = new Wire({
  from: k1.pins[0],
  to: R1.pins[0],
});

let w2 = new Wire({
  from: R1.pins[1],
  to: U1.pins[1],
});

let w3 = new Wire({
  from: U1.pins[0],
  to: k1.pins[0],
});

let arrayComponents = [R1, U1, k1];

let arrayWires = [w1, w2, w3];

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
  let solutionArray = [10, 5, 5, 5, 0, 0.1, 0.1, 0];
  for (let i = 0; i < projection.listOfSubCircuit.length; i++) {
    projection.result[i].mtx.forEach((comp) => {
      //console.log("current", comp[i], "in", solutionArray);
      let tempIndex = myIndexOf(comp[i], solutionArray);
      //console.log(tempIndex);
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
