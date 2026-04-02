import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import './index.css';

const NavBar = () => {
  const location = useLocation();
  return (
    <nav className="main-nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Generate</Link>
      <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="container">
        <header className="app-header">
          <h1>Fit & Size Multi-Model Generator</h1>
          <p>Internal Prototype - Fit & Size Comparison</p>
          <NavBar />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
