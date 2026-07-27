Ext.define('AM.controller.Devices', {
    extend: 'Ext.app.Controller',

    init: function() {
        this.control({
            //找对应的按钮
            'viewport > panel': {
                render: this.onPanelRendered
            },
            'viewport > panel > centerpage > devicelist > devicelistgrid':{
                itemdblclick: this.onDblClick,
                cellclick:this.ondevicegridcellclick,
            },
            'viewport > panel > centerpage > devicelist toolbar button[action=xz]':{
                click: this.onxzbuttonclick
            },
            'viewport > panel > centerpage > devicelist toolbar button[action=sc]':{
                click: this.onscbuttonclick
            },
            'viewport > panel > centerpage > devicelist toolbar button[action=update]':{
                click: this.onupdatebuttonclick
            },
            'viewport > panel > centerpage > devicelist toolbar button[action=devicesearch]':{
                click: this.ondevcxbuttonclick
            },
            'viewport > panel > centerpage > workrecord toolbar button[action=addworkrecord]':{
                click: this.onAddWorkRecordClick
            },
            'viewport > panel > centerpage > workrecord toolbar button[action=workrecordsearch]':{
                click: this.onWorkRecordSearchClick
            },
            'viewport > panel > centerpage > workrecord toolbar button[action=deleteworkrecord]':{
                click: this.onDeleteWorkRecordClick
            },
            'viewport > panel > centerpage > workrecord toolbar button[action=exportworkrecords]':{
                click: this.onExportWorkRecordsClick
            },
            'viewport > panel > centerpage > workrecord workrecordgrid':{
                cellclick: this.onWorkRecordCellClick
            },

        });
    },
    models:['devicelist'],
    stores:['deviceliststore'],
    refs:[{
        selector: 'viewport > panel > centerpage > devicelist > devicelistgrid',
        ref:'testgrid'
    },{
        selector: 'viewport > panel > centerpage > devicelist toolbar textfield[name=queryxp]',
        ref: 'devicequeryxptextfield'
    },{
        selector: 'viewport > panel > centerpage > devicelist toolbar textfield[name=querylx]',
        ref: 'devicequerylxtextfield'
    },{
        selector: 'viewport > panel > centerpage > devicelist toolbar textfield[name=queryxh]',
        ref: 'devicequeryxhtextfield'
    },{
        selector: 'viewport > panel > centerpage > devicelist toolbar textfield[name=querycs]',
        ref: 'devicequerycstextfield'
    },{
        selector: 'devicexzwindow > textfield[name=devicexp]',
        ref: 'devicexptextfield'
    },{
        selector: 'devicexzwindow > textfield[name=devicetype]',
        ref: 'devicetypetextfield'
    },{
        selector: 'devicexzwindow > textfield[name=devicexh]',
        ref: 'devicexhtextfield'
    },{
        selector: 'devicexzwindow > combo[name=devmanufacturer_id]',
        ref: 'devmanufacturerselector'
    },{
        selector: 'devicexzwindow > textfield[name=devicesn]',
        ref: 'devicesntextfield'
    },{
        selector: 'devicexzwindow > textfield[name=deviceno]',
        ref: 'devicenotextfield'
    },{
        selector: 'devicexzwindow > textfield[name=devicescdata]',
        ref: 'devicescdatatextfield'
    },{
        selector: 'devicexzwindow > textfield[name=deviceajdata]',
        ref: 'deviceajdatatextfield'
    },{
        selector: 'devicexzwindow > textfield[name=deviceghdata]',
        ref: 'deviceghdatatextfield'
    },{
        selector: 'devicexzwindow > combo[name=deviceyh.id]',
        ref: 'deviceyhcombo'
    },{
        selector: 'devicexzwindow > combo[name=devicestate.id]',
        ref: 'devicestatecombo'
    }],
    onPanelRendered: function() {
        // console.log('The panel was rrrrendered');
        
        // 注册设备状态更新回调
        var me = this;
        registerDeviceStatusCallback(function(deviceId) {
            console.log('设备状态更新，自动刷新设备列表，设备ID:', deviceId);
            var grid = me.getTestgrid();
            if (grid) {
                var store = grid.getStore();
                if (store) {
                    store.load();
                }
            }
        });
    },
    ondevcxbuttonclick: function (){
        var searchxp = this.getDevicequeryxptextfield() ? this.getDevicequeryxptextfield().getValue() : '';
        var searchlx = this.getDevicequerylxtextfield() ? this.getDevicequerylxtextfield().getValue() : '';
        var searchxh = this.getDevicequeryxhtextfield() ? this.getDevicequeryxhtextfield().getValue() : '';
        var searchcs = this.getDevicequerycstextfield() ? this.getDevicequerycstextfield().getValue() : '';
        
        console.log('查询条件 - 芯片:', searchxp, '类型:', searchlx, '型号:', searchxh, '厂商:', searchcs);
        
        var store = this.getTestgrid().getStore();
        var proxy = store.getProxy();
        
        proxy.extraParams = {};
        if (searchxp) {
            proxy.extraParams.devicexp = searchxp;
        }
        if (searchlx) {
            proxy.extraParams.devicetype = searchlx;
        }
        if (searchxh) {
            proxy.extraParams.devicexh = searchxh;
        }
        if (searchcs) {
            proxy.extraParams.devicecs = searchcs;
        }
        
        store.loadPage(1);
    },

    onDblClick: function(grid,record){
        var devicexzwindow = Ext.widget({
            xtype: 'devicexzwindow',
            isEdit: true,
            title: '修改设备'
        });
        var devicexh = record.get('devicexh');
        var devicesn = record.get('devicesn');
        var deviceno = record.get('deviceno');
        var devicescdata = record.get('devicescdata');
        var deviceajdata = record.get('deviceajdata');
        var deviceghdata = record.get('deviceghdata');
        var deviceyh = record.get('deviceyh') ? record.get('deviceyh').sysusername : '';
        var devicestate = record.get('devicestate');
        var deviceid = record.get('id');
        
        devicexzwindow.down('textfield[name=devicexh]').setValue(devicexh);
        devicexzwindow.down('textfield[name=devicesn]').setValue(devicesn);
        devicexzwindow.down('textfield[name=deviceno]').setValue(deviceno);
        devicexzwindow.down('datefield[name=devicescdata]').setValue(devicescdata ? new Date(devicescdata) : null);
        devicexzwindow.down('datefield[name=deviceajdata]').setValue(deviceajdata ? new Date(deviceajdata) : null);
        devicexzwindow.down('datefield[name=deviceghdata]').setValue(deviceghdata ? new Date(deviceghdata) : null);
        var deviceyhId = record.get('deviceyh') ? record.get('deviceyh').id : null;
        devicexzwindow.down('combo[name=deviceyh.id]').setValue(deviceyhId);
        devicexzwindow.down('combo[name=devicestate.id]').setValue(devicestate ? devicestate.id : null);
        devicexzwindow.down('textfield[name=deviceid]').setValue(deviceid);
        
        var devCpu = record.get('devCpu');
        var devType = record.get('devType');
        var devManufacturer = record.get('devManufacturer');
        
        var cpuCombo = devicexzwindow.down('combo[name=devcpu_id]');
        var typeCombo = devicexzwindow.down('combo[name=devtype_id]');
        var manufacturerCombo = devicexzwindow.down('combo[name=devmanufacturer_id]');
        
        var cpuStore = cpuCombo.getStore();
        var typeStore = typeCombo.getStore();
        var manufacturerStore = manufacturerCombo.getStore();
        
        var setComboValues = function() {
            cpuCombo.setValue(devCpu ? devCpu.id : null);
            typeCombo.setValue(devType ? devType.id : null);
            manufacturerCombo.setValue(devManufacturer ? devManufacturer.id : null);
        };
        
        var pendingLoads = 3;
        var onStoreLoad = function() {
            pendingLoads--;
            if (pendingLoads === 0) {
                setComboValues();
            }
        };
        
        if (cpuStore.getCount() > 0) {
            pendingLoads--;
        } else {
            cpuStore.on('load', onStoreLoad, null, { single: true });
        }
        
        if (typeStore.getCount() > 0) {
            pendingLoads--;
        } else {
            typeStore.on('load', onStoreLoad, null, { single: true });
        }
        
        if (manufacturerStore.getCount() > 0) {
            pendingLoads--;
        } else {
            manufacturerStore.on('load', onStoreLoad, null, { single: true });
        }
        
        if (pendingLoads === 0) {
            setComboValues();
        }
        
        devicexzwindow.show();
    },

    onxzbuttonclick:function(){
        var devicexzwindow = Ext.widget({
            xtype: 'devicexzwindow'
        });
        var grid = this.getTestgrid;
        var store = grid.getStore;
        devicexzwindow.show();
    },

    onscbuttonclick:function (){
        console.log('sc successful');

        var smo = this.getTestgrid();
        var store = smo.getStore();
        var sm = this.getTestgrid().getSelectionModel();
        var sr = sm.getSelection();
        var ysstore = Ext.data.StoreMgr.lookup('deviceliststore');
        var ida = sr[0].get('id');
        var scinfo = String(ida);
        console.log(ida);
        if (sr.length>0){
            Ext.MessageBox.confirm(
                '提示',
                '您确定要删除选中记录吗？',
                function(button){
                    if(button=='yes'){
                        Ext.Ajax.request({
                                url: 'deviceaction/deldevices/'+ida,
                                method: 'DELETE',
                                success:function(response,opts){
                                    var obj = Ext.decode(response.responseText);
                                    if(obj.success){
                                        Ext.Msg.alert('成功',obj.message);
                                        ysstore.reload();
                                    } else {
                                        Ext.Msg.alert('失败',obj.message);
                                    }
                                },
                                failure:function(response,opts){
                                    Ext.Msg.alert('错误','删除设备失败，请稍后重试');
                                }
                            })
                    }
                }
            )
        }


    },
    onupdatebuttonclick:function (){
        console.log('onupdatebuttonclick');
        var grid = this.getTestgrid();
        var selection = grid.getSelectionModel().getSelection();
        
        if (selection.length === 0) {
            Ext.Msg.alert('提示', '请先选择要修改的设备');
            return;
        }
        
        var record = selection[0];
        
        var devicexzwindow = Ext.widget({
            xtype: 'devicexzwindow',
            title: '修改设备',
            isEdit: true
        });
        
        devicexzwindow.down('textfield[name=deviceid]').setValue(record.get('id'));
        devicexzwindow.down('textfield[name=devicexh]').setValue(record.get('devicexh'));
        devicexzwindow.down('textfield[name=devicesn]').setValue(record.get('devicesn'));
        devicexzwindow.down('textfield[name=deviceno]').setValue(record.get('deviceno'));
        devicexzwindow.down('datefield[name=devicescdata]').setValue(record.get('devicescdata') ? new Date(record.get('devicescdata')) : null);
        devicexzwindow.down('datefield[name=deviceajdata]').setValue(record.get('deviceajdata') ? new Date(record.get('deviceajdata')) : null);
        devicexzwindow.down('datefield[name=deviceghdata]').setValue(record.get('deviceghdata') ? new Date(record.get('deviceghdata')) : null);
        var yhRecord = record.get('deviceyh');
        devicexzwindow.down('combo[name=deviceyh.id]').setValue(yhRecord ? yhRecord.id : null);
        var devicestate = record.get('devicestate');
        devicexzwindow.down('combo[name=devicestate.id]').setValue(devicestate ? devicestate.id : null);
        
        var devCpu = record.get('devCpu');
        var devType = record.get('devType');
        var devManufacturer = record.get('devManufacturer');
        
        var cpuCombo = devicexzwindow.down('combo[name=devcpu_id]');
        var typeCombo = devicexzwindow.down('combo[name=devtype_id]');
        var manufacturerCombo = devicexzwindow.down('combo[name=devmanufacturer_id]');
        
        var cpuStore = cpuCombo.getStore();
        var typeStore = typeCombo.getStore();
        var manufacturerStore = manufacturerCombo.getStore();
        
        var setComboValues = function() {
            cpuCombo.setValue(devCpu ? devCpu.id : null);
            typeCombo.setValue(devType ? devType.id : null);
            manufacturerCombo.setValue(devManufacturer ? devManufacturer.id : null);
        };
        
        var pendingLoads = 3;
        var onStoreLoad = function() {
            pendingLoads--;
            if (pendingLoads === 0) {
                setComboValues();
            }
        };
        
        if (cpuStore.getCount() > 0) {
            pendingLoads--;
        } else {
            cpuStore.on('load', onStoreLoad, null, { single: true });
        }
        
        if (typeStore.getCount() > 0) {
            pendingLoads--;
        } else {
            typeStore.on('load', onStoreLoad, null, { single: true });
        }
        
        if (manufacturerStore.getCount() > 0) {
            pendingLoads--;
        } else {
            manufacturerStore.on('load', onStoreLoad, null, { single: true });
        }
        
        if (pendingLoads === 0) {
            setComboValues();
        }
        
        devicexzwindow.show();
    },
    ontestbuttonclick:function (){
        console.log('test successful');
        console.log('name:'+SYS_USER.sysusername+'    password:'+SYS_USER.sysuserpassword)

    },


    ondevicegridcellclick:function (view, cell, colIdx, record, row, rowIdx, e){
        console.log('ondevicegridcellclick');
        console.log('cellindex:'+colIdx); //列号
        console.log('recid:'+record.get('id'));
        console.log('rowIndex:'+rowIdx);//行号
        
        var target = e.getTarget('.check-device-link');
        if (target) {
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            Ext.Msg.confirm('确认安检', '确定要对该设备进行安检吗？', function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'deviceaction/checkdevice/' + deviceId,
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('结果显示', obj.message);
                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('提示', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('安检失败', '设备安检失败');
                        },
                        scope: this
                    });
                }
            }, this);
            return;
        }
        
        target = e.getTarget('.shelve-device-link');
        if (target) {
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            
            var actionWindow = Ext.create('Ext.window.Window', {
                title: '设备操作',
                width: 300,
                height: 150,
                layout: 'hbox',
                align: 'center',
                items: [{
                    xtype: 'button',
                    text: '归还',
                    width: 100,
                    margin: '10 10 10 40',
                    handler: function() {
                        Ext.Ajax.request({
                            url: 'deviceaction/returndevice/' + deviceId,
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            success: function(response, opts) {
                                var obj = Ext.decode(response.responseText);
                                if (obj.success) {
                                    Ext.Msg.alert('结果显示', obj.message);
                                    var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                    store.reload();
                                } else {
                                    Ext.Msg.alert('提示', obj.message);
                                }
                            },
                            failure: function(response, opts) {
                                Ext.Msg.alert('操作失败', '设备归还失败');
                            }
                        });
                        actionWindow.close();
                    }
                }, {
                    xtype: 'button',
                    text: '维修',
                    width: 100,
                    margin: '10 0 10 10',
                    handler: function() {
                        actionWindow.close();
                        
                        var repairWindow = Ext.create('Ext.window.Window', {
                            title: '设备维修',
                            width: 400,
                            height: 200,
                            layout: 'vbox',
                            align: 'center',
                            items: [{
                                xtype: 'textarea',
                                fieldLabel: '维修原因',
                                name: 'repairReason',
                                width: 350,
                                height: 80,
                                labelWidth: 60,
                                margin: '10 0 10 0',
                                emptyText: '请输入维修原因...'
                            }, {
                                xtype: 'panel',
                                layout: 'hbox',
                                margin: '0 0 10 50',
                                items: [{
                                    xtype: 'button',
                                    text: '确定',
                                    width: 100,
                                    margin: '0 10 0 0',
                                    handler: function() {
                                        var repairReason = repairWindow.down('textarea[name=repairReason]').getValue();
                                        if (!repairReason || repairReason.trim() === '') {
                                            Ext.Msg.alert('提示', '请输入维修原因');
                                            return;
                                        }
                                        
                                        Ext.Ajax.request({
                                            url: 'devicerepair/create',
                                            method: 'POST',
                                            jsonData: {
                                                deviceId: deviceId,
                                                repairReason: repairReason
                                            },
                                            headers: {
                                                'Content-Type': 'application/json'
                                            },
                                            success: function(response, opts) {
                                                var obj = Ext.decode(response.responseText);
                                                if (obj.success) {
                                                    Ext.Ajax.request({
                                                        url: 'deviceaction/repairdevice/' + deviceId,
                                                        method: 'PUT',
                                                        headers: {
                                                            'Content-Type': 'application/json'
                                                        },
                                                        success: function(response2, opts2) {
                                                            var obj2 = Ext.decode(response2.responseText);
                                                            if (obj2.success) {
                                                                Ext.Msg.alert('结果显示', '维修记录创建成功，设备状态已更新');
                                                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                                                store.reload();
                                                            } else {
                                                                Ext.Msg.alert('提示', obj2.message);
                                                            }
                                                        },
                                                        failure: function(response2, opts2) {
                                                            Ext.Msg.alert('操作失败', '设备维修状态更新失败');
                                                        }
                                                    });
                                                } else {
                                                    Ext.Msg.alert('提示', obj.message);
                                                }
                                            },
                                            failure: function(response, opts) {
                                                Ext.Msg.alert('操作失败', '维修记录创建失败');
                                            }
                                        });
                                        repairWindow.close();
                                    }
                                }, {
                                    xtype: 'button',
                                    text: '取消',
                                    width: 100,
                                    handler: function() {
                                        repairWindow.close();
                                    }
                                }]
                            }]
                        });
                        repairWindow.show();
                    }
                }]
            });
            actionWindow.show();
            return;
        }
        
        target = e.getTarget('.unshelve-device-link');
        if (target) {
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            
            var unshelveWindow = Ext.create('Ext.window.Window', {
                title: '设备上架',
                width: 400,
                height: 200,
                layout: 'vbox',
                align: 'center',
                items: [{
                    xtype: 'textarea',
                    fieldLabel: '维修记录',
                    name: 'repairRecord',
                    width: 350,
                    height: 80,
                    labelWidth: 60,
                    margin: '10 0 10 0',
                    emptyText: '请输入维修记录备注...'
                }, {
                    xtype: 'panel',
                    layout: 'hbox',
                    margin: '0 0 10 50',
                    items: [{
                        xtype: 'button',
                        text: '确定',
                        width: 100,
                        margin: '0 10 0 0',
                        handler: function() {
                            var repairRecord = unshelveWindow.down('textarea[name=repairRecord]').getValue();
                            
                            Ext.Ajax.request({
                                url: 'deviceaction/unshelvedevice/' + deviceId,
                                method: 'PUT',
                                jsonData: {
                                    repairRecord: repairRecord
                                },
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                success: function(response, opts) {
                                    var obj = Ext.decode(response.responseText);
                                    if (obj.success) {
                                        Ext.Msg.alert('结果显示', obj.message);
                                        var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                        store.reload();
                                    } else {
                                        Ext.Msg.alert('提示', obj.message);
                                    }
                                },
                                failure: function(response, opts) {
                                    Ext.Msg.alert('上架失败', '设备上架失败');
                                },
                                scope: this
                            });
                            unshelveWindow.close();
                        }
                    }, {
                        xtype: 'button',
                        text: '取消',
                        width: 100,
                        handler: function() {
                            unshelveWindow.close();
                        }
                    }]
                }]
            });
            unshelveWindow.show();
            return;
        }
        
        target = e.getTarget('.view-repair-link');
        if (target) {
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            
            Ext.Ajax.request({
                url: 'devicerepair/bydevice/' + deviceId,
                method: 'GET',
                success: function(response, opts) {
                    var repairs = Ext.decode(response.responseText);
                    
                    var grid = Ext.create('Ext.grid.Panel', {
                        border: false,
                        columns: [{
                            text: '序号',
                            width: 60,
                            align: 'center',
                            renderer: function(value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        }, {
                            text: '申请人',
                            dataIndex: 'reporterId',
                            width: 100
                        }, {
                            text: '申请时间',
                            dataIndex: 'repairTime',
                            width: 180
                        }, {
                            text: '维修原因',
                            dataIndex: 'repairReason',
                            flex: 1
                        }, {
                            text: '批准人',
                            dataIndex: 'repairPersonId',
                            width: 100
                        }, {
                            text: '批准时间',
                            dataIndex: 'adminStartRepairTime',
                            width: 180
                        }, {
                            text: '完成维修时间',
                            dataIndex: 'endRepairTime',
                            width: 180
                        }, {
                            text: '维修详情',
                            dataIndex: 'repairRecord',
                            flex: 1
                        }],
                        store: Ext.create('Ext.data.Store', {
                            fields: ['reporterId', 'repairTime', 'repairReason', 'repairPersonId', 'adminStartRepairTime', 'endRepairTime', 'repairRecord'],
                            data: repairs.map(function(r) {
                                return {
                                    reporterId: r.reporterId || '-',
                                    repairTime: r.repairTime ? r.repairTime.replace('T', ' ') : '-',
                                    repairReason: r.repairReason || '-',
                                    repairPersonId: r.repairPersonId || '-',
                                    adminStartRepairTime: r.adminStartRepairTime ? r.adminStartRepairTime.replace('T', ' ') : '-',
                                    endRepairTime: r.endRepairTime ? r.endRepairTime.replace('T', ' ') : '-',
                                    repairRecord: r.repairRecord || '-'
                                };
                            })
                        }),
                        height: 300
                    });
                    
                    var window = Ext.create('Ext.window.Window', {
                        title: '设备维修记录',
                        width: 1100,
                        height: 400,
                        layout: 'fit',
                        items: [grid],
                        buttons: [{
                            text: '关闭',
                            handler: function() {
                                window.close();
                            }
                        }]
                    });
                    window.show();
                },
                failure: function(response, opts) {
                    Ext.Msg.alert('错误', '获取维修记录失败');
                }
            });
            return;
        }
        
        target = e.getTarget('.borrow-device-link');
        if (target) {
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            Ext.Msg.confirm('确认借用', '确定要借用该设备吗？', function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'devicerecord/borrowDevice',
                        method: 'POST',
                        jsonData: {
                            deviceId: parseInt(deviceId),
                            userId: SYS_USER.id
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('结果显示', obj.message);
                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('提示', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('借用失败', '设备借用失败');
                        },
                        scope: this
                    });
                }
            }, this);
            return;
        }
        
        if (!SYS_USER) {
            Ext.Msg.alert('提示', '请先登录');
            return;
        }
        
        var role = SYS_USER.sysuserrole;
        var sm = this.getTestgrid().getSelectionModel();
        var sr = sm.getSelection();
        var ida = sr[0].get('id');
        var now = new Date();
        var borrowTime = now.toISOString();
        // 管理员角色：跳过旧的借阅逻辑，只处理审核相关操作
        if(role !== 2) {
            // 非操作员角色，跳过旧的借阅逻辑
        } else {
            console.log('allowed');//角色为2，是用户，有借阅权限，点此按钮对图书进行借阅

            if(colIdx===12){
                console.log('开始借阅。。。');//列号为12，才能出发借阅操作，点其他列无反应
                //检查是否点击的是借用链接
                var borrowTarget = e.getTarget('.borrow-device-link');
                if (borrowTarget) {
                    //接下来写借阅代码
                    Ext.Ajax.request({
                        url:'devicerecord/createDeviceRecord',
                        method:'post',
                        jsonData: {
                            deviceid:ida,
                            borrorDate:borrowTime,
                            returnDate:null,
                            detail:null,
                        },//跟rec生成json字符串一样
                        // jsonData:rec,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        sucess:function(response,opts){
                            var obj = Ext.decode(response.responseText);
                            if(obj.sucess){
                                Ext.Msg.alert('结果显示',obj.message);
                            }
                        },
                        failure:function(response,opts){
                            var obj = Ext.decode(response.responseText);
                            Ext.Msg.alert('保存错误','错误原因：'+obj.message+"-------"+obj.msg);
                        }
                    })
                }
            }
        }
        
        // 管理员审核借用申请 - 通过
        target = e.getTarget('.approve-borrow-link');
        if (target) {
            console.log('approve-borrow-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            Ext.Msg.confirm('确认通过', '确定要通过该设备的借用申请吗？', function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'devicerecord/approveBorrow',
                        method: 'POST',
                        jsonData: {
                            deviceId: parseInt(deviceId),
                            adminId: SYS_USER.id
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('结果显示', obj.message);
                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('提示', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('操作失败', '通过借用申请失败');
                        },
                        scope: this
                    });
                }
            }, this);
            return;
        }
        
        // 管理员审核借用申请 - 拒绝
        target = e.getTarget('.reject-borrow-link');
        if (target) {
            console.log('reject-borrow-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            Ext.Msg.confirm('确认拒绝', '确定要拒绝该设备的借用申请吗？', function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'devicerecord/rejectBorrow',
                        method: 'POST',
                        jsonData: {
                            deviceId: parseInt(deviceId),
                            adminId: SYS_USER.id
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('结果显示', obj.message);
                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('提示', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('操作失败', '拒绝借用申请失败');
                        },
                        scope: this
                    });
                }
            }, this);
            return;
        }
        
        // 管理员确认维修
        target = e.getTarget('.confirm-repair-link');
        if (target) {
            console.log('confirm-repair-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            Ext.Msg.confirm('确认维修', '确定要确认维修该设备吗？', function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'devicerepair/confirm/' + deviceId,
                        method: 'POST',
                        jsonData: {
                            adminId: SYS_USER.id
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('结果显示', obj.message);
                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('提示', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('操作失败', '确认维修失败');
                        },
                        scope: this
                    });
                }
            }, this);
            return;
        }
        
        // 操作员申请报修
        target = e.getTarget('.repair-device-link');
        if (target) {
            console.log('repair-device-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            
            // 创建一个弹窗让操作员输入维修原因
            var repairWindow = Ext.create('Ext.window.Window', {
                title: '申请报修',
                width: 400,
                modal: true,
                items: [{
                    xtype: 'form',
                    padding: 10,
                    items: [{
                        xtype: 'textarea',
                        fieldLabel: '维修原因',
                        name: 'repairReason',
                        allowBlank: false,
                        labelWidth: 80,
                        width: '100%',
                        height: 100,
                        emptyText: '请输入设备故障描述或维修原因...'
                    }]
                }],
                buttons: [{
                    text: '确定',
                    handler: function() {
                        var form = repairWindow.down('form');
                        var repairReason = form.getForm().findField('repairReason').getValue();
                        if (!repairReason || repairReason.trim() === '') {
                            Ext.Msg.alert('提示', '请输入维修原因');
                            return;
                        }
                        
                        Ext.Ajax.request({
                            url: 'devicerepair/create',
                            method: 'POST',
                            jsonData: {
                                deviceId: parseInt(deviceId),
                                reporterId: SYS_USER.id,
                                repairReason: repairReason.trim()
                            },
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            success: function(response, opts) {
                                var obj = Ext.decode(response.responseText);
                                if (obj.success) {
                                    Ext.Msg.alert('结果显示', obj.message);
                                    var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                    store.reload();
                                } else {
                                    Ext.Msg.alert('提示', obj.message);
                                }
                            },
                            failure: function(response, opts) {
                                Ext.Msg.alert('操作失败', '申请报修失败');
                            },
                            scope: this
                        });
                        
                        repairWindow.close();
                    }
                }, {
                    text: '取消',
                    handler: function() {
                        repairWindow.close();
                    }
                }]
            });
            
            repairWindow.show();
            return;
        }
        
        // 操作员退回设备
        target = e.getTarget('.return-device-link');
        if (target) {
            console.log('return-device-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            Ext.Msg.confirm('确认退回', '确定要退回该设备吗？', function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'devicerecord/returnDevice',
                        method: 'POST',
                        jsonData: {
                            deviceId: parseInt(deviceId),
                            userId: SYS_USER.id
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('结果显示', obj.message);
                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('提示', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('操作失败', '退回设备失败');
                        },
                        scope: this
                    });
                }
            }, this);
            return;
        }
        
        // 操作员转借设备
        target = e.getTarget('.transfer-device-link');
        if (target) {
            console.log('transfer-device-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            
            // 加载操作员列表
            Ext.Ajax.request({
                url: 'sysuseraction/getOperators',
                method: 'GET',
                success: function(response) {
                    var operators = Ext.decode(response.responseText);
                    
                    // 过滤掉当前用户自己
                    var currentUserId = SYS_USER ? SYS_USER.id : null;
                    if (currentUserId) {
                        operators = operators.filter(function(op) {
                            return op.id !== currentUserId;
                        });
                    }
                    
                    // 创建转借窗口
                    var transferWindow = Ext.create('Ext.window.Window', {
                        title: '转借设备',
                        width: 400,
                        height: 200,
                        layout: 'vbox',
                        align: 'center',
                        items: [{
                            xtype: 'combobox',
                            fieldLabel: '选择转借对象',
                            name: 'targetUser',
                            width: 350,
                            labelWidth: 80,
                            margin: '10 0 10 0',
                            store: Ext.create('Ext.data.Store', {
                                fields: ['id', 'sysusername'],
                                data: operators
                            }),
                            displayField: 'sysusername',
                            valueField: 'id',
                            editable: false,
                            allowBlank: false,
                            emptyText: '请选择转借对象'
                        }, {
                            xtype: 'panel',
                            layout: 'hbox',
                            margin: '0 0 10 50',
                            items: [{
                                xtype: 'button',
                                text: '确定',
                                width: 100,
                                margin: '0 10 0 0',
                                handler: function() {
                                    var targetUserId = transferWindow.down('combobox[name=targetUser]').getValue();
                                    if (!targetUserId) {
                                        Ext.Msg.alert('提示', '请选择转借对象');
                                        return;
                                    }
                                    
                                    Ext.Ajax.request({
                                        url: 'transfer/apply',
                                        method: 'POST',
                                        jsonData: {
                                            deviceId: parseInt(deviceId),
                                            fromUserId: SYS_USER.id,
                                            toUserId: targetUserId
                                        },
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        success: function(response, opts) {
                                            var obj = Ext.decode(response.responseText);
                                            if (obj.success) {
                                                Ext.Msg.alert('结果显示', obj.message);
                                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                                store.reload();
                                            } else {
                                                Ext.Msg.alert('提示', obj.message);
                                            }
                                        },
                                        failure: function(response, opts) {
                                            Ext.Msg.alert('操作失败', '转借失败');
                                        },
                                        scope: this
                                    });
                                    transferWindow.close();
                                }
                            }, {
                                xtype: 'button',
                                text: '取消',
                                width: 100,
                                handler: function() {
                                    transferWindow.close();
                                }
                            }]
                        }]
                    });
                    
                    transferWindow.show();
                },
                failure: function() {
                    Ext.Msg.alert('错误', '加载操作员列表失败');
                }
            });
            
            return;
        }
        
        // 转借人同意转借
        target = e.getTarget('.accept-transfer-link');
        if (target) {
            console.log('accept-transfer-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            
            // 先获取转借记录ID
            Ext.Ajax.request({
                url: 'transfer/pendingForUser/' + SYS_USER.id,
                method: 'GET',
                success: function(response) {
                    var records = Ext.decode(response.responseText);
                    var transferRecord = records.find(function(r) {
                        return r.device.id === parseInt(deviceId);
                    });
                    
                    if (!transferRecord) {
                        Ext.Msg.alert('错误', '未找到对应的转借记录');
                        return;
                    }
                    
                    Ext.Msg.confirm('确认同意转借', '确定要同意转借该设备吗？', function(btn) {
                        if (btn === 'yes') {
                            Ext.Ajax.request({
                                url: 'transfer/userApprove',
                                method: 'POST',
                                jsonData: {
                                    transferId: transferRecord.id,
                                    userId: SYS_USER.id
                                },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('结果显示', obj.message);
                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('提示', obj.message);
                            }
                        },
                                failure: function(response, opts) {
                                    Ext.Msg.alert('操作失败', '同意转借失败');
                                },
                                scope: this
                            });
                        }
                    }, this);
                }
            });
            
            return;
        }
        
        // 被转借人拒绝转借
        target = e.getTarget('.reject-transfer-by-user-link');
        if (target) {
            console.log('reject-transfer-by-user-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            
            Ext.Ajax.request({
                url: 'transfer/pendingForUser/' + SYS_USER.id,
                method: 'GET',
                success: function(response) {
                    var records = Ext.decode(response.responseText);
                    var transferRecord = records.find(function(r) {
                        return r.device.id === parseInt(deviceId);
                    });
                    
                    if (!transferRecord) {
                        Ext.Msg.alert('错误', '未找到对应的转借记录');
                        return;
                    }
                    
                    var rejectWindow = Ext.create('Ext.window.Window', {
                        title: '拒绝转借',
                        width: 400,
                        height: 200,
                        layout: 'fit',
                        modal: true,
                        items: [{
                            xtype: 'textarea',
                            fieldLabel: '拒绝原因',
                            labelAlign: 'top',
                            name: 'reason',
                            anchor: '100%',
                            height: 80,
                            emptyText: '请输入拒绝原因'
                        }],
                        buttons: [{
                            text: '取消',
                            handler: function() {
                                rejectWindow.close();
                            }
                        }, {
                            text: '确定',
                            handler: function() {
                                var reason = rejectWindow.down('textarea').getValue();
                                if (!reason || reason.trim() === '') {
                                    Ext.Msg.alert('提示', '请输入拒绝原因');
                                    return;
                                }
                                Ext.Ajax.request({
                                    url: 'transfer/reject',
                                    method: 'POST',
                                    jsonData: {
                                        transferId: transferRecord.id,
                                        userId: SYS_USER.id,
                                        reason: reason
                                    },
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    success: function(response, opts) {
                                        var obj = Ext.decode(response.responseText);
                                        if (obj.success) {
                                            Ext.Msg.alert('结果显示', obj.message);
                                            var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                            store.reload();
                                        } else {
                                            Ext.Msg.alert('提示', obj.message);
                                        }
                                    },
                                    failure: function(response, opts) {
                                        Ext.Msg.alert('操作失败', '拒绝转借失败');
                                    }
                                });
                                rejectWindow.close();
                            }
                        }]
                    });
                    rejectWindow.show();
                }
            });
            
            return;
        }
        
        // 管理员批准转借
        target = e.getTarget('.approve-transfer-link');
        if (target) {
            console.log('approve-transfer-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            
            // 先获取转借记录ID
            Ext.Ajax.request({
                url: 'transfer/pendingForAdmin',
                method: 'GET',
                success: function(response) {
                    var records = Ext.decode(response.responseText);
                    var transferRecord = records.find(function(r) {
                        return r.device.id === parseInt(deviceId);
                    });
                    
                    if (!transferRecord) {
                        Ext.Msg.alert('错误', '未找到对应的转借记录');
                        return;
                    }
                    
                    Ext.Msg.confirm('确认批准转借', '确定要批准该设备的转借申请吗？', function(btn) {
                        if (btn === 'yes') {
                            Ext.Ajax.request({
                                url: 'transfer/adminApprove',
                                method: 'POST',
                                jsonData: {
                                    transferId: transferRecord.id,
                                    adminId: SYS_USER.id
                                },
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                success: function(response, opts) {
                                    var obj = Ext.decode(response.responseText);
                                    if (obj.success) {
                                        Ext.Msg.alert('结果显示', obj.message);
                                        var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                        store.reload();
                                    } else {
                                        Ext.Msg.alert('提示', obj.message);
                                    }
                                },
                                failure: function(response, opts) {
                                    Ext.Msg.alert('操作失败', '批准转借失败');
                                },
                                scope: this
                            });
                        }
                    }, this);
                }
            });
            
            return;
        }
        
        // 管理员拒绝转借
        target = e.getTarget('.reject-transfer-link');
        if (target) {
            console.log('reject-transfer-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            
            Ext.Ajax.request({
                url: 'transfer/pendingForAdmin',
                method: 'GET',
                success: function(response) {
                    var records = Ext.decode(response.responseText);
                    var transferRecord = records.find(function(r) {
                        return r.device.id === parseInt(deviceId);
                    });
                    
                    if (!transferRecord) {
                        Ext.Msg.alert('错误', '未找到对应的转借记录');
                        return;
                    }
                    
                    var rejectWindow = Ext.create('Ext.window.Window', {
                        title: '拒绝转借',
                        width: 400,
                        height: 200,
                        layout: 'fit',
                        modal: true,
                        items: [{
                            xtype: 'textarea',
                            fieldLabel: '拒绝原因',
                            labelAlign: 'top',
                            name: 'reason',
                            anchor: '100%',
                            height: 80,
                            emptyText: '请输入拒绝原因'
                        }],
                        buttons: [{
                            text: '取消',
                            handler: function() {
                                rejectWindow.close();
                            }
                        }, {
                            text: '确定',
                            handler: function() {
                                var reason = rejectWindow.down('textarea').getValue();
                                if (!reason || reason.trim() === '') {
                                    Ext.Msg.alert('提示', '请输入拒绝原因');
                                    return;
                                }
                                Ext.Ajax.request({
                                    url: 'transfer/reject',
                                    method: 'POST',
                                    jsonData: {
                                        transferId: transferRecord.id,
                                        userId: SYS_USER.id,
                                        reason: reason
                                    },
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    success: function(response, opts) {
                                        var obj = Ext.decode(response.responseText);
                                        if (obj.success) {
                                            Ext.Msg.alert('结果显示', obj.message);
                                            var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                            store.reload();
                                        } else {
                                            Ext.Msg.alert('提示', obj.message);
                                        }
                                    },
                                    failure: function(response, opts) {
                                        Ext.Msg.alert('操作失败', '拒绝转借失败');
                                    }
                                });
                                rejectWindow.close();
                            }
                        }]
                    });
                    rejectWindow.show();
                }
            });
            
            return;
        }
        
        // 管理员批准设备归还
        target = e.getTarget('.approve-return-link');
        if (target) {
            console.log('approve-return-link clicked');
            e.stopEvent();
            var deviceId = target.getAttribute('data-id');
            console.log('deviceId:', deviceId);
            Ext.Msg.confirm('确认批准', '确定要批准该设备的归还申请吗？', function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'devicerecord/approveReturn',
                        method: 'POST',
                        jsonData: {
                            deviceId: parseInt(deviceId),
                            adminId: SYS_USER.id
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('结果显示', obj.message);
                                var store = Ext.data.StoreMgr.lookup('deviceliststore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('提示', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('操作失败', '批准归还失败');
                        },
                        scope: this
                    });
                }
            }, this);
            return;
        }
    },

    onAddWorkRecordClick: function() {
        var addWindow = Ext.create('Ext.window.Window', {
            title: '新增工作记录',
            width: 400,
            modal: true,
            layout: 'vbox',
            align: 'center',
            items: [{
                xtype: 'textfield',
                fieldLabel: '工作时间',
                name: 'workTime',
                width: 350,
                labelWidth: 80,
                margin: '10 0 10 0',
                emptyText: '请输入工作时间，如：2026-07-27 09:00:00',
                allowBlank: false
            }, {
                xtype: 'textfield',
                fieldLabel: '工作地点',
                name: 'workLocation',
                width: 350,
                labelWidth: 80,
                margin: '0 0 10 0',
                emptyText: '请输入工作地点',
                allowBlank: false
            }, {
                xtype: 'textfield',
                fieldLabel: '工作内容',
                name: 'workContent',
                width: 350,
                labelWidth: 80,
                margin: '0 0 10 0',
                emptyText: '请输入工作内容',
                allowBlank: false
            }],
            buttons: [{
                text: '取消',
                handler: function() {
                    addWindow.close();
                }
            }, {
                text: '确定',
                handler: function() {
                    var workTime = addWindow.down('textfield[name=workTime]').getValue();
                    var workLocation = addWindow.down('textfield[name=workLocation]').getValue();
                    var workContent = addWindow.down('textfield[name=workContent]').getValue();

                    if (!workTime || workTime.trim() === '') {
                        Ext.Msg.alert('提示', '请输入工作时间');
                        return;
                    }
                    if (!workLocation || workLocation.trim() === '') {
                        Ext.Msg.alert('提示', '请输入工作地点');
                        return;
                    }
                    if (!workContent || workContent.trim() === '') {
                        Ext.Msg.alert('提示', '请输入工作内容');
                        return;
                    }

                    Ext.Ajax.request({
                        url: 'workrecord/createWorkRecord',
                        method: 'POST',
                        jsonData: {
                            workTime: workTime.trim(),
                            workLocation: workLocation.trim(),
                            workContent: workContent.trim(),
                            detail: ''
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('成功', obj.message);
                                var store = Ext.data.StoreMgr.lookup('workrecordstore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('失败', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('错误', '创建工作记录失败，请稍后重试');
                        }
                    });

                    addWindow.close();
                }
            }]
        });

        addWindow.show();
    },

    onWorkRecordSearchClick: function() {
        var toolbar = Ext.ComponentQuery.query('viewport > panel > centerpage > workrecord toolbar')[0];
        var keyword = toolbar.down('textfield[name=queryKeyword]').getValue();

        var store = Ext.data.StoreMgr.lookup('workrecordstore');
        var proxy = store.getProxy();
        proxy.extraParams = {};
        if (keyword && keyword.trim() !== '') {
            proxy.extraParams.keyword = keyword.trim();
        }
        store.loadPage(1);
    },

    onWorkRecordCellClick: function(view, cell, colIdx, record, row, rowIdx, e) {
        var target = e.getTarget('.approve-workrecord-link');
        if (target) {
            e.stopEvent();
            var recordId = target.getAttribute('data-id');
            
            Ext.Msg.confirm('确认审核', '确定要审核通过这条工作记录吗？', function(btn) {
                if (btn === 'yes') {
                    Ext.Ajax.request({
                        url: 'workrecord/approveWorkRecord/' + recordId,
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('成功', obj.message);
                                var store = Ext.data.StoreMgr.lookup('workrecordstore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('失败', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('错误', '审核工作记录失败，请稍后重试');
                        }
                    });
                }
            });
            return;
        }

        var editTarget = e.getTarget('.edit-workrecord-link');
        if (editTarget) {
            e.stopEvent();
            var recordId = editTarget.getAttribute('data-id');
            this.onEditWorkRecordClick(recordId, record);
            return;
        }

        var deleteTarget = e.getTarget('.delete-workrecord-link');
        if (deleteTarget) {
            e.stopEvent();
            var recordId = deleteTarget.getAttribute('data-id');
            this.onDeleteWorkRecordClick(recordId);
            return;
        }
    },

    onEditWorkRecordClick: function(recordId, record) {
        var workTime = record.get('workTime');
        var workLocation = record.get('workLocation');
        var workContent = record.get('workContent');

        var editWindow = Ext.create('Ext.window.Window', {
            title: '修改工作记录',
            width: 400,
            modal: true,
            layout: 'vbox',
            align: 'center',
            items: [{
                xtype: 'textfield',
                fieldLabel: '工作时间',
                name: 'workTime',
                width: 350,
                labelWidth: 80,
                margin: '10 0 10 0',
                value: workTime || '',
                allowBlank: false
            }, {
                xtype: 'textfield',
                fieldLabel: '工作地点',
                name: 'workLocation',
                width: 350,
                labelWidth: 80,
                margin: '0 0 10 0',
                value: workLocation || '',
                allowBlank: false
            }, {
                xtype: 'textfield',
                fieldLabel: '工作内容',
                name: 'workContent',
                width: 350,
                labelWidth: 80,
                margin: '0 0 10 0',
                value: workContent || '',
                allowBlank: false
            }],
            buttons: [{
                text: '取消',
                handler: function() {
                    editWindow.close();
                }
            }, {
                text: '确定',
                handler: function() {
                    var workTime = editWindow.down('textfield[name=workTime]').getValue();
                    var workLocation = editWindow.down('textfield[name=workLocation]').getValue();
                    var workContent = editWindow.down('textfield[name=workContent]').getValue();

                    if (!workTime || workTime.trim() === '') {
                        Ext.Msg.alert('提示', '请输入工作时间');
                        return;
                    }
                    if (!workLocation || workLocation.trim() === '') {
                        Ext.Msg.alert('提示', '请输入工作地点');
                        return;
                    }
                    if (!workContent || workContent.trim() === '') {
                        Ext.Msg.alert('提示', '请输入工作内容');
                        return;
                    }

                    Ext.Ajax.request({
                        url: 'workrecord/updateWorkRecord',
                        method: 'PUT',
                        jsonData: {
                            id: recordId,
                            workTime: workTime.trim(),
                            workLocation: workLocation.trim(),
                            workContent: workContent.trim()
                        },
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        success: function(response, opts) {
                            var obj = Ext.decode(response.responseText);
                            if (obj.success) {
                                Ext.Msg.alert('成功', obj.message);
                                var store = Ext.data.StoreMgr.lookup('workrecordstore');
                                store.reload();
                            } else {
                                Ext.Msg.alert('失败', obj.message);
                            }
                        },
                        failure: function(response, opts) {
                            Ext.Msg.alert('错误', '修改工作记录失败，请稍后重试');
                        }
                    });

                    editWindow.close();
                }
            }]
        });

        editWindow.show();
    },

    onExportWorkRecordsClick: function() {
        var url = 'workrecord/exportWorkRecords';
        window.location.href = url;
    },

    onDeleteWorkRecordClick: function(recordId) {
        var targetRecordId = recordId;
        
        if (!targetRecordId) {
            var grid = Ext.ComponentQuery.query('viewport > panel > centerpage > workrecord workrecordgrid')[0];
            if (!grid) return;

            var selection = grid.getSelectionModel().getSelection();
            if (selection.length === 0) {
                Ext.Msg.alert('提示', '请先选择要删除的记录');
                return;
            }

            var record = selection[0];
            targetRecordId = record.get('id');
        }

        Ext.Msg.confirm('确认删除', '确定要删除这条工作记录吗？', function(btn) {
            if (btn === 'yes') {
                Ext.Ajax.request({
                    url: 'workrecord/deleteWorkRecord/' + targetRecordId,
                    method: 'DELETE',
                    success: function(response, opts) {
                        var obj = Ext.decode(response.responseText);
                        if (obj.success) {
                            Ext.Msg.alert('成功', obj.message);
                            var store = Ext.data.StoreMgr.lookup('workrecordstore');
                            store.reload();
                        } else {
                            Ext.Msg.alert('失败', obj.message);
                        }
                    },
                    failure: function(response, opts) {
                        Ext.Msg.alert('错误', '删除工作记录失败，请稍后重试');
                    }
                });
            }
        });
    },

});