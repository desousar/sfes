import Component from '@/components/jsFolder/constructorComponent/Component.js';

import log from '@/consoleLog';

/*-------------------StepA: KnotenGleichungen----------------------*/
function knotenEquation(nb) {
  //by KnotenEquation all equations are always equal to 0, thus the default value for matrix b
  let rowCounter = 0;
  this.listOfSubCircuit[nb].forEach((comp) => {
    if (comp.isMultiPin) {
      if (comp.valuePotentialSource !== undefined) {
        let indexI = comp.addValueIinListModelANDgetIndex(this.listModel, nb);
        this.A[nb].set(rowCounter, indexI, -1);
      }
      for (let wire of this.wires) {
        const compFrom = this.componentFromPinInSubC(wire.from, nb);
        const compTo = this.componentFromPinInSubC(wire.to, nb);
        if (compFrom && compTo) {
          if (comp.uniqueID === compFrom.uniqueID) {
            const pinTo = this.pinIndexFromComponent(compTo, wire.to);
            let indexI = compTo.addValueIinListModelANDgetIndex(
              this.listModel,
              nb
            );
            if (pinTo === 0) {
              if (compTo.directionI === Component.PIN0_TO_PIN1) {
                this.A[nb].set(rowCounter, indexI, -1); //-1*valueI
              } else if (compTo.directionI === Component.PIN1_TO_PIN0) {
                this.A[nb].set(rowCounter, indexI, 1); //+1*valueI
              }
            } else if (pinTo === 1) {
              if (compTo.directionI === Component.PIN0_TO_PIN1) {
                this.A[nb].set(rowCounter, indexI, 1); //+1*valueI
              } else if (compTo.directionI === Component.PIN1_TO_PIN0) {
                this.A[nb].set(rowCounter, indexI, -1); //-1*valueI
              }
            }
          }
          if (comp.uniqueID === compTo.uniqueID) {
            const pinFrom = this.pinIndexFromComponent(compFrom, wire.from);
            let indexI = compFrom.addValueIinListModelANDgetIndex(
              this.listModel,
              nb
            );
            if (pinFrom === 0) {
              if (compFrom.directionI === Component.PIN0_TO_PIN1) {
                this.A[nb].set(rowCounter, indexI, -1); //-1*valueI
              } else if (compFrom.directionI === Component.PIN1_TO_PIN0) {
                this.A[nb].set(rowCounter, indexI, 1); //+1*valueI
              }
            } else if (pinFrom === 1) {
              if (compFrom.directionI === Component.PIN0_TO_PIN1) {
                this.A[nb].set(rowCounter, indexI, 1); //+1*valueI
              } else if (compFrom.directionI === Component.PIN1_TO_PIN0) {
                this.A[nb].set(rowCounter, indexI, -1); //-1*valueI
              }
            }
          }
        }
      }
      rowCounter++;
    }
  });
  this.A[nb].print('A');
  this.b[nb].print('b');
}
/*-------------------StepB: BauteilGleichungen----------------------*/
function bauteilEquation(nb) {
  const { countMultiPin } = this.getNumberMultiPin_and_2PinsComp(nb);
  let rowCounter = countMultiPin;
  log(nb, this.listOfSubCircuit);
  this.listOfSubCircuit[nb].forEach((comp) => {
    if (!comp.isMultiPin || comp.valuePotentialSource !== undefined) {
      comp.bauteilEqu(this.A, this.b, this.listModel, nb, rowCounter);
      rowCounter++;
    }
  });
  this.A[nb].print('A');
  this.b[nb].print('b');
}
/*-------------------StepC: PotenzialGleichungen----------------------*/
function potenzialEquation(nb) {
  const { countMultiPin, count2Pins } =
    this.getNumberMultiPin_and_2PinsComp(nb);
  let rowCounter = countMultiPin + count2Pins;
  this.listOfSubCircuit[nb].forEach((comp) => {
    if (!comp.isMultiPin || comp.valuePotentialSource !== undefined) {
      if (comp.valuePotentialSource !== undefined) {
        //U+(-1)*valuePHI=(-1)*valuePotential
        let indexU = comp.addValueUinListModelANDgetIndex(this.listModel, nb);
        this.A[nb].set(rowCounter, indexU, 1); //-> 1*U
        let indexPHI = comp.addValuePHIinListModelANDgetIndex(
          this.listModel,
          nb
        );
        this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*valuePHI
        this.b[nb].set(rowCounter, 0, -1 * comp.valuePotentialSource); //-> -1*value of src
        rowCounter++;
      } else {
        //if directionU = 0     => 1*U  + (-1)*kOFpin[0] + 1*kOFpin[1]
        //if directionU = 1     => 1*U  + (-1)*kOFpin[1] + 1*kOFpin[0]
        let indexU = comp.addValueUinListModelANDgetIndex(this.listModel, nb);
        this.A[nb].set(rowCounter, indexU, 1); //-> 1*U
        for (let wire of this.wires) {
          const compFrom = this.componentFromPinInSubC(wire.from, nb);
          const compTo = this.componentFromPinInSubC(wire.to, nb);
          if (compFrom && compTo) {
            if (comp.uniqueID === compFrom.uniqueID) {
              let indexPHI = compTo.addValuePHIinListModelANDgetIndex(
                this.listModel,
                nb
              );
              if (comp.pins[0] === wire.from) {
                //Knoten connected on comp.pin[0]
                if (comp.directionU === Component.PIN0_TO_PIN1) {
                  this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*kOFpin[0]
                } else if (comp.directionU === Component.PIN1_TO_PIN0) {
                  this.A[nb].set(rowCounter, indexPHI, 1); //-> 1*kOFpin[0]
                }
              } else if (comp.pins[1] === wire.from) {
                //Knoten connected on comp.pin[1]
                if (comp.directionU === Component.PIN0_TO_PIN1) {
                  this.A[nb].set(rowCounter, indexPHI, 1); //-> 1*kOFpin[0]
                } else if (comp.directionU === Component.PIN1_TO_PIN0) {
                  this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*kOFpin[0]
                }
              }
            }
            if (comp.uniqueID === compTo.uniqueID) {
              let indexPHI = compFrom.addValuePHIinListModelANDgetIndex(
                this.listModel,
                nb
              );
              if (comp.pins[0] === wire.to) {
                //Knoten connected on comp.pin[0]
                if (comp.directionU === Component.PIN0_TO_PIN1) {
                  this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*kOFpin[0]
                } else if (comp.directionU === Component.PIN1_TO_PIN0) {
                  this.A[nb].set(rowCounter, indexPHI, 1); //-> 1*kOFpin[0]
                }
              } else if (comp.pins[1] === wire.to) {
                //Knoten connected on comp.pin[1]
                if (comp.directionU === Component.PIN0_TO_PIN1) {
                  this.A[nb].set(rowCounter, indexPHI, 1); //-> 1*kOFpin[0]
                } else if (comp.directionU === Component.PIN1_TO_PIN0) {
                  this.A[nb].set(rowCounter, indexPHI, -1); //-> (-1)*kOFpin[0]
                }
              }
            }
          }
        }
        rowCounter++;
      }
    }
  });
  this.A[nb].print('A');
  this.b[nb].print('b');
}

export { knotenEquation, bauteilEquation, potenzialEquation };
