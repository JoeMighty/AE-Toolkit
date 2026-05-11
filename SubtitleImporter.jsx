/*
AE Dockable Subtitle Importer
Parses an SRT file and creates a text layer with source text keyframes.
*/
(function subtitleImporter(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Subtitle Importer", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var runButton = mainGroup.add("button", undefined, "Select .SRT File & Import");

        function parseTime(timeStr) {
            // Parses SRT time format: 00:00:00,000 to seconds
            var parts = timeStr.split(",");
            var timeParts = parts[0].split(":");
            var hours = parseInt(timeParts[0], 10);
            var minutes = parseInt(timeParts[1], 10);
            var seconds = parseInt(timeParts[2], 10);
            var milliseconds = parseInt(parts[1], 10);
            return (hours * 3600) + (minutes * 60) + seconds + (milliseconds / 1000);
        }

        runButton.onClick = function() {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Please select a composition first."); return; }

            var srtFile = File.openDialog("Select an SRT file", "*.srt", false);
            if (!srtFile) return;

            app.beginUndoGroup("Import Subtitles");

            srtFile.open("r");
            var content = srtFile.read();
            srtFile.close();

            // Regex to match SRT blocks
            var regex = /(\d+)\s+(\d{2}:\d{2}:\d{2},\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\n{2,}|\n*$)/g;
            var match;
            
            var textLayer = comp.layers.addText("Subtitles");
            var sourceTextProp = textLayer.property("Source Text");

            var keyTimes = [];
            var keyTexts = [];

            while ((match = regex.exec(content)) !== null) {
                var startTime = parseTime(match[2]);
                var endTime = parseTime(match[3]);
                var textValue = match[4].replace(/\n/g, "\r"); // Fix line breaks for AE

                keyTimes.push(startTime);
                keyTexts.push(textValue);
                
                // Add a blank keyframe to clear text when subtitle ends
                keyTimes.push(endTime);
                keyTexts.push(""); 
            }

            if (keyTimes.length > 0) {
                sourceTextProp.setValuesAtTimes(keyTimes, keyTexts);
                
                // Set all keyframes to Hold so they don't interpolate
                for (var i = 1; i <= sourceTextProp.numKeys; i++) {
                    sourceTextProp.setInterpolationTypeAtKey(i, KeyframeInterpolationType.HOLD, KeyframeInterpolationType.HOLD);
                }
            }

            app.endUndoGroup();
            alert("Subtitles imported successfully.");
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
