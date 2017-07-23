var webSocketServer = require('ws').Server;
var wss = new webSocketServer({port: 9090});




var rooms = {}
/* {RoomID : {userId: Socket1, user2Id: Socket2} } */

var connections = {}
//  {userId: socket_connection}

console.log("Signalling server online port 9090 ...");


wss.on('connection', function(connection) {

    console.log("User connected");

    connection.on('message', function(message) {

        /* Message structure
        {type: String,
         toId: String,
         fromId: String,
         payload: String} */


        var data;
        try {
            data = JSON.parse(message);
           // console.log("\nRecieved Message of type: ", data.type, " from: ", data.fromId);
        } catch (exception) {
            console.log("Invalid message received");
            data = {};
        }


        switch (data.type) {

            case "join":
                //Join a peer

                console.log("User: ", data.fromId, " joined");

                connections[data.fromId] = connection;
                connection.name = data.fromId;

                var connectionTo = connections[data.toId];

                if (connectionTo != null) {
                    //Other user is already connected, send a resp
                    connectionTo.peerName = data.fromId;
                    connection.peerName = data.toId;
                    connection.send(message);
                }
                break;

            case "offer":

                console.log("Forwarding offer to: " + data.toId);
                                //send the offer to the other user
                var connectionTo = connections[data.toId];
                if (connectionTo != null) {
                    connectionTo.send(message);
                }
                break;

            case "answer":
                //forward answer to the other user
                console.log("Forwarding answer to: " + data.toId);
                //send the offer to the other user
                var connectionTo = connections[data.toId];
                if (connectionTo != null) {
                    connectionTo.send(message);
                }
                break;

            case "candidate":
                //forward candidate to the other user
                console.log("Forwarding ICE candidate to: " + data.toId);
                //send the offer to the other user
                var connectionTo = connections[data.toId];
                if (connectionTo != null) {
                    connectionTo.send(message);
                }
                break;

            default:
                console.log("Unknown message or 'Hello'", data);
                break;

        }

    });

    connection.on("close", function() {

        console.log("Connection closed");

        if (connection.name) {
            //delete connection from dict
            delete connections[connection.name];

            if(connection.peerName) {
                //disconnect peer

                var connectionTo = connections[connection.peerName];

                if(connectionTo != null) {
                    connectionTo.close();
                    delete connections[connectionTo.name];
                }
            }
        }
   });
});

