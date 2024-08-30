sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("fr.mca.importlib.controller.App", {
      onInit: function () {
        this.getView().setModel(
          new JSONModel({
            busy: false,
            delay: 0,
            layout: "OneColumn",
            previousLayout: "",
            actionButtonsInfo: {
              midColumn: {
                fullScreen: false,
              },
            },
          }),
          "appModel"
        );
      },
      onAfterRendering: function () {},
    });
  }
);
