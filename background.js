let recognition; // Declare the SpeechRecognition object outside the function to maintain its state

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "transcribe") {
    startTranscription(sender.tab.id, sendResponse);
  } else if (request.action === "stopTranscription") {
    stopTranscription(sendResponse);
  } else if (request.action === 'transcriptionComplete') {
    // Assume 'transcript' is the transcription text received from the content script
    const transcript = request.transcript;
    // ... Save the 'transcript' data using your preferred method (e.g., FileSaver.js, local storage, etc.)
    saveTranscriptionToFile(transcript, sendResponse);
  }
});

function startTranscription(tabId, sendResponse) {
  if (recognition && recognition.abort) {
    // If there's an ongoing recognition, stop it
    recognition.abort();
  }

  recognition = new webkitSpeechRecognition() || new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = function (event) {
    const transcript = event.results[event.results.length - 1][0].transcript;
    chrome.tabs.sendMessage(tabId, { action: 'transcriptionUpdate', transcript: transcript });
  };

  recognition.onend = function () {
    chrome.tabs.sendMessage(tabId, { action: 'transcriptionComplete' });
    sendResponse({ status: "success", message: "Transcription complete" });
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error:", event.error);
    sendResponse({ status: "error", message: "Speech recognition error" });
  };

  recognition.start();
}

function stopTranscription(sendResponse) {
  if (recognition && recognition.abort) {
    recognition.abort();
  }
  sendResponse({ status: "success", message: "Transcription stopped" });
}

// background.js
function saveTranscriptionToFile(transcript, sendResponse) {
  try {
    // Retrieve the file name from the options page input field
    const fileNameInput = document.getElementById('fileName');
    const fileName = fileNameInput ? fileNameInput.value : 'transcription.txt';

    // Create a Blob with the transcription data
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });

    // Save the Blob with the specified file name
    saveAs(blob, fileName);

    sendResponse({ status: "success", message: "Transcription saved" });
  } catch (error) {
    console.error("Error saving transcription:", error);
    sendResponse({ status: "error", message: "Error saving transcription" });
  }
}

