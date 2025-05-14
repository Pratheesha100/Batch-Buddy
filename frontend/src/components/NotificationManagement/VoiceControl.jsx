import { useState, useEffect } from 'react';
import { Mic, Volume2 } from 'lucide-react';

// Mic Button Component with listening indicator
export const MicButton = ({ isListening, onClick, className = '' }) => {
  return (
    <div className="relative">
      <button 
        onClick={onClick}
        className={`p-2 rounded-full ${
          isListening 
            ? 'bg-green-100 text-green-600' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } transition-colors ${className}`}
        title={isListening ? 'Listening...' : 'Start voice command'}
        type="button"
      >
        <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
      </button>
      
      {/* Small listening indicator */}
      {isListening && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white">
          <div className="absolute inset-0.5 bg-green-400 rounded-full animate-ping"></div>
        </div>
      )}
    </div>
  );
};

// Volume Button Component
export const VolumeButton = ({ onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors p-2 rounded-full hover:bg-blue-50 ${className}`}
    title="Read aloud"
    type="button"
  >
    <Volume2 className="w-4 h-4" />
    <span className="text-sm">Read Aloud</span>
  </button>
);

// Main VoiceControl Hook
const useVoiceControl = ({ onCommand, onSpeak, isListening, setIsListening }) => {
  const [recognition, setRecognition] = useState(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        onCommand(transcript);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      
      return () => {
        if (recognitionInstance) {
          recognitionInstance.abort();
        }
      };
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, [onCommand, setIsListening]);

  const startListening = () => {
    if (recognition) {
      try {
        setIsListening(true);
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
      }
    } else {
      console.warn('Speech recognition not available');
      onSpeak?.('Speech recognition is not supported in your browser.');
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported');
    }
  };

  return {
    startListening,
    speak,
    isListening, // Expose isListening state
    MicButton: (props) => (
      <div className="relative">
        <MicButton 
          isListening={isListening} 
          onClick={startListening} 
          {...props} 
        />
        {/* Small floating speech indicator */}
        {isListening && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2 bg-black/80 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            Listening...
          </div>
        )}
      </div>
    ),
    VolumeButton: (props) => (
      <VolumeButton 
        onClick={props.onClick} 
        {...props} 
      />
    )
  };
};

export default useVoiceControl;
