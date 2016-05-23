xtag.register('x-move', {
	content: '',
  lifecycle: {
    created: function() {
      this.style.paddingLeft = '5px';
      this.style.paddingRight = '5px';
			this.style.fontSize = '150%';
    }
  },
	methods: {
		setMove: function(newValue) {
			var self = this;

			self.historyMove = newValue;

			if (newValue.san) {
				var ih = newValue.san;
				if (newValue.nag) {
					ih += ' ' + newValue.nag;
				}
				self.innerHTML = ih;
			}

			if (newValue.comments) {
				for (var i = 0; i < newValue.comments.length; i++) {
					var j = i;

					var commentSpan = document.createElement('span');
					commentSpan.innerHTML = newValue.comments[i];
					commentSpan.style.color = 'blue';
					commentSpan.style.marginLeft = '5px';
					commentSpan.style.marginRight = '5px';
					commentSpan.addEventListener('click', () => {
						var dialog = document.createElement('dialog');
						dialog.style.zIndex = 100;
						dialog.style.border = '1px solid rgba(0, 0, 0, 0.3)';
						dialog.style.borderRadius = '6px';
						dialog.style.boxShadow = '0 3px 7px rgba(0, 0, 0, 0.3)';

						var input = document.createElement('input');
						input.value = commentSpan.innerHTML;
						dialog.appendChild(input);

						var okButton = document.createElement('button')
						okButton.innerHTML = 'OK';
						dialog.appendChild(okButton);

						var deleteButton = document.createElement('button')
						deleteButton.innerHTML = 'DELETE';
						dialog.appendChild(deleteButton);

						self.board.appendChild(dialog);
						dialog.showModal();

						okButton.addEventListener('click', () => {
							newValue.comments[j] = input.value;
							dialog.close();
							dialog.parentNode.removeChild(dialog);
							self.board.dispatchEvent(new Event('move'));
						});

						deleteButton.addEventListener('click', () => {
							newValue.comments.splice(j, 1);
							dialog.close();
							dialog.parentNode.removeChild(dialog);
							self.board.dispatchEvent(new Event('move'));
						});
					});

					self.appendChild(commentSpan);
				}
			}

			self.addEventListener('click', () => {
				self.board.setHistory(self.historyMove);
			});
		}
	},
  accessors: {
    move: {
      set: function(newValue) {
				this.setMove(newValue);
      }
    },
		moveNumber: {
			set: function(newValue) {
				if (this.historyMove && this.historyMove.color == 'b') {
					this.innerHTML = newValue + '... ' + this.innerHTML;
				}
				else {
					this.innerHTML = newValue + '. ' + this.innerHTML;
				}
			}
		},
    current: {
      set: function(newValue) {
        this.style.backgroundColor = 'pink';
      }
    }
  }
});

xtag.register('x-sub-variation', {
	content: ``,
	lifecycle: {
		created: function() {
			this.style.display = 'flex';
			this.style.flexWrap = 'wrap';
		}
	},
	methods: {
		addMove: function(move) {
			this.appendChild(move);
		}
	}
});

xtag.register('x-variation', {
  content: ``,
	lifecycle: {
		created: function() {
			this.style.display = 'flex';
			this.style.flexDirection = 'column';
			this.style.marginLeft = '20px';
		}
	},
  accessors: {
		level: {
			set: function(newValue) {
				var colors = [
				 	'#F8F8F8',
				 	'#E8E8E8',
				 	'#D8D8D8',
				 	'#C8C8C8',
				 	'#B8B8B8',
				 	'#A8A8A8',
				 	'#989898',
				 	'#888888',
				 	'#787878',
				 	'#686868',
					'#606060',
				];
				this._level = newValue;
				this.style.backgroundColor = colors[(newValue + 1) % colors.length];
			}
		},
    root: {
      set: function(newValue) {
        // clear first
        this.innerHTML = '';

        var cur = newValue;

				var preVariation = document.createElement('x-sub-variation');

				var moveNumber = 1;
				if (newValue.moveNumber) {
					moveNumber = newValue.moveNumber;
				}

        var move = document.createElement('x-move');
        move.move = cur;
				if (cur) {
					move.moveNumber = moveNumber;
				}
        move.board = this.board;
        if (cur == this.board.history.current) {
          move.current = true;
					if (controls().training) {
						preVariation.addMove(move);
						this.appendChild(preVariation);
						return;
					}
        }
				preVariation.addMove(move);

        while (cur && (cur.next || cur.variations)) {
          var move = undefined;

          if (cur.next) {
            move = document.createElement('x-move');
            move.move = cur.next;
            move.board = this.board;
						if (cur.color == 'b') {
							moveNumber += 1;
							move.moveNumber = moveNumber;
						}
            if (cur.next == this.board.history.current) {
              move.current = true;
            }
          }

          if (cur.variations && cur.variations.length > 0) {
						this.appendChild(preVariation);
						preVariation = document.createElement('x-sub-variation');

	          for (var i = 0; i < cur.variations.length; i++) {
              var variation = document.createElement('x-variation');
							variation.level = this._level + 1;
              variation.board = this.board;
							cur.variations[i].moveNumber = moveNumber;
              variation.root = cur.variations[i];
              this.appendChild(variation);
            }
          }

					if (move && cur.next == this.board.history.current && controls().training) {
						preVariation.addMove(move);
						this.appendChild(preVariation);
						return;
					}

          if (move) {
						preVariation.addMove(move);
          }

          cur = cur.next;
        }

				this.appendChild(preVariation);
      }
    }
  }
});

