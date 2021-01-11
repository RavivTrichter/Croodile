import Phaser from 'phaser';
import { socket } from './socket';


export class HistoryScene extends Phaser.Scene {
    
    constructor() {
        super({key: "HISTORY_SCENE_KEY"});
    }

    preload() {
        this.load.css('loginCss', '/assets/HTML/style/Template.css');
        this.load.html('historyHTML', '/assets/HTML/History.html');
        this.load.json('accountJson', '/assets/account.json');
    }

    create() {
        var history = this.add.dom(800, 200).createFromCache('historyHTML');
        var History_Table_div = history.getChildByID("HistoryTable");
        var buttonHome = history.getChildByID("HomeButton");
 
        buttonHome.addEventListener('click', function() {
            history.scene.scene.start("SECOND_SCENE_KEY");
        }, false);

        let max_rows_to_show = 10;
        socket.on("data_for_history", (json_file)=> {
            const usersArray = json_file['users'];
            usersArray.sort(function(a, b) {
                return a.highestScore == b.highestScore ? 0 : (a.highestScore < b.highestScore) || -1;
              });
            let max_iters = usersArray.length < max_rows_to_show ? usersArray.length : max_rows_to_show;
            let row, cell1, cell2;
            for(let i = 0 ; i < max_iters ; ++i ) {
                if(i == max_iters-1 && usersArray[i].username == "admin")
                    break;
                row = History_Table_div.insertRow(i+1);
                cell1 = row.insertCell(0);
                cell2 = row.insertCell(1);
                cell1.innerHTML = usersArray[i].username;
                cell2.innerHTML = usersArray[i].highestScore;
                cell1.classname = "thStyle";
                cell2.classname = "thStyle";
            }
        });
        socket.emit("get_user_data_for_history");

    }

}



