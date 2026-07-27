Ext.define('AM.view.device.weeklyreport',{
    extend:'Ext.panel.Panel',
    alias:'widget.weeklyreport',
    layout:{
        type:'vbox',
        align:'stretch'
    },
    items:[
        {
            xtype:'toolbar',
            items:[
                {
                    xtype:'textfield',
                    name:'searchField',
                    emptyText:'请输入关键词搜索',
                    width:200,
                    listeners:{
                        specialkey:function(field,e){
                            if(e.getKey() == e.ENTER){
                                var store = Ext.data.StoreMgr.lookup('weeklyreportstore');
                                store.load({
                                    params:{
                                        keyword:field.getValue()
                                    }
                                });
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
            xtype:'gridpanel',
            flex:1,
            store:Ext.create('AM.store.weeklyreportstore'),
            alias:'widget.weeklyreportgrid',
            columns:[
                {
                    text:'序号',
                    xtype:'rownumberer',
                    width:60,
                    align:'center'
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
                    flex:2,
                    renderer:function(value,metaData,record){
                        var detail = record.get('detail');
                        var role = SYS_USER ? SYS_USER.sysuserrole : 0;
                        var actions = [];
                        
                        if(role === 1){
                            actions.push('<a href="#" style="color:blue;margin-right:10px;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'editweeklyreportclick\',' + record.get('id') + ')">修改</a>');
                            actions.push('<a href="#" style="color:red;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'deleteweeklyreportclick\',' + record.get('id') + ')">删除</a>');
                        } else {
                            actions.push('<a href="#" style="color:blue;margin-right:10px;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'editweeklyreportclick\',' + record.get('id') + ')">修改</a>');
                            actions.push('<a href="#" style="color:red;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'deleteweeklyreportclick\',' + record.get('id') + ')">删除</a>');
                        }
                        return actions.join('');
                    }
                }
            ],
            bbar:{
                xtype:'pagingtoolbar',
                store:Ext.create('AM.store.weeklyreportstore'),
                displayInfo:true,
                displayMsg:'显示 {0} - {1} 条，共 {2} 条',
                emptyMsg:'没有数据'
            }
        }
    ],
    initComponent:function(){
        this.callParent(arguments);
        this.addEvents('editweeklyreportclick','deleteweeklyreportclick');
    }
})