/*
AE Dockable Expression Injector
Injects common expressions into selected properties.
*/
(function expressionInjector(thisObj) {
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Expression Injector", undefined, {resizeable: true});
        var mainGroup = win.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "top"];

        var exprList = mainGroup.add("dropdownlist", undefined, ["Wiggle (Standard)", "Loop Out (Cycle)", "Loop Out (PingPong)", "Inertia Bounce", "Time x100"]);
        exprList.selection = 0;

        var applyButton = mainGroup.add("button", undefined, "Apply Expression");

        var expressions = [
            "wiggle(1, 20);",
            "loopOut('cycle');",
            "loopOut('pingpong');",
            "amp = .1; freq = 2.0; decay = 2.0; n = 0; if (numKeys > 0) { n = nearestKey(time).index; if (key(n).time > time) { n--; } } if (n == 0) { t = 0; } else { t = time - key(n).time; } if (n > 0 && t < 1) { v = velocityAtTime(key(n).time - thisComp.frameDuration/10); value + v*amp*Math.sin(freq*t*2*Math.PI)/Math.exp(decay*t); } else { value; }",
            "time * 100;"
        ];

        applyButton.onClick = function() {
            app.beginUndoGroup("Inject Expression");
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) { alert("Select a composition."); return; }
            var props = comp.selectedProperties;
            if (props.length === 0) { alert("Select a property to apply the expression."); return; }
            
            for (var i = 0; i < props.length; i++) {
                if (props[i].canSetExpression) {
                    props[i].expression = expressions[exprList.selection.index];
                }
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
