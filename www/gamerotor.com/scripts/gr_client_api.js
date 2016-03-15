// Gamerotor social lame api
// jQuery+json required!!!!!
window.GamerotorClient = window.GamerotorClient || {};

GamerotorClient._is_ready = false;
GamerotorClient.call_id = 0;
GamerotorClient.pending_calls = {};
GamerotorClient.callback_calls = {};
GamerotorClient.ready = function() {
	return GamerotorClient._is_ready;
}

GamerotorClient.init = function(api_origin,app_id,user_id,user_auth,onOk_cb1) {
	if(!top || !top.postMessage){
		// Fuck old browsers
		//alert("Sorry, your browser is not supported anymore.");
		//alert("Please use modern browser!");
		//document.location = "http://www.browser-update.org/update.html";
		return false;
	}
	GamerotorClient.app_id = app_id;
	GamerotorClient.user_id = user_id;
	GamerotorClient.user_auth = user_auth;
	GamerotorClient.api_origin = api_origin;
	$(window).on("message", function(e) {
		var data = e.originalEvent.data;
		var dataunjs = $.parseJSON(data);
		if(dataunjs != null && dataunjs.c != null){
			//core_log("GamerotorClient: answer received",dataunjs);
			var onOk = null;
			if(dataunjs.c<0){
				onOk = GamerotorClient.callback_calls[dataunjs.m];
			}else{
				onOk = GamerotorClient.pending_calls[dataunjs.c];
				GamerotorClient.pending_calls[dataunjs.c] = null;
			}
			if(onOk != null){
				onOk(dataunjs);
			}
		}
	});
	GamerotorClient.callApi("init",{location:document.location.href},onOk_cb1);
	GamerotorClient._is_ready = true;
	return true;
}

GamerotorClient.onApiMessage = function(message,onOk) {
	GamerotorClient.callback_calls[message] = onOk;
}

GamerotorClient.callApi = function(api_name,api_params,onOk_cb1) {
	var answer = {};
	var request = {};
	api_params.m = api_name;
	api_params.c = GamerotorClient.call_id;
	GamerotorClient.call_id = GamerotorClient.call_id+1;
	GamerotorClient.pending_calls[api_params.c] = onOk_cb1;
	//core_log("GamerotorClient: requesting api",api_params);
	top.postMessage($.toJSON(api_params),GamerotorClient.api_origin);
	return true;
}