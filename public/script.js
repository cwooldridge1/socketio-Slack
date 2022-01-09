const username = prompt('What is your username?')

const socket = io('http://localhost:9000') //main namespace   
let nsSocket = ''
//listen for ns list
socket.on('nsList', (data) => {
  //now we can update the dom 
  namespacesDiv = document.querySelector('#namespaces')
  namespacesDiv.innerHTML = ''
  data.forEach(ns => {
    namespacesDiv.innerHTML += `<div class='namespace' ns=${ns.endpoint}><img src="${ns.img}"></img></div>`
  })
  //now add an event listener for each namespace
  Array.from(document.getElementsByClassName('namespace')).forEach((elem) => {
    elem.addEventListener('click', (e) => {
      e.preventDefault();
      const nsEndpoint = elem.getAttribute('ns')
      //each elem will pull up a namespace
      joinNs(nsEndpoint)

    })
  })

  joinNs('/wiki')
})

