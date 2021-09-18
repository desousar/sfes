import InconsistentMatrixError from '../../../CustomError/inconsistentMatrixError.js';
import ConsistentMatrixInfiniteError from '../../../CustomError/consistentMatrixInfiniteError.js';
import Ampermeter from './jsComponents/Ampermeter.js';
import Wire from './Wire.js';
import Voltmeter from './jsComponents/Voltmeter.js';

import CurrentSource from './jsComponents/CurrentSource.js';
import Resistor from './jsComponents/Resistor.js';
import VoltageSource from './jsComponents/VoltageSource.js';

class CircuitSolver {
  constructor() {}

  solveWithAttribution(circuit) {
    // TODO solve the circuit and call method from Circuit.js
    const projection = circuit.project();

    this.checkAndSolveCircuit(projection);

    try {
      projection.attributionToOriginal(circuit);
    } catch (e) {
      throw new Error('ERROR by Attribution: ' + e.message);
    }

    //calculate Power for Resistor, CurrentSrc, VoltageSrc
    circuit.components.forEach(c => {
      if (
        c instanceof Resistor ||
        c instanceof CurrentSource ||
        c instanceof VoltageSource
      ) {
        c.calculatePower();
      }
    });
  }

  solve(circuit) {
    // TODO solve the circuit and call method from Circuit.js
    const projection = circuit.project();
    this.checkAndSolveCircuit(projection);
  }

  solveIqe(circuit, fromKlemme, toKlemme) {
    // TODO solve the circuit and call method from Circuit.js
    const projection = circuit.project();

    //ADD an Ampermeter
    let ampermeter = new Ampermeter({ symbol: 'Iqe' });
    ampermeter.showPin1 = false;
    ampermeter.showPin2 = false;
    projection.components.push(ampermeter);
    const w1 = new Wire({
      from: fromKlemme.pins[0],
      to: ampermeter.pins[0]
    });
    const w2 = new Wire({
      from: ampermeter.pins[1],
      to: toKlemme.pins[0]
    });
    projection.wires.push(w1, w2);

    this.checkAndSolveCircuit(projection);

    projection.attributeUItoOne2PinsComponent(ampermeter);
    return ampermeter;
  }

  solveUqe(circuit, fromKlemme, toKlemme) {
    // TODO solve the circuit and call method from Circuit.js
    const projection = circuit.project();

    //ADD an Voltmeter
    let voltmeter = new Voltmeter({ symbol: 'Uqe' });
    voltmeter.showPin1 = false;
    voltmeter.showPin2 = false;
    projection.components.push(voltmeter);
    const w1 = new Wire({
      from: fromKlemme.pins[0],
      to: voltmeter.pins[0]
    });
    const w2 = new Wire({
      from: voltmeter.pins[1],
      to: toKlemme.pins[0]
    });
    projection.wires.push(w1, w2);

    this.checkAndSolveCircuit(projection);

    projection.attributeUItoOne2PinsComponent(voltmeter);
    return voltmeter;
  }

  checkAndSolveCircuit(projection) {
    //STEP 1
    console.log('STEP 1 started');
    /**
     * purpose: check that all 2-Pins-components have their main value
     * => Done before calling checkAndSolveCircuit
     */
    try {
      /* if you run test-circuit in command line comment following function call */
      projection.isCircuitOpen();
    } catch (e) {
      throw new Error('ERROR by STEP 1: ' + e.message);
    }
    console.log('STEP 1 finished');
    //STEP 2
    console.log('STEP 2 started');
    projection.verifyOneKnotenBetweenTwo2PinsKomp();
    console.log('STEP 2 finished');
    //STEP 3
    console.log('STEP 3 started');
    projection.getSubCircuit(projection.components[0]);
    console.log(
      'Number of Subcircuit(s) :',
      projection.listOfSubCircuit.length
    ); //projection.components is now empty !!!
    console.log('STEP 3 finished');

    //STEP 4
    console.log('STEP 4 started');
    projection.verifyPotential();
    console.log('STEP 4 finished');

    //STEP 5
    console.log('STEP 5 started');
    projection.addOneWireBetweenTwoMultiPinKomp();
    console.log('STEP 5 finished');

    //Knotenpotentialverfahren
    console.log('---!!!---Ready for Knotenpotentialverfahren---!!!---');
    try {
      projection.createAndSolveMatrix();
    } catch (e) {
      // throw new Error("ERROR by Knotenpotentialverfahren: " + e.message);

      if (e instanceof InconsistentMatrixError) {
        throw new InconsistentMatrixError(
          'ERROR by Knotenpotentialverfahren: ' + e.message
        );
      }
      if (e instanceof ConsistentMatrixInfiniteError) {
        throw new ConsistentMatrixInfiniteError(
          'ERROR by Knotenpotentialverfahren: ' + e.message
        );
      }
    }
    console.log('SOLVED');
  }
}

export default CircuitSolver;
