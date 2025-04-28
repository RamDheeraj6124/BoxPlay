import React from 'react';
import { Link } from 'react-router-dom';

function PageNotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>404</h1>
        <p style={styles.subtitle}>Oops! The page you're looking for doesn't exist.</p>
        
        <div style={styles.sports}>
          <span role="img" aria-label="cricket bat" style={styles.emoji}>🏏</span>
          <span role="img" aria-label="soccer ball" style={styles.emoji}>⚽</span>
          <span role="img" aria-label="tennis ball" style={styles.emoji}>🎾</span>
          <span role="img" aria-label="basketball" style={styles.emoji}>🏀</span>
        </div>

        <p style={styles.message}>Looks like you missed the shot! Let's get you back to the Home Page.</p>

        <Link to="/" style={styles.button}>🏠 Go Home</Link>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100%',
    backgroundColor: '#f0f2f5', // Light grey background
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  content: {
    padding: '40px',
    borderRadius: '15px',
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    width: '100%',
  },
  title: {
    fontSize: '100px',
    fontWeight: 'bold',
    color: '#ff4c4c',
    margin: '0',
  },
  subtitle: {
    fontSize: '24px',
    marginTop: '10px',
    color: '#333',
  },
  sports: {
    fontSize: '40px',
    margin: '30px 0',
  },
  emoji: {
    margin: '0 10px',
  },
  message: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
  },
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '30px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    transition: 'background-color 0.3s ease',
  },
};

export default PageNotFound;
