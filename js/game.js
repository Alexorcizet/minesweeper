'use strict'
////////////////CONST Decleration/////
const BOMB = '&#128163'
const NORMAL_SMILEY = '&#128516'
const SUNGLASS_SMILEY = '&#128526;'
const SAD_SMILEY = '&#128534'
const FLAG = '&#128681'
const HEART = '&#128150'
const DEAD = '&#9760'
const EMPTY = ' '
const EASY = 4
const MEDIUM = 8
const HARD = 12
const HINT = '&#x1F4A1'
//////////////Global Vars///////
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
}
var gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 1,
}
var memory
var hintMode
var hintCount
var safeClick
var gBombsCounter
var gBoard
var gTimer
var gSeconds
var gMinutes
var gCellsCount
var firstClicked
var bomb = new Audio('sounds/bombHit.mp3');
var lost = new Audio('sounds/gameLost.mp3')
var win = new Audio('sounds/gameWon.mp3')
////////////////////////////////////////////HighScores/////////////////////////////


//////////////////starter Functions ////////////////////
function initGame() {
    memory = []
    firstClicked = false
    gGame.isOn = false
    hintMode = false
    gGame.shownCount = 0
    gGame.markedCount = 0
    gGame.secsPassed = 0
    gSeconds = 0
    gMinutes = 0
    gBombsCounter = 0
    hintCount = 3
    safeClick = 3
    if (gLevel.SIZE === 4) gLevel.LIVES = 1
    if (gLevel.SIZE === 8 || gLevel.SIZE === 12) gLevel.LIVES = 3
    incrementSeconds()
    clearInterval(gTimer)
    document.querySelector('.mines-left').innerHTML = `You have to disable ${gLevel.MINES} bombs, Good luck!`
    document.querySelector('.hint').innerHTML = `${HINT.repeat(hintCount)}`
    document.querySelector('.safe').innerHTML = `safe: ${safeClick}`
    document.querySelector('.face').innerHTML = NORMAL_SMILEY
    document.querySelector('.life').innerHTML = `You're Current life count is :${HEART.repeat(gLevel.LIVES)}`
    gCellsCount = Math.pow(gLevel.SIZE, 2) - gLevel.MINES
    gBoard = createMat(gLevel.SIZE)
    renderBoard(gBoard)
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            currCell.minesAroundCount = countNeighborsBombs(i, j, board)
        }
    }
}

function creatCell() {
    var currCell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
    return currCell
}

function randomMinePos(board, i, j) {
    var emptyCells = getEmptyCells(board)
    while (gBombsCounter < gLevel.MINES) {
        gBombsCounter++
        var getEmptyCell = drawNum(emptyCells)
        if (getEmptyCell.i === i && getEmptyCell.j === j) {
            getEmptyCell = drawNum(emptyCells)
        }
        board[getEmptyCell.i][getEmptyCell.j].isMine = true
    }
    return
}
//////////////////////////////////////////////////////////////////////////////INGAME functions//////////////////////////////////////////////////////////////////////////////

////////////////////Marking a cell with Flags ///////////////////
function markFlag(ev) {
    ev.preventDefault()
    var currCell = ev.target.id.split('-')
    if (gBoard[currCell[0]][currCell[1]].isShown || !gGame.isOn) {
        return
    }
    document.querySelector('.mines-left').innerHTML = `You have to disable ${gBombsCounter} bombs, Good luck!`
    if (gGame.isOn && !gBoard[currCell[0]][currCell[1]].isMarked && !gBoard[currCell[0]][currCell[1]].isShown) {
        gBombsCounter--
        gGame.markedCount++
        gBoard[currCell[0]][currCell[1]].isMarked = true
        renderCell(currCell[0], currCell[1], FLAG)
        checkGameIsOver()
    }
    else {
        gBombsCounter++
        gBoard[currCell[0]][currCell[1]].isMarked = false
        gGame.markedCount--
        renderCell(currCell[0], currCell[1], '')
        checkGameIsOver()
    }
}

