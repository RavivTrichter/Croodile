const express = require("express");
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const port = process.env.PORT || 3000;
const fs = require('fs');

const bodyParser = require('body-parser');
var http = require('http');

const uuid = require('uuid'); //TODO: NEED TO INSTALL
const { CLIENT_EVENTS, SERVER_EVENTS } = require('../../shared/src/socket-events');

const authApi = require('./api/auth');
app.use('/api', authApi); // add the apiRouter to the '/api' route
const itemsApi = require('./api/items');
app.use('/api', itemsApi); // add the apiRouter to the '/api' route

app.use("/assets", express.static("assets"));
// support parsing of application/json type post data

app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: false }));


if (process.env.NODE_ENV == "production") {
	//production -> serve our app from the dist folder
	app.use("/", express.static("dist"));
} else {
    const Bundler = require("parcel-bundler");
    const bundler = new Bundler("client/index.html");
    app.use(bundler.middleware());
}


server.listen(port, () => console.log(`Example app listening on http://localhost:${port}`));

const MAX_PLAYERS_IN_ROOM = 2;
const rooms = {};

function join(socketId) {
	for (const id in rooms) {
		const players = rooms[id];
		if (players.length < MAX_PLAYERS_IN_ROOM) {
			players.push(socketId);
			return id;
		}
	}
	const roomId = uuid();
	rooms[roomId] = [socketId];
	return roomId;
}

function leave(socketId) {
	for (const id in rooms) {
		const players = rooms[id];
		if (players.length === 1) {
			delete rooms[id];
			return null;
		}
		const playerIndex = players.indexOf(socketId);
		if (playerIndex > -1) {
			players.splice(playerIndex, 1);
			return id;
		}
	}
}



io.on('connection', function (socket) {
	socket.on(CLIENT_EVENTS.JOIN, () => {
		const roomId = join(socket.id);
		console.log("connection afek")
		socket.join(roomId);
		io.to(roomId).emit(SERVER_EVENTS.ROOM_STATUS, roomId, rooms[roomId], MAX_PLAYERS_IN_ROOM);
	});
	// socket.emit('tx', 'alon') 
	console.log(`socket:${socket.id} connected`);
	socket.on('disconnect', () => {
		const roomId = leave(socket.id);
		if (roomId) {
			io.to(roomId).emit(SERVER_EVENTS.ROOM_STATUS, roomId, rooms[roomId]);
			io.to(roomId).emit(SERVER_EVENTS.USER_LEFT, socket.id);
		}
	});

	socket.on(CLIENT_EVENTS.MOVE, (data) => {
		socket.broadcast.emit(SERVER_EVENTS.USER_MOVED, socket.id, data);
	});
	socket.on(CLIENT_EVENTS.UPDATE, (ghosts, roomId) => {
		// console.log(ghosts)
		// socket.to(roomId).emit(SERVER_EVENTS.UPDATE, { ghosts });
		socket.broadcast.emit(SERVER_EVENTS.UPDATE, ghosts );
	});
	socket.on("display_question_client", (question, answerIndex, candy) => {
		socket.broadcast.emit("display_question_server", question, answerIndex, candy);
	});
	socket.on("eat_dot_client", (dot) => {
		socket.broadcast.emit("eat_dot_server", dot);
	});
	socket.on("touch_correct_ghost_client", () => {
		socket.broadcast.emit("touch_correct_ghost_server");
	});
	socket.on("destroy_crorco_client", () => {
		socket.broadcast.emit("destroy_crorco_server");
	});
	socket.on("you_win_client", () => {
		socket.broadcast.emit("you_win_server");
	});
	socket.on("get_user_data_for_history", () => {
		var json_file = fs.readFileSync('server/data/accounts.json');
		const usersFileParsed = JSON.parse(json_file);
		socket.emit("data_for_history",usersFileParsed);
	});
	socket.on("update_high_scores", (name, score) => {
		var json_file = fs.readFileSync('server/data/accounts.json');
		const usersFileParsed = JSON.parse(json_file);
		var usersArray = usersFileParsed['users'];
		var idx = usersArray.findIndex((obj => obj.username == name));
		if(idx > -1 && usersArray[idx].highestScore < score){
			usersArray[idx].highestScore = score;
		}
		fs.writeFileSync("server/data/accounts.json", JSON.stringify(usersFileParsed));
	});
	socket.on("update_ghost_anims_client", (ghost, colorIndex, direction) => {
		socket.broadcast.emit("update_ghost_anims_server", ghost, colorIndex, direction);
	});
	socket.on("resume_after_eating_candy_client", () => {
		socket.broadcast.emit("resume_after_eating_candy_server");
	});
	

});



