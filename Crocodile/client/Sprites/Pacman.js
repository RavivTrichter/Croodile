import Phaser from 'phaser'
import  { SPRITES, ANIMATIONS, DIRECTIONS } from '../constants';

export class Pacman extends Phaser.GameObjects.Sprite {
    constructor(scene, inputs, scoreObj, name, x, y) {
        super(scene, x, y, "PACMAN_SPRITE");
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);
        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
		this.body.maxSpeed = 120;
		this.inputs = inputs;
		this.body.setVelocity(0, 0);
        this.setScale(0.95);
        this.score = 0;
        this.scoreObj = scoreObj;
		this.name = name;
		this.livesPlayerCnt = 0;
		this.imgCrocoPlayerLives = [];
		this.prevCollideX = 0;
		this.prevCollideY = 0;
        
        
        this.animation = scene.anims.create({
			key: `${ANIMATIONS.PACMAN}_${Pacman.Count++}`,
			frames: scene.anims.generateFrameNumbers(SPRITES.PACMAN, { frames: [3, 2, 1, 0] }),
			frameRate: 12,
			yoyo: false,
			repeat: -1,
		});
		this.anims.play(this.animation);
	}
	
	addLivesImages({scene, posX, posY}) {
        var styleCroco = {'text-align':'center', 'position':'absolute', 'height': '50px' ,'width': '50px', 'background-repeat':'no-repeat',
        'background-size': '100% 100%','background-position':'center', 'background-image': 'url("../assets/HTML/style/1704467.png")','resize':'both'};
        var crocoPlayer = [ scene.add.dom(posX, posY, 'div', styleCroco),
        scene.add.dom(posX+50, posY, 'div', styleCroco), scene.add.dom(posX + 100, posY, 'div', styleCroco) ];
        this.imgCrocoPlayerLives = crocoPlayer; 
    }

    move(walls) {
        // get the current tiles and its neighbors ( true means it will return an empty tile instead of null)
        const current = walls.getTileAtWorldXY(this.x, this.y, true);
		// if there's no current tile ( which means we are moving through the screen) dont do anything
		if (!current) {
			return;
		}
		// get the neighbor tiles
		const { up, down, right, left } = this.inputs;
		const neighbors = {
            [DIRECTIONS.UP]: walls.getTileAt(current.x, current.y - 1),
			[DIRECTIONS.DOWN]: walls.getTileAt(current.x, current.y + 1),
			[DIRECTIONS.RIGHT]: walls.getTileAt(current.x + 1, current.y),
			[DIRECTIONS.LEFT]: walls.getTileAt(current.x - 1, current.y)
        };
        		// check if a key is down and the tile in that direction is not a wall
		if (up.isDown && neighbors[DIRECTIONS.UP] == null) {
			this.turn(DIRECTIONS.UP, current, neighbors.up);
			this.animation.resume();

        }
        else if (down.isDown && neighbors[DIRECTIONS.DOWN] == null) {
			this.turn(DIRECTIONS.DOWN, current, neighbors.down);
			this.animation.resume();
        }
        else if (left.isDown && neighbors[DIRECTIONS.LEFT] == null) {
			this.turn(DIRECTIONS.LEFT, current, neighbors.left);
			this.animation.resume();
        }
        else if (right.isDown && neighbors[DIRECTIONS.RIGHT] == null) {
			this.turn(DIRECTIONS.RIGHT, current, neighbors.right);
			this.animation.resume();
        }
        
		// if we try to move forward and there's a wall in front stop stop the animation
		if (this.body.onFloor() || this.body.onCeiling() || this.body.onWall()) {
			 this.animation.pause();
		}
		// this.scene.physics.velocityFromAngle(this.angle + 180, 80, this.body.velocity);
		this.updateVelocity();
	}


	updateVelocity() {
		this.scene.physics.velocityFromAngle(this.angle + 180, 80, this.body.velocity);
	}
	/**
	 * Turns pacman to the given direction
	 * @param {Number} direction  The angle direction we want to turn
	 * @param {Phaser.Tilemaps.Tile} current The current Tile we are on 
	 * @param {Phaser.Tilemaps.Tile} neighbor The Tile we are going to turn to
	 */
	turn(direction, current, neighbor) {
		// if we are moving towards the same direction or if there's a neighbor wall we can't turn 
		if (this.angle == direction || neighbor) {
			return;
		}

		// if we are turning to the opposite direction we can turn
		if (Phaser.Math.Angle.WrapDegrees(direction + 180) == this.angle) {
			this.setAngle(direction);
			return;
		}
		// if we're not close enough to the turning point don't turn
		if (!Phaser.Math.Fuzzy.Equal(this.y, current.getCenterY(), 2) || !Phaser.Math.Fuzzy.Equal(this.x, current.getCenterX(), 2)) {
			return;
		}
		// position pacman perfectly on the turn point
		this.body.stop();
		this.setPosition(current.getCenterX(), current.getCenterY());
		this.body.prev.copy(this.body.position); // 
		this.setAngle(direction);
		return true;
	}


}
Pacman.Count = 0;