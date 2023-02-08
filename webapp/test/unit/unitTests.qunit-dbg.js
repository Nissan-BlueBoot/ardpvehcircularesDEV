/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"AR_DP_VEH_CIRCULARES/AR_DP_VEH_CIRCULARES/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});