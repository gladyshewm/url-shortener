import './App.css';

const App = () => {
  return (
    <div className="App">
      <h1>URL shortener</h1>
      <div className="form">
        <input type="text" placeholder="Enter the URL" />
        <button>Shorten</button>
      </div>
      <input type="text" readOnly placeholder="There will be a short link" />
    </div>
  );
};

export default App;
