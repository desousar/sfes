import CircuitSolver from '@/components/jsFolder/constructorComponent/CircuitSolver.js';

/**
 *
 * @param {Circuit} original
 * @param {Array of Array} solutionArray
 */
export function unitTest(original, solutionArray) {
  const solver = new CircuitSolver(original);

  const projection = solver.solve();

  for (let i = 0; i < projection.listOfSubCircuit.length; i++) {
    for (const res of projection.result[i].mtx) {
      let tempIndex = solutionArray[i].indexOf(parseFloat(res));
      if (tempIndex === -1) {
        return false;
      } else {
        solutionArray[i].splice(tempIndex, 1);
      }
    }
    if (solutionArray[i].length !== 0) {
      return false;
    }
  }
  return true;
}
