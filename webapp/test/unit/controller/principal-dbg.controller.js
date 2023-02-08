/*global QUnit*/

sap.ui.define([
	"AR_DP_VEH_CIRCULARES/AR_DP_VEH_CIRCULARES/controller/principal.controller"
], function (Controller) {
	"use strict";

	QUnit.module("principal Controller");

	QUnit.test("I should test the principal controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});