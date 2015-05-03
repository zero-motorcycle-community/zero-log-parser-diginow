'use strict';

requires.js('PubSub');

function Watch(object){
    Object.defineProperties(
        this,
        {
            cache:{
                value:'',
                enumerable:true
            }
        }
    );
    
    if(!object){
        console.log('you must pass what to begin watching as an argument');
        return;
    }
    
    new PubSub(object);
    
    try{
        object.watchCache=JSON.stringify(object);
    }catch(err){
        console.log('can not watch this. item to watch must work with JSON.stringify');
        return;
    }
    object.watchStart=start;
    object.watchStop=stop;
    object.watchInterval=false;
    
    function start(interval){
        if(!interval){
            interval=300;
        }
        
        object.RIAWatchInterval=setInterval(
            checkState,
            interval
        );
    }
    
    function stop(){
        clearInterval(object.RIAWatchInterval);
    }
    
    function checkState(){
        if(object.watchCache==JSON.stringify(object)){
            return;
        }
        
        object.emit(
            'changed'
        );
        
        object.watchCache=JSON.stringify(object)
    }
}