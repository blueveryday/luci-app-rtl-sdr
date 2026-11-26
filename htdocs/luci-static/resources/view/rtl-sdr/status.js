'use strict';
'require view';
'require fs';
'require ui';

return view.extend({
	load: function() {
		return Promise.all([
			fs.exec('/bin/ubus', [ 'call', 'service', 'list', '{"name":"rtl-sdr","verbose":true}' ]).catch(function() {
				return { code: 1, stdout: '' };
			}),
			fs.exec('/usr/bin/logread', [ '-e', 'rtl_tcp' ]).catch(function() {
				return { code: 1, stdout: '' };
			})
		]);
	},

	parseStatus: function(ubusRes) {
		if (ubusRes && ubusRes.code === 0 && ubusRes.stdout) {
			try {
				var parsed = JSON.parse(ubusRes.stdout);
				var svc = parsed && parsed['rtl-sdr'];
				var instances = svc && svc.instances ? Object.values(svc.instances) : [];
				var running = instances.filter(function(i) { return i && i.running === true; });
				if (running.length > 0) {
					var pids = running.map(function(i) { return i.pid; }).filter(Boolean);
					return _('运行中') + (pids.length ? ' (PID: ' + pids.join(', ') + ')' : '');
				}
				return _('未运行');
			} catch (e) {
				// ignore parse error
			}
		}
		return _('未运行或无法获取状态');
	},

	render: function(data) {
		var statusText = this.parseStatus(data[0]);
		var rawLogs = (data[1] && data[1].stdout) ? data[1].stdout.trim().split('\n') : [];
		var logsText = rawLogs.slice(-80).join('\n') || _('暂无日志');

		function run(action) {
			return fs.exec('/etc/init.d/rtl_tcp', [ action ]).then(function(res) {
				if (res.code !== 0) {
					ui.addNotification(null, E('p', _('操作失败：') + action + '\n' + (res.stderr || res.stdout || '')));
				} else {
					ui.addNotification(null, E('p', _('已执行：') + action));
				}
				window.setTimeout(function() { window.location.reload(); }, 700);
			}).catch(function(err) {
				ui.addNotification(null, E('p', _('执行命令失败：') + err));
			});
		}

		return E('div', { 'class': 'cbi-map' }, [
			E('h2', {}, _('RTL-SDR TCP 服务状态')),
			E('p', {}, _('直接调用官方 rtl_tcp 服务。建议仅在可信局域网或 VPN 内开放端口。')),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'cbi-button cbi-button-positive', 'click': function() { run('start'); } }, _('启动')),
				' ',
				E('button', { 'class': 'cbi-button cbi-button-action', 'click': function() { run('restart'); } }, _('重启')),
				' ',
				E('button', { 'class': 'cbi-button cbi-button-negative', 'click': function() { run('stop'); } }, _('停止')),
				' ',
				E('button', { 'class': 'cbi-button', 'click': function() { run('enable'); } }, _('启用自启')),
				' ',
				E('button', { 'class': 'cbi-button', 'click': function() { run('disable'); } }, _('禁用自启'))
			]),
			E('h3', {}, _('当前状态')),
			E('pre', { 'class': 'cbi-code' }, statusText),
			E('h3', {}, _('最近日志')),
			E('pre', { 'class': 'cbi-code', 'style': 'max-height: 28em; overflow:auto; white-space:pre-wrap' }, logsText)
		]);
	}
});