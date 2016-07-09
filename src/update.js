const STATES = {
  EMPTY: 0,
  HEAD: 1,
  TAIL: 2,
  CONDUCTOR: 3
};

const NEIGHBOUR_DIRECTIONS = [
  {column: -1, row: -1}, // NW
  {column: 0, row: -1},  // N
  {column: 1, row: -1},  // NE
  {column: 1, row: 0},   // E
  {column: 1, row: 1},   // SE
  {column: 0, row: 1},   // S
  {column: -1, row: 1},  // SW
  {column: -1, row: 0}   // W
];

function inBounds (grid, position) {
  const gridHeight = grid.length;
  const gridWidth = grid[0].length;

  const rowInBounds = 0 < position.row && position.row <= gridHeight;
  const columnInBounds = 0 < position.column && position.column <= gridWidth;

  return rowInBounds && columnInBounds;
}

function mooreNeighbours (grid, row, column) {
  const possiblePositions = NEIGHBOUR_DIRECTIONS
    .map(direction => ({row: row + direction.row, column: column + direction.column}))
    .filter(position => inBounds(grid, position));

  return possiblePositions.map(position => grid[position.row][position.column]);
}

export default function update (grid) {
  return grid.map((row, rowIndex) =>
    row.map((state, index) => {
      if (state === STATES.EMPTY) {
        return STATES.EMPTY;
      }

      if (state === STATES.HEAD) {
        return STATES.TAIL;
      }

      if (state === STATES.TAIL) {
        return STATES.CONDUCTOR;
      }

      if (state === STATES.CONDUCTOR) {
        const neighbours = mooreNeighbours(grid, rowIndex, index);

        const numbersOfNeighboursInHeadState = neighbours
          .filter(neighbourState => neighbourState === STATES.HEAD)
          .length;

        if (numbersOfNeighboursInHeadState === 1 || numbersOfNeighboursInHeadState === 2) {
          return STATES.HEAD;
        }

        return STATES.CONDUCTOR;
      }
    })
  );
}

// Given a 2d array (grid) of numbers, each representing a state
// Map each row
//  Map each state
//    If empty
//      Return empty
//
//    If head
//      Return tail
//
//    If tail
//      Return conductor
//
//    If conductor
//      If 1 or 2 neighbours are head
//        Return head
//      Else
//        Return conductor
//
