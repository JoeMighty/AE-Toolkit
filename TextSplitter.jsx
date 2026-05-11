/*
AE Dockable Text Splitter
Splits a single text layer into multiple layers by word or line.
*/
(function textSplitter(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Text Splitter", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var splitOptions = mainGroup.add("dropdownlist", undefined, ["Split by Words", "Split by Lines"]);
        splitOptions.selection = 0;

        var runButton = mainGroup.add("button", undefined, "Split Text Layer");

        runButton.onClick = function() {
            app.beginUndoGroup("Split Text");
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Select a composition."); return; }
            var layers = comp.selectedLayers;
            if (layers.length === 0 || !(layers[0] instanceof TextLayer)) { alert("Please select a Text Layer."); return; }

            var originalLayer = layers[0];
            var textProp = originalLayer.property("Source Text");
            var textDoc = textProp.value;
            var fullString = textDoc.text;

            var delimiter = (splitOptions.selection.index === 0) ? " " : "\r";
            var fragments = fullString.split(delimiter);

            // Hide original
            originalLayer.enabled = false;

            for (var i = fragments.length - 1; i >= 0; i--) {
                var fragText = fragments[i].replace(/^\s+|\s+$/g, ""); // trim
                if (fragText === "") continue;

                var newLayer = originalLayer.duplicate();
                newLayer.name = fragText;
                newLayer.enabled = true;
                
                var newTextDoc = newLayer.property("Source Text").value;
                newTextDoc.text = fragText;
                newLayer.property("Source Text").setValue(newTextDoc);
            }

            app.endUndoGroup();
            alert("Text splitting complete. Note: You will need to manually arrange the spatial positions of the new layers.");
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
