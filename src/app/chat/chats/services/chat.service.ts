import { Manager, Socket } from 'socket.io-client';
import { AuthService } from 'src/app/auth/services/auth.service';

export const connectToServer = () => {
  // Retrieve the token from localStorage or another storage mechanism
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('no Token found. please login.');
    return;
  }
  const manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
    extraHeaders: {
      authentication: token,
    },
  });

  const socket = manager.socket('/');
  return socket;
};

export const addListeners = (
  socket: Socket,
  onRoomJoined: (roomName: string) => void
) => {
  const serverStatusLabel = document.querySelector('#server-status')!;
  const messageForm = document.querySelector<HTMLFormElement>('#message-form')!;
  const messageInput =
    document.querySelector<HTMLInputElement>('#message-input')!;
  const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!;
  let currentRoomName = ''; // Variable to store the current room name

  socket.on('connect', () => {
    serverStatusLabel.textContent = 'En Linea';
  });

  socket.on('disconnect', () => {
    serverStatusLabel.textContent = 'Desconectado';
  });

  socket.on('clients-updated', (clients: string[]) => {
    const clientsUl = document.querySelector('#clients-ul')!;
    clientsUl.innerHTML = '';
    clients.forEach((client) => {
      const li = document.createElement('li');
      li.textContent = client;
      clientsUl.appendChild(li);
    });
  });

  socket.on(
    'message-from-server',
    (payload: { FullName: string; Message: string }) => {
      console.log('Received message:', payload);
      const li = document.createElement('li');
      li.textContent = `${payload.FullName}: ${payload.Message}`;
      messagesUl.appendChild(li);
    }
  );

  // Listen for the room-joined event to store the room name
  socket.on('room-joined', (roomName: string) => {
    console.log(`Joined room: ${roomName}`);
    currentRoomName = roomName; // Store the room name
    onRoomJoined(roomName); // Call the callback with the new room name
  });

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (messageInput.value.trim().length <= 0) return;

    // Include the room name when emitting the message
    socket.emit('message-from-client', {
      id: socket.id,
      message: messageInput.value,
      timestamp: new Date(),
      roomName: currentRoomName, // Include the current room name
    });
    console.log('Sending message:', messageInput.value);
    messageInput.value = '';
  });
};
