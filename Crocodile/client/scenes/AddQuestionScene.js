import Phaser from 'phaser';

export class AddQuestionScene extends Phaser.Scene {

    constructor() {
        super({key: "ADD_QUESTION_SCENE_KEY"});
    }

    preload ()
    {
        this.load.html('addQuestion', 'assets/HTML/AddQuestion.html');
    }
    
    create ()
    {
        var button_div = this.add.dom(700, 300).createFromCache('addQuestion');

        var buttonAddQues = button_div.getChildByID("ButtonAddQues");

        buttonAddQues.addEventListener('click', function() {
            var category = button_div.getChildByName("Category").value;
            var difficulty = button_div.getChildByName("Difficulty").value;
            var question = button_div.getChildByName("Question").value;
            var correctAnswer = button_div.getChildByName("CorrectAnswer").value;
            var incorrectAnswers = [ button_div.getChildByName("Answer1").value, button_div.getChildByName("Answer2").value, button_div.getChildByName("Answer3").value ];

			const question_Obj = {'category' : category, 'type' : "multiple", 'difficulty' : difficulty, 'question' : question, 'correct_answer' : correctAnswer, 'incorrect_answers' : incorrectAnswers};
			fetch("/api/items/addQuestion", {
				method : "POST",
				headers: {
					'Content-Type' : 'application/json',
				},
				body: JSON.stringify(question_Obj)
			}).then(res=>{
				return res.json();
			}).then(data=>{
			}).catch(err=>{
			});   
         }, false);

    var buttonHome = button_div.getChildByID("HomeButton");

    buttonHome.addEventListener('click', function() {
        button_div.scene.scene.start("SECOND_SCENE_KEY");
    }, false);
    }
    
}