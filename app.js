var app     = require('./core/config.js'),
    nodeHttp= require('node-http-server'),
    pubSub  = require('event-pubsub'),
    wsServer= require('ws').Server,
    events  = new pubSub(),
    parser  = require('./zero-data-live.js'),
    fs      = require('fs'),
    ws      = new wsServer(
        {
            port:app.ws.port
        }
    ),
    delim='                     ';

var server=nodeHttp.deploy(
    {
        port    : app.http.port,
        root    : app.root+app.http.rootDir,
        index   : 'index.html',
        verbose : false
    }
);

var headers={
    id:true,
    timestamp:true,
    status:true
};

events.on(
    'parseData',
    function(data,socket){
        var data=parser(data);
        socket.send(
            JSON.stringify(
                {
                    type:'parsedData',
                    data:data
                }
            )
        );
    }
);

ws.on(
    'connection',
    function(socket) {
        socket.on(
            'message', 
            function(data) {
                try{
                    data=JSON.parse(data);
                }catch(err){
                    console.log('Invalid websocket data format, ignoring'.warn);
                    socket.send(
                        JSON.stringify(
                            {
                                type : 'error',
                                data : {
                                    message : 'invalid websocket data format'
                                }
                            }    
                        )    
                    );
                    return;
                }
                if(!data.type){
                    console.log('Invalid websocket event recieved, ignoring it.'.notice);
                    return;
                }
                
                if(!data.data)
                    data.data={};
                
                console.log('Websocket Event Recieved'.debug, data.type.data, data.data);
                
                events.trigger(
                    data.type,
                    data.data,
                    socket
                );
            }
        );
    }
);
