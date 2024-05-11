import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';
import CurrentSrcJS from '../../jsFolder/constructorComponent/jsComponents/CurrentSource';

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
   * -isInParallel()
   */
  isPossible() {
    log('---------NortonToThevenin---------');
    const selectedComp_array = this.circuitCopy.getSelectedComponents();
    log('selected_array', selectedComp_array);

    return (
      this.isInstanceCorrect(selectedComp_array) &&
      this.isInParallel(selectedComp_array)
    );
  }

  isInstanceCorrect(selectedComp_array) {
    if (selectedComp_array.length !== 2) {
      return false;
    }
    let oneResistor = false;
    let oneCurrentSrc = false;
    selectedComp_array.some((comp) => {
      if (comp instanceof ResistorJS) {
        oneResistor = true;
      }
      if (comp instanceof CurrentSrcJS) {
        oneCurrentSrc = true;
      }
    });
    return oneResistor && oneCurrentSrc;
  }

  /*
    on the path btw R and CS, I can have 
    - multiple simple Knoten (without PV)
  */
  /*
    To avoid an overly complex circuit that would cause the algo to fail, I'm going to do 2 tests:
    1) I start from each of the 2 pins of R and see if I reach CS with the 2 pins.
    If so, I return true, otherwise I go on to test 2
    2) I start from each of the 2 pins of CS and see if I reach R with the 2 pins
  */
  isInParallel(selArray) {
    let isShorCircuit = false;
    for (const sComp of selArray) {
      let successPin = [false, false];
      log('---START---', sComp.symbol);
      for (const [index, pin] of sComp.pins.entries()) {
        log('---PIN---');
        this.circuitCopy.setAsVisited(sComp);

        // get 1 neighbor from first selected comp on this pin
        const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);
        if (!nComp) {
          return false;
        }
        log('nComp', nComp.symbol);
        if (!this.isSimpleKnoten(nComp)) {
          log('not a simple Knoten');
          return false;
        }
        this.circuitCopy.setAsVisited(nComp);

        const explore = (nComp) => {
          log('EXPLORE', nComp.symbol);
          const comps = this.circuitCopy.getNeighborsOfOneComp(nComp.pins);

          log('comps', comps);
          for (const icomp of comps) {
            log('icomp', icomp.symbol, icomp.visited);

            // find a short circuit
            if (
              icomp.selected &&
              icomp.uniqueID !== sComp.uniqueID &&
              icomp.onPath
            ) {
              isShorCircuit = true;
              log('short circuit found BREAK');
              break;
            }

            if (icomp.selected && icomp.uniqueID !== sComp.uniqueID) {
              // I found the second select comp
              log('found the second select comp');
              this.circuitCopy.setOnPath(icomp, true);
              this.circuitCopy.setOnPath(nComp, true);
              successPin[index] = true;
              continue;
            }
            if (
              icomp.visited ||
              (!icomp.isMultiPin && !icomp.selected) ||
              (icomp.isMultiPin && !this.isSimpleKnoten(icomp))
            ) {
              log('stop on', icomp.symbol);
              this.circuitCopy.setOnPath(icomp, false);
              continue;
            }

            this.circuitCopy.setAsVisited(icomp);

            if (!icomp.selected) {
              explore(icomp);
            }
          }

          if (isShorCircuit) {
            return;
          }

          this.circuitCopy.setOnPath(nComp, true);
        };

        explore(nComp);

        if (isShorCircuit) {
          return false;
        }

        if (nComp.onPath) {
          this.circuitCopy.setOnPath(sComp, true);
        }

        if (
          this.circuitCopy.components
            .filter((c) => c.selected)
            .every((c) => c.onPath)
        ) {
          successPin[index] = true;
          log('TRUE');
        } else {
          log('FALSE');
        }

        this.circuitCopy.components.map((c) => {
          c.visited = false;
          c.onPath = false;
        });
      }
      if (successPin[0] && successPin[1]) {
        return true;
      }
    }
    return false;
  }

  isSimpleKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }

  /*
    step 1: remove single Knoten between R and CS until R and VS are separated by only one simple Knoten
    step 2: understand the circuit to have the external components to create future wires and to store the values valueIq, dirU and dirI
    step 3: delete CS
    step 4: add VS + set value VS
    step 5: create wires

        hypothesis b=0
      knOnPin1FromCS  knOnPin0FromCS
    ...---kn----R----kn---...
          |           |
          |           |
          -----CS------
      CS.pin[a]  CS.pin[b] => if pin[0] then kn neighbor is called knOnPin0FromCS

          GOAL: remove a minimum of comps/wires
      knOnPin1FromCS  knOnPin0FromCS
    ...---kn----R    kn---...
                |     |
      VS.pin[a] |     |
               VS------
                VS.pin[b] => pin[0]
      -> delete 2 wires & 1 comp
      -> create 2 wires & 1 comp
  */
  conversion() {
    this.circuitCopy.components.map((c) => {
      c.visited = false;
      c.onPath = false;
    });
    //step 1: simplification by fusion from all Knoten to obtain the classical Norton circuit
    /*
     ------kn----someComp
     |     |
    CS     R
     |     |
     ------kn----someComp
     */
    const selected_array = this.circuit.getSelectedComponents();
    const startComp = selected_array[0];
    this.circuitCopy.setAsVisited(startComp);
    for (const pin of startComp.pins) {
      const simpleKnotenToDelete = [];
      log('---PIN---');
      // get 1 neighbor from first selected comp on this pin
      const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);
      if (!nComp) {
        continue;
      }
      log('nComp', nComp.symbol);
      if (!this.isSimpleKnoten(nComp)) {
        log('not a simple Knoten');
        continue;
      }
      this.circuitCopy.setAsVisited(nComp);

      const explore = (nComp) => {
        log('EXPLORE', nComp.symbol);
        const comps = this.circuitCopy.getNeighborsOfOneComp(nComp.pins);

        log('comps', comps);
        for (const icomp of comps) {
          log('icomp', icomp.symbol, icomp.visited);

          if (icomp.selected && icomp.uniqueID !== startComp.uniqueID) {
            // I found the second select comp
            break;
          }
          if (
            icomp.visited ||
            (!icomp.isMultiPin && !icomp.selected) ||
            (icomp.isMultiPin && !this.isSimpleKnoten(icomp))
          ) {
            log('stop on', icomp.symbol);
            continue;
          }

          this.circuitCopy.setAsVisited(icomp);

          if (this.isSimpleKnoten(icomp) && this.isSimpleKnoten(nComp)) {
            simpleKnotenToDelete.push(icomp);
          }

          if (!icomp.selected) {
            explore(icomp);
          }
        }
      };

      explore(nComp);

      this.circuitCopy.components.map((c) => {
        c.visited = false;
        c.onPath = false;
      });

      log(simpleKnotenToDelete);
      for (const kn of simpleKnotenToDelete) {
        log('delete', kn.symbol, 'attach to', nComp.symbol);
        this.circuit.deleteMultiPinCompAndSetWireInstead(nComp, kn);
      }
    }

    //step 2
    const compR =
      selected_array[0] instanceof ResistorJS
        ? selected_array[0]
        : selected_array[1];
    const compCS =
      selected_array[0] instanceof CurrentSrcJS
        ? selected_array[0]
        : selected_array[1];

    const [knOnPin0FromCS] = this.circuit.getNeighborsOfOneComp(compCS.pins[0]);
    const [knOnPin1FromCS] = this.circuit.getNeighborsOfOneComp(compCS.pins[1]);
    let futurePinIdOfRConnectedToCS = undefined;

    for (let index = this.circuit.wires.length - 1; index >= 0; index -= 1) {
      const wire = this.circuit.wires[index];

      const fromComp = this.circuit.componentFromPin(wire.from);
      const toComp = this.circuit.componentFromPin(wire.to);

      if (
        (fromComp.uniqueID === compCS.uniqueID &&
          toComp.uniqueID === knOnPin1FromCS.uniqueID) ||
        (toComp.uniqueID === compCS.uniqueID &&
          fromComp.uniqueID === knOnPin1FromCS.uniqueID)
      ) {
        this.circuit.deleteOneWire(wire);
      }

      if (
        fromComp.uniqueID === compR.uniqueID &&
        toComp.uniqueID === knOnPin0FromCS.uniqueID
      ) {
        futurePinIdOfRConnectedToCS = wire.from === compR.pins[0] ? 0 : 1;
        this.circuit.deleteOneWire(wire);
      } else if (
        toComp.uniqueID === compR.uniqueID &&
        fromComp.uniqueID === knOnPin0FromCS.uniqueID
      ) {
        futurePinIdOfRConnectedToCS = wire.to === compR.pins[0] ? 0 : 1;
        this.circuit.deleteOneWire(wire);
      }
    }
    // 2 wires are deleted

    const valueIq = compCS.valueI;
    const dirU = compCS.directionU;
    const dirI = compCS.directionI;
    const rota = compCS.rotation;
    const valueLeft = compCS.x;
    const valueTop = compCS.y;

    //step 3
    this.circuit.deleteOneComponent(compCS);

    //step 4
    // in Component.js centerX2PinsComp and centerY2PinsComp are subtracted inside the constructor (default behaviour for the drop creation)
    const compVS = this.circuit.dropComp({
      c_id: 'VoltageSource',
      valueLeft: valueLeft + centerX2PinsComp,
      valueTop: valueTop + centerY2PinsComp,
      dirU: dirU,
      dirI: dirI
    });

    compVS.rotation = rota;

    //TODO based on direction, fix the formula
    compVS.valueU = valueIq * compR.valueR;
    if (dirU === dirI) {
      compVS.valueU *= -1;
    }

    //step 5
    this.circuit.createOneWire(compR, futurePinIdOfRConnectedToCS, compVS, 1);
    this.circuit.createOneWire(compVS, 0, knOnPin0FromCS, 0);

    this.circuit.components.map((c) => c.recalculatePins());
  }
}
