import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';

import { middle3Points } from '../util/mathFunction';
import { dropComp } from '../../jsFolder/dropComponent';

export default class DreieckToStern {
  constructor() {
    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    this.extremity3_comp = undefined;
  }

  /**
   * every Conversion Class has at least 2 importants functions:
   * -isPossible()
   * -conversion()
   */

  /**
   * @param {comp with attribut selected === true} selectedComp_array
   * @param {entire object} circuit
   * @returns true if condition are met :
   * -is3SameInstance()
   * -isInDreieck()
   */
  isPossible(selectedComp_array, circuit) {
    console.log('---------DreieckToStern---------');
    let isAllSameInstance_bool = false;
    let isInDreieck_bool = false;
    isAllSameInstance_bool = this.is3SameInstance(selectedComp_array);
    if (!isAllSameInstance_bool) {
      return false;
    }
    const circuitProject = circuit.project();
    isInDreieck_bool = this.isInDreieck(circuitProject);
    return isAllSameInstance_bool && isInDreieck_bool;
  }

  is3SameInstance(selectedComp_array) {
    if (selectedComp_array.length !== 3) {
      return false;
    } else {
      return selectedComp_array.every(comp => comp instanceof ResistorJS);
    }
  }

  isInDreieck(circuit) {
    let selectedComp_array = circuit.getSelectedComponents();
    let bool_data1 = this.is2MultiPinNeighbors(circuit);
    if (!bool_data1) {
      return false;
    }
    console.log('every selC has 2 MultiPin-Comp as Ngb');
    /**
     * à partir de R[0,1,2] sur les 2 pins: simplifier Path => 1 special MultiPin autorisé
     *    L> STOP si R[autre] (renvoyer TRUE et attendre dessus) || 2ème special MultiPin ou autre 2-Pins-Comp (ne rien renvoyer)
     *        comme ça pour chaque loop de chaque pin je ressors avec TRUE ou FALSE (laisser en défaut)
     * => quand je pars d'une pin je dois arriver sur une autre pin d'un selC
     */
    console.log('control Path');
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      for (let index = 0; index < selectedComp_array.length; index++) {
        const selC = selectedComp_array[index];
        if (selC.uniqueID === fromComp.uniqueID) {
          console.log(index, 'start simplification with toComp', toComp.symbol);
          this.findPathToAll(circuit, selC, toComp);
        }
        if (selC.uniqueID === toComp.uniqueID) {
          console.log(
            index,
            'start simplification with fromComp',
            fromComp.symbol
          );
          this.findPathToAll(circuit, selC, fromComp);
        }
      }
    }
    for (let sc of selectedComp_array) {
      if (!sc.checked) {
        console.log('ERROR', sc.symbol, 'is not checked');
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

    /**
     *attribuer extrémités this.extremity1 2 3_comp
     *    L> 2 ngbs de R[0] et l'autre ngb de R[1] => comme ça sûr d'avoir 3 extrémités différentes
     */
    console.log('find extremities');
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);

      /**
       * this.extremity1_comp = undefined;
          this.extremity2_comp = undefined;
          this.extremity3_comp = undefined;
       * id = 1
       * this['extremity'+id+'_comp'] === undefined
       */

      if (selectedComp_array[0].uniqueID === fromComp.uniqueID) {
        console.log('extremity with toComp', toComp.symbol);
        if (this.extremity1_comp === undefined) {
          this.extremity1_comp = toComp;
        } else {
          this.extremity2_comp = toComp;
        }
      }
      if (selectedComp_array[0].uniqueID === toComp.uniqueID) {
        console.log('extremity with fromComp', fromComp.symbol);
        if (this.extremity1_comp === undefined) {
          this.extremity1_comp = fromComp;
        } else {
          this.extremity2_comp = fromComp;
        }
      }
    }

    let extReg = 0;
    for (let w of circuit.wires) {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);

      const deterExtr = comp => {
        if (
          comp.uniqueID === this.extremity1_comp.uniqueID ||
          comp.uniqueID === this.extremity2_comp.uniqueID
        ) {
          extReg += 1;
        } else if (this.extremity1_comp === undefined) {
          this.extremity1_comp = comp;
        } else if (this.extremity2_comp === undefined) {
          this.extremity2_comp = comp;
        } else {
          this.extremity3_comp = comp;
        }
      };

