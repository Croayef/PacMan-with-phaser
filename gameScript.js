  game = new Phaser.Game(640, 520, Phaser.CANVAS, 'game');

  var stage = 1;

var rand = function( min, max ){
    min = parseInt( min, 10 );
    max = parseInt( max, 10 );

    if ( min > max ){
        var tmp = min;
        min = max;
        max = tmp;
    }

    return Math.floor( Math.random() * ( max - min + 1 ) + min );
}

    var PhaserGame = function (game) {

        this.map = null;
        this.layer = null;
      this.pacman = null;
      this.redGhost = null;
      this.pinkGhost = null;
      this.orangeGhost = null;
      this.blueGhost = null;
      this.purpleGhost = null;
      this.alive = false;
      this.stateText = null;
      
    
      
      this.pacmanBegX = 1;
      this.pacmanBegY = 1;
      
      this.redGhostBegX = 4;
      this.redGhostBegY = 4;
      
      this.pinkGhostBegX = 0;
      this.pinkGhostBegY = 0;
      
      this.orangeGhostBegX = 0;
      this.orangeGhostBegY = 0;
      
      this.blueGhostBegX = 0;
      this.blueGhostBegY = 0;
      
      this.purpleGhostBegX = 0;
      this.purpleGhostBegY = 0;
      
      this.score = 0;
      this.scoreString = '';
      this.scoreText;
      
        this.safetile = 1;
        this.gridsize = 32;

        this.speed = 150;
        this.threshold = 3;
        this.turnSpeed = 150;

        this.marker = new Phaser.Point();
      this.redMarker = new Phaser.Point();
      this.redTurnPoint = new Phaser.Point();
        this.turnPoint = new Phaser.Point();

        this.directions = [ null, null, null, null, null ];
      this.redDirections = [ null, null, null, null, null ];
        this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

      this.redCurrent = Phaser.NONE
        this.current = Phaser.UP;
      this.redTurn = Phaser.NONE;
        this.turning = Phaser.NONE;

    };

    PhaserGame.prototype = {

        init: function () {

            this.physics.startSystem(Phaser.Physics.ARCADE);

        },

        preload: function () {

            this.load.tilemap('map', 'assets/maze.json', null, Phaser.Tilemap.TILED_JSON);
            this.load.image('tiles', 'assets/tiles.png');
            this.load.image('dot', 'assets/dot.png');
            this.load.spritesheet('pacman','assets/pacman.png',32,32);
            this.load.spritesheet('redGhost', 'assets/redGhost.png',32,32);

        },

        create: function () {
        
          this.score = -1       

            this.map = this.add.tilemap('map');
            this.map.addTilesetImage('tiles', 'tiles');
          
if( stage === 1) 
       {this.pacmanBegX = 1;
          this.pacmanBegY = 1;
          this.redGhostBegX = 3;
         this.redGhostBegY = 2;
         this.layer = this.map.createLayer("Tile Layer 1");
     }
      else if(stage === 2){
           this.pacmanBegX = 1;
       this.pacmanBegY = 1;
       this.redGhostBegX = 4;
     this.redGhostBegY = 4;
        this.layer = this.map.createLayer("Tile Layer 2");
      }



          this.dots = this.add.physicsGroup();
   
          
          this.map.createFromTiles(1, this.safetile, 'dot', this.layer, this.dots);
          
          this.dots.setAll('x', 14, false, false, 1);
          this.dots.setAll('y', 14, false, false, 1);
           
            this.map.setCollision(20, true, this.layer);

    
          
            this.pacman = this.add.sprite((16+this.pacmanBegX*32),(16+this.pacmanBegY*32), 'pacman', 10);
            this.pacman.anchor.set(0.5);
          
          this.redGhost = this.add.sprite((16+this.redGhostBegX*32),(16+this.redGhostBegY*32), 'redGhost', 0)
          this.redGhost.anchor.set(0.5);
          
          this.physics.arcade.enable(this.redGhost);
       
          
          //pacman HD
            this.pacman.animations.add('munch', [0,1], 10, true);
          
            this.physics.arcade.enable(this.pacman);
          
            this.cursors = this.input.keyboard.createCursorKeys();

           this.redGhost.animations.add('redHorizontalGhost',[0,1],8,true);
          this.redGhost.animations.add('redUpGhost',[4,5],8,true);
          this.redGhost.animations.add('redDownGhost',[2,3],8,true);

    
       
           this.pacman.play('munch');
           this.redGhost.play('redHorizontalGhost');
            //  Text
        this.stateText = this.add.text(this.world.centerX,this.world.centerY,' ', { font: '74px Arial', fill: '#fff' });
        this.stateText.anchor.setTo(0.5, 0.5);
        this.stateText.visible = false;

          //  The score
        this.scoreString = 'Score : ';
        this.scoreText = this.add.text(10, 480, this.scoreString + this.score, { font: '34px Arial', fill: '#fff' });
          
          this.move(Phaser.DOWN);
          this.redMove(Phaser.DOWN);
          
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
      checkRed: function () {

            if ( this.redTurn === Phaser.LEFT && this.redCurrent !== Phaser.LEFT)
            {
                this.checkRedDirection(this.redTurn);
            }
            else if (this.redTurn === Phaser.RIGHT && this.redCurrent !== Phaser.RIGHT)
            {
                this.checkRedDirection(this.redTurn);
            }
            else if (this.redTurn === Phaser.UP && this.redCurrent !== Phaser.UP)
            {
                this.checkRedDirection(this.redTurn);
            }
            else if (this.redTurn === Phaser.DOWN && this.redCurrent !== Phaser.DOWN)
            {
                this.checkRedDirection(this.redTurn);
            }
            else
            {
                this.redTurn = Phaser.NONE;
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
      
      junction: function(dirs, curr){
        
        if(curr === Phaser.LEFT || curr === Phaser.RIGHT){
          if((dirs[Phaser.UP].index === this.safetile || dirs[Phaser.DOWN].index === this.safetile)){
            return true;
          }
        } 
        else if(curr === Phaser.UP || curr === Phaser.DOWN){
          if((dirs[Phaser.LEFT].index === this.safetile || dirs[Phaser.RIGHT].index === this.safetile)){
            return true;
          }
        }
        else{
          return false;
        }
      },
      
      canTurn: function(turnTo, dirs, curr){
        
        if((curr === Phaser.LEFT || curr === Phaser.RIGHT) && (dirs[Phaser.UP].index === this.safetile || dirs[Phaser.DOWN].index === this.safetile)){
          if (dirs[turnTo] === null || dirs[turnTo].index !== this.safetile || curr === this.opposites[turnTo])
            {
                //  Invalid direction if they're already set to turn that way
                //  Or there is no tile there, or the tile isn't index a floor tile
                return false;
            }
        else{
          return true;
        }   
        }
        
        else if(dirs[Phaser.LEFT].index === this.safetile || dirs[Phaser.RIGHT].index === this.safetile){
          if (dirs[turnTo] === null || dirs[turnTo].index !== this.safetile || curr === this.opposites[turnTo])
            {
                //  Invalid direction if they're already set to turn that way
                //  Or there is no tile there, or the tile isn't index a floor tile
                return false;
            }
        else{
          return true;
        }   
        }
       
        if (dirs[turnTo] === null || dirs[turnTo].index !== this.safetile || curr === this.opposites[turnTo])
            {
                //  Invalid direction if they're already set to turn that way
                //  Or there is no tile there, or the tile isn't index a floor tile
                return false;
            }
        else{
          return true;
        }
        
      },
      
      
        checkRedDirection: function (turnTo) {

            if (this.redDirections[turnTo] === null || this.redDirections[turnTo].index !== this.safetile)
            {
              
                //  Invalid direction if they're already set to turn that way
                //  Or there is no tile there, or the tile isn't index a floor tile
                return;
            }

            //  Check if they want to turn around and can
            if (this.redCurrent === this.opposites[turnTo])
            {
              
                this.redMove(turnTo);
            }
            else
            {
              
                this.redTurn = turnTo;

                this.redTurnPoint.x = (this.redMarker.x * this.gridsize) + (this.gridsize / 2);
                this.redTurnPoint.y = (this.redMarker.y * this.gridsize) + (this.gridsize / 2);
            }

        },

      redGhostTurn: function(){
        
          var cx = Math.floor(this.redGhost.x);
           var cy = Math.floor(this.redGhost.y);

            //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
            if (!this.math.fuzzyEqual(cx, this.redTurnPoint.x, this.redTurnPoint) || !this.math.fuzzyEqual(cy, this.redTurnPoint.y, this.threshold))
            {
                return false;
            }

            this.redGhost.x = this.redTurnPoint.x;
            this.redGhost.y = this.redTurnPoint.y;

           this.redGhost.body.reset(this.redTurnPoint.x, this.redTurnPoint.y);
          
            this.redMove(this.redTurn);

            this.redTurn = Phaser.NONE;

            return true;
        
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

      redMove: function(direction){
        
        var speed = this.speed;
        
        if(direction === this.redCurrent){
          return ;
        }
            if (direction === Phaser.LEFT || direction === Phaser.UP)
            {
                speed = -speed;
            }

            if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
            {
                this.redGhost.body.velocity.x = speed;
            }
            else
            {
                this.redGhost.body.velocity.y = speed;
            }

            this.redGhost.scale.x = 1;
            this.redGhost.angle = 0;
          
           
        if(direction === Phaser.RIGHT){
          this.redGhost.play('redHorizontalGhost');
        }
          else if (direction === Phaser.LEFT)
            {
              this.redGhost.play('redHorizontalGhost');
                this.redGhost.scale.x = -1;
            }
            else if (direction === Phaser.UP)
            {
                this.redGhost.play('redUpGhost');
            }
            else if (direction === Phaser.DOWN)
            {
                this.redGhost.play('redDownGhost');
            }

            this.redCurrent = direction;
        
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
        this.score++;
        this.scoreText.text = this.scoreString + this.score;
            if (this.dots.total === 0)
            {
                if(stage < 2)
                  stage ++;
                this.pacman.kill();
                this.redGhost.kill();
                this.dots.callAll('kill');
                this.stateText.text=" YOU WON \n Click to try next level";
              this.stateText.visible = true;
              this.input.onTap.addOnce(this.restart,this);
            }

        },
      
        die: function () 
      {
        
        this.score = -1;
        this.pacman.kill();
        this.redGhost.kill();
        this.dots.callAll('kill');
        this.stateText.text=" GAME OVER \n Click to restart";
        this.stateText.visible = true;
        this.input.onTap.addOnce(this.restart,this);
        },

        update: function () {
          
          this.physics.arcade.collide(this.pacman, this.layer);
          this.physics.arcade.overlap(this.pacman, this.redGhost, this.die, null, this);
          this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);
          this.physics.arcade.collide(this.redGhost, this.layer, function(){
            if(this.redTurn !== this.redCurrent){
              return;
            }else
              this.redMove(this.opposites[this.redCurrent]);
          },null,this);
          
          this.marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
          this.marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;
          
          this.redMarker.x = this.math.snapToFloor(Math.floor(this.redGhost.x), this.gridsize) / this.gridsize;
          this.redMarker.y = this.math.snapToFloor(Math.floor(this.redGhost.y), this.gridsize) / this.gridsize;
          
          //  Update our grid sensors
          this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
          this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
          this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
          this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);
          
          this.redDirections[1] = this.map.getTileLeft(this.layer.index, this.redMarker.x, this.redMarker.y);
          this.redDirections[2] = this.map.getTileRight(this.layer.index, this.redMarker.x, this.redMarker.y);
          this.redDirections[3] = this.map.getTileAbove(this.layer.index, this.redMarker.x, this.redMarker.y);
          this.redDirections[4] = this.map.getTileBelow(this.layer.index, this.redMarker.x, this.redMarker.y);
          
          
          if(this.junction(this.redDirections, this.redCurrent) ){
            if(this.redMarker.x > this.marker.x && this.canTurn(Phaser.LEFT,this.redDirections,Phaser.NONE)){
              this.redTurn = Phaser.LEFT;
            }
            else if(this.redMarker.y > this.marker.y && this.canTurn(Phaser.UP,this.redDirections,Phaser.NONE)){
              this.redTurn = Phaser.UP;
            }
            else if(this.redMarker.y < this.marker.y && this.canTurn(Phaser.DOWN,this.redDirections,Phaser.NONE)){
              this.redTurn = Phaser.DOWN;
            }
            else if(this.redMarker.x < this.marker.x && this.canTurn(Phaser.RIGHT,this.redDirections,Phaser.NONE)){
              this.redTurn = Phaser.RIGHT;
            }
            /*
            var rnd;
            rnd = rand(1,10);
            if(rnd === 1){
              this.redTurn = Phaser.UP;
            }
            else if(rnd === 2){
              this.redTurn = Phaser.DOWN;
            }else if(rnd === 3){
              this.redTurn = Phaser.LEFT;
            }
            else if(rnd === 4){
              this.redTurn = Phaser.LEFT;
            }
            else{
              this.redTurn = Phaser.NONE;
            }*/
            //this.score = this.redTurn;
          }else if(this.blocked(this.redDirections, this.redCurrent)){
            this.redTurn = this.opposites[this.redCurrent];
          }
            if (this.redTurn !== Phaser.NONE)
            {
                 this.redMove(this.redTurn);
            }
         
             
      
          this.checkKeys();
          
          if (this.turning !== Phaser.NONE)
            {
                this.turn();
            }
  
        },
      blocked: function(dirs, curr){
        if(dirs[curr].index !== this.safetile)
        {
            if(curr === Phaser.UP || curr === Phaser.DOWN){
            if(dirs[Phaser.LEFT].index !== this.safetile && dirs[Phaser.RIGHT].index !== this.safetile ){
              return true;
            }
          }
          else if(curr === Phaser.LEFT || curr === Phaser.RIGHT){
            if(dirs[Phaser.UP].index !== this.safetile && dirs[Phaser.DOWN].index !== this.safetile ){
              return true;
            }
          }
          return false;
        }
        else {
          return false;
        }
          
      },
        restart : function() {
          this.state.restart();
        }
      
    };


game.state.add('Game', PhaserGame);
game.state.start('Game');