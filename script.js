// DOM Elements
const btn = document.getElementById("btn");
const stopBtn = document.getElementById("stopBtn");
const results = document.getElementById("text");
const resultContainer = document.getElementById("result");
const statusText = document.getElementById("status");
const listeningIndicator = document.getElementById("listeningIndicator");
const languageSelect = document.getElementById("language");
const continuousCheckbox = document.getElementById("continuous");

// Speech Recognition Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
  btn.disabled = true;
  stopBtn.disabled = true;
} else {
  const recognition = new SpeechRecognition();

  // Configuration
  recognition.lang = languageSelect.value;
  recognition.interimResults = false;
  recognition.continuous = false;

  let isListening = false;
  let finalTranscript = '';

  // Language change handler
  languageSelect.addEventListener('change', () => {
    recognition.lang = languageSelect.value;
    updateStatus(`Language changed to ${languageSelect.options[languageSelect.selectedIndex].text}`);
  });

  // Continuous listening toggle
  continuousCheckbox.addEventListener('change', () => {
    recognition.continuous = continuousCheckbox.checked;
    updateStatus(continuousCheckbox.checked ? "Continuous listening enabled" : "Continuous listening disabled");
  });

  // Start listening
  btn.addEventListener('click', () => {
    if (!isListening) {
      startListening();
    }
  });

  // Stop listening
  stopBtn.addEventListener('click', () => {
    if (isListening) {
      stopListening();
    }
  });

  function startListening() {
    try {
      recognition.start();
      isListening = true;
      btn.disabled = true;
      stopBtn.disabled = false;
      showListeningIndicator(true);
      updateStatus("Listening...");
    } catch (error) {
      console.error("Error starting recognition:", error);
      updateStatus("Error starting speech recognition");
      resetUI();
    }
  }

  function stopListening() {
    recognition.stop();
    isListening = false;
    btn.disabled = false;
    stopBtn.disabled = true;
    showListeningIndicator(false);
    updateStatus("Stopped listening");
  }

  function resetUI() {
    isListening = false;
    btn.disabled = false;
    stopBtn.disabled = true;
    showListeningIndicator(false);
  }

  function showListeningIndicator(show) {
    listeningIndicator.style.display = show ? 'flex' : 'none';
    statusText.style.display = show ? 'none' : 'block';
  }

  function updateStatus(message) {
    statusText.textContent = message;
  }

  // Recognition event handlers
  recognition.onstart = function() {
    console.log("Speech recognition started");
    updateStatus("Listening...");
  };

  recognition.onresult = function(event) {
    let interimTranscript = '';
    let newFinalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        newFinalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }

    if (newFinalTranscript) {
      finalTranscript += newFinalTranscript;
      results.innerText = finalTranscript;
      resultContainer.classList.add('has-content');

      if (!recognition.continuous) {
        stopListening();
        updateStatus("Speech captured successfully!");
      }
    }

    console.log("Final transcript:", finalTranscript);
  };

  recognition.onend = function() {
    console.log("Speech recognition ended");
    if (isListening && recognition.continuous) {
      // Restart continuous listening
      setTimeout(() => {
        if (isListening) {
          recognition.start();
        }
      }, 100);
    } else {
      resetUI();
      if (finalTranscript) {
        updateStatus("Speech recognition completed");
      } else {
        updateStatus("Ready to listen");
      }
    }
  };

  recognition.onerror = function(event) {
    console.error("Speech recognition error:", event.error);
    let errorMessage = "Speech recognition error";

    switch(event.error) {
      case 'no-speech':
        errorMessage = "No speech detected. Please try again.";
        break;
      case 'audio-capture':
        errorMessage = "Audio capture failed. Check your microphone.";
        break;
      case 'not-allowed':
        errorMessage = "Microphone access denied. Please allow microphone access.";
        break;
      case 'network':
        errorMessage = "Network error occurred.";
        break;
      case 'service-not-allowed':
        errorMessage = "Speech recognition service not allowed.";
        break;
      default:
        errorMessage = `Error: ${event.error}`;
    }

    updateStatus(errorMessage);
    resetUI();
  };

  recognition.onaudiostart = function() {
    console.log("Audio capturing started");
  };

  recognition.onaudioend = function() {
    console.log("Audio capturing ended");
  };
}

// Utility functions
function copyDivToClipboard() {
  const textToCopy = results.innerText;
  if (textToCopy && textToCopy !== "Your speech will appear here...") {
    navigator.clipboard.writeText(textToCopy).then(() => {
      updateStatus("Text copied to clipboard!");
      setTimeout(() => updateStatus("Ready to listen"), 2000);
    }).catch(err => {
      console.error("Failed to copy: ", err);
      updateStatus("Failed to copy text");
    });
  } else {
    updateStatus("No text to copy");
  }
}

function clearText() {
  results.innerText = "Your speech will appear here...";
  finalTranscript = '';
  resultContainer.classList.remove('has-content');
  updateStatus("Text cleared");
}

function downloadText() {
  const textToDownload = results.innerText;
  if (textToDownload && textToDownload !== "Your speech will appear here...") {
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech-to-text-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    updateStatus("Text downloaded successfully!");
    setTimeout(() => updateStatus("Ready to listen"), 2000);
  } else {
    updateStatus("No text to download");
  }
}

// Initialize status
updateStatus("Ready to listen");
