var moveForward = document.getElementById("onemoveForward");
var moveBack = document.getElementById("onemoveBack");

var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var canvasSize = canvas.width;


var spacingPoints = [];
var boardHistory = [];
var currentBoard = [];
var nodesChecked = [];
var moveDisplayed = 0;

var color = "black";
const origin = 20;
const boardSize = 9;
const spacer = (canvasSize-origin*2)/(boardSize-1);
//const stoneRadius = (((canvasSize-origin*2)/(boardSize-1))/2) - 0.4;

//**************************************
// object creation functions
function point (i, j) {
  this.row = j;
  this.column = i;
  this.x = spacingPoints[i];
  this.y = spacingPoints[j];
  this.occupied = false;
  this.color = null;
}

function makeBoardCoords () {
  for (let i=0; i<boardSize-1; i++) {
    let thisRow = [];
    for (let j=0; j<boardSize-1; j++) {
      let thisPoint = new point(i,j);  
      thisRow.push(thisPoint);
    }
    currentBoard.push(thisRow);
  }
}

function initializeBoard () {
  
  currentBoard[3][3].color = "white";
  currentBoard[3][3].occupied = true;
  
  currentBoard[4][4].color = "white";
  currentBoard[4][4].occupied = true;
  
  currentBoard[3][4].color = "black";
  currentBoard[3][4].occupied = true;
  
  currentBoard[4][3].color = "black";
  currentBoard[4][3].occupied = true;
  
}
//**************************************


//**************************************
// Math to convert clicked point to closest coordinate pair
function convertCoords(x,y) {
  let convertedX = spacingPoints[0];
  let convertedY = spacingPoints[0];
  let xDiff = Math.abs(x-spacingPoints[0]);
  let yDiff = Math.abs(y-spacingPoints[0]);

  // find the point on the board closest the where the mouse clicked
  let coords = {};
  spacingPoints.map(function(thisPoint) {
    let thisXDiff = Math.abs(x-thisPoint);
    let thisYDiff = Math.abs(y-thisPoint);
    if (thisXDiff < xDiff) {
      coords.X = thisPoint; 
      xDiff = thisXDiff;
    }
    if (thisYDiff < yDiff) {
      coords.Y = thisPoint; 
      yDiff = thisYDiff;
    }
  });

  return coords;
}

//**************************************
//**************************************
// functions for drawing the board itself

// to draw a single line when creating the grid, across the whole board
function drawLine(xPosition, yPosition) {
  ctx.beginPath();
  ctx.moveTo(xPosition, yPosition);
  
  if (xPosition == origin) {
    ctx.lineTo(canvasSize-origin, yPosition);
  } 
  
  else if (yPosition == origin) {
    ctx.lineTo(xPosition, canvasSize-origin);
  }
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawBoard(boardSize) {
  drawLine(21,20);
  for (let i=0; i<(boardSize); i++) {
    let thisPoint = origin + spacer*i;
    drawLine(thisPoint, origin);
    drawLine(origin, thisPoint);
    if (thisPoint < canvasSize-50) {
       spacingPoints.push(Math.floor(thisPoint+spacer*0.5));
    }
  }
  
}

//**************************************

//**************************************
//functions for moves of the game

function switchColor () {
  color == "black" ? color = "white" : color = "black";
}

function logMove (thisMove) {
 
  currentBoard[thisMove.column][thisMove.row].occupied = true;
  currentBoard[thisMove.column][thisMove.row].color = color;
  
  let newBoard = JSON.parse(JSON.stringify(currentBoard));
  boardHistory.push(newBoard);
  moveDisplayed = boardHistory.length-1;
}

function redrawGame (board, speed) {
  
  ctx.clearRect(0, 0, canvasSize, canvasSize);
  drawBoard(boardSize);
  
  board.map(function(row) {
    row.map(function(point) {
      if (point.occupied == true) {
        drawCircle(point.x, point.y, point.color)
      }
    })
  })
}

function drawCircle(centerX, centerY, color) {
  let stoneRadius = (((canvasSize-origin*2)/(boardSize-1))/2) - 1.2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, stoneRadius, 0, 2 * Math.PI, false);
  ctx.strokeStyle = "black";
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
}

