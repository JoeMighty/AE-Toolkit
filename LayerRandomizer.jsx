/*
AE Dockable Layer Randomizer
Randomly shifts the start times of selected layers within a frame range.
*/
(function layerRandomizer(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Layer Randomizer", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var inputGroup = mainGroup.add("group");
        inputGroup.add("statictext", undefined, "Max Shift (Frames):");
        var frameInput = inputGroup.add("edittext", undefined, "15");
        frameInput.characters = 4;

        var runButton = mainGroup.add("button", undefined, "Randomize Selected Layers");

        runButton.onClick = function() {
            app.beginUndoGroup("Randomize Layers");
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Select a comp."); return; }
            var layers = comp.selectedLayers;
            if (layers.length === 0) { alert("Select layers to randomize."); return; }

            var maxFrames = parseInt(frameInput.text);
            if (isNaN(maxFrames)) maxFrames = 15;

            var frameDuration = comp.frameDuration;

            for (var i = 0; i < layers.length; i++) {
                var randomFrames = Math.floor(Math.random() * maxFrames);
                layers[i].startTime += (randomFrames * frameDuration);
            }
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
