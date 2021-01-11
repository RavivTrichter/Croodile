import Phaser from 'phaser';
import { SCENES, CONFIG } from '../constants';
import { socket } from '../scenes/socket';
import { CLIENT_EVENTS, SERVER_EVENTS } from '../../shared/src/socket-events';


export class WaitingForPlayersScene extends Phaser.Scene {
	constructor() {
		super({ key: SCENES.WAITING_FOR_PLAYERS });
		this.room == null;
	}

	create() {
		this.waitingText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2 - 50, 'Waiting for players...', { font: '20px monospace', fill: '#ffffff' });
		this.playersText = this.add.text(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, '\n1/4  😷\n', { font: '20px monospace', fill: '#ffffff' });
		this.playersText.setOrigin(0.5, 0.5);
		this.waitingText.setOrigin(0.5, 0.5);
		socket.emit(CLIENT_EVENTS.JOIN);
		socket.on(SERVER_EVENTS.ROOM_STATUS, (roomId, players, max) => {
			this.playersText.setText(`\n${players.length}/${max} 😷\n`);
			if (players.length === max) {
				this.scene.start(SCENES.MULTIPLAYER /*"MAIN_SCENE_KEY"*/,{ roomId, players });
			}
		});

	}
	update() {

	}
} 