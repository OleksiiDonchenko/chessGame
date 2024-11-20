import React, { FC, useEffect, useRef, useState } from 'react';
import { Board } from '../modules/Board';
import CellComponent from './CellComponent';
import { Cell } from '../modules/Cell';
import { Player } from '../modules/Player';
import { Colors } from '../modules/Colors';
import Buttons from './Buttons';

interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
}

const BoardComponent: FC<BoardProps> = ({ board, setBoard }) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [whitePlayer, setWhitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer, setBlackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  useEffect(() => {
    highlightCells();
  }, [selectedCell])

  function click(cell: Cell) {
    if (selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)) {
      selectedCell.moveFigure(cell);
      swapPlayer();
      setSelectedCell(null);
    } else {
      if (cell.figure?.color === currentPlayer?.color) {
        setSelectedCell(cell);
      }
    }
  }

  function highlightCells() {
    board.highlightCells(selectedCell);
    updateBoard();
  }

  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }

  useEffect(() => {
    restart();
    setCurrentPlayer(whitePlayer);
  }, [])

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
  }

  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer);
  }

  const [blackTime, setBlackTime] = useState(300);
  const [whiteTime, setWhiteTime] = useState(300);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    startTimer();
  }, [currentPlayer])

  function startTimer() {
    if (timer.current) {
      clearInterval(timer.current);
    }
    const callback = currentPlayer?.color === Colors.BLACK ? decrementBlackTimer : decrementWhiteTimer;
    timer.current = setInterval(callback, 1000);
  }

  function decrementBlackTimer() {
    setBlackTime(prev => prev - 1);
  }

  function decrementWhiteTimer() {
    setWhiteTime(prev => prev - 1);
  }

  function handleRestart() {
    setBlackTime(300);
    setWhiteTime(300);
    setCurrentPlayer(whitePlayer);
    restart();
  }

  return (
    <>
      <div className='wrapper'>
        <Buttons handleRestart={handleRestart} />
        <span className='blackTime'>Time: {blackTime}sec</span>
        <div className='board'>
          {board.cells.map((row, index) =>
            <React.Fragment key={index}>
              {
                row.map(cell =>
                  <CellComponent
                    cell={cell}
                    key={cell.id}
                    click={click}
                    selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
                  />
                )
              }
            </React.Fragment>
          )
          }
        </div >
        <span className='whiteTime'>Time: {whiteTime}sec</span>
      </div>
    </>
  );
};

export default BoardComponent;