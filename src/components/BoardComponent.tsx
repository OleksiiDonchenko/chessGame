import React, { FC, useEffect, useRef, useState } from 'react';
import { Board } from '../modules/Board';
import { Cell } from '../modules/Cell';
import { Player } from '../modules/Player';
import { Colors } from '../modules/Colors';
import Buttons from './Buttons';
import { Pawn } from '../modules/figures/Pawn';
import PromotionModal from './PromotionModal';
import { DndContext } from '@dnd-kit/core';
import DroppableCell from './DroppableCell';
import DraggableFigure from './DraggableFigure';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import Clock from '../assets/icons/clock.svg?react';

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

  function mouseDown(cell: Cell) {
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
    if (cell.figure === null || cell.figure.color !== currentPlayer?.color) {
      setSelectedCell(null);
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
    // setCurrentPlayer(whitePlayer);
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

  const [gameIsOn, setgameIsOn] = useState(false);
  const [blackTimeMinutes, setBlackTimeMinutes] = useState(5);
  const [whiteTimeMinutes, setWhiteTimeMinutes] = useState(5);
  const [blackTimeSeconds, setBlackTimeSeconds] = useState(60);
  const [whiteTimeSeconds, setWhiteTimeSeconds] = useState(60);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    startTimer();
  }, [currentPlayer, gameIsOn, blackTimeMinutes, whiteTimeMinutes, blackTimeSeconds, whiteTimeSeconds])

  function startTimer() {
    if (timer.current) {
      clearInterval(timer.current);
    }
    const callback = currentPlayer?.color === Colors.BLACK ? decrementBlackTimer : decrementWhiteTimer;
    timer.current = setInterval(callback, 1000);
  }

  function decrementBlackTimer() {
    if (gameIsOn) {
      if (blackTimeMinutes > 0 && blackTimeSeconds === 0 || blackTimeSeconds === 60) {
        setBlackTimeMinutes(prev => prev - 1);
      }
      if (blackTimeMinutes > 0 && blackTimeSeconds === 0) {
        setBlackTimeSeconds(59);
      }
      if (blackTimeSeconds > 0) {
        setBlackTimeSeconds(prev => prev - 1);
      }
    }
  }

  function decrementWhiteTimer() {
    if (gameIsOn) {
      if (whiteTimeMinutes > 0 && whiteTimeSeconds === 0 || whiteTimeSeconds === 60) {
        setWhiteTimeMinutes(prev => prev - 1);
      }
      if (whiteTimeMinutes > 0 && whiteTimeSeconds === 0) {
        setWhiteTimeSeconds(59);
      }
      if (whiteTimeSeconds > 0) {
        setWhiteTimeSeconds(prev => prev - 1);
      }
    }
  }

  function handleRestart() {
    setgameIsOn(false);
    setCurrentPlayer(null);
    setBlackTimeMinutes(5);
    setWhiteTimeMinutes(5);
    setBlackTimeSeconds(60);
    setWhiteTimeSeconds(60);
    restart();
  }

  function handleStartGame() {
    setgameIsOn(true);
    setCurrentPlayer(whitePlayer);
    startTimer();
  }

  function handleStopGame() {
    setgameIsOn(false);
    setCurrentPlayer(null);
  }

  const handleDragStart = (event: any) => {
    const { over } = event;
    // active,
    // const fromCell = board.getCellById(active.id);

    const figure = event.activatorEvent.srcElement;
    const cell = figure.parentElement;

    const cellRect = cell.getBoundingClientRect();

    // Размеры фигуры
    const figureSize = 60;

    // Позиция курсора внутри клетки
    const cursorX = event.activatorEvent.clientX - cellRect.left;
    const cursorY = event.activatorEvent.clientY - cellRect.top;

    // Смещение для центрирования фигуры под курсором
    const offsetX = cursorX - figureSize / 2;
    const offsetY = cursorY - figureSize / 2;

    figure.style.left = `${offsetX}px`;
    figure.style.top = `${offsetY}px`;

    figure.addEventListener('mouseup', () => {
      figure.style.left = '2px';
      figure.style.top = '2px';
    })

    if (!over) return;
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const figure = event.activatorEvent.srcElement;
    const fromCell = board.getCellById(`${active.id}`);
    const toCell = board.getCellById(`${over.id}`);

    if (currentPlayer?.color === fromCell?.figure?.color) {
      if (fromCell && toCell && fromCell.figure?.canMove(toCell)) {
        if (fromCell.figure instanceof Pawn && (toCell.y === 0 || toCell.y === 7)) {
          setPromotionCell(toCell);
          fromCell.moveFigure(toCell);
        } else {
          fromCell.moveFigure(toCell);
          swapPlayer();
        }
        setSelectedCell(null);
      } else if (fromCell?.figure?.color === currentPlayer?.color) {
        setSelectedCell(fromCell);
      }
    }

    figure.style.left = '2px';
    figure.style.top = '2px';
  }

  return (
    <>
      <div className='wrapper'>
        <Buttons handleRestart={handleRestart} handleStartGame={handleStartGame} handleStopGame={handleStopGame} />
        <div className='time blackTime'>
          <Clock fill='white' />
          <span>
            {blackTimeMinutes}:{blackTimeSeconds === 60 ? '00' : blackTimeSeconds < 10 ? `0${blackTimeSeconds}` : blackTimeSeconds}
          </span>
        </div>
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
          <div className={['board', promotionCell ? 'eclipse' : ''].join(' ')}>
            {promotionCell && (
              <PromotionModal onSelect={handlePromotion} x={promotionCell.x} color={promotionCell.figure?.color}
                cell={promotionCell} />
            )}
            {board.cells.map((row, y) =>
              <React.Fragment key={y}>
                {
                  row.map((cell) =>
                    <DroppableCell
                      key={cell.id}
                      id={`${cell.x}-${cell.y}`}
                      color={cell.color}
                      selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
                      isAvailable={cell.available}
                      isKingInCheck={cell.isKingInCheck}
                      cell={cell}
                      click={click}
                      mouseDown={mouseDown}
                      coordinates={{ x: cell.x, y: cell.y }}
                    >
                      {cell.figure?.logo && (
                        <DraggableFigure
                          id={`${cell.x}-${cell.y}`}
                          src={cell.figure.logo}
                        />
                      )}
                    </DroppableCell>
                  )
                }
              </React.Fragment>
            )
            }
          </div >
        </DndContext>
        <div className='time whiteTime'>
          <Clock fill='black' />
          <span>
            {whiteTimeMinutes}:{whiteTimeSeconds === 60 ? '00' : whiteTimeSeconds < 10 ? `0${whiteTimeSeconds}` : whiteTimeSeconds}
          </span>
        </div>
      </div>
    </>
  );
};

export default BoardComponent;