Ext.define('AM.model.workrecord',{
    extend:'Ext.data.Model',
    fields:[
        {name:'id',type:'int'},
        {name:'workTime',type:'string'},
        {name:'workLocation',type:'string'},
        {name:'workContent',type:'string'},
        {name:'user',type:'auto'},
        {name:'detail',type:'string'},
        {name:'username',type:'string', convert:function(v, record){
            var user = record.get('user');
            return user ? user.sysusername : '';
        }}
    ],
})
