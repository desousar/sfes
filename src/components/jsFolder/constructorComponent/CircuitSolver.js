import {
  isResistor,
  isCurrentSource,
  isVoltageSource
} from '@/components/instanceofFunction.js';

class CircuitSolver {
  constructor(circuit) {
    this.circuit = circuit;
  }

  solveWithAttribution() {
    const projection = this.circuit.project();

    projection.checkAndSolveCircuit();

    try {
      projection.attributionToOriginal(this.circuit);
    } catch (e) {
      throw new Error('ERROR by Attribution: ' + e.message);
    }

    //calculate Power for Resistor, CurrentSrc, VoltageSrc
    this.circuit.components.forEach((c) => {
      if (isResistor(c) || isCurrentSource(c) || isVoltageSource(c)) {
        c.calculatePower();
      }
    });
  }

  solve() {
    const projection = this.circuit.project();
    projection.checkAndSolveCircuit();
    return projection;
  }

  solveIqe(fromKlemme, toKlemme) {
    const projection = this.circuit.project();

    //ADD an Ampermeter
    const ampermeter = projection.dropComp({
      c_id: 'Ampermeter'
    });

    projection.createOneWire(fromKlemme, 0, ampermeter, 0);
    projection.createOneWire(ampermeter, 1, toKlemme, 0);

    projection.checkAndSolveCircuit();

    projection.attributeUItoOne2PinsComponent(ampermeter);
    return ampermeter;
  }

  solveUqe(fromKlemme, toKlemme) {
    const projection = this.circuit.project();

    //ADD an Voltmeter
    const voltmeter = projection.dropComp({
      c_id: 'Voltmeter'
    });

    projection.createOneWire(fromKlemme, 0, voltmeter, 0);
    projection.createOneWire(voltmeter, 1, toKlemme, 0);

    projection.checkAndSolveCircuit();

    projection.attributeUItoOne2PinsComponent(voltmeter);
    return voltmeter;
  }
}

export default CircuitSolver;
