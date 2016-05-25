// string startsWith polyfill
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position){
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

exports.nagInfo = function(n) {
  switch (n) {
    case "1":
    return "!";
    case "2":
    return "?";
    case "3":
    return "!!";
    case "4":
    return "??";
    case "5":
    return "!?";
    case "6":
    return "?!";
    case "7":
    return "□";
    case "10":
    return "=";
    case "13":
    return "∞"; // unclear position
    case "14":
    return "⩲";
    case "15":
    return "⩱";
    case "16":
    return "±";
    case "17":
    return "∓";
    case "18":
    return "+ −";
    case "19":
    return "− +";
    case "22":
    return "⨀";
    case "23":
    return "⨀";
    case "36":
    return "→";
    case "37":
    return "→";
    case "40":
    return "↑";
    case "41":
    return "↑";
    case "132":
    return "⇆";
    case "133":
    return "⇆";

    default:
    return null;
  }
}

exports.nagNumber = function(nag) {
  switch (nag) {
    case "!":
    return "1";
    case "?":
    return "2";
    case "!!":
    return "3";
    case "??":
    return "4";
    case "!?":
    return "5";
    case "?!":
    return "6";
    case "□":
    return "7";
    case "=":
    return "10";
    case "∞": // unclear position
    return "13";
    case "⩲":
    return "14";
    case "⩱":
    return "15";
    case "±":
    return "16";
    case "∓":
    return "17";
    case "+ −":
    return "18";
    case "− +":
    return "19";
    case "⨀":
    return "22";
    case "⨀":
    return "23";
    case "→":
    return "36";
    case "→":
    return "37";
    case "↑":
    return "40";
    case "↑":
    return "41";
    case "⇆":
    return "132";
    case "⇆":
    return "133";

    default:
    return null;
  }
}

exports.transform = function(moves, chess) {
  var newMoves = [];

  for (var i = 0; i < moves.length; i++) {
    var rawMove = moves[i];

    var move = chess.move(rawMove.san);

    if (!move) {
      console.log(chess.ascii(), rawMove.san);
      continue;
    }

    move.comments = rawMove.comments;
    move.nag = rawMove.nag;
    move.fen = chess.fen();

    newMoves.push(move);
    if (newMoves.length > 1) {
      move.previous = newMoves[newMoves.length - 2];
      newMoves[newMoves.length - 2].next = move;
    }

    if (rawMove.variations) {
      var variations = [];
      for (var j = 0; j < rawMove.variations.length; j++) {
        chess.load(newMoves[i - 1].fen);
        var tr = exports.transform(rawMove.variations[j], chess);
        tr[0].previous = newMoves[i - 1];
        variations.push(tr[0]);
      }
      move.variations = variations;

      chess.load(move.fen);
    }
  }

  return newMoves;
}

var tokens = {
  QUOTE: 'QUOTE',
  INTEGER: 'INTEGER',
  PERIOD: 'PERIOD',
  ASTERISK: 'ASTERISK',
  LSQUARE: 'LSQUARE',
  RSQUARE: 'RSQUARE',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  NAG: 'NAG',
  SYMBOL: 'SYMBOL',
  COMMENT: 'COMMENT',
  LINECOMMENT: 'LINECOMMENT',
  RESULTWHITEWINS: 'RESULTWHITEWINS',
  RESULTBLACKWINS: 'RESULTBLACKWINS',
  RESULTDRAW: 'RESULTDRAW',
  RESULTUNKNOWN: 'RESULTUNKNOWN',
  ESCAPE: 'ESCAPE'
};

function token (type, value) {
  return {
    type: type,
    value: value
  };
}

function accept(text, ch) {
  if (text.data[0] === ch) {
    text.eat();
    return true;
  }
  return false;
}

exports.lex = function(text) {
  var str = {
    data: text,
    eat: function(n) {
      if (!n) {
        n = 1;
      }
      this.data = this.data.substring(n, this.data.length);
    }
  };

  return lexHelper(str);
}

function lexHelper(text) {
  var tokens = [];

  do {
    var nt = nextToken(text);
    if (nt) { tokens.push(nt); }
  } while (nt);

  return tokens;
}

function nextToken(text) {
  // get rid of any space
  while (text.data[0] === ' ' || text.data[0] === '\r' || text.data[0] === '\t' || text.data[0] === '\n') {
    text.eat();
  }

  // escape
  if (accept(text, '%')) {
    var content = '';
    while (!accept(text, '\n') && !accept(text, '\r')) {
      content += text.data[0];
      text.eat();
    }
    return token(tokens.ESCAPE, content);
  }

  // line comment
  if (accept(text, ';')) {
    var content = '';
    while (!accept(text, '\n') && !accept(text, '\r')) {
      content += text.data[0];
      text.eat();
    }
    return token(tokens.LINECOMMENT, content);
  }

  // game termination
  if (text.data.startsWith('1-0')) {
    text.eat('1-0'.length);
    return token(tokens.RESULTWHITEWINS, '1-0');
  }
  if (text.data.startsWith('0-1')) {
    text.eat('0-1'.length);
    return token(tokens.RESULTBLACKWINS, '1-0');
  }
  if (text.data.startsWith('1/2-1/2')) {
    text.eat('1/2-1/2'.length);
    return token(tokens.RESULTDRAW, '1-0');
  }
  if (text.data.startsWith('*')) {
    text.eat('*'.length);
    return token(tokens.RESULTUNKNOWN, '1-0');
  }

  // quote
  // TODO(chad): handle escape characters
  if (accept(text, '"')) {
    var content = '';
    while (!accept(text, '"')) {
      content += text.data[0];
      text.eat();
    }
    return token(tokens.QUOTE, content);
  }

  // comment
  if (accept(text, '{')) {
    var content = '';
    while (!accept(text, '}')) {
      content += text.data[0];
      text.eat();
    }
    return token(tokens.COMMENT, content);
  }

  // integer
  var re = new RegExp('[0-9]+');
  var intMatch = re.exec(text.data);
  if (intMatch && intMatch.length > 0 && intMatch.index === 0) {
    text.eat(intMatch[0].length);
    return token(tokens.INTEGER, intMatch[0]);
  }

  // period
  if (accept(text, '.')) {
    return token(tokens.PERIOD, '.');
  }

  // asterisk
  if (accept(text, '*')) {
    return token(tokens.ASTERISK, '*');
  }

  // lsquare
  if (accept(text, '[')) {
    return token(tokens.LSQUARE, '[');
  }

  // rsquare
  if (accept(text, ']')) {
    return token(tokens.RSQUARE, ']');
  }

  // lparen
  if (accept(text, '(')) {
    return token(tokens.LPAREN, '(');
  }

  // rparen
  if (accept(text, ')')) {
    return token(tokens.RPAREN, ')');
  }

  // nag
  if (accept(text, '$')) {
    var re = new RegExp('[0-9]+');
    var intMatch = re.exec(text.data);
    if (intMatch && intMatch.length > 0 && intMatch.index === 0) {
      text.eat(intMatch[0].length);
      return token(tokens.NAG, intMatch[0]);
    }
  }

  // nag literal
  if (accept(text, '!')) {
    return token(tokens.NAG, '1');
  }
  if (accept(text, '!!')) {
    return token(tokens.NAG, '3');
  }
  if (accept(text, '?')) {
    return token(tokens.NAG, '2');
  }
  if (accept(text, '??')) {
    return token(tokens.NAG, '4');
  }
  if (accept(text, '!?')) {
    return token(tokens.NAG, '5');
  }
  if (accept(text, '?!')) {
    return token(tokens.NAG, '6');
  }

  // symbol
  var re = new RegExp('[A-Za-z0-9][A-Za-z0-9_+#=:-]+');
  var symbolMatch = re.exec(text.data);
  if (symbolMatch && symbolMatch.length > 0 && symbolMatch.index === 0) {
    text.eat(symbolMatch[0].length);
    return token(tokens.SYMBOL, symbolMatch[0]);
  }

  // ignore anything left over
  text.eat(text.length - 1);
  // return token(tokens.RESULTUNKNOWN, '*');
  return null;
}

exports.parse = function(lexed) {
  var games = [];
  while (lexed.length > 0) {
    games.push(parseGame(lexed));
  }
  return games;
}

function parseGame(lexed) {
  // parse tag pairs
  var tagPairs = parseTagPairs(lexed);

  var result = null;

  // parse game text
  var moves = parseMoveText(lexed);

  var result = tokens.RESULTUNKNOWN;
  if (lexed[0]) {
    var result = lexed[0].type;
  }
  lexed.splice(0, 1);

  return {
    tagPairs: tagPairs,
    moves: moves,
    result: result
  };
}

function parseTagPairs(lexed) {
  var tagPairs = [];

  while (lexed[0].type === tokens.LSQUARE) {
    lexed.splice(0, 1);
    var key = lexed[0].value;
    lexed.splice(0, 1);
    var value = lexed[0].value;
    lexed.splice(0, 2);
    tagPairs.push({key: key, value: value});
  }

  return tagPairs;
}

function parseMoveText(lexed) {
  var moves = [];

  while (lexed[0] && lexed[0].type === tokens.COMMENT) {
    lexed.splice(0, 1);
  }

  while (lexed[0] && lexed[0].type === tokens.INTEGER) {
    // 1
    lexed.splice(0, 1);

    // .
    while (lexed[0] && lexed[0].type === tokens.PERIOD) {
      lexed.splice(0, 1);
    }

    // e4
    var halfMove = {san: lexed[0].value};
    lexed.splice(0, 1);

    while (lexed[0] && lexed[0].type === tokens.NAG) {
      halfMove.nag = exports.nagInfo(lexed[0].value);
      lexed.splice(0, 1);
    }

    while (lexed[0] && lexed[0].type === tokens.COMMENT) {
      if (!halfMove.comments) {
        halfMove.comments = [];
      }

      halfMove.comments.push(lexed[0].value);
      lexed.splice(0, 1);
    }

    // 1/2-1/2
    if (lexed[0] && (lexed[0].type === tokens.RESULTUNKNOWN
      || lexed[0].type === tokens.RESULTDRAW
      || lexed[0].type === tokens.RESULTWHITEWINS
      || lexed[0].type === tokens.RESULTBLACKWINS)) {
        moves.push(halfMove);
        return moves;
      }

      // variation
      while (lexed[0] && lexed[0].type === tokens.LPAREN) {
        lexed.splice(0, 1); // '('
        var variation = parseMoveText(lexed);
        if (!halfMove.variations) {
          halfMove.variations = [];
        }
        halfMove.variations.push(variation);
      }

      // ')'
      if (lexed[0] && lexed[0].type === tokens.RPAREN) {
        lexed.splice(0, 1);
        moves.push(halfMove);
        return moves;
      }

      if (lexed[0] && lexed[0].type === tokens.INTEGER) {
        moves.push(halfMove);
        continue;
      }

      // 1/2-1/2
      if (lexed[0] && (lexed[0].type === tokens.RESULTUNKNOWN
        || lexed[0].type === tokens.RESULTDRAW
        || lexed[0].type === tokens.RESULTWHITEWINS
        || lexed[0].type === tokens.RESULTBLACKWINS)) {
          moves.push(halfMove);
          return moves;
        }

        // e6
        var halfMove2 = {san: lexed[0].value};
        lexed.splice(0, 1);

        while (lexed[0] && lexed[0].type === tokens.NAG) {
          halfMove2.nag = exports.nagInfo(lexed[0].value);
          lexed.splice(0, 1);
        }

        while (lexed[0] && lexed[0].type === tokens.COMMENT) {
          if (!halfMove2.comments) {
            halfMove2.comments = [];
          }

          halfMove2.comments.push(lexed[0].value);
          lexed.splice(0, 1);
        }

        // 1/2-1/2
        if (lexed[0] && (lexed[0].type === tokens.RESULTUNKNOWN
          || lexed[0].type === tokens.RESULTDRAW
          || lexed[0].type === tokens.RESULTWHITEWINS
          || lexed[0].type === tokens.RESULTBLACKWINS)) {
            moves.push(halfMove);
            moves.push(halfMove2);
            return moves;
          }

          // variation
          while (lexed[0] && lexed[0].type === tokens.LPAREN) {
            lexed.splice(0, 1); // '('
            var variation = parseMoveText(lexed);
            if (!halfMove2.variations) {
              halfMove2.variations = [];
            }
            halfMove2.variations.push(variation);
          }

          moves.push(halfMove);
          moves.push(halfMove2);

          // ')'
          if (lexed[0] && lexed[0].type === tokens.RPAREN) {
            lexed.splice(0, 1);
            return moves;
          }
        }

        return moves;
      }

      function toStringHelper(moveNumber, move, forceMoveNumber) {
        var result = undefined;

        if (move.color == 'w') {
          result = "" + moveNumber + ". " + move.san;
        }
        else if (forceMoveNumber) {
          result = "" + moveNumber - 1 + "... " + move.san;
        }
        else {
          result = move.san;
        }

        if (move.nag) {
          result += ' $' + exports.nagNumber(move.nag);
        }

        if (move.comments) {
          move.comments.forEach(function(comment) {
            result += " {" + comment + "}";
          });
        }

        if (move.variations) {
          move.variations.forEach(function(v) {
            result += " (" + toStringHelper(moveNumber, v, true) + ")";
          });
        }

        if (move.next) {
          if (move.color == 'w') {
            moveNumber += 1;
          }
          result += " " + toStringHelper(moveNumber, move.next, false);
        }

        return result;
      }

      exports.toString = function(history) {
        var pgn = "[FEN \"" + history.root.fen + "\"]\n";

        for (var key in history.root.tags) {
          if (history.root.tags.hasOwnProperty(key) && history.root.tags[key]) {
            pgn += "[" + key + " \"" + history.root.tags[key] + "\"]\n";
          }
        }

        pgn += "\n";

        if (history.root.next) {
          pgn += toStringHelper(1, history.root.next, false);
        }

        var result = '*';
        for (var key in history.root.tags) {
          if (key == 'result') {
            result = history.root.tags[key];
          }
        }

        pgn += ' ' + result;

        return pgn;
      }