function numColors(value) {
    if (value === 1) return 'blue'
    if (value === 2) return 'green'
    if (value === 3) return 'red'
    if (value === 4) return 'purple'
    if (value === 5) return 'maroon'
    if (value === 6) return 'turquoise'
    if (value === 7) return 'black'
    if (value === 8) return 'magenta'
}

function incrementSeconds() {
    var elMin = document.querySelector('.min');
    var elSec = document.querySelector('.sec');
    var secHTML
    var minHTML
    if (gSeconds === 60) {
        gMinutes++
        gSeconds = 0
    }
    if (gSeconds < 10) {
        secHTML = `0${gSeconds} `
    } else if (gSeconds < 60) {
        secHTML = `${gSeconds} `
    }
    if (gMinutes < 10) {
        minHTML = `0${gMinutes}`
    } else if (gSeconds < 60) {
        minHTML = `${gMinutes}`
    }
    gSeconds += 1;
    gGame.secsPassed++
    elMin.innerHTML = minHTML
    elSec.innerHTML = secHTML
}


function cellClicked(elCell, i, j) {
    if (!firstClicked) {
        firstClicked = true
        gGame.isOn = true
        gTimer = setInterval(incrementSeconds, 1000);
        randomMinePos(gBoard, i, j)
        setTimeout(setMinesNegsCount(gBoard), 1000)
    }
    memory.push(gBoard)

    if (hintMode) {
        hintNegs(i, j)
        return
    }
    if (gBoard[i][j].isShown || !gGame.isOn || gBoard[i][j].isMarked) return
    if (!gBoard[i][j].isShown) {
        gBoard[i][j].isShown = true
        if (!gBoard[i][j].minesAroundCount && !gBoard[i][j].isMine) {
            renderCell(i, j, ' ', 'darkGrey')
            expandShown(gBoard, elCell, i, j)
        }
        else if (gBoard[i][j].minesAroundCount && !gBoard[i][j].isMine) {

            renderCell(i, j, gBoard[i][j].minesAroundCount, 'darkGrey')
        } else {
            if (gLevel.LIVES === 0) {
                gameOver()
            } else {
                bomb.play()
                gBombsCounter--
                document.querySelector('.mines-left').innerHTML = `You have to disable ${gBombsCounter} bombs, Good luck!`
                gGame.markedCount++
                gLevel.LIVES--
                if (gLevel.LIVES > 0) document.querySelector('.life').innerHTML = `You're Current life count is :${HEART.repeat(gLevel.LIVES)} `
                else document.querySelector('.life').innerHTML = `MIND THE BOMBS OR ELSE YOU WILL BE ${DEAD} `
            }
            renderCell(i, j, BOMB, 'red')
        }
    }
    checkGameIsOver()
}

function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[0].length) continue;
            if (board[i][j].isMine || board[i][j].isShown) continue
            else {
                cellClicked(elCell, i, j)
            }
        }
    }
}

function renderCell(i, j, value, color) {

    const elCell = document.getElementById(`${i}-${j}`)
    elCell.style.backgroundColor = color
    elCell.innerHTML = value
    elCell.style.color = numColors(gBoard[i][j].minesAroundCount)
    gGame.shownCount++
    if (value === BOMB) return
}

function getSafe() {

    if (!gGame.isOn) return
    if (!safeClick) return

    safeClick--
    document.querySelector('.safe').innerHTML = `safe: ${safeClick}`

    var noneMineCells = getNoneMInesOrSHownCells(gBoard)
    var getEmptyCell = drawNum(noneMineCells)

    var safeCell = document.getElementById(`${getEmptyCell.i}-${getEmptyCell.j}`)

    safeCell.style.backgroundColor = 'darkGrey'
    safeCell.style.color = numColors(gBoard[getEmptyCell.i][getEmptyCell.j].minesAroundCount)
    if (!gBoard[getEmptyCell.i][getEmptyCell.j].minesAroundCount) safeCell.innerHTML = ' '
    else safeCell.innerHTML = `${gBoard[getEmptyCell.i][getEmptyCell.j].minesAroundCount}`

    setTimeout(() => reverseSafe(safeCell), 600)
}

