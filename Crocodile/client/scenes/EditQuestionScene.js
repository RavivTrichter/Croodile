import Phaser from 'phaser';

export class EditQuestionScene extends Phaser.Scene {

    constructor() {
        super({key: "EDIT_QUESTION_SCENE_KEY"});
    }
    init({ question, index }) {
		this.question   = question;
		this.index = index;
	}

    preload ()
    {
        this.load.html('EditQuestion', 'assets/HTML/EditQuestion.html');
    }
    
    create ()
    {
        var button_div = this.add.dom(700, 300).createFromCache('EditQuestion');
        var buttonEditQues = button_div.getChildByID("ButtonEditQues");

        var categoryInput = button_div.getChildByName("Category");
        var difficultyInput = button_div.getChildByName("Difficulty");
        var questionInput = button_div.getChildByName("Question");
        var correctAnswerInput = button_div.getChildByName("CorrectAnswer");
        var incorrectAnswersInput1 = button_div.getChildByName("Answer1");
        var incorrectAnswersInput2 = button_div.getChildByName("Answer2");
        var incorrectAnswersInput3 = button_div.getChildByName("Answer3");

        categoryInput.value = this.question.category;
        difficultyInput.value = this.question.difficulty;
        questionInput.value = this.question.question;
        correctAnswerInput.value = this.question.correct_answer;
        incorrectAnswersInput1.value = this.question.incorrect_answers[0];
        incorrectAnswersInput2.value = this.question.incorrect_answers[1];
        incorrectAnswersInput3.value = this.question.incorrect_answers[2];
        var index_q = this.index;
        buttonEditQues.addEventListener('click', function() {
            var category = categoryInput.value;
            var difficulty = difficultyInput.value;
            var question = questionInput.value;
            var correctAnswer = correctAnswerInput.value;
            var incorrectAnswers = [ incorrectAnswersInput1.value, incorrectAnswersInput2.value, incorrectAnswersInput3.value ];

			const question_Obj = {'category' : category, 'type' : "multiple", 'difficulty' : difficulty, 'question' : question, 'correct_answer' : correctAnswer, 'incorrect_answers' : incorrectAnswers};
			fetch("/api/items/editQuestion", {
				method : "POST",
				headers: {
					'Content-Type' : 'application/json',
				},
				body: JSON.stringify({ 'question': question_Obj, 'index': index_q})
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