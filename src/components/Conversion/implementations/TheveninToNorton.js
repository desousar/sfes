import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';
import VoltageSrcJS from '../../jsFolder/constructorComponent/jsComponents/VoltageSource';

import {
  centerX2PinsComp,
  centerY2PinsComp
} from '../../jsFolder/constructorComponent/Component';

import log from '@/consoleLog';

export default class TheveninToNorton {
  constructor(circuit) {
    // circuit will be use to update the circuit
    this.circuit = circuit;
    // circuitCopy will be used to modify the circuit locally without modifying the true circuit
    this.circuitCopy = circuit.project();
  }

  /**
   * every Conversion Class has at least 2 importants functions:
   * -isPossible()
   * -conversion()
   */

  /**
   * @param {just comp with attribut selected === true} selectedComp_array
   * @param {entire object} circuit
   * @returns true if condition are met :
   * -isInstanceCorrect()
   * -isInSerie()
   */
  isPossible() {
    log('---------TheveninToNorton---------');
    const selectedComp_array = this.circuitCopy.getSelectedComponents();
    log('selected_array', selectedComp_array);

    return (
      this.isInstanceCorrect(selectedComp_array) &&
      this.isInSerie(selectedComp_array)
    );
  }

  isInstanceCorrect(selectedComp_array) {
    if (selectedComp_array.length !== 2) {
      return false;
    }
    let oneResistor = false;
    let oneVoltageSrc = false;
    selectedComp_array.some((comp) => {
      if (comp instanceof ResistorJS) {
        oneResistor = true;
      }
      if (comp instanceof VoltageSrcJS) {
        oneVoltageSrc = true;
      }
    });
    return oneResistor && oneVoltageSrc;
  }

  /*
    on the path btw R and U, I can have
      - multiple Knoten without potential value with MAX 2 neighbors
  */
  isInSerie(selArray) {
    const startComp = selArray[0];
    this.circuitCopy.setAsVisited(startComp);
    this.circuitCopy.setOnPath(startComp, true);
    for (const pin of startComp.pins) {
      log('---PIN---');
      const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);

      if (!nComp) {
        continue;
      }

      const explore = (nComp) => {
        log('EXPLORE', nComp?.symbol);

        if (
          !(
            nComp.selected ||
            (nComp instanceof KnotenJS &&
              nComp.valuePotentialSource === undefined &&
              this.circuit.getCountConnection(nComp) === 2)
          )
        ) {
          log('STOP');
          return;
        }

        this.circuitCopy.setAsVisited(nComp);

        if (nComp.selected && !nComp.onPath) {
          this.circuitCopy.setOnPath(nComp, true);
        }

        const comps = this.circuitCopy.getNeighborsOfOneComp(nComp.pins);

        log('comps', comps);

        for (const icomp of comps) {
          log('icomp', icomp.symbol, 'isVisited ?', icomp.visited);

          if (icomp.visited) {
            continue;
          }

          explore(icomp);
        }
      };

      explore(nComp);
    }

