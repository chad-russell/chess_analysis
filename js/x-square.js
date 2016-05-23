xtag.register('x-square', {
  content: '',
  lifecycle: {
    created: function() {
      this.classList.add('square');
      this.style.position = 'absolute';
      this.style.width = '12.5%';
      this.style.height = '12.5%';
      this.isHighlighted = false;

      this.insetHighlight = document.createElement('div');
      this.insetHighlight.style.width = '95%';
      this.insetHighlight.style.height = '95%';
      this.insetHighlight.style.border = '3px solid yellow';
      this.insetHighlight.style.display = 'none';
      this.appendChild(this.insetHighlight);
    }
  },
  methods: {
    setCoordinates: function(rank, file) {
      this.rank = rank;
      this.file = file;

			this.style.marginLeft = file * 12.5 + '%';
			this.style.marginTop = rank * 12.5 + '%';

      var light = getLight();
      var dark = getDark();

      if (rank % 2 == file % 2) {
        this.style.backgroundColor = light;
      }
      else {
        this.style.backgroundColor = dark;
      }
    },
    highlight: function(shouldHighlight) {
      if (this.isHighlighted && shouldHighlight) { return; }
      if (!this.isHighlighted && !shouldHighlight) { return; }

      if (shouldHighlight) {
        this.isHighlighted = true;
        this.insetHighlight.style.display = 'block';
      }
      else if (this.rank % 2 == this.file % 2) {
        this.isHighlighted = false;
        this.insetHighlight.style.display = 'none';
      }
      else {
        this.isHighlighted = false;
        this.insetHighlight.style.display = 'none';
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
