import './App.css';
import ChessBoard from './components/ChessBoard';
import { ChessProvider } from './context/ChessContext';

function App() {

  return (
    <ChessProvider>
      <main className='main'>
        <ChessBoard />
      </main>
    </ChessProvider>
  )
}

export default App
