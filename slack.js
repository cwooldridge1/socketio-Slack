const express = require('express');
const app = express();
const socketio = require('socket.io')

let namespaces = require('./data/namespaces')

app.use(express.static(__dirname + '/public'));

const expressServer = app.listen(9000);
const io = socketio(expressServer);


io.on('connection', (socket) => {

  //build an array to send back the image and endpoint for each namespace 
  let nsData = namespaces.map(ns => {
    return {
      img: ns.img,
      endpoint: ns.endpoint
    }
  })
  //now emit data to client. When we emit to client we use socket, io is for all users
  socket.emit('nsList', nsData)
})

//loop throught each namespace and listen for connection
namespaces.forEach((namespace) => {
  io.of(namespace.endpoint).on('connection', (nsSocket) => {
    //since a query is being passed on connection we need to access the socket
    //query which has the username through a handshake
    const username = nsSocket.handshake.query.username


    console.log(`${username} has joined ${namespace.endpoint}`)
    // a socket has just joined the namespace we now
    // need to send the ns info data back to client
    nsSocket.emit('nsRoomLoad', namespace.rooms)
    nsSocket.on('joinRoom', (room, numberOfUsersCallback) => {
      //before we join a room we must make sure we leave any rooms 
      const roomToLeave = Object.keys(nsSocket.rooms)[1]

      nsSocket.leave(roomToLeave)
      updateUsersInRoom(namespace, roomToLeave)


      nsSocket.join(room)
      io.of(namespace.endpoint).in(room).clients((error, clients) => {

        numberOfUsersCallback(clients.length)
      })
      //we now want to send out all the history
      const currentRoom = namespace.rooms.find((item) => {
        return item.roomTitle === room
      })
      nsSocket.emit('historyCatchUp', currentRoom.history)
      //send back num of users in this room to all sockets connected to this room
      updateUsersInRoom(namespace, room)
    })
    //list for messages in room
    nsSocket.on('newMessageToServer', (msg) => {
      const fullMsg = {
        text: msg.text,
        time: Date.now(),
        username: username,
        avatar: 'https://via.placeholder.com/30'
      }
      //send message to all sockets that are in the room

      //first find room of socket
      //the user wil be in the secound room of the object list necause the socket 
      //always joins its own room on connection
      const roomTitle = Object.keys(nsSocket.rooms)[1]
      //we meed tp find the room Object for this room to get msg history
      let currentRoom
      namespace.rooms.forEach(room => {
        if (room.roomTitle === roomTitle) { currentRoom = room }
      })
      currentRoom.addMessage(fullMsg)
      io.of(namespace.endpoint).to(roomTitle).emit('messageToClients', fullMsg)

    })
  })

})

const updateUsersInRoom = (namespace, roomTitle) => {
  //in and to are the same thing
  io.of(namespace.endpoint).in(roomTitle).clients((error, clients) => {
    io.of(namespace.endpoint).to(roomTitle).emit('updateMembers', clients.length)
  })
}