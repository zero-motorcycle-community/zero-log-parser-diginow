var fs      = require('fs'),
    delim   = '                     ';

function parseZeroData(data){
    if(!data || typeof data !== 'string')
        return;
    
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

            logInfo.push(
                obj
            );
        }    
    );
    
    return logInfo;
}

module.exports=parseZeroData;