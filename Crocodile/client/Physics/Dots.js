import Phaser from 'phaser';
import { socket } from '../scenes/socket';

export class Dots extends Phaser.Physics.Arcade.Group {
    constructor(world, scene, map) {
        super(world, scene);    
        for (var i = 0; i < map.objects[0].objects.length; i++)
        {
            this.create(map.objects[0].objects[i].x, map.objects[0].objects[i].y, 'dot');
        }
    }

    collisionWithPacman(player, dot) {
        dot.disableBody(true, true);
        if (this.isMultiplayer) {
            socket.emit("eat_dot_client", dot);
        }
        this.dots.updateScore(player);
    }

    updateScore(player) {
        player.score += 5; 
        player.scoreObj.node.innerHTML = player.name + ": " + player.score;
    }
}