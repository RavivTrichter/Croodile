const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.get('/items/getquestions', (req, res) => {
	const questionsFile = fs.readFileSync("server/data/questions.json");
	const questionsFileParsed = JSON.parse(questionsFile);
	const questionsArray = questionsFileParsed['results'];

	res.json(questionsArray);
});


router.post('/items/addQuestion', (req, res) => {
	const questionsFile = fs.readFileSync("server/data/questions.json");
	const questionsFileParsed = JSON.parse(questionsFile);
	const questionsArray = questionsFileParsed['results'];

	//store the question in json file
	questionsArray.push(req.body);
	fs.writeFileSync("server/data/questions.json", JSON.stringify(questionsFileParsed));
	res.status(201).end();
	return;
});

router.post('/items/editQuestion', (req, res) => {
	const { question, index} = req.body;

	const questionsFile = fs.readFileSync("server/data/questions.json");
	const questionsFileParsed = JSON.parse(questionsFile);
	const questionsArray = questionsFileParsed['results'];

	//update question in json file
	questionsArray[index] = question;
	fs.writeFileSync("server/data/questions.json", JSON.stringify(questionsFileParsed));
	res.status(201).end();
	return;
});

router.post('/items/deleteQuestion', (req, res) => {
	const { NumOfQuestion } = req.body;
	var index = parseInt(NumOfQuestion);

	const questionsFile = fs.readFileSync("server/data/questions.json");
	const questionsFileParsed = JSON.parse(questionsFile);
	const questionsArray = questionsFileParsed['results'];

	//delete question from json file
	questionsArray.splice(index,1);
	fs.writeFileSync("server/data/questions.json", JSON.stringify(questionsFileParsed));
	res.status(201).end();
	return;
});

module.exports = router;