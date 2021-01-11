import Phaser, { Scenes } from 'phaser';
import { SCENES, CONFIG } from '../constants';

export class SecondScene extends Phaser.Scene {

    constructor() {
        super({key: "SECOND_SCENE_KEY"});
    }

    preload ()
    {
        this.load.html('buttons', 'assets/HTML/ButtonsPage.html');
        this.load.css('loginCss', '/assets/HTML/style/Template.css');
    }
    
    create ()
    {
        var button_div = this.add.dom(700, 600).createFromCache('buttons');
        button_div.width = 600;
        button_div.setPerspective(800);
        
        var Player1Button = button_div.getChildByID("1player");
        var Player2Button = button_div.getChildByID("2player");

        var HistoryButton = button_div.getChildByID("history");
        var QuestMenuButton = button_div.getChildByID("QuestionMenuButton");
        var MultiPlayerButton = button_div.getChildByID("Multiplayer");
        
        if(!window.isAdmin) {
            QuestMenuButton.style.visibility = "hidden";
        }
        
        Player1Button.addEventListener('click', function() {
            window.multiplayerOn = false;
            button_div.scene.scene.start("MAIN_SCENE_KEY");    
        }, false);

        Player2Button.addEventListener('click', function() {
            window.multiplayerOn = true;
            button_div.scene.scene.start("MAIN_SCENE_KEY"); 
        }, false);
        MultiPlayerButton.addEventListener('click', function() {
            window.multiplayerOn = true;
            button_div.scene.scene.start(SCENES.WAITING_FOR_PLAYERS); 
        }, false);
        HistoryButton.addEventListener('click', function() {
            button_div.scene.scene.start("HISTORY_SCENE_KEY"); 
        }, false);

        QuestMenuButton.addEventListener('click', function() {
            button_div.scene.scene.start("QUESTION_LIST_SCENE_KEY"); 
        }, false);

        this.tweens.add({
            targets: button_div,
            y: 350,
            duration: 3000,
            ease: 'Power3'
        });
    }
    
}