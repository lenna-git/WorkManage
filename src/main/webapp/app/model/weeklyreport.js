Ext.define('AM.model.weeklyreport',{
    extend:'Ext.data.Model',
    fields:[
        {name:'id',type:'int'},
        {name:'weekRange',type:'string'},
        {name:'workContent',type:'string'},
        {name:'user',type:'auto'},
        {name:'createTime',type:'string'},
        {name:'updateTime',type:'string'},
        {name:'username',type:'string', convert:function(v, record){
            var user = record.get('user');
            return user ? user.sysusername : '';
        }}
    ],
})