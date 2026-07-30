Ext.define('AM.view.device.weeklyreport',{
    extend:'Ext.panel.Panel',
    alias:'widget.weeklyreport',
    layout:{
        type:'border'
    },
    initComponent:function(){
        var me = this;
        this.callParent(arguments);
        
        var toolbar = this.down('toolbar');
        
        var session = Ext.util.Cookies.get('JSESSIONID');
        var isAdmin = false;
        
        Ext.Ajax.request({
            url: '/weeklyreport/checkRole',
            async: false,
            success: function(response){
                var result = Ext.JSON.decode(response.responseText);
                if(result.success && result.role === 1){
                    isAdmin = true;
                }
            }
        });
        
        if(isAdmin){
            toolbar.add({
                xtype:'button',
                action:'approveAllweeklyreports',
                text:'一键审核',
                minWidth:80,
                margin:'0 3 0 0',
                padding:'3 10'
            });
            toolbar.add({
                xtype:'button',
                action:'exportweeklyreports',
                text:'导出Excel',
                minWidth:80,
                margin:'0 3 0 0',
                padding:'3 10'
            });
        }
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

var currentWeeklyReportUserRole = 0;

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
            text:'状态',
            align:'center',
            dataIndex:'detail',
            width:100,
            renderer:function(value, metaData, record){
                if(value === '审核通过'){
                    return '<span style="color:green;font-weight:bold;">' + value + '</span>';
                } else {
                    return '<span style="color:orange;">' + (value || '待确认') + '</span>';
                }
            }
        },
        {
            text:'操作',
            align:'center',
            width:250,
            renderer:function(value,metaData,record){
                var actions = [];
                var detail = record.get('detail') || '待确认';
                var id = record.get('id');
                var isAdmin = currentWeeklyReportUserRole === 1;
                var isNormalUser = currentWeeklyReportUserRole === 2;
                
                console.log('=== WeeklyReport Renderer Debug ===');
                console.log('ID:', id, 'Detail:', detail, 'Role:', currentWeeklyReportUserRole, 'isAdmin:', isAdmin, 'isNormalUser:', isNormalUser);
                
                if(isAdmin){
                    if(detail === '审核通过'){
                        actions.push('<a href="#" style="color:blue;margin-right:10px;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'editweeklyreportclick\',' + id + ')">修改</a>');
                        actions.push('<a href="#" style="color:red;margin-right:10px;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'deleteweeklyreportclick\',' + id + ')">删除</a>');
                    }
                    if(detail === '待确认'){
                        actions.push('<a href="#" style="color:green;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'approveweeklyreportclick\',' + id + ')">审核</a>');
                    }
                } else if(isNormalUser){
                    if(detail === '待确认'){
                        actions.push('<a href="#" style="color:blue;margin-right:10px;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'editweeklyreportclick\',' + id + ')">修改</a>');
                        actions.push('<a href="#" style="color:red;margin-right:10px;" onclick="Ext.ComponentQuery.query(\'viewport > panel > centerpage > weeklyreport\')[0].fireEvent(\'deleteweeklyreportclick\',' + id + ')">删除</a>');
                    }
                }
                
                return actions.join('');
            }
        }
    ],
    bbar:{
        xtype:'pagingtoolbar',
        store:'weeklyreportstore',
        displayInfo:true,
        displayMsg:'显示 {0} - {1} 条，共 {2} 条',
        emptyMsg:'没有数据'
    },
    initComponent: function() {
        var me = this;
        
        Ext.Ajax.request({
            url: '/weeklyreport/checkRole',
            async: false,
            success: function(response){
                var result = Ext.JSON.decode(response.responseText);
                console.log('=== checkRole Debug ===', result);
                if(result.success){
                    currentWeeklyReportUserRole = result.role;
                }
            },
            failure: function(response){
                console.log('=== checkRole Failed ===', response);
            }
        });
        console.log('=== currentWeeklyReportUserRole ===', currentWeeklyReportUserRole);
        
        this.callParent(arguments);
        
        this.on('itemdblclick', function(grid, record) {
            var panel = Ext.ComponentQuery.query('viewport > panel > centerpage > weeklyreport')[0];
            if(panel){
                panel.fireEvent('editweeklyreportclick', record.get('id'));
            }
        });
    }
})
