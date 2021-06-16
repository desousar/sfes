// eslint-disable-next-line no-unused-vars
import KnotenJS from '../../jsFolder/constructorComponent/jsComponents/Knoten';
// eslint-disable-next-line no-unused-vars
import ResistorJS from '../../jsFolder/constructorComponent/jsComponents/Resistor';
// eslint-disable-next-line no-unused-vars
import VoltageSrcJS from '../../jsFolder/constructorComponent/jsComponents/VoltageSource';
// eslint-disable-next-line no-unused-vars
import CurrentSrcJS from '../../jsFolder/constructorComponent/jsComponents/CurrentSource';
// eslint-disable-next-line no-unused-vars
import WireJS from '../../jsFolder/constructorComponent/Wire.js';

// eslint-disable-next-line no-unused-vars
import { dropComp } from '../../jsFolder/dropComponent';

export default class TheveninToNorton {
  /**
   * ext1out_comp : extern extremity on VoltageSrc side (neighbor)
   * ext1out_pinID : neighbor pin on which VoltageSrc is connected
   * ext1in_maincomp : VoltageSrc
   * ext1in_pinID : VoltageSrc pin connected to ext1out_comp
   * ext1in_pinID_opposite : VoltageSrc pin connected to Resistor
   * ext2out_comp : extern extremity on Resistor side (neighbor)
   * ext2out_pinID : neighbor pin on which Resistor is connected
   * rComp : Resistor
   * ext1in_pinID_start: start pin on VoltageSrc for analysis
   */
  constructor() {
    this.ext1out_comp = undefined;
    this.ext1out_pinID = undefined;
    this.ext1in_maincomp = undefined;
    this.ext1in_pinID = undefined;
    this.ext2out_comp = undefined;
    this.ext2out_pinID = undefined;
    this.ext1in_pinID_opposite = undefined;
    this.ext1in_pinID_start = undefined;
    this.rComp = undefined;
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
  isPossible(onReal, selectedComp_array, circuit) {
    console.log('---------TheveninToNorton---------');
    let isInstanceCorrect_bool = false;
    let isInSerie_bool = false;
    if (selectedComp_array.length !== 2) {
      return false;
    } else {
      try {
        selectedComp_array.forEach(comp => {
          comp.assertMainValue();
        });
        isInstanceCorrect_bool = this.isInstanceCorrect(selectedComp_array);
        if (!isInstanceCorrect_bool) {
          return false;
        }
        isInSerie_bool = this.isInSerie(onReal, selectedComp_array, circuit);
      } catch (e) {
        alert(e.message);
      }
    }
    return isInstanceCorrect_bool && isInSerie_bool;
  }

  isInstanceCorrect(selectedComp_array) {
    let oneResistor = false;
    let oneVoltageSrc = false;
    selectedComp_array.forEach(comp => {
      if (comp instanceof ResistorJS) {
        oneResistor = true;
      }
      if (comp instanceof VoltageSrcJS) {
        oneVoltageSrc = true;
      }
    });
    return oneResistor && oneVoltageSrc;
  }

  isInSerie(onReal, selectedComp_array, circuit) {
    circuit.components.map(comp => (comp.flagConversion = false));
    for (let c of selectedComp_array) {
      if (c instanceof VoltageSrcJS) {
        this.ext1in_maincomp = c;
      } else {
        this.rComp = c;
      }
    }
    this.ext1in_maincomp.flagConversion = true;
    console.log(this.ext1in_maincomp.symbol, 'fflagConversion = true');
    circuit.wires.forEach(w => {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (this.ext1in_maincomp === fromComp) {
        console.log('find', this.ext1in_maincomp.symbol, 'on fromComp');
        console.log(
          'nbPin',
          circuit.pinIndexFromComponent(this.ext1in_maincomp, w.from)
        );
        this.ext1in_pinID_start = circuit.pinIndexFromComponent(
          this.ext1in_maincomp,
          w.from
        );
        this.nextNeighbor(circuit, fromComp, toComp);
      }
      if (this.ext1in_maincomp === toComp) {
        console.log('find', this.ext1in_maincomp.symbol, 'on toComp');
        console.log(
          'nbPin',
          circuit.pinIndexFromComponent(this.ext1in_maincomp, w.to)
        );
        this.ext1in_pinID_start = circuit.pinIndexFromComponent(
          this.ext1in_maincomp,
          w.to
        );
        this.nextNeighbor(circuit, toComp, fromComp);
      }
    });
    console.log('FINISH');
    const result = selectedComp_array.every(
      comp => comp.flagConversion === true
    );
    circuit.components.map(comp => (comp.flagConversion = false));
    if (!onReal) {
      circuit.components.map(comp => (comp.visited = false));
    }
    console.log('extremity', this.ext1out_comp, this.ext2out_comp);
    return result;
  }

  gotoNextCompWith(circuit, comp) {
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp === compFrom) {
        console.log('ENTER 10:', compTo.symbol);
        if (compTo.flagConversion !== true) {
          this.nextNeighbor(circuit, compFrom, compTo);
        } else {
          console.log('finish10');
        }
      } else if (comp === compTo) {
        console.log('ENTER 20:', compFrom.symbol);
        if (compFrom.flagConversion !== true) {
          this.nextNeighbor(circuit, compTo, compFrom);
        } else {
          console.log('finish20');
        }
      }
    }
  }
  getNextCompWith(circuit, origin, comp) {
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp === compFrom && compTo !== origin) {
        return compTo;
      }
      if (comp === compTo && compFrom !== origin) {
        return compFrom;
      }
    }
  }

  nextNeighbor(circuit, origin, comp) {
    console.log(comp.symbol, 'is under test');
    if (comp.flagConversion === true) {
      console.log(comp.symbol, ' flagConversion is already true A LOOP');
      return;
    } else if (comp.selected) {
      // Resistor found
      comp.flagConversion = true;
      console.log(comp.symbol, 'cflagConversion = true');
      console.log('co on V pin', this.ext1in_pinID_start);
      if (this.ext1in_pinID_start === 0) {
        this.ext1in_pinID = 1;
        this.ext1in_pinID_opposite = 0;
      } else {
        this.ext1in_pinID = 0;
        this.ext1in_pinID_opposite = 1;
      }
      const destination = this.getNextCompWith(circuit, origin, comp);
      if (destination) {
        console.log('destination', destination.symbol);
        destination.flagConversion = true;
      }
      circuit.components.forEach(kn => {
        if (kn.tempVisited === true) {
          console.log('is visited', kn.symbol);
          kn.visited = true;
        }
        kn.tempVisited = false;
      });
      /* I got the second comp, selected_array completed */
      let pinID = undefined;
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (comp === compFrom && destination === compTo) {
          pinID = circuit.pinIndexFromComponent(destination, wire.to);
        } else if (comp === compTo && destination === compFrom) {
          pinID = circuit.pinIndexFromComponent(destination, wire.from);
        }
      }
      this.ext2out_comp = destination;
      this.ext2out_pinID = pinID;
    } else if (
      comp instanceof KnotenJS &&
      circuit.getCountConnection(comp) === 2 &&
      comp.valuePotentialSource === undefined
    ) {
      comp.flagConversion = true;
      comp.tempVisited = true;
      console.log(comp.symbol, 'kflagConversion = true');
      this.gotoNextCompWith(circuit, comp);
    } else {
      console.log('this is an extremity');
      circuit.components.map(c => (c.tempVisited = false));
      let pinID = undefined;
      let extremity = undefined;
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (
          this.ext1in_maincomp === compFrom &&
          circuit.pinIndexFromComponent(this.ext1in_maincomp, wire.from) ===
            this.ext1in_pinID_start
        ) {
          pinID = circuit.pinIndexFromComponent(compTo, wire.to);
          extremity = compTo;
        } else if (
          this.ext1in_maincomp === compTo &&
          circuit.pinIndexFromComponent(this.ext1in_maincomp, wire.to) ===
            this.ext1in_pinID_start
        ) {
          pinID = circuit.pinIndexFromComponent(comp, wire.from);
          extremity = compFrom;
        }
      }
      this.ext1out_comp = extremity;
      this.ext1out_pinID = pinID;
    }
  }

  conversion(circuit) {
    // delete Knoten btw VoltageSrc and Resistor
    for (var i = circuit.components.length - 1; i >= 0; i--) {
      let kn = circuit.components[i];
      if (kn.visited) {
        console.log(kn.symbol);
        circuit.deleteOneComponent(kn);
      }
    }
    //delete VoltageSrc
    const valueUq = this.ext1in_maincomp.valueU;
    const dirU = this.ext1in_maincomp.directionU;
    const dirI = this.ext1in_maincomp.directionI;
    circuit.deleteOneComponent(this.ext1in_maincomp);
    // delete wire from Resistor
    circuit.wires.forEach((wire, index) => {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (this.rComp === compFrom || this.rComp === compTo) {
        circuit.deleteOneWire(wire, index);
      }
    });
    this.rComp.selected = false;

    let csrc = dropComp({
      c_id: 'CurrentSource',
      valueLeft: this.ext1in_maincomp.x,
      valueTop: this.ext1in_maincomp.y
    });
    dirU === 0 ? (csrc.directionU = 0) : (csrc.directionU = 1);
    dirI === 0 ? (csrc.directionI = 0) : (csrc.directionI = 1);
    csrc.valueI = valueUq / this.rComp.valueR;
    circuit.components.push(csrc);

    let kn1 = dropComp({
      c_id: 'Knoten',
      valueLeft: this.ext1in_maincomp.pins[0].x + 30,
      valueTop: this.ext1in_maincomp.pins[0].y + 20
    });
    circuit.components.push(kn1);
    let kn2 = dropComp({
      c_id: 'Knoten',
      valueLeft: this.ext1in_maincomp.pins[1].x + 30,
      valueTop: this.ext1in_maincomp.pins[1].y + 20
    });
    circuit.components.push(kn2);
    this.create1Wire(circuit, csrc, this.ext1in_pinID, kn1, 0);
    this.create1Wire(circuit, csrc, this.ext1in_pinID_opposite, kn2, 0);

    this.create1Wire(circuit, this.rComp, 0, kn1, 0);
    this.create1Wire(circuit, this.rComp, 1, kn2, 0);

    if (this.ext1out_comp) {
      //same Knoten as (csrc, this.ext1in_pinID)
      this.create1Wire(circuit, this.ext1out_comp, this.ext1out_pinID, kn1, 0);
    }
    if (this.ext2out_comp) {
      //same Knoten as (csrc, this.ext1in_pinID_opposite)
      this.create1Wire(circuit, this.ext2out_comp, this.ext2out_pinID, kn2, 0);
    }
  }

  create1Wire(circuit, extremity, extPinId, newR, newRPinId) {
    const wire = new WireJS({
      from: extremity.pins[extPinId],
      to: newR.pins[newRPinId]
    });
    if (extremity.isMultiPin === false) {
      if (extPinId === 0) {
        extremity.showPin1 = false;
      } else if (extPinId === 1) {
        extremity.showPin2 = false;
      }
    }
    if (newRPinId === 0) {
      newR.showPin1 = false;
    } else if (newRPinId === 1) {
      newR.showPin2 = false;
    }
    circuit.wires.push(wire);
  }
}