xtag.register('x-edit-header', {
	content: `
	<form class="pure-form pure-form-aligned">
		<fieldset>
			<div class="pure-control-group">
				<label for="white">White</label>
				<input id="white" type="text" placeholder="Unknown">
			</div>

			<div class="pure-control-group">
				<label for="black">Black</label>
				<input id="black" type="text" placeholder="Unknown">
			</div>

			<div class="pure-control-group">
				<label for="event">Event</label>
				<input id="event" type="text" placeholder="">
			</div>

			<div class="pure-control-group">
				<label for="site">Site</label>
				<input id="site" type="text" placeholder="">
			</div>

			<div class="pure-control-group">
				<label for="date">Date</label>
				<input id="date" type="date" placeholder="">
			</div>

			<div class="pure-control-group">
				<label for="round">Round</label>
				<input id="round" type="number" placeholder="">
			</div>

			<div class="pure-control-group">
				<label for="result">Result</label>
				<select id='result'>
					<option value='1-0'>1-0</option>
					<option value='0-1'>0-1</option>
					<option value='1/2-1/2'>1/2-1/2</option>
					<option selected value='*'>*</option>
				</select>
			</div>

			<div class="pure-control-group">
				<label for="eco">ECO</label>
				<input id="eco" type="text" placeholder="">
			</div>

			<div class="pure-controls">
				<button type="submit" class="pure-button pure-button-primary">OK</button>
			</div>
		</fieldset>
	</form>
	`,
	lifecycle: {
		created: function() {
			var form = xtag.queryChildren(this, 'form')[0];
			form.onsubmit = () => {
				var white = xtag.queryChildren(this, 'form fieldset div input#white')[0];
				var black = xtag.queryChildren(this, 'form fieldset div input#black')[0];
				var event = xtag.queryChildren(this, 'form fieldset div input#event')[0];
				var site = xtag.queryChildren(this, 'form fieldset div input#site')[0];
				var date = xtag.queryChildren(this, 'form fieldset div input#date')[0];
				var round = xtag.queryChildren(this, 'form fieldset div input#round')[0];
				var result = xtag.queryChildren(this, 'form fieldset div select#result')[0];
				var eco = xtag.queryChildren(this, 'form fieldset div input#eco')[0];

				this.history.root.tags = {
					event: event.value,
					site: site.value,
					date: date.value,
					round: round.value,
					white: white.value,
					black: black.value,
					result: result.options[result.selectedIndex].text,
					eco: eco.value
				};

				this.dispatchEvent(new Event('submit'));

				return false;
			}
		}
	},
	methods: {
		update: function() {
			var white = xtag.queryChildren(this, 'form fieldset div input#white')[0];
			var black = xtag.queryChildren(this, 'form fieldset div input#black')[0];
			var event = xtag.queryChildren(this, 'form fieldset div input#event')[0];
			var site = xtag.queryChildren(this, 'form fieldset div input#site')[0];
			var date = xtag.queryChildren(this, 'form fieldset div input#date')[0];
			var round = xtag.queryChildren(this, 'form fieldset div input#round')[0];
			var result = xtag.queryChildren(this, 'form fieldset div select#result')[0];
			var eco = xtag.queryChildren(this, 'form fieldset div input#eco')[0];

			if (this.history.root.tags.white) {
				white.value = this.history.root.tags.white;
			}
			if (this.history.root.tags.black) {
				black.value = this.history.root.tags.black;
			}
			if (this.history.root.tags.event) {
				event.value = this.history.root.tags.event;
			}
			if (this.history.root.tags.site) {
				site.value = this.history.root.tags.site;
			}
			if (this.history.root.tags.date) {
				date.value = this.history.root.tags.date;
			}
			if (this.history.root.tags.round) {
				round.value = this.history.root.tags.round;
			}
			if (this.history.root.tags.result) {
				result.value = this.history.root.tags.result;
			}
			if (this.history.root.tags.eco) {
				eco.value = this.history.root.tags.eco;
			}
		}
	}
});