//to determine if move played is legal or not. To be legal, move must be an unoccupied space && have at least one liberty || be a legal capture/ko 
function isMoveLegal(thisMove) {
  let col = thisMove.column;
  let row = thisMove.row;
  //let nodes = getNodes(thisMove);
  
  //move must not be unoccupied
  if (thisMove.occupied) {
    return false;
  }
  //move must be a capture!
  if (!isMoveCapturing(thisMove)) {
    return false;
  }
  return true;
}

function handleBoardClick(x, y) {
  
  let coords = convertCoords(x,y);
  
  // get the indices of the point object to change in currentBoard array
  let boardX = spacingPoints.indexOf(coords.X);
  let boardY = spacingPoints.indexOf(coords.Y);
  boardX == -1 ? boardX = 0 : null;
  boardY == -1 ? boardY = 0 : null;
  // play move if move is legal
  
  //no branching of games for the moment. must be on last move to add moves to game.
  if (moveDisplayed !== boardHistory.length-1) {return;}
  
  let thisMove = currentBoard[boardX][boardY];
  console.log(boardX, boardY)
  if (isMoveLegal(thisMove)) {    
    checkForCapture(thisMove);
    logMove(thisMove);
    switchColor();
    redrawGame(currentBoard);
  }
  
//   let copyBoard = JSON.parse(JSON.stringify(currentBoard));
//   let gameWon = checkForWin(copyBoard);
//   console.log(gameWon)
//   if (gameWon) {
//     startGame();
//     moveDisplayed = 0;
//     $("#newGame").html("New Game");
//   }
  
}

function getNodes(point) {
  let col = point.column;
  let row = point.row;
  let adjacentPoints = [];
  
  // got to be a better way here... fix it!
  if (currentBoard[col-1] !== undefined) {
    adjacentPoints.push(currentBoard[col-1][row]);
    if (currentBoard[col-1][row-1] !== undefined) {
      adjacentPoints.push(currentBoard[col-1][row-1]);
    }
    if (currentBoard[col-1][row+1] !== undefined) {
      adjacentPoints.push(currentBoard[col-1][row+1]);
    }
  }
  if (currentBoard[col+1] !== undefined) {
    adjacentPoints.push(currentBoard[col+1][row]);
    if (currentBoard[col+1][row-1] !== undefined) {
      adjacentPoints.push(currentBoard[col+1][row-1]);
    }
    if (currentBoard[col+1][row+1] !== undefined) {
      adjacentPoints.push(currentBoard[col+1][row+1]);
    }
  }
  if (currentBoard[col][row-1] !== undefined) {
    adjacentPoints.push(currentBoard[col][row-1])
  }
  if (currentBoard[col][row+1] !== undefined) {
    adjacentPoints.push(currentBoard[col][row+1])
  }
  return adjacentPoints;
}

//getNeighbors retrieves the first nodes of the move played, to use in checkForCapture. The function is different than getNodes since we are looking only for enemy nodes and still checking all enemy nodes, even if we find an unoccupied node. 
function getNeighbors(point) {
  //console.log(color);
  let col = point.column;
  let row = point.row;
  let neighbors = getNodes(point);
  
  let N = neighbors.filter(function(n) { 
    return (n.occupied && n.color !== color);
  });
  return N;
}

//isMoveCapturing just returns true/false of whether this is a capturing move
function isMoveCapturing (origin) {
  let neighbors = getNeighbors(origin);
  // console.log("neighbors: ");
  // console.log(neighbors);
  if (neighbors.length < 1) {
    return false;
  }
  
  for ( let i=0; i<neighbors.length; i++) {
    let isNodeCaptured = checkNode(neighbors[i], origin);
    
    if (isNodeCaptured) { 
      return true;
    }  
  } 
  return false;
}

//checkForCapture checks for and executes captures on the currentBoard, unlike isMoveCapturing, which only returns a true/false of whether it is a capturing move.
function checkForCapture(origin) {
  let neighbors = getNeighbors(origin);
  if (neighbors.length < 1) {
    return false;
  }
  
  for ( let i=0; i<neighbors.length; i++) {
    let isNodeCaptured = checkNode(neighbors[i], origin);
    //console.log(isNodeCaptured, nodesChecked)
    
    if (isNodeCaptured) { 
      //console.log(nodesChecked + "captured");
      captureStones(nodesChecked);
      nodesChecked = [];
      //redrawGame(currentBoard);
    }  
  } 
} 

