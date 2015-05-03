'use strict';

function CustomEvents(){
    Object.defineProperties(
        this,
        {
            emit:{
                value:emitEvent,
                enumerable:true
            },
            addStub:{
                value:{},
                enumerable:true
            },
            stubs:{
                value:{},
                enumerable:true
            }
        }
    );
    
    function createEvent(type,data){
        data=data||{};
        var event=new CustomEvent(
            type,
            data
        );
        
        return event;
    }
    
    function addStub(type,data){
        this.stubs[type]=createEvent(type,data);
    }
    
    function emitEvent(target,type, data){
        var event=false;
        if(typeof type=='string'){
            event=createEvent(type,data);
            target.dispatchEvent(event);
            return;
        }
        
        event=this.stubs[type];
        
        for(var i in data){
            event[i]=data[i];
        }
        
        target.dispatchEvent(event);
    }
}