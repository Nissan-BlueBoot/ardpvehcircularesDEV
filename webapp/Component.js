sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"AR_DP_VEH_CIRCULARES/AR_DP_VEH_CIRCULARES/model/models",
	"sap/ui/model/json/JSONModel"

], function (UIComponent, Device, models, JSONModel) {
	"use strict";

	return UIComponent.extend("AR_DP_VEH_CIRCULARES.AR_DP_VEH_CIRCULARES.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			var t = new JSONModel({
				origList: [],
				btnVis: false,
				listNoFilt: [],
				dataProcTwo: "",
				dataProc: [],
				toCreateData: {
					ID_DOCUMENTO: 0,
					ID_DOCUMENTO_SERVICIO: "",
					ID_TIPO_DOCUMENTO: "",
					NOMBRE_ARCHIVO: "",
					TITULO: "",
					ID_USUARIO: "",
					FECHA_HORA_CREACION: "",
					FECHA_HORA_ELIMINACION: "",
					ACTIVO: ""
				},
				contentToUp: ""
			});
			this.setModel(t, "DocModel");
			var y = new JSONModel({
				origList: [],
				btnVis: false,
				listNoFilt: [],
				dataProcTwo: "",
				dataProc: [],
				toCreateData: {
					ID_DOCUMENTO: 0,
					ID_DOCUMENTO_SERVICIO: "",
					ID_TIPO_DOCUMENTO: "",
					NOMBRE_ARCHIVO: "",
					TITULO: "",
					ID_USUARIO: "",
					FECHA_HORA_CREACION: "",
					FECHA_HORA_ELIMINACION: "",
					ACTIVO: ""
				},
				contentToUp: ""
			});
			this.setModel(y, "DocModel2");

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});