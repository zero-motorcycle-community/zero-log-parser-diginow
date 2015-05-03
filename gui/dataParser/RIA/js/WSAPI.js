'use strict';

requires.js('PubSub');

function WSAPI(url, port, secure){
    Object.defineProperties(
        this,
        {
            isOpen:{
                value:false,
                enumerable:true
            },
            url:{
                value:(secure)? 'wss://'+url : 'ws://'+url,
                enumerable:true
            },
            port:{
                value:port,
                enumerable:true
            },
            connect:{
                value:open,
                enumerable:true
            },
            send:{
                value:send,
                enumerable:true
            }
        }
    );
    
    new PubSub(this);
    
    if(!url || typeof url != 'string'){
        throw('wsAPI class requires url as first paramater')
    }
    
    function send(e){
        //should check if websocket is open
        var message={};
        try{
            message=JSON.stringify(e);
        }catch(err){
            console.log(err,'data to send must work with JSON.stringify',e,'is not in a valid format');
        }
        
        this._ws.send(
            message
        );
    }
    
    function open(){
        //should check if websocket is open
        this._ws = new WebSocket(
            (this.port)? 
                this.url+':'+this.port 
                : 
                this.url
        );
        this._ws.onopen = function (e) {
            this.emit(
                'opened',
                e
            );
        }.bind(this);
        this._ws.onclose = function (e) {
            this.emit(
                'closed',
                e
            );
        }.bind(this);
        this._ws.onerror = function (e) {
            this.emit(
                'errored',
                e
            );
        };
        this._ws.onabort = function (e) {
            this.emit(
                'aborted',
                e
            );
        }.bind(this);
        this._ws.onmessage = function (e) {
            e=JSON.parse(e.data);

            this.emit(
                e.type,
                e.data
            );
        }.bind(this);
    }
}