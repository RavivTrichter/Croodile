import Phaser from 'phaser';


export class LoginScene extends Phaser.Scene {
    
    constructor() {
        super({key: "LOGIN_SCENE_KEY"});
    }

    preload() {
        this.load.html('loginHtml', '/assets/HTML/LoginPage.html');
        this.load.css('loginCss', '/assets/HTML/style/Template.css');
        this.load.json('accountJson', '/assets/account.json');
    }

    create() {
		var login = this.add.dom(800, 200).createFromCache('loginHtml');
        
        var loginButton= login.getChildByID("loginButton");
        var registerButton= login.getChildByID("registerButton");
        
        loginButton.addEventListener('click', function() {
            var username = login.getChildByID("user").value;
			var password = login.getChildByID("password").value;
			const user = {'username' : username, 'password' : password};
			
			fetch("/api/auth/login", {
				method : "POST",
				headers: {
					'Content-Type' : 'application/json',
				},
				body: JSON.stringify(user)
			}).then(res=>{
				return res.json();
			}).then(data=>{
				alert(data.message);
			}).catch(err=>{
				window.username = username;
				window.isAdmin = false;
				if("admin" == username) {
					window.isAdmin = true;
				}
				login.scene.scene.start("SECOND_SCENE_KEY");
			});
			
        }, false);

        registerButton.addEventListener('click', function() {
			var username = login.getChildByID("user").value;
			var password = login.getChildByID("password").value;
			const user = {'username' : username, 'password' : password};

			fetch("/api/auth/register", {
				method : "POST",
				headers: {
					'Content-Type' : 'application/json',
				},
				body: JSON.stringify(user)
			}).then(res=>{
				return res.json();
			}).then(data=>{
				alert(data.message);
			}).catch(err=>{
				login.scene.scene.start("SECOND_SCENE_KEY");
			});

        }, false);

    }

}
