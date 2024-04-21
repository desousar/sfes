import CircuitSolver from '../components/jsFolder/constructorComponent/CircuitSolver.js';

/**
 *
 * @param {Circuit} original
 * @param {Array} solutionArray
 * @returns number (number === 0 => success)
 */
export function unitTest(original, solutionArray) {
  let solver = new CircuitSolver();

  var projection = solver.solve(original);

  for (let i = 0; i < projection.listOfSubCircuit.length; i++) {
    projection.result[i].mtx.forEach((comp) => {
      let tempIndex = solutionArray.indexOf(parseFloat(comp[i]));
      if (tempIndex === -1) {
        return solutionArray.length;
      } else {
        solutionArray.splice(tempIndex, 1);
      }
    });
  }
  return solutionArray.length;
}
