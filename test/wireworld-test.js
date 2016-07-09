/* globals describe, it */
import assert from 'assert';
import update from '../src/update';

const p = (grid) => grid.map(row => row.join(' ')).join('\n');

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

    assert.equal(p(updatedGrid), p(expectedGrid), `
Expected:
${p(expectedGrid)}

Got:
${p(updatedGrid)}
    `);
  });

  it('can simulate a clock', () => {
    const startingGrid = [
      [0, 2, 1, 0],
      [3, 0, 0, 3],
      [0, 3, 3, 0]
    ];

    const expectedGrids = [
      startingGrid,

      [
        [0, 3, 2, 0],
        [3, 0, 0, 1],
        [0, 3, 3, 0]
      ],

      [
        [0, 3, 3, 0],
        [3, 0, 0, 2],
        [0, 3, 1, 0]
      ],

      [
        [0, 3, 3, 0],
        [3, 0, 0, 3],
        [0, 1, 2, 0]
      ],

      [
        [0, 3, 3, 0],
        [1, 0, 0, 3],
        [0, 2, 3, 0]
      ],

      [
        [0, 1, 3, 0],
        [2, 0, 0, 3],
        [0, 3, 3, 0]
      ],

      startingGrid
    ];

    expectedGrids.reduce((grid, expectedGrid, step) => {
      assert.equal(p(grid), p(expectedGrid), `
Step: ${step}

Expected:
${p(expectedGrid)}

Got:
${p(grid)}
    `);

      return update(grid);
    }, startingGrid);
  });
});
