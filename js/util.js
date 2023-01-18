'use strict'

function countNeighborsBombs(cellI, cellJ, mat) {
    var neighborsCount = 0;

    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[0].length) continue;
            if (mat[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

function getEmptyCells(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine) emptyCells.push({ i, j })
        }
    }
    return emptyCells
}
function getNoneMInesOrSHownCells(board) {
    var emptyCells = []
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[i].length; j++) {
            if (!board[i][j].isMine && !board[i][j].isShown) emptyCells.push({ i, j })
        }
    }
    return emptyCells
}


function drawNum(arr) {
    var idx = getRandomInt(0, arr.length - 1)
    var obj = arr[idx]
    arr.splice(idx, 1)
    return obj
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
}

function createMat(size) {
    var mat = []
    for (var i = 0; i < size; i++) {
        var row = []
        for (var j = 0; j < size; j++) {
            row.push(creatCell())
        }
        mat.push(row)
    }
    return mat
}

function renderBoard(mat) {
    var strHTML = '<table class="board"><tbody>\n'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '\n<tr>\n'
        for (var j = 0; j < mat[0].length; j++) {
            strHTML += `<td  id="${i}-${j}" class="cell  "
            onclick="cellClicked(this, ${i},${j})" oncontextmenu="markFlag(event)">`
            strHTML += '</td>\n'
        }
        strHTML += `</tr>`
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector('.board-container')
    elContainer.innerHTML = strHTML
}




