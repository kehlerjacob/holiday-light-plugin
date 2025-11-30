
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const WIDGET_ID = 'holiday-light-widget-root';

function initWidget() {
  // Check if widget container already exists
  let container = document.getElementById(WIDGET_ID);

  if (!container) {
    container = document.createElement('div');
    container.id = WIDGET_ID;

    // CRITICAL: Set container to fill viewport so React app can render properly
    container.style.position = 'fixed';
    container.style.inset = '0';
    container.style.zIndex = '9999';
    container.style.display = 'block';

    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <StrictMode>
        <App onClose={() => {
          // Hide the container when closed
          container.style.display = 'none';
        }} />
      </StrictMode>
    );
  } else {
    // If it exists, just show it
    container.style.display = 'block';
  }
}

// Listen for clicks on triggers
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('holiday-light-trigger')) {
    e.preventDefault();
    initWidget();
  }
});

console.log('Holiday Light Widget loaded. Add class "holiday-light-trigger" to any button to activate.');
