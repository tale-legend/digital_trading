import logo from './logo.svg';
import './App.css';
// import Table1 from './components/table.js'
// import WebSocketTable from './utils/websocket.js'
import DisplayBox from './utils/websocket_real_data.js'

function App() {
  return (
    <div className="App">
      {/* <header className="App-header">
      每隔100ms实时获取
      </header> */}
      <DisplayBox />
    </div>
  );
}

export default App;
