require('./x-moves');
require('./x-computer-line');
require('./x-splitbox');

const {ipcRenderer} = require('electron');
var pgn = require('./pgn');

xtag.register('x-nag', {
	content: `<button class='pure-button'></button>`,
	lifecycle: {
		created: function() {
			var nagValue = this.getAttribute('nag');

			var button = xtag.queryChildren(this, 'button')[0];
			button.innerHTML = pgn.nagInfo(nagValue);
			button.addEventListener('click', () => {
				this.board.history.current.nag = pgn.nagInfo(nagValue);
				this.board.dispatchEvent(new Event('move'));
			});
		}
	}
});

xtag.register('x-database', {
	content: `
	<table class='pure-table pure-table-bordered' style='width: 100%'>
	<thead>
	<tr>
	<th>White</th>
	<th>Black</th>
	<th>Result</th>
	</tr>
	</thead>
	<tbody>
	</tbody>
	</table>
	<h3>Go to 'game' > 'Import PGN' in the menu to import a pgn database</h3>
	`,
	lifecycle: {
		created: function() {
			this.body = xtag.queryChildren(this, 'table tbody')[0];
			xtag.queryChildren(this, 'table')[0].style.display = 'none';
		}
	},
	accessors: {
		selectedRow: {
			set: function(newValue) {
				this._selectedRow = newValue;
				var rows = xtag.queryChildren(this, 'table tbody tr');
				rows.forEach((row) => {
					if (row == newValue) {
						row.style.backgroundColor = '#ABD';
					}
					else {
						row.style.backgroundColor = '';
					}
				});
			},
			get: function() {
				return this._selectedRow;
			}
		},
		games: {
			set: function(newValue) {
				xtag.queryChildren(this, 'table')[0].style.display = 'table';
				xtag.queryChildren(this, 'h3')[0].style.display = 'none';

				this.body.innerHTML = '';

				this._games = newValue;
				this._rows = [];

				newValue.forEach((game, index) => {
					var parsed = game;

					var row = document.createElement('tr');
					this._rows.push(row);
					row.game = game;
					var whiteTd = document.createElement('td');
					var blackTd = document.createElement('td');
					var resultTd = document.createElement('td');

					var whiteTag = parsed.tagPairs.filter((tp) => {
						return tp.key.toLowerCase() == 'WHITE'.toLowerCase();
					});
					if (whiteTag.length > 0) {
						whiteTd.innerHTML = whiteTag[0].value;
					}
					else {
						whiteTd.innerHTML = 'Unknown';
					}

					var blackTag = parsed.tagPairs.filter((tp) => {
						return tp.key.toLowerCase() == 'BLACK'.toLowerCase();
					});
					if (blackTag.length > 0) {
						blackTd.innerHTML = blackTag[0].value;
					}
					else {
						blackTd.innerHTML = 'Unknown';
					}

					var resultTag = parsed.tagPairs.filter((tp) => {
						return tp.key.toLowerCase() == 'RESULT'.toLowerCase();
					});
					if (resultTag.length > 0) {
						resultTd.innerHTML = resultTag[0].value;
					}
					else {
						resultTd.innerHTML = '*';
					}

					row.appendChild(whiteTd);
					row.appendChild(blackTd);
					row.appendChild(resultTd);

					var eventTag = parsed.tagPairs.filter((tp) => {
						return tp.key.toLowerCase() == 'EVENT'.toLowerCase();
					});

					var dateTag = parsed.tagPairs.filter((tp) => {
						return tp.key.toLowerCase() == 'DATE'.toLowerCase();
					});

					var siteTag = parsed.tagPairs.filter((tp) => {
						return tp.key.toLowerCase() == 'SITE'.toLowerCase();
					});

					var roundTag = parsed.tagPairs.filter((tp) => {
						return tp.key.toLowerCase() == 'ROUND'.toLowerCase();
					});

					var ecoTag = parsed.tagPairs.filter((tp) => {
						return tp.key.toLowerCase() == 'ECO'.toLowerCase();
					});

					this.body.appendChild(row);

					row.pgnText = () => {
						var chess = undefined;

						var throwawayFENs = parsed.tagPairs.filter((tp) => {
							return tp.key.toLowerCase() == 'FEN'.toLowerCase();
						});

						if (throwawayFENs.length > 0) {
							chess = new requirechess.Chess(throwawayFENs[0].value);
						}
						else {
							chess = new requirechess.Chess();
						}
						var throwawayFEN = chess.fen();

						var transformed = pgn.transform(parsed.moves, chess);
						transformed[0].previous = {
							fen: throwawayFEN,
							next: transformed[0],
						};

						transformed[0].previous.tags = {};

						if (whiteTag.length > 0) {
							transformed[0].previous.tags.white = whiteTag[0].value;
						}
						if (blackTag.length > 0) {
							transformed[0].previous.tags.black = blackTag[0].value;
						}
						if (eventTag.length > 0) {
							transformed[0].previous.tags.event = eventTag[0].value;
						}
						if (dateTag.length > 0) {
							transformed[0].previous.tags.date = dateTag[0].value;
						}
						if (resultTag.length > 0) {
							transformed[0].previous.tags.result = resultTag[0].value;
						}
						if (roundTag.length > 0) {
							transformed[0].previous.tags.round = roundTag[0].value;
						}
						if (siteTag.length > 0) {
							transformed[0].previous.tags.site = siteTag[0].value;
						}
						if (ecoTag.length > 0) {
							transformed[0].previous.tags.eco = ecoTag[0].value;
						}

						var history = {
							root: transformed[0].previous,
							current: transformed[0].previous
						};

						return pgn.toString(history);
					}

					row.select = () => {
						var chess = undefined;

						var throwawayFENs = parsed.tagPairs.filter((tp) => {
							return tp.key.toLowerCase() == 'FEN'.toLowerCase();
						});

						if (throwawayFENs.length > 0) {
							chess = new requirechess.Chess(throwawayFENs[0].value);
						}
						else {
							chess = new requirechess.Chess();
						}
						var throwawayFEN = chess.fen();

						this.selectedRow = row;

						this.controls.selectTab(0);

						var transformed = pgn.transform(parsed.moves, chess);
						board.chess = chess;
						transformed[0].previous = {
							fen: throwawayFEN,
							next: transformed[0],
						};

						transformed[0].previous.tags = {};

						if (whiteTag.length > 0) {
							transformed[0].previous.tags.white = whiteTag[0].value;
						}
						if (blackTag.length > 0) {
							transformed[0].previous.tags.black = blackTag[0].value;
						}
						if (eventTag.length > 0) {
							transformed[0].previous.tags.event = eventTag[0].value;
						}
						if (dateTag.length > 0) {
							transformed[0].previous.tags.date = dateTag[0].value;
						}
						if (resultTag.length > 0) {
							transformed[0].previous.tags.result = resultTag[0].value;
						}
						if (roundTag.length > 0) {
							transformed[0].previous.tags.round = roundTag[0].value;
						}
						if (siteTag.length > 0) {
							transformed[0].previous.tags.site = siteTag[0].value;
						}
						if (ecoTag.length > 0) {
							transformed[0].previous.tags.eco = ecoTag[0].value;
						}

						var b = board();
						b.history.current = b.history.root = transformed[0].previous;
						b.chess.load(b.history.root.fen);
						b.loadPieces();
					};

					row.addEventListener('click', () => row.select());
				});
			}
		}
	}
});

