import React, { useEffect, useRef, useState } from 'react';
import { useChessContext } from '../context/ChessContext';
import { Board } from '../modules/Board';
import { Cell } from '../modules/Cell';
import { Player } from '../modules/Player';
import { Colors } from '../modules/Colors';
import { Pawn } from '../modules/figures/Pawn';
import Buttons from './Buttons';
import LostFigures from './LostFigures';
import PromotionModal from './PromotionModal';
import SidebarComponent from './SidebarComponent';
import Clock from '../assets/icons/clock.svg?react';
import { DragDropProvider, DragStartEvent, DragEndEvent, DragMoveEvent, BeforeDragStartEvent } from '@dnd-kit/react';
import { RestrictToWindow } from '@dnd-kit/dom/modifiers';
import DroppableCell from './DroppableCell';
import DraggableFigure from './DraggableFigure';

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

  const { board, setBoard, history, sethistory, currentMove, setCurrentMove, makeMove, goToPreviousMove, goToNextMove, snapshotBoard } = useChessContext();
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
        const newBoard = board.getDeepCopyBoard();
        makeMove(newBoard);
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
      const newBoard = board.getDeepCopyBoard();
      makeMove(newBoard);
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
    setSelectedCell(null);
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

  interface DragOverlayState {
    src: string;
    x: number;
    y: number;
  }

  const [dragOverlay, setDragOverlay] = useState<DragOverlayState | null>(null);

  function getPointerPosition(nativeEvent: Event | undefined) {
    if (!nativeEvent || !('clientX' in nativeEvent) || !('clientY' in nativeEvent)) {
      return null;
    }

    return {
      x: nativeEvent.clientX as number,
      y: nativeEvent.clientY as number,
    };
  }

  const handleBeforeDragStart = (event: BeforeDragStartEvent) => {
    const { source } = event.operation;

    if (!source) {
      event.preventDefault();
      return;
    }

    const fromCell = board.getCellById(`${source.id}`);

    if (!fromCell?.figure) {
      event.preventDefault();
      return;
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { source } = event.operation;

    if (!source) return;

    const fromCell = board.getCellById(`${source.id}`);
    const point = getPointerPosition(event.nativeEvent);

    if (!fromCell?.figure?.logo || !point) return;

    setDragOverlay({
      src: fromCell.figure.logo,
      x: point.x,
      y: point.y,
    });

    setClickOnBoard(true);
  };

  const handleDragMove = (event: DragMoveEvent) => {
    const point = getPointerPosition(event.nativeEvent);

    if (!point) return;

    setDragOverlay((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        x: point.x,
        y: point.y,
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragOverlay(null);

    const { operation, canceled } = event;
    const { source, target } = operation;

    if (!source) return;

    const fromCell = board.getCellById(`${source.id}`);

    if (!fromCell) return;

    if (currentPlayer?.color !== fromCell.figure?.color) {
      setSelectedCell(null);
      return;
    }

    if (canceled || !target) {
      setSelectedCell(fromCell);
      return;
    }

    const toCell = board.getCellById(`${target.id}`);

    if (!toCell || !fromCell.figure?.canMove(toCell)) {
      setSelectedCell(fromCell);
      return;
    }

    if (fromCell.figure instanceof Pawn && (toCell.y === 0 || toCell.y === 7)) {
      setPromotionCell(toCell);
      fromCell.moveFigure(toCell);
    } else {
      fromCell.moveFigure(toCell);
      const newBoard = board.getDeepCopyBoard();
      makeMove(newBoard);
      swapPlayer();
    }

    setSelectedCell(null);
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
          <DragDropProvider onBeforeDragStart={handleBeforeDragStart} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} modifiers={(defaults) => [...defaults, RestrictToWindow]}>
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
            {dragOverlay && (
              <img
                className='dragging-figure-overlay'
                src={dragOverlay.src}
                alt='dragging figure'
                style={{
                  left: dragOverlay.x,
                  top: dragOverlay.y,
                }}
              />
            )}
          </DragDropProvider>
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