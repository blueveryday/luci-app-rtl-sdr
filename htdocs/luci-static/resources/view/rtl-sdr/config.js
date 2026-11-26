'use strict';
'require form';
'require fs';
'require ui';

return L.view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('rtl_tcp', _('RTL-SDR TCP 配置'),
			_('配置官方 rtl_tcp 服务参数。保存后将自动重启 rtl-sdr 服务。'));

		s = m.section(form.NamedSection, 'main', 'rtl_tcp', _('服务与网络参数'));
		s.addremove = false;

		o = s.option(form.Flag, 'disabled', _('禁用服务'));
		o.default = '0';
		o.rmempty = false;

		o = s.option(form.Flag, 'respawn', _('崩溃自动重启'));
		o.default = '1';
		o.rmempty = false;

		o = s.option(form.Value, 'address', _('监听 IPv4 地址'));
		o.datatype = 'ip4addr';
		o.default = '0.0.0.0';

		o = s.option(form.Value, 'port', _('监听端口'));
		o.datatype = 'port';
		o.default = '1234';

		o = s.option(form.Value, 'device_index', _('设备索引（留空默认）'));
		o.datatype = 'uinteger';

		s = m.section(form.NamedSection, 'main', 'rtl_tcp', _('射频与缓冲参数'));
		s.addremove = false;

		o = s.option(form.Value, 'samplerate', _('采样率（samples/s）'));
		o.datatype = 'uinteger';
		o.default = '1024000';

		o = s.option(form.Value, 'frequency', _('初始中心频率（Hz，留空默认）'));
		o.datatype = 'uinteger';

		o = s.option(form.Value, 'gain', _('初始增益（0.1 dB 或留空自动，如 490 表示 49.0 dB）'));

		o = s.option(form.Value, 'ppm_error', _('频偏校准（PPM，留空默认）'));
		o.datatype = 'integer';

		o = s.option(form.Value, 'buffers', _('缓冲块数量'));
		o.datatype = 'uinteger';
		o.default = '8';

		o = s.option(form.Value, 'num_linked_lists', _('链表数量'));
		o.datatype = 'uinteger';
		o.default = '8';

		m.on_after_commit = function() {
			return fs.exec('/etc/init.d/rtl_tcp', [ 'restart' ]).then(function(res) {
				if (res.code !== 0) {
					ui.addNotification(null, E('p', _('配置已保存，但重启服务失败，请查看状态页日志。')));
				}
			});
		};

		return m.render();
	}
});