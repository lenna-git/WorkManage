Ext.define('AM.store.workrecordstore',{
    extend:'Ext.data.Store',
    model:'AM.model.workrecord',
    autoLoad:true,
    pageSize: 20,
    remoteSort: false,
    remoteFilter: false,

    proxy:{
        type:'ajax',
        url:'/workrecord/allworkrecords',
        pageParam: 'page',
        limitParam: 'limit',
        startParam: undefined,
        reader:{
            type:'json',
            root:'data',
            totalProperty:'total'
        },
        simpleSortMode: true
    }
})
