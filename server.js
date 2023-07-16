const express = require('express');
const { createServer } = require('http');
const socketio = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors());

const server = createServer(app);
const io = socketio(server);

app.all('/', (req, res) => {
  res.send('Hello world');
});

const users = [];
const messages = [];

const addUser = (id, username) => {
  // make sure user is not connected already
  const user = users.find((user) => user.id === id);
  if (user) return;

  const newUser = { id: user.length + 1, username };
  users.push(newUser);
  return newUser;
};

const removeUser = (id) => {
  const userIndex = users.findIndex((user) => user.id === id);
  if (userIndex === -1) return;

  users.splice(userIndex, 1);
  return;
};

const getCurrentUser = (id) => {
  return users.find((user) => user.id === id);
};

const addMessage = (msg, username) => {
  const newMessage = { id: messages.length + 1, username, msg };
  messages.push(newMessage);
  return newMessage;
};

io.on('connection', (socket) => {
  socket.on('joinChat', ({ userId, username }) => {
    const user = addUser(userId, username);

    if (user.id) {
      socket.join('group-chat');
      socket.join(userId);
      io.to(userId).emit('existingComments', messages);
    }
  });

  //  listen for messages
  socket.on('message', ({ userId, username, msg }) => {
    const user = getCurrentUser(userId);
    if (!user) return;

    io.to('group-chat').emit('newMessage', addMessage(msg, username));
  });

  socket.on('disconnect', ({ userId }) => {
    removeUser(userId);
    const user = getCurrentUser();
    socket.rooms.size = 0;
    io.to('group-chat').emit(
      'newNotification',
      `${user.username} just left the chat`
    );
  });
});

app.listen(5000, () => console.log('server running on port 5000'));
