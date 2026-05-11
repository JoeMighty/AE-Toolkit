/*
AE Dockable Master Color Controller
Links all colors in selected layers to a single master control null.
*/
(function masterColorController(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Master Color", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var runButton = mainGroup.add("button", undefined, "Link Colors to Master");

        function linkColorsRecursive(propGroup, nullName) {
            for (var i = 1; i <= propGroup.numProperties; i++) {
                var prop = propGroup.property(i);
                if (prop.propertyType === PropertyType.PROPERTY) {
                    var matchName = prop.matchName;
                    var name = prop.name.toLowerCase();
                    // Target common color properties
                    if (matchName === "ADBE Vector Fill Color" || matchName === "ADBE Vector Stroke Color" || matchName === "ADBE Color Control-0001" || name.indexOf("color") !== -1) {
                        if (prop.canSetExpression) {
                            prop.expression = "thisComp.layer('" + nullName + "').effect('Master Palette')('Color')";
                        }
                    }
                } else if (prop.propertyType === PropertyType.NAMED_GROUP || prop.propertyType === PropertyType.INDEXED_GROUP) {
                    linkColorsRecursive(prop, nullName);
                }
            }
        }

        runButton.onClick = function() {
            app.beginUndoGroup("Create Master Color");
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Select a composition."); return; }
            var layers = comp.selectedLayers;
            if (layers.length === 0) { alert("Select layers to link colors."); return; }

            // Create Master Null
            var masterNull = comp.layers.addNull();
            masterNull.name = "Master Color Control";
            masterNull.moveBefore(layers[0]);
            var colorFx = masterNull.property("Effects").addProperty("ADBE Color Control");
            colorFx.name = "Master Palette";

            // Link Layers
            for (var i = 0; i < layers.length; i++) {
                linkColorsRecursive(layers[i], masterNull.name);
            }

            app.endUndoGroup();
            alert("Colors successfully linked to " + masterNull.name);
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
