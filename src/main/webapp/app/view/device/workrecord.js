Ext.define('AM.view.device.workrecord' ,{
    extend: 'Ext.panel.Panel',
    alias: 'widget.workrecord',
    border: true,
    layout: 'border',

    items: [
        {
            xtype: 'toolbar',
            region: 'north',
            enableOverflow: true,
            items: [
                {
                    xtype:'textfield',
                    flex: 1,
                    minWidth: 150,
                    maxWidth: 250,
                    name:'queryKeyword',
                    emptyText:'请输入工作内容或地点',
                    fieldLabel:'搜索',
                    labelWidth: 40,
                    margin: '0 5 0 5',
                },
                {
                    xtype:'button',
                    text:'查询',
                    action: 'workrecordsearch',
                    minWidth: 60,
                    margin: '0 10 0 0',
                },
                '->',
                {
                    xtype: 'button',
                    action: 'addworkrecord',
                    text: '新增',
                    minWidth: 60,
                    margin: '0 3 0 0',
                    padding: '3 10'
                },
                {
                    xtype: 'button',
                    action: 'deleteworkrecord',
                    text: '删除',
                    minWidth: 60,
                    margin: '0 3 0 0',
                    padding: '3 10'
                }
            ]
        },
        {
            xtype:'workrecordgrid',
            region: 'center'
        }
    ]
});

Ext.define('AM.view.device.workrecordgrid',{
    extend:'Ext.grid.Panel',
    alias:'widget.workrecordgrid',
    store:'workrecordstore',
    autoScroll:true,
    forceFit:true,
    viewConfig: {
        loadMask: true
    },
    columns:[{
        text:'序号',
        align:'center',
        width:60,
        renderer: function(value, metaData, record, rowIndex) {
            return rowIndex + 1;
        }
    },{
        text:'工作时间',
        align:'center',
        dataIndex:'workTime',
        flex:1
    },{
        text:'工作地点',
        align:'center',
        dataIndex:'workLocation',
        flex:1
    },{
        text:'工作内容',
        align:'center',
        dataIndex:'workContent',
        flex:2
    },{
        text:'用户',
        align:'center',
        dataIndex:'username',
        flex:1
    },{
        text:'详情',
        align:'center',
        dataIndex:'detail',
        flex:2,
        renderer: function(value, metaData, record) {
            var role = SYS_USER ? SYS_USER.sysuserrole : null;
            var detail = value || '待确认';
            if (detail === '待确认' && role === 1) {
                return '<a href="#" class="approve-workrecord-link" data-id="' + record.get('id') + '" style="color: blue; text-decoration: underline;">待确认</a>';
            }
            return detail;
        }
    },{
        text:'操作',
        align:'center',
        flex:1,
        renderer: function(value, metaData, record) {
            var role = SYS_USER ? SYS_USER.sysuserrole : null;
            var detail = record.get('detail') || '待确认';
            var recordId = record.get('id');
            var actions = [];

            if (detail === '待确认') {
                if (role === 2) {
                    actions.push('<a href="#" class="edit-workrecord-link" data-id="' + recordId + '" style="color: blue; text-decoration: underline; margin-right: 10px;">修改</a>');
                    actions.push('<a href="#" class="delete-workrecord-link" data-id="' + recordId + '" style="color: red; text-decoration: underline;">删除</a>');
                }
            } else if (detail === '审核通过') {
                if (role === 1) {
                    actions.push('<a href="#" class="edit-workrecord-link" data-id="' + recordId + '" style="color: blue; text-decoration: underline; margin-right: 10px;">修改</a>');
                    actions.push('<a href="#" class="delete-workrecord-link" data-id="' + recordId + '" style="color: red; text-decoration: underline;">删除</a>');
                }
            }

            return actions.join('');
        }
    }],
    bbar: {
        xtype: 'pagingtoolbar',
        store: 'workrecordstore',
        displayInfo: true,
        displayMsg: '显示第 {0} - {1} 条，共 {2} 条',
        emptyMsg: '没有数据'
    }
})
