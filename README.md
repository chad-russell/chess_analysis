# <img src="https://github.com/chad-russell/chess_analysis/blob/master/assets/app-icon/png/64.png" width="60px" align="center" alt="Nf5 icon"> Nf5

## Screenshots

Explore PGN Database
# <img src="https://github.com/chad-russell/chess_analysis/blob/master/assets/screenshots/Screenshot1.png" align="center" alt="Screenshot1">

Setup Position
# <img src="https://github.com/chad-russell/chess_analysis/blob/master/assets/screenshots/Screenshot2.png" align="center" alt="Screenshot2">

Draw Arrows / Highlight Squares
# <img src="https://github.com/chad-russell/chess_analysis/blob/master/assets/screenshots/Screenshot3.png" align="center" alt="Screenshot3">

Computer Analysis
# <img src="https://github.com/chad-russell/chess_analysis/blob/master/assets/screenshots/Screenshot4.png" align="center" alt="Screenshot4">

---

## Features

- Set up position
  - Click and drag pieces to set up a position, or paste an FEN string
- Import PGN file, add/explore arbitrarily deep trees of variations, and export when done.
- Add UCI engine and see top engine lines, with the option to automatically add these lines as variations to the current position
- Add/Edit comments on any move
- Add common annotations (!, !!, !?, ?!, ??, etc) to moves
- Highlighting squares and Drawing Arrows
  - To highlight squares on the chess board, simply click on them while holding down the ALT key (for green highlight), or the ALT+SHIFT keys (for red highlight).
  - To add arrows, simply click and drag from any square to any other square, again while holding down the ALT key (for green arrow), or the ALT+SHIFT keys (for red arrow).

## Downloading

You can [download the latest release](https://github.com/Nf5/Nf5/releases) for your operating system or build it yourself (see below).

## Building

You'll need [Node.js](https://nodejs.org) installed on your computer in order to build this app.

```bash
$ git clone https://github.com/Nf5/Nf5
$ cd Nf5
$ npm install
$ npm start
```

For easier developing you can launch the app in fullscreen with DevTools open:

```bash
$ npm run dev
```
