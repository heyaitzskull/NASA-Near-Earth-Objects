import { Link, Outlet } from "react-router";
import './App.css';

function App() {
  return (
    <div className="App">
      <aside className="sidebar">
        <h2>NASA NEO Dashboard</h2>
        <nav>
          <ul>
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/graphs">Graphs</Link></li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <Outlet /> 
      </main>
    </div>
  );
}

export default App;
