exports.Engine = require('uci');

exports.startEngine = function(e) {
  return e.runProcess()
    .then(() => {
      return e.uciCommand();
    })
    .then((i) => {
      return e.isReadyCommand();
    })
    .then(() => {
      return e.uciNewGameCommand();
    })
    .fail((err) => {
    });
}

exports.setPosition = function(p, e, pos) {
  return p.then(() => {
    e.positionCommand(pos, '');
  })
  .fail((err) => {
    console.log(err);
  });
}

exports.setMultiPV = function(p, e, mpv) {
  return p.then(() => {
    e.setOptionCommand('multipv', mpv);
  })
  .fail((err) => {
    console.log(err);
  });
}

exports.startAnalysis = function(p, e, callback) {
  return p.then(() => {
    return e.goInfiniteCommand((info) => {
      // console.log(info);

      // look for 'score cp' or 'score mate'
      var scoreCPValue = null;

      var scoreCPMatch = /score cp (-?\d+)/
      var scoreCPFound = scoreCPMatch.exec(info);
      if (scoreCPFound && scoreCPFound.length > 0) {
        scoreCPValue = parseInt(scoreCPFound[0].substring('score cp '.length)) / 100.0;
      }
      else {
				var scoreMateMatch = /score mate (\d+)/
				var scoreMateFound = scoreMateMatch.exec(info);
				if (scoreMateFound && scoreMateFound.length > 0) {
					scoreCPValue = '#' + parseInt(scoreMateFound[0].substring('score mate '.length));
				}
      }

      // look for 'multipv'
      var multipvMatch = / multipv (\d+)/
      var multipvFound = multipvMatch.exec(info);
      var multipvValue = null;
      if (multipvFound && multipvFound.length > 0) {
        multipvValue = parseInt(multipvFound[0].substring(' multipv '.length));
      }

      // look for 'depth'
      var depthMatch = / depth (\d+)/
      var depthFound = depthMatch.exec(info);
      var depthValue = null;
      if (depthFound && depthFound.length > 0) {
        depthValue = parseInt(depthFound[0].substring(' depth '.length));
      }

      // look for 'pv'
      var pvMatch = / pv( [a-h][0-8][a-h][0-8][nNbBrRqQ]?)+/
      var pvFound = pvMatch.exec(info);
      var split = null;
      if (pvFound && pvFound.length > 0) {
        var pvValue = pvFound[0].substring(4)

        // split up moves
        split = pvValue.split(' ').map((v) => {
          var move = {'from': v.substring(0, 2), 'to': v.substring(2, 4)};
          if (v.length == 5) {
            move.promotion = v[4];
          }
          return move;
        });
      }

      // console.log(multipvValue, split, scoreCPValue);
      if (multipvValue && split && scoreCPValue) {
        callback(multipvValue, split, scoreCPValue, depthValue);
      }
    });
  })
  .fail((err) => {
    console.log(err);
  });
}

exports.stopAnalysis = function(p, e) {
  return p.then(() => {
    return e.stopCommand();
  })
  .then(() => {
    return e.quitCommand();
  })
  .fail((err) => {
    console.log(err);
  });
}