    return this.circuitCopy.components
      .filter((c) => c.selected)
      .every((c) => c.onPath);
  }

  /*
    step 1: remove single Knoten between R and VS until R and VS are directly adjacent
    step 2: understand the circuit to have the external components to create future wires and to store the values valueUq, dirU and dirI + delete the wire btw R and outside
    step 3: delete VS
    step 4: add CS and 2 Knoten + set value CS
    step 5: create wires
  */
  conversion() {
    this.circuitCopy.components.map((c) => {
      c.visited = false;
      c.onPath = false;
    });
    //step 1
    const simpleKnotenToDelete = [];
    const selected_array = this.circuit.getSelectedComponents();
    const compR =
      selected_array[0] instanceof ResistorJS
        ? selected_array[0]
        : selected_array[1];
    const compVS =
      selected_array[0] instanceof VoltageSrcJS
        ? selected_array[0]
        : selected_array[1];

    const startComp = selected_array[0];
    this.circuitCopy.setAsVisited(startComp);
    for (const pin of startComp.pins) {
      log('---PIN---');
      const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);

      if (!nComp) {
        continue;
      }

      const explore = (nComp) => {
        log('EXPLORE', nComp?.symbol);

        if (
          !(
            nComp.selected ||
            (nComp instanceof KnotenJS &&
              nComp.valuePotentialSource === undefined &&
              this.circuit.getCountConnection(nComp) === 2)
          )
        ) {
          log('STOP');
          return;
        }

        if (nComp instanceof KnotenJS) {
          simpleKnotenToDelete.push(nComp);
        }

        this.circuitCopy.setAsVisited(nComp);

        const comps = this.circuitCopy.getNeighborsOfOneComp(nComp.pins);

        log('comps', comps);

        for (const icomp of comps) {
          log('icomp', icomp.symbol, 'isVisited ?', icomp.visited);

          if (icomp.visited) {
            continue;
          }

          explore(icomp);
        }
      };

      explore(nComp);
    }

    // delete simple Knoten btw VoltageSrc and Resistor or next to this comp
    for (const kn of simpleKnotenToDelete) {
      log('delete', kn.symbol);
      this.circuit.deleteCompAndSetWireInstead(kn);
    }

    //step 2
    /*
      ...---[partR_outside]-R-[opposite_pinIdCompR]--[opposite_pinIdCompVS]-VS-[partVS_outside]---...
    */
    const partR_outside = {
      compR: compR,
      pinIdCompR: undefined,
      neighborConnectedToCompR: undefined,
      neighborPinIdConnectedToCompR: undefined
    };

    const partVS_outside = {
      compVS: compVS,
      pinIdCompVS: undefined,
      neighborConnectedToCompVS: undefined,
      neighborPinIdConnectedToCompVS: undefined
    };

    for (let index = this.circuit.wires.length - 1; index >= 0; index -= 1) {
      const wire = this.circuit.wires[index];

      const fromComp = this.circuit.componentFromPin(wire.from);
      const toComp = this.circuit.componentFromPin(wire.to);

      // set partR_outside
      if (
        fromComp.uniqueID === compR.uniqueID &&
        toComp.uniqueID !== compVS.uniqueID
      ) {
        const pinIdOfCompR = this.circuit.pinIndexFromComponent(
          compR,
          wire.from
        );
        if (pinIdOfCompR === 0) {
          partR_outside.pinIdCompR = 0;
        } else {
          partR_outside.pinIdCompR = 1;
        }
        partR_outside.neighborConnectedToCompR = toComp;
        partR_outside.neighborPinIdConnectedToCompR =
          this.circuit.pinIndexFromComponent(toComp, wire.to);

        this.circuit.deleteOneWire(wire);
      }

      if (
        toComp.uniqueID === compR.uniqueID &&
        fromComp.uniqueID !== compVS.uniqueID
      ) {
        const pinIdOfCompR = this.circuit.pinIndexFromComponent(compR, wire.to);
        if (pinIdOfCompR === 0) {
          partR_outside.pinIdCompR = 0;
        } else {
          partR_outside.pinIdCompR = 1;
        }
        partR_outside.neighborConnectedToCompR = fromComp;
        partR_outside.neighborPinIdConnectedToCompR =
          this.circuit.pinIndexFromComponent(fromComp, wire.from);

        this.circuit.deleteOneWire(wire);
      }

      // set partVS_outside
      if (
        fromComp.uniqueID === compVS.uniqueID &&
        toComp.uniqueID !== compR.uniqueID
      ) {
        const pinIdOfCompVS = this.circuit.pinIndexFromComponent(
          compVS,
          wire.from
        );
        if (pinIdOfCompVS === 0) {
          partVS_outside.pinIdCompVS = 0;
        } else {
          partVS_outside.pinIdCompVS = 1;
        }
        partVS_outside.neighborConnectedToCompVS = toComp;
        partVS_outside.neighborPinIdConnectedToCompVS =
          this.circuit.pinIndexFromComponent(toComp, wire.to);
      }

      if (
        toComp.uniqueID === compVS.uniqueID &&
        fromComp.uniqueID !== compR.uniqueID
      ) {
        const pinIdOfCompVS = this.circuit.pinIndexFromComponent(
          compVS,
          wire.to
        );
        if (pinIdOfCompVS === 0) {
          partVS_outside.pinIdCompVS = 0;
        } else {
          partVS_outside.pinIdCompVS = 1;
        }
        partVS_outside.neighborConnectedToCompVS = fromComp;
        partVS_outside.neighborPinIdConnectedToCompVS =
          this.circuit.pinIndexFromComponent(fromComp, wire.from);
      }
    }

    // store valueUq, dirU et dirI
    const valueUq = compVS.valueU;
    const dirU = compVS.directionU;
    const dirI = compVS.directionI;

    //step 3
    this.circuit.deleteOneComponent(compVS);

    //step 4
    // in Component.js centerX2PinsComp and centerY2PinsComp are subtracted inside the constructor (default behaviour for the drop creation)
    const compCS = this.circuit.dropComp({
      c_id: 'CurrentSource',
      valueLeft: compVS.x + centerX2PinsComp,
      valueTop: compVS.y + centerY2PinsComp,
      dirU: dirU,
      dirI: dirI
    });

    //TODO based on direction, fix the formula
    compCS.valueI = valueUq / compR.valueR;
    if (dirU === dirI) {
      compCS.valueI *= -1;
    }

    const kn1 = this.circuit.dropComp({
      c_id: 'Knoten',
      valueLeft: compVS.pins[0].x + 30,
      valueTop: compVS.pins[0].y + 20
    });
    const kn2 = this.circuit.dropComp({
      c_id: 'Knoten',
      valueLeft: compVS.pins[1].x + 30,
      valueTop: compVS.pins[1].y + 20
    });

    //step 5
    if (partR_outside.neighborConnectedToCompR) {
      this.circuit.createOneWire(
        partR_outside.neighborConnectedToCompR,
        partR_outside.neighborPinIdConnectedToCompR,
        kn1,
        0
      );
    }
    if (partVS_outside.neighborConnectedToCompVS) {
      this.circuit.createOneWire(
        partVS_outside.neighborConnectedToCompVS,
        partVS_outside.neighborPinIdConnectedToCompVS,
        kn2,
        0
      );
    }

    this.circuit.createOneWire(compR, 0, kn1, 0);
    this.circuit.createOneWire(compR, 1, kn2, 0);

    //pinId of R initially connected to VS
    const opposite_pinIdCompR = partR_outside.pinIdCompR === 0 ? 0 : 1;

    //pinId of VS initially connected to R
    const opposite_pinIdCompVS = partVS_outside.pinIdCompVS === 0 ? 0 : 1;

    if (opposite_pinIdCompR === 0) {
      if (opposite_pinIdCompVS === 0) {
        this.circuit.createOneWire(compCS, 0, kn1, 0);
        this.circuit.createOneWire(compCS, 1, kn2, 0);
      } else {
        this.circuit.createOneWire(compCS, 1, kn1, 0);
        this.circuit.createOneWire(compCS, 0, kn2, 0);
      }
    } else {
      if (opposite_pinIdCompVS === 0) {
        this.circuit.createOneWire(compCS, 0, kn2, 0);
        this.circuit.createOneWire(compCS, 1, kn1, 0);
      } else {
        this.circuit.createOneWire(compCS, 1, kn2, 0);
        this.circuit.createOneWire(compCS, 0, kn1, 0);
      }
    }
  }
}
