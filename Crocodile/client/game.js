import Phaser from 'phaser';
import {MainScene} from './scenes/MainScene';
import {LoginScene} from './scenes/LoginScene';
import {SecondScene} from './scenes/SecondScene';
import { WaitingForPlayersScene } from './scenes/WaitingForPlayersScene';
import { MultiPlayerScene } from './scenes/MultiPlayerScene';
import { AddQuestionScene } from './scenes/AddQuestionScene';
import { EditQuestionScene } from './scenes/EditQuestionScene';
import { QuestionListScene } from './scenes/QuestionListScene';
import { HistoryScene} from './scenes/HistoryScene';

const config = {
    type: Phaser.CANVAS, // Which renderer to use
    width: window.innerWidth, // Canvas width in pixels
    height: window.innerHeight, // Canvas height in pixels
    parent: "body", // ID of the DOM element to add the canvas to
    scene: [LoginScene, HistoryScene, WaitingForPlayersScene, MultiPlayerScene, MainScene, SecondScene, AddQuestionScene, QuestionListScene, EditQuestionScene],
    transparent: true,
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0},
            debug: false
        }
    }
  };
  
  const game = new Phaser.Game(config); 

  function add_account(name, password) {
      const user = {'name' : name, 'password' : password};
      fetch("/add_account", {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(user)
      }).then(res=>{
          return res.json();
      }).then(data=>{
          console.log(data);
      }).catch(err=>{

      });
  }

  window.add_account = add_account;
