Ext.define('AM.view.Center',{
    extend:'Ext.container.Container',
    alias:'widget.centerpage',
    layout:{
        type:'card',
    },
    id:'centerpage',
    activeItem:0,
    renderTo: Ext.getBody(),

    requires:[
        'AM.view.user.userlist',
        'AM.view.device.devicelist',
        'AM.view.user.DeviceRecordView',
        'AM.view.user.DeviceTransferRecordView',
        'AM.view.user.ChangePasswordView',
        'AM.view.user.LogOperationView',
        //右側有哪些頁面，都要放在這裏
    ],
    items:[
        {
            xtype:'devicelist',
            id:'main-device',
            title: 'card1:devices',
        },
        {
            width:'100%',
            height:'100%',
            xtype:'userlist1',
            id:'main-user',
            title: '用户信息',
        },{
            xtype:'ChangePasswordView',
            id:'main-ChangePassword',
            title: '修改密码',
        // },{
        //     xtype:'DeviceRecordView',
        //     id:'main-DeviceRecord',
        //     title: '借用记录:',
        // },{
        //     xtype:'DeviceTransferRecordView',
        //     id:'main-DeviceTransferRecord',
        //     title: '转借记录:',
        },{
            xtype:'LogOperationView',
            id:'main-LogOperation',
            title: '日志审计',
        }
    ]
})