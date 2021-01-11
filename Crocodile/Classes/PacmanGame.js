export class PacmanGame {
    
    constructor(ghosts) {
        this.eatableGhost = false;
        this.correctAnswerColor = undefined;
        this.flag = false;
        this.Ghosts = ghosts;

    }
    
    SetEatbleGhosts(eatble)
    {
        this.eatableGhost = eatble;
        if (this.eatableGhost) {
            for (var i=0; i<this.Ghosts.length; i++)
                this.Ghosts[i].play("ghost_eatable" + i);
            
        }
        else{
            for (var i=0; i<this.Ghosts.length; i++)
                this.Ghosts[i].play('ghost' + this.Ghosts[i].colorIndex + this.Ghosts[i].direction);
            
        }
    }
    
    isGhostsEatble(){
        return this.eatableGhost;
    }
}