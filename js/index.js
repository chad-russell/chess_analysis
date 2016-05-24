// rnbqkbnr/pp1ppppp/8/2p5/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2

/*
[Event "World Open"]
[Site "My House"]
[Date "2015.8.12"]
[Round "99"]
[White "CHAD"]
[Black "FUCK"]
[Result "*"]
[ECO "C40"]

1. e4 e5 { open game } ( 1... e6 2. d4 d5 3. e5 ( 3. Nd2$17 dxe4 $133 4. Nxe4 ) 3... c5 ) ( 1... c5 2.
Nf3 ) 2. Nf3 Nc6  *
*/

const velocity = require('./js/velocity.min.js');
const xtag = require('./js/x-tag-core.min.js');
const requirechess = require('./js/chess.min.js');
const uciwrapper = require('./js/uciwrapper');
const tabbox = require('./js/x-tabbox');
const electron = require('electron');
const remote = electron.remote;
const requiredialog = remote.dialog;
const fs = require('fs');
const pgn = require('./js/pgn');
const ElectronSettings = require('electron-settings');

// components
require('./js/x-board');
require('./js/x-board-setup');
require('./js/x-board-controls');

// var sqlite3 = require('sqlite3').verbose();

// var db = new sqlite3.Database(':memory:');
// db.serialize(() => {
//   db.run("CREATE TABLE lorem (info TEXT)");
//
//   var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//   for (var i = 0; i < 10; i++) {
//       stmt.run("Ipsum " + i);
//   }
//   stmt.finalize();
//
//   db.each("SELECT rowid AS id, info FROM lorem", (err, row) => {
//       console.log(row.id + ": " + row.info);
//   });
// });
//
// db.close();

// window.addEventListener('contextmenu', function (e) {
//   e.preventDefault();
//   menu.popup(remote.getCurrentWindow());
// }, false);

var controls = () => {
  return document.querySelector('x-board-controls');
};

var board = () => {
  return controls().board;
};

var template = [
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: (item, focusedWindow) => {
          if (focusedWindow)
            focusedWindow.webContents.toggleDevTools();
        }
      },
      {
        label: 'Board Colors',
        click: () => {
          controls().showBoardColorDialog();
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: 'Board',
    submenu: [
      {
        label: 'Flip',
        accelerator: 'CmdOrCtrl+F',
        click: () => {
          board().flip();
        }
      },
      {
        label: 'Setup Position',
        accelerator: 'CmdOrCtrl+Shift+P',
        click: () => {
          var dialog = document.createElement('dialog');
          dialog.style.zIndex = 100;
          dialog.style.border = '1px solid rgba(0, 0, 0, 0.3)';
          dialog.style.borderRadius = '6px';
          dialog.style.boxShadow = '0 3px 7px rgba(0, 0, 0, 0.3)';

          var positionSetupBoard = document.createElement('x-board-setup');
          positionSetupBoard.boardControls = controls();
          positionSetupBoard.targetBoard = board;

          dialog.appendChild(positionSetupBoard);

          board().appendChild(dialog);

          positionSetupBoard.onComplete = () => {
            dialog.close();
            dialog.parentNode.removeChild(dialog);
          };

          dialog.showModal();
        }
      }
    ]
  },
  {
    label: 'Game',
    submenu: [
      {
        label: 'Export Current Game to PGN',
        accelerator: 'CmdOrCtrl+S',
        click: () => {
          var savePath = requiredialog.showSaveDialog();
          fs.writeFile(savePath, pgn.toString(board().history), (err) => {
            if (err) {
              console.log(err);
            }
            else {
              console.log('saved!');
            }
          });
        }
      },
      {
        label: 'Import PGN',
        accelerator: 'CmdOrCtrl+I',
        click: () => {
          var openPath = requiredialog.showOpenDialog();
          if (openPath.length < 1) {
            return;
          }

          var path = openPath[0];

          importPgn(path);
        }
      },
      {
        label: 'Add Comment',
        accelerator: 'CmdOrCtrl+T',
        click: () => {
          var dialog = document.createElement('dialog');
          dialog.style.zIndex = 100;
          dialog.style.border = '1px solid rgba(0, 0, 0, 0.3)';
          dialog.style.borderRadius = '6px';
          dialog.style.boxShadow = '0 3px 7px rgba(0, 0, 0, 0.3)';

  				var input = document.createElement('input');
  				var button = document.createElement('button');

  				button.innerHTML = 'OK';

  				dialog.appendChild(input);
  				dialog.appendChild(button);

          var b = board();
  				b.appendChild(dialog);
  				dialog.showModal();

  				button.addEventListener('click', () => {
  					if (!b.history.current.comments) {
  						b.history.current.comments = [];
  					}
  					b.history.current.comments.push(input.value);
  					dialog.close();
  					dialog.parentNode.removeChild(dialog);

  					b.dispatchEvent(new Event('move'));
  				});
        }
      },
      {
        label: 'Truncate Current Variation',
        accelerator: 'CmdOrCtrl+E',
        click: () => { board().deleteToEndOfVariation(); }
      },
      {
        label: 'Delete Current Variation',
        accelerator: 'CmdOrCtrl+D',
        click: () => { board().deleteCurrentVariation(); }
      },
      {
        label: 'Promote Variation',
        accelerator: 'CmdOrCtrl+P',
        click: () => { board().promoteVariation(); }
      },
      {
        label: 'Next',
        accelerator: 'CmdOrCtrl+N',
        click: () => { controls().loadNextGame(); }
      },
      {
        label: 'Training Mode',
        type: 'checkbox',
        checked: false,
        click: (self) => {
          controls().training = self.checked;
        }
      }
    ]
  },
];

function importPgn(path) {
  fs.readFile(path, 'utf8', (err, text) => {
    if (err) { console.log(err); return; }
    var parsed = pgn.parse(pgn.lex(text));
    var database = xtag.queryChildren(controls(), 'div x-database#database')[0];

    database.controls = controls();
    database.games = parsed;

    database.controls.selectTab(2);
  });
}

if (process.platform == 'darwin') {
  var name = require('electron').remote.app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { electron.ipcRenderer.send('app-quit'); }
      },
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
};

var menu = remote.Menu.buildFromTemplate(template);
remote.Menu.setApplicationMenu(menu);

var animationDuration = 90;
var animateSemaphor = 0;
function startAnimate() {
  animateSemaphor++;
}
function endAnimate() {
  animateSemaphor--;
	if (animateSemaphor == 0) {
		document.dispatchEvent(new Event('animateComplete'));
	}
}

let settings = new ElectronSettings();

if (!settings.get('LIGHT')) {
  settings.set('LIGHT', '#f0d9b5');
}
if (!settings.get('DARK')) {
  settings.set('DARK', '#b58863');
}

function getLight() {
  var light = settings.get('LIGHT');
  return light ? light : '#f0d9b5';
}
function getDark() {
  var dark = settings.get('DARK');
  return dark ? dark : '#b58863';
}

var squareNames = [
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8'],
  ['g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'],
  ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'],
  ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
  ['d1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8'],
  ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'],
  ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8'],
  ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8']
];

function coordinates(squareName) {
  for (var file = 0; file < squareNames.length; file++) {
    for (var rank = 0; rank < squareNames[file].length; rank++) {
      if (squareNames[file][rank] == squareName) {
        return {rank: 7 - rank, file: 7 - file};
      }
    }
  }
  return null;
}
