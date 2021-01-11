import Phaser from 'phaser';
import {Pacman} from '../Sprites/Pacman';
import {Candies} from '../Physics/Candies';
import {Dots} from '../Physics/Dots';
import { Ghost } from '../Sprites/Ghost';
import { PacmanGame } from '../../Classes/PacmanGame';
import { SPRITES, ANIMATIONS, DIRECTIONS , CONFIG} from '../constants'

export class MainScene extends Phaser.Scene {
    
    
    constructor() {
        super({key: "MAIN_SCENE_KEY"});
        this.multiplayerOn = window.multiplayerOn;
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
        this.load.html('toolbar', "/assets/HTML/PauseButton.html");
        
    }

    create() {
        /*loads button bar*/ 
        this.isPause = false;
        var button_div = this.add.dom(1000, 300).createFromCache('toolbar');

        var homeButton   = button_div.getChildByID("home");
        var pauseButton  = button_div.getChildByID("pause");
        var logoutButton = button_div.getChildByID("logout");

        homeButton.addEventListener('click', function() {
            button_div.scene.scene.start("SECOND_SCENE_KEY");    
        }, false);

        pauseButton.addEventListener('click', function() {
            if (!this.isPause) {
                this.isPause = true;
                button_div.scene.scene.pause();
            }
            else {
                this.isPause = false;
                button_div.scene.scene.resume();
            }
        }, false);

        logoutButton.addEventListener('click', function() {
            button_div.scene.scene.pause();
            button_div.scene.scene.start("LOGIN_SCENE_KEY"); 
        }, false);


        this.isMultiplayer = false;

        /***** Loading HTML pages and objects *****/
        var style = {'font-family':'cursive',
                     'color' : 'red'}
        var score = this.add.dom(900,50,'h1',style,'Score :');
        var scorePlayer1 = this.add.dom(930,100,'h1',style,'player1: 0');
        
        this.multiplayerOn = window.multiplayerOn;
        this.game.config.transparent = false;
        
        
        /***** Add tilesMap *****/
        this.map      = this.make.tilemap({ key: "map" });
        this.tileset  = this.map.addTilesetImage("tile", "tiles");
        this.mapLayer = this.map.createStaticLayer('map', this.tileset);
        
        // const mapLayer = this.map.createStaticLayer("map", tileset, 0, 0);
        this.mapLayer.setCollisionBetween(56, 56); //47 is the number of tiles
    
        this.map.addTilesetImage("dot", "dot");
        this.map.addTilesetImage("quest-candy", "candy");
                
        /***** Add dots *****/    
        this.dots = new Dots(this.physics.world, this, this.map);
        
        /***** Add special candies *****/    
	    this.candies = new Candies(this.physics.world, this, this.map);

        
        this.players = [];
        
        if (this.multiplayerOn) {
            var scorePlayer2 = this.add.dom(930,150,'h1',style,'player2: 0');
            this.players = [  
                new Pacman(this, this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT' }), scorePlayer1, "player1", 420, 464),
                new Pacman(this, this.input.keyboard.addKeys({ up: 'W', down: 'S', right: 'D', left: 'A' }),            scorePlayer2, "player2", 430, 464)
            ];
            this.players[0].addLivesImages({scene: this, posX: 1150, posY: 128})
            this.players[1].addLivesImages({scene: this, posX: 1150, posY: 178})
        }
        else {
            this.players = [  
                new Pacman(this, this.input.keyboard.addKeys({ up: 'UP', down: 'DOWN', right: 'RIGHT', left: 'LEFT' }), scorePlayer1,"player1", 420, 464)
            ];
            this.players[0].addLivesImages({scene: this, posX: 1150, posY: 128})
        }
        
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
        
        /***** Add Game Object *****/
        this.pacmanGame = new PacmanGame(this.Ghosts);

        /***** collider functions *****/
        this.physics.add.collider([...this.players, ...this.Ghosts], this.mapLayer);
        
        /***** overlaps functions *****/
        this.physics.add.overlap(this.players, this.dots,    this.dots.collisionWithPacman, null, this);
        this.physics.add.overlap(this.players, this.candies, this.candies.collisionWithPacman, null, this);
        this.physics.add.overlap(this.players, this.Ghosts,  this.Ghosts[0].collisionWithGhost, null, this).name = 'platform_collider';
    }
    initTileMap(){
        
    }
    update(time, delta) {
        // Runs once per frame for the duration of the scene
        this.physics.world.wrap([...this.players, ...this.Ghosts], CONFIG.FRAME_SIZE / 2);
        this.players.forEach(p => p.move(this.mapLayer));
        this.Ghosts.forEach(g => g.move(this.mapLayer));
    }

}
