import Phaser from 'phaser';
import { SCENES, TILEMAPS, CONFIG, TILESETS, SPRITES, DIRECTIONS } from '../constants';
import { CLIENT_EVENTS, SERVER_EVENTS } from '../../shared/src/socket-events';
import { Pacman } from '../Sprites/Pacman';
import { Ghost } from '../Sprites/Ghost';
import { socket } from '../scenes/socket';
import {Candies} from '../Physics/Candies';
import {Dots} from '../Physics/Dots';
import { PacmanGame } from '../../Classes/PacmanGame';



const positions = [{ x: 420, y: 464 }, { x: 430, y: 464 }]; 

export class MultiPlayerScene extends Phaser.Scene {

	constructor() {
		super({ key: SCENES.MULTIPLAYER });

	}
	init({ roomId, players }) {
		this.roomId   = roomId;
		this.isMaster = players[0] === socket.id;
		this.players  = players;
	}
	preload() {
		
		this.load.image("tiles", "/assets/tileMap/tile.png");
        this.load.image("dot", "/assets/tileMap/dot.png");
        this.load.image("candy", "/assets/tileMap/quest-candy.png");
        this.load.image('crocoHeart',"/assets/HTML/style/1704467.png");
        this.load.tilemapTiledJSON("map", "/assets/tileMap/walls.json");
        this.load.spritesheet(SPRITES.PACMAN, '/assets/pacman.png',{ frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('GHOST_SPRITE', '/assets/ghosts32.png',{ frameWidth: 32, frameHeight: 32 });
        this.load.html('smalldiv', '/assets/HTML/questionBubble.html');
		this.load.html('gameover', '/assets/HTML/gameOver.html');
		this.load.html('youwin', '/assets/HTML/youWin.html');

	}

	create() {  
		
		this.isMultiplayer = true;
        /***** Add tilesMap *****/
        this.map      = this.make.tilemap({ key: "map" });
        this.tileset  = this.map.addTilesetImage("tile", "tiles");
        this.mapLayer = this.map.createStaticLayer('map', this.tileset);

        this.mapLayer.setCollisionBetween(56, 56); //47 is the number of tiles

        this.dots = new Dots(this.physics.world, this, this.map);
        
        /***** Add special candies *****/    
		this.candies = new Candies(this.physics.world, this, this.map);
		
        var style = {'font-family':'cursive','color' : 'red'}
        var score = this.add.dom(900,50,'h1',style,'Score :');
        var scorePlayer1 = this.add.dom(930,100,'h1',style,'player1: 0');
        var scorePlayer2 = this.add.dom(930,150,'h1',style,'player2: 0');
        
		this.playersMap = {};
		this.players = this.players.map((id, index) => {
			const { x, y } = positions[index];
			if (id === socket.id) {
                this.me = new Pacman(this, this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT' }), scorePlayer1,"player1", x, y);
				this.me.addLivesImages({scene: this, posX: 1150, posY: 128})
				return this.me;
			} else {
				this.playersMap[id] = new Pacman(this, this.input.keyboard.addKeys({ up: 'W', down: 'S', right: 'D', left: 'A' }), scorePlayer2, "player2", x, y);
				this.notMe = this.playersMap[id];
				this.notMe.addLivesImages({scene: this, posX: 1150, posY: 178})
				return this.playersMap[id];
			}
		});
        
        var GhostColors = ["blue", "yellow", "pink", "red"];
        this.Ghosts = [];
        
        for (var i=0; i<GhostColors.length; i++)
        {
			this.Ghosts[i] = new Ghost({scene: this, x: 495, y: 335, key: "GHOST_SPRITE", color: GhostColors[i], color_index: i});

            this.anims.create({
                key: 'ghost' + i + `${DIRECTIONS.LEFT}`, 
                frames: [ { key: 'GHOST_SPRITE', frame: i*4 } ],
            });
            this.anims.create({
                key: 'ghost' + i + `${DIRECTIONS.UP}`, 
                frames: [ { key: 'GHOST_SPRITE', frame: (i*4)+1 } ]
               
            });
            this.anims.create({
                key: 'ghost' + i + `${DIRECTIONS.DOWN}`, 
                frames: [ { key: 'GHOST_SPRITE', frame:  (i*4)+2 } ]
            });
            this.anims.create({
                key: 'ghost' + i + `${DIRECTIONS.RIGHT}`,
                frames: [ { key: 'GHOST_SPRITE', frame:  (i*4)+3 } ]
            });

            this.anims.create({
                key: 'ghost_eatable' + i,
                frames: this.anims.generateFrameNumbers('GHOST_SPRITE', { frames: [i*4, 18] }),
                frameRate: 6,
                repeat: -1
            
            });
            this.Ghosts[i].setScale(0.9)
            this.Ghosts[i].play("ghost" + i + `${DIRECTIONS.UP}`)

        }
		this.pacmanGame = new PacmanGame(this.Ghosts);
        /***** collider functions *****/
        this.physics.add.collider([...this.players, ...this.Ghosts], this.mapLayer);
		
		window.ghosts = this.Ghosts;
		window.walls = this.mapLayer;
        /***** overlaps functions *****/
        this.physics.add.overlap(this.me, this.dots, this.dots.collisionWithPacman, null, this);
        this.physics.add.overlap(this.me, this.candies, this.candies.collisionWithPacman, null, this);
        this.physics.add.overlap(this.me, this.Ghosts,  this.Ghosts[0].collisionWithGhost, null, this);


        this.setUpListeners();
        this.setUpEmitters();
		
	}
    
    setUpEmitters() {
		this.updateInterval = setInterval(() => {
			socket.emit(CLIENT_EVENTS.MOVE, {
				x: this.me.x,
				y: this.me.y,
				angle: this.me.angle,
			});
			if (this.isMaster) {
				socket.emit(CLIENT_EVENTS.UPDATE, this.Ghosts.map(g => {
					return {
						x: g.x,
						y: g.y,
						direction: g.direction
					};
				}), this.roomId);
			}
		}, CONFIG.UPDATE_RATE);
	}
    
    setUpListeners() {
		socket.on(SERVER_EVENTS.USER_MOVED, (id, { x, y, angle }) => {
			const pacman = this.playersMap[id];
			pacman.setX(x);
			pacman.setY(y);
			pacman.setAngle(angle);
			pacman.updateVelocity();
        });
        
		socket.on(SERVER_EVENTS.UPDATE, ( ghosts ) => {
            ghosts.forEach((g, index) => {
				const ghost = this.Ghosts[index];
				ghost.setX(g.x);
				ghost.setY(g.y);
				if (ghost.direction !== g.direction) {
					ghost.direction = g.direction;
				}
			});
		});
		socket.on(SERVER_EVENTS.USER_LEFT, (id) => {
			const player = this.playersMap[id];
			const pindex = this.players.indexOf(player);
			player.destroy();
			this.players.splice(pindex, 1);
		});
		socket.on("display_question_server", (question, answerIndex, candy) => {
			this.pacmanGame.SetEatbleGhosts(true);
			this.scene.pause();
			var thisCandy = this.getCandy(candy.x, candy.y)
			thisCandy.disableBody(true, true)
			this.candies.displayQuestion(this, question, answerIndex);
		});
		socket.on("eat_dot_server", (dot) => {
			var thisDot = this.getDot(dot.x, dot.y)
			thisDot.disableBody(true, true)
			this.dots.updateScore(this.notMe);
		});
		socket.on("eat_correct_candy_server", (dot) => {
			this.candies.updateScore(this.notMe);
		});
		socket.on("touch_correct_ghost_server", () => {
			this.Ghosts[0].touchCorrectGhost(this.notMe, this);
		});
		socket.on("destroy_crorco_server", () => {
			this.notMe.imgCrocoPlayerLives[this.notMe.livesPlayerCnt++].destroy();
		});
		socket.on("you_win_server", () => {
			this.add.dom(0, 0).createFromCache('youwin');
			this.time.delayedCall(2000, this.Ghosts[0].onEvent, [], this.Ghosts[0]);
		});
		socket.on("update_ghost_anims_server", (ghost, colorIndex, direction) => {
			this.Ghosts[colorIndex].anims.play('ghost' + colorIndex + direction);
		});
		socket.on("resume_after_eating_candy_server", () => {
			this.candies.elementCountinue.getChildByID("bubbleQuestion").hidden = true;
			this.candies.elementCountinue.getChildByID("questionText").innerHTML = "";
			for (var i = 1; i <= 4; i++) {
				this.candies.elementCountinue.getChildByID("answer" + i).innerHTML = "";
            } 
			this.scene.resume(SCENES.MULTIPLAYER);
		});
		

	}
    
    update() {

		this.physics.world.wrap([...this.players, ...this.Ghosts], CONFIG.FRAME_SIZE / 2);
		this.me.move(this.mapLayer);
		if (this.isMaster) {
			this.Ghosts.forEach(g => g.move(this.mapLayer));
        }
        
	}

	getDot(x, y) {
		for (var i = 0; i < this.dots.children.entries.length; i++) {
			if (this.dots.children.entries[i].x == x && this.dots.children.entries[i].y == y) {
				return this.dots.children.entries[i];
			}
		}
	}

	getCandy(x, y) {
		for (var i = 0; i < this.candies.children.entries.length; i++) {
			if (this.candies.children.entries[i].x == x && this.candies.children.entries[i].y == y) {
				return this.candies.children.entries[i];
			}
		}
	}
} 