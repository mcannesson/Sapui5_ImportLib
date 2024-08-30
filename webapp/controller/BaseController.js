sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/core/routing/History", "sap/m/MessageBox"],
  function (Controller, History, MessageBox) {
    "use strict";

    return Controller.extend("fr.mca.importlib.controller.BaseController", {
      /**
       * Convenience method for accessing the router in every controller of the application.
       * @public
       * @returns {sap.ui.core.routing.Router} the router for this component
       */
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },

      /**
       * Convenience method for getting the view model by name in every controller of the application.
       * @public
       * @param {string} [sName] the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },

      /**
       * Convenience method for getting odata model by name in every controller of the application.
       * @public
       * @param {string} [sName] the model name
       * @returns {sap.ui.model.Model} the model instance
       */
      getODataModel: function (sName) {
        return this.getOwnerComponent().getModel(sName);
      },
      /**
       * Convenience method for setting the view model in every controller of the application.
       * @public
       * @param {sap.ui.model.Model} oModel the model instance
       * @param {string} sName the model name
       * @returns {sap.ui.mvc.View} the view instance
       */
      setModel: function (oModel, sName) {
        return this.getView().setModel(oModel, sName);
      },

      /**
       * Convenience method for getting the resource bundle.
       * @public
       * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
       */
      getResourceBundle: function () {
        return this.getOwnerComponent().getModel("i18n").getResourceBundle();
      },

      /**
       * Event handler for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the list route.
       * @public
       */
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();

        if (sPreviousHash !== undefined) {
          // eslint-disable-next-line sap-no-history-manipulation
          history.go(-1);
        } else {
          this.getRouter().navTo("list", {}, true);
        }
      },

      /**
       * Error when webservice called. Determine error text
       * @function
       * @param {object} oError Error object returned by webservice call
       * @return {string} sText The error text
       * @public
       */
      determineODataErrorText: function (oError) {
        var oResponse, sText;
        try {
          oResponse = JSON.parse(oError.responseText);
          sText = oResponse.error.message.value;
        } catch (oException1) {
          try {
            oResponse = this._xmlToJson($.parseXML(oError.responseText));
            sText = oResponse.error ? oResponse.error.message["#text"] : oResponse.html.body.h1["#text"];
          } catch (oException2) {
            sText = oError.responseText;
          }
        }
        return sText;
      },

      /**
       * Error when webservice called. Determine error text
       * @function
       * @param {object} oError Error object returned by webservice call
       * @return {array} Text and Error
       * @public
       */
      determineODataErrorTextCode: function (oError) {
        let oResponse = oError.responseText;
        let oParsedResponse, sText, sCode;
        let aRet = [];
        if (oError.response && oError.response.body) oResponse = oError.response.body;
        try {
          oParsedResponse = JSON.parse(oResponse);
          try {
            if (oParsedResponse.error.innererror.errordetails.length > 0) {
              oParsedResponse.error.innererror.errordetails.forEach((oErrorDetail) => {
                sText = oErrorDetail.message;
                sCode = oErrorDetail.code;
                aRet.push({ text: sText, code: sCode });
              });
            }
          } catch (error) {
            sText = oParsedResponse.error.message.value;
            sCode = oParsedResponse.error.code;
            aRet.push({ text: sText, code: sCode });
          }
        } catch (oException1) {
          try {
            oParsedResponse = this._xmlToJson($.parseXML(oResponse));
            sText = oParsedResponse.error
              ? oParsedResponse.error.message["#text"]
              : oParsedResponse.html.body.h1["#text"];
            sCode = oParsedResponse.error ? oParsedResponse.error.code["#code"] : oParsedResponse.html.body.h1["#code"];

            aRet.push({ text: sText, code: sCode });
          } catch (oException2) {
            sText = oResponse;
            aRet.push({ text: oResponse, code: "" });
          }
        }

        return aRet;
      },

      /**
       * Transform XML to JSON
       * @function
       * @param {object} oXML XML object
       * @return {object} js object
       * @public
       */
      _xmlToJson: function (oXML) {
        // Create the return object
        var oReturn = {};

        if (oXML.nodeType === 1) {
          // element
          // do attributes
          if (oXML.attributes.length > 0) {
            oReturn["@attributes"] = {};
            for (var j = 0; j < oXML.attributes.length; j++) {
              var attribute = oXML.attributes.item(j);
              oReturn["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
          }
        } else if (oXML.nodeType === 3) {
          // text
          oReturn = oXML.nodeValue;
        }

        // do children
        if (oXML.hasChildNodes()) {
          for (var i = 0; i < oXML.childNodes.length; i++) {
            var item = oXML.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof oReturn[nodeName] === "undefined") {
              oReturn[nodeName] = this._xmlToJson(item);
            } else {
              if (typeof oReturn[nodeName].push === "undefined") {
                var old = oReturn[nodeName];
                oReturn[nodeName] = [];
                oReturn[nodeName].push(old);
              }
              oReturn[nodeName].push(this._xmlToJson(item));
            }
          }
        }
        return oReturn;
      },
      /**
       * Get current route
       * (Need SapUi5 version >= 1.75)
       * @function
       * @param {sap.f.routing.Router} [oRouter] Router
       * @return {string} Route name or empty string
       * @public
       */
      getCurrentRoute: function (oRouter = this.getOwnerComponent().getRouter()) {
        const sCurrentHash = oRouter.getHashChanger().getHash();
        const oRouteInfo = oRouter.getRouteInfoByHash(sCurrentHash);
        // * Need SapUi5 version >= 1.75
        // @ts-ignore name exist https://sapui5.hana.ondemand.com/#/api/sap.ui.core.routing.RouteInfo
        return oRouteInfo.name || "";
      },
      onEscapeRefuseClose: function (oPromise) {
        oPromise.reject();
      },
      /**
       * Open message popover
       * @function
       * @param {sap.ui.base.Event} oEvent Button press event
       * @public
       */
      async onMessagePopoverPress(oEvent) {
        const oSourceControl = oEvent.getSource();
        const oMessagePopover = await this._getMessagePopover();
        oMessagePopover.openBy(oSourceControl);
      },
      /**
       * Create message popover
       * @function
       * @private
       */
      _getMessagePopover: function () {
        return this.loadFragment({
          name: "fr.mca.importlib.view.Popup.MessagePopover",
        });
      },
      /**
       * Handle error message and focus on an input
       * @param {string} sMessage, Message to display in popup
       * @param {function} [fnCallback] Callback function
       * @function
       * @private
       */
      _handleErrorMessage: function (sMessage, fnCallback) {
        //Display Error in popup
        MessageBox.error(sMessage, {
          onClose: function () {
            if (fnCallback) {
              fnCallback.apply(this);
            }
          }.bind(this),
        });
      },
      /**
       * Handle error message with code and focus on an input
       * @param {array} aMessage, Messages to display in popup
       * @param {function} [fnCallback] Callback function
       * @function
       * @private
       */
      _handleErrorMessageWithCode: function (aMessage, fnCallback) {
        //Display Error in popup
        let sConcatMsg = "";
        aMessage.forEach((oMessage) => {
          if (!sConcatMsg) {
            sConcatMsg = `${oMessage.code} - ${oMessage.text}`;
          } else {
            sConcatMsg = `\n${oMessage.code} - ${oMessage.text}`;
          }
        });
        MessageBox.error(sConcatMsg, {
          onClose: function () {
            if (fnCallback) {
              fnCallback.apply(this);
            }
          }.bind(this),
        });
      },
      /**
       * Validate input
       * @function
       * @param {sap.m.InputBase} oInput Input to validate
       * @private
       */
      _checkInput: function (oInput) {
        var oBinding = oInput.getBinding("value"),
          bRet = true;

        // // @ts-ignore
        // if (oBinding.getType()) {
        //   oBinding.getType().validateValue(oInput.getValue());
        // }
        //force a change retrigger valudation...
        const sValue = oInput.getValue();
        oInput.setValue("");
        oInput.setValue(sValue);
        return bRet;
      },
      _handleBusyBindingItems: function (oControl) {
        oControl.attachModelContextChange((oEvent) => {
          const oItemsBinding = oControl.getBinding("items");
          oItemsBinding.attachChange(() => {
            oControl.setBusy(true);
          });
          oItemsBinding.attachDataRequested(() => {
            oControl.setBusy(true);
          });
          oItemsBinding.attachDataReceived(() => {
            oControl.setBusy(false);
          });
        });
      },
    });
  }
);
