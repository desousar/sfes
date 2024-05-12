import KnotenJS from '@/components/jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '@/components/jsFolder/constructorComponent/jsComponents/Resistor';
import KlemmeJS from '@/components/jsFolder/constructorComponent/jsComponents/Klemme';

import { middle3Points } from '../util/mathFunction';

import log from '@/consoleLog';

export default class DreieckToStern {
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
   * -isInDreieck()
   */
  isPossible() {
    log('---------DreieckToStern---------');
    const selectedComp_array = this.circuitCopy.getSelectedComponents();

    return (
      this.is3SameInstance(selectedComp_array) &&
      this.isInDreieck(selectedComp_array)
    );
  }

  is3SameInstance(selectedComp_array) {
    return (
      selectedComp_array.length === 3 &&
      selectedComp_array.every((comp) => comp instanceof ResistorJS)
    );
  }

  /*
    on the path btw 2 R, I can have 
    - multiple Knoten || 
    - 1 Klemme and multiple Knoten || 
    - 1 Knoten with Potential and multiple Knoten
  */
  /*
  if I start at one R on one pin and access the other two, I'm faced with a shortcut, return false

  To simplify understanding, I'll call the 3 Rs alpha, beta and gamma
 */
  isInDreieck(selectedComp_array) {
    const all6Pins = [];
    selectedComp_array.map((comp) => {
      all6Pins.push(comp.pins[0]);
      all6Pins.push(comp.pins[1]);
    });

    const neighborsOfRs = this.circuitCopy.getNeighborsOfOneComp(all6Pins);

    const neighborsAreMultiPin = neighborsOfRs.every((comp) => comp.isMultiPin);

    if (!neighborsAreMultiPin) {
      return false;
    }

    log('all 3 R have 2 MultiPin-Comp as neighbor');

    const controlOnPins = [
      [undefined, undefined],
      [undefined, undefined],
      [undefined, undefined]
    ];
    let isShorCircuit = false;
    for (const [sCompIndex, sComp] of selectedComp_array.entries()) {
      let hasOneKlemme = false;
      let hasOnePotentialKnoten = false;
      log('---START---', sComp.symbol);
      for (const [index, pin] of sComp.pins.entries()) {
        log('---PIN---');
        this.circuitCopy.setAsVisited(sComp);

        // get 1 neighbor from R on this pin
        const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);
        log('nComp', nComp.symbol);

        if (nComp instanceof KlemmeJS) {
          hasOneKlemme = true;
        }
        if (nComp instanceof KnotenJS && nComp.valuePotentialSource) {
          hasOnePotentialKnoten = true;
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
              controlOnPins[sCompIndex][index] = icomp.uniqueID;
              continue;
            }
            if (
              icomp.visited ||
              (!icomp.isMultiPin && !icomp.selected) ||
              (icomp instanceof KlemmeJS &&
                (hasOneKlemme || hasOnePotentialKnoten)) ||
              (icomp instanceof KnotenJS &&
                icomp.valuePotentialSource &&
                (hasOneKlemme || hasOnePotentialKnoten))
            ) {
              log('stop on', icomp.symbol);
              this.circuitCopy.setOnPath(icomp, false);
              continue;
            }
            if (icomp instanceof KlemmeJS) {
              hasOneKlemme = true;
            }
            if (icomp instanceof KnotenJS && icomp.valuePotentialSource) {
              hasOnePotentialKnoten = true;
            }

            this.circuitCopy.setAsVisited(icomp);

            if (!icomp.selected) {
              explore(icomp);
            }
          }

          if (isShorCircuit) {
            return;
          }

          const onPath = comps.filter((c) => c.onPath).length;
          /*
            if onPath === 0, it means I'm at a dead end
            So I need to check whether I'm on a Klemme or Knoten with PS, and set it to false, so that I can continue searching after the path without these variables being set to true because they're not part of the path.
          */
          if (onPath === 0) {
            if (nComp instanceof KlemmeJS) {
              hasOneKlemme = false;
            }
            if (nComp instanceof KnotenJS && nComp.valuePotentialSource) {
              hasOnePotentialKnoten = false;
            }
          } else {
            this.circuitCopy.setOnPath(nComp, true);
          }
        };

