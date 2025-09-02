import { useSocket } from "../hooks/useSocket";
import { useState, useEffect } from "react";

// Define notification types
interface Notification {
  id: string;
  type: 'user' | 'email' | 'system';
  message: string;
  status?: 'pending' | 'sent' | 'failed';
  timestamp: Date;
}

export default function NotificationPopups() {
  // Use the socket hook
  const { socket, connected, connectionStatus } = useSocket("http://localhost:3000");
  // Keep referenced so TypeScript allows it while you practice wiring
  void connectionStatus;
  
  // State for notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!socket) {
        console.error('No socket connected');
    }

    socket?.on('userCreated', (user) => {
        addNotification({
            id: `${user.id}-${Date.now()}`,
            type: 'user',
            message: `New user created: ${user.name}`,
            timestamp: new Date()
        });
    });

    socket?.on('emailStatus', (data) => {
        const { status, userEmail } = data;

        let message = '';
        if (status === 'pending') {
            message = `Sending email to ${userEmail}`;
        } else if (status === 'success') {
            message = `Email sent successfully to ${userEmail}`;
        } else {
            message = `Failed to send email to ${userEmail}`;
        }

        addNotification({
            id: `${userEmail}-${status}-${Date.now()}`,
            type: 'email',
            status: status === 'pending' ? 'pending' : 
                   status === 'success' ? 'sent' : 'failed',
            message,
            timestamp: new Date()
        });
    });

    return () => {
        socket?.off('userCreated');
        socket?.off('emailStatus');
    };
  }, [socket]);

  // function to add a notification
  const addNotification = (notification: Notification) => {
    setNotifications(prev => [...prev, notification]);
    
    // Auto-dismiss notifications after a delay
    setTimeout(() => {
      setNotifications(prev => 
        prev.filter(item => item.id !== notification.id)
      );
    }, notification.status === 'pending' ? 10000 : 5000);
  };
  // Keep referenced so TypeScript allows it while you practice wiring
  void addNotification;

  return (
    <div className="notification-container">
      {/* Connection status indicator */}
      <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
        {connected ? '🟢 Connected' : '🔴 Disconnected'} 
      </div>

      {/* Render all current notifications */}
      {notifications.map(notification => (
        <div 
          key={notification.id} 
          className={`notification ${notification.type} ${notification.status || ''}`}
        >
          {notification.message}
          <span className="timestamp">
            {notification.timestamp.toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  );
}
