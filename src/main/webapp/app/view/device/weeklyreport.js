Ext.define('AM.view.device.weeklyreport',{
    extend:'Ext.panel.Panel',
    alias:'widget.weeklyreport',
    layout:{
        type:'border'
    },
    items:[
        {
            xtype:'toolbar',
            region:'north',
            items:[
                {
                    xtype:'textfield',
                    name:'searchField',
                    emptyText:'请输入关键词搜索',
                    width:200,
                    listeners:{
                        specialkey:function(field,e){
                            if(e.getKey() == e.ENTER){
                                var grid = Ext.ComponentQuery.query('viewport > panel > centerpage > weeklyreport weeklyreportgrid')[0];
                                if (grid) {
                                    var store = grid.getStore();
                                    store.load({
                                        params:{
                                            keyword:field.getValue()
                                        }
                                    });
                                }
                            }
                        }
                    }
                },
                {
                    xtype:'button',
                    action:'searchweeklyreports',
                    text:'搜索',
                    minWidth:80,
                    margin:'0 3 0 0',
                    padding:'3 10'
                },
                {
                    xtype:'tbfill'
                },
                {
                    xtype:'button',
                    action:'addweeklyreport',
                    text:'新增',
                    minWidth:80,
                    margin:'0 3 0 0',
                    padding:'3 10'
                },
                {
                    xtype:'button',
                    action:'deleteweeklyreport',
                    text:'删除',
                    minWidth:80,
                    margin:'0 3 0 0',
                    padding:'3 10'
                }
            ]
        },
        {
            xtype:'weeklyreportgrid',
            region:'center'
        }
    ]
});

Ext.define('AM.view.device.weeklyreportgrid',{
    extend:'Ext.grid.Panel',
    alias:'widget.weeklyreportgrid',
    store:'weeklyreportstore',
    autoScroll:true,
    forceFit:true,
    viewConfig:{
        loadMask:true
    },
    columns:[
        {
            text:'序号',
            align:'center',
            width:60,
            renderer:function(value, metaData, record, rowIndex){
                return rowIndex + 1;
            }
        },
        {
            text:'周',
            align:'center',
            dataIndex:'weekRange',
            flex:2
        },
        {
            text:'工作内容',
            align:'center',
            dataIndex:'workContent',
            flex:4,
            renderer:function(value){
                if(value && value.length > 50){
                    return value.substring(0,50) + '...';
                }
                return value || '';
            }
        },
        {
            text:'用户',
            align:'center',
            dataIndex:'username',
            flex:1
        },
        {
            text:'操作',
            align:'center',
            width:120,
            renderer:function(value,metaData,record){
                var actions = [];
                actions.push('<a href="#" style="color:blue;margin-right:10px;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'editweeklyreportclick\',' + record.get('id') + ')">修改</a>');
                actions.push('<a href="#" style="color:red;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'deleteweeklyreportclick\',' + record.get('id') + ')">删除</a>');
                return actions.join('');
            }
        }
    ],
    initComponent:function(){
        this.dockedItems = [{
            xtype:'pagingtoolbar',
            store:'weeklyreportstore',
            dock:'bottom',
            displayInfo:true,
            displayMsg:'显示 {0} - {1} 条，共 {2} 条',
            emptyMsg:'没有数据'
        }];
        this.addEvents('editweeklyreportclick','deleteweeklyreportclick');
        this.callParent(arguments);
    }
})