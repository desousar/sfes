import {
  isResistor,
  isSimpleKnoten,
  isKnotenWithPotential,
  isKlemme
} from '@/components/instanceofFunction.js';

import { centerBtw2Points } from '@/components/Conversion/util/mathFunction';

import log from '@/consoleLog';

export default class SternToStern {
  constructor(circuit) {
    // circuit will be use to update the circuit
    this.circuit = circuit;
    // circuitCopy will be used to modify the circuit locally without modifying the true circuit => see setAsVisited()
    this.circuitCopy = circuit.project();
  }

  /**
   * every Conversion Class has at least 2 importants functions:
   * -isPossible()
   * -conversion()
   */

  /**
   * @returns true if condition are met :
   * -is3SameInstance()
   * -isInStern()
   */
  isPossible() {
    log('---------SternToDreieck---------');
    const selectedComp_array = this.circuitCopy.getSelectedComponents();

    return (
      this.is3SameInstance(selectedComp_array) &&
      this.isInStern(selectedComp_array)
    );
  }

  is3SameInstance(selectedComp_array) {
    return (
      selectedComp_array.length === 3 &&
      selectedComp_array.every((comp) => isResistor(comp))
    );
  }

  /*
    on the path btw the 3 R, I can have 
    - only multiple simple Knoten
  */
  /*
  if I start at one R on one pin and access the other two not only one time but twice, I'm faced with a shortcut, return false

  To simplify understanding, I'll call the 3 Rs alpha, beta and gamma
 */
  isInStern(selArray) {
    let isShorCircuit = false;
    for (const sComp of selArray) {
      log('---START---', sComp.symbol);
      for (const pin of sComp.pins) {
        log('---PIN---');
        this.circuitCopy.setAsVisited(sComp);

        // get 1 neighbor from R on this pin
        // on the external part, a R can be connected to a composant or to nothing
        const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);
        log('nComp', nComp?.symbol);
        if (
          !nComp ||
          !nComp.isMultiPin ||
          isKlemme(nComp) ||
          isKnotenWithPotential(nComp)
        ) {
          continue;
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
              this.circuitCopy.setOnPath(icomp, true);
              continue;
            }

            if (
              (!icomp.isMultiPin && !icomp.selected) ||
              isKlemme(icomp) ||
              isKnotenWithPotential(icomp)
            ) {
              log('stop on', icomp.symbol);
              this.circuitCopy.setOnPath(icomp, false);
              break;
            }

            if (icomp.visited) {
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
          log('TRUE');
          this.circuitCopy.components.map((c) => {
            c.visited = false;
            c.onPath = false;
          });
          return true;
        } else {
          log('FALSE');
        }

        this.circuitCopy.components.map((c) => {
          c.visited = false;
          c.onPath = false;
        });
      }
    }
    return false;
  }

  /*
    1) get the 3 inner pinIds and store for 3) all visited single Knoten
    2) delete the single Knoten (wires are managed automatically)
    3) secure the circuit => ext side 
      if the other pin is connected to a Multipin, then nothing to do
      if the other pin is connected to nothing, then add a simple Knoten
      if the other pin is connected to a 2PinsComp, then add a single Knoten in the middle
    4) connect the inner pin of selComp[index] following (index+1)%3 to the neighbor of selComp[(index+1)%3] accessible from the outer pin
    5) calculate valueR
  */

  conversion() {
    console.log('###CONVERSION###');
    this.circuitCopy.components.map((c) => {
      c.visited = false;
      c.onPath = false;
    });

    //step 1
    const selectedComp_array = this.circuit.getSelectedComponents();

    /*
    same order as selectedComp_array
    const pinOrientation = [
      selComp[0] on index 0: {in: id, out: id}
      selComp[1] on index 1: {in: id, out: id}
      selComp[2] on index 2: {in: id, out: id}
    ]
  */
    let pinOrientation = [{}, {}, {}];
    let simpleKnotenToDelete = [];
    let isShorCircuit = false;
    for (const sComp of selectedComp_array) {
      log('---START---', sComp.symbol);
      for (const pin of sComp.pins) {
        log('---PIN---');
        const simpleKnotenToDelete_temp = [];
        pinOrientation = [{}, {}, {}];
        this.circuit.setAsVisited(sComp);

        // get 1 neighbor from R on this pin
        // on the external part, a R can be connected to a composant or to nothing
        const [nComp] = this.circuit.getNeighborsOfOneComp(pin);
        log('nComp', nComp?.symbol);
        if (
          !nComp ||
          !nComp.isMultiPin ||
          isKlemme(nComp) ||
          isKnotenWithPotential(nComp)
        ) {
          continue;
        }

        const index = selectedComp_array.findIndex(
          (c) => c.uniqueID === sComp.uniqueID
        );
        const pinId = this.circuit.pinIndexFromComponent(sComp, pin);
        pinOrientation[index] = {
          in: pinId,
          out: pinId === 0 ? 1 : 0
        };

        this.circuit.setAsVisited(nComp);

        if (isSimpleKnoten(nComp)) {
          simpleKnotenToDelete_temp.push(nComp);
        }

        const explore = (nComp) => {
          log('EXPLORE', nComp.symbol);
          const comps = this.circuit.getNeighborsOfOneComp(nComp.pins);

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
              this.circuit.setOnPath(icomp, true);

              const index = selectedComp_array.findIndex(
                (c) => c.uniqueID === icomp.uniqueID
              );
              const [ngbr] = this.circuit.getNeighborsOfOneComp(icomp.pins[0]);
              let icompInPinId = undefined;
              if (ngbr && ngbr.uniqueID === nComp.uniqueID) {
                icompInPinId = 0;
              } else {
                icompInPinId = 1;
              }
              pinOrientation[index] = {
                in: icompInPinId,
                out: icompInPinId === 0 ? 1 : 0
              };

              continue;
            }

            if (
              (!icomp.isMultiPin && !icomp.selected) ||
              isKlemme(icomp) ||
              isKnotenWithPotential(icomp)
            ) {
              log('stop on', icomp.symbol);
              this.circuit.setOnPath(icomp, false);
              break;
            }

            if (icomp.visited) {
              continue;
            }

            this.circuit.setAsVisited(icomp);

            if (isSimpleKnoten(icomp)) {
              simpleKnotenToDelete_temp.push(icomp);
            }

            if (!icomp.selected) {
              explore(icomp);
            }
          }

          if (isShorCircuit) {
            return;
          }

          this.circuit.setOnPath(nComp, true);
        };

        explore(nComp);

        if (nComp.onPath) {
          this.circuit.setOnPath(sComp, true);
        }

        if (
          this.circuit.components
            .filter((c) => c.selected)
            .every((c) => c.onPath)
        ) {
          log('TRUE');
          this.circuit.components.map((c) => {
            c.visited = false;
            c.onPath = false;
          });

          simpleKnotenToDelete = [...simpleKnotenToDelete_temp];
          break;
        } else {
          log('FALSE');
        }

        this.circuit.components.map((c) => {
          c.visited = false;
          c.onPath = false;
        });
      }
    }

    log('pinOrientation', pinOrientation);

    //step 2
    log(simpleKnotenToDelete);
    for (const kn of simpleKnotenToDelete) {
      log('delete', kn.symbol);
      this.circuit.deleteOneComponent(kn);
    }

    //step 3 & 4
    for (const [index, comp] of selectedComp_array.entries()) {
      const [nComp] = this.circuit.getNeighborsOfOneComp(
        comp.pins[pinOrientation[index].out]
      );

      let neighbor = undefined;
      let neighborPinId = undefined;

      if (!nComp) {
        let kn = this.circuit.dropComp({
          c_id: 'Knoten',
          valueLeft: comp.pins[pinOrientation[index].out].x + 20,
          valueTop: comp.pins[pinOrientation[index].out].y + 20
        });
        neighbor = kn;
        neighborPinId = 0;
        this.circuit.createOneWire(comp, pinOrientation[index].out, kn, 0);
      } else {
        // if (!nComp.isMultiPin) delete wire and get the neighbor and neighborPinId

        for (let idx = this.circuit.wires.length - 1; idx >= 0; idx--) {
          let wire = this.circuit.wires[idx];
          const fromComp = this.circuit.componentFromPin(wire.from);
          const toComp = this.circuit.componentFromPin(wire.to);

          if (
            fromComp.uniqueID === comp.uniqueID &&
            wire.from === comp.pins[pinOrientation[index].out]
          ) {
            neighbor = toComp;
            neighborPinId = this.circuit.pinIndexFromComponent(toComp, wire.to);
            if (!nComp.isMultiPin) this.circuit.deleteOneWire(wire);
          }
          if (
            toComp.uniqueID === comp.uniqueID &&
            wire.to === comp.pins[pinOrientation[index].out]
          ) {
            neighbor = fromComp;
            neighborPinId = this.circuit.pinIndexFromComponent(
              fromComp,
              wire.from
            );
            if (!nComp.isMultiPin) this.circuit.deleteOneWire(wire);
          }
        }

        //step 3
        if (!nComp.isMultiPin) {
          let [x, y] = centerBtw2Points(
            comp.pins[pinOrientation[index].out],
            neighbor.pins[neighborPinId]
          );
          let kn = this.circuit.dropComp({
            c_id: 'Knoten',
            valueLeft: x,
            valueTop: y
          });

          this.circuit.createOneWire(comp, pinOrientation[index].out, kn, 0);
          this.circuit.createOneWire(neighbor, neighborPinId, kn, 0);
        }
      }
      //step 4
      /*
        selComp[0] should be linked with neighborOut from selComp[1]
        selComp[1] should be linked with neighborOut from selComp[2]
        selComp[2] should be linked with neighborOut from selComp[0]
      */
      this.circuit.createOneWire(
        selectedComp_array[(index + 1) % 3],
        pinOrientation[(index + 1) % 3].in,
        neighbor,
        neighborPinId
      );
    }

    //step 5
    // based on reversed index rule (index+1)%3
    /*
      with selComp[0] use selComp[2]
      with selComp[1] use selComp[0]
      with selComp[2] use selComp[1]
    */
    let sum = 0;
    selectedComp_array.forEach((comp) => {
      sum += 1 / comp.valueR;
    });
    const divisor = 1 / sum;
    console.log('divisor', divisor);

    const valueR_0 =
      (selectedComp_array[0].valueR * selectedComp_array[2].valueR) / divisor;
    const valueR_1 =
      (selectedComp_array[1].valueR * selectedComp_array[0].valueR) / divisor;
    const valueR_2 =
      (selectedComp_array[2].valueR * selectedComp_array[1].valueR) / divisor;

    this.circuit.setValueR(selectedComp_array[0], valueR_0);
    this.circuit.setValueR(selectedComp_array[1], valueR_1);
    this.circuit.setValueR(selectedComp_array[2], valueR_2);
  }
}
