document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('startTranscription');
  const overlay = document.getElementById('overlay');

  startButton.addEventListener('click', function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'startTranscription' });
    });
  });

  chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'displayError') {
      displayError(request.message);
    }
  });

  function displayError(message) {
    overlay.textContent = message;
    overlay.style.display = 'block';

    // Hide the error after 5 seconds
    setTimeout(function () {
      overlay.style.display = 'none';
    }, 5000);
  }
});
