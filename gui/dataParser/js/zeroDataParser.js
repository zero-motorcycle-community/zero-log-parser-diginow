'use strict';

requires.js(
    'WSAPI',
    'Template'
);

var api,
    template,
    templates,
    head,
    body;

var tempRow='',
    headCols='',
    config={};

templates={
    row:'<section>${content}</section>',
    col:'<div>${content}</div>'
}

config.ws={
    host:'localhost',
    port:8008
}

document.addEventListener(
    'requirementLoaded',
    initApp
);

document.addEventListener(
    'requirementLoaded',
    function(){
        head=document.querySelector('#outputTableHead');
        body=document.querySelector('#outputTableBody');
        
    }
);

function initApp(){
    if(!requires.isDOMReady || !requires.ready){
        return;
    }
    
    document.removeEventListener(
        'requirementLoaded',
        initApp
    );
    
    template=new Template();
    
    api=new WSAPI(
        config.ws.host,
        config.ws.port
    );
    
    api.on(
        'parsedData',
        pushToTable
    );
    
    api.connect();
    
    document.querySelector('#readDataButton').addEventListener(
        'click',
        fetchDataFromText
    );
    
}

function fetchDataFromText(){
    head.innerHTML='';
    body.innerHTML='';
    headCols='';
    
    document.getElementById('inputData').style.display='none';
    document.getElementById('header').style.display='none';
    //prevent browser from choking on large file
    fetchDataObject(
        document.querySelector('#zeroDataContent').value
    );
}

function fetchDataObject(data){
    api.send(
        {
            type:'parseData',
            data:data
        }
    );
}

function prepTable(data){
    var count=Object.keys(data[0]).length;
    
    document.styleSheets[0].rules[2].style.width='calc(100% / '+
        count
    +' - '+
        count
    +'px)';
    
    for(var key in data[0]){
        headCols+=template.fill(
            templates.col,
            {
                content:key
            }
        );

        tempRow+=template.fill(
            templates.col,
            {
                content:'${'+key+'}'
            }
        );
    }

    head.innerHTML=template.fill(
        templates.row,
        {
            content:headCols
        }
    );

    templates.bodyRow=template.fill(
        templates.row,
        {
            content:tempRow
        }
    );
}

function pushToTable(data){
    if(!data)
        return;
    
    if(!headCols){
        prepTable(data)
    }
    
    var output='';
    
    for(var i=0; i<data.length; i++){
        output+=template.fill(
            templates.bodyRow,
            data[i]
        );
    }
    
    body.innerHTML=output;
}