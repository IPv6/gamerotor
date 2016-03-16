<?php

	header('Content-type: text/html; charset=utf-8');
	define('CONST_MAGIC_PASSWRD',"Qe234SER@3");
	function coalesce_str($val){
		if(@$val == NULL){
			return "";
		}
		return $val;
	}
	session_start(); 
	$config = dirname(__FILE__) . '/config.php';
	
	require_once( "Hybrid/Auth.php" );
	$error_occured = 0;
	try{

		$hybridauth = new Hybrid_Auth( $config );
		$provname = coalesce_str(@$_GET["provider"]);
		if(strlen($provname) == 0){
			$provname = "Facebook";
		}
		
		$debug_err = "";
		$provider = $hybridauth->authenticate( $provname );
		try {
			$user_profile = $provider->getUserProfile();
			
			$userName = coalesce_str($user_profile->displayName);
			$identifier = coalesce_str($user_profile->identifier);
			$userEmail = coalesce_str($user_profile->emailVerified);
			$photoURL = coalesce_str($user_profile->photoURL);
			$gender = coalesce_str($user_profile->gender);
			$profileURL = coalesce_str($user_profile->profileURL);
			$description = coalesce_str($user_profile->description);
			$firstName = coalesce_str($user_profile->firstName);
			$lastName = coalesce_str($user_profile->lastName);
			$language = coalesce_str($user_profile->language);
			$age = coalesce_str($user_profile->age);
			$birthDay = coalesce_str($user_profile->birthDay);
			$birthMonth = coalesce_str($user_profile->birthMonth);
			$birthYear = coalesce_str($user_profile->birthYear);
			$country = coalesce_str($user_profile->country);
			$city = coalesce_str($user_profile->city);
		} catch (Exception $e) {
			$debug_err .= "GETPROFFAIL:".$e->getCode() . "/" . $e->getMessage();
			$error_occured = 1;
		}
		// post-fixes
		if(strlen($userName) == 0 && strlen($user_profile->firstName)>0 ){
			$userName = coalesce_str($user_profile->firstName);
			if(strlen(coalesce_str($user_profile->lastName))>0 ){
				$userName = $userName." ".$user_profile->lastName;
			}
		}
		if(strlen($userEmail) == 0){
			$userEmail = coalesce_str($user_profile->email);
		}
		$provhash = md5($identifier.$userEmail.CONST_MAGIC_PASSWRD);
		// grab the user's friends list
		$friends_ids = "";
		try {
			$max_friends = 50;
			$user_contacts = $provider->getUserContacts();
			foreach( $user_contacts as $contact ){
				if(strlen($friends_ids) > 0){
					$friends_ids .= ",";
				}
				$friends_ids .= coalesce_str($contact->identifier);
				$max_friends--;
				if($max_friends<=0){
					break;
				}
			}
		} catch (Exception $e) {
			$debug_err .= "GETFRNFAIL:".$e->getCode() . "/" . $e->getMessage();
		}
		
	}
	catch( Exception $e ){
		$debug_err .= "FAIL:".$e->getCode() . "/" . $e->getMessage();
		$error_occured = 1;
	}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="ru" xmlns:og="http://opengraphprotocol.org/schema/" itemscope itemtype="http://schema.org/Article" 
xmlns:fb="http://www.facebook.com/2008/fbml" 
xmlns:fb="http://ogp.me/ns/fb#"><!-- Обявление стандарта. Не убирать! -->
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script type="text/javascript" src="http://static.gamerotor.com/scripts/sites/jquery/jquery.storage.js"></script>
<script type="text/javascript" src="http://static.gamerotor.com/scripts/sites/jquery/jquery.json-2.2.min.js"></script>

<title>GameRotor</title>
<meta name="robots" content="index, follow" />
<meta name="RATING" content="General" />
<script>
	var profile = {};
	profile.provider = "<?= $provname ?>";
	profile.identifier = "<?= $identifier ?>";
	profile.email = "<?= $userEmail ?>";
	profile.displayName = "<?= $userName ?>";
	profile.photoURL = "<?= $photoURL ?>";
	profile.gender = "<?= $gender ?>";
	profile.profileURL = "<?= $profileURL ?>";
	profile.firstName = "<?= $firstName ?>";
	profile.lastName = "<?= $lastName ?>";
	profile.language = "<?= $language ?>";
	profile.birthDate = ["<?= $age ?>","<?= $birthDay ?>","<?= $birthMonth ?>","<?= $birthYear ?>"];
	profile.place = ["<?= $city ?>","<?= $country ?>"];
	profile.friends = "<?= $friends_ids ?>";
	profile._t = "<?= $provhash ?>";
	<?
	if($error_occured != "0"){
		echo "profile.error = '".$error_occured."';\n";
		echo "profile.error_desc = '".$debug_err."';\n";
	}
	?>
</script>
</head>
<body>
<div style="text-align:center;padding-top:150px;" id="infomsg">
Please wait, establishing connection...
<br><br>
<img id="waiter_panel_messages" src="http://lh5.googleusercontent.com/-l_WwKQnf2SQ/UF8LvCjtNyI/AAAAAAAAARg/YNAzjesuOlc/w497-h373/image_292913.gif">
</div>
<iframe id="stupidiehack" src="" style="display:none;"></iframe>
<script>
	function getQueryString() {
		// This function is anonymous, is executed immediately and 
		// the return value is assigned to QueryString!
		var query_string = {};
		var query = window.location.search.substring(1);
		var vars = query.split("&");
		for (var i=0;i<vars.length;i++) {
		var pair = vars[i].split("=");
			// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
		  query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
		  var arr = [ query_string[pair[0]], pair[1] ];
		  query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
		  query_string[pair[0]].push(pair[1]);
		}
		} 
		return query_string;
	};
	var error_occured = "<?= $error_occured ?>";
	var doIframetrick = false;
	var cmd = {};
	cmd.profile = profile;
	cmd.m = "provider_data";
	var msg = $.toJSON(cmd);
	try{
		window.opener.postMessage(msg, "*");//window.parent.location
	}catch(e){
		doIframetrick = true;
	};
	if(doIframetrick){
		error_occured = "-1";
		//$('#stupidiehack').prop("src","javascript:(function(){document.open();alert(\"gamerotor.com\");document.write('alert(2);');document.close();})();");
		//window.parent.opener.postMessage(\"1\", \"*\");alert(3);
		//document.domain=\"gamerotor.com\";
		//unescape(\""+escape(msg)+"\")
		var url_map = getQueryString();
		var cb_url = unescape(url_map['ie9stub']);
		if(cb_url && cb_url.length>0){
			$('#stupidiehack').prop("src",cb_url+"?msg="+escape(msg));//"http://www.gamerotor.com/js/iframe_cb.html
		}
	}
	// Note: Window must be closed by calling window after postback is received
	if(error_occured != "0"){
		try{
			var err = "<?= $debug_err ?>";
			if(err.length>0){
				console.log(err);
			}
		}catch(e){};
		if(error_occured != "-1"){
			$('#infomsg').html("Provider is currently down. Please use another provider.");
		}
	}
</script>
</body>
</html>
