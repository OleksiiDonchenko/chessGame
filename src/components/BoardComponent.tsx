import React, { FC, useEffect, useState } from 'react';
import { Board } from '../modules/Board';
import CellComponent from './CellComponent';
import { Cell } from '../modules/Cell';
import { Player } from '../modules/Player';

interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
  currentPlayer: Player | null;
  swapPlayer: () => void;
  gameRestart: () => void;
}

const BoardComponent: FC<BoardProps> = ({ board, setBoard, currentPlayer, swapPlayer, gameRestart }) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);

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

  useEffect(() => {
    highlightCells();
  }, [selectedCell])

  function highlightCells() {
    board.highlightCells(selectedCell);
    updateBoard();
  }

  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
  }

  return (
    <>
      <div className='wrapper'>
        <div className='title'>
          <h3>Current player {currentPlayer?.color}</h3>
          <button onClick={() => gameRestart()}>Game Restart</button>
        </div>
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
      </div>
    </>
  );
};

export default BoardComponent;