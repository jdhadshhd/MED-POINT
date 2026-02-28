// public/js/support-chat.js
// Handles real-time support chat for patients

// Ensure socket.io client is loaded in the HTML before this script
const socket = io();

const chatInput = document.getElementById('chat-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const chatMessages = document.getElementById('chat-messages');

function appendMessage(message, sent = true) {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message ' + (sent ? 'message-sent' : 'message-received');
  msgDiv.textContent = message;
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (sendMessageBtn && chatInput) {
  sendMessageBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;
  appendMessage(message, true);
  socket.emit('support:message', { message });
  chatInput.value = '';
}

// Listen for admin replies
socket.on('support:reply', (data) => {
  appendMessage(data.message, false);
});

// Optionally, listen for system messages
socket.on('support:system', (data) => {
  appendMessage(data.message, false);
});
