import React, { useState, useEffect } from 'react';
import { Mic, Search } from 'lucide-react';

const barre = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'fr-FR';

      speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      speechRecognition.onerror = () => setIsListening(false);
      speechRecognition.onend = () => setIsListening(false);

      setRecognition(speechRecognition);
    }
  }, []);

  const handleVoiceInput = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
      setIsListening(!isListening);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search submitted:', searchQuery);
  };

  return (
    <form onSubmit={handleSearchSubmit} className="w-100">
      <div className={`position-relative transition-all ${isInputFocused ? 'scale-105' : 'scale-100'}`}>
        <div className={`d-flex align-items-center border rounded-pill bg-white overflow-hidden transition-all p-2 px-3 ${isInputFocused ? 'border-success shadow-lg' : 'border-secondary shadow-sm'}`}>
          <Search className="text-muted me-2" size={18} />
          <input
            type="text"
            className="form-control border-0 shadow-none flex-grow-1"
            placeholder="Rechercher des produits éco-responsables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            aria-label="Search eco-friendly products"
          />
          <button
            type="button"
            className={`btn ${isListening ? 'btn-outline-success' : 'btn-light'} me-2`}
            onClick={handleVoiceInput}
            disabled={!recognition}
            aria-label={isListening ? 'Stop listening' : 'Voice search'}
          >
            <Mic
              size={18}
              className={isListening ? 'animate-pulse text-success' : 'text-muted'}
            />
          </button>
          <button
            type="submit"
            className="btn btn-success px-4"
          >
            Rechercher
          </button>
        </div>
      </div>

      <div className="text-center mt-2 text-muted small">
        Exemples : Produits bios, Matériaux recyclés, Cosmétiques naturels
      </div>
    </form>
  );
};

export default barre;
