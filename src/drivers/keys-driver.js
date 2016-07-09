import xs from 'xstream';
import fromEvent from 'xstream/extra/fromEvent';
import keycode from 'keycode';

export default function keysDriver () {
  return {
    down (code) {
      if (typeof code === 'string') {
        code = keycode(code);
      }

      return fromEvent(document, 'keydown')
        .filter(event => event.keyCode === code);
    }
  };
}
