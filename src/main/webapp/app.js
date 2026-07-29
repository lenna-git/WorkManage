
var SYS_USER = null;
SYS_USER=  Ext.decode(sessionStorage.getItem('SYS_USER'));

// 会话超时配置（默认30分钟，将从后端获取）
var SESSION_TIMEOUT_SECONDS = 1800;
var lastActivityTime = Date.now();
var sessionTimeoutTimer = null;

// 初始化时从后端获取超时配置
function loadSessionTimeoutConfig(callback) {
    Ext.Ajax.request({
        url: 'sysconfig/sessionTimeout',
        method: 'GET',
        timeout: 5000,
        success: function(response) {
            try {
                var obj = Ext.decode(response.responseText);
                if (obj.success && obj.timeoutSeconds) {
                    SESSION_TIMEOUT_SECONDS = parseInt(obj.timeoutSeconds);
                    console.log('✓ 成功获取会话超时时间:', SESSION_TIMEOUT_SECONDS, '秒');
                } else {
                    console.log('✗ 配置格式不正确，使用默认值:', SESSION_TIMEOUT_SECONDS, '秒');
                }
            } catch (e) {
                console.error('✗ 解析配置失败:', e);
            }
            if (callback) callback();
        },
        failure: function(response, opts) {
            console.error('✗ 获取会话超时配置失败，使用默认值:', SESSION_TIMEOUT_SECONDS, '秒');
            console.error('  错误信息:', response.status, response.statusText);
            if (callback) callback();
        }
    });
}

// 重置活动时间
function resetActivityTimer() {
    lastActivityTime = Date.now();
    console.log('活动时间已重置:', new Date(lastActivityTime));
}

// 检查会话超时
function checkSessionTimeout() {
    var now = Date.now();
    var elapsedSeconds = Math.floor((now - lastActivityTime) / 1000);
    
    console.log('检查会话超时 - 已过去:', elapsedSeconds, '秒, 超时阈值:', SESSION_TIMEOUT_SECONDS, '秒');
    
    if (elapsedSeconds >= SESSION_TIMEOUT_SECONDS) {
        console.log('⚠️ 会话超时，自动登出');
        clearInterval(sessionTimeoutTimer);
        logout();
    }
}

// 登出函数
function logout() {
    Ext.Ajax.request({
        url: 'sysuser/logout',
        method: 'GET',
        success: function() {
            sessionStorage.removeItem('SYS_USER');
            window.location.href = 'login.html';
        },
        failure: function() {
            sessionStorage.removeItem('SYS_USER');
            window.location.href = 'login.html';
        }
    });
}

// 监听用户活动
document.addEventListener('mousedown', resetActivityTimer);
document.addEventListener('keydown', resetActivityTimer);
document.addEventListener('touchstart', resetActivityTimer);

// 先获取配置，然后再启动定时器
loadSessionTimeoutConfig(function() {
    // 配置获取完成后启动定时器（每5秒检查一次）
    sessionTimeoutTimer = setInterval(checkSessionTimeout, 5000);
    console.log('会话超时检测定时器已启动，超时时间:', SESSION_TIMEOUT_SECONDS, '秒');
});

// WebSocket 连接用于设备状态实时更新
var deviceStatusWebSocket = null;
var deviceStatusCallbacks = [];
var logOperationCallbacks = [];

function connectDeviceStatusWebSocket() {
    var protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    var wsUrl = protocol + '//' + window.location.host + '/ws/device-status';

    console.log('尝试连接WebSocket:', wsUrl);

    deviceStatusWebSocket = new WebSocket(wsUrl);

    deviceStatusWebSocket.onopen = function(event) {
        console.log('设备状态WebSocket连接已建立');
        console.log('当前连接状态:', deviceStatusWebSocket.readyState);
    };

    deviceStatusWebSocket.onmessage = function(event) {
        console.log('收到设备状态更新消息:', event.data);
        try {
            var message = JSON.parse(event.data);
            console.log('解析后的消息:', message);
            if (message.type === 'DEVICE_STATUS_UPDATE') {
                console.log('设备状态更新，设备ID:', message.deviceId);
                console.log('注册的回调函数数量:', deviceStatusCallbacks.length);
                deviceStatusCallbacks.forEach(function(callback) {
                    console.log('调用回调函数');
                    callback(message.deviceId);
                });
            } else if (message.type === 'LOG_OPERATION_UPDATE') {
                console.log('日志操作更新，日志ID:', message.logId, ', 操作类型:', message.operationType);
                console.log('注册的日志回调函数数量:', logOperationCallbacks.length);
                logOperationCallbacks.forEach(function(callback) {
                    console.log('调用日志回调函数');
                    callback(message.logId, message.operationType);
                });
            }
        } catch (e) {
            console.error('解析WebSocket消息失败:', e);
        }
    };

    deviceStatusWebSocket.onerror = function(error) {
        console.error('WebSocket错误:', error);
        console.error('错误详情:', error.message);
    };

    deviceStatusWebSocket.onclose = function(event) {
        console.log('设备状态WebSocket连接已关闭，代码:', event.code, '原因:', event.reason);
        console.log('正在尝试重新连接...');
        setTimeout(connectDeviceStatusWebSocket, 5000);
    };
}

// 注册设备状态更新回调
function registerDeviceStatusCallback(callback) {
    if (deviceStatusCallbacks.indexOf(callback) === -1) {
        deviceStatusCallbacks.push(callback);
    }
}

// 注销设备状态更新回调
function unregisterDeviceStatusCallback(callback) {
    var index = deviceStatusCallbacks.indexOf(callback);
    if (index !== -1) {
        deviceStatusCallbacks.splice(index, 1);
    }
}

// 注册日志操作更新回调
function registerLogOperationCallback(callback) {
    if (logOperationCallbacks.indexOf(callback) === -1) {
        logOperationCallbacks.push(callback);
    }
}

// 注销日志操作更新回调
function unregisterLogOperationCallback(callback) {
    var index = logOperationCallbacks.indexOf(callback);
    if (index !== -1) {
        logOperationCallbacks.splice(index, 1);
    }
}

Ext.application({
    name: 'AM',

    appFolder: 'app',
    autoCreateViewport:true,

    controllers: [
        'Users','LoginController','mainpageltbarController1',
        'Devices','DeviceRecordController',
        'DeviceTransferRecordController',
        'Devicewindow','UserwindowController',
        'ChangePasswordController'
    ],

    stores: [
        'DeviceTransferRecordStore',
        'devicerecordstore',
        'workrecordstore',
        'weeklyreportstore'
    ],

    models: [
        'DeviceTransferRecordModel',
        'devicerecord',
        'workrecord',
        'weeklyreport'
    ],

    launch: function() {
        console.log('App launched');
        // 启动WebSocket连接
        connectDeviceStatusWebSocket();
    }
});
