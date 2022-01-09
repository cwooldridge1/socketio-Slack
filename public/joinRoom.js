const joinRoom = (roomName) => {
  //send this roomName to the server  

  // room we are joining with room name, then a callbvack for after connection
  nsSocket.emit('joinRoom', roomName, (numberOfMembers) => {
    //we want to update the room member total now that we have joined on dom

    document.querySelector('.curr-room-num-users').innerHTML = `${numberOfMembers} <span class="glyphicon glyphicon-user"></span>`
  });

  nsSocket.on('historyCatchUp', (history) => {
    //now update the dom with history
    const messagesUl = document.querySelector('#messages');
    messagesUl.innerHTML = ""
    history.forEach(msg => {
      const newMsg = buildHTML(msg)
      const currentMessages = messagesUl.innerHTML
      messagesUl.innerHTML = currentMessages + newMsg
    })
    messagesUl.scrollTo(0, messagesUl.scrollHeight)
  })
  nsSocket.on('updateMembers', (num) => {
    document.querySelector('.curr-room-num-users').innerHTML = `${num} <span class="glyphicon glyphicon-user"></span>`
    document.querySelector('.curr-room-text').innerText = `${roomName}`
  })
}