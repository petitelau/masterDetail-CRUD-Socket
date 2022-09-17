export {getExportersData, sendUpdateToServerViaSocket}

const getExportersData = ()=> {
    return fetch('http://localhost:8080/getFileExporters')
        .then(r=> r.json())
        .catch(err=> console.log(err))
}

const sendUpdateToServer = (objs)=> {
    return fetch('http://localhost:8080/updFileExporter', {
        method: 'POST',
        headers: {'Content-Type': 'application/json' },
        body: JSON.stringify(objs)
    }).then(r=>  r.json() );

}

const sendUpdateToServerViaSocket = (socket, objs)=> {
    console.log('socket', socket)
    console.log("object to send" + JSON.stringify(objs), socket)
    socket.emit("updExporters", objs)

}

