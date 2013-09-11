
  (function() { 
    Polymer('arrange-game-tile', {
      tile: null,
      enteredDocument: function() {
        var i = {};
        this.fire('request-tile-metrics', i);
        var m = this.metrics = i.metrics;
        if (this.$.style) {
          this.$.style.textContent += '.tile { width: ' + m.width + 
              '%;\n height: ' + m.height + '%;\n}';
        }
        this.binding = observePaths(this, 'tile.col tile.row',
            this.updatePosition.bind(this));
        this.updatePosition();
      },
      updatePosition: function() {
        this.position = {
          left: this.tile.col * this.metrics.left,
          top: this.tile.row * this.metrics.top
        }
      }
    });
    
    function observePaths(model, pathsString, callback) {
      if (!callback) {
        return;
      }
      var valueFn = function(values) {
        return values[0] * model.tile.cols + values[1];
      };
      var observer = new CompoundPathObserver(callback, undefined, undefined, valueFn);
      var paths = pathsString.split(' ');
      paths.forEach(function(path) {
        observer.addPath(model, path);
      });
      observer.start();
      return observer;
    }
    
  })();
  ;

    Polymer('arrange-game', {
      tiles: null,
      rows: 4,
      cols: 4,
      created: function() {
        this.setAttribute('touch-action', 'none');
      },
      enteredDocument: function() {
        this.metrics = {
          //left: this.$.board.clientWidth / this.cols,
          //top: this.$.board.clientHeight / this.rows,
          left: 800/this.cols, //this.$.board.clientWidth / this.cols,
          top: 600/this.rows, //this.$.board.clientHeight / this.rows,
          width: 100 / this.cols,
          height: 100 / this.rows
        };
        this.startGame();
      },
      startGame: function() {
        this.tiles = this.makeTiles();
        this.inviso = this.tiles[this.rows * this.cols-1];
        this.inviso.invisible = true;
        this.shuffleTiles();
        this.winner = false;
      },
      makeTiles: function() {
        var tiles = [];
        for (var i=0; i < this.rows; i++) {
          for (var j=0, p; j < this.cols; j++) {
            tiles.push({
              row: i,
              col: j,
              cols: this.cols,
              position: i * this.cols + j
            })
          }
        }
        return tiles;
      },
      shuffleTiles: function() {
        var size = this.rows * this.cols;
        for (var i=0, count = size * 10; i < count; i++) {
          this.moveTile(this.tiles[Math.floor(Math.random() * size)]);
        }
      },
      tileDown: function(e) {
        if (!this.winner) {
          this.moveTile(e.target.templateInstance.model);
        }
        if (this.youWin()) {
          this.winner = true;
          this.tiles.forEach(function(t) {
            t.winner = true;
            t.invisible = false;
          });
        }
        // faster response
        Platform.flush();
      },
      moveTile: function(tile) {
        if (tile.row === this.inviso.row && tile.col === this.inviso.col) {
          return;
        }
        if (tile.row === this.inviso.row) {
          this.move(tile, 'row', 'col');
        } else if (tile.col === this.inviso.col) {
          this.move(tile, 'col', 'row');
        }
      },
      // row == axis
      move: function(tile, axis, offAxis) {
        var op = tile[offAxis] > this.inviso[offAxis] ? 1 : -1;
        var moves = this.tiles.filter(function(t) {
          return !t.invisible &&
                 (t[axis] === this.inviso[axis]) && 
                 (t[offAxis] * op > this.inviso[offAxis] * op) &&
                 (t[offAxis] * op <= tile[offAxis] * op);
        }, this);
        moves.forEach(function(t) {
          t[offAxis] -= op;
          this.inviso[offAxis] += op;
        }, this);
      },
      youWin: function() {
        return this.tiles.every(function(t) {
          return (t.col === t.position % this.cols) &&
              (t.row === Math.floor(t.position / this.cols));
        }, this);
      },
      requestTileMetrics: function(e) {
        e.detail.metrics = this.metrics;
      }
    });
  