function checkNode (node, parent) {
  
  let colDiff = parent.column - node.column;
  let rowDiff = parent.row - node.row;
  
  //get the next node in line. this must have the same relationship as the parent to the original node, == straight line.
  let targetCol = node.column - colDiff;
  let targetRow = node.row - rowDiff;
  let colInRange = targetCol >= 0 && targetCol <= 7;
  let rowInRange = targetRow >= 0 && targetRow <= 7;
  //console.log(colInRange, rowInRange);
  let nextNode;
  
  if ( !colInRange || !rowInRange ) {
    nodesChecked = [];
    return false;
  }
  nextNode = currentBoard[node.column - colDiff][node.row - rowDiff];
  
    
  
  console.log("nextNode: ");
  console.log(nextNode);
  //first check the next extension is unoccupied. if not, line ends and it is not a capture
  if (!nextNode.occupied) {
    nodesChecked = [];
    return false;
  }
  
  //push the current node into the nodesChecked array, since we now know the nextNode is occupied by the same color, or by the opponent. 
  nodesChecked.push(node);
  // if the next node is the same color,  check this node
  if (nextNode.color == node.color) {
    //add this node to nodesChecked
    return checkNode(nextNode, node);
  }
  
  //if all tests passed, i.e. the nextNode is occupied by the opponent, entire connected group is captured!!!
  return true;
}

function notAlreadyChecked (node) {
  //console.log("notAlreadyChecked checking: " + node.column + ", " + node.row)
  
  for ( let i=0; i<nodesChecked.length; i++) {
    //console.log(nodesChecked[i].column, nodesChecked[i].column, node.row, node.row)
    if (nodesChecked[i].column == node.column && nodesChecked[i].row == node.row) { 
      return false;
    };
  }
  return true;
}

function captureStones(nodesChecked) {
  //console.log(nodesChecked.length)
  nodesChecked.map(function(point) {
    let col = point.column;
    let row = point.row;
    currentBoard[col][row].color = color;
  })
}


function checkForWin(board) {
  
  for( let i=0; i < board.length; i++ ) {
    for( let j=0; j < board[i].length; j++ ) {
      let thisPoint = board[i][j];
      if (thisPoint.occupied == false && isMoveCapturing(thisPoint)) {
          return false;
      }
      
    }
  }
  return true;
}
//**************************************
//functions for buttons

function changeMove(boardHistory, change) {
  
  if (boardHistory[moveDisplayed + change] !== undefined) {
    let newBoard = JSON.parse(JSON.stringify(boardHistory[moveDisplayed + change]));
    redrawGame(newBoard);
    moveDisplayed += change;
    console.log("moveDisplayed: " + moveDisplayed)
  }
  //currentBoard = boardHistory[boardHistory.length-1];
}

$("#myCanvas").on('click',function(event) {
  let leftPad = $("#myCanvas").offset().left;
  let topPad = $("#myCanvas").offset().top;
  let xPos = event.clientX-leftPad;
  let yPos = event.clientY-topPad + $(window).scrollTop();
  //console.log(currentBoard[xPos/(boardSize-1)][yPos/(boardSize-1)]);
  //console.log(xPos, yPos);
  handleBoardClick(xPos, yPos);
});

$("#oneMoveForward").on('click',function(event) {
  changeMove(boardHistory, 1);
});

$("#oneMoveBack").on('click',function(event) {
  changeMove(boardHistory, -1);
});

$("#toEnd").on('click',function(event) {
  let change = boardHistory.length-1 - moveDisplayed;
  changeMove(boardHistory, change);
});

$("#toStart").on('click',function(event) {
  changeMove(boardHistory, -moveDisplayed);
});

$("#newGame").on('click',function(event) {
  color = "black";
  currentBoard = [];
  boardHistory = [];
  startGame();
  moveDisplayed = 0;
  //$("#newGame").html() == "Restart" ? $("#newGame").html("New Game"): null;
});




function startGame() {
  drawBoard(boardSize);
  makeBoardCoords();
  initializeBoard();
  redrawGame(currentBoard);
  
  let newBoard = JSON.parse(JSON.stringify(currentBoard));
  boardHistory.push(newBoard);
}

startGame();
