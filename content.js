let isTranscribing = false;
let transcription = '';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startTranscription") {
    if (!isTranscribing) {
      isTranscribing = true;

      try {
        // 1. Access audio stream from the webpage
        const audioElement = document.querySelector('audio'); // Adapt this selector as needed

        if (!audioElement) {
          console.error("No audio element found on the webpage.");
          sendResponse({ status: "error", message: "No audio element found on the webpage." });
          return;
        }

        // 2. Send audio data to background script for transcription
        const audioStream = audioElement.captureStream();
        chrome.runtime.sendMessage({ action: "transcribe", audioData: audioStream });

        // 3. Handle incoming partial transcripts from background script
        chrome.runtime.onMessage.addListener(function onTranscriptionMessage(response) {
          if (response.transcript) {
            transcription += response.transcript;
            updateTranscriptElement(transcription);
          }

          if (response.action === 'transcriptionComplete') {
            chrome.runtime.onMessage.removeListener(onTranscriptionMessage);
            isTranscribing = false;
            sendResponse({ status: "success", message: "Transcription complete" });
          }
        });

        sendResponse({ status: "success", message: "Transcription started" });
      } catch (error) {
        console.error("Error starting transcription:", error);
        sendResponse({ status: "error", message: "Failed to start transcription" });
      }
    } else {
      sendResponse({ status: "already_running", message: "Transcription already in progress" });
    }
  } else if (request.action === "stopTranscription") {
    stopTranscription();
  }
});

function updateTranscriptElement(transcriptText) {
  // Update the UI element displaying the transcript (modify this based on your UI)
  const transcriptDiv = document.getElementById('transcript');
  if (transcriptDiv) {
    transcriptDiv.textContent = transcriptText;
  }
}

function stopTranscription() {
  isTranscribing = false;
  transcription = ''; // Reset the transcription
  // Terminate any ongoing audio recording or transcription processes
  // (Implementation depends on your specific audio handling methods)
}
// When transcription is complete
function transcriptionComplete(transcript) {
  // Send a message to the background script indicating transcription completion
  chrome.runtime.sendMessage({ action: 'transcriptionComplete', transcript: transcript });
}
