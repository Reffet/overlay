var vueData = null;

function init() {

//----------------------------------------------------------------------------------------
// Vueオブジェクトの生成
//----------------------------------------------------------------------------------------
vueData = new Vue({
	el : "body",
	data : {
		encounter : null,
		combatant : null,
		nodata    : nodata,
		barGuide  : barGuide,
		checkBox  : changeMode,
		mode      : windowMode,
		maxDps    : 0,
		maxHps    : 0
	},
	attached : function() {
		document.addEventListener("onOverlayDataUpdate", this.setTimer);
		document.addEventListener("onOverlayStateUpdate", this.updateState);
	},
	detached : function() {
		document.removeEventListener("onOverlayStateUpdate", this.updateState);
		document.removeEventListener("onOverlayDataUpdate", this.setTimer);
	},
	methods : {
		getBackClass     : getBackClass,
		setTimer         : setTimer,
		update           : update,
		updateState      : updateState,
		hideBody         : resetData,
		changeJobToRole  : changeJobToRole,
		hpsOn            : hpsOn,
		damageOn         : damageOn,
		getDpsBarWidth   : getDpsBarWidth,
		getHpsBarWidth   : getHpsBarWidth,
		isDpsBar         : isDpsBar,
		isHpsBar         : isHpsBar,
		getNameColor     : getNameColor,
		getTohitColor    : getTohitColor,
		getIconName      : jobIcon,
		getCharName      : getDisplayName
	}
});

if (debug) {
	// Dispatch OverlayDataUpdate Event
	var debugEvent = document.createEvent("CustomEvent");
	debugEvent.initCustomEvent("onOverlayDataUpdate", false, true, debugData);
	document.dispatchEvent(debugEvent);

	// 秒間隔でデータを切り替え
	var cnt = 0;
	if (loop > 0) {
		setInterval(function() {
			var cntVal = "";
			if ((cnt % 2) == 1) {
				cntVal = "2"
			}
			var evalData = eval("debugData" + cntVal);
			debugEvent = document.createEvent("CustomEvent");
			debugEvent.initCustomEvent("onOverlayDataUpdate", false, true, evalData);
			document.dispatchEvent(debugEvent);
			cnt++;
		}, loop * 1000);
	}
}
}
