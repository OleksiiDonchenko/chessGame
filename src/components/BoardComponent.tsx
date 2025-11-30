// import React, { FC, useEffect, useRef, useState } from 'react';
import React, { useEffect, useRef, useState } from 'react';
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
import LostFigures from './LostFigures';
import { useChess } from '../context/ChessContext';
import SidebarComponent from './SidebarComponent';

// interface BoardProps {
//   board: Board;
//   setBoard: (board: Board) => void;
// }
// : FC<BoardProps> { board, setBoard }

function BoardComponent() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [whitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [promotionCell, setPromotionCell] = useState<Cell | null>(null);
  const [whitePoints, setWhitePoints] = useState(0);
  const [blackPoints, setBlackPoints] = useState(0);
  const [whoLeads, setWholeads] = useState(0);
  const [clickOnBoard, setClickOnBoard] = useState<boolean>(false);

  const { board, setBoard, history, sethistory, currentMove, setCurrentMove, makeMove, goToPreviousMove, goToNextMove, snapshotBoard } = useChess();
  useEffect(() => {
    highlightCells();
  }, [selectedCell]);

  function mouseDown(cell: Cell) {
    if (selectedCell && selectedCell !== cell && selectedCell.figure?.canMove(cell)) {
      if (selectedCell.figure instanceof Pawn && (cell.y === 0 || cell.y === 7)) {
        setPromotionCell(cell);
        selectedCell.moveFigure(cell);
      } else {
        selectedCell.moveFigure(cell);
        makeMove(board);
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
      const pawn = promotionCell.figure;
      promotionCell.addLostFigure(pawn);
      promotionCell.figure = board.createNewFigure(figure, promotionCell.figure.color, promotionCell);
      let enemyColor = Colors.WHITE;
      if (promotionCell.figure) {
        enemyColor = promotionCell.figure.color === Colors.BLACK ? Colors.WHITE : Colors.BLACK;
        promotionCell.figure.isItPromotionFigure = true;
      }
      if (board.isKingInCheck(enemyColor)) {
        board.handleMove('check');
        board.highlightKing(enemyColor);
        board.isCheckmate(enemyColor);
      } else if (pawn.isItCapture) {
        board.handleMove('capture');
      } else {
        board.handleMove('move');
      }
      board.isStalemate(enemyColor);
      board.promotionFigureValues(pawn.color);
      makeMove(board);
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
    return newBoard;
  }

  useEffect(() => {
    restart();
  }, []);

  function restart() {
    const newBoard = new Board();
    newBoard.initCells();
    newBoard.addFigures();
    setBoard(newBoard);
    setWhitePoints(0);
    setBlackPoints(0);
    setWholeads(0);
    sethistory([newBoard.getDeepCopyBoard()]);
    setCurrentMove(0);
  }

  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer);
  }

  const [gameIsOn, setgameIsOn] = useState(false);
  const [gameWasStarted, setGameWasStarted] = useState(false);
  const [blackTimeMinutes, setBlackTimeMinutes] = useState(5);
  const [whiteTimeMinutes, setWhiteTimeMinutes] = useState(5);
  const [blackTimeSeconds, setBlackTimeSeconds] = useState(60);
  const [whiteTimeSeconds, setWhiteTimeSeconds] = useState(60);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);
  const [isAnalysis, setIsAnalysis] = useState(false);

  useEffect(() => {
    if (!isAnalysis) {
      startTimer();
    }
  }, [currentPlayer, gameIsOn, blackTimeMinutes, whiteTimeMinutes, blackTimeSeconds, whiteTimeSeconds, isAnalysis]);

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
      if (blackTimeMinutes === 0 && blackTimeSeconds === 0 && currentPlayer) {
        !board.doAlliedFiguresExist(Colors.WHITE) ? handleDraw(Colors.WHITE) : board.losingByTime(currentPlayer.color);
        handleStopGame();
        snapshotBoard(board);
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
      if (whiteTimeMinutes === 0 && whiteTimeSeconds === 0 && currentPlayer) {
        !board.doAlliedFiguresExist(Colors.BLACK) ? handleDraw(Colors.BLACK) : board.losingByTime(currentPlayer.color);
        handleStopGame();
        snapshotBoard(board);
      }
    }
  }

  function handleRestart() {
    setgameIsOn(false);
    setGameWasStarted(false);
    setCurrentPlayer(null);
    setBlackTimeMinutes(5);
    setWhiteTimeMinutes(5);
    setBlackTimeSeconds(60);
    setWhiteTimeSeconds(60);
    restart();
  }

  function handleStartGame() {
    setIsAnalysis(false);
    setgameIsOn(true);
    setGameWasStarted(true);
    setCurrentPlayer(whitePlayer);
    startTimer();
  }

  function handleAnalysis() {
    setIsAnalysis(true);
    setGameWasStarted(true);
    setCurrentPlayer(whitePlayer);
  }

  function handleStopGame(color?: Colors) {
    if (color)
      board.handleResign(color);
    setgameIsOn(false);
    setCurrentPlayer(null);
    setSelectedCell(null);
  }

  function handleDraw(color: Colors) {
    board.handleDraw(color);
    handleStopGame();
  }

  const handleDragStart = (event: any) => {
    const { over } = event;
    // active,
    // const fromCell = board.getCellById(active.id);
    const figure = event.activatorEvent.srcElement;
    const cell = figure.parentElement;

    const cellRect = cell.getBoundingClientRect();

    // Size the figure
    const figureSize = 60;

    // The cursor position in the cell
    const cursorX = event.activatorEvent.clientX - cellRect.left;
    const cursorY = event.activatorEvent.clientY - cellRect.top;

    // Offset for centering the figure under the cursor
    const offsetX = cursorX - figureSize / 2;
    const offsetY = cursorY - figureSize / 2;

    figure.style.left = `${offsetX}px`;
    figure.style.top = `${offsetY}px`;

    figure.addEventListener('mouseup', () => {
      figure.style.left = '2px';
      figure.style.top = '2px';
    });

    setClickOnBoard(true);

    if (!over) return;
  };

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
          makeMove(board);
          swapPlayer();
        }
        setSelectedCell(null);
      } else if (fromCell?.figure?.color === currentPlayer?.color) {
        setSelectedCell(fromCell);
      }
    }

    figure.style.left = '2px';
    figure.style.top = '2px';
  };

  function clickOnTheBoard() {
    setClickOnBoard(true);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boardRef.current && !boardRef.current.contains(event.target as Node)) {
        setClickOnBoard(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className='wrapper'>
        <div className="wrapper-board">
          <Buttons handleRestart={handleRestart}
            handleStartGame={handleStartGame}
            handleAnalysis={handleAnalysis}
            handleStopGame={handleStopGame}
            handleDraw={handleDraw}
            gameIsOn={gameIsOn}
            gameWasStarted={gameWasStarted}
            currentPlayer={currentPlayer}
            board={board}
            snapshotBoard={snapshotBoard} />
          <div className='lostFiguresAndTime'>
            <LostFigures
              board={board}
              color='white'
              figures={board.lostWhiteFigures}
              whoLeads={whoLeads}
              setWholeads={setWholeads}
              whitePoints={whitePoints}
              setWhitePoints={setWhitePoints}
              blackPoints={blackPoints}
              setBlackPoints={setBlackPoints} />
            <div className={['time', 'blackTime', currentPlayer === blackPlayer && !isAnalysis ? 'goes' : ''].join(' ')}>
              <Clock fill='white' />
              <span>
                {blackTimeMinutes}:{blackTimeSeconds === 60 ? '00' : blackTimeSeconds < 10 ? `0${blackTimeSeconds}` : blackTimeSeconds}
              </span>
            </div>
          </div>
          <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
            <div ref={boardRef} className={['board', promotionCell ? 'eclipse' : ''].join(' ')} onClick={() => clickOnTheBoard()}>
              {promotionCell && (
                <PromotionModal onSelect={handlePromotion} x={promotionCell.x} color={promotionCell.figure?.color}
                  cell={promotionCell} />
              )}
              {board.cells.map((row, y) => <React.Fragment key={y}>
                {row.map((cell) => <DroppableCell
                  key={cell.id}
                  id={`${cell.x}-${cell.y}`}
                  color={cell.color}
                  selected={cell.x === selectedCell?.x && cell.y === selectedCell?.y}
                  isAvailable={cell.available}
                  isKingInCheck={cell.isKingInCheck}
                  isCheckmate={cell.isCheckmate}
                  resign={cell.resign}
                  losingByTime={cell.losingByTime}
                  isVictory={cell.isVictory}
                  isStalemate={cell.isStalemate}
                  isDraw={cell.isDraw}
                  handleStopGame={handleStopGame}
                  cell={cell}
                  mouseDown={mouseDown}
                  coordinates={{ x: cell.x, y: cell.y }}
                >
                  {cell.figure?.logo && (
                    <DraggableFigure
                      id={`${cell.x}-${cell.y}`}
                      src={cell.figure.logo} />
                  )}
                </DroppableCell>
                )}
              </React.Fragment>
              )}
            </div>
          </DndContext>
          <div className='lostFiguresAndTime'>
            <LostFigures
              board={board}
              color='black'
              figures={board.lostBlackFigures}
              whoLeads={whoLeads}
              setWholeads={setWholeads}
              whitePoints={whitePoints}
              setWhitePoints={setWhitePoints}
              blackPoints={blackPoints}
              setBlackPoints={setBlackPoints} />
            <div className={['time', 'whiteTime', currentPlayer === whitePlayer && !isAnalysis ? 'goes' : ''].join(' ')}>
              <Clock fill='black' />
              <span>
                {whiteTimeMinutes}:{whiteTimeSeconds === 60 ? '00' : whiteTimeSeconds < 10 ? `0${whiteTimeSeconds}` : whiteTimeSeconds}
              </span>
            </div>
          </div>
        </div>
        <SidebarComponent history={history} currentMove={currentMove} goToPreviousMove={goToPreviousMove}
          goToNextMove={goToNextMove} boardRef={boardRef} clickOnBoard={clickOnBoard} setClickOnBoard={setClickOnBoard}
          swapPlayer={swapPlayer} isAnalysis={isAnalysis} setSelectedCell={setSelectedCell} currentPlayer={currentPlayer} />
      </div>
    </>
  );
}

export default BoardComponent;