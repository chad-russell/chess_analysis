xtag.register('x-piece', {
  content: '',
  lifecycle: {
    created: function() {
      this.img = document.createElement('img');
      this.img.draggable = false;

      this.img.style.position = 'absolute';
      this.img.style.width = '100%';
      this.img.style.height = '100%';
      var name = this.getAttribute('name');
      if (name) {
        this.setPieceName(name);
      }

      this.appendChild(this.img);
    }
  },
  methods: {
    setPieceName: function(pieceName) {
      this.img.src = './pieces/' + pieceName + '.svg';
      this.name = pieceName;
    },
    setCoordinates: function(rank, file, flipped) {
      this.rank = rank;
      this.file = file;

      if (flipped) {
        this.style.marginLeft = (7 - file) * 12.5 + '%';
        this.style.marginTop = (7 - rank) * 12.5 + '%';
      }
      else {
        this.style.marginLeft = file * 12.5 + '%';
        this.style.marginTop = rank * 12.5 + '%';
      }
    },
    animateCoordinates: function(rank, file, flipped) {
      this.rank = rank;
      this.file = file;
      if (flipped) {
        startAnimate();
        Velocity(this, {marginLeft: (7 - file) * 12.5 + '%', marginTop: (7 - rank) * 12.5 + '%'}, {
          duration: animationDuration,
          complete: endAnimate
        });
      }
      else {
        startAnimate();
        Velocity(this, {marginLeft: file * 12.5 + '%', marginTop: rank * 12.5 + '%'}, {
          duration: animationDuration,
          complete: endAnimate
        });
      }
    },
    snapCoordinates: function(rank, file, flipped) {
      this.rank = rank;
      this.file = file;
      if (flipped) {
        this.style.marginLeft = (7 - file) * 12.5 + '%';
        this.style.marginTop = (7 - rank) * 12.5 + '%';
      }
      else {
        this.style.marginLeft = file * 12.5 + '%';
        this.style.marginTop = rank * 12.5 + '%';
      }
    }
  },
  accessors: {
    rank: {
      attribute: {}
    },
    file: {
      attribute: {}
    }
  }
});
