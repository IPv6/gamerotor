// Gamerotor social lame api
// jQuery,json,$i18n required
window.GamerotorServer = window.GamerotorServer || {};

GamerotorServer.ready = function() {
	return true;
}

GamerotorServer.client_location = null;
GamerotorServer.client_window = null;

GamerotorServer.BragAboutBrowser = function() {
	// Fuck old browsers
	core_log("GamerotorServer: BragAboutBrowser");
	alert($._b("Sorry, your browser is too old and not supported anymore"));
	alert($._b("Please use modern browser"));
	document.location = "http://www.browser-update.org/update.html";
}

window.__gr_onMessage = function(data) {
	core_log("GamerotorServer: __gr_onMessage",data);
	if(typeof(data) != "string" || data.indexOf("{") != 0){
		// Twitter, etc apis ALSO sends postMessages.. ignoring them
		// __ready__
		return;
	}
	var dataunjs = $.parseJSON(data);
	if(dataunjs != null && dataunjs.m != null){
		// parsing answer
		var answer = GamerotorServer.handleClientRequest(dataunjs.m, dataunjs);
		if(answer == null){
			return;
		}
		answer.c = dataunjs.c;
		GamerotorServer.sendToClient(answer);
	}
}
GamerotorServer.sendToClient = function(answer){
	if(GamerotorServer.client_window == null || GamerotorServer.client_location == null){
		alert("Error occured, please try later");
		return;
	}
	//core_log("GamerotorServer: __gr_onMessage result",answer);
	GamerotorServer.client_window.postMessage($.toJSON(answer),GamerotorServer.client_location);
}
GamerotorServer.BootstrapApi = function(focus_widget,config) {
	core_log("GamerotorServer.BootstrapApi");
	if(!window.postMessage){
		// Fuck old browsers
		GamerotorServer.BragAboutBrowser();
		return;
	}
	GamerotorServer.config = config;
	GamerotorServer.focus_widget = focus_widget;
	$(window).on("message", function(e) {
		try{
			var data = e.originalEvent.data;
			__gr_onMessage(data);
		}catch(e){
			core_log("GamerotorServer: failed to handle "+e,data);
			alert("Error occured, please try again.\n"+e+"\n\n"+$.toJSON(data));
		}
	});
}

GamerotorServer.jsonRqType = "json";
if ( $ && $.browser.msie ) {
	GamerotorServer.jsonRqType = "jsonp";
}
function __do_nothing(a,b,c) {};
GamerotorServer.QueryApi = function(meth,query_params,auth,onOk,onFail) {
	if(onFail == null){
		onFail = __do_nothing;
	}
	if(onOk == null){
		onOk = __do_nothing;
	}
	// Sending request
	query_params.method = meth;
	query_params.auth = auth; //$.Storage.get(CONST_JSSTORE_AUTH);
	var api_url = GamerotorServer.config["api_url"];
	$.ajax({
		url: api_url+((auth == null)?"open_api":"protected_api"),
		data: query_params,
		dataType: GamerotorServer.jsonRqType,
		type: 'post',
		async: true,
		crossDomain: true,
		success: function(json_response, textStatus, xhr) {
			if(core_coalesce(json_response.error_code,0) < 0){
				onFail(json_response);
				return;
			}
			onOk(json_response);
		},
		error: function(xhr, textStatus, errorThrown) {
			onFail({error_code: 503});
		}
	});
}

GamerotorServer.preloads = {};
GamerotorServer.setPreloadedApiAnswer = function(meth, data) {
	GamerotorServer.preloads[meth] = data;
}

GamerotorServer.handleClientRequest = function(meth, data) {
	var answer = {};
	if(meth == "init"){
		if(core_len(data.location)>0){
			answer.ok = 1;
			answer.url_profile_view = GamerotorServer.config["widget_urls"][GamerotorServer.focus_widget]["profile_view"];
			answer.url_profile_view = core_str_replace(answer.url_profile_view,"%(uid)","");
			var semihref = data.location;
			var semipart = semihref.indexOf("?");
			if(semipart >= 0){
				semihref = semihref.substring(0,semipart);
			}
			GamerotorServer.client_location = semihref;
			$("iframe").each(function(index) {
				if(this.contentWindow && this.src == data.location){
					GamerotorServer.client_window = this.contentWindow;
				}
			});
		}
	}
	if(meth == "provider_data"){
		if(GamerotorServer.config.onProviderData != null){
			GamerotorServer.config.onProviderData(data);
		}
		return null;
	}
	if(GamerotorServer.preloads[meth] != null){
		answer = GamerotorServer.preloads[meth];
		meth = "";
	}
	if(meth == "getProfiles"){
		answer.response = [];
		//answer.response.push({first_name:"ccc", last_name:"ccc", uid:"sdfsdfsdf",photo_rec:"http://l-userpic.livejournal.com/116243443/21331"}) //sex //bdate
	}
	if(meth == "friends.getAppUsers"){
		answer.response = [];
		//answer.response.push({first_name:"AAA", last_name:"BeeBB", uid:"SddDASD",photo_rec:"http://l-userpic.livejournal.com/116243443/21331"})
		//answer.response.push({first_name:"AAA", last_name:"BBffB", uid:"SDffSD",photo_rec:"http://l-userpic.livejournal.com/116243443/21331"})
	}
	if(meth == "friends.get"){
		answer.response = [];
		//answer.response.push({first_name:"AAA", last_name:"BBB", uid:"SDASD",photo_rec:"http://l-userpic.livejournal.com/116243443/21331"})
	}
	if(meth == "friends.invite"){
		if(GamerotorServer.config.onInivite != null){
			GamerotorServer.config.onInivite(GamerotorServer.focus_widget,data);
		}
	}
	if(meth == "stream.share"){
		if(GamerotorServer.config.onShare != null){
			GamerotorServer.config.onShare(GamerotorServer.focus_widget,data);
		}
	}
	if(meth == "payment"){
		if(GamerotorServer.config.onPayment != null){
			GamerotorServer.config.onPayment(GamerotorServer.focus_widget,data);
		}
	}
	return answer;
}