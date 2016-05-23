require('./x-square');
require('./x-promotion-modal');

xtag.register('x-board', {
  content: `<div id='board' style='position: relative; width: 100%; height: 100%'>
  <canvas style='position: absolute;'></canvas>
  </div>`,
  lifecycle: {
    created: function() {
      // state
      this.chess = new requirechess.Chess();
      this.flipped = false;

      // create real board
      this.boardDiv = xtag.queryChildren(this, 'div#board')[0];
      this.boardPieces = [];

      // add squares
      this.boardSquares = [];
      for (var rank = 0; rank < 8; rank++) {
        for (var file = 0; file < 8; file++) {
          var boardSquare = document.createElement('x-square');
          boardSquare.setCoordinates(7 - rank, 7 - file);
          this.boardSquares.push(boardSquare);
          this.boardDiv.appendChild(boardSquare);
        }
      }

      var root = {fen: this.chess.fen()};
      this.history = {
        root: root,
        current: root
      };

      var self = this;

      self.addEventListener('move', self.drawAnnotations);

      this.boardDiv.addEventListener('mousedown', (ev) => {
        if (ev.altKey) {
          var rank = Math.floor((ev.clientY - self.boundingRect.top)/self.boundingRect.height*8);
          var file = Math.floor((ev.clientX - self.boundingRect.left)/self.boundingRect.width*8);
          if (self.flipped) {
            annotationStart = {rank: 7 - rank, file: 7 - file};
          }
          else {
            annotationStart = {rank: rank, file: file};
          }
        }
      });

      this.boardDiv.addEventListener('mouseup', (ev) => {
        if (ev.altKey) {
          var rank = Math.floor((ev.clientY - self.boundingRect.top)/self.boundingRect.height*8);
          var file = Math.floor((ev.clientX - self.boundingRect.left)/self.boundingRect.width*8);

          if (!self.history.current) {
            return;
          }

          if (!self.history.current.rects) {
            self.history.current.rects = [];
          }
          if (!self.history.current.lines) {
            self.history.current.lines = [];
          }

          var samesies = annotationStart.rank == rank && annotationStart.file == file;
          if (self.flipped) {
            samesies = annotationStart.rank == 7 - rank && annotationStart.file == 7 - file;
          }

          if (annotationStart && !samesies) {
            var match = -1;
            for (var i = 0; i < self.history.current.lines.length; i++) {
              if (self.flipped) {
                if (self.history.current.lines[i].start.rank == annotationStart.rank && self.history.current.lines[i].start.file == annotationStart.file
                  && self.history.current.lines[i].end.rank == (7 - rank) && self.history.current.lines[i].end.file == (7 - file)) {
                    self.history.current.lines.splice(i, 1);
                    self.drawAnnotations();
                    return;
                  }
              }
              else {
                if (self.history.current.lines[i].start.rank == annotationStart.rank && self.history.current.lines[i].start.file == annotationStart.file
                  && self.history.current.lines[i].end.rank == rank && self.history.current.lines[i].end.file == file) {
                    self.history.current.lines.splice(i, 1);
                    self.drawAnnotations();
                    return;
                  }
              }
            }

						if (ev.shiftKey) {
							color = 'green';
						}
						else {
							color = 'red';
						}

            if (self.flipped) {
              self.history.current.lines.push({start: annotationStart, end: {rank: 7 - rank, file: 7 - file}, color: color});
            }
            else {
              self.history.current.lines.push({start: annotationStart, end: {rank: rank, file: file}, color: color});
            }

            self.drawAnnotations();
            return;
          }

          // toggle highlight on square
          var match = -1;
          for (var i = 0; i < self.history.current.rects.length; i++) {
            var fr = self.history.current.rects[i];
            if (self.flipped) {
              if (7 - fr.rank === rank && 7 - fr.file === file) {
                match = i;
              }
            }
            else {
              if (fr.rank === rank && fr.file === file) {
                match = i;
              }
            }
          };
          if (match !== -1) {
            self.history.current.rects.splice(match, 1);
            var squareDim = self.c.width / 8;
            self.ctx.clearRect(squareDim*file, squareDim*rank, squareDim, squareDim);
            self.drawAnnotations();
            return;
          }

          var color = undefined;
          if (ev.shiftKey) {
            color = 'green';
          }
          else {
            color = 'red';
          }

          if (self.flipped) {
            self.history.current.rects.push({rank: 7 - rank, file: 7 - file, color: color});
          }
          else {
            self.history.current.rects.push({rank: rank, file: file, color: color});
          }
          self.drawAnnotations();
        }
      });

      // add pieces
      self.loadPieces();
    }
  },
  methods: {
    drawAnnotations: function() {
      var self = this;

      // canvas
      self.boundingRect = self.boardDiv.getBoundingClientRect();
      self.c = xtag.queryChildren(this, 'div canvas')[0];
      self.c.style.zIndex = 1000;
      self.c.style.pointerEvents = 'none';
      self.c.width = self.boundingRect.width;
      self.c.height = self.boundingRect.height;

      self.ctx = self.c.getContext('2d');
      var squareDim = self.c.width / 8;

      var annotationStart = null;

      var ctx = self.ctx;
      var c = self.c;

      ctx.clearRect(0, 0, c.width, c.height);

      if (!self.history.current) {
        return;
      }
      if (!self.history.current.lines) {
        self.history.current.lines = [];
      }
      if (!self.history.current.rects) {
        self.history.current.rects = [];
      }

      self.history.current.lines.forEach((line) => {
        var startFile = line.start.file;
        var startRank = line.start.rank;
        if (self.flipped) {
          startFile = 7 - line.start.file;
          startRank = 7 - line.start.rank;
        }

        var endFile = line.end.file;
        var endRank = line.end.rank;
        if (self.flipped) {
          endFile = 7 - line.end.file;
          endRank = 7 - line.end.rank;
        }

        var fromX = squareDim*startFile + squareDim/2;
        var fromY = squareDim*startRank + squareDim/2;

        var toX = squareDim*endFile + squareDim/2;
        var toY = squareDim*endRank + squareDim/2;

				function drawArrow(fromx, fromy, tox, toy, ctx) {
					//variables to be used when creating the arrow
					var angle = Math.atan2(toy-fromy,tox-fromx);

					//starting path of the arrow from the start square to the end square and drawing the stroke
					ctx.beginPath();
          ctx.lineJoin = 'round';
          ctx.lineCap = 'round';
					ctx.moveTo(fromx, fromy);
					ctx.lineTo(tox, toy);
					ctx.lineWidth = 10;
					ctx.stroke();

					var headlen = 40;

					//starting a new path from the head of the arrow to one of the sides of the point
					ctx.beginPath();
					ctx.moveTo(tox, toy);
					ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),toy-headlen*Math.sin(angle-Math.PI/7));

					//path from the side point of the arrow, to the other side point
					ctx.moveTo(tox, toy);
					ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),toy-headlen*Math.sin(angle+Math.PI/7));

					//draws the paths created above
					ctx.stroke();
				}

				if (line.color == 'green') {
          ctx.strokeStyle = 'rgba(234, 012, 012, 0.8)';
				}
				else {
          ctx.strokeStyle = 'rgba(123, 234, 012, 0.8)';
				}

				drawArrow(fromX, fromY, toX, toY, ctx);
      });

      self.history.current.rects.forEach((fr) => {
        if (fr.color == 'green') {
          ctx.fillStyle = 'rgba(234, 012, 012, 0.5)';
        }
        else if (fr.color == 'red') {
          ctx.fillStyle = 'rgba(123, 234, 012, 0.5)';
        }
        if (self.flipped) {
          ctx.fillRect(squareDim*(7 - fr.file), squareDim*(7 - fr.rank), squareDim, squareDim);
        }
        else {
          ctx.fillRect(squareDim*fr.file, squareDim*fr.rank, squareDim, squareDim);
        }
      });
    },
    setHistory: function(move) {
      this.chess.load(move.fen);
      this.history.current = move;
      this.loadPieces();
    },
    undoMove: function() {
      if (animateSemaphor !== 0) {
        return;
      }

      var self = this;

      var undone = self.history.current;

      if (undone === null || !undone.san) {
        return;
      }

      if (self.history.current.previous) {
        self.history.current = self.history.current.previous;
        self.chess.load(self.history.current.fen);
      } else {
        self.history.current = null;
        self.chess.load(self.history.root.fen);
      }

      var fromCoordinates = coordinates(undone.to);
      var toCoordinates = coordinates(undone.from);
      var piece = self.boardPieces.filter((bp) => {
        return bp.rank == fromCoordinates.rank && bp.file == fromCoordinates.file;
      })[0];

      piece.animateCoordinates(toCoordinates.rank, toCoordinates.file, self.flipped);

      if (undone.captured !== undefined) {
        var boardPiece = document.createElement('x-piece');
        boardPiece.style.position = 'absolute';
        boardPiece.style.width = '12.5%';
        boardPiece.style.height = '12.5%';

        var replacementRank = fromCoordinates.rank;
        if (undone.flags.indexOf('e') !== -1) {
          replacementRank += (undone.color == 'w' ? 1 : -1);
        }

				boardPiece.setCoordinates(replacementRank, fromCoordinates.file, self.flipped);
        boardPiece.setPieceName((undone.color == 'w' ? 'b' : 'w')+undone.captured);
        boardPiece.style.opacity = 0;
        boardPiece.addEventListener('mousedown', (ev) => {
					if (ev.altKey) {
						return;
					}

          piece.style.zIndex = 1;
          self.dispatchEvent(new CustomEvent('pieceDrag', {'detail': boardPiece}));
        });

        self.boardPieces.push(boardPiece);
        self.boardDiv.appendChild(boardPiece);
        startAnimate();
        Velocity(boardPiece, {opacity: 1}, {
          duration: animationDuration,
          complete: endAnimate
        });
      }

      // If castling, move rook
      if (undone.flags.indexOf('k') !== -1) {
        if (undone.color == 'b') {
          // we are black; move rook from f8 to h8
          self.animatePieceMove('f8', 'h8');
        }
        else {
          // we are white; move rook from f1 to h1
          self.animatePieceMove('f1', 'h1');
        }
      }
      else if (undone.flags.indexOf('q') !== -1) {
        if (undone.color == 'b') {
          // we are black; move rook from d8 to a8
          self.animatePieceMove('d8', 'a8');
        }
        else {
          // we are white; move rook from d1 to a1
          self.animatePieceMove('d1', 'a1');
        }
      }

      // If undoing promotion, change piece back into a pawn
      if (undone.flags.indexOf('p') !== -1) {
        piece.setPieceName(undone.color+'p');
      }

      self.dispatchEvent(new Event('move'));
    },
    loadPieces: function() {
      var self = this;

      self.boardPieces.forEach((bp) => {
        bp.parentNode.removeChild(bp);
      });
      self.boardPieces = [];

      for (var rank = 0; rank < 8; rank++) {
        for (var file = 0; file < 8; file++) {
          var piece = self.chess.get(squareNames[file][rank]);
          if (piece != null) {
            var boardPiece = document.createElement('x-piece');
            boardPiece.style.position = 'absolute';
            boardPiece.style.width = '12.5%';
            boardPiece.style.height = '12.5%';
            boardPiece.setCoordinates(7 - rank, 7 - file, self.flipped);
            boardPiece.setPieceName(piece.color+piece.type);
            self.boardPieces.push(boardPiece);
            self.boardDiv.appendChild(boardPiece);
          }
        }
      }

      self.boardPieces.forEach((piece) => {
        piece.addEventListener('mousedown', (ev) => {
					if (ev.altKey) {
						return;
					}

          piece.style.zIndex = 1;
          self.dispatchEvent(new CustomEvent('pieceDrag', {'detail': piece}));
        });
      });

      self.dispatchEvent(new Event('move'));
    },
    flip: function() {
      var self = this;
      self.flipped = !self.flipped;
      self.boardPieces.forEach((bp) => {
        bp.animateCoordinates(bp.rank, bp.file, self.flipped);
      });
      self.drawAnnotations();
    },
    animatePieceMove: function(from, to) {
      var fromCoordinates = coordinates(from);
      var toCoordinates = coordinates(to);

      var target = this.boardPieces.filter((bp) => {
        return bp.rank == fromCoordinates.rank && bp.file == fromCoordinates.file;
      });

      if (target.length > 0) {
        target[0].animateCoordinates(toCoordinates.rank, toCoordinates.file, this.flipped);
      }
    },
    makeMove: function(rank, file, newRank, newFile, promotionPieceName, existingMove) {
      var self = this;

      var children = self.boardPieces.filter((bp) => {
        return bp.rank == rank && bp.file == file;
      });
      if (children.length === 0) { return; }
      var child = children[0];

      if (animateSemaphor !== 0) {
        child.animateCoordinates(rank, file, self.flipped);
        return;
      }

      var fromSquare = squareNames[7 - file][7 - rank];
      var toSquare = squareNames[7 - newFile][7 - newRank];

      var promotion = undefined;
      var promotedPieceName = undefined;

      var whitePromotion = child.name == 'wp' && newRank == 0;
      var blackPromotion = child.name == 'bp' && newRank == 7;

      function finishMakeMove(promotion) {
        if (promotion) {
          if (whitePromotion) {
            child.setPieceName('w'+promotion);
          }
          else {
            child.setPieceName('b'+promotion);
          }
        }

        if (promotion && existingMove && existingMove.promotion) {
          if (promotion !== existingMove.promotion) {
            existingMove = null;
          }
        }

        if (existingMove !== null) {
          self.chess.load(existingMove.fen);
        }

        var proposedMove = null;
        var fen = null;
        if (existingMove === null) {
          proposedMove = self.chess.move({from: fromSquare, to: toSquare, promotion: promotion});
          fen = self.chess.fen();
        }
        else {
          self.history.current = existingMove;
          proposedMove = existingMove;
          fen = proposedMove.fen;
        }

        if (proposedMove !== null) {
          proposedMove.fen = fen;

          if (self.history.root === null) {
            self.history.root = proposedMove;
            self.history.current = proposedMove;
          }
          else if (existingMove === null) {
            // appending
            if (!self.history.current.next) {
              proposedMove.previous = self.history.current;
              self.history.current.next = proposedMove;
              self.history.current = self.history.current.next;
            }
            // adding variation
            else {
              proposedMove.previous = self.history.current;
              if (self.history.current.next.variations) {
                self.history.current.next.variations.push(proposedMove);
              }
              else {
                self.history.current.next.variations = [proposedMove];
              }
              self.history.current = proposedMove;
            }
          }

          // Look for capture
          // if en passant, look at the ep square
          var capturedRank = newRank;
          if (proposedMove.flags.indexOf('e') !== -1) {
            capturedRank = capturedRank + (proposedMove.color == 'w' ? 1 : -1);
          }

          var capturedPieces = self.boardPieces.filter((piece) => {
            return piece.rank == capturedRank && piece.file == newFile;
          });
          if (capturedPieces.length > 0) {
            capturedPieces.forEach((piece) => {
              startAnimate();
              Velocity(piece, {opacity: 0}, {
                duration: animationDuration,
                complete: function() {
                  var index = self.boardPieces.indexOf(piece);
                  self.boardPieces.splice(index, 1);
                  if (piece.parentNode !== null) {
                    piece.parentNode.removeChild(piece);
                  }
                  endAnimate();
                }
              });
            });
          }

          // Snap to nearest square
          child.animateCoordinates(newRank, newFile, self.flipped);

          // If castling, move rook
          if (proposedMove.flags.indexOf('k') !== -1) {
            if (proposedMove.color == 'b') {
              // we are black; move rook from h8 to f8
              self.animatePieceMove('h8', 'f8');
            }
            else {
              // we are white; move rook from h1 to f1
              self.animatePieceMove('h1', 'f1');
            }
          }
          else if (proposedMove.flags.indexOf('q') !== -1) {
            if (proposedMove.color == 'b') {
              // we are black; move rook from a8 to d8
              self.animatePieceMove('a8', 'd8');
            }
            else {
              // we are white; move rook from a1 to d1
              self.animatePieceMove('a1', 'd1');
            }
          }
        }
        else {
          // Snap back to original square
          child.animateCoordinates(rank, file, self.flipped);
        }

        self.boardSquares.forEach((square) => {
          square.highlight(false);
        });

        self.dispatchEvent(new Event('move'));
      }

      if (promotionPieceName !== null) {
        finishMakeMove(promotionPieceName);
      }
      else if (whitePromotion || blackPromotion) {
        var dialog = document.createElement('dialog');
        dialog.style.zIndex = 100;
        dialog.style.border = '1px solid rgba(0, 0, 0, 0.3)';
        dialog.style.borderRadius = '6px';
        dialog.style.boxShadow = '0 3px 7px rgba(0, 0, 0, 0.3)';

        var modal = document.createElement('x-promotion-modal');
        modal.color = whitePromotion ? 'w' : 'b';
        modal.style.zIndex = 100

        self.appendChild(dialog);

        modal.finishCallback = (pn) => {
          dialog.close();
          dialog.parentNode.removeChild(dialog);
          finishMakeMove(pn);
        };

        dialog.appendChild(modal);
        dialog.showModal();
      }
      else {
        finishMakeMove(promotionPieceName);
      }
    },
    deleteCurrentVariation: function() {
      var target = this.history.current;
      var prev = target;
      while (target.previous.next == target) {
        target = target.previous;
        prev = target;
      }
      target = target.previous.next;
      var variationIndex = target.variations.indexOf(prev);
      target.variations.splice(variationIndex, 1);
      if (target) {
        this.setHistory(target);
      }
    },
    deleteToEndOfVariation: function() {
      this.history.current.next = undefined;
      this.history.current.variations = [];
      this.dispatchEvent(new Event('move'));
    },
    promoteVariation: function() {
      var target = this.history.current;
      var prev = target;
      while (target.previous.next == target) {
        target = target.previous;
        prev = target;
      }
      target = target.previous;

      var variations = target.next.variations;
      target.next.variations = [];
      var variationIndex = variations.indexOf(prev);
      var variation = variations[variationIndex];

      var tmp = target.next;
      target.next = variation;
      variations.splice(variationIndex, 1);
      variations.push(tmp);
      target.next.variations = variations;

      this.dispatchEvent(new Event('move'));
    }
  }
});