      if (selectedComp_array[1].uniqueID === fromComp.uniqueID) {
        console.log('extremity with toComp', toComp.symbol);
        deterExtr(toComp);
      }
      if (selectedComp_array[1].uniqueID === toComp.uniqueID) {
        console.log('extremity with fromComp', fromComp.symbol);
        deterExtr(fromComp);
      }
    }
    if (extReg != 1) {
      console.log('ERROR by extremity comp');
      return false;
    }

    //All 3 extremities are determined
    const tempExtr = [
      this.extremity1_comp,
      this.extremity2_comp,
      this.extremity3_comp
    ];
    tempExtr.map(e => (e.find = []));
    //chaque extremity doit être connecté à uniquement 2 selComp
    for (let extr of tempExtr) {
      for (let w of circuit.wires) {
        const fromComp = circuit.componentFromPin(w.from);
        const toComp = circuit.componentFromPin(w.to);
        if (extr.uniqueID === fromComp.uniqueID && toComp.selected) {
          extr.find.push(toComp.uniqueID);
        }
        if (extr.uniqueID === toComp.uniqueID && fromComp.selected) {
          extr.find.push(fromComp.uniqueID);
        }
      }
      if (extr.find.length !== 2 || extr.find[0] === extr.find[1]) {
        console.log('Problem With Connection', extr.symbol);
        circuit.components.map(c => (c.find = []));
        return false;
      }
      extr.find = [];
    }

    console.log('END SUCCESSFUL TEST');
    return true;
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
          console.log('find1', comp.symbol);
          if (!toComp.isMultiPin) {
            console.log('STOP1');
            return false;
          } else {
            comp.find.push(toComp.uniqueID);
          }
        }
        if (comp.uniqueID === toComp.uniqueID) {
          console.log('find2', comp.symbol);
          if (!fromComp.isMultiPin) {
            console.log('STOP2');
            return false;
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

  /**
   * @param {*} circuit
   * @param {a R} originC
   * @param {a Knoten} destC
   */
  findPathToAll(circuit, originC, destC) {
    console.log(
      'call findPathToAll, originC',
      originC.symbol,
      'and destC',
      destC.symbol
    );
    const searchExtremities = compUT => {
      //either compUT is a MultiPin or selected
      if (compUT.isMultiPin) {
        console.log('1)', compUT.symbol);
        //simplify Knoten : merge destC and compUT : originC--destC--compUT--rest => originC--destC--rest
        //WARNING can only have one special MultiPin per Path
        const result = this.fusion2NeighborsKnoten(circuit, destC, compUT);
        if (!result.bool) {
          return { bool: true };
        }
        //call nextNbs again -> after a while, it will no longer fit in this condition
        return { bool: false, newKn: result.kn };
      } else if (compUT.selected) {
        // find a R from selected array
        console.log('2)', compUT.symbol);
        let sel_array = circuit.getSelectedComponents();
        if (compUT.uniqueID === sel_array[0].uniqueID) {
          console.log('equal to 0 from sel');
          sel_array[0].checked = true;
        } else if (compUT.uniqueID === sel_array[1].uniqueID) {
          console.log('equal to 1 from sel');
          sel_array[1].checked = true;
        } else if (compUT.uniqueID === sel_array[2].uniqueID) {
          console.log('equal to 2 from sel');
          sel_array[2].checked = true;
        }
      }
      return { bool: true };
    };
    for (let w of circuit.wires) {
      const fromComp2 = circuit.componentFromPin(w.from);
      const toComp2 = circuit.componentFromPin(w.to);
      if (
        destC.uniqueID === fromComp2.uniqueID &&
        originC.uniqueID !== toComp2.uniqueID
      ) {
        let res = searchExtremities(toComp2);
        if (!res.bool) {
          this.findPathToAll(circuit, originC, res.newKn);
        }
      }
      if (
        destC.uniqueID === toComp2.uniqueID &&
        originC.uniqueID !== fromComp2.uniqueID
      ) {
        let res = searchExtremities(fromComp2);
        if (!res.bool) {
          this.findPathToAll(circuit, originC, res.newKn);
        }
      }
    }
  }

  //simplify Knoten : merge KnOne and KnTwo : originC--KnOne--KnTwo--rest => originC--KnOne--rest
  //KnOne will be/store the specialKnoten from the Path
  fusion2NeighborsKnoten(circuit, KnOne, KnTwo) {
    //transfer all connections from KnTwo to KnOne
    const transferConnections = (Kalive, Kdead) => {
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (Kdead.uniqueID === compFrom.uniqueID) {
          if (compTo.uniqueID !== Kalive.uniqueID) {
            wire.from = Kalive.pins[0];
          }
        }
        if (Kdead.uniqueID === compTo.uniqueID) {
          if (compFrom.uniqueID !== Kalive.uniqueID) {
            wire.to = Kalive.pins[0];
          }
        }
      }
      //Kdead will be destoyed
      circuit.deleteOneComponent(Kdead);
    };
    //control if the path has already a specialKnoten
    if (this.isClassicKnoten(KnOne) && this.isClassicKnoten(KnTwo)) {
      console.log(KnOne.symbol, 'is c and', KnTwo.symbol, 'is c');
      transferConnections(KnOne, KnTwo);
      return { bool: true, kn: KnOne };
    }
    if (!this.isClassicKnoten(KnOne) && this.isClassicKnoten(KnTwo)) {
      console.log(KnOne.symbol, 'is s and', KnTwo.symbol, 'is c');
      transferConnections(KnOne, KnTwo);
      return { bool: true, kn: KnOne };
    }
    if (this.isClassicKnoten(KnOne) && !this.isClassicKnoten(KnTwo)) {
      console.log(KnOne.symbol, 'is c and', KnTwo.symbol, 'is s');
      transferConnections(KnTwo, KnOne);
      return { bool: true, kn: KnTwo };
    }
    if (!this.isClassicKnoten(KnOne) && !this.isClassicKnoten(KnTwo)) {
      console.log(KnOne.symbol, 'is s and', KnTwo.symbol, 'is s');
      return { bool: false };
    }
  }

  isClassicKnoten(comp) {
    return comp instanceof KnotenJS && comp.valuePotentialSource === undefined;
  }

  conversion(selectedComp_array, circuit) {
    console.log('###CONVERSION###');
    this.isInDreieck(circuit);
    //The circuit is simplified and ready for the mathematical step

    //add centered Knoten
    let [x, y] = middle3Points(
      selectedComp_array[0],
      selectedComp_array[1],
      selectedComp_array[2]
    );
    let kn = dropComp({
      c_id: 'Knoten',
      valueLeft: x,
      valueTop: y
    });
    circuit.components.push(kn);

    console.log(
      this.extremity1_comp.symbol,
      this.extremity2_comp.symbol,
      this.extremity3_comp.symbol
    );

    let divisor = 0;
    selectedComp_array.forEach(c => {
      divisor += c.valueR;
    });
    console.log('divisor', divisor);

    circuit.components.map(c => (c.checked = undefined));
    //----- first step

    console.log('ON*', this.extremity1_comp.symbol);
    this.extremity1_comp.ngbValueR = [];
    let ext1_comp = undefined;
    let keepOne = 0;
    for (let i = circuit.wires.length - 1; i >= 0; i--) {
      let w = circuit.wires[i];
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (
        this.extremity1_comp.uniqueID === fromComp.uniqueID &&
        toComp.selected
      ) {
        const val = toComp.valueR;
        this.extremity1_comp.ngbValueR.push(val);
        keepOne += 1;
        if (keepOne === 1) {
          toComp.checked = true;
          ext1_comp = toComp;
          console.log(toComp.symbol, 'is Checked');
        } else {
          toComp.checked = false;
          console.log(toComp.symbol, 'is not Checked');
          circuit.deleteOneWire(w);
        }
      }
      if (
        this.extremity1_comp.uniqueID === toComp.uniqueID &&
        fromComp.selected
      ) {
        const val = fromComp.valueR;
        this.extremity1_comp.ngbValueR.push(val);
        keepOne += 1;
        if (keepOne === 1) {
          fromComp.checked = true;
          ext1_comp = fromComp;
          console.log(fromComp.symbol, 'is Checked');
        } else {
          fromComp.checked = false;
          console.log(fromComp.symbol, 'is not Checked');
          circuit.deleteOneWire(w);
        }
      }
    }
    console.log(
      '*data*',
      this.extremity1_comp.ngbValueR[0],
      this.extremity1_comp.ngbValueR[1],
      divisor
    );
    let dividend_ext1 =
      this.extremity1_comp.ngbValueR[0] * this.extremity1_comp.ngbValueR[1];
    var firstValueR = dividend_ext1 / divisor;

    //----- second step

    console.log('ON**', this.extremity2_comp.symbol);
    this.extremity2_comp.ngbValueR = [];
    var ext2_comp = undefined;
    for (let i = circuit.wires.length - 1; i >= 0; i--) {
      let w = circuit.wires[i];
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (
        this.extremity2_comp.uniqueID === fromComp.uniqueID &&
        toComp.selected
      ) {
        console.log('find1.1', toComp.symbol, toComp.checked);
        const val = toComp.valueR;
        this.extremity2_comp.ngbValueR.push(val);
        if (toComp.checked === true) {
          console.log(toComp.symbol, 'is already Checked');
          circuit.deleteOneWire(w);
        } else if (toComp.checked === false) {
          toComp.checked = true;
          console.log(toComp.symbol, 'is Checked');
          ext2_comp = toComp;
        } else {
          console.log('undefined');
          toComp.checked = false;
          circuit.deleteOneWire(w);
        }
      }
      if (
        this.extremity2_comp.uniqueID === toComp.uniqueID &&
        fromComp.selected
      ) {
        console.log('find1.2', fromComp.symbol, fromComp.checked);
        const val = fromComp.valueR;
        this.extremity2_comp.ngbValueR.push(val);
        if (fromComp.checked) {
          console.log(fromComp.symbol, 'is already Checked');
          circuit.deleteOneWire(w);
        } else if (fromComp.checked === false) {
          fromComp.checked = true;
          console.log(fromComp.symbol, 'is Checked');
          ext2_comp = fromComp;
        } else {
          console.log('undefined');
          fromComp.checked = false;
          circuit.deleteOneWire(w);
        }
      }
    }
    console.log(
      '*data*',
      this.extremity2_comp.ngbValueR[0],
      this.extremity2_comp.ngbValueR[1],
      divisor
    );
    let dividend_ext2 =
      this.extremity2_comp.ngbValueR[0] * this.extremity2_comp.ngbValueR[1];
    var secondValueR = dividend_ext2 / divisor;

    //----- third step

    console.log('ON***', this.extremity3_comp.symbol);
    this.extremity3_comp.ngbValueR = [];
    var ext3_comp = undefined;
    for (let i = circuit.wires.length - 1; i >= 0; i--) {
      let w = circuit.wires[i];
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (
        this.extremity3_comp.uniqueID === fromComp.uniqueID &&
        toComp.selected
      ) {
        const val = toComp.valueR;
        console.log('push', toComp.symbol, toComp.valueR);
        this.extremity3_comp.ngbValueR.push(val);
        if (toComp.checked) {
          console.log(toComp.symbol, 'is already Checked');
          circuit.deleteOneWire(w);
        } else {
          console.log(toComp.symbol, 'is Checked');
          ext3_comp = toComp;
        }
      }
      if (
        this.extremity3_comp.uniqueID === toComp.uniqueID &&
        fromComp.selected
      ) {
        const val = fromComp.valueR;
        console.log('push', fromComp.symbol, fromComp.valueR);
        this.extremity3_comp.ngbValueR.push(val);
        if (fromComp.checked) {
          console.log(fromComp.symbol, 'is already Checked');
          circuit.deleteOneWire(w);
        } else {
          console.log(fromComp.symbol, 'is Checked');
          ext3_comp = fromComp;
        }
      }
    }
    console.log(
      '*data*',
      this.extremity3_comp.ngbValueR[0],
      this.extremity3_comp.ngbValueR[1],
      divisor
    );
    let dividend_ext3 =
      this.extremity3_comp.ngbValueR[0] * this.extremity3_comp.ngbValueR[1];
    var thirdValueR = dividend_ext3 / divisor;

    ext1_comp.valueR = firstValueR;
    ext2_comp.valueR = secondValueR;
    ext3_comp.valueR = thirdValueR;

    selectedComp_array.forEach(c => {
      if (c.showPin1) {
        circuit.createOneWire(c, 0, kn, 0);
      }
      if (c.showPin2) {
        circuit.createOneWire(c, 1, kn, 0);
      }
    });
    circuit.components.map(c => (c.checked = undefined));
  }
}
