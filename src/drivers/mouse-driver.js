import xs from 'xstream';
import fromEvent from 'xstream/extra/fromEvent';

export default function mousePositionDriver () {
  return {
    positions () {
      return fromEvent(document, 'mousemove')
        .map(ev => {
          return {x: ev.clientX, y: ev.clientY};
        }).startWith({x: window.innerWidth / 2, y: window.innerHeight / 2});
    },

    click$: fromEvent(document, 'click'),
    down$: fromEvent(document, 'mousedown'),
    up$: fromEvent(document, 'mouseup')
  };
}
