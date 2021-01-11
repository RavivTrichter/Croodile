
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const fs = require('fs');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

/**
 * we export a function that takes a list of users and returns 
 * an api router that manages users
 * example usage:
 * const authApi = require("/api/auth");
 * app.use("api",authApi(users))
 */

router.post('/auth/register', (req, res) => {
	const { username, password } = req.body;
	const usersFile = fs.readFileSync("server/data/accounts.json");
	const usersFileParsed = JSON.parse(usersFile);
	const usersArray = usersFileParsed['users'];
	//check if username is valid
	if (!username || username.length < 4) {
		res.status(400).json({ message: 'username should be more than 4 characters' });
		return;
	}
	//check if password is valid
	if (!password || password.length < 4) {
		res.status(400).json({ message: 'password should be more than 4 characters' });
		return;
	}
	//check if username already exists
	if (usersArray.find(u => u.username === username)) {
		res.status(400).json({ message: 'a user with this username already exists' });
		return;
	}

	//store the username hashed password and salt so we can compare login hashes
	usersArray.push({ "username": username, "password": password,"highestScore":0});
	fs.writeFileSync("server/data/accounts.json", JSON.stringify(usersFileParsed));
	res.status(201).end();
});

router.post('/auth/login', (req, res) => {
	const { username, password } = req.body;
	const usersFile = fs.readFileSync("server/data/accounts.json");
	const usersFileParsed = JSON.parse(usersFile);
	const usersArray = usersFileParsed['users'];
	//check if credentials are valid
	if (!username || username.length < 4 || !password || password.length < 4) {
		res.status(400).json({ message: 'invalid username or password' });
		return;
	}
	const user = usersArray.find(u => u.username === username);
	if (!user) {
		//good practice to not give details about failed authentication
		res.status(400).json({ message: 'invalid username or password' });
		return;
	}

	if (password !== user.password) {
		res.status(400).json({ message: 'invalid password' });
		return;
	}
	res.status(200).end();
	return;
});
	module.exports = router;