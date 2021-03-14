import KnotenJS from "../jsFolder/constructorComponent/jsComponents/Knoten";
import ResistorJS from "../jsFolder/constructorComponent/jsComponents/Resistor";
import WireJS from "../jsFolder/constructorComponent/Wire.js";

export default class MultipleRinSerie {
  constructor() {
    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    this.extremity1_pinID = undefined;
    this.extremity2_pinID = undefined;
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
  isPossible(selectedComp_array, circuit) {
    let isAllSameInstance_bool = false;
    let isInSerie_bool = false;
    if (selectedComp_array.length < 2) {
      return isAllSameInstance_bool;
    } else {
      try {
        selectedComp_array.forEach((comp) => {
          comp.assertMainValue();
        });

        isAllSameInstance_bool = this.isAllSameInstance(selectedComp_array);
        isInSerie_bool = this.isInSerie(selectedComp_array, circuit);
        console.log(
          "isAllSameInstance_bool",
          isAllSameInstance_bool,
          "and isInSerie_bool",
          isInSerie_bool
        );
      } catch (e) {
        alert(e.message);
      }
    }
    return isAllSameInstance_bool && isInSerie_bool;
  }

  isAllSameInstance(selectedComp_array) {
    return selectedComp_array.every((comp) => comp instanceof ResistorJS);
  }

  isInSerie(selectedComp_array, circuit) {
    this.extremity1_comp = undefined;
    this.extremity2_comp = undefined;
    circuit.components.map((comp) => (comp.flagConversion = false));
    console.log("reset");
    let firstComp = selectedComp_array[0];
    firstComp.flagConversion = true;
    console.log(firstComp.symbol, "flagConversion = true");
    circuit.wires.forEach((w) => {
      const fromComp = circuit.componentFromPin(w.from);
      const toComp = circuit.componentFromPin(w.to);
      if (firstComp === fromComp) {
        console.log("find", firstComp.symbol, "on fromComp");
        this.nextNeighbor(circuit, fromComp, toComp);
      }
      if (firstComp === toComp) {
        console.log("find", firstComp.symbol, "on toComp");
        this.nextNeighbor(circuit, toComp, fromComp);
      }
    });
    console.log("FINISH");
    return selectedComp_array.every((comp) => comp.flagConversion === true);
  }

  getNextCompWith(circuit, comp) {
    for (let wire of circuit.wires) {
      const compFrom = circuit.componentFromPin(wire.from);
      const compTo = circuit.componentFromPin(wire.to);
      if (comp === compFrom) {
        console.log("ENTER 10:", compTo.symbol);
        if (compTo.flagConversion !== true) {
          this.nextNeighbor(circuit, compFrom, compTo);
        }
      } else if (comp === compTo) {
        console.log("ENTER 20:", compFrom.symbol);
        if (compFrom.flagConversion !== true) {
          this.nextNeighbor(circuit, compTo, compFrom);
        }
      }
    }
  }

  nextNeighbor(circuit, origin, comp) {
    console.log(comp.symbol, "is under test");
    if (comp.flagConversion === true) {
      console.log(comp.symbol, " flagConversion is already true");
      return;
    } else if (
      comp.selected ||
      (comp instanceof KnotenJS && circuit.getCountConnection(comp) === 2)
    ) {
      comp.flagConversion = true;
      console.log(comp.symbol, "flagConversion = true");
      this.getNextCompWith(circuit, comp);
    } else {
      var pinID = undefined;
      for (let wire of circuit.wires) {
        const compFrom = circuit.componentFromPin(wire.from);
        const compTo = circuit.componentFromPin(wire.to);
        if (origin === compFrom && comp === compTo) {
          pinID = circuit.pinIndexFromComponent(comp, wire.to);
        } else if (origin === compTo && comp === compFrom) {
          pinID = circuit.pinIndexFromComponent(comp, wire.from);
        }
      }

      this.extremity1_comp === undefined
        ? (this.extremity1_comp = comp)
        : (this.extremity2_comp = comp);
      this.extremity1_pinID === undefined
        ? (this.extremity1_pinID = pinID)
        : (this.extremity2_pinID = pinID);
    }
  }

  /**
   * delete old components (R)
   * add new component (R)
   */
  conversion(selectedComp_array, circuit) {
    var sumR = 0;
    selectedComp_array.forEach((comp) => {
      if (comp.flagConversion === true) {
        sumR += comp.valueR;
      }
    });

    circuit.getflagConversionComponents().forEach((component) => {
      circuit.components.forEach((comp, index) => {
        if (component === comp) {
          circuit.deleteOneComponent(component, index);
        }
      });
    });

    let newR = new ResistorJS({
      symbol: selectedComp_array[0].symbol + "SUM",
      valueLeft: selectedComp_array[0].x,
      valueTop: selectedComp_array[0].y,
      pins: [
        {
          x: selectedComp_array[0].pins[0].x,
          y: selectedComp_array[0].pins[0].y,
        },
        {
          x: selectedComp_array[0].pins[1].x,
          y: selectedComp_array[0].pins[1].y,
        },
      ],
    });
    newR.valueR = sumR;
    newR.showSymbol = true;
    newR.rotation = selectedComp_array[0].rotation;

    circuit.components.push(newR);
    if (this.extremity1_comp !== undefined) {
      let wire1 = new WireJS({
        from: this.extremity1_comp.pins[this.extremity1_pinID],
        to: newR.pins[0],
      });

      if (this.extremity1_pinID === 0) {
        this.extremity1_comp.showPin1 = false;
      } else if (this.extremity1_pinID === 1) {
        this.extremity1_comp.showPin2 = false;
      }
      newR.showPin1 = false;
      circuit.wires.push(wire1);
    }
    if (this.extremity2_comp !== undefined) {
      let wire2 = new WireJS({
        from: this.extremity2_comp.pins[this.extremity2_pinID],
        to: newR.pins[1],
      });
      if (this.extremity2_pinID === 0) {
        this.extremity2_comp.showPin1 = false;
      } else if (this.extremity2_pinID === 1) {
        this.extremity2_comp.showPin2 = false;
      }
      newR.showPin2 = false;
      circuit.wires.push(wire2);
    }
  }
}
