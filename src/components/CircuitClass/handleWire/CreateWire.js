import Wire from '@/components/jsFolder/constructorComponent/Wire';

export default function createOneWire(compA, compAPinId, compB, compBPinId) {
  if (compA.uniqueID === compB.uniqueID && compAPinId === compBPinId) {
    return;
  }
  //check if Wire already exists
  for (const wire of this.wires) {
    if (
      (compA.pins[compAPinId] == wire.from &&
        compB.pins[compBPinId] == wire.to) ||
      (compA.pins[compAPinId] == wire.to && compB.pins[compBPinId] == wire.from)
    ) {
      return;
    }
  }
  const wire = new Wire({
    from: compA.pins[compAPinId],
    to: compB.pins[compBPinId]
  });
  if (compA.isMultiPin === false) {
    if (compAPinId === 0) {
      compA.showPin1 = false;
    } else if (compAPinId === 1) {
      compA.showPin2 = false;
    }
  }
  if (compB.isMultiPin === false) {
    if (compBPinId === 0) {
      compB.showPin1 = false;
    } else if (compBPinId === 1) {
      compB.showPin2 = false;
    }
  }
  this.wires.push(wire);
}
