import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';

import { dropComp } from '../../jsFolder/dropComponent';

export default class SternToStern {
  constructor() {
    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    this.extremity3_comp = undefined;
    this.extremity1_pinID = undefined;
    this.extremity2_pinID = undefined;
    this.extremity3_pinID = undefined;
    this.inside1_pinID = undefined;
    this.inside2_pinID = undefined;
    this.inside3_pinID = undefined;
    this.centralKnoten = undefined;
    // this.extremity1_comp-this.extremity1_pinID---sel_array[0](R)-this.inside1_pinID---centralKnoten
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
   * -is3SameInstance()
   * -isInStern()
   */
  isPossible(selectedComp_array, circuit) {
    console.log('---------SternToDreieck---------');
    let isAllSameInstance_bool = false;
    let isInStern_bool = false;
    isAllSameInstance_bool = this.is3SameInstance(selectedComp_array);
    if (!isAllSameInstance_bool) {
      return false;
    }
    const circuitProject = circuit.project();
    isInStern_bool = this.isInStern(circuitProject);
    return isAllSameInstance_bool && isInStern_bool;
  }

  is3SameInstance(selectedComp_array) {
    if (selectedComp_array.length !== 3) {
      return false;
    } else {
      return selectedComp_array.every(comp => comp instanceof ResistorJS);
    }
  }

  isInStern(circuit) {
    let selectedComp_array = circuit.getSelectedComponents();
    for (let c of selectedComp_array) {
      if (c.showPin1 && c.showPin2) {
        return false;
      }
      const addKnotenOnPin = pinId => {
        const kn = dropComp({
          c_id: 'Knoten',
          valueLeft: c.pins[0].x + 30,
          valueTop: c.pins[0].y + 20
        });
        circuit.components.push(kn);
        circuit.createOneWire(c, pinId, kn, 0);
        if (c === selectedComp_array[1]) {
          this.extremity2_comp = c;
          this.extremity2_pinID = pinId;
        }
        if (c === selectedComp_array[2]) {
          this.extremity3_comp = c;
          this.extremity3_pinID = pinId;
        }
      };
      if (c.showPin1) {
        addKnotenOnPin(0);
      }
      if (c.showPin2) {
        addKnotenOnPin(1);
      }
    }
    let bool_data1 = this.is2MultiPinNeighbors(circuit);
    if (!bool_data1) {
      return false;
    }
    /*-extremity Knoten neighbor structure is OK-*/
    let firstComp = selectedComp_array[0];
    selectedComp_array[0].checked = true;
    console.log('firstComp', firstComp.symbol);
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (
        firstComp.uniqueID === fromComp.uniqueID &&
        this.isClassicKnoten(toComp)
      ) {
        //firstComp = R && toComp = Knoten
        this.findPathToAll(circuit, firstComp, toComp);
      }
      if (
        firstComp.uniqueID === toComp.uniqueID &&
        this.isClassicKnoten(fromComp)
      ) {
        this.findPathToAll(circuit, firstComp, fromComp);
      }
    }
    //check if all selected comp are checked = true
    console.log('****DATA****');
    selectedComp_array[0].checked
      ? console.log(selectedComp_array[0].symbol)
      : console.log('ext1 undef');
    selectedComp_array[2].checked
      ? console.log(selectedComp_array[2].symbol)
      : console.log('ext3 undef');
    selectedComp_array[1].checked
      ? console.log(selectedComp_array[1].symbol)
      : console.log('ext2 undef');
    for (let sc of selectedComp_array) {
      if (!sc.checked) {
        selectedComp_array.map(c => (c.checked = false));
        return false;
      } else {
        sc.checked = false;
      }
    }
    //after merging all Knoten, the R must have different neighbors
    let bool_data2 = this.is2MultiPinNeighbors(circuit);
    if (!bool_data2) {
      return false;
    }
    //detect central Knoten
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);