xtag.register('x-moves', {
  content: `
	<h3 id='header'></h3>
	<h3 id='subheader'></h3>
	<h3 id='subsubheader'></h3>
	<h3 id='opening'></h3>
	<button style='margin-bottom: 10px;' id='edit' class='pure-button'>Edit Header Info</button>
	<x-variation style='display: flex; flex-wrap: wrap;'></x-variation>
	<dialog style='z-index: 100; border: 1px solid rgba(0, 0, 0, 0.3); border-radius: 6px; box-shadow: 0 3px 7px rgba(0, 0, 0, 0.3);'><x-edit-header></x-edit-header></dialog>
	`,
	lifecycle: {
		created: function() {
			var editButton = xtag.queryChildren(this, 'button#edit')[0];
			editButton.addEventListener('click', () => {
				var dialog = xtag.queryChildren(this, 'dialog')[0];
				var editHeader = xtag.queryChildren(this, 'dialog x-edit-header')[0];
				editHeader.history = this._board.history;
				editHeader.update();
				editHeader.addEventListener('submit', () => { this._board.dispatchEvent(new Event('move')); if (dialog.open) { dialog.close(); } });
				dialog.showModal();
			});
		}
	},
  accessors: {
    board: {
      set: function(newValue) {
        var self = this;

				this._board = newValue;

        newValue.addEventListener('move', () => {
					var variation = xtag.queryChildren(self, 'x-variation')[0];
					variation.style.marginLeft = 0;
					variation.level = 0;
          variation.board = newValue;
          if (newValue.history.root) {
            variation.root = newValue.history.root;

						if (!newValue.history.root.tags) {
							newValue.history.root.tags = {
								event: null,
								site: null,
								date: null,
								round: null,
								white: null,
								black: null,
								result: null,
								eco: null
							}
						}

						var headerWhite = xtag.queryChildren(self, 'span h3#header')[0];
						var subheader = xtag.queryChildren(self, 'h3#subheader')[0];
						var subsubheader = xtag.queryChildren(self, 'h3#subsubheader')[0];
						var opening = xtag.queryChildren(self, 'h3#opening')[0];

						var event = newValue.history.root.tags.event;
						var site = newValue.history.root.tags.site;
						var date = newValue.history.root.tags.date;
						var round = newValue.history.root.tags.round;
						var white = newValue.history.root.tags.white;
						var black = newValue.history.root.tags.black;
						var result = newValue.history.root.tags.result;
						var eco = newValue.history.root.tags.eco;

						// white / black / result
						if (!result) {
							result = '*';
						}

						if (white && black) {
							header.style.display = 'block';
							header.innerHTML = white + ' vs ' + black + '  ' + result;
						}
						else {
							header.style.display = 'none';
						}

						// eco / event / round
						if (event || round) {
							subheader.style.display = 'block';
							subheader.innerHTML = event + ' (rd. ' + round + ') ';
						}
						else {
							subheader.style.display = 'none';
						}

						if (eco) {
							opening.style.display = 'block';
							opening.innerHTML = 'ECO: ' + eco;
						}

						// site / date
						if (site || date) {
							if (site && date) {
								subsubheader.style.display = 'block';
								subsubheader.innerHTML =  site + ', ' + date;
							}
							else if (site) {
								subsubheader.style.display = 'block';
								subsubheader.innerHTML =  site;
							}
							else if (date) {
								subsubheader.style.display = 'block';
								subsubheader.innerHTML =  date;
							}
						}
						else {
							subsubheader.style.display = 'none';
						}
          }
        });
      }
    }
  }
});
