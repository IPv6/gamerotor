var gr_web_config = {
	api_url: "http://game-rotor.appspot.com/libs3sn/gr_web_ru/",
	google_analytics_key: 'UA-48269933-1',
	app_id: "gr_web",
	widget_urls:{
		"al_gr":{
			game:"http://www.lumarnia.com/index_game.html"
			, login:"http://www.lumarnia.com/index_rega.html"
			, invite: "http://www.lumarnia.com/index_rega.html?gr_refer=invite&gr_invby=%(uid)"
			, profile_edit:"http://www.lumarnia.com/index_game_profile.html?mode=edit"
			, profile_view:"http://www.lumarnia.com/index_game_profile.html?uid=%(uid)"
			, xsolla_id: 12337 // was: 8399
			, soc_install_Facebook:"https://apps.facebook.com/640524835964331/"
			, soc_install_Vkontakte:"http://vkontakte.ru/app2401707"
			, soc_install_Mailru:"http://my.mail.ru/apps/631783"
			, soc_install_Odnoklassniki:"http://www.odnoklassniki.ru/games/lumari"},
		"ldu_gr":{
			game:"http://www.kristallum.com/index_game.html"
			, login:"http://www.kristallum.com/index_rega.html"
			, invite: "http://www.kristallum.com/index_rega.html?gr_refer=invite&gr_invby=%(uid)"
			, profile_edit:"http://www.kristallum.com/index_game_profile.html?mode=edit"
			, profile_view:"http://www.kristallum.com/index_game_profile.html?uid=%(uid)"
			, xsolla_id: 11235
			, soc_install_Facebook:"https://apps.facebook.com/1388571444695451/"
			, soc_install_Vkontakte:"http://vkontakte.ru/app3739891"
			, soc_install_Mailru:"http://my.mail.ru/apps/707261"
			, soc_install_Odnoklassniki:"http://www.odnoklassniki.ru/games/kristallum"}
	}
}
$.gr_addConf(gr_web_config);