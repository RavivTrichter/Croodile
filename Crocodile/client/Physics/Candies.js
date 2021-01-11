import Phaser from 'phaser'
import { Questions } from '../../Classes/Questions';
import { SCENES, TILEMAPS, CONFIG, TILESETS, SPRITES } from '../constants';
import { socket } from '../scenes/socket';

export class Candies extends Phaser.Physics.Arcade.Group {

    //question candies
    constructor(world,scene,map) {
        /***** Add special candies *****/
        super(world,scene);
        for (var i = 0; i < map.objects[1].objects.length; i++)
        {
            this.create(map.objects[1].objects[i].x,map.objects[1].objects[i].y, 'candy', 0);
        }
        this.questions = new Questions();   
    }

    displayQuestion() {} //displaying the question on the board

    displayColorOfAnswerGhost() {} //displaying color of ghosts that will be the answers

    collisionWithPacman(player,candy) {
        console.log("Candy : collsion with pacman",player.body);
        candy.disableBody(true, true);
        this.pacmanGame.SetEatbleGhosts(true);
        this.scene.pause();
        var question = this.candies.questions.getRandomQuestion(); //add after we defined multiplayer variable
        var randomIndex = Math.floor(Math.random() * 4) + 1;
        if (this.isMultiplayer) {
            socket.emit("display_question_client", this.candies.questions.getCurrentQuestion(), randomIndex, candy)
        }
        this.candies.displayQuestion(this, question, randomIndex);
    }

    displayQuestion(scene, question ,answerIndex) {
        var element = scene.add.dom(0, 0).createFromCache('smalldiv');
        let questionText = element.getChildByID("questionText");
        
        for (var i = 1, j = 0 ; i <= 4 ; i++) {
            let answer = element.getChildByID("answer" + i);
            if (i == answerIndex) {
                answer.innerHTML += question.correct_answer;
                scene.pacmanGame.correctAnswerColor = answer.style.color;
            } else {
                answer.innerHTML += question.incorrect_answers[j++];
            }
        }
        questionText.innerHTML += question.question;
        this.elementCountinue = element;
        var continueButton = element.getChildByID("continueButton");
            continueButton.addEventListener('click', function() {
            element.getChildByID("bubbleQuestion").hidden = true;
			element.getChildByID("questionText").innerHTML = "";
			for (var i = 1; i <= 4; i++) {
				element.getChildByID("answer" + i).innerHTML = "";
            } 
            if (element.scene.isMultiplayer) {
                socket.emit("resume_after_eating_candy_client");
                element.scene.scene.resume(SCENES.MULTIPLAYER);
            } else {
                element.scene.scene.resume("MAIN_SCENE_KEY");
            }
        });
 
    }


    







}