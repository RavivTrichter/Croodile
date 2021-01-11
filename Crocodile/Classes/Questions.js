export class Questions {
    constructor() {
    	var jsonFile = require('../server/data/questions.json');
        this.questionsArr = [];
        this.currentQuestion = {};
        this.loadQuestions(jsonFile);
        this.index = Math.floor(Math.random() * this.questionsArr.length); //random index for generate a random question
    }

    loadQuestions(jsonFile) { // loading of all questions in json file to array
        var i;
        for (i = 0; i < jsonFile.results.length; i++) {     
            this.questionsArr.push({question:          jsonFile.results[i].question, 
                                    correct_answer:    jsonFile.results[i].correct_answer,
                                    incorrect_answers: jsonFile.results[i].incorrect_answers});
        }
    }

    getRandomQuestion() { // return random qustion
        this.currentQuestion = this.questionsArr[this.index];
        this.index = (++this.index) % (this.questionsArr.length); //this row promise that we dont generate the same question
        return this.currentQuestion;
    }

    getCurrentQuestion() {
        return this.currentQuestion;
    }

}
