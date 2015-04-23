var app     = require('./core/app.config.js'),
    pubSub  = require('event-pubsub'),
    nodeHttp= require('node-http-server'),
    wsServer= require('ws').Server,
    events  = new pubSub(),
    fs      = require('fs'),
    ws      = new wsServer(
        {
            port:app.ports.api
        }
    ),
    delim='                     ';

var server=nodeHttp.deploy(
    {
        port    : app.ports.app,
        root    : './gui/dataParser',
        domains : {}
    }
);

events.on(
    'getFiles',
    function(data,socket){
        fs.readdir(
            app.root+'/data/', 
            function (err, data) {
                if(err)
                    data='Error Reading Dir';
                
                console.log(data);
                
                events.trigger('getFile',data[0]);
            }
        );
    }
);

events.on(
    'getFile',
    function(fileName){
        fs.readFile(
            app.root+'/data/'+fileName, 
            {
                encoding:'utf8'
            },
            function (err, data) {
                data=data.split('\n');
                var logInfo=[];
                data.forEach(
                    function(val,index){
                        if(val.indexOf(delim)<0)
                            return;
                        
                        val=val.split(delim);
                        
                        console.log(val[0].replace(/ +/g,' '))
                        continue;
                        
                        val[0]=val[0].replace(/\s{2,}/g,' ');
                        val[1]=val[1].replace(/\s{2,}/g,' ');
                        
                        logInfo.push(
                            val
                        );
                    }    
                );
                
                //console.log(logInfo);
            }
        );
    }
);

events.trigger('getFiles');

ws.on(
    'connection',
    function(socket) {
        socket.on(
            'message', 
            function(data) {
                try{
                    data=JSON.parse(data);
                }catch(err){
                    ipc.log('Invalid websocket data format, ignoring'.warn);
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
                    ipc.log('Invalid websocket event recieved, ignoring it.'.notice);
                    return;
                }
                
                if(!data.data)
                    data.data={};
                
                ipc.log('Websocket Event Recieved'.debug, data.type.data, data.data);
                
                events.trigger(
                    data.type,
                    data.data,
                    socket
                );
            }
        );
    }
);
