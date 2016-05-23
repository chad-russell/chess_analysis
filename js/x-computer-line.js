xtag.register('x-computer-line', {
	content: `<span style="display: flex; flex-direction: row; margin-bottom: 10px;">
		<button class='pure-button' style='margin-right: 5px;'>+</button>
		<p style="margin-right: 10px"><b id='evaluation'></b></p>
		<p id='moves'></p>
	</span>`,
	accessors: {
		board: {
			set: function(newValue) {
				var self = this;

				self.boardDelegate = newValue;

				var plusButton = xtag.queryChildren(self, 'span button')[0];
				plusButton.addEventListener('click', () => {
					var copyChess = new requirechess.Chess(self.boardDelegate.chess.fen());

					this.controls().selectTab(0);

					var historyMoves = self.chess.history({verbose: true}).map((move) => {
						var fuck = copyChess.move(move);
						move.fen = copyChess.fen();
						return move;
					});

					for (var i = 0; i < historyMoves.length - 1; i++) {
						historyMoves[i].next = historyMoves[i + 1];
					}
					for (var i = 1; i < historyMoves.length; i++) {
						historyMoves[i].previous = historyMoves[i - 1];
					}
					historyMoves[0].previous = self.boardDelegate.history.current.previous;

					if (!self.boardDelegate.history.current.next) {
						self.boardDelegate.history.current.next = historyMoves[0];
					}
					else {
						if (!self.boardDelegate.history.current.next.variations) {
							self.boardDelegate.history.current.next.variations = [];
						}
						self.boardDelegate.history.current.next.variations.push(historyMoves[0]);
					}

					self.boardDelegate.dispatchEvent(new Event('move'));
				});
		}
		},
		evaluation: {
			set: function(newValue) {
				var evaluation = xtag.queryChildren(this, 'span p b#evaluation')[0];
				evaluation.innerHTML = newValue;
			}
		},
		moves: {
			set: function(newValue) {
				var moves = xtag.queryChildren(this, 'span p#moves')[0];
				this.chess = newValue;
				moves.innerHTML = newValue.history().join(' ');
			}
		}
	}
});