xtag.register('x-color-dialog', {
	content: `
	<dialog>
		<div style='display: flex; flex-direction: column;'>
			<span style='display: flex;'>
				<p>Light Squares</p>
			<input type='color' style='margin-left: 10px;' id='light-color'/>
			</span>
			<span style='display: flex;'>
				<p>Dark Square</p>
				<input type='color' style='margin-left: 10px;' id='dark-color'/>
			</span>
			<button class='pure-button pure-button-primary' id='done-button' style='margin-top: 10px;'>Done</button>
			<button class='pure-button' id='cancel-button' style='margin-top: 10px;'>Cancel</button>
		</div>
	</dialog>
	`,
	lifecycle: {
		created: function() {
			this.dialog = xtag.queryChildren(this, 'dialog')[0];
			this.lightColor = xtag.queryChildren(this, 'dialog div span input#light-color')[0];
			this.darkColor = xtag.queryChildren(this, 'dialog div span input#dark-color')[0];

			var doneButton = xtag.queryChildren(this, 'dialog div button#done-button')[0];
			var cancelButton = xtag.queryChildren(this, 'dialog div button#cancel-button')[0];

			this.lightColor.value = getLight();
			this.darkColor.value = getDark();

			var startLight = this.lightColor.value;
			var startDark = this.darkColor.value;

			this.lightColor.addEventListener('change', () => {
				settings.set('LIGHT', this.lightColor.value);
				this.dispatchEvent(new Event('colorsChosen'));
			});
			this.darkColor.addEventListener('change', () => {
				settings.set('DARK', this.darkColor.value);
				this.dispatchEvent(new Event('colorsChosen'));
			});

			doneButton.addEventListener('click', () => {
				this.dispatchEvent(new Event('colorsChosen'));
				this.dispatchEvent(new Event('close'));
			});
			cancelButton.addEventListener('click', () => {
				settings.set('LIGHT', startLight);
				settings.set('DARK', startDark);
				this.dispatchEvent(new Event('colorsChosen'));
				this.dispatchEvent(new Event('close'));
			});
		}
	},
	methods: 	{
		light: function() {
				return this.lightColor.value;
		},
		dark: function() {
				return this.darkColor.value;
		},
		showModal: function() {
			this.dialog.showModal();
		},
		close: function() {
			this.dialog.close();
		}
	}
});

