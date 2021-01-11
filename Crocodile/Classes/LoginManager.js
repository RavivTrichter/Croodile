import Phaser from "phaser";

export class LoginManager extends Phaser.GameObjects.DOMElement {
	constructor(scene, x, y) {
		super(scene, x, y);
		this.createFromCache("loginHtml");
		this.scene.add.existing(this);

	}
}
