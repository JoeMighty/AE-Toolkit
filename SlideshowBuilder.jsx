/*
AE Dockable Slideshow Builder Panel

Features:
- Dockable ScriptUI panel
- Image only / Video only / Mixed modes
- Start from top or bottom layer
- Adjustable image duration
- Adjustable video duration
- Adjustable last slide hold duration
- Adjustable fade duration
- Multiple transition types
- Sequential arrangement
- Optional video trimming
- Crossfade support
- Trim composition to exact end
- Created by JoeMighty
*/

(function slideshowBuilder(thisObj) {

    function buildUI(thisObj) {

        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "Slideshow Builder", undefined, {
                resizeable: true
            });

        // MAIN GROUP
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        // CONTENT TYPE
        var typePanel = mainGroup.add("panel", undefined, "Content Type");
        typePanel.orientation = "column";
        typePanel.alignChildren = "left";

        var mixedRadio = typePanel.add("radiobutton", undefined, "Images + Videos");
        var imageRadio = typePanel.add("radiobutton", undefined, "Images Only");
        var videoRadio = typePanel.add("radiobutton", undefined, "Videos Only");

        mixedRadio.value = true;

        // ORDER
        var orderPanel = mainGroup.add("panel", undefined, "Layer Order");
        orderPanel.orientation = "column";
        orderPanel.alignChildren = "left";

        var bottomRadio = orderPanel.add("radiobutton", undefined, "Bottom to Top");
        var topRadio = orderPanel.add("radiobutton", undefined, "Top to Bottom");

        bottomRadio.value = true;

        // DURATIONS
        var durationPanel = mainGroup.add("panel", undefined, "Durations (Seconds)");
        durationPanel.orientation = "column";
        durationPanel.alignChildren = ["fill", "top"];

        function addInput(panel, label, defaultValue) {
            var group = panel.add("group");
            group.orientation = "row";
            group.add("statictext", undefined, label);
            var input = group.add("edittext", undefined, defaultValue);
            input.characters = 8;
            return input;
        }

        var imageDurationInput = addInput(durationPanel, "Image Duration:", "6");
        var videoDurationInput = addInput(durationPanel, "Max Video Duration:", "15");
        var fadeDurationInput = addInput(durationPanel, "Fade Duration:", "1");
        var lastHoldInput = addInput(durationPanel, "Last Layer Hold:", "7");

        // TRANSITIONS
        var transitionPanel = mainGroup.add("panel", undefined, "Transition Type");
        transitionPanel.orientation = "column";
        transitionPanel.alignChildren = ["fill", "top"];

        var transitionDropdown = transitionPanel.add("dropdownlist", undefined, [
            "Fade",
            "Fade + Scale",
            "Fade + Slide Left",
            "Fade + Slide Right",
            "Fade + Zoom In",
            "Fade + Zoom Out"
        ]);

        transitionDropdown.selection = 0;

        // OPTIONS
        var optionsPanel = mainGroup.add("panel", undefined, "Options");
        optionsPanel.orientation = "column";
        optionsPanel.alignChildren = "left";

        var trimVideosCheckbox = optionsPanel.add(
            "checkbox",
            undefined,
            "Trim videos to max duration"
        );
        trimVideosCheckbox.value = true;

        var clearKeysCheckbox = optionsPanel.add(
            "checkbox",
            undefined,
            "Clear existing opacity/transform keys"
        );
        clearKeysCheckbox.value = true;

        var trimCompCheckbox = optionsPanel.add(
            "checkbox",
            undefined,
            "Trim comp to exact end of last layer"
        );
        trimCompCheckbox.value = true;

        // BUTTON
        var runButton = mainGroup.add("button", undefined, "Build Slideshow");

        // LOGIC
        runButton.onClick = function() {

            app.beginUndoGroup("Build Slideshow");

            var comp = app.project.activeItem;

            if (!(comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }

            var layers = comp.selectedLayers;

            if (layers.length === 0) {
                alert("Please select layers.");
                return;
            }

            var IMAGE_DURATION = parseFloat(imageDurationInput.text);
            var VIDEO_DURATION = parseFloat(videoDurationInput.text);
            var FADE_DURATION = parseFloat(fadeDurationInput.text);
            var LAST_HOLD = parseFloat(lastHoldInput.text);

            var transitionType = transitionDropdown.selection.text;

            // SORTING
            if (bottomRadio.value) {
                layers.sort(function(a, b) {
                    return b.index - a.index;
                });
            } else {
                layers.sort(function(a, b) {
                    return a.index - b.index;
                });
            }

            var currentTime = 0;
            var lastLayerStart = 0;
            var lastLayerDuration = 0;
            var lastLayerWasVideo = false;

            for (var i = 0; i < layers.length; i++) {

                var layer = layers[i];
                var isVideo = false;
                var name = "";

                if (layer.source) {
                    name = layer.source.name.toLowerCase();
                }

                var videoExtensions = [
                    ".mp4",
                    ".mov",
                    ".avi",
                    ".mxf",
                    ".mkv",
                    ".webm"
                ];

                for (var v = 0; v < videoExtensions.length; v++) {
                    if (name.indexOf(videoExtensions[v]) !== -1) {
                        isVideo = true;
                        break;
                    }
                }

                // FILTER TYPES
                if (imageRadio.value && isVideo) {
                    continue;
                }

                if (videoRadio.value && !isVideo) {
                    continue;
                }

                // POSITION LAYER
                layer.startTime = currentTime;
                var layerDuration;

                // VIDEOS
                if (isVideo) {
                    lastLayerWasVideo = true;
                    if (trimVideosCheckbox.value) {
                        layerDuration = Math.min(layer.source.duration, VIDEO_DURATION);
                    } else {
                        layerDuration = layer.source.duration;
                    }
                    layer.outPoint = layer.inPoint + layerDuration;
                }
                // IMAGES
                else {
                    lastLayerWasVideo = false;
                    layerDuration = IMAGE_DURATION;
                    layer.outPoint = layer.inPoint + layerDuration;
                }

                // SAVE LAST
                lastLayerStart = currentTime;
                lastLayerDuration = layerDuration;

                // CLEAR KEYS
                var opacity = layer.property("Transform").property("Opacity");
                var position = layer.property("Transform").property("Position");
                var scale = layer.property("Transform").property("Scale");

                if (clearKeysCheckbox.value) {
                    while (opacity.numKeys > 0) { opacity.removeKey(1); }
                    while (position.numKeys > 0) { position.removeKey(1); }
                    while (scale.numKeys > 0) { scale.removeKey(1); }
                }

                // FADE
                opacity.setValueAtTime(currentTime, 0);
                opacity.setValueAtTime(currentTime + FADE_DURATION, 100);
                opacity.setValueAtTime(currentTime + layerDuration - FADE_DURATION, 100);
                opacity.setValueAtTime(currentTime + layerDuration, 0);

                // TRANSITIONS
                if (transitionType === "Fade + Scale") {
                    scale.setValueAtTime(currentTime, [110, 110]);
                    scale.setValueAtTime(currentTime + FADE_DURATION, [100, 100]);
                }

                if (transitionType === "Fade + Zoom In") {
                    scale.setValueAtTime(currentTime, [100, 100]);
                    scale.setValueAtTime(currentTime + layerDuration, [115, 115]);
                }

                if (transitionType === "Fade + Zoom Out") {
                    scale.setValueAtTime(currentTime, [115, 115]);
                    scale.setValueAtTime(currentTime + layerDuration, [100, 100]);
                }

                if (transitionType === "Fade + Slide Left") {
                    var pos = position.value;
                    position.setValueAtTime(currentTime, [pos[0] + 150, pos[1]]);
                    position.setValueAtTime(currentTime + FADE_DURATION, [pos[0], pos[1]]);
                }

                if (transitionType === "Fade + Slide Right") {
                    var pos2 = position.value;
                    position.setValueAtTime(currentTime, [pos2[0] - 150, pos2[1]]);
                    position.setValueAtTime(currentTime + FADE_DURATION, [pos2[0], pos2[1]]);
                }

                // NEXT LAYER
                currentTime += (layerDuration - FADE_DURATION);
            }

            // COMP DURATION
            if (trimCompCheckbox.value) {
                comp.duration = lastLayerStart + lastLayerDuration;
            } else {
                if (lastLayerWasVideo) {
                    comp.duration = lastLayerStart + lastLayerDuration;
                } else {
                    comp.duration = lastLayerStart + LAST_HOLD;
                }
            }

            app.endUndoGroup();
            alert("Slideshow complete.");
        };

        // FOOTER (LINK)
        var footerGroup = mainGroup.add("group");
        footerGroup.orientation = "row";
        footerGroup.alignment = ["center", "bottom"];
        footerGroup.margins.top = 10;

        var creditText = footerGroup.add("statictext", undefined, "Created by JoeMighty");
        creditText.helpTip = "Click to visit GitHub profile";
        
        // Attempt to style text to look clickable (Works in newer AE versions)
        try {
            creditText.graphics.foregroundColor = creditText.graphics.newPen(creditText.graphics.PenType.SOLID_COLOR, [0.3, 0.6, 1], 1);
        } catch (e) {}

        creditText.addEventListener("mousedown", function(event) {
            if (event.button === 0) { // Left click
                var url = "https://github.com/JoeMighty/";
                if ($.os.indexOf("Windows") !== -1) {
                    system.callSystem('cmd.exe /c "explorer ' + url + '"');
                } else {
                    system.callSystem('open "' + url + '"');
                }
            }
        });

        // RESIZE
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function() {
            this.layout.resize();
        };

        return win;
    }

    var myUI = buildUI(thisObj);

    if (myUI instanceof Window) {
        myUI.center();
        myUI.show();
    }

})(this);
