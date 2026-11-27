include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-rtl-sdr
PKG_VERSION:=1.0
PKG_RELEASE:=1
PKG_LICENSE:=MIT
PKGARCH:=all

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-rtl-sdr
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=Services
  TITLE:=LuCI support for rtl_tcp (rtl-sdr)
  DEPENDS:=+luci-base +rpcd-mod-file +rtl-sdr
endef

define Package/luci-app-rtl-sdr/description
  LuCI interface for managing rtl_tcp service, configuration, and logs via official rtl-sdr.
endef

define Package/luci-app-rtl-sdr/conffiles
/etc/config/rtl_tcp
endef

define Build/Compile
endef

define Package/luci-app-rtl-sdr/install
	$(INSTALL_DIR) $(1)/etc/hotplug.d/usb
	$(INSTALL_BIN) ./root/etc/hotplug.d/usb/90-rtl-sdr $(1)/etc/hotplug.d/usb/90-rtl-sdr

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./root/etc/init.d/rtl-sdr $(1)/etc/init.d/rtl-sdr

	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-rtl-sdr.json $(1)/usr/share/luci/menu.d/luci-app-rtl-sdr.json

	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-rtl-sdr.json $(1)/usr/share/rpcd/acl.d/luci-app-rtl-sdr.json

	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/rtl-sdr
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/rtl-sdr/config.js $(1)/www/luci-static/resources/view/rtl-sdr/config.js
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/rtl-sdr/status.js $(1)/www/luci-static/resources/view/rtl-sdr/status.js
endef

$(eval $(call BuildPackage,luci-app-rtl-sdr))