import KnotenJS from '@/components/jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '@/components/jsFolder/constructorComponent/jsComponents/Resistor';
import KlemmeJS from '@/components/jsFolder/constructorComponent/jsComponents/Klemme';

import log from '@/consoleLog';

export default class MultipleRinParallel {
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
   * @returns true if both conditions are met :
   * -isAllSameInstance()
   * -isInParallel()
   */
  isPossible() {
    log('---------Parallel---------');
    const selectedComp_array = this.circuitCopy.getSelectedComponents();

    return (
      this.isAllSameInstance(selectedComp_array) &&
      this.isInParallel(selectedComp_array)
    );
  }

  isAllSameInstance(selectedComp_array) {
    return selectedComp_array.every((comp) => comp instanceof ResistorJS);
  }

  /*
    on the path btw 2 R, I can have 
    - multiple simple Knoten || 
    - 1 Klemme and multiple simple Knoten || 
    - 1 Knoten with Potential and multiple simple Knoten
  */
  /*
    A circuit that is too complex (MultiPin entanglement) may cause the algo to fail. I proceed as follows:
    For each R, I'll look for a path to the other selected R.
    All these attempts must be valid to return true, variable success (that the R's are parallel to each other).
  */
  isInParallel(selArray) {
    let isShorCircuit = false;
    let success = false;
    for (const sComp of selArray) {
      let successPin = [false, false];
      log('---START---', sComp.symbol);
      for (const [index, pin] of sComp.pins.entries()) {
        log('---PIN---');
        let hasOneKlemme = false;
        let hasOnePotentialKnoten = false;
        this.circuitCopy.setAsVisited(sComp);

        // get 1 neighbor from R on this pin
        const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);
        if (!nComp) {
          return false;
        }
        log('nComp', nComp.symbol);
        if (!nComp.isMultiPin) {
          return false;
        }
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
        success = true;
      }
    }
    return success;
  }

  isSimpleKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }

  /**
   * modify value from one comp ~ keepAlive (R)
   * delete Other (R)
   */
  conversion() {
    this.circuitCopy.components.map((c) => {
      c.visited = false;
      c.onPath = false;
    });
    const selectedComp_array = this.circuit.getSelectedComponents();
    let sum = 0;
    selectedComp_array.forEach((comp) => {
      sum += 1 / comp.valueR;
    });
    log('result', 1 / sum);

    let [keepAlive] = selectedComp_array.splice(0, 1);
    keepAlive.symbol += 'SUM';
    keepAlive.valueR = 1 / sum;
    keepAlive.selected = false;
    selectedComp_array.forEach((component) => {
      this.circuit.deleteOneComponent(component);
    });

    /*
      on the path btw 2 R, I can have 
      - multiple Knoten => ideally keepAlive only one Knoten
      - 1 Klemme and multiple Knoten => ideally keepAlive the Klemme
      - 1 Knoten with Potential and multiple Knoten => ideally keepAlive the Knoten with Potential
    */
    /*
      BUT CURRENTLY  
      while (a Knoten in the circuit has just 1 connection to a MultiPin || a Knoten is alone) && this Knoten isn't a potentialSrc => delete this one
     */
    while (this.multiPinSimplification() === false) {
      this.multiPinSimplification();
    }
  }
  multiPinSimplification() {
    log('multiPinSimplification');
    // this.circuit.components.forEach((kn) => {
    for (const kn of this.circuit.components) {
      if (this.isSimpleKnoten(kn)) {
        if (this.circuit.getCountConnection(kn) === 1) {
          // case circuit--MultiPin--Kn
          const [tempComp] = this.circuit.getNeighborsOfOneComp(kn.pins);
          if (tempComp.isMultiPin) {
            log('***', tempComp.symbol, 'delete', kn.symbol);
            this.circuit.deleteOneComponent(kn);
            return false;
          }
        } else if (this.circuit.getCountConnection(kn) === 0) {
          // case Kn alone
          this.circuit.deleteOneComponent(kn);
          return false;
        }
      }
    }
  }
}
