// Parse math

'use strict';

const backslash = 0x5c;
const lparen = 0x28;
const rparen = 0x29;

module.exports = function math(state, silent) {
  var max = state.posMax;
  var pos = state.pos;
  var start = state.pos;

  if (start + 2 >= max) { return false; }
  if (state.src.charCodeAt(start) !== backslash) { return false; }
  if (state.src.charCodeAt(start + 1) !== lparen) { return false; }

  pos += 2;
  let mathStart = pos;

  var found;
  while (pos < max - 1) {
    if (state.src.charCodeAt(pos) === backslash &&
        state.src.charCodeAt(pos + 1) === rparen) {
      found = true;
      break;
    }

    pos++;
  }

  if (!found) {
    return false;
  }

  // found!
  if (!silent) {
    state.push({
      type: 'math',

      startDelim: '\\(',
      endDelim: '\\)',

      content: state.src.slice(mathStart, pos)
        .replace(/[ \n]+/g, ' ')
        .trim(),

      block: false,

      level: state.level,

      start: start,
      end: pos + 2
    });
  }

  state.pos = pos + 2;
  state.posMax = max;
  return true;
};