function reverseSafe(cell) {
    cell.innerHTML = ' '
    cell.style.backgroundColor = 'rgb(192, 234, 137)'
}

function getHint() {
    if (!gGame.isOn) return
    if (!hintCount) return
    if (hintMode) {
        hintMode = false
        if (!hintCount) document.querySelector('.hint').innerHTML = 'none left'
        else document.querySelector('.hint').innerHTML = `${HINT.repeat(hintCount)}`
        document.querySelector('.hint').style.backgroundColor = 'rgb(192, 234, 137)'
    }
    else {
        hintMode = true
        document.querySelector('.hint').style.backgroundColor = 'aliceBlue'
    }

}

function hintNegs(cellI, cellJ) {
    hintCount--
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (gBoard[i][j].isShown) continue
            var currCell = document.getElementById(`${i}-${j}`)
            currCell.style.backgroundColor = 'darkGrey'
            currCell.style.color = numColors(gBoard[cellI][cellJ].minesAroundCount)
            if (gBoard[i][j].isMine) currCell.innerHTML = BOMB
            else if (!gBoard[i][j].minesAroundCount) currCell.innerHTML = ' '
            else {
                currCell.innerHTML = gBoard[i][j].minesAroundCount
                currCell.style.color = numColors(gBoard[i][j].minesAroundCount)
            }
        }
    }
    hintMode = false
    document.querySelector('.hint').style.backgroundColor = 'rgb(192, 234, 137)'
    setTimeout(() => reverseHint(cellI, cellJ), 1000)
}

function reverseHint(cellI, cellJ) {
    document.querySelector('.hint').innerHTML = `${HINT.repeat(hintCount)}`
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (gBoard[i][j].isShown) continue
            var currCell = document.getElementById(`${i}-${j}`)
            currCell.style.backgroundColor = 'rgb(192, 234, 137)'
            currCell.innerHTML = ' '
        }
    }
    if (!hintCount) document.querySelector('.hint').innerHTML = 'none left'
    else document.querySelector('.hint').innerHTML = `${HINT.repeat(hintCount)}`
}

///////////////////////////Difficulty///////////////////////////

function easy() {
    gLevel = {
        SIZE: 4,
        MINES: 2,
        LIVES: 1
    }
    resetGame()
}

function medium() {
    gLevel = {
        SIZE: 8,
        MINES: 12,
        LIVES: 3,
    }
    resetGame()
}

function hard() {
    gLevel = {
        SIZE: 12,
        MINES: 30,
        LIVES: 3
    }
    resetGame()
}

//////////////////////////////////////////////////////////////////////////////ENDGAME functions//////////////////////////////////////////////////////////////////////////////
function gameOver() {
    lost.play()
    gGame.isOn = false
    clearInterval(gTimer)
    document.querySelector('.face').innerHTML = SAD_SMILEY
    document.querySelector('.mines-left').innerText = 'You\'ve Lost! Try Again'
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
                var newBomb = document.getElementById(`${i}-${j}`)
                newBomb.innerHTML = `${BOMB}`
            }
        }
    }
    return
}

function resetGame() {
    initGame()
}

function checkGameIsOver() {
    if (gGame.markedCount === gLevel.MINES && gCellsCount <= gGame.shownCount) {
        win.play()
        document.querySelector('.mines-left').innerText = 'You Mastered this Minefield Try a harder One'
        gGame.isOn = false
        clearInterval(gTimer)
        document.querySelector('.face').innerHTML = SUNGLASS_SMILEY
    }
}

function undo() {
    gBoard = memory.pop()
    renderBoard(gBoard)
}







