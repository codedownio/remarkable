'use strict';

module.exports = function inline(state) {
  var tokens = state.tokens, tok, i, l;

  // Parse inlines
  for (i = 0, l = tokens.length; i < l; i++) {
    tok = tokens[i];
    if (tok.type === 'inline') {
      state.inline.parse(tok.content, state.options, state.env, tok.children, tok.lines, tok.start || 0);

      if (tok.bMarks) {
        fixupTextStartEnds(tok.content, tok.bMarks, tok.children, tok.src.split("\n"));
      }
    }
  }
};

function fixupTextStartEnds(content, bMarks, children, srcLines) {
  let lines = content.split("\n");

  // Build a list of cumulative line lengths
  let cumLineLengths = [0];
  for (let i = 0; i < lines.length; i += 1) {
    // Add 1 here to account for newline at the end of each line
    // (except the final line, does it matter if we add 1 anyway?)
    cumLineLengths.push(lines[i].length + 1);
    cumLineLengths[i + 1] += cumLineLengths[i];
  }

  // Build a list of cumulative src line lengths
  let cumSrcLineLengths = [0];
  for (let i = 0; i < srcLines.length; i += 1) {
    cumSrcLineLengths.push(srcLines[i].length + 1);
    cumSrcLineLengths[i + 1] += cumSrcLineLengths[i];
  }

  // console.log("bMarks", bMarks);
  // console.log("cumLineLengths", cumLineLengths);
  // console.log("cumSrcLineLengths", cumSrcLineLengths);
  // console.log("srcLines", srcLines);

  for (let child of children) {
    if (child.type === "text") {
      // Identify the line this child's start position belongs to, and how far into the line it is
      let start = child.start;
      let lineIndex = 0;
      let newStart = 0;
      let newEnd = 0;
      // console.log("Considering start", start);
      while (lineIndex <= lines.length - 1) {
        if (cumLineLengths[lineIndex + 1] > start) {
          // console.log("Identified start", start, "as being on line", lineIndex);
          // console.log("because", cumLineLengths[lineIndex + 1], ">", start);
          newStart = start - cumLineLengths[lineIndex] + (bMarks[lineIndex] - cumSrcLineLengths[lineIndex]);
          newEnd = child.end - cumLineLengths[lineIndex] + (bMarks[lineIndex] - cumSrcLineLengths[lineIndex]);
          // console.log("newStart, newEnd", newStart, newEnd);
          break;
        } else {
          lineIndex += 1;
        }
      }

      child.start = newStart;
      child.end = newEnd;
      child.line += lineIndex;
    }
  }
}