      const isCentralKnoten = kn => {
        console.log('let me test', kn.symbol);
        //central Knoten can just have 3 connections
        if (circuit.getCountConnection(kn) !== 3) {
          return false;
        }
        //central Knoten must be connected to the 3 selected R
        const isEqualToASelectedR = c => {
          console.log('isEqualToASelectedR', c.symbol);
          if (
            c.uniqueID === selectedComp_array[0].uniqueID ||
            c.uniqueID === selectedComp_array[1].uniqueID ||
            c.uniqueID === selectedComp_array[2].uniqueID
          ) {
            return true;
          } else {
            return false;
          }
        };
        for (let w of circuit.wires) {
          const fComp = circuit.componentFromPin(w.from);
          const tComp = circuit.componentFromPin(w.to);
          if (kn.uniqueID === fComp.uniqueID) {
            if (!isEqualToASelectedR(tComp)) {
              return false;
            }
          }
          if (kn.uniqueID === tComp.uniqueID) {
            if (!isEqualToASelectedR(fComp)) {
              return false;
            }
          }
        }
        this.centralKnoten = kn;
      };
      if (selectedComp_array[0].uniqueID === fromComp.uniqueID) {
        isCentralKnoten(toComp);
      }
      if (selectedComp_array[0].uniqueID === toComp.uniqueID) {
        isCentralKnoten(fromComp);
      }
    }
    if (this.centralKnoten === undefined) {
      return false;
    }
    console.log('central Knoten', this.centralKnoten.symbol);
    /**
     * Calculate
     *      this.extremity1 2 3_comp,
     *      this.inside1 2 3_pinID,
     *      this.extremity1 2 3_pinID,
     *  this.extremity1_comp-this.extremity1_pinID---R-this.inside1_pinID---centralKnoten
     */
    for (let w of circuit.wires) {
      const fComp = circuit.componentFromPin(w.from);
      const tComp = circuit.componentFromPin(w.to);

      const find_extC_extP_insP = (selComp, selCompPin, ngb, ngbPin, id) => {
        if (this.centralKnoten.uniqueID === ngb.uniqueID) {
          this['inside' + id + '_pinID'] = circuit.pinIndexFromComponent(
            selComp,
            selCompPin
          );
        } else {
          this['extremity' + id + '_comp'] = ngb;
          this['extremity' + id + '_pinID'] = circuit.pinIndexFromComponent(
            ngb,
            ngbPin
          );
        }
      };
      for (let index = 0; index < selectedComp_array.length; index++) {
        const selC = selectedComp_array[index];
        if (selC.uniqueID === fComp.uniqueID) {
          find_extC_extP_insP(fComp, w.from, tComp, w.to, index + 1);
        }
        if (selC.uniqueID === tComp.uniqueID) {
          find_extC_extP_insP(tComp, w.to, fComp, w.from, index + 1);
        }
      }
    }
    return true;
  }

  /**
   * @param {*} circuit
   * @param {a R} originC
   * @param {a Knoten} destC
   */
  findPathToAll(circuit, originC, destC) {
    console.log('call findPathToAll');
    const searchExtremities = compUT => {
      //either compUT is a sKnoten or selected
      if (this.isClassicKnoten(compUT)) {
        console.log('1)', compUT.symbol);
        //simplify Knoten : merge destC and compUT : originC--destC--compUT--rest => originC--destC--rest
        this.fusion2NeighborsKnoten(circuit, destC, compUT);
        //call nextNbs again -> after a while, it will no longer fit in this condition
        return false;
      } else if (compUT.selected) {
        // find a R from selected array
        console.log('2)', compUT.symbol);
        let sel_array = circuit.getSelectedComponents();
        if (compUT.uniqueID === sel_array[1].uniqueID) {
          console.log('equal to 1 from sel');
          sel_array[1].checked = true;
        } else if (compUT.uniqueID === sel_array[2].uniqueID) {
          console.log('equal to 2 from sel');
          sel_array[2].checked = true;
        }
      }
      return true;
    };
    for (let w of circuit.wires) {
      const fromComp2 = circuit.componentFromPin(w.from);
      const toComp2 = circuit.componentFromPin(w.to);
      console.log(fromComp2.symbol, '-', toComp2.symbol);
      if (
        destC.uniqueID === fromComp2.uniqueID &&
        originC.uniqueID !== toComp2.uniqueID
      ) {
        let res = searchExtremities(toComp2);
        if (!res) {
          this.findPathToAll(circuit, originC, destC);
        }
      }
      if (
        destC.uniqueID === toComp2.uniqueID &&
        originC.uniqueID !== fromComp2.uniqueID
      ) {
        let res = searchExtremities(fromComp2);
        if (!res) {
          this.findPathToAll(circuit, originC, destC);
        }
      }
    }
  }

  //simplify Knoten : merge KnAlive and KnDead : originC--KnAlive--KnDead--rest => originC--KnAlive--rest
  fusion2NeighborsKnoten(circuit, KnAlive, KnDead) {
    //transfer all connections from KnDead to KnAlive
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (KnDead.uniqueID === compFrom.uniqueID) {
        if (compTo.uniqueID !== KnAlive.uniqueID) {
          wire.from = KnAlive.pins[0];
        }
      }
      if (KnDead.uniqueID === compTo.uniqueID) {
        if (compFrom.uniqueID !== KnAlive.uniqueID) {
          wire.to = KnAlive.pins[0];
        }
      }
    }
    //KnDead will be destoyed
    circuit.deleteOneComponent(KnDead);
  }

  is2MultiPinNeighbors(circuit) {
    let selArray = circuit.getSelectedComponents();
    for (let comp of selArray) {
      comp.find = [];
      console.log('comp under test', comp.symbol);
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (comp.uniqueID === fromComp.uniqueID) {
          console.log('find1', comp.symbol, 'co to ', toComp.symbol);
          if (!toComp.isMultiPin) {
            console.log('ADD Knoten one Wire1');
            this.addKnotenBtw2Comp(circuit, w, fromComp, w.from, toComp, w.to);
          } else {
            comp.find.push(toComp.uniqueID);
          }
        }
        if (comp.uniqueID === toComp.uniqueID) {
          console.log('find2', comp.symbol, 'co to ', fromComp.symbol);
          if (!fromComp.isMultiPin) {
            console.log('ADD Knoten one Wire2');
            this.addKnotenBtw2Comp(circuit, w, toComp, w.to, fromComp, w.from);
          } else {
            comp.find.push(fromComp.uniqueID);
          }
        }
      }

      if (comp.find.length !== 2 || comp.find[0] === comp.find[1]) {
        console.log('Problem With Connection', comp.symbol);
        comp.find = undefined;
        return false;
      }
      comp.find = undefined;
    }
    return true;
  }

  addKnotenBtw2Comp(circuit, w, compA, pinA, compB, pinB) {
    circuit.deleteOneWire(w);

    const pinAId = circuit.pinIndexFromComponent(compA, pinA);
    const pinBId = circuit.pinIndexFromComponent(compB, pinB);
    let kn1 = dropComp({
      c_id: 'Knoten',
      valueLeft: compA.pins[pinAId].x + 30,
      valueTop: compA.pins[pinAId].y + 20
    });
    circuit.components.push(kn1);

    circuit.createOneWire(compA, pinAId, kn1, 0);
    circuit.createOneWire(compB, pinBId, kn1, 0);
  }

  isClassicKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }

  conversion(selectedComp_array, circuit) {
    console.log('###CONVERSION###');
    this.isInStern(circuit);
    //The circuit is simplified and ready for the mathematical step

    //new valueR
    let sum = 0;
    selectedComp_array.forEach(comp => {
      sum += 1 / comp.valueR;
    });
    const divisor = 1 / sum;
    console.log('divisor', divisor);

    const dividend1 =
      selectedComp_array[0].valueR * selectedComp_array[1].valueR;
    const firstValueR = dividend1 / divisor;
    const dividend2 =
      selectedComp_array[1].valueR * selectedComp_array[2].valueR;
    const secondValueR = dividend2 / divisor;
    const dividend3 =
      selectedComp_array[2].valueR * selectedComp_array[0].valueR;
    const thirdValueR = dividend3 / divisor;

    selectedComp_array[0].valueR = firstValueR;
    selectedComp_array[1].valueR = secondValueR;
    selectedComp_array[2].valueR = thirdValueR;

    //graphical changes
    circuit.deleteOneComponent(this.centralKnoten);
    circuit.createOneWire(
      selectedComp_array[0],
      this.inside1_pinID,
      this.extremity2_comp,
      this.extremity2_pinID
    );
    circuit.createOneWire(
      selectedComp_array[1],
      this.inside2_pinID,
      this.extremity3_comp,
      this.extremity3_pinID
    );
    circuit.createOneWire(
      selectedComp_array[2],
      this.inside3_pinID,
      this.extremity1_comp,
      this.extremity1_pinID
    );
  }
}
