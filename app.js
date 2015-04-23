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

var json2csv = require('json2csv');

var server=nodeHttp.deploy(
    {
        port    : app.ports.app,
        root    : './gui/dataParser',
        domains : {}
    }
);

var headers={
    id:true,
    timestamp:true,
    status:true
};

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
                var fields=['logIndex','timestamp','status'];
                var logInfo=[];
                data.forEach(
                    function(val,index){
                        if(val.indexOf(delim)<0)
                            return;
                        
                        val=val.split(delim);
                        obj={};
                        
                        val[0]=val[0].replace(/ +/g,' ');
                        
                        val[1]=val[1].replace(/ +/g,'');
                        
                        val[0]=val[0].slice(1);
                        val[0]=val[0].split(' ');
                        
                        val[0]=[
                            parseInt(val[0][0]),
                            new Date(val[0][1]+' '+val[0][2]).getTime(),
                            val[0][3]
                        ];
                        
                        if(!val[0][0])
                            return;
                        
                        obj.logIndex=val[0][0];
                        obj.timestamp=val[0][1];
                        obj.status=val[0][2];
                        
                        
                        
                        var data={};
                        val[1]=val[1].split(',')
                        val[1].forEach(
                            function(value,index){
                                //convert to object!
                                
                                //console.log(index);
                                value=value.replace(/[\r\n]/ig,'');
                                
                                val[1][index]=value.split(':');
                                switch(val[1][index][0]){
                                    case 'PackTemp' :
                                        val[1][index][1]=val[1][index][1].replace('h','');
                                        break;
                                }
                                
                                if(val[1][index].length!=2){
                                    if(typeof val[1][index][0] == 'string'){
                                        //console.log('--==--',val[1][index]);
                                        if(val[1][index][0].length<1){
                                            val[1][index]=['',''];
                                            return;
                                        }
                                        
                                        if(val[1][index][0].slice(0,1)!='l'){
                                            val[1][index]=['',''];
                                            return;
                                        }
                                        
                                        value=[
                                            'PackTemp-l',
                                            val[1][index][0].slice(1)
                                        ];
                                        
                                        val[1][index]=value;
                                        
                                        //console.log(value)
                                    }
                                }
                                
                                if(fields.indexOf(val[1][index][0])==-1){
                                    //console.log('adding field',val[1][index][0])
                                    fields.push(val[1][index][0]);
                                }
                                
                                obj[val[1][index][0]]=val[1][index][1];
                            }
                        );
                        
                        //console.log(obj);
                            
                        logInfo.push(
                            obj
                        );
                    }    
                );
                
                //console.log(logInfo);
                
                json2csv(
                    {
                        data: logInfo, 
                        fields: fields
                    }, 
                    function(err, csv) {
                        if (err){ 
                            console.log(err);
                            return;
                        }
                        
                        //console.log(csv);
                        
                        fs.writeFile(
                            app.root+'/output/'+fileName.replace('.txt','.csv'), 
                            csv,
                            function (err) {
                                if(err){
                                    console.log('ERROR WRITING FILE ',app.root+'/output/'+fileName.replace('.json','.csv'))
                                    return;
                                }
                                
                                console.log('saved file ',app.root+'/output/'+fileName.replace('.txt','.csv'))
                                    
                            }
                        );
                    }
                );
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
