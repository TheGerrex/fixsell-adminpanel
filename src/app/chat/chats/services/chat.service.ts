import { Manager, Socket } from 'socket.io-client';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';

export const connectToServer = () => {
  console.log('Connecting to server');
  // Retrieve the token from localStorage or another storage mechanism
  const token = localStorage.getItem('token');

  if (!token) {
    console.error('no Token found. please login.');
    return;
  }
  const manager = new Manager(`${environment.baseUrl}/socket.io/socket.io.js`, {
    extraHeaders: {
      authentication: token,
    },
  });

  const socket = manager.socket('/');
  return socket;
};

export const addListeners = (socket: Socket) => {
  const serverStatusLabel = document.querySelector('#server-status')!;
  const messageForm = document.querySelector<HTMLFormElement>('#message-form')!;
  const messageInput =
    document.querySelector<HTMLInputElement>('#message-input')!;
  const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!;

  // TODO: #clients-ul
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

  // messages-ul

  socket.on(
    'message-from-server',
    (payload: { FullName: string; Message: string }) => {
      console.log('Received message:', payload);
      const li = document.createElement('li');
      li.textContent = `${payload.FullName}: ${payload.Message}`;
      messagesUl.appendChild(li);
    }
  );

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (messageInput.value.trim().length <= 0) return;

    socket.emit('message-from-client', {
      id: socket.id,
      message: messageInput.value,
      timestamp: new Date(),
    });
    console.log('Sending message:', messageInput.value);
    messageInput.value = '';
  });
};

export const connectToServerAsClient = () => {
  console.log('Connecting as client');
  const manager = new Manager(`${environment.baseUrl}/socket.io/socket.io.js`);
  const socket = manager.socket('/');

  // Emit an event to notify the server of the new client connection
  socket.emit('new-client-connected', { id: socket.id });

  return socket;
};

export const addClientListeners = (socket: Socket) => {
  const serverStatusLabel = document.querySelector('#server-status')!;
  const clientsUl = document.querySelector('#clients-ul')!;
  // Other elements...

  socket.on('connect', () => {
    serverStatusLabel.textContent = 'En Linea';
  });

  socket.on('disconnect', () => {
    serverStatusLabel.textContent = 'Desconectado';
  });

  // Handle the 'clients-updated' event from the server
  socket.on('clients-updated', (clients: string[]) => {
    clientsUl.innerHTML = ''; // Clear the list before updating
    clients.forEach((client) => {
      const li = document.createElement('li');
      li.textContent = client; // Assuming 'client' is a string ID or name
      clientsUl.appendChild(li);
    });
  });

  // Other event listeners...
};

export const connectToServerAsEmployee = (
  roomId: string,
  employeeId: string
) => {
  console.log('Connecting as employee with room id:', roomId);
  const manager = new Manager(`${environment.baseUrl}/socket.io/socket.io.js`);
  const socket = manager.socket('/', {
    auth: {
      token: 'YOUR_AUTH_TOKEN', // Your authentication token
      roomId: roomId, // Include roomId here
      employeeId: employeeId, // Include employeeId here
    },
  });

  // Emit an event to join the specified room and pass employeeId
  socket.emit('joinRoom', { roomId, employeeId });

  return socket;
};

export const addEmployeeListeners = (socket: Socket) => {
  const serverStatusLabel = document.querySelector('#server-status')!;
  const clientsUl = document.querySelector('#employees-ul')!;
  // Other elements...

  socket.on('connect', () => {
    serverStatusLabel.textContent = 'En Linea';
  });

  socket.on('disconnect', () => {
    serverStatusLabel.textContent = 'Desconectado';
  });

  // Handle the 'clients-updated' event from the server
  socket.on('employee-updated', (clients: string[]) => {
    clientsUl.innerHTML = ''; // Clear the list before updating
    clients.forEach((client) => {
      const li = document.createElement('li');
      li.textContent = client; // Assuming 'client' is a string ID or name
      clientsUl.appendChild(li);
    });
  });

  // Other event listeners...
};
