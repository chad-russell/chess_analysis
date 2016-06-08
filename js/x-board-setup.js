require('./x-piece');
var {clipboard} = require('electron');

xtag.register('x-board-setup', {
  content: `
	<div style="display: flex; flex-direction: column; justify-content: space-around;">
		<div style="display: flex;">
	    <x-board style="position: relative; width: 400px; height: 400px;"></x-board>
			<div style="display: flex; flex-direction: column; justify-content: space-around; margin-left: 10px">
				<span>
					<p>Side to Move:</p>
					<span><input type="radio" id='white_to_move' name="gender" value="white" checked>White</span>
					<span><input type="radio" id='black_to_move' name="gender" value="black">Black</span>
				</span>

				<span><p>En Passant Square:</p><input id='ep_square'></input></span>

				<div style="display: flex; flex-direction: column">
					<p>Castling:</p>
					<span><input type="checkbox" id="white_castle_kingside">White 0-0</span>
					<span><input type="checkbox" id="white_castle_queenside">White 0-0-0</span>
					<span><input type="checkbox" id="black_castle_kingside">Black 0-0</span>
					<span><input type="checkbox" id="black_castle_queenside">Black 0-0-0</span>
				</div>
			</div>
		</div>

    <div id="dup" style="position: relative; width: 400px; height: 70px;">
      <x-piece style="position: absolute; margin-left: 0%; width: 8.33%; height: 100%" name="bp"></x-piece>
      <x-piece style="position: absolute; margin-left: 8.33%; width: 8.33%; height: 100%" name="bn"></x-piece>
      <x-piece style="position: absolute; margin-left: 16.66%; width: 8.33%; height: 100%" name="bb"></x-piece>
      <x-piece style="position: absolute; margin-left: 24.99%; width: 8.33%; height: 100%" name="br"></x-piece>
      <x-piece style="position: absolute; margin-left: 33.32%; width: 8.33%; height: 100%" name="bq"></x-piece>
      <x-piece style="position: absolute; margin-left: 41.65%; width: 8.33%; height: 100%" name="bk"></x-piece>

      <x-piece style="position: absolute; margin-left: 49.98%; width: 8.33%; height: 100%" name="wp"></x-piece>
      <x-piece style="position: absolute; margin-left: 58.31%; width: 8.33%; height: 100%" name="wn"></x-piece>
      <x-piece style="position: absolute; margin-left: 66.64%; width: 8.33%; height: 100%" name="wb"></x-piece>
      <x-piece style="position: absolute; margin-left: 74.79%; width: 8.33%; height: 100%" name="wr"></x-piece>
      <x-piece style="position: absolute; margin-left: 83.3%; width: 8.33%; height: 100%" name="wq"></x-piece>
      <x-piece style="position: absolute; margin-left: 91.63%; width: 8.33%; height: 100%" name="wk"></x-piece>
    </div>
		<button class='pure-button' id='flip'>Flip Board</button>
		<button class='pure-button' id='reset'>Reset to Start Position</button>
		<button class='pure-button' id='clear'>Clear Board</button>
    <button class='pure-button' id='fen_button'>Paste FEN</button>

    <button class='pure-button pure-button-primary' id='done'>done</button>
  </div>
  `,
  lifecycle: {
    created: function() {
      var self = this;

			self.flipped = false;

      self.board = xtag.queryChildren(self, 'div x-board')[0];
      self.board.boardDiv.style.height = '100%';
      self.board.chess.load('4k3/8/8/8/8/8/8/4K3 w - - 0 1');
      self.board.loadPieces();

			var flipButton = xtag.queryChildren(self, 'div button#flip')[0];
			flipButton.addEventListener('click', () => {
				self.flipped = !self.flipped;
				self.board.flip();
			});

			var resetButton = xtag.queryChildren(self, 'div button#reset')[0];
			resetButton.addEventListener('click', () => {
				self.board.chess = new requirechess.Chess();
				self.board.loadPieces();
        self.board.boardPieces.forEach((p) => {
          p.addEventListener('mousedown', (ev) => {
            setDragTarget(p, ev);
          });
        });
			});

			var clearButton = xtag.queryChildren(self, 'div button#clear')[0];
			clearButton.addEventListener('click', () => {
				self.board.chess.clear();
        self.board.chess.put({type: 'k', color: 'w'}, 'e1');
        self.board.chess.put({type: 'k', color: 'b'}, 'e8');
				self.board.loadPieces();
			});

      var dupPieces = [];

      var fenButton = xtag.queryChildren(self, 'div button#fen_button')[0];
      fenButton.addEventListener('click', () => {
        var clipText = clipboard.readText();

				// self.board.chess = new requirechess.Chess(fenInput.value);
        self.board.chess = new requirechess.Chess(clipText);
				self.board.loadPieces();

        self.board.boardPieces.forEach((p) => {
          p.addEventListener('mousedown', (ev) => {
            setDragTarget(p, ev);
          });
        });

				// var fenParts = fenInput.value.split(' ');
        var fenParts = clipText.split(' ');

				var whiteToMove = xtag.queryChildren(self, 'div span input#black_to_move')[0];
				var blackToMove = xtag.queryChildren(self, 'div span input#black_to_move')[0];
				var epSquare = xtag.queryChildren(self, 'div span input#ep_square')[0];
				var wkk = xtag.queryChildren(self, 'div span input#white_castle_kingside')[0];
				var wkq = xtag.queryChildren(self, 'div span input#white_castle_queenside')[0];
				var bkk = xtag.queryChildren(self, 'div span input#black_castle_kingside')[0];
				var bkq = xtag.queryChildren(self, 'div span input#black_castle_queenside')[0];

				// side to move
				var side = fenParts[1];
				if (side == 'w') {
					whiteToMove.checked = true;
					blackToMove.checked = false;
				}
				else {
					whiteToMove.checked = false;
					blackToMove.checked = true;
				}

				// castling
				var castling = fenParts[2];
				wkk.checked = castling.indexOf('K') !== -1;
				wkq.checked = castling.indexOf('Q') !== -1;
				bkk.checked = castling.indexOf('k') !== -1;
				bkq.checked = castling.indexOf('q') !== -1;

				// ep square
				var ep = fenParts[3];
				if (ep !== '-') {
					epSquare.value = ep;
				}
				else {
					epSquare.value = '';
				}
      });

      var setDragTarget = (child, mouseDownEvent) => {
        // add a new piece to the board
        var boundingRect = self.board.getBoundingClientRect();

        var boardPiece = undefined;

        if (dupPieces.indexOf(child) !== -1) {
          boardPiece = document.createElement('x-piece');
          boardPiece.style.position = 'absolute';
          boardPiece.style.width = '12.5%';
          boardPiece.style.height = '12.5%';
          boardPiece.style.marginLeft = (mouseDownEvent.clientX - boundingRect.left)/boundingRect.width * 100 - 12.5/2 +'%';
          boardPiece.style.marginTop = (mouseDownEvent.clientY - boundingRect.top)/boundingRect.width * 100 - 12.5/2 +'%';
          boardPiece.setPieceName(child.name);
          xtag.queryChildren(self.board, 'div#board')[0].appendChild(boardPiece);
        }
        else {
          boardPiece = child;
        }

        boardPiece.style.zIndex = 1;

        var onMouseMove = (ev) => {
          boardPiece.style.marginLeft = (ev.clientX - boundingRect.left)/boundingRect.width * 100 - 12.5/2 +'%';
          boardPiece.style.marginTop = (ev.clientY - boundingRect.top)/boundingRect.width * 100 - 12.5/2 +'%';

          boardPiece.rank = Math.floor((ev.clientY - boundingRect.top)/boundingRect.height*8);
          boardPiece.file = Math.floor((ev.clientX - boundingRect.left)/boundingRect.width*8);
        };
        self.addEventListener('mousemove', onMouseMove);

        var onMouseUp = (ev) => {
          self.removeEventListener('mousemove', onMouseMove);
          self.removeEventListener('mouseup', onMouseUp);

					if (boardPiece.rank > 7 || boardPiece.file > 7) {
						var index = self.board.boardPieces.indexOf(boardPiece);
						if (index !== -1) {
							self.board.boardPieces.splice(index, 1);
						}

						boardPiece.parentNode.removeChild(boardPiece);

						return;
					}

          boardPiece.style.zIndex = undefined;

					if (self.flipped) {
						boardPiece.animateCoordinates(7 - boardPiece.rank, 7 - boardPiece.file, true);
					}
					else {
						boardPiece.animateCoordinates(boardPiece.rank, boardPiece.file, false);
					}

          boardPiece.addEventListener('mousedown', (ev) => {
						if (ev.altKey) {
							return;
						}

            setDragTarget(boardPiece, ev);
          });

          if (self.board.boardPieces.indexOf(boardPiece) == -1) {
            self.board.boardPieces.push(boardPiece);
          }
        };
        self.addEventListener('mouseup', onMouseUp);
      }

      dupPieces = xtag.queryChildren(self, 'div div#dup x-piece');
      dupPieces.forEach((p) => {
        p.addEventListener('mousedown', (ev) => {
          setDragTarget(p, ev);
        });
      });

      var otherPieces = xtag.queryChildren(self, 'div x-board x-piece');
      otherPieces.forEach((p) => {
        p.addEventListener('mousedown', (ev) => {
          setDragTarget(p, ev);
        })
      });

      var doneButton = xtag.queryChildren(self, 'div button#done')[0];
      doneButton.addEventListener('click', () => {
				var newChess = new requirechess.Chess();
				newChess.clear();
				self.position().forEach((p) => {
					newChess.put({type: p.name[1], color: p.name[0]}, p.square);
				});

				var fen = newChess.fen();

				var blackToMove = xtag.queryChildren(self, 'div span input#black_to_move')[0];
				if (blackToMove.checked) {
					fenParts = fen.split(' ');
					fenParts[1] = 'b';
					fen = fenParts.join(' ');
				}

				var epSquare = xtag.queryChildren(self, 'div span input#ep_square')[0];
				if (epSquare.value !== '') {
					fenParts = fen.split(' ');
					fenParts[3] = epSquare.value;
					fen = fenParts.join(' ');
				}

				var wkk = xtag.queryChildren(self, 'div span input#white_castle_kingside')[0];
				var wkq = xtag.queryChildren(self, 'div span input#white_castle_queenside')[0];
				var bkk = xtag.queryChildren(self, 'div span input#black_castle_kingside')[0];
				var bkq = xtag.queryChildren(self, 'div span input#black_castle_queenside')[0];
				var castling = '';
				if (wkk.checked) { castling += 'K'; }
				if (wkq.checked) { castling += 'Q'; }
				if (bkk.checked) { castling += 'k'; }
				if (bkq.checked) { castling += 'q'; }
				if (castling == '') { castling = '-'; }
				fenParts = fen.split(' ');
				fenParts[2] = castling;
				fen = fenParts.join(' ');

				self.boardControls.loadFEN(fen);

        if (self.flipped !== self.boardControls.board.flipped) {
          self.boardControls.board.flip();
        }

        self.onComplete();
      });
    }
  },
  methods: {
      position: function() {
        var self = this;

        return self.board.boardPieces.map((bp) => {
          return {name: bp.name, square: squareNames[7 - bp.file][7 - bp.rank]};
        });
      }
    }
});
