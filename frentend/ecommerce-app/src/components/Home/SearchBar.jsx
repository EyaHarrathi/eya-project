import React, { useState } from 'react';
import { Mic, Search } from 'react-bootstrap-icons';

const styles = {
  container: {
    width: '100%',
    maxWidth: '600px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '50px',
    overflow: 'hidden',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  inputGroupFocus: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
  searchInput: {
    border: 'none',
    height: '40px',
    paddingLeft: '10px',
    flex: 1,
    transition: 'all 0.3s',
    outline: 'none',
  },
  searchIcon: {
    backgroundColor: 'transparent',
    border: 'none',
    borderRight: 'none',
    color: '#6c757d',
    paddingRight: '5px',
    display: 'flex',
    alignItems: 'center',
  },
  micButton: {
    backgroundColor: 'transparent',
    border: 'none',
    borderLeft: 'none',
    color: '#6c757d',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    paddingLeft: '5px',
    display: 'flex',
    alignItems: 'center',
  },
  micListening: {
    color: '#dc3545',
    animation: 'pulse 1.5s infinite',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)', opacity: 1 },
    '50%': { transform: 'scale(1.1)', opacity: 0.8 },
    '100%': { transform: 'scale(1)', opacity: 1 },
  }
};

const SearchBar = ({ placeholder = "Rechercher...", onSearch, onEnterPress }) => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  const handleMicClick = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;

      recognition.start();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        if (onSearch) {
          onSearch(transcript);
        }
        if (onEnterPress) {
          onEnterPress();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Erreur de reconnaissance vocale :', event.error);
        setIsListening(false);
      };
    } else {
      console.error('La reconnaissance vocale n\'est pas supportée par ce navigateur.');
    }
  };

  return (
    <form style={styles.container} onSubmit={(e) => e.preventDefault()}>
      <div style={styles.inputGroup}>
        <span style={styles.searchIcon}>
          <Search />
        </span>
        <input
          type="text"
          style={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          aria-label="Search"
        />
        <button
          type="button"
          onClick={handleMicClick}
          aria-label="Search with voice"
          style={{
            ...styles.micButton,
            ...(isListening ? styles.micListening : {})
          }}
        >
          <Mic />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;