/*--------------------------------------------------------------------------------------------------------
  display settings
--------------------------------------------------------------------------------------------------------*/
var timeout = 30;		// 更新がなくなってから非表示にするまでの時間（秒）
var nodata = true;		// データがない場合に「no data available」を表示するかどうか（true/false）
var barGuide = true;	// dps, hpsガイドバーを表示する（true/false）
var windowMode = false;	// ウィンドウモード（true/false）
var changeMode = true;	// ウィンドウモード切替用チェックボックスを表示する（true/false）
var debug = false;		// デバッグモード
var loop = 0;			// デバッグデータ更新時間（秒）　※デバッグモードtrueの場合に有効

/*--------------------------------------------------------------------------------------------------------
  definition
--------------------------------------------------------------------------------------------------------*/
var tankNames = ["Gla", "Pld", "Mrd", "War", "Drk", "Gnb"];
var dpsNames = ["Pgl", "Mnk", "Lnc", "Drg", "Arc", "Brd", "Rog", "Nin", "Mch", "Acn", "Smn", "Thm", "Blm", "Sam", "Rdm", "Blu", "Dnc"];
var healerNames = ["Cnj", "Whm", "Sch", "Ast"];

var nameAsHealer = "フェアリー";

/*--------------------------------------------------------------------------------------------------------
  functions
--------------------------------------------------------------------------------------------------------*/

/**
 * return window mode css class.
 */
function getBackClass() {

	var backClass = "";
	if (this.mode) {
		backClass = "back";
	}
	return backClass;
}

/** hidden timer id */
var timeoutId = null;

/**
 * set hidden timer.
 */
function setTimer(e) {
	this.update(e.detail);
	if (timeout != 0) {
		if (timeoutId != null) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(this.hideBody, timeout * 1000);
	}
}

/**
 * update vue data.
 */
function update(data) {
	var combatant = data.Combatant;

	var dpsArray = new Array();
	var hpsArray = new Array();

	for (var pcName in combatant) {

		// translate "%" to "Pct"
		for(var key in combatant[pcName]) {
			var newKey = key.replace("%", "Pct");
			var newValue = combatant[pcName][key];
			delete combatant[pcName][key];
			combatant[pcName][newKey] = newValue;
		}
	}
	data.Combatant = combatant;

	for (var pcName in combatant) {
		dpsArray.push(Number(combatant[pcName].encdps));
		hpsArray.push(Number(combatant[pcName].enchps));
	}

	// select max dps & max hps
	this.maxDps = Math.max.apply(null, dpsArray);
	this.maxHps = Math.max.apply(null, hpsArray);

	vueData.combatant = data.Combatant;
	vueData.encounter = data.Encounter;
}

/**
 * update resizehandle state.
 */
function updateState(e) {
	if (!e.detail.isLocked) {
		document.documentElement.classList.add("resizeHandle");
	} else {
		document.documentElement.classList.remove("resizeHandle");
	}
}

/**
 * reset vue data.
 */
function resetData() {
	this.encounter = null;
	this.combatant = null;
}

/**
 * translate job to role.
 */
function changeJobToRole(charData) {
	var roleName = "";
	if (dpsNames.indexOf(charData.Job) > -1) {
		roleName = "dps";
	} else if (tankNames.indexOf(charData.Job) > -1) {
		roleName = "tank";
	} else if (healerNames.indexOf(charData.Job) > -1) {
		roleName = "healer";
	} else {
		if(charData.name.indexOf(nameAsHealer) > -1) {
			roleName = "other1";
		} else {
			roleName = "other2";
		}
	}
	return roleName;
}

function damageOn(charData) {
	if (this.changeJobToRole(charData) == "tank" || this.changeJobToRole(charData) == "dps") {
		return true;
	}
	return false;
}

/**
 * return is hps display.
 */
function hpsOn(charData) {
	if (this.changeJobToRole(charData) == "healer" || this.changeJobToRole(charData) == "other1") {
		return true;
	}
	return false;
}

/**
 * return damage bar width.
 */
function getDmgBarWidth(charData) {
   return charData.damagePct;
}

/**
 * return dps bar width.
 */
function getDpsBarWidth(charData) {
   return ((charData.encdps / this.maxDps) * 100) + "%";
}

/**
 * return is dps bar display.
 */
function isDpsBar(charData) {
	return (((charData.encdps / this.maxDps) * 100) > 0) ? true: false;
}
/**
 * return hps bar width.
 */
function getHpsBarWidth(charData) {
   return ((charData.enchps / this.maxHps) * 100) + "%";
}

/**
 * return is hps bar display.
 */
function isHpsBar(charData) {
	return (((charData.enchps / this.maxHps) * 100) > 0) ? true: false;
}

/**
 * return name color css.
 */
function getNameColor(charData) {
	var color = ""
	if (charData.name == "YOU") {
		color = "myColor";
	}
	if (charData.deaths > 0) {
		color = "deadYatsu";
	}
	return color;
}

/**
 * return tohit css class under 100%.
 */
function getTohitColor(charData) {
	if (charData.tohit != "100.00") {
		return "warning";
	}
	return "";
}

/**
 * return display charactor name.
 */
function getDisplayName(charData) {
	return kanaConverter.convertKanaToOneByte(charData.name);
}

/**
 * return job icon name.
 */
function jobIcon(charData) {
	var owner = charData.name.match(/[(](.+)[)]/);
	if (charData["Job"] != "") {
		return charData["Job"];
	} else {
		if (charData.name.indexOf("ガルーダ・エギ") == 0) {
			return "Gar";
		} else if (charData.name.indexOf("イフリート・エギ") == 0) {
			return "Ifr";
		} else if (charData.name.indexOf("タイタン・エギ") == 0) {
			return "Tit";
		} else if (charData.name.indexOf("フェアリー・エオス") == 0) {
			return "Eos";
		} else if (charData.name.indexOf("フェアリー・セレネ") == 0) {
			return "Sle";
		} else if (charData.name.indexOf("カーバンクル・エメラルド") == 0) {
			return "Eme";
		} else if (charData.name.indexOf("カーバンクル・トパーズ") == 0) {
			return "Tpz";
		} else if (charData.name.indexOf("オートタレット・ルーク") === 0) {
			return "Atr";
		} else if (charData.name.indexOf("オートタレット・ビショップ") === 0) {
			return "Atb";
		} else if (charData.name.indexOf("Limit Break") === 0) {
			return "Ltb";
		} else if (owner != null && !charData.name.match(/[^a-zA-Z()'\s]/)) {
			return "Cho";
		} else {
			return "";
		}
	}
};

/**
 * kana converter
 */
var kanaConverter = (function() {

	/**
	 * create kana mapping
	 */
	var createKanaMap = function(properties, values) {
		var kanaMap = {};
		if(properties.length === values.length) {
			for(var i=0, len=properties.length; i<len; i++) {
				var property= properties.charCodeAt(i),
						value = values.charCodeAt(i);
				kanaMap[property] = value;
			}
		}
		return kanaMap;
	};

	// mapping double byte to single byte.
	var m = createKanaMap(
		'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォッャュョ・',
		'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｯｬｭｮ･'
	);

	// mapping double byte to single byte.
	var g = createKanaMap(
		'ガギグゲゴザジズゼゾダヂヅデドバビブベボ',
		'ｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾊﾋﾌﾍﾎ'
	);

	// mapping double byte to single byte.
	var p = createKanaMap(
		'パピプペポ',
		'ﾊﾋﾌﾍﾎ'
	);

	// mapping single byte to double byte.
	var pp = createKanaMap(
		'ﾊﾋﾌﾍﾎ',
		'パピプペポ'
	);

	var gMark = 'ﾞ'.charCodeAt(0);
	var pMark = 'ﾟ'.charCodeAt(0);

	return {

		/**
		 * traslate double byte to single byte.
		 * @param	{[type]} str double byte string.
		 * @return {[type]}		 single byte string.
		 */
		convertKanaToOneByte : function(str) {
			for(var i = 0, len = str.length; i < len; i++) {
				if(g.hasOwnProperty(str.charCodeAt(i)) || p.hasOwnProperty(str.charCodeAt(i))) {
					if(g[str.charCodeAt(i)]) {
						str = str.replace(str[i], String.fromCharCode(g[str.charCodeAt(i)])+String.fromCharCode(gMark));
					}
					else if(p[str.charCodeAt(i)]) {
						str = str.replace(str[i], String.fromCharCode(p[str.charCodeAt(i)])+String.fromCharCode(pMark));
					} else {
						break;
					}
					i++;
					len = str.length;
				} else {
					if(m[str.charCodeAt(i)]) {
						str = str.replace(str[i], String.fromCharCode(m[str.charCodeAt(i)]));
					}
				}
			}
			return str;
		}
	};
}) ();

//-------------------------------------------------------------------------------------------------------
// debugging data
//-------------------------------------------------------------------------------------------------------
var debugData = {
	"Encounter": {
		"title"        : "サンプル",
		"area"         : "AREA",
		"duration"     : "3:50",
		"ENCDPS"       : "9115",
		"ENCHPS"       : "1954"
	},
	"Combatant": {
		"PLAYER6": {
			"name"     : "PLAYER6",
			"Job"      : "Blm",
			"encdps"   : "1843",
			"damage%"  : "20%",
			"crithit%" : "18%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER3": {
			"name"     : "PLAYER3",
			"Job"      : "Drg",
			"encdps"   : "1751",
			"damage%"  : "19%",
			"crithit%" : "27%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER4": {
			"name"     : "PLAYER4",
			"Job"      : "Nin",
			"encdps"   : "1651",
			"damage%"  : "18%",
			"crithit%" : "28%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER5": {
			"name"     : "PLAYER5",
			"Job"      : "Dnc",
			"encdps"   : "1574",
			"damage%"  : "17%",
			"crithit%" : "32%",
			"tohit"    : "100.00",
			"enchps"   : "",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "1",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER2": {
			"name"     : "PLAYER2",
			"Job"      : "Gnb",
			"encdps"   : "930",
			"damage%"  : "10%",
			"crithit%" : "20%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "7%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER1": {
			"name"     : "YOU",
			"Job"      : "Drk",
			"encdps"   : "754",
			"damage%"  : "8%",
			"crithit%" : "17%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "16%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER8": {
			"name"     : "PLAYER8",
			"Job"      : "Sch",
			"encdps"   : "412",
			"damage%"  : "4%",
			"crithit%" : "17%",
			"tohit"    : "99.96",
			"enchps"   : "721",
			"healed%"  : "21%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "5,256",
			"MAXHEAL"  : "7,892",
			"OverHealPct" : "21%",
			"critheal%" : "25%",
			"DAMAGE-k" : "250"
		},
		"PLAYER7": {
			"name"     : "PLAYER7",
			"Job"      : "Ast",
			"encdps"   : "200",
			"damage%"  : "2%",
			"crithit%" : "11%",
			"tohit"    : "96.43",
			"enchps"   : "788",
			"healed%"  : "40%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "4,256",
			"MAXHEAL"  : "12,651",
			"OverHealPct" : "37%",
			"critheal%" : "25%",
			"DAMAGE-k" : "250"
		},
		"PLAYER9": {
			"name"     : "フェアリー・エオス(PLAYER8)",
			"Job"      : "",
			"encdps"   : "0",
			"damage%"  : "50%",
			"crithit%" : "10%",
			"tohit"    : "--",
			"enchps"   : "445",
			"healed%"  : "22%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "0",
			"MAXHEAL"  : "4,512",
			"OverHealPct" : "15%",
			"critheal%" : "25%",
			"DAMAGE-k" : "250"
		},
		"PLAYER10": {
			"name"     : "オートタレット・ルーク(PLAYER5)",
			"Job"      : "",
			"encdps"   : "120",
			"damage%"  : "50%",
			"crithit%" : "10%",
			"tohit"    : "---",
			"enchps"   : "445",
			"healed%"  : "22%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "1,256",
			"MAXHEAL"  : "0",
			"OverHealPct" : "15%",
			"DAMAGE-k" : "250"
		},
		"PLAYER11": {
			"name"     : "ガルーダ・エギ",
			"Job"      : "",
			"encdps"   : "453",
			"damage%"  : "50%",
			"crithit%" : "10%",
			"tohit"    : "---",
			"enchps"   : "445",
			"healed%"  : "22%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "2,341",
			"MAXHEAL"  : "0",
			"OverHealPct" : "15%",
			"DAMAGE-k" : "250"
		}
	}
};

var debugData2 = {
	"Encounter": {
		"title"        : "サンプル",
		"area"         : "AREA",
		"duration"     : "3:50",
		"ENCDPS"       : "9115",
		"ENCHPS"       : "1954"
	},
	"Combatant": {
		"PLAYER6": {
			"name"     : "PLAYER6",
			"Job"      : "Blm",
			"encdps"   : "2443",
			"damage%"  : "20%",
			"crithit%" : "18%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER3": {
			"name"     : "PLAYER3",
			"Job"      : "Drg",
			"encdps"   : "2251",
			"damage%"  : "19%",
			"crithit%" : "27%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER4": {
			"name"     : "PLAYER4",
			"Job"      : "Nin",
			"encdps"   : "2051",
			"damage%"  : "18%",
			"crithit%" : "28%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER5": {
			"name"     : "PLAYER5",
			"Job"      : "Mch",
			"encdps"   : "2174",
			"damage%"  : "17%",
			"crithit%" : "32%",
			"tohit"    : "100.00",
			"enchps"   : "",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "1",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER2": {
			"name"     : "PLAYER2",
			"Job"      : "War",
			"encdps"   : "1369",
			"damage%"  : "10%",
			"crithit%" : "20%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "7%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER1": {
			"name"     : "YOU",
			"Job"      : "Drk",
			"encdps"   : "1241",
			"damage%"  : "8%",
			"crithit%" : "17%",
			"tohit"    : "100.00",
			"enchps"   : "0",
			"healed%"  : "0%",
			"BlockPct" : "0%",
			"ParryPct" : "16%",
			"deaths"   : "0",
			"MAXHIT"   : "3,256",
			"MAXHEAL"  : "0",
			"DAMAGE-k" : "250"
		},
		"PLAYER8": {
			"name"     : "PLAYER8",
			"Job"      : "Sch",
			"encdps"   : "614",
			"damage%"  : "4%",
			"crithit%" : "17%",
			"tohit"    : "99.96",
			"enchps"   : "1781",
			"healed%"  : "21%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "5,256",
			"MAXHEAL"  : "7,651",
			"OverHealPct" : "21%",
			"critheal%" : "25%",
			"DAMAGE-k" : "250"
		},
		"PLAYER7": {
			"name"     : "PLAYER7",
			"Job"      : "Ast",
			"encdps"   : "200",
			"damage%"  : "2%",
			"crithit%" : "11%",
			"tohit"    : "96.43",
			"enchps"   : "2881",
			"healed%"  : "40%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "4,256",
			"MAXHEAL"  : "12,651",
			"OverHealPct" : "37%",
			"critheal%" : "25%",
			"DAMAGE-k" : "250"
		},
		"PLAYER9": {
			"name"     : "フェアリー・エオス",
			"Job"      : "",
			"encdps"   : "0",
			"damage%"  : "50%",
			"crithit%" : "10%",
			"tohit"    : "--",
			"enchps"   : "1021",
			"healed%"  : "22%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "0",
			"MAXHEAL"  : "4,512",
			"OverHealPct" : "15%",
			"critheal%" : "25%",
			"DAMAGE-k" : "250"
		},
		"PLAYER10": {
			"name"     : "オートタレット・ルーク(PLAYER5)",
			"Job"      : "",
			"encdps"   : "288",
			"damage%"  : "50%",
			"crithit%" : "10%",
			"tohit"    : "---",
			"enchps"   : "445",
			"healed%"  : "22%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "1,256",
			"MAXHEAL"  : "0",
			"OverHealPct" : "15%",
			"DAMAGE-k" : "250"
		},
		"PLAYER11": {
			"name"     : "ガルーダ・エギ",
			"Job"      : "",
			"encdps"   : "475",
			"damage%"  : "50%",
			"crithit%" : "10%",
			"tohit"    : "---",
			"enchps"   : "445",
			"healed%"  : "22%",
			"BlockPct" : "0%",
			"ParryPct" : "0%",
			"deaths"   : "0",
			"MAXHIT"   : "2,341",
			"MAXHEAL"  : "0",
			"OverHealPct" : "15%",
			"DAMAGE-k" : "250"
		}
	}
};
