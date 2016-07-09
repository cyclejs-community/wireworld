/* globals describe, it */
import assert from 'assert';
import update from '../src/update';

describe('update', () => {
  it('applies the automata rules', () => {
    const grid = [
      [0, 0, 0, 0],
      [2, 1, 3, 3],
      [0, 0, 0, 0]
    ];

    const updatedGrid = update(grid);

    const expectedGrid = [
      [0, 0, 0, 0],
      [3, 2, 1, 3],
      [0, 0, 0, 0]
    ];

    const p = (grid) => grid.map(row => row.join(' ')).join('\n');

    assert.equal(p(updatedGrid), p(expectedGrid), `
Expected:
${p(expectedGrid)}

Got:
${p(updatedGrid)}
    `);
  });
});
