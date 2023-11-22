import logo from './logo.svg';
import './App.css';
// import Table1 from './components/table.js'
// import WebSocketTable from './utils/websocket.js'
import DisplayBox from './utils/websocket_real_data.js'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>

        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <DisplayBox />
    </div>
  );
}

export default App;
