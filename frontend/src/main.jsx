import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';

function App() {
  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Stage 1 foundation</p>
        <h1>LeadFlow AI</h1>
        <p className="subtitle">
          React frontend foundation for the project architecture described in the master specification.
        </p>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
