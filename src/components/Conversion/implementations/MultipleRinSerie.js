import ResistorJS from '@/components/jsFolder/constructorComponent/jsComponents/Resistor';

import log from '@/consoleLog';

export default class MultipleRinSerie {
  constructor(circuit) {
    // circuit will be use to update the circuit
    this.circuit = circuit;
    // circuitCopy will be used to modify the circuit locally without modifying the true circuit => see setAsVisited()
    this.circuitCopy = circuit.project();

    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    this.extremity1_pinID = undefined;
    this.extremity2_pinID = undefined;
    this.circuitAsLoop = false;
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
   * -isAllSameInstance()
   * -isInSerie()
   */
  isPossible() {
    log('---------Serie---------');
    const selectedComp_array = this.circuitCopy.getSelectedComponents();
    log('selected_array', selectedComp_array);

    return (
      this.isAllSameInstance(selectedComp_array) &&
      this.isInSerie(selectedComp_array)
    );
  }

  isAllSameInstance(selectedComp_array) {
    return selectedComp_array.every((comp) => comp instanceof ResistorJS);
  }

  /*
    on the path btw 2 R, I can have
      - 2-pins-comp
      - multi-pin-comp with MAX 2 neighbors
  */
  /*
    I will start on one R and I should access/visit all other R
    Start based on pin[0] then start based on pin[1]
 */
  isInSerie(selArray) {
    const startComp = selArray[0];
    this.circuitCopy.setAsVisited(startComp);
    this.circuitCopy.setOnPath(startComp, true);
    for (const pin of startComp.pins) {
      log('---PIN---');
      const [nComp] = this.circuitCopy.getNeighborsOfOneComp(pin);

      const explore = (nComp) => {
        log('EXPLORE', nComp?.symbol);

        if (
          !nComp ||
          (nComp.isMultiPin &&
            this.circuitCopy.getNeighborsOfOneComp(nComp.pins).length > 2)
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

  /**
   * modify value from one comp ~ keepAlive (R)
   * delete Other (R)
   */
  /*
    process for earch "to delete" R:
    1) get neighbor(s) from selected R
    2) delete selected R
    3) create wire btw both neighbors if neighbors == 2
  */
  conversion() {
    const selectedComp_array = this.circuit.getSelectedComponents();
    var sumR = 0;
    selectedComp_array.forEach((comp) => {
      sumR += comp.valueR;
    });

    let [keepAlive] = selectedComp_array.splice(0, 1);
    keepAlive.valueR = sumR;
    keepAlive.showSymbol = true;
    keepAlive.selected = false;

    selectedComp_array.forEach((component) => {
      let newWire = [undefined, undefined, undefined, undefined];
      // step 1
      const nComps = this.circuit.getNeighborsOfOneComp(component.pins);

      if (nComps.length === 2) {
        /*
          find pins
          neighborA_pinXA--deleted_R--pinXB_neighborB
        */
        newWire[0] = nComps[0];
        newWire[2] = nComps[1];

        this.circuit.wires.forEach((wire) => {
          // if something equals nComps[0].pins[0]
          if (
            (wire.from === component.pins[0] &&
              wire.to === nComps[0].pins[0]) ||
            (wire.from === component.pins[1] &&
              wire.to === nComps[0].pins[0]) ||
            (wire.to === component.pins[0] &&
              wire.from === nComps[0].pins[0]) ||
            (wire.to === component.pins[1] && wire.from === nComps[0].pins[0])
          ) {
            newWire[1] = 0;
          }
          // if something equals nComps[0].pins[1]
          if (
            (wire.from === component.pins[0] &&
              wire.to === nComps[0].pins[1]) ||
            (wire.from === component.pins[1] &&
              wire.to === nComps[0].pins[1]) ||
            (wire.to === component.pins[0] &&
              wire.from === nComps[0].pins[1]) ||
            (wire.to === component.pins[1] && wire.from === nComps[0].pins[1])
          ) {
            newWire[1] = 1;
          }

          // if something equals nComps[1].pins[0]
          if (
            (wire.from === component.pins[0] &&
              wire.to === nComps[1].pins[0]) ||
            (wire.from === component.pins[1] &&
              wire.to === nComps[1].pins[0]) ||
            (wire.to === component.pins[0] &&
              wire.from === nComps[1].pins[0]) ||
            (wire.to === component.pins[1] && wire.from === nComps[1].pins[0])
          ) {
            newWire[3] = 0;
          }
          // if something equals nComps[1].pins[1]
          if (
            (wire.from === component.pins[0] &&
              wire.to === nComps[1].pins[1]) ||
            (wire.from === component.pins[1] &&
              wire.to === nComps[1].pins[1]) ||
            (wire.to === component.pins[0] &&
              wire.from === nComps[1].pins[1]) ||
            (wire.to === component.pins[1] && wire.from === nComps[1].pins[1])
          ) {
            newWire[3] = 1;
          }
        });
      }

      //step 2
      this.circuit.deleteOneComponent(component);
      // step 3
      if (nComps.length === 2) {
        // createOneWire(compA, compAPinId, compB, compBPinId)
        this.circuit.createOneWire(...newWire);
      }
    });
  }
}
