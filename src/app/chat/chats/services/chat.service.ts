import { Manager, Socket } from 'socket.io-client';
import { AuthService } from 'src/app/auth/services/auth.service';

// For User Connection
export const connectToServerAsUser = () => {
  console.log('connecting as user...');
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found. Please login.');
    return;
  }

  const manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
    extraHeaders: {
      authentication: token,
    },
  });

  const socket = manager.socket('/', {
    auth: {
      token,
      role: 'user', // Identify role
    },
  });

  return socket;
};

// For Admin Connection
export const connectToServerAsAdmin = (roomName: string) => {
  console.log('connecting as admin...');
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found. Please login.');
    return;
  }

  const manager = new Manager('http://localhost:3000/socket.io/socket.io.js', {
    extraHeaders: {
      authentication: token,
    },
  });

  const socket = manager.socket('/', {
    auth: {
      token,
      role: 'admin', // Identify role
      roomName,
    },
  });

  return socket;
};
export const addListeners = (
  socket: Socket,
  onRoomJoined: (roomName: string) => void,
  onChatHistoryReceived: (chatHistory: any[]) => void
) => {
  // Element selectors
  const serverStatusLabel = document.querySelector('#server-status')!;
  const messageForm = document.querySelector<HTMLFormElement>('#message-form')!;
  const messageInput =
    document.querySelector<HTMLInputElement>('#message-input')!;
  const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!;
  const clientsUl = document.querySelector('#clients-ul')!;

  // Current room name storage, made mutable by wrapping in an object
  let roomState = { currentRoomName: '' };

  // Socket event listeners
  setupSocketListeners(
    socket,
    serverStatusLabel,
    clientsUl,
    messagesUl,
    onRoomJoined,
    roomState
  );

  // Form submission listener
  setupFormListener(messageForm, messageInput, socket, roomState);

  // Handle chat history event
  socket.on('chatHistory', (chatHistory) => {
    console.log('Received chat history:', chatHistory);
    onChatHistoryReceived(chatHistory); // Call the callback with the chat history
    // Clear existing messages
    messagesUl.innerHTML = '';
    // Iterate over chat history and display each message
    chatHistory.forEach((chatHistoryItem: { senderId: any; message: any }) => {
      const messageLi = document.createElement('li');
      // Format the message as "senderId: Message"
      messageLi.textContent = `${chatHistoryItem.senderId}: ${chatHistoryItem.message}`;
      messagesUl.appendChild(messageLi);
    });
  });
};

function setupSocketListeners(
  socket: Socket,
  serverStatusLabel: Element,
  clientsUl: Element,
  messagesUl: HTMLUListElement,
  onRoomJoined: (roomName: string) => void,
  roomState: { currentRoomName: string }
) {
  socket.on('connect', () => (serverStatusLabel.textContent = 'En Linea'));
  socket.on(
    'disconnect',
    () => (serverStatusLabel.textContent = 'Desconectado')
  );

  socket.on(
    'clients-updated',
    (clients: { id: string; roomName: string }[]) => {
      clientsUl.innerHTML = '';
      clients.forEach((client) => {
        const li = document.createElement('li');
        li.textContent = `${client.id} - Room: ${client.roomName}`;
        clientsUl.appendChild(li);
      });
    }
  );

  socket.on(
    'message-from-server',
    (payload: { FullName: string; Message: string; RoomName: string }) => {
      console.log('recievd message from server');
      console.log(`message from server: ${JSON.stringify(payload)}`);
      // Only display messages from the current room
      console.log('payload roomname:', payload.RoomName);
      console.log('roomstate.currentroomname:', roomState.currentRoomName);
      console.log('payload:', payload);
      if (payload.RoomName === roomState.currentRoomName) {
        console.log(`message from server: ${JSON.stringify(payload)}`);
        const li = document.createElement('li');
        li.textContent = `${payload.FullName}: ${payload.Message}`;
        messagesUl.appendChild(li);
      }
    }
  );

  socket.on('room-joined', (roomName: string) => {
    console.log(`Joined room: ${roomName}`);
    roomState.currentRoomName = roomName; // Update the current room name
    onRoomJoined(roomName);
  });
}

function setupFormListener(
  messageForm: HTMLFormElement,
  messageInput: HTMLInputElement,
  socket: Socket,
  roomState: { currentRoomName: string }
) {
  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (messageInput.value.trim().length <= 0) return;

    // Include the current room name in the message payload
    socket.emit('message-from-client', {
      id: socket.id,
      message: messageInput.value,
      timestamp: new Date(),
      roomName: roomState.currentRoomName, // Use the current room name
    });
    console.log('Sending message:', messageInput.value);
    messageInput.value = '';
  });
}