        explore(nComp);

        if (isShorCircuit) {
          return false;
        }

        if (nComp.onPath) {
          this.circuitCopy.setOnPath(sComp, true);
        }

        this.circuitCopy.components.map((c) => {
          c.visited = false;
          c.onPath = false;
        });
      }

      if (
        !controlOnPins[sCompIndex][0] ||
        !controlOnPins[sCompIndex][1] ||
        controlOnPins[sCompIndex][0] === controlOnPins[sCompIndex][1]
      ) {
        return false;
      }
    }

    log('controlOnPins', controlOnPins);
    /* check
      whether row index 0 contains R[1] and R[2]
      whether row index 1 contains R[0] and R[0]
      whether row index 2 contains R[0] and R[1]
    */
    const containsValuesInRow = (row, values) => {
      return values.every((value) => row.includes(value));
    };

    return (
      containsValuesInRow(controlOnPins[0], [
        selectedComp_array[1].uniqueID,
        selectedComp_array[2].uniqueID
      ]) &&
      containsValuesInRow(controlOnPins[1], [
        selectedComp_array[0].uniqueID,
        selectedComp_array[2].uniqueID
      ]) &&
      containsValuesInRow(controlOnPins[2], [
        selectedComp_array[0].uniqueID,
        selectedComp_array[1].uniqueID
      ])
    );
  }

  isSimpleKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }

  /*
    step 1: too complex to try to merge 2 single Knoten directly connected btw these 3 R, so instead I use isPossible code to understand the circuit (which pin of which R accesses which pin of which R) because I already know that the structure is correct
    step 2: add simple Knoten and replace wires
  */
  conversion() {
    log('###CONVERSION###');
    this.circuitCopy.components.map((c) => {
      c.visited = false;
      c.onPath = false;
    });

    //step 1
    const selectedComp_array = this.circuit.getSelectedComponents();

    const accessConfig = [];
    let isShorCircuit = false;
    for (const sComp of selectedComp_array) {
      let hasOneKlemme = false;
      let hasOnePotentialKnoten = false;
      log('---START---', sComp.symbol);
      for (const pin of sComp.pins) {
        log('---PIN---');
        this.circuitCopy.setAsVisited(sComp);

        // get 1 neighbor from R on this pin
        const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);
        log('nComp', nComp.symbol);

        if (nComp instanceof KlemmeJS) {
          hasOneKlemme = true;
        }
        if (nComp instanceof KnotenJS && nComp.valuePotentialSource) {
          hasOnePotentialKnoten = true;
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

              const compPinId = this.circuit.pinIndexFromComponent(sComp, pin);
              const [ngbr] = this.circuit.getNeighborsOfOneComp(icomp.pins[0]);
              let neighborPinId = undefined;
              if (ngbr.uniqueID === nComp.uniqueID) {
                neighborPinId = 0;
              } else {
                neighborPinId = 1;
              }

              accessConfig.push({
                comp: sComp,
                compPinId: compPinId,
                neighbor: icomp,
                neighborPinId: neighborPinId
              });

              continue;
            }
            if (
              icomp.visited ||
              (!icomp.isMultiPin && !icomp.selected) ||
              (icomp instanceof KlemmeJS &&
                (hasOneKlemme || hasOnePotentialKnoten)) ||
              (icomp instanceof KnotenJS &&
                icomp.valuePotentialSource &&
                (hasOneKlemme || hasOnePotentialKnoten))
            ) {
              log('stop on', icomp.symbol);
              this.circuitCopy.setOnPath(icomp, false);
              continue;
            }
            if (icomp instanceof KlemmeJS) {
              hasOneKlemme = true;
            }
            if (icomp instanceof KnotenJS && icomp.valuePotentialSource) {
              hasOnePotentialKnoten = true;
            }

            this.circuitCopy.setAsVisited(icomp);

            if (!icomp.selected) {
              explore(icomp);
            }
          }

          if (isShorCircuit) {
            return;
          }

          const onPath = comps.filter((c) => c.onPath).length;
          /*
            if onPath === 0, it means I'm at a dead end
            So I need to check whether I'm on a Klemme or Knoten with PS, and set it to false, so that I can continue searching after the path without these variables being set to true because they're not part of the path.
          */
          if (onPath === 0) {
            if (nComp instanceof KlemmeJS) {
              hasOneKlemme = false;
            }
            if (nComp instanceof KnotenJS && nComp.valuePotentialSource) {
              hasOnePotentialKnoten = false;
            }
          } else {
            this.circuitCopy.setOnPath(nComp, true);
          }
        };

        explore(nComp);

        if (isShorCircuit) {
          return false;
        }

        if (nComp.onPath) {
          this.circuitCopy.setOnPath(sComp, true);
        }

        this.circuitCopy.components.map((c) => {
          c.visited = false;
          c.onPath = false;
        });
      }
    }

    log('accessConfig', accessConfig);

    /*
            kn
          /    \
         /      \
  R_alpha       R_beta
      /           \
     /             \
   kn----R_gamma----kn

    convert into

            kn
          /    
         /      
  R_alpha     --R_beta
        |    /     \
        ----kn--    \
                \    \
    kn---R_gamma--    kn

    accessConfig structure is like this example
    const accessConfig = [
      {comp: R_alpha, compPinId: 0, neighbor: R_gamma, neighborPinId: 0 },
      {comp: R_alpha, compPinId: 1, neighbor: R_beta, neighborPinId: 0 },
      {comp: R_beta, compPinId: 0, neighbor: R_alpha, neighborPinId: 1 },
      {comp: R_beta, compPinId: 1, neighbor: R_gamma, neighborPinId: 1 },
      {comp: R_gamma, compPinId: 0, neighbor: R_alpha, neighborPinId: 0 },
      {comp: R_gamma, compPinId: 1, neighbor: R_beta, neighborPinId: 1 },
    ]; with :
    index n and n+1 are same comp
    on index n it's comp pin 0
    on index n+1 it's comp pin 1
    */

    // to find out which wire will be deleted
    const partOfWireToDelete = [];
    // to be able to process the mathematical formula
    const partOfWireToKeep = [];

    partOfWireToDelete.push({
      comp: accessConfig[1].comp,
      compPinId: accessConfig[1].compPinId,
      neighbor: accessConfig[1].neighbor,
      neighborPinId: accessConfig[1].neighborPinId
    });
    partOfWireToKeep.push({
      comp: accessConfig[0].comp,
      compPinId: accessConfig[0].compPinId,
      neighbor: accessConfig[0].neighbor,
      neighborPinId: accessConfig[0].neighborPinId
    });

    for (let index = 0; index < 2; index++) {
      const last_partOfWireToDelete =
        partOfWireToDelete[partOfWireToDelete.length - 1];
      //algo deliberately left undeveloped (not optimized in a for loop containing a single if) to make the process easier to understand
      if (
        accessConfig[0].comp.uniqueID ===
        last_partOfWireToDelete.neighbor.uniqueID
      ) {
        if (
          accessConfig[0].compPinId === last_partOfWireToDelete.neighborPinId
        ) {
          partOfWireToDelete.push({
            comp: accessConfig[1].comp,
            compPinId: accessConfig[1].compPinId,
            neighbor: accessConfig[1].neighbor,
            neighborPinId: accessConfig[1].neighborPinId
          });
          partOfWireToKeep.push({
            comp: accessConfig[0].comp,
            compPinId: accessConfig[0].compPinId,
            neighbor: accessConfig[0].neighbor,
            neighborPinId: accessConfig[0].neighborPinId
          });
        } else {
          partOfWireToDelete.push({
            comp: accessConfig[0].comp,
            compPinId: accessConfig[0].compPinId,
            neighbor: accessConfig[0].neighbor,
            neighborPinId: accessConfig[0].neighborPinId
          });
          partOfWireToKeep.push({
            comp: accessConfig[1].comp,
            compPinId: accessConfig[1].compPinId,
            neighbor: accessConfig[1].neighbor,
            neighborPinId: accessConfig[1].neighborPinId
          });
        }
      } else if (
        accessConfig[2].comp.uniqueID ===
        last_partOfWireToDelete.neighbor.uniqueID
      ) {
        if (
          accessConfig[2].compPinId === last_partOfWireToDelete.neighborPinId
        ) {
          partOfWireToDelete.push({
            comp: accessConfig[3].comp,
            compPinId: accessConfig[3].compPinId,
            neighbor: accessConfig[3].neighbor,
            neighborPinId: accessConfig[3].neighborPinId
          });
          partOfWireToKeep.push({
            comp: accessConfig[2].comp,
            compPinId: accessConfig[2].compPinId,
            neighbor: accessConfig[2].neighbor,
            neighborPinId: accessConfig[2].neighborPinId
          });
        } else {
          partOfWireToDelete.push({
            comp: accessConfig[2].comp,
            compPinId: accessConfig[2].compPinId,
            neighbor: accessConfig[2].neighbor,
            neighborPinId: accessConfig[2].neighborPinId
          });
          partOfWireToKeep.push({
            comp: accessConfig[3].comp,
            compPinId: accessConfig[3].compPinId,
            neighbor: accessConfig[3].neighbor,
            neighborPinId: accessConfig[3].neighborPinId
          });
        }
      } else {
        if (
          accessConfig[4].compPinId === last_partOfWireToDelete.neighborPinId
        ) {
          partOfWireToDelete.push({
            comp: accessConfig[5].comp,
            compPinId: accessConfig[5].compPinId,
            neighbor: accessConfig[5].neighbor,
            neighborPinId: accessConfig[5].neighborPinId
          });
          partOfWireToKeep.push({
            comp: accessConfig[4].comp,
            compPinId: accessConfig[4].compPinId,
            neighbor: accessConfig[4].neighbor,
            neighborPinId: accessConfig[4].neighborPinId
          });
        } else {
          partOfWireToDelete.push({
            comp: accessConfig[4].comp,
            compPinId: accessConfig[4].compPinId,
            neighbor: accessConfig[4].neighbor,
            neighborPinId: accessConfig[4].neighborPinId
          });
          partOfWireToKeep.push({
            comp: accessConfig[5].comp,
            compPinId: accessConfig[5].compPinId,
            neighbor: accessConfig[5].neighbor,
            neighborPinId: accessConfig[5].neighborPinId
          });
        }
      }
    }

    for (let index = this.circuit.wires.length - 1; index >= 0; index -= 1) {
      const wire = this.circuit.wires[index];

      const fromComp = this.circuit.componentFromPin(wire.from);
      const toComp = this.circuit.componentFromPin(wire.to);

      for (const part of partOfWireToDelete) {
        if (
          fromComp.uniqueID === part.comp.uniqueID &&
          wire.from === part.comp.pins[part.compPinId]
        ) {
          this.circuit.deleteOneWire(wire);
        } else if (
          toComp.uniqueID === part.comp.uniqueID &&
          wire.to === part.comp.pins[part.compPinId]
        ) {
          this.circuit.deleteOneWire(wire);
        }
      }
    }

    //add centered Knoten
    let [x, y] = middle3Points(
      selectedComp_array[0],
      selectedComp_array[1],
      selectedComp_array[2]
    );
    let kn = this.circuit.dropComp({
      c_id: 'Knoten',
      valueLeft: x,
      valueTop: y
    });

    for (const part of partOfWireToDelete) {
      this.circuit.createOneWire(part.comp, part.compPinId, kn, 0);
    }

    let divisor = 0;
    selectedComp_array.forEach((c) => {
      divisor += c.valueR;
    });
    log('divisor', divisor);

    const valueR_0 =
      (partOfWireToKeep[0].comp.valueR * partOfWireToKeep[0].neighbor.valueR) /
      divisor;
    const valueR_1 =
      (partOfWireToKeep[1].comp.valueR * partOfWireToKeep[1].neighbor.valueR) /
      divisor;
    const valueR_2 =
      (partOfWireToKeep[2].comp.valueR * partOfWireToKeep[2].neighbor.valueR) /
      divisor;

    this.circuit.setValueR(partOfWireToKeep[0].comp, valueR_0);
    this.circuit.setValueR(partOfWireToKeep[1].comp, valueR_1);
    this.circuit.setValueR(partOfWireToKeep[2].comp, valueR_2);
  }
}