xtag.register('x-board-controls', {
	content: `
	<div style="display: flex; flex-direction: row; height: 100vh; max-height: 100vh;">

		<x-splitbox style="width: 100%;">
		<section id='left' style='flex: 0 0 40%;'>
			<x-board id='board'></x-board>
		</section>

		<div splitter></div>

		<section id='right' style='flex-grow: 1'>
		<x-tabbox tab-position='top' selected-index='0' transition style='flex-grow: 1; width: 100%; height: 100%;'>
			<menu>
				<button class='pure-button'>Moves</button>
				<button class='pure-button'>Computer Lines</button>
				<button class='pure-button'>Database</button>
			</menu>
			<ul>
				<li style='display: flex; flex-direction: column;'>
					<x-moves id='moves' style="flex-wrap: wrap; flex-grow: 1; overflow: none"></x-moves>
					<div style='display: flex; align-self: flex-end; margin-right: auto; justify-content: space-between; width: 100%;'>
						<x-nag nag='4'></x-nag>
						<x-nag nag='2'></x-nag>
						<x-nag nag='5'></x-nag>
						<x-nag nag='6'></x-nag>
						<x-nag nag='1'></x-nag>
						<x-nag nag='3'></x-nag>
						<x-nag nag='14'></x-nag>
						<x-nag nag='15'></x-nag>
						<x-nag nag='16'></x-nag>
						<x-nag nag='17'></x-nag>
						<x-nag nag='18'></x-nag>
						<x-nag nag='19'></x-nag>
						<button class='pure-button' id='clearNag'>clear</button>
					</div>
				</li>
				<li style="display: flex; flex-direction: column;">
					<h3 id='no_engine_warning'>No Engine Set!</h3>
					<div id='computer_lines' style="display: flex; flex-direction: column; justify-content: flex-start; flex-grow: 1;">
						<x-computer-line id='line_1'/>
						<br/>
						<x-computer-line id='line_2'/>
						<br/>
						<x-computer-line id='line_3'/>
					</div>
					<button class='pure-button' id='analysis'>Toggle Analysis</button>
					<button class='pure-button' id='set_engine'>Choose Engine</button>
				</li>
				<li>
					<x-database id='database'></x-database>
				</li>
			</ul>
		</x-tabbox>
		<x-color-dialog></x-color-dialog>
		</section>

		</x-splitbox>

	</div>
	`,
	lifecycle: {
		created: function() {
			this.style.display = 'flex';
			this.style.flexDirection = 'column';

			var board = xtag.queryChildren(this, 'div x-board')[0];
			this.board = board;
			this.setBoardDimensions();
			this.makeBoardSquare();

			var splitbox = xtag.queryChildren(this, 'div x-splitbox')[0];
			splitbox.addEventListener('splitter-resize', () => {
				this.makeBoardSquare();
			});

			var leftSection = xtag.queryChildren(this, 'div x-splitbox section#left')[0];
			var rightSection = xtag.queryChildren(this, 'div x-splitbox section#right')[0];

			var clientRect = xtag.queryChildren(this, 'div')[0].getBoundingClientRect();
			var leftPercent = 100 * clientRect.height / clientRect.width;
			if (clientRect.height > clientRect.width) {
				leftPercent = 30;
			}

			leftSection.style.flex = '0 0' + leftPercent + '%';
			rightSection.style.flex = '0 0' + (100 - leftPercent) + '%';

			ipcRenderer.on('import-pgn', (event, message) => {
				importPgn(message);
			});

			var tabbox = xtag.queryChildren(this, 'div x-tabbox')[0];
			var viewportRect = xtag.queryChildren(this, 'div')[0].getBoundingClientRect();
			var viewportHeight = viewportRect.height;
			var viewportWidth = viewportRect.width;

			var leftSection = xtag.queryChildren(this, 'div x-splitbox section#left')[0];
			leftSection.style.width = viewportRect.height + 'px';
			leftSection.style.maxWidth = viewportRect.height + 'px';

			var nags = xtag.queryChildren(this, 'div x-tabbox ul li div x-nag');
			nags.forEach((nag) => {
				nag.board = board;
			});

			var clearButton = xtag.queryChildren(this, 'div x-tabbox ul li div button#clearNag')[0];
			clearButton.addEventListener('click', () => {
				board.history.current.nag = undefined;
				board.dispatchEvent(new Event('move'));
			});

			if (!board.history.root.tags) {
				board.history.root.tags = {};
			}

			var self = this;

			var self = this;
			this.analyzing = false;

			var p = null;
			var engine = null;

			var analysisButton = xtag.queryChildren(this, 'div x-tabbox ul li button#analysis')[0];
			var lines = xtag.queryChildren(this, 'div div#computer_lines')[0];
			var warning = xtag.queryChildren(this, 'div x-tabbox ul li h3#no_engine_warning')[0];

			// settings.unset('engine');
			if (!settings.get('engine')) {
				analysisButton.style.display = 'none';
				lines.style.display = 'none';
			}
			else {
				warning.style.display = 'none';
			}

			var setEngineButton = xtag.queryChildren(this, 'div x-tabbox ul li button#set_engine')[0];
			setEngineButton.addEventListener('click', () => {
				var path = requiredialog.showOpenDialog();
				settings.set('engine', path);

				warning.style.display = 'none';
				lines.style.display = '';
				analysisButton.style.display = '';
			});

			var line1 = xtag.queryChildren(this, 'div div#computer_lines x-computer-line#line_1')[0];
			var line2 = xtag.queryChildren(this, 'div div#computer_lines x-computer-line#line_2')[0];
			var line3 = xtag.queryChildren(this, 'div div#computer_lines x-computer-line#line_3')[0];

			line1.board = board;
			line1.controls = controls ;
			line2.board = board;
			line2.controls = controls ;
			line3.board = board;
			line3.controls = controls ;

			function stopAnalysisHelper() {
				self.analyzing = false;
				p = uciwrapper.stopAnalysis(p, engine);
			}

			var moves = xtag.queryChildren(this, 'div x-tabbox ul li x-moves')[0];

			function startAnalysisHelper() {
				self.analyzing = true;

				function formatMoves(moves, cp) {
					var chess = new requirechess.Chess(board.chess.fen());

					moves.forEach((m) => {
						chess.move(m);
					});

					return chess;
				}

				engine = new uciwrapper.Engine(settings.get('engine')[0]);
				p = uciwrapper.startEngine(engine);
				var fenPos = board.chess.fen();
				p = uciwrapper.setPosition(p, engine, fenPos);
				p = uciwrapper.setMultiPV(p, engine, 4);
				p = uciwrapper.startAnalysis(p, engine, (mpv, _moves, cp, depth) => {
					// invert evaluation if black to move
					if (board.chess.turn() == 'b') {
						cp = -cp;
					}

					switch (mpv) {
						case 1:
						line3.evaluation = cp;
						line3.moves = formatMoves(_moves);
						if ((!board.history.current.depth || depth > board.history.current.depth) && board.history.current.move) {
							board.history.current.depth = depth;
							board.history.current.evaluation = cp;
							board.history.current.move.updateEvaluation();
						}
						case 2:
						line2.evaluation = cp;
						line2.moves = formatMoves(_moves);
						case 3:
						line1.evaluation = cp;
						line1.moves = formatMoves(_moves);
					}
				});
			}

			analysisButton.addEventListener('click', () => {
				if (!self.analyzing) {
					startAnalysisHelper();
				}
				else {
					stopAnalysisHelper();
				}
			});

			board.addEventListener('move', () => {
				if (self.analyzing) {
					stopAnalysisHelper();
					startAnalysisHelper();
				}
			});

			moves.board = board;

			var setDragTarget = (child) => {
				var onMouseMove = (ev) => {
					var boundingRect = xtag.queryChildren(board, 'div')[0].getBoundingClientRect();
					child.style.marginLeft = (ev.clientX - boundingRect.left)/boundingRect.width * 100 - 12.5/2 +'%';
					child.style.marginTop = (ev.clientY - boundingRect.top)/boundingRect.width * 100 - 12.5/2 +'%';

					var rank = Math.floor((ev.clientY - boundingRect.top)/boundingRect.height*8);
					var file = Math.floor((ev.clientX - boundingRect.left)/boundingRect.width*8);

					var movesFrom = board.chess.moves({square: squareNames[7 - child.file][7 - child.rank], verbose: true}).map((m) => { return m.to; });

					board.boardSquares.forEach((square) => {
						var contains = null;
						if (board.flipped) {
							contains = movesFrom.filter((mf) => { return mf == squareNames[square.file][square.rank]; }).length !== 0;
						}
						else {
							contains = movesFrom.filter((mf) => { return mf == squareNames[7 - square.file][7 - square.rank]; }).length !== 0;
						}
						if (contains) {
							square.highlight(true);
						}
						else if (!board.flipped && square.rank == child.rank && square.file == child.file) {
							square.highlight(true);
						}
						else if (board.flipped && square.rank == 7 - child.rank && square.file == 7 - child.file) {
							square.highlight(true);
						}
						else if (square.isHighlighted) {
							square.highlight(false);
						}
					});
				};
				board.addEventListener('mousemove', onMouseMove);

				var onMouseUp = (ev) => {
					board.removeEventListener('mousemove', onMouseMove);
					board.removeEventListener('mouseup', onMouseUp);

					child.style.zIndex = undefined;
					var rank = child.rank;
					var file = child.file;

					var boundingRect = board.boardDiv.getBoundingClientRect();
					var newRank = Math.floor((ev.clientY - boundingRect.top) / boundingRect.height * 8);
					var newFile = Math.floor((ev.clientX - boundingRect.left) / boundingRect.width * 8);
					if (board.flipped) {
						newRank = 7 - newRank;
						newFile = 7 - newFile;
					}

					var existingMove = null;
					if (board.history.current && board.history.current.next) {
						var existing = board.history.current.next;
						if (existing.from == squareNames[7 - file][7 - rank] && existing.to == squareNames[7 - newFile][7 - newRank]) {
							existingMove = existing;
						}

						else if (board.history.current.next.variations) {
							board.history.current.next.variations.forEach((v) => {
								if (v.from == squareNames[7 - file][7 - rank] && v.to == squareNames[7 - newFile][7 - newRank]) {
									existingMove = v;
								}
							});
						}
					}

					if (self.training) {
						if (!existingMove) {
							newRank += 100;
						}
						else if (existingMove.next) {
							// schedule whatever is next after existingMove
							var oneTime = () => {
								document.removeEventListener('animateComplete', oneTime);

								var move = existingMove.next;
								var from = coordinates(move.from);
								var to = coordinates(move.to);
								board.makeMove(from.rank, from.file, to.rank, to.file, move.promotion, move);
								board.chess.load(board.history.current.fen);
							};

							document.addEventListener('animateComplete', oneTime);
						}
					}

					board.makeMove(rank, file, newRank, newFile, null, existingMove);
				};
				board.addEventListener('mouseup', onMouseUp);
			}

			board.addEventListener('pieceDrag', (ev) => {
				setDragTarget(ev.detail);
			});

			document.onkeydown = (e) => {
				e = e || window.event;
				if (e.keyCode == '38') {
					// up arrow
				}
				else if (e.keyCode == '40') {
					// down arrow
				}
				else if (e.keyCode == '37') {
					// left arrow
					board.undoMove();
				}
				else if (e.keyCode == '39') {
					// right arrow
					if (animateSemaphor !== 0) {
						return;
					}

					if (!board.history.root) {
						return;
					}

					var move = null;
					if (!board.history.current) {
						board.history.current = board.history.root;
					}
					else if (board.history.current.next) {
						board.history.current = board.history.current.next;
					}
					move = board.history.current;
					if (move) {
						var from = coordinates(move.from);
						var to = coordinates(move.to);

						if (from && to) {
							board.makeMove(from.rank, from.file, to.rank, to.file, move.promotion, move);
							board.chess.load(board.history.current.fen);
						}
					}
				}
			};
		}
	},
	methods: {
		loadFEN: function(fen) {
			var board = xtag.queryChildren(this, 'div x-board')[0];
			var loaded = board.chess.load(fen);
			var root = {fen: board.chess.fen()};
			board.history = {
				root: root,
				current: root
			};
			board.loadPieces();
		},
		selectTab: function(tabIndex) {
			var tabbox = xtag.queryChildren(this, 'div x-tabbox')[0];
			tabbox.selectedIndex = tabIndex;
		},
		loadNextGame: function() {
			var database = xtag.queryChildren(this, 'div x-tabbox ul li x-database')[0];
			var index = database._rows.indexOf(database._selectedRow);
			var newIndex = (index + 1) % database._rows.length;
			database._rows[newIndex].select();
		},
		showBoardColorDialog: function() {
			var board = xtag.queryChildren(this, 'div x-board')[0];
			var dialog = xtag.queryChildren(this, 'div x-color-dialog')[0];
			dialog.showModal();

			dialog.addEventListener('colorsChosen', () => {
				board.boardSquares.forEach((bs) => {
					bs.setCoordinates(bs.rank, bs.file);
				})
			});

			dialog.addEventListener('close', () => {
				dialog.close();
			})
		},
		setBoardDimensions: function() {
			var viewportRect = xtag.queryChildren(this, 'div')[0].getBoundingClientRect();

			var target = xtag.queryChildren(this, 'div x-splitbox section#left')[0];

			target.style.width = viewportRect.height + 'px';
			target.style.height = viewportRect.height + 'px';
		},
		makeBoardSquare: function() {
			var leftSection = xtag.queryChildren(this, 'div x-splitbox section#left')[0];
			var boardRect = leftSection.getBoundingClientRect();
			this.board.boardDiv.style.height = boardRect.width + 'px';
			this.board.boardDiv.style.width = boardRect.width + 'px';
		}
	}
});
