import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error handling for the root rendering
const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to render app:', error);
    // Fallback rendering
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>SmartPYQ</h1>
        <p>Application failed to load. Please try refreshing the page.</p>
        <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    `;
  }
} else {
  console.error('Root element not found');
  // Create a fallback root element
  document.body.innerHTML = `
    <div id="root" style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>SmartPYQ</h1>
      <p>Application failed to initialize. Please try refreshing the page.</p>
      <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Refresh Page
      </button>
    </div>
  `;
  
  // Try to render again with the new root
  const newRootElement = document.getElementById('root');
  if (newRootElement) {
    try {
      createRoot(newRootElement).render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    } catch (retryError) {
      console.error('Retry failed:', retryError);
      newRootElement.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1>SmartPYQ</h1>
          <p>Application failed to load. Please check the console for errors.</p>
        </div>
      `;
    }
  }
}