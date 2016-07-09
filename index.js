import {run} from '@cycle/xstream-run';
import xs from 'xstream';
import {makeDOMDriver, div} from '@cycle/dom';
import _ from 'lodash';
import diagram from 'stream-tree';

import updateGrid from './src/update';
import mouseDriver from './src/drivers/mouse-driver';

const CELL_WIDTH = 30;
const CELL_HEIGHT = 30;

function Grid ({width, height}) {
  return _.range(height).map(() =>
    _.range(width).map(() => 0)
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
    div('.cell', {key: row + column, style})
  );
}

function debug (val) {
  return div(JSON.stringify(val));
}

const initialState = {
  grid: Grid({width: 30, height: 20})
};

function update (state) {
  return {
    grid: updateGrid(state.grid)
  };
}

function updateCell (grid, mousePosition, newState) {
  grid[mousePosition.row][mousePosition.column] = newState;

  return grid;
}

function drawCellReducer (mousePosition) {
  return function _drawCellReducer (state) {
    return {
      grid: updateCell(state.grid, mousePosition, 3)
    };
  };
}

function toRowColumn (position) {
  return {
    column: Math.floor(position.x / CELL_WIDTH),
    row: Math.floor(position.y / CELL_HEIGHT)
  }
}

const drawCell = diagram`
    Given: ${{toRowColumn, drawCellReducer}}

    {sources.Mouse.positions()}       {sources.Mouse.down$}
                |                               |
        {.map(toRowColumn)}                     |
                |                               |
             position$                        down$
                |                               |
  {position$.map(mousePosition => down$.mapTo(drawCellReducer(mousePosition)))}
                                |
                           {.flatten()}
                                |
                            drawCell$
`;

const main = diagram`
  Given ${{initialState, renderGrid, xs, update, drawCell}}

           {xs.periodic(100)}     {sources}
                  |                   |
           {.mapTo(update)}      {drawCell}
                  |                   |
                  |             {.drawCell$}
                  |                   |
                update$           drawCell$
                  |                   |
              {xs.merge(update$, drawCell$)}
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
  DOM: makeDOMDriver('.app'),
  Mouse: mouseDriver
};

run(main, drivers);
