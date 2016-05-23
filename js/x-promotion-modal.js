xtag.register('x-promotion-modal', {
  content: '',
  lifecycle: {
    created: function() {
      this.style.display = 'flex';
      this.style.justifyContent = 'space-around';

      this.queenButton = document.createElement('img');
      this.queenButton.src = './pieces/wq.svg'
      this.queenButton.addEventListener('click', () => {
        this.finishCallback('q');
        this.parentNode.removeChild(this);
      });
      this.rookButton = document.createElement('img');
      this.rookButton.src = './pieces/wr.svg'
      this.rookButton.addEventListener('click', () => {
        this.finishCallback('r');
        this.parentNode.removeChild(this);
      });
      this.bishopButton = document.createElement('img');
      this.bishopButton.src = './pieces/wb.svg'
      this.bishopButton.addEventListener('click', () => {
        this.finishCallback('b');
        this.parentNode.removeChild(this);
      });
      this.knightButton = document.createElement('img');
      this.knightButton.src = './pieces/wn.svg'
      this.knightButton.addEventListener('click', () => {
        this.finishCallback('n');
        this.parentNode.removeChild(this);
      });

      this.appendChild(this.queenButton);
      this.appendChild(this.rookButton);
      this.appendChild(this.bishopButton);
      this.appendChild(this.knightButton);
    }
  },
  accessors: {
    color: {
      set: function(newValue) {
        if (newValue == 'w') {
          this.queenButton.src = './pieces/wq.svg';
          this.rookButton.src = './pieces/wr.svg';
          this.bishopButton.src = './pieces/wb.svg';
          this.knightButton.src = './pieces/wn.svg';
        }
        else {
          this.queenButton.src = './pieces/bq.svg';
          this.rookButton.src = './pieces/br.svg';
          this.bishopButton.src = './pieces/bb.svg';
          this.knightButton.src = './pieces/bn.svg';
        }
      }
    }
  }
});
