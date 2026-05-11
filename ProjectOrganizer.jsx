/*
AE Dockable Project Organizer
Organizes project panel items into logical folders.
*/
(function projectOrganizer(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Project Organizer", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var runButton = mainGroup.add("button", undefined, "Organize Project Bin");

        runButton.onClick = function() {
            app.beginUndoGroup("Organize Project");
            var proj = app.project;
            if (!proj) return;

            var folders = {
                "Compositions": null,
                "Video": null,
                "Audio": null,
                "Images": null,
                "Solids": null
            };

            // Find or create folders
            for (var f in folders) {
                var found = false;
                for (var i = 1; i <= proj.numItems; i++) {
                    if (proj.item(i) instanceof FolderItem && proj.item(i).name === f && proj.item(i).parentFolder === proj.rootFolder) {
                        folders[f] = proj.item(i);
                        found = true;
                        break;
                    }
                }
                if (!found) folders[f] = proj.items.addFolder(f);
            }

            // Move items
            for (var j = 1; j <= proj.numItems; j++) {
                var item = proj.item(j);
                if (item instanceof FolderItem) continue;

                if (item instanceof CompItem) {
                    item.parentFolder = folders["Compositions"];
                } else if (item instanceof FootageItem) {
                    if (item.mainSource instanceof SolidSource) {
                        item.parentFolder = folders["Solids"];
                    } else if (item.file) {
                        var name = item.name.toLowerCase();
                        if (name.match(/\.(mp4|mov|avi|mxf|webm)$/)) {
                            item.parentFolder = folders["Video"];
                        } else if (name.match(/\.(mp3|wav|aif|aac)$/)) {
                            item.parentFolder = folders["Audio"];
                        } else if (name.match(/\.(jpg|jpeg|png|psd|ai|gif|tif)$/)) {
                            item.parentFolder = folders["Images"];
                        }
                    }
                }
            }
            app.endUndoGroup();
            alert("Project Organized!");
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
