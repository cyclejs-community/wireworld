import {run} from '@cycle/xstream-run';
import xs from 'xstream';
import {makeDOMDriver, div} from '@cycle/dom';
import _ from 'lodash';
import diagram from 'stream-tree';

import updateGrid from './src/update';
import mouseDriver from './src/drivers/mouse-driver';
import keysDriver from './src/drivers/keys-driver';
import {EMPTY, HEAD, TAIL, CONDUCTOR} from './src/states';
const STATES = [EMPTY, HEAD, TAIL, CONDUCTOR];

const CELL_WIDTH = 30;
const CELL_HEIGHT = 30;
const CELL_BACKGROUND = {
  [EMPTY]: 'black',
  [HEAD]: 'red',
  [TAIL]: 'blue',
  [CONDUCTOR]: 'yellow'
};

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
  const background = CELL_BACKGROUND[cell];

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

function renderDrawing (drawing) {
  return (
    div('.drawing', {style: {position: 'absolute', 'z-index': 5}}, {
      0: 'Empty',
      1: 'Head',
      2: 'Tail',
      3: 'Conductor'
    }[drawing])
  );
}

function view (state) {
  return (
    div('.wireworld', [
      renderDrawing(state.drawing),

      renderGrid(state.grid)
    ])
  );
}

function debug (val) {
  return div(JSON.stringify(val));
}

function update (state) {
  return {
    ...state,

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
      ...state,

      grid: updateCell(state.grid, mousePosition, state.drawing)
    };
  };
}

function toRowColumn (position) {
  return {
    column: Math.floor(position.x / CELL_WIDTH),
    row: Math.floor(position.y / CELL_HEIGHT)
  };
}

function changeDrawingReducer (drawing) {
  return function _changeDrawingReducer (state) {
    return {
      ...state,

      drawing
    };
  };
}

function changeDrawingReducer$ (Keys, drawing) {
  return Keys.down((drawing + 1).toString()).mapTo(changeDrawingReducer(drawing));
}

const isMouseDown = diagram`
  Given: ${{xs}}

  {sources.Mouse.down$}  {sources.Mouse.up$}
            |                    |
       {.mapTo(true)}      {.mapTo(false)}
            |                    |
          down$                 up$
            |                    |
            {xs.merge(down$, up$)}
                     |
              {.startWith(false)}
                     |
                isMouseDown$
`;

const changeDrawing = diagram`
  Given: ${{STATES, changeDrawingReducer$, xs}}

  {STATES.map(state => changeDrawingReducer$(sources.Keys, state))}
                        |
                  reducerStreams
                        |
            {xs.merge(...reducerStreams)}
                        |
                  changeDrawing$
`;

const drawCell = diagram`
    Given: ${{toRowColumn, drawCellReducer, xs, isMouseDown}}

                                      {sources}
                                          |
    {sources.Mouse.positions()}     {isMouseDown}
                |                         |
        {.map(toRowColumn)}        {.isMouseDown$}
                |                         |
             position$              isMouseDown$
                |                         |
              {xs.combine(position$, isMouseDown$)}
                                |
    {.map(([position, down]) => down ? drawCellReducer(position) : null)}
                                |
                    {.filter(reducer => !!reducer)}
                                |
                            drawCell$
`;

const initialState = {
  grid: Grid({width: 30, height: 20}),
  drawing: CONDUCTOR
};

const main = diagram`
  Given ${{initialState, view, xs, update, drawCell, changeDrawing}}

           {xs.periodic(100)}            {sources}
                  |                      /       \
           {.mapTo(update)}      {drawCell}      {changeDrawing}
                  |                   |                 |
                  |             {.drawCell$}     {.changeDrawing$}
                  |                   |                 |
                update$           drawCell$        changeDrawing$
                  |                   |                 |
              {xs.merge(update$, drawCell$, changeDrawing$)}
                            |
  {.fold((state, reducer) => reducer(state), initialState)}
                            |
                       {.map(view)}
                            |
                           DOM
`;

// As a user, I want to be able to draw all the different states
// As a user, I want to see the animation flow

const drivers = {
  DOM: makeDOMDriver('.app'),
  Mouse: mouseDriver,
  Keys: keysDriver
};

run(main, drivers);
