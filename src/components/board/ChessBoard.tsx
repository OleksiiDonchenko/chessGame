import React, { useEffect, useRef, useState } from 'react';
import { useChessContext } from '../../context/ChessContext';
import { Board } from '../../modules/board/Board';
import { Square } from '../../modules/board/Square';
import { Player } from '../../modules/Player';
import { Colors } from '../../modules/Colors';
import { Pawn } from '../../modules/pieces/Pawn';
import GameControls from '../controls/GameControls';
import CapturedPieces from './CapturedPieces';
import PromotionModal from '../promotion/PromotionModal';
import GameSidebar from '../sidebar/GameSidebar';
import Clock from '../../assets/icons/clock.svg?react';
import { DndContext } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import DroppableSquare from './DroppableSquare';
import DraggablePiece from './DraggablePiece';

function ChessBoard() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [whitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);
  const [whitePoints, setWhitePoints] = useState(0);
  const [blackPoints, setBlackPoints] = useState(0);
  const [whoLeads, setWholeads] = useState(0);
  const [clickOnBoard, setClickOnBoard] = useState<boolean>(false);

  const { board, setBoard, history, sethistory, currentMove, setCurrentMove, makeMove, goToPreviousMove, goToNextMove, snapshotBoard } = useChessContext();
  
  useEffect(() => {
    highlightSquares();
  }, [selectedSquare]);

  function mouseDown(square: Square) {
    if (selectedSquare && selectedSquare !== square && selectedSquare.piece?.canMove(square)) {
      if (selectedSquare.piece instanceof Pawn && (square.y === 0 || square.y === 7)) {
        setPromotionSquare(square);
        selectedSquare.movePiece(square);
      } else {
        selectedSquare.movePiece(square);
        const newBoard = board.getDeepCopyBoard();
        makeMove(newBoard);
        swapPlayer();
      }
      setSelectedSquare(null);
    } else {
      if (square.piece?.color === currentPlayer?.color) {
        setSelectedSquare(square);
      }
    }
    if (square.piece === null || square.piece.color !== currentPlayer?.color) {
      setSelectedSquare(null);
    }
  }

  function handlePromotion(piece: string) {
    if (promotionSquare && promotionSquare.piece instanceof Pawn) {
      const pawn = promotionSquare.piece;
      promotionSquare.addLostPiece(pawn);
      promotionSquare.piece = board.createNewPiece(piece, promotionSquare.piece.color, promotionSquare);
      let enemyColor = Colors.WHITE;
      if (promotionSquare.piece) {
        enemyColor = promotionSquare.piece.color === Colors.BLACK ? Colors.WHITE : Colors.BLACK;
        promotionSquare.piece.isItPromotionPiece = true;
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
      board.promotionPieceValues(pawn.color);
      const newBoard = board.getDeepCopyBoard();
      makeMove(newBoard);
      swapPlayer();
    }
    setPromotionSquare(null);
  }

  function highlightSquares() {
    board.highlightSquares(selectedSquare);
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
    newBoard.initSquares();
    newBoard.addPieces();
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
        !board.doAlliedPiecesExist(Colors.WHITE) ? handleDraw(Colors.WHITE) : board.losingByTime(currentPlayer.color);
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
        !board.doAlliedPiecesExist(Colors.BLACK) ? handleDraw(Colors.BLACK) : board.losingByTime(currentPlayer.color);
        handleStopGame();
        snapshotBoard(board);
      }
    }
  }

  function handleRestart() {
    setgameIsOn(false);
    setGameWasStarted(false);
    setCurrentPlayer(null);
    setSelectedSquare(null);
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
    setSelectedSquare(null);
  }

  function handleDraw(color: Colors) {
    board.handleDraw(color);
    handleStopGame();
  }

  const handleDragStart = (event: any) => {
    const { over } = event;
    const piece = event.activatorEvent.srcElement;
    const square = piece.parentElement;

    const squareRect = square.getBoundingClientRect();

    // Size the piece
    const pieceSize = 60;

    // The cursor position in the square
    const cursorX = event.activatorEvent.clientX - squareRect.left;
    const cursorY = event.activatorEvent.clientY - squareRect.top;

    // Offset for centering the piece under the cursor
    const offsetX = cursorX - pieceSize / 2;
    const offsetY = cursorY - pieceSize / 2;

    piece.style.left = `${offsetX}px`;
    piece.style.top = `${offsetY}px`;

    piece.addEventListener('mouseup', () => {
      piece.style.left = '2px';
      piece.style.top = '2px';
    });

    setClickOnBoard(true);

    if (!over) return;
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const piece = event.activatorEvent.srcElement;
    const fromSquare = board.getSquareById(`${active.id}`);
    const toSquare = board.getSquareById(`${over.id}`);

    if (currentPlayer?.color === fromSquare?.piece?.color) {
      if (fromSquare && toSquare && fromSquare.piece?.canMove(toSquare)) {
        if (fromSquare.piece instanceof Pawn && (toSquare.y === 0 || toSquare.y === 7)) {
          setPromotionSquare(toSquare);
          fromSquare.movePiece(toSquare);
        } else {
          fromSquare.movePiece(toSquare);
          const newBoard = board.getDeepCopyBoard();
          makeMove(newBoard);
          swapPlayer();
        }
        setSelectedSquare(null);
      } else if (fromSquare?.piece?.color === currentPlayer?.color) {
        setSelectedSquare(fromSquare);
      }
    }

    piece.style.left = '2px';
    piece.style.top = '2px';
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
          <GameControls handleRestart={handleRestart}
            handleStartGame={handleStartGame}
            handleAnalysis={handleAnalysis}
            handleStopGame={handleStopGame}
            handleDraw={handleDraw}
            gameIsOn={gameIsOn}
            gameWasStarted={gameWasStarted}
            currentPlayer={currentPlayer}
            board={board}
            snapshotBoard={snapshotBoard} />
          <div className='capturedPiecesAndTime'>
            <CapturedPieces
              board={board}
              color='white'
              pieces={board.lostWhitePieces}
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
            <div ref={boardRef} className={['board', promotionSquare ? 'eclipse' : ''].join(' ')} onClick={() => clickOnTheBoard()}>
              {promotionSquare && (
                <PromotionModal onSelect={handlePromotion} x={promotionSquare.x} color={promotionSquare.piece?.color}
                  square={promotionSquare} />
              )}
              {board.squares.map((row, y) => <React.Fragment key={y}>
                {row.map((square) => <DroppableSquare
                  key={square.id}
                  id={`${square.x}-${square.y}`}
                  color={square.color}
                  selected={square.x === selectedSquare?.x && square.y === selectedSquare?.y}
                  isAvailable={square.available}
                  isKingInCheck={square.isKingInCheck}
                  isCheckmate={square.isCheckmate}
                  resign={square.resign}
                  losingByTime={square.losingByTime}
                  isVictory={square.isVictory}
                  isStalemate={square.isStalemate}
                  isDraw={square.isDraw}
                  handleStopGame={handleStopGame}
                  square={square}
                  mouseDown={mouseDown}
                  coordinates={{ x: square.x, y: square.y }}
                >
                  {square.piece?.logo && (
                    <DraggablePiece
                      id={`${square.x}-${square.y}`}
                      src={square.piece.logo} />
                  )}
                </DroppableSquare>
                )}
              </React.Fragment>
              )}
            </div>
          </DndContext>
          <div className='capturedPiecesAndTime'>
            <CapturedPieces
              board={board}
              color='black'
              pieces={board.lostBlackPieces}
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
        <GameSidebar history={history} currentMove={currentMove} goToPreviousMove={goToPreviousMove}
          goToNextMove={goToNextMove} boardRef={boardRef} clickOnBoard={clickOnBoard} setClickOnBoard={setClickOnBoard}
          swapPlayer={swapPlayer} isAnalysis={isAnalysis} setSelectedSquare={setSelectedSquare} currentPlayer={currentPlayer} />
      </div>
    </>
  );
}

export default ChessBoard;