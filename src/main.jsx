import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './AuthContext'
import './index.css'

window.addEventListener('error', (e) => {
  document.body.innerHTML += `<div style="color:red; background:white; position:fixed; top:0; left:0; z-index:99999; padding:20px;">Error: ${e.message}<br/>${e.filename}:${e.lineno}</div>`;
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
