/*
AE Dockable Anchor Point Manager
Snaps layer anchor points to 9 different sectors without moving the layer.
*/
(function anchorManager(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Anchor Manager", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["center", "top"];

        var gridGroup = mainGroup.add("group");
        gridGroup.orientation = "column";
        gridGroup.spacing = 2;

        function addRow(parent) {
            var row = parent.add("group");
            row.orientation = "row";
            row.spacing = 2;
            return row;
        }

        var r1 = addRow(gridGroup);
        var r2 = addRow(gridGroup);
        var r3 = addRow(gridGroup);

        var btnSize = [0, 0, 35, 35];
        var buttons = {
            TL: r1.add("button", btnSize, "TL"), TC: r1.add("button", btnSize, "TC"), TR: r1.add("button", btnSize, "TR"),
            ML: r2.add("button", btnSize, "ML"), MC: r2.add("button", btnSize, "MC"), MR: r2.add("button", btnSize, "MR"),
            BL: r3.add("button", btnSize, "BL"), BC: r3.add("button", btnSize, "BC"), BR: r3.add("button", btnSize, "BR")
        };

        function setAnchor(xMult, yMult) {
            app.beginUndoGroup("Move Anchor Point");
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) return;
            var layers = comp.selectedLayers;
            
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var rect = layer.sourceRectAtTime(comp.time, false);
                
                var newAnchor = [
                    rect.left + (rect.width * xMult),
                    rect.top + (rect.height * yMult),
                    layer.anchorPoint.value[2] || 0
                ];

                // Calculate where the new anchor point sits in composition space
                var compPos = layer.toComp(newAnchor);
                
                layer.anchorPoint.setValue(newAnchor);
                
                // Keep layer in place by setting position to that comp space coordinate
                if (layer.parent) {
                    layer.position.setValue(layer.parent.fromComp(compPos));
                } else {
                    layer.position.setValue(compPos);
                }
            }
            app.endUndoGroup();
        }

        buttons.TL.onClick = function() { setAnchor(0, 0); };
        buttons.TC.onClick = function() { setAnchor(0.5, 0); };
        buttons.TR.onClick = function() { setAnchor(1, 0); };
        buttons.ML.onClick = function() { setAnchor(0, 0.5); };
        buttons.MC.onClick = function() { setAnchor(0.5, 0.5); };
        buttons.MR.onClick = function() { setAnchor(1, 0.5); };
        buttons.BL.onClick = function() { setAnchor(0, 1); };
        buttons.BC.onClick = function() { setAnchor(0.5, 1); };
        buttons.BR.onClick = function() { setAnchor(1, 1); };

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
