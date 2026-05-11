/*
AE Dockable Palette Extractor
Samples colors from an image layer and generates a 5-color shape palette.
*/
(function paletteExtractor(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Palette Extractor", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var runButton = mainGroup.add("button", undefined, "Extract 5-Color Palette");

        runButton.onClick = function() {
            app.beginUndoGroup("Extract Palette");
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Select a comp."); return; }
            var layers = comp.selectedLayers;
            if (layers.length === 0 || !layers[0].source) { alert("Select an image or video layer."); return; }

            var targetLayer = layers[0];
            var w = targetLayer.width;
            var h = targetLayer.height;

            // Sample points: Center, TL, TR, BL, BR
            var points = [
                [w * 0.5, h * 0.5],
                [w * 0.2, h * 0.2],
                [w * 0.8, h * 0.2],
                [w * 0.2, h * 0.8],
                [w * 0.8, h * 0.8]
            ];

            var sampledColors = [];
            var tempFx = targetLayer.property("Effects").addProperty("ADBE Color Control");

            for (var i = 0; i < points.length; i++) {
                var pt = points[i];
                tempFx.property("Color").expression = "sampleImage([" + pt[0] + "," + pt[1] + "], [10, 10], true, time)";
                sampledColors.push(tempFx.property("Color").value);
            }
            tempFx.remove();

            // Create Palette Shapes
            var boxSize = 100;
            var spacing = 20;
            var totalWidth = (boxSize * 5) + (spacing * 4);
            var startX = (comp.width - totalWidth) / 2 + (boxSize / 2);

            for (var c = 0; c < sampledColors.length; c++) {
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = "Palette Color " + (c + 1);
                var shapeGroup = shapeLayer.property("Contents").addProperty("ADBE Vector Shape - Rect");
                shapeGroup.property("Size").setValue([boxSize, boxSize]);
                
                var fill = shapeLayer.property("Contents").addProperty("ADBE Vector Graphic - Fill");
                fill.property("Color").setValue(sampledColors[c]);

                shapeLayer.property("Transform").property("Position").setValue([startX + (c * (boxSize + spacing)), comp.height - 100]);
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
