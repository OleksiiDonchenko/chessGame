import { useEffect, useRef, useState } from "react";
import { Square } from "../modules/board/Square";
import { Colors } from "../modules/Colors";
import { Pawn } from "../modules/pieces/Pawn";
import { Board } from "../modules/board/Board";
import { useGameTimers } from "./useGameTimers";
import { Player } from "../modules/Player";
import { useGameControls } from "./useGameControls";
import { useBoardDrag } from "./useBoardDrag";
import { useChessHistory } from "./useChessHistory";
import { useGameSidebar } from "./useGameSidebar";

export function useChessGame() {

  const [gameIsOn, setGameIsOn] = useState(false);
  const [gameWasStarted, setGameWasStarted] = useState(false);
  const [isAnalysis, setIsAnalysis] = useState(false);

  const [whitePoints, setWhitePoints] = useState(0);
  const [blackPoints, setBlackPoints] = useState(0);
  const [whoLeads, setWholeads] = useState(0);

  const boardRef = useRef<HTMLDivElement>(null);
  const [clickOnBoard, setClickOnBoard] = useState<boolean>(false);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [whitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  // useChessHistory
  const { board, setBoard, currentMove, history, setHistory, setCurrentMove, makeMove, goToPreviousMove, goToNextMove, snapshotBoard, setNewBoard } = useChessHistory();

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

  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer);
  }

  function highlightSquares() {
    board.highlightSquares(selectedSquare);
    updateBoard();
  }

  useEffect(() => {
    highlightSquares();
  }, [selectedSquare]);

  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
    return newBoard;
  }

  function restart() {
    const newBoard = new Board();
    newBoard.initSquares();
    newBoard.addPieces();
    setBoard(newBoard);
    setWhitePoints(0);
    setBlackPoints(0);
    setWholeads(0);
    setHistory([newBoard.getDeepCopyBoard()]);
    setCurrentMove(0);
  }

  useEffect(() => {
    restart();
  }, []);

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

  // useGameTimers
  const { blackFormattedTime, whiteFormattedTime, resetTimers } = useGameTimers({ board, snapshotBoard, gameIsOn, setGameIsOn, isAnalysis, currentPlayer, setCurrentPlayer, setSelectedSquare });

  // useGameControls
  const { handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw } = useGameControls({ board, setGameIsOn, setGameWasStarted, setIsAnalysis, setCurrentPlayer, setSelectedSquare, whitePlayer, resetTimers, restart });

  // useBoardDrag
  const { handleDragStart, handleDragEnd, handleDragCancel } = useBoardDrag({ board, makeMove, setClickOnBoard, currentPlayer, setPromotionSquare, setSelectedSquare, swapPlayer });

  // useGameSidebar
  const { nextMove, previousMove } = useGameSidebar({ isAnalysis, currentMove, goToPreviousMove, goToNextMove, boardRef, clickOnBoard, setClickOnBoard, setSelectedSquare, swapPlayer });

  return {
    gameIsOn, setGameIsOn, gameWasStarted, setGameWasStarted, isAnalysis, setIsAnalysis,

    whitePoints, setWhitePoints, blackPoints, setBlackPoints, whoLeads, setWholeads,

    boardRef, clickOnBoard, setClickOnBoard, promotionSquare, selectedSquare, setSelectedSquare, currentPlayer, setCurrentPlayer, whitePlayer, blackPlayer,

    board, history, currentMove, goToPreviousMove, goToNextMove, snapshotBoard, setNewBoard,

    mouseDown, handlePromotion, swapPlayer, restart, clickOnTheBoard,

    blackFormattedTime, whiteFormattedTime, resetTimers,

    handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw,

    handleDragStart, handleDragEnd, handleDragCancel,

    nextMove, previousMove,
  };
}