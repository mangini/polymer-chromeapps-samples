        Polymer('g-card', {
        });

        Polymer('match-game', {
          created: function() {
            this.game = new Game(['8-ball', 'kronos', 'baked-potato',
                                  'dinosaur', 'rocket', 'skinny-unicorn',
                                  'that-guy', 'zeppelin']);
          },
          flip: function(e, detail, target) {
            this.game.flipTile(target.templateInstance.model.tile);
          }
        });
