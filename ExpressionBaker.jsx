/*
AE Dockable Expression Baker
Finds all expressions on selected layers and bakes them into keyframes.
*/
(function expressionBaker(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Expression Baker", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var runButton = mainGroup.add("button", undefined, "Bake Expressions on Layers");

        function findAndSelectExpressions(propGroup) {
            for (var i = 1; i <= propGroup.numProperties; i++) {
                var prop = propGroup.property(i);
                if (prop.propertyType === PropertyType.PROPERTY) {
                    if (prop.canSetExpression && prop.expression !== "" && prop.expressionEnabled) {
                        prop.selected = true;
                    }
                } else if (prop.propertyType === PropertyType.NAMED_GROUP || prop.propertyType === PropertyType.INDEXED_GROUP) {
                    findAndSelectExpressions(prop);
                }
            }
        }

        runButton.onClick = function() {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Select a composition."); return; }
            var layers = comp.selectedLayers;
            if (layers.length === 0) { alert("Select layers to bake expressions."); return; }

            app.beginUndoGroup("Bake Expressions");

            // Deselect all properties first to isolate the expressions
            for (var i = 0; i < layers.length; i++) {
                var selectedProps = layers[i].selectedProperties;
                for (var p = 0; p < selectedProps.length; p++) {
                    selectedProps[p].selected = false;
                }
            }

            // Drill down and select only properties with active expressions
            for (var l = 0; l < layers.length; l++) {
                findAndSelectExpressions(layers[l]);
            }

            // Execute the native After Effects 'Convert Expression to Keyframes' command
            try {
                var cmdId = app.findMenuCommandId("Convert Expression to Keyframes");
                if (cmdId !== 0) {
                    app.executeCommand(cmdId);
                } else {
                    // Fallback to standard hardcoded command ID just in case
                    app.executeCommand(2639);
                }
            } catch (err) {
                alert("Error baking expressions. Ensure your After Effects version supports this command.");
            }

            app.endUndoGroup();
        };

        // Footer
        var footerGroup = mainGroup.add("group");
        footerGroup.margins.top = 10;
        var creditText = footerGroup.add("statictext", undefined, "Created by JoeMighty");
        try { creditText.graphics.foregroundColor = creditText.graphics.newPen(creditText.graphics.PenType.SOLID_COLOR, [0.3, 0.6, 1], 1); } catch (e) {}
        creditText.addEventListener("mousedown", function(event) {
            if (event.button === 0) {
                var url = "https://github.com/JoeMighty/";
                if ($.os.indexOf("Windows") !== -1) { system.callSystem('cmd.exe /c "explorer ' + url + '"'); } else { system.callSystem('open "' + url + '"'); }
            }
        });

        win.layout.layout(true);
        return win;
    }
    var myUI = buildUI(thisObj);
    if (myUI instanceof Window) { myUI.center(); myUI.show(); }
})(this);
