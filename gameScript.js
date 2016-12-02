    var game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');

    var PhaserGame = function (game) {

        this.map = null;
        this.layer = null;
      this.pacman = null;
      
        this.safetile = 1;
        this.gridsize = 32;

        this.speed = 150;
        this.threshold = 3;
        this.turnSpeed = 150;

        this.marker = new Phaser.Point();
        this.turnPoint = new Phaser.Point();

        this.directions = [ null, null, null, null, null ];
        this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

        this.current = Phaser.UP;
        this.turning = Phaser.NONE;

    };

    PhaserGame.prototype = {

        init: function () {

            this.physics.startSystem(Phaser.Physics.ARCADE);

        },

        preload: function () {

            this.load.tilemap('map', 'assets/maze.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image('tiles', 'assets/tiles.png');
          this.load.spritesheet('pacman', 'assets/pacman-sprite.png', 32, 32);
 this.load.image('dot', 'assets/dot.png');

        },

        create: function () {
   
            this.map = this.add.tilemap('map');
            this.map.addTilesetImage('tiles', 'tiles');

            this.layer = this.map.createLayer('Tile Layer 1');
          
          this.dots = this.add.physicsGroup();
          
          this.map.createFromTiles(1, this.safetile, 'dot', this.layer, this.dots);
          
          this.dots.setAll('x', 14, false, false, 1);
          this.dots.setAll('y', 14, false, false, 1);
           
            this.map.setCollision(20, true, this.layer);


            this.pacman = this.add.sprite(48,48, 'pacman', 0);
            this.pacman.anchor.set(0.5);
            this.pacman.animations.add('munch', [0, 1, 2, 1], 15, true);
          
            this.physics.arcade.enable(this.pacman);
          
            this.cursors = this.input.keyboard.createCursorKeys();

           this.pacman.play('munch');
          
            this.move(Phaser.DOWN);

        },

        checkKeys: function () {

            if (this.cursors.left.isDown && this.current !== Phaser.LEFT)
            {
                this.checkDirection(Phaser.LEFT);
            }
            else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT)
            {
                this.checkDirection(Phaser.RIGHT);
            }
            else if (this.cursors.up.isDown && this.current !== Phaser.UP)
            {
                this.checkDirection(Phaser.UP);
            }
            else if (this.cursors.down.isDown && this.current !== Phaser.DOWN)
            {
                this.checkDirection(Phaser.DOWN);
            }
            else
            {
                //  This forces them to hold the key down to turn the corner
                this.turning = Phaser.NONE;
            }

        },

        checkDirection: function (turnTo) {

            if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile)
            {
                //  Invalid direction if they're already set to turn that way
                //  Or there is no tile there, or the tile isn't index a floor tile
                return;
            }

            //  Check if they want to turn around and can
            if (this.current === this.opposites[turnTo])
            {
                this.move(turnTo);
            }
            else
            {
                this.turning = turnTo;

                this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
                this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
            }

        },

        turn: function () {

            var cx = Math.floor(this.pacman.x);
            var cy = Math.floor(this.pacman.y);

            //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
            if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold))
            {
                return false;
            }

            this.pacman.x = this.turnPoint.x;
            this.pacman.y = this.turnPoint.y;

           this.pacman.body.reset(this.turnPoint.x, this.turnPoint.y);
          
            this.move(this.turning);

            this.turning = Phaser.NONE;

            return true;

        },

        move: function (direction) {

            var speed = this.speed;

            if (direction === Phaser.LEFT || direction === Phaser.UP)
            {
                speed = -speed;
            }

            if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
            {
                this.pacman.body.velocity.x = speed;
            }
            else
            {
                this.pacman.body.velocity.y = speed;
            }

            this.pacman.scale.x = 1;
            this.pacman.angle = 0;
          
           
        
          if (direction === Phaser.LEFT)
            {
                this.pacman.scale.x = -1;
            }
            else if (direction === Phaser.UP)
            {
                this.pacman.angle = 270;
            }
            else if (direction === Phaser.DOWN)
            {
                this.pacman.angle = 90;
            }
          
          
          
            this.current = direction;

        },
      
      eatDot: function (pacman, dot) {

            dot.kill();

            if (this.dots.total === 0)
            {
                this.dots.callAll('revive');
            }

        },
      
        getAngle: function (to) {

            //  About-face?
            if (this.current === this.opposites[to])
            {
                return "180";
            }

            if ((this.current === Phaser.UP && to === Phaser.LEFT) ||
                (this.current === Phaser.DOWN && to === Phaser.RIGHT) ||
                (this.current === Phaser.LEFT && to === Phaser.DOWN) ||
                (this.current === Phaser.RIGHT && to === Phaser.UP))
            {
                return "-90";
            }

            return "90";

        },

        update: function () {
          
            this.physics.arcade.collide(this.pacman, this.layer);
            this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);
          

          
           this.marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
           this.marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;
          
            //  Update our grid sensors
            this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
            this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
            this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
            this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);

            this.checkKeys();

            if (this.turning !== Phaser.NONE)
            {
                this.turn();
            }

        },

        render: function () {

            //  Un-comment this to see the debug drawing

            for (var t = 1; t < 5; t++)
            {
                if (this.directions[t] === null)
                {
                    continue;
                }

                var color = 'rgba(0,255,0,0.3)';

                if (this.directions[t].index !== this.safetile)
                {
                    color = 'rgba(255,0,0,0.3)';
                }

                if (t === this.current)
                {
                    color = 'rgba(255,255,255,0.3)';
                }

                this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, 32, 32), color, true);
            }

           // this.game.debug.geom(this.turnPoint, '#ffff00');

        }

    };

    game.state.add('Game', PhaserGame, true);
