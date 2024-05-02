import Wire from '@/components/jsFolder/constructorComponent/Wire';

export default function createOneWire(compA, compAPinId, compB, compBPinId) {
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
