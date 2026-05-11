/*
AE Dockable Advanced Sequencer
Sequences or staggers selected layers with frame-accurate offsets.
*/
(function advancedSequencer(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Advanced Sequencer", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        // Order
        var orderPanel = mainGroup.add("panel", undefined, "Layer Order");
        orderPanel.orientation = "column";
        orderPanel.alignChildren = "left";
        var topRadio = orderPanel.add("radiobutton", undefined, "Top to Bottom");
        var bottomRadio = orderPanel.add("radiobutton", undefined, "Bottom to Top");
        topRadio.value = true;

        // Mode
        var modePanel = mainGroup.add("panel", undefined, "Sequence Mode");
        modePanel.orientation = "column";
        modePanel.alignChildren = "left";
        var staggerRadio = modePanel.add("radiobutton", undefined, "Stagger Start Times");
        var sequenceRadio = modePanel.add("radiobutton", undefined, "Sequence Back-to-Back");
        staggerRadio.value = true;

        // Offset
        var offsetGroup = mainGroup.add("group");
        offsetGroup.orientation = "row";
        offsetGroup.add("statictext", undefined, "Offset/Overlap (Frames):");
        var offsetInput = offsetGroup.add("edittext", undefined, "5");
        offsetInput.characters = 4;

        var runButton = mainGroup.add("button", undefined, "Sequence Layers");

        runButton.onClick = function() {
            app.beginUndoGroup("Advanced Sequencer");
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Select a composition."); return; }
            var layers = comp.selectedLayers;
            if (layers.length < 2) { alert("Select at least 2 layers to sequence."); return; }

            // Sort Layers
            if (topRadio.value) {
                layers.sort(function(a, b) { return a.index - b.index; });
            } else {
                layers.sort(function(a, b) { return b.index - a.index; });
            }

            var offsetFrames = parseInt(offsetInput.text);
            if (isNaN(offsetFrames)) offsetFrames = 0;
            var fd = comp.frameDuration;
            var timeOffset = offsetFrames * fd;

            if (staggerRadio.value) {
                // Stagger: Shift each layer's start time relative to the first selected layer
                var baseTime = layers[0].startTime;
                for (var i = 0; i < layers.length; i++) {
                    layers[i].startTime = baseTime + (i * timeOffset);
                }
            } else {
                // Sequence: Place layer right after the outPoint of the previous layer
                for (var j = 1; j < layers.length; j++) {
                    var prevLayer = layers[j-1];
                    layers[j].startTime = prevLayer.outPoint + timeOffset;
                }
            }

            app.endUndoGroup();
        };

        // Footer
        var footerGroup = mainGroup.add("group");
        footerGroup.margins.top = 10;
        footerGroup.alignment = ["center", "bottom"];
        var creditText = footerGroup.add("statictext", undefined, "Created by JoeMighty");
        try { creditText.graphics.foregroundColor = creditText.graphics.newPen(creditText.graphics.PenType.SOLID_COLOR, [0.3, 0.6, 1], 1); } catch (e) {}
        creditText.addEventListener("mousedown", function(event) {
            if (event.button === 0) {
                var url = "https://github.com/JoeMighty/AE-Toolkit/";
                if ($.os.indexOf("Windows") !== -1) { system.callSystem('cmd.exe /c "explorer ' + url + '"'); } else { system.callSystem('open "' + url + '"'); }
            }
        });

        win.layout.layout(true);
        return win;
    }
    var myUI = buildUI(thisObj);
    if (myUI instanceof Window) { myUI.center(); myUI.show(); }
})(this);
