/*
AE Dockable Auto Text Box
Creates a dynamic, auto resizing shape layer behind selected text.
*/
(function autoTextBox(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Auto Text Box", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var inputGroup = mainGroup.add("group");
        inputGroup.orientation = "row";
        inputGroup.add("statictext", undefined, "Padding X/Y:");
        var padXInput = inputGroup.add("edittext", undefined, "40");
        var padYInput = inputGroup.add("edittext", undefined, "20");
        padXInput.characters = 3;
        padYInput.characters = 3;

        var runButton = mainGroup.add("button", undefined, "Create Text Box");

        runButton.onClick = function() {
            app.beginUndoGroup("Create Auto Text Box");
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Select a composition."); return; }
            var layers = comp.selectedLayers;
            if (layers.length === 0 || !(layers[0] instanceof TextLayer)) { alert("Please select a Text Layer."); return; }

            var textLayer = layers[0];
            var padX = parseFloat(padXInput.text) || 40;
            var padY = parseFloat(padYInput.text) || 20;

            // Create Shape Layer
            var boxLayer = comp.layers.addShape();
            boxLayer.name = textLayer.name + " Box";
            boxLayer.moveAfter(textLayer);

            var shapeGroup = boxLayer.property("Contents").addProperty("ADBE Vector Shape - Rect");
            var fillConfig = boxLayer.property("Contents").addProperty("ADBE Vector Graphic - Fill");
            fillConfig.property("Color").setValue([0.1, 0.1, 0.1]);

            // Add Expressions
            var sizeExpr = "var txt = thisComp.layer('" + textLayer.name + "');\r" +
                           "var s = txt.sourceRectAtTime(time, false);\r" +
                           "[s.width, s.height] + [" + padX + ", " + padY + "];";
            
            var posExpr = "var txt = thisComp.layer('" + textLayer.name + "');\r" +
                          "var s = txt.sourceRectAtTime(time, false);\r" +
                          "var p = txt.transform.position;\r" +
                          "[s.left + s.width/2, s.top + s.height/2];";

            var boxPosExpr = "var txt = thisComp.layer('" + textLayer.name + "');\r" +
                             "txt.transform.position;";

            shapeGroup.property("Size").expression = sizeExpr;
            shapeGroup.property("Position").expression = posExpr;
            boxLayer.property("Transform").property("Position").expression = boxPosExpr;
            
            // Parent to text layer so it follows rotation and scale
            boxLayer.parent = textLayer;

            app.endUndoGroup();
        };

        // Footer
        var footerGroup = mainGroup.add("group");
        footerGroup.alignment = ["center", "bottom"];
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
