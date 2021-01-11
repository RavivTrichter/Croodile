import Phaser from 'phaser'
import { SCENES,SPRITES, ANIMATIONS, DIRECTIONS } from '../constants';
import { socket } from '../scenes/socket';
import {SecondScene} from '../scenes/SecondScene';

export class Ghost extends Phaser.GameObjects.Sprite {

    constructor({scene, x, y, key, color, color_index}) {
        super(scene, x, y, key);
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);
        this.turning = false;
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        this.body.maxSpeed = 60;
        this.setScale(0.60);
        this.color = color;
        this.colorIndex = color_index;

    }


    move(walls) {   
        // get the current tile the ghost is walking on 
        const current = walls.getTileAtWorldXY(this.x, this.y, true);
        // if current is null we are crossing the screen
        if (current == null) {
            return;
        }
        // get the neighbors (null if none)
        const neighbors = [
            { tile: walls.getTileAt(current.x, current.y - 1), direction: DIRECTIONS.UP },
            { tile: walls.getTileAt(current.x, current.y + 1), direction: DIRECTIONS.DOWN },
            { tile: walls.getTileAt(current.x + 1, current.y), direction: DIRECTIONS.RIGHT },
            { tile: walls.getTileAt(current.x - 1, current.y), direction: DIRECTIONS.LEFT }
        ];

        // do nothing if we moved allready and we don't meet the threshold for turning 
		if (!Phaser.Math.Fuzzy.Equal(this.y, current.getCenterY(), 2) || !Phaser.Math.Fuzzy.Equal(this.x, current.getCenterX(), 2)) {
            return;
		}

        // get the available directions except behind us
        var available = neighbors 
            .filter(x => x.tile == null)
            .filter(({ direction }) => direction == this.direction || (direction + 180) % 180 != (this.direction + 180) % 180);
        if (available.length == 0) {
            available = neighbors
            .filter(x => x.tile == null)
        }

        // take one direction at random
        const { direction } = Phaser.Math.RND.pick(available);
        
        // check if the ghos is turning allready
        if (!this.turning) {
            //if not then check if we need to change the animation / velocity 
            if (this.direction != direction) {
                this.body.reset(current.getCenterX(), current.getCenterY());
                this.scene.physics.velocityFromAngle(direction + 180, 150, this.body.velocity);
                if (!this.scene.pacmanGame.isGhostsEatble()) {
                    this.anims.play("ghost" + this.colorIndex + direction);
                    if (this.scene.isMultiplayer) {
                        socket.emit("update_ghost_anims_client", this, this.colorIndex, direction);
                    }
                }
                this.direction = direction;
            }
            //indicate that the ghost is turning and toggle it back after 1/5 of second
            this.turning = true;
            setTimeout(() => {
                this.turning = false;
            }, 200);
        }

    }
   
    collisionWithGhost(player,ghost) {
        if (player.prevCollideX == player.body.x && player.prevCollideY == player.body.y) {
            return;
        }
        player.prevCollideX = player.body.x;
        player.prevCollideY = player.body.y;
        this.scene.pause();
        ghost.turning = false;
        ghost.x = 495;
        ghost.y = 335;
        player.body.stop();
		player.setPosition(420, 464);
        player.body.prev.copy(player.body.position);
        player.setAngle(0);

        let current_key = this.isMultiplayer ? SCENES.MULTIPLAYER : "MAIN_SCENE_KEY";

        if (this.pacmanGame.isGhostsEatble()) {
            if (this.pacmanGame.correctAnswerColor == ghost.color) {
                if (this.isMultiplayer) {
                    socket.emit("touch_correct_ghost_client");
                }
                ghost.touchCorrectGhost(player, this);
                this.scene.resume(current_key);
                return;
            }
        } else {
        // removing from index zero one "Heart ==> Crocodile"
            if (player.livesPlayerCnt == 2) {
                player.imgCrocoPlayerLives[player.livesPlayerCnt].destroy(); // erasing the "heart"
                // this.scene.pause();
                this.add.dom(0, 0).createFromCache('gameover');
                if (this.isMultiplayer) {
                    socket.emit("you_win_client");
                }
                socket.emit("update_high_scores",window.username, player.score);
                this.time.delayedCall(3000, ghost.onEvent, [], ghost);
                
            } else {
                player.imgCrocoPlayerLives[player.livesPlayerCnt++].destroy();
                if (this.isMultiplayer) {
                    socket.emit("destroy_crorco_client");
                }
            } 
        }
        this.pacmanGame.SetEatbleGhosts(false);
        this.scene.resume(current_key);
        
    }

    touchCorrectGhost(player ,scene) {
        player.score += 100;
        player.scoreObj.node.innerHTML = player.name + ": " + player.score;
        scene.pacmanGame.SetEatbleGhosts(false);
    }

    onEvent() {
        this.scene.scene.isMultiplayer = false;
        this.scene.scene.start("SECOND_SCENE_KEY");
        this.scene.scene.pause();
    }
    
}