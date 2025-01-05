import React, { FC, useEffect, useRef, useState } from 'react';
import { Board } from '../modules/Board';
import CellComponent from './CellComponent';
import { Cell } from '../modules/Cell';
import { Player } from '../modules/Player';
import { Colors } from '../modules/Colors';
import Buttons from './Buttons';
import { Pawn } from '../modules/figures/Pawn';
import PromotionModal from './PromotionModal';

interface BoardProps {
  board: Board;
  setBoard: (board: Board) => void;
}

const BoardComponent: FC<BoardProps> = ({ board, setBoard }) => {
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [whitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [promotionCell, setPromotionCell] = useState<Cell | null>(null);

  useEffect(() => {
    highlightCells();
  }, [selectedCell])

  function click(cell: Cell) {
    if (selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)) {
      if (selectedCell.figure instanceof Pawn && (cell.y === 0 || cell.y === 7)) {
        setPromotionCell(cell);
        selectedCell.moveFigure(cell);
      } else {
        selectedCell.moveFigure(cell);
        swapPlayer();
      }
      setSelectedCell(null);
    } else {
      if (cell.figure?.color === currentPlayer?.color) {
        setSelectedCell(cell);
      }
    }
  }

  function handlePromotion(figure: string) {
    if (promotionCell && promotionCell.figure instanceof Pawn) {
      promotionCell.figure = board.createNewFigure(figure, promotionCell.figure.color, promotionCell);
      let colorEnemyKing = Colors.WHITE;
      if (promotionCell.figure) {
        colorEnemyKing = promotionCell.figure.color === Colors.BLACK ? Colors.WHITE : Colors.BLACK;
      }
      updateBoard();
      if (board.isKingInCheck(colorEnemyKing)) {
        board.highlightKing(colorEnemyKing);
      }
      swapPlayer();
    }
    setPromotionCell(null);
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
        <div className={['board', promotionCell ? 'eclipse' : ''].join(' ')}>
          {promotionCell && (
            <PromotionModal onSelect={handlePromotion} x={promotionCell.x} color={promotionCell.figure?.color}
              cell={promotionCell} />
          )}
          {board.cells.map((row, y) =>
            <React.Fragment key={y}>
              {
                row.map((cell, x) =>
                  <CellComponent
                    cell={cell}
                    key={cell.id}
                    click={click}
                    selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
                    y={y}
                    x={x}
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