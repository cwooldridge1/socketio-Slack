const joinNs = (endpoint) => {
  if (nsSocket) {
    //check to see if nsSocket is already connected
    nsSocket.close()
    document.querySelector('.message-form').removeEventListener('submit', formSubmission)
  }

  // set default namespace and add username as query
  nsSocket = io(`http://localhost:9000${endpoint}`, {
    query: {
      username: username
    }
  })
  //itterate namespaces
  nsSocket.on('nsRoomLoad', (nsRooms) => {
    // console.log(nsRooms)
    let roomList = document.querySelector('.room-list');
    roomList.innerHTML = "";
    nsRooms.forEach((room) => {
      let glyph;
      if (room.privateRoom) {
        glyph = 'lock'
      } else {
        glyph = 'globe'
      }

      roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}"></span>${room.roomTitle}</li>`
      document.querySelector('#user-input')
    })
    // add click listener to each room
    let roomNodes = document.getElementsByClassName('room');
    Array.from(roomNodes).forEach((elem) => {
      elem.addEventListener('click', (e) => {
        // console.log("Somone clicked on ",e.target.innerText);
        joinRoom(e.target.innerText)
      })
    })
    // add room automatically... first time here
    const topRoom = document.querySelector('.room')
    const topRoomName = topRoom.innerText;
    // console.log(topRoomName);
    joinRoom(topRoomName)

  })

  nsSocket.on('messageToClients', (msg) => {
    document.querySelector('#messages').innerHTML += buildHTML(msg)

  })

  document.querySelector('.message-form').addEventListener('submit', formSubmission)

}
function formSubmission(e) {
  e.preventDefault();
  const newMessage = document.querySelector('#user-message').value;
  nsSocket.emit('newMessageToServer', { text: newMessage })
}

function buildHTML(msg) {
  const convertedDate = new Date(msg.time).toLocaleString();
  const newHTML = `
          <li>
          <div class="user-image">
            <img src="${msg.avatar}" />
          </div>
          <div class="user-message">
            <div class="user-name-time">${msg.username}<span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
          </div>
        </li>
  `
  return newHTML
}
