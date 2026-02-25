/**
 * Global JavaScript for Smart MediPoint
 * Handles Socket.io and common functionality
 */

// Initialize Socket.io connection
let socket = null;

document.addEventListener('DOMContentLoaded', function() {
  initSocket();
  initNotifications();
});

/**
 * Initialize Socket.io connection
 */
function initSocket() {
  try {
    socket = io({
      withCredentials: true,
    });

    socket.on('connect', function() {
      console.log('[Socket] Connected');
    });

    socket.on('disconnect', function() {
      console.log('[Socket] Disconnected');
    });

    socket.on('connect_error', function(err) {
      console.log('[Socket] Connection error:', err.message);
    });

    // Listen for notifications
    socket.on('notification', function(data) {
      showNotification(data);
      updateNotificationCount();
    });

    // Listen for appointment updates
    socket.on('appointment:updated', function(data) {
      showNotification({
        type: 'appointment',
        message: data.message,
      });
    });

    // Listen for ticket updates
    socket.on('ticket:updated', function(data) {
      showNotification({
        type: 'ticket',
        message: data.message,
      });
    });

  } catch (err) {
    console.log('[Socket] Failed to initialize:', err.message);
  }
}

/**
 * Initialize notifications UI
 */
function initNotifications() {
  const notificationsBtn = document.getElementById('notificationsBtn');
  if (notificationsBtn) {
    notificationsBtn.addEventListener('click', function() {
      window.location.href = '/notifications';
    });
  }
  
  // Fetch initial notification count
  updateNotificationCount();
}

/**
 * Update notification badge count
 */
async function updateNotificationCount() {
  try {
    const response = await fetch('/notifications/unread-count');
    if (response.ok) {
      const data = await response.json();
      const badge = document.getElementById('notificationCount');
      if (badge) {
        if (data.count > 0) {
          badge.textContent = data.count > 99 ? '99+' : data.count;
          badge.style.display = 'block';
        } else {
          badge.style.display = 'none';
        }
      }
    }
  } catch (err) {
    console.log('[Notifications] Failed to fetch count');
  }
}

/**
 * Show a notification toast
 */
function showNotification(data) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'notification-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <i class="bi bi-bell"></i>
      <span>${data.message}</span>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="bi bi-x"></i>
    </button>
  `;
  
  // Add styles if not exists
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      .notification-toast {
        position: fixed;
        top: 80px;
        right: 20px;
        background: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 1000;
        animation: slideIn 0.3s ease;
      }
      .toast-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .toast-content i {
        color: #1a73e8;
      }
      .toast-close {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
      }
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 5000);
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime for display
 */
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
