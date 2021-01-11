import Phaser from 'phaser';

export class GhostMove extends Phaser.Physics.Arcade.Group {
    constructor(world, scene, map) {
        super(world, scene); 
        for (var i = 0; i < map.objects[1].objects.length; i++)
        {
            this.create(map.objects[1].objects[i].x, map.objects[1].objects[i].y, this.defaultKey,this.defaultFrame,true);
        }
        for(var i = 0 ; i < this.children.entries.length; i++) {
            this.children.entries[i].scaleX = 0.1;
            this.children.entries[i].scaleY = 0.1;
        }
        this.map = map;
    }

    collisionWithGhost(ghost, ghostMove) {
        if (ghost.body.center.x - 1 <= ghostMove.body.center.x && ghostMove.body.center.x <= ghost.body.center.x + 1 &&
            ghost.body.center.y - 1 <= ghostMove.body.center.y && ghostMove.body.center.y <= ghost.body.center.y + 1) {
            const blockedObj = {};  
            let x = Math.ceil(ghostMove.body.center.x / 30) - 1;
            let y = Math.ceil(ghostMove.body.center.y / 30) - 1;
            
            if(!this.map.hasTileAt(x - 1, y) && ghost.lastMove != "right") {
                blockedObj.left = true;
            }
            if(!this.map.hasTileAt(x + 1, y) && ghost.lastMove != "left") {
                blockedObj.right = true;
            }
            if(!this.map.hasTileAt(x, y - 1) && ghost.lastMove != "down") {
                blockedObj.up = true;
            }
            if(!this.map.hasTileAt(x, y + 1) && ghost.lastMove != "up") {
                blockedObj.down = true;
            }

            
            var trueObj = Object.keys(blockedObj)
                                 .filter(k => blockedObj[k])
                                 .map(String);

            var randomIndex = Math.floor(Math.random() * trueObj.length); 
            var randomElement = trueObj[randomIndex];

            switch(randomElement) {
                case "left":
                    ghost.body.setVelocityX(-160);
                    ghost.lastMove = "left";
                  break;
                case "right":
                    ghost.body.setVelocityX(160);
                    ghost.lastMove = "right";
                  break;
                case "up":
                    ghost.body.setVelocityY(-330);
                    ghost.lastMove = "up";
                  break;
                case "down":
                    ghost.body.setVelocityY(160);
                    ghost.lastMove = "down";
                break;

              }
        }
        
    }
}