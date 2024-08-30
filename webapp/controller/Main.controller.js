sap.ui.define(
  ["./BaseController", "../model/formatter", "sap/ui/model/json/JSONModel", "clickup_api"],
  function (BaseController, formatter, JSONModel, clickup_api) {
    "use strict";

    return BaseController.extend("fr.mca.importlib.controller.Main", {
      formatter: formatter,
      /*   PUBLIC SECTION */
      /**
       * On user start app
       * @function
       * @public
       */
      onInit: function () {
        this._oView = this.getView();
        this.getRouter().getRoute("main").attachPatternMatched(this._onPatternMatched, this);

        if (clickup_api) {
          this.getView().byId("done").setText("Clickup api Loaded");
          console.log("Clickup api Loaded");
        } else {
          this.getView().byId("done").setText("Clickup api not loaded");
          console.log("Clickup api not loaded");
        }
      },
      /**
       * On user exit app
       * @function
       * @public
       */
      onExit: function () {},
      /*   PRIVATE SECTION */
      /**
       * When pattern matched
       * @function
       * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
       * @private
       */
      _onPatternMatched: function (oEvent) {},
    });
  }
);
