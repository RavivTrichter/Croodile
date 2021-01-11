import Phaser from 'phaser';

export class QuestionListScene extends Phaser.Scene {

    constructor() {
        super({key: "QUESTION_LIST_SCENE_KEY"});
    }

    preload ()
    {
        this.load.html('questionList', 'assets/HTML/QuestionList.html');
    }
    
    create ()
    {
        var button_div = this.add.dom(700, 100).createFromCache('questionList');
        var questions_Table_div = button_div.getChildByID("QuestionTable");
        
        var row, cell1, cell2, questionsArray;
        fetch("/api/items/getQuestions", {
            method : "GET",
            headers: {
                'Content-Type' : 'application/json',
            }
        }).then(res=>{
            return res.json();
        }).then(data=>{
            questionsArray = data;
            for(var i=0 ; i < data.length;i++) {
                row = questions_Table_div.insertRow(i+1);
                row.style.height = 1;
                cell1 = row.insertCell(0);
                cell2 = row.insertCell(1);
                cell1.innerHTML = i;
                cell2.innerHTML = data[i].question;
            }
        }).catch(err=>{
        });   
        document.getElementById("tb").style.height = 50;

        var buttonEditQues = button_div.getChildByID("ButtonEditQues");
        var buttonDeleteQues = button_div.getChildByID("ButtonDeleteQues");
        var buttonHome = button_div.getChildByID("HomeButton");
        var buttonAddQues = button_div.getChildByID("AddQuesButton");

        buttonHome.addEventListener('click', function() {
        button_div.scene.scene.start("SECOND_SCENE_KEY");
        }, false);

        buttonAddQues.addEventListener('click', function() {
            button_div.scene.scene.start("ADD_QUESTION_SCENE_KEY");
        }, false);
        
        buttonDeleteQues.addEventListener('click', function() {
            var NumOfQuestion = button_div.getChildByName("NumOfQust").value;
            var index = parseInt(NumOfQuestion);
            if(NumOfQuestion.length == 0 || isNaN(NumOfQuestion)) {
                alert("Must input numbers");
            } else {
                if(index < 0 || index >= questionsArray.length) {
                    alert("The index is out of bounds");
                } else {
                    fetch("/api/items/deleteQuestion", {
                        method : "POST",
                        headers: {
                            'Content-Type' : 'application/json',
                        },
                        body: JSON.stringify({"NumOfQuestion": NumOfQuestion})
                    }).then(res=>{
                        return res.json();
                    }).then(data=>{
                    }).catch(err=>{
                    }); 
                }
                }  
            }, false);
                
        
         buttonEditQues.addEventListener('click', function() {
            var NumOfQuestion = button_div.getChildByName("NumOfQust").value;
            var index = parseInt(NumOfQuestion);
            if(NumOfQuestion.length == 0 || isNaN(NumOfQuestion)) {
                alert("Must input numbers");
            } else {
                if(index < 0 || index >= questionsArray.length) {
                    alert("The index is out of bounds");
                } else {
                    button_div.scene.scene.start('EDIT_QUESTION_SCENE_KEY', { "question": questionsArray[index], "index":  index});
                }
            }
        }, false);

    }
    
}