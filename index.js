import {run} from '@cycle/xstream-run';
import xs from 'xstream';
import {makeDOMDriver, div} from '@cycle/dom';
import _ from 'lodash';
import diagram from 'stream-tree';

import updateGrid from './src/update';

const CELL_WIDTH = 30;
const CELL_HEIGHT = 30;

function Grid ({width, height}) {
  return _.range(width).map(() =>
    _.range(height).map(() => 0)
  );
}

function renderGrid (grid) {
  return (
    div('.grid', grid.map(renderRow))
  );
}

function renderRow (row, rowIndex) {
  return (
    div('.row', row.map((cell, cellIndex) => renderCell(cell, rowIndex, cellIndex)))
  );
}

function renderCell (cell, row, column) {
  const y = row * CELL_WIDTH;
  const x = column * CELL_HEIGHT;
  const background = {
    0: 'black',
    1: 'red',
    2: 'blue',
    3: 'yellow'
  }[cell];

  const style = {
    position: 'absolute',
    transform: `translate(${x}px, ${y}px)`,
    width: CELL_WIDTH + 'px',
    height: CELL_HEIGHT + 'px',
    background
  };

  return (
    div('.cell', {style})
  );
}

function debug (val) {
  return div(JSON.stringify(val));
}

const initialState = {
  grid: Grid({width: 50, height: 30})
};

initialState.grid[5] = _.range(30).map(() => 3);
initialState.grid[5][5] = 2
initialState.grid[5][6] = 1

function update (state) {
  return {
    grid: updateGrid(state.grid)
  };
}

const main = diagram`
  Given ${{initialState, renderGrid, xs, update}}

                  {xs.periodic(100)}
                          |
                   {.mapTo(update)}
                          |
  {.fold((state, reducer) => reducer(state), initialState)}
                          |
           {.map(state => renderGrid(state.grid))}
                          |
                         DOM
`;

// As a user, I want to be able to draw all the different states
// As a user, I want to see the animation flow

const drivers = {
  DOM: makeDOMDriver('.app')
};

run(main, drivers);
