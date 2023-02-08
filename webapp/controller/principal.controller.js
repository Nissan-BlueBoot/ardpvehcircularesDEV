sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast"
], function (Controller, ODataModel, MessageBox, MessageToast) {
	"use strict";
	var flagperfil = true,
		usuario, t, oView;
	return Controller.extend("AR_DP_VEH_CIRCULARES.AR_DP_VEH_CIRCULARES.controller.principal", {

		onInit: function () {
			t = this;
			oView = this.getView();
			this.leerCurrentUser();
			//	this.ConsultaNovedades()
		},

		getDocModel: function () {
			return this.getOwnerComponent().getModel("DocModel");
		},
		getDocModel2: function () {
			return this.getOwnerComponent().getModel("DocModel2");
		},

		uncheckTable: function () {
			var oTable = this.getView().getContent()[0].getApp().getPages()[0].getContent()[0];
			oTable.setMode("None");
			oTable.setMode("MultiSelect");
		},

		leerCurrentUser: function () {
			this._setBusyView(true);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
                dataType:"json",
				url: appModulePath+ "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					this.leerUsuario(dataR.name);
					usuario = dataR.name;
					// usuario = "P000253";
					// this.leerUsuario("P001445");

				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});
		},

		handleTableMode: function (sMode) {
			this.getView().byId("table").setMode(sMode);
		},

		leerUsuario: function (oSAPuser) {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var url = appModulePath+ '/destinations/IDP_Nissan/service/scim/Users/' + oSAPuser;
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {

					for (var i = 0; i < dataR.groups.length; i++) {

						if (dataR.groups[i].value === "AR_DP_ADMINISTRADORDEALER" || dataR.groups[i].value === "AR_DP_USUARIODEALER") {
							console.log("entro");
							flagperfil = false

						}
					}
					console.log(flagperfil)
					if (!flagperfil) {

						this.getView().byId("btnagregarcircular").setVisible(false);
						this.getView().byId("btneliminar").setVisible(false);
						this.getView().byId("delete").setVisible(false);
						this.getView().byId("btnagregardescargable2").setVisible(false);
						this.getView().byId("btneliminar2").setVisible(false);
						this.getView().byId("delete2").setVisible(false);

					} else {
						this.getView().byId("btnagregarcircular").setVisible(true);
						this.getView().byId("btneliminar").setVisible(true);
						this.getView().byId("delete").setVisible(true);
						this.getView().byId("btnagregardescargable2").setVisible(true);
						this.getView().byId("btneliminar2").setVisible(true);
						this.getView().byId("delete2").setVisible(true);
					}

					this.readDocuments();
					this.readDocuments2();

					this._setBusyView(false);

				}.bind(this),
				error: function (jqXHR, textStatus, errorThrown) {

					this._setBusyView(false);
				}.bind(this)
			});
		},

		handleVisibleAdd: function (bBool) {
			this.getOwnerComponent().getModel("DocModel").setProperty("/btnVis", bBool);
		},

		onDialogBuilder: function () {
			var oDialog = new sap.m.Dialog({
				noDataText: "No hay items",
				title: "Cargar Archivo",
				content: this.getFragment("oDisplFrag", "addFile", [null, null]),
				beginButton: new sap.m.Button({
					text: "Guardar",
					press: function (oEvent) {
						var content = this.getOwnerComponent().getModel("DocModel").getProperty("/contentToUp");
						var sTitulo = sap.ui.getCore().byId("prob_inp_crea_doc").getValue();

						if (content !== "" && sTitulo !== "") {
							this.sendFiletoCloud("/AR/DEALERPORTAL/CIRCULARESVEH", sTitulo, content);
							oDialog.close();
						} else {
							sap.m.MessageToast.show("Se deben llenar todos los campos.");
						}

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cerrar",
					press: function (oEvent) {
						oDialog.close();

					}
				}),
				afterClose: function () {
					oDialog.destroyAggregation();
					sap.ui.getCore().byId("uploadCollection").destroyItems();
					sap.ui.getCore().byId("prob_inp_crea_doc").setValue("");

				}
			}).addStyleClass("sapUiContentPadding");

			this.getView().addDependent(oDialog);
			oDialog.open();
		},

		onFilterList: function (sValue) {
			var aOrigList = this._getDocModel().getProperty("/listNoFilt");
			var aList = this._getDocModel().getProperty("/listNoFilt");
			var sNewVal = sValue.getParameters().newValue.toUpperCase();
			var aListFilt = aList.filter(lis => lis.TITULO.toUpperCase().search(sNewVal) !== -1);
			this._getDocModel().setProperty("/origList", aListFilt);
		},

		filterDate: function (oEvent) {
			var aList = this._getDocModel().getProperty("/listNoFilt");
			var dFrom = oEvent.getParameters().from;
			var dTo = oEvent.getParameters().to;

			if (dFrom && dTo) {
				var aAsigFilt = aList.filter(vehi => vehi.FECHA_HORA_CREACION > dFrom && vehi.FECHA_HORA_CREACION <
					dTo);
				this._getDocModel().setProperty("/origList", aAsigFilt);
			} else {
				this._getDocModel().setProperty("/origList", aList);
			}
		},

		getFragment: function (oVar, sID, oModel) {
			if (!this[oVar]) {
				this[oVar] = sap.ui.xmlfragment("AR_DP_VEH_CIRCULARES.AR_DP_VEH_CIRCULARES.view." + sID, this);

				this.getView().addDependent(this[oVar]);
			}
			return this[oVar];
		},

		viewFlowRoutine: function (oObject) {
			if (oObject.busy) {
				this._setBusyView(true);
			} else {
				this._setBusyView(false);
			}
		},

		msgBoxHandler: function (e, t, o) {
			sap.m.MessageBox.show(t, {
				icon: e,
				title: o,
				actions: sap.m.MessageBox.Action.CLOSE
			});
		},

		_setBusyView: function (bBool) {
			return this.getView().setBusy(bBool);
		},

		_setDocProperty: function (sPath, sValue) {
			var oModel = this.getOwnerComponent().getModel("DocModel");
			oModel.setProperty(sPath, sValue);
			oModel.refresh(true);
		},
		_setDocProperty2: function (sPath, sValue) {
			var oModel = this.getOwnerComponent().getModel("DocModel2");
			oModel.setProperty(sPath, sValue);
			oModel.refresh(true);
		},

		onSubirArchivo: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("DocModel");
			console.log(oModel.getProperty("/contentToUp"));
			if (oModel.getProperty("/contentToUp") === "") {
				console.log(oEvent.getParameter("files"));
				var file = oEvent.getParameter("files") && oEvent.getParameter("files")[0];

				this._setDocProperty("/contentToUp", Array.from(oEvent.getParameters().files)[0]);
			} else {
				sap.m.MessageBox.show("No se puede cargar mas de un archivo a la vez", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Operación Erronea.",
					actions: sap.m.MessageBox.Action.CLOSE
				});
				oEvent.getParameter("files")[0] = "";
			}
		},
		onSubirArchivo2: function (oEvent) {
			var oModel = this.getOwnerComponent().getModel("DocModel");
			console.log(oModel.getProperty("/contentToUp"));
			if (oModel.getProperty("/contentToUp") === "") {
				console.log(oEvent.getParameter("files"));
				var file = oEvent.getParameter("files") && oEvent.getParameter("files")[0];

				this._setDocProperty("/contentToUp", Array.from(oEvent.getParameters().files)[0]);
			} else {
				sap.m.MessageBox.show("No se puede cargar mas de un archivo a la vez", {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: "Operación Erronea.",
					actions: sap.m.MessageBox.Action.CLOSE
				});
				oEvent.getParameter("files")[0] = "";
			}
		},
		createfolder: function () {
			var formData = new FormData();
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			formData.append("objectId", "U2eZTT1WY4S7drq84sUtcBQ4Se3LsxoWQMdIYaPaQ7Y");
			formData.append("cmisaction", "createFolder");
			formData.append("propertyId[0]", "cmis:objectTypeId");
			formData.append("propertyId[1]", "cmis:name");
			formData.append("propertyValue[0]", "cmis:folder")
			formData.append("propertyValue[1]", "CIRCULARESVEH")
			jQuery.ajax(appModulePath+ "/DSNissan_Repositorio", {
				type: "POST",
				data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (data) {
					console.log(data)
				}.bind(this),
				error: function (data) {
					console.log("error " + data)
				}.bind(this)
			});
		},

		sendFiletoCloud: function (folderName, fileName, file) {
			var formData = new FormData();
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			formData.append("propertyId[0]", "cmis:objectTypeId");
			formData.append("propertyValue[0]", "cmis:document");
			formData.append("cmisaction", "createDocument");
			formData.append("propertyId[1]", "cmis:name");
			formData.append("propertyValue[1]", fileName);
			formData.append("datafile", this.getOwnerComponent().getModel("DocModel").getData().contentToUp);

			jQuery.ajax(appModulePath+ "/DSNissan_Repositorio/AR/DEALERPORTAL/CIRCULARESVEH", {
				type: "POST",
				data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (data) {
					this._setDocProperty("/toCreateData/ID_DOCUMENTO_SERVICIO", data.properties["cmis:objectId"].value);
					this._setDocProperty("/toCreateData/ID_USUARIO", usuario);
					this._setDocProperty("/toCreateData/ID_TIPO_DOCUMENTO", 2);
					this._setDocProperty("/toCreateData/FECHA_HORA_CREACION", new Date());
					this._setDocProperty("/toCreateData/FECHA_HORA_ELIMINACION", null);
					this._setDocProperty("/toCreateData/ACTIVO", "1");
					this._setDocProperty("/toCreateData/TITULO", sap.ui.getCore().byId("prob_inp_crea_doc").getValue());
					this._setDocProperty("/toCreateData/NOMBRE_ARCHIVO", data.properties["cmis:contentStreamFileName"].value);
					this.createDocuments(this._getDocData());
				}.bind(this),
				error: function (data) {
					/*this.viewFlowRoutine({
						busy: false
					});*/
					this.resetDataCrea();
					sap.m.MessageBox.show("Hubo un error en la operación", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Operación Erronea.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}.bind(this)
			});
		},

		_getDocData: function () {
			return this.getOwnerComponent().getModel("DocModel").getProperty("/toCreateData");
		},

		openFile: function (file) {
			var sTitulo = file.getSource().getBindingContext("DocModel").getModel().getObject(file.getSource().getBindingContext("DocModel").getPath())
				.TITULO;
			if (sTitulo && sTitulo !== "") {
				sap.m.URLHelper.redirect("/DSNissan_Repositorio/AR/DEALERPORTAL/CIRCULARESVEH/" + sTitulo, true);
			}
		},

		_getDocModel: function () {
			return this.getOwnerComponent().getModel("DocModel");
		},

		readDocuments: function () {
			try {
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                var appModulePath = jQuery.sap.getModulePath(appid);
				var oModel = new ODataModel(appModulePath+ "/AR_DP_VEH_DEST_HANA/ODATA_masterVehiculo.xsodata");
				oModel.read("/Documentos", {
					success: function (oEvent) {
						var aList = oEvent.results.filter(list => list.ACTIVO === "1" && list.ID_TIPO_DOCUMENTO === 2);
						this.getDocModel().setProperty("/origList", aList);
						this.getDocModel().setProperty("/listNoFilt", aList);
						this._setBusyView(false);
					}.bind(this),
					error: function (oEvent) {
						//	debugger;
						this._setBusyView(false);
					}
				});
			} catch (err) {
				this._setBusyView(false);
				//this.setBusyView(false);
			}
		},
		fndetele: function (file) {
			var sTitulo = file.getSource().getBindingContext("DocModel").getModel().getObject(file.getSource().getBindingContext("DocModel").getPath())
				.TITULO;
			var ID_DOCUMENTO = file.getSource().getBindingContext("DocModel").getModel().getObject(file.getSource().getBindingContext(
					"DocModel").getPath())
				.ID_DOCUMENTO;
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			jQuery.ajax(appModulePath+ "/DSNissan_Repositorio/AR/DEALERPORTAL/CIRCULARESVEH/" + sTitulo + "?cmisaction=delete&allVersions=true", {
				type: "POST",
				//	data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (data) {
					console.log("eliminado 1")
					this.onEliminar(ID_DOCUMENTO);
				}.bind(this),
				error: function (data) {
					/*this.viewFlowRoutine({
						busy: false
					});*/
					// this.onEliminar(ID_DOCUMENTO);
					this.resetDataCrea();
					sap.m.MessageBox.show("Hubo un error en la operación", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Operación Erronea.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}.bind(this)
			});
		},

		onEliminar: function (dato) {
			var documento = dato;
			console.log("paso 1");
			try {
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                var appModulePath = jQuery.sap.getModulePath(appid);
				var oModel = new ODataModel(appModulePath+ "/AR_DP_VEH_DEST_HANA/ODATA_masterVehiculo.xsodata");
				var aSelected = this.byId("table").getSelectedItems();
				var sPath;
				var oObject;
				var counter = 0;

				this.getDocModel().setProperty("/dataProcTwo", counter);
				this.getDocModel().setProperty("/dataProc", []);

				this._setBusyView(true);

				oModel.remove("/Documentos(" + documento + ")", { // oObject, {
					method: "DELETE",
					success: function (oEvent) {
						console.log("paso 3");
						console.log("eliminado 2")
							// dataProc.push(oEvent);
							// this.getDocModel().setProperty("/dataProc", dataProc);
							// if (this.getDocModel().getProperty("/dataProcTwo") === dataProc.length) {
						sap.m.MessageBox.show("Se ha realizado correctamente.", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Operación Exitosa.",
							actions: sap.m.MessageBox.Action.CLOSE
						});
						this.readDocuments();
						this.resetDataCrea();
						// }
						// this.uncheckTable();
					}.bind(this),
					error: function (oEvent) {
						console.log("paso 4");
						this._setBusyView(false);
						var dataProc = this.getDocModel().getProperty("/dataProc");
						dataProc.push(oEvent);
						this.getDocModel().setProperty("/dataProc", dataProc);
						console.log(oEvent);
						if (this.getDocModel().getProperty("/dataProcTwo") === dataProc.length) {
							sap.m.MessageBox.show("No se realizó correctamente.", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Hubo un error.",
								actions: sap.m.MessageBox.Action.CLOSE
							});
						}
					}.bind(this)
				});
				// }
			} catch (err) {
				this._setBusyView(false);
			}
		},

		formatDate: function (sValue) {
			if (sValue) {
				return sValue.toLocaleString();
			}
		},

		createDocuments: function (oData) {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var oModel = new ODataModel(appModuelPath+ "/AR_DP_VEH_DEST_HANA/ODATA_masterVehiculo.xsodata");
			oModel.create("/Documentos", oData, {
				success: function (oEvent) {

					this.readDocuments();
					this.resetDataCrea();
					/*this.viewFlowRoutine({
						busy: false
					});*/
					sap.m.MessageBox.show("Se ha cargado correctamente.", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Operación Exitosa.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}.bind(this),
				error: function (oEvent) {
					//	debugger;
				}
			});
		},

		resetDataCrea: function () {
			this._setDocProperty("/toCreateData", {
				"ID_DOCUMENTO": 0,
				"ID_DOCUMENTO_SERVICIO": "",
				"ID_TIPO_DOCUMENTO": "",
				"NOMBRE_ARCHIVO": "",
				"TITULO": "",
				"ID_USUARIO": "",
				"FECHA_HORA_CREACION": "",
				"FECHA_HORA_ELIMINACION": "",
				"ACTIVO": ""
			});
			this._setDocProperty("/contentToUp", "");
			//sap.ui.getCore().byId("prob_inp_crea_user").setValue(null);
			if (sap.ui.getCore().byId("prob_inp_crea_doc") && sap.ui.getCore().byId("uploadCollection")) {
				sap.ui.getCore().byId("prob_inp_crea_doc").setValue(null);
				//	sap.ui.getCore().byId("uploadCollection").setValue(null);
			}
		},

		getOdataDocs: function () {
			return {
				"ID_DOCUMENTO": 0,
				"ID_DOCUMENTO_SERVICIO": "000000000_TEST",
				"ID_TIPO_DOCUMENTO": 1,
				"NOMBRE_ARCHIVO": "NOMBRE_ARCHIVO",
				"TITULO": "Titulo",
				"ID_USUARIO": "P00012",
				"FECHA_HORA_CREACION": null,
				"FECHA_HORA_ELIMINACION": null,
				"ACTIVO": "1"
			};
		},
		onSalir: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},

		///////////////************************************************************************\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		onDialogBuilder2: function () {
			var oDialog = new sap.m.Dialog({
				noDataText: "No hay items",
				title: "Cargar Archivo2",
				content: this.getFragment("oDisplFrag", "addFile2", [null, null]),
				beginButton: new sap.m.Button({
					text: "Guardar",
					press: function (oEvent) {
						var content = this.getOwnerComponent().getModel("DocModel2").getProperty("/contentToUp");
						var sTitulo = sap.ui.getCore().byId("prob_inp_crea_doc").getValue();

						if (content !== "" && sTitulo !== "") {
							this.sendFiletoCloud2("/AR/DEALERPORTAL/CIRCULARESVEH", sTitulo, content);
							oDialog.close();
						} else {
							sap.m.MessageToast.show("Se deben llenar todos los campos.");
						}

					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cerrar",
					press: function (oEvent) {
						oDialog.close();

					}
				}),
				afterClose: function () {
					oDialog.destroyAggregation();
					sap.ui.getCore().byId("uploadCollection").destroyItems();
					sap.ui.getCore().byId("prob_inp_crea_doc").setValue("");

				}
			}).addStyleClass("sapUiContentPadding");

			this.getView().addDependent(oDialog);
			oDialog.open();
		},
		sendFiletoCloud2: function (folderName, fileName, file) {
			var formData = new FormData();
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			formData.append("propertyId[0]", "cmis:objectTypeId");
			formData.append("propertyValue[0]", "cmis:document");
			formData.append("cmisaction", "createDocument");
			formData.append("propertyId[1]", "cmis:name");
			formData.append("propertyValue[1]", fileName);
			formData.append("datafile", this.getOwnerComponent().getModel("DocModel2").getData().contentToUp);

			jQuery.ajax(appModulePath+ "/DSNissan_Repositorio/AR/DEALERPORTAL/CIRCULARESVEH", {
				type: "POST",
				data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (data) {
					this._setDocProperty("/toCreateData/ID_DOCUMENTO_SERVICIO", data.properties["cmis:objectId"].value);
					this._setDocProperty("/toCreateData/ID_USUARIO", usuario);
					this._setDocProperty("/toCreateData/ID_TIPO_DOCUMENTO", 3);
					this._setDocProperty("/toCreateData/FECHA_HORA_CREACION", new Date());
					this._setDocProperty("/toCreateData/FECHA_HORA_ELIMINACION", null);
					this._setDocProperty("/toCreateData/ACTIVO", "1");
					this._setDocProperty("/toCreateData/TITULO", sap.ui.getCore().byId("prob_inp_crea_doc").getValue());
					this._setDocProperty("/toCreateData/NOMBRE_ARCHIVO", data.properties["cmis:contentStreamFileName"].value);
					this.createDocuments2(this._getDocData());
				}.bind(this),
				error: function (data) {
					/*this.viewFlowRoutine({
						busy: false
					});*/
					this.resetDataCrea();
					sap.m.MessageBox.show("Hubo un error en la operación", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Operación Erronea.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}.bind(this)
			});
		},
		createDocuments2: function (oData) {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var oModel = new ODataModel(appModulePath+ "/AR_DP_VEH_DEST_HANA/ODATA_masterVehiculo.xsodata");
			oModel.create("/Documentos", oData, {
				success: function (oEvent) {

					this.readDocuments2();
					this.resetDataCrea();
					/*this.viewFlowRoutine({
						busy: false
					});*/
					sap.m.MessageBox.show("Se ha cargado correctamente.", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Operación Exitosa.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}.bind(this),
				error: function (oEvent) {
					//	debugger;
				}
			});
		},
		readDocuments2: function () {
			try {
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                var appModulePath = jQuery.sap.getModulePath(appid);
				var oModel = new ODataModel(appModuelPath+ "/AR_DP_VEH_DEST_HANA/ODATA_masterVehiculo.xsodata");
				oModel.read("/Documentos", {
					success: function (oEvent) {
						var aList = oEvent.results.filter(list => list.ACTIVO === "1" && list.ID_TIPO_DOCUMENTO === 3);
						this.getDocModel2().setProperty("/origList", aList);
						this.getDocModel2().setProperty("/listNoFilt", aList);
						this._setBusyView(false);
					}.bind(this),
					error: function (oEvent) {

						this._setBusyView(false);
					}
				});
			} catch (err) {
				this._setBusyView(false);
				//this.setBusyView(false);
			}
		},
		fndetele2: function (file) {
			var sTitulo = file.getSource().getBindingContext("DocModel2").getModel().getObject(file.getSource().getBindingContext("DocModel2").getPath())
				.TITULO;
			var ID_DOCUMENTO = file.getSource().getBindingContext("DocModel2").getModel().getObject(file.getSource().getBindingContext(
					"DocModel2").getPath())
				.ID_DOCUMENTO;
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			jQuery.ajax(appModulePath+ "/DSNissan_Repositorio/AR/DEALERPORTAL/CIRCULARESVEH/" + sTitulo + "?cmisaction=delete&allVersions=true", {
				type: "POST",
				//	data: formData,
				cache: false,
				processData: false,
				contentType: false,
				async: false,
				success: function (data) {
					console.log("eliminado 1")
					this.onEliminar2(ID_DOCUMENTO);
				}.bind(this),
				error: function (data) {
					/*this.viewFlowRoutine({
						busy: false
					});*/
					// this.onEliminar(ID_DOCUMENTO);
					this.resetDataCrea();
					sap.m.MessageBox.show("Hubo un error en la operación", {
						icon: sap.m.MessageBox.Icon.ERROR,
						title: "Operación Erronea.",
						actions: sap.m.MessageBox.Action.CLOSE
					});
				}.bind(this)
			});
		},

		onEliminar2: function (dato) {
			var documento = dato;
			console.log("paso 1");
			try {
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                var appModulePath = jQuery.sap.getModulePath(appid);
				var oModel = new ODataModel(appModuelPath+ "/AR_DP_VEH_DEST_HANA/ODATA_masterVehiculo.xsodata");
				var aSelected = this.byId("table").getSelectedItems();
				var sPath;
				var oObject;
				var counter = 0;

				this.getDocModel().setProperty("/dataProcTwo", counter);
				this.getDocModel().setProperty("/dataProc", []);

				this._setBusyView(true);

				oModel.remove("/Documentos(" + documento + ")", { // oObject, {
					method: "DELETE",
					success: function (oEvent) {
						console.log("paso 3");
						console.log("eliminado 2")
							// dataProc.push(oEvent);
							// this.getDocModel().setProperty("/dataProc", dataProc);
							// if (this.getDocModel().getProperty("/dataProcTwo") === dataProc.length) {
						sap.m.MessageBox.show("Se ha realizado correctamente.", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Operación Exitosa.",
							actions: sap.m.MessageBox.Action.CLOSE
						});
						this.readDocuments2();
						this.resetDataCrea();
						// }
						// this.uncheckTable();
					}.bind(this),
					error: function (oEvent) {
						console.log("paso 4");
						this._setBusyView(false);
						var dataProc = this.getDocModel().getProperty("/dataProc");
						dataProc.push(oEvent);
						this.getDocModel().setProperty("/dataProc", dataProc);
						console.log(oEvent);
						if (this.getDocModel().getProperty("/dataProcTwo") === dataProc.length) {
							sap.m.MessageBox.show("No se realizó correctamente.", {
								icon: sap.m.MessageBox.Icon.ERROR,
								title: "Hubo un error.",
								actions: sap.m.MessageBox.Action.CLOSE
							});
						}
					}.bind(this)
				});
				// }
			} catch (err) {
				this._setBusyView(false);
			}
		},
	});
});