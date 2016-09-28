if(popMessagesToDisplay==undefined) var popMessagesToDisplay = 30;

function DHTMLSound(surl) {
	document.getElementById('dummyspan').innerHTML="<embed src='"+surl+"' hidden=true autostart=true loop=false></embed>";
	document.chat.chat.blur();
	try{
		document.chat.chat.focus();
	} catch (er) { }
}

// Start cookie functions which will set the Chat Mode Cookie for one week
function saveHabChatCookie (cookieName,thisValue){
	var today = new Date();
	var expire = new Date();
	var name = cookieName + league_id;
	expire.setTime(today.getTime() + 1000*60*60*24*7); 
	document.cookie = name + "=" + thisValue + ";expires=" + expire.toGMTString();
}

function getHabChatCookie(name) {
	var search = name + "="
	var returnvalue = ""
	if (document.cookie.length > 0) {
		offset = document.cookie.indexOf(search)
		if (offset != -1) {
			offset += search.length
			end = document.cookie.indexOf(";", offset)
			if (end == -1)
				end = document.cookie.length;
			returnvalue=unescape(document.cookie.substring(offset, end))
		}
	}
	return returnvalue;
}
// End Cookie Functions 

function chatAlertPopupThis(whichOne){
	switch(whichOne) {
		case '1' : { alert ("Your presence is requested in the Chat Room.\n\nClick 'OK' then proceed to the Chat Room if you desire."); break; }
		case '2' : { alert ("You have sent an alert.  You can do this only once per chat session.\n\nClick 'OK' and hopefully your alert will summon someone to the Chat Room."); break; }
	}
}

function chatAlertPopup(which){
	clearInterval(chatTimer)
	switch(which) {
		case '1' : { cookieName='alert_received_popped'; break; }
		case '2' : { cookieName='alert_sent_popped'; break; }
		default  : break;
	}
	if (getHabChatCookie(cookieName)==''){
		chatAlertPopupThis(which)
		switch(which) {
			case '1' : { document.cookie="alert_received_popped=yes"; break; }
			case '2' : { document.cookie="alert_sent_popped=yes"; break; }
			default  : break;
		}
	}
	if(hideChatUtilities=='false') setAlertIcon()
}

function PlayDHTMLSound() {
	DHTMLSound(newPostSound);
}

function togglesound(mode) {
	if(mode=='') {               // If cookie hasn't been set for user then use default mode
		mode=defaultChatMode 
	}
	if(mode=='in'||mode=='on') {
		document.getElementById("chat_sound_on").style.display="block"
		document.getElementById("chat_sound_off").style.display="none"
		chatMode='on'
	} else {
		document.getElementById("chat_sound_on").style.display="none"
		document.getElementById("chat_sound_off").style.display="block" 
		chatMode='off'
	}
	saveHabChatCookie('chatModeCookie',chatMode);
}

function toggledirection(mode) {
	if(mode=='') {               // If cookie hasn't been set for user then use default mode
		mode=defaultChatDirection
	}
	if(mode=='up') {
		document.getElementById("chat_direction_up").style.display="block"
		document.getElementById("chat_direction_down").style.display="none"
		chatDirection = 'up'
	} else {
		document.getElementById("chat_direction_up").style.display="none"
		document.getElementById("chat_direction_down").style.display="block"  
		chatDirection = 'down'
	}
	saveHabChatCookie('chatDirectionCookie',chatDirection);
}

function toggledisplaymessages(mode) {
	if(mode=='') {               // If cookie hasn't been set for user then use default mode
		mode=defaultDisplayMessages
	}
	if(mode=='-1') {
		chatDisplayMessages = parseInt(document.chat2.messagesToDisplay.value,10);
	} else {
		chatDisplayMessages = parseInt(mode,10);
	}
	saveHabChatCookie('chatDisplayMessagesCookie',chatDisplayMessages);
}

function postMessageAlert() {
	var url = window.location.protocol + "//" + window.location.host + "/" + year + "/chat_save?L=" + league_id + "&MESSAGE=Alert sent";
	makeHttpRequest(url);
	// do this in a quarter of a second to make sure the write has completed
	setTimeout("readMessagesHabChat(false)", 250);
}

function setAlertIcon() {
	cookieName='alert_sent_popped'
	if(getHabChatCookie(cookieName)==''){
		document.getElementById("chat_alert_on").style.display="block"
		document.getElementById("chat_alert_off").style.display="none"
	} else {
		document.getElementById("chat_alert_on").style.display="none"
		document.getElementById("chat_alert_off").style.display="block"
	}
}

function chatprint_window() {
	var chatWindow = window.open(baseURLDynamic + "/" + year + "/options?L=" + league_id + "&O=200&M=PRINTHABCHAT","chatprint_window","height=550,width=450,scrollbars=yes,toolbar=yes,status=no,resizable=yes,menubar=no");
}

function info_window() {
	var chatWindow = window.open("http://www.habman.com/mfl/sounds/info.html","info_window","height=500,width=450,scrollbars=no,toolbar=no,status=no,resizable=no,menubar=no");
}

function postMessageHabChat(field,toField) {
	if (field.value.length > 0) {
		var url = window.location.protocol + "//" + window.location.host + "/" + year + "/chat_save?L=" + league_id + "&MESSAGE=" + escape(field.value) + "&TO_FID=" + toField + "&random=" + get_random_string();
		field.value = '';
		makeHttpRequest(url);
		chatRead = 0;
		setTimeout("readMessagesHabChat(false)", 250);
	}
}

function readMessagesHabChat (restartTimer) {
	try {
		document.getElementById('dummyspan').innerHTML="";
	} catch (er) { 
		// do nothing 
	}
	if (unescape(location.href).indexOf("http://football")!=-1||unescape(location.href).indexOf("http://6")!=-1) var currentURLBase = baseURLDynamic; else var currentURLBase = baseURLStatic;
		var url = currentURLBase + "/fflnetdynamic" + year + "/" + league_id + '_chat.xml?random=' + get_random_string();
	try {
		makeHttpRequest(url, 'parseChatXMLHabChat', 1);
	} catch (e) {
		url = window.location.protocol + "//" + window.location.host + "/fflnetdynamic" + year + "/" + league_id + '_chat.xml?random=' + get_random_string();
		makeHttpRequest(url, 'parseChatXMLHabChat', 1);
	}
	if (typeof chatRead == "undefined") {
		chatRead = 0;
	}
	chatRead++;
	if (chatRead < 200 && restartTimer) {
		setTimeout("readMessagesHabChat(true)", checkEverySeconds * 1000);
	} 
}

function parseChatXMLHabChat (chatXML) {
	var messages = chatXML.getElementsByTagName("message");
	if(messages.length>0) {
		var lastMessageId = messages[0].getAttribute("id")
		var lastMessageTime = parseInt(lastMessageId)
		var lastMessagePostedBy = messages[0].getAttribute("franchise_id")
		var lastMessageCheck = messages[0].getAttribute("message")
		var lastMessagePostedTo = messages[0].getAttribute("to")
		if(lastMessageTime>chatServerTime) {
			if (lastMessagePostedTo==undefined||lastMessagePostedTo==""||lastMessagePostedTo==franchise_id||lastMessagePostedBy==franchise_id) {
				if(lastMessagePostedBy!=franchise_id) { 
					if(chatMode=='on'||chatMode=='in') PlayDHTMLSound();
					if(lastMessageCheck=="Alert sent") chatAlertPopup('1');
				} else {
					if(lastMessageCheck=="Alert sent") chatAlertPopup('2');
					if(chatMode=='on') PlayDHTMLSound();
				}
			}	
			chatServerTime=lastMessageTime 
		}
	}
	if(chatDisplayMessages > messages.length) var message_count = messages.length; else var message_count = chatDisplayMessages; 
	var tabledata = "<table align='center' cellspacing='1' border='0' class='report' width='100%'>\n";
	tabledata += "<tr><th>By</th><th>Message</th></tr>\n";
	var postedMessages = 0;
	if(chatDirection=='up') {
		//with the bottom up I need to know how many messages qualify to be shown since some may be private
		//before I actually run the loop that displays the messages
		var goodMessages=0;
		var loopStart = messages.length;
		for (var i = 0; i <= messages.length-1; i++) { //loop through all the messages to see if they qualify
			var fran_id = messages[i].getAttribute("franchise_id");
			var message = messages[i].getAttribute("message");			
			var franTo_id = messages[i].getAttribute("to");
			if ((franTo_id==undefined||lastMessagePostedTo==""||franTo_id==franchise_id||fran_id==franchise_id) && message!="Alert sent") {
				goodMessages++;
				if(goodMessages==message_count) { var loopStart = i+1; }
			}
		}
		for (var i = loopStart-1; i >= 0; i--) { //loop through all the messages starting with the first good message
			var fran_id = messages[i].getAttribute("franchise_id");
			var message = messages[i].getAttribute("message");
			var posted = messages[i].getAttribute("posted");
			var franTo_id = messages[i].getAttribute("to");
			if ((franTo_id==undefined||lastMessagePostedTo==""||franTo_id==franchise_id||fran_id==franchise_id) && postedMessages<message_count && message!="Alert sent") {
				if((fran_id==franchise_id&&franTo_id!=undefined&&franTo_id!=""&&franchise_id!=undefined)||(franTo_id==franchise_id&&franchise_id!=undefined))
					var privateImage = "<img src='http://www.habman.com/mfl/images/private.gif' alt='private' title='private with " + franchiseDatabase['fid_' + franTo_id].name + "' />";
				else 
					var privateImage = "";
				if (postedMessages % 2 == 1) {
					tabledata += "<tr class='oddtablerow'><td>"  + franchiseDatabase['fid_' + fran_id].name + "&nbsp;" + privateImage + "</td><td title='Posted: " + posted + "'>" + message + "</td></tr>\n"; 
					//tabledata += "<tr class='oddtablerow'><td><img src='" + baseChatImage  + fran_id + ".gif' />" + privateImage + "</td><td title='Posted: " + posted + "'>" + message + "</td></tr>\n"; 
				} else {
					tabledata += "<tr class='eventablerow'><td>" + franchiseDatabase['fid_' + fran_id].name + "&nbsp;" + privateImage + "</td><td title='Posted: " + posted + "'>" + message + "</td></tr>\n"; 
					//tabledata += "<tr class='eventablerow'><td><img src='" + baseChatImage  + fran_id + ".gif' />" + privateImage + "</td><td title='Posted: " + posted + "'>" + message + "</td></tr>\n"; 
				}
				postedMessages++;
			}
		}
	} else {
		for (var i = 0; i <= messages.length-1; i++) { 
			var fran_id = messages[i].getAttribute("franchise_id");
			var message = messages[i].getAttribute("message");
			var posted = messages[i].getAttribute("posted");
			var franTo_id = messages[i].getAttribute("to");
			if ((franTo_id==undefined||lastMessagePostedTo==""||franTo_id==franchise_id||fran_id==franchise_id) && postedMessages<message_count && message!="Alert sent") {
				if((fran_id==franchise_id&&franTo_id!=undefined&&franTo_id!=""&&franchise_id!=undefined)||(franTo_id==franchise_id&&franchise_id!=undefined))
					var privateImage = "<img src='http://www.habman.com/mfl/images/private.gif' alt='private' title='private with " + franchiseDatabase['fid_' + franTo_id].name + "' />";
				else 
					var privateImage = "";
				if (postedMessages % 2 == 1) {
					tabledata += "<tr class='oddtablerow'><td>"  + franchiseDatabase['fid_' + fran_id].name + "&nbsp;" + privateImage + "</td><td title='Posted: " + posted + "'>" + message + "</td></tr>\n"; 
					//tabledata += "<tr class='oddtablerow'><td><img src='" + baseChatImage  + fran_id + ".gif' />" + privateImage + "</td><td title='Posted: " + posted + "'>" + message + "</td></tr>\n"; 
				} else {
					tabledata += "<tr class='eventablerow'><td>" + franchiseDatabase['fid_' + fran_id].name + "&nbsp;" + privateImage + "</td><td title='Posted: " + posted + "'>" + message + "</td></tr>\n"; 
					//tabledata += "<tr class='eventablerow'><td><img src='" + baseChatImage  + fran_id + ".gif' />" + privateImage + "</td><td title='Posted: " + posted + "'>" + message + "</td></tr>\n"; 
				}
				postedMessages++;
			}
		}
	}    
	tabledata += "</table>\n";
	try { 
		document.getElementById("loadingchatdatahabchat").innerHTML = tabledata; 
	} catch(er) { 
		// do nothing 
	}
}

chatDisplayMessages = getHabChatCookie('chatDisplayMessagesCookie' + league_id)
toggledisplaymessages(chatDisplayMessages)

document.write('<table align="center" cellspacing="0" class="homepagemodule report" id="league_chat">\n');
document.write('<caption><span>League Chat</span></caption>\n');
document.write(' <tbody>\n');
if(hideChatUtilities!='true') {
	document.write('  <tr>\n');
	document.write('   <td>\n');
	document.write('    <table align="center" style="border:0px">\n');
	document.write('     <tr style="cursor: pointer">\n');
	document.write('      <td style="border: 0px; padding: 0px"><img src="http://www.habman.com/mfl/images/bell.png" alt="page to chat" title="Page Members to Chat Room" onclick="postMessageAlert();" id="chat_alert_on" /><img src="http://www.habman.com/mfl/images/bell2.png" alt="Alert disabled" title="Page Sent" style="cursor: default;" id="chat_alert_off" /></td>\n');
	document.write('      <td style="border: 0px; padding: 0px; padding-left: 5px"><img src="http://www.habman.com/mfl/images/sound-off-16x16.png" alt="sound off" title="Chat Muted" id="chat_sound_off" onclick="javascript:togglesound(\'on\');" /><img src="http://www.habman.com/mfl/images/sound-16x16.png" alt="sound on" title="Chat Audio On" id="chat_sound_on" onclick="javascript:togglesound(\'off\');" /></td>\n');
	document.write('	  <td style="border: 0px; padding: 0px"><img src="http://www.habman.com/mfl/images/updown.png" alt="reverse direction" title="Read Bottom-Up" id="chat_direction_up" onclick="javascript:toggledirection(\'down\');" /><img src="http://www.habman.com/mfl/images/downup.png" alt="reverse direction" title="Read Top-Down" id="chat_direction_down" onclick="javascript:toggledirection(\'up\');" /></td>\n');
	document.write('      <td style="border: 0px; padding: 0px"><form name="chat2"><select name="messagesToDisplay" onchange="toggledisplaymessages(\'-1\');" size="1" class="my_select">\n');
	for(var i=3; i<=30; i++) {
		if(i==chatDisplayMessages) var selected=' selected="selected" '; else var selected = "";
		document.write('        <option value="' + i + '"' + selected + '>' + i + '</option>\n');
	}
	document.write('       </select></form>\n');
	document.write('      </td>\n');
	document.write('      <td style="border: 0px; padding: 0px; padding-left: 5px"><a href="javascript:chatprint_window();"><img src="http://www.habman.com/mfl/images/print.png" border="0" alt="printer" title="Chat Transcript" /></a></td>\n');	
	document.write('      <td style="border: 0px; padding: 0px; padding-left: 4px"><a href="javascript:info_window();"><img src="http://www.habman.com/mfl/images/info.png" border="0" alt="chat icon info" title="Chat Info" /></a></td>\n');
	document.write('      <td style="border: 0px; padding: 0px"><a href="javascript:chat_window(\'' + baseURLStatic + '/' + year + '/chat?L=' + league_id + '&COUNT=' + popMessagesToDisplay + '\');"><img src="http://www.habman.com/mfl/sounds/popout.png" border="0" alt="Pop Out Chat Room" title="Popout of Page" /></a></td>\n');
	document.write('     </tr>\n');
	document.write('    </table>\n');
	document.write('   </td>\n');
	document.write('  </tr>\n');
}
document.write('  <tr><td><span id="loadingchatdatahabchat">No Chat Messages To Display</span></td></tr>\n');
if(franchise_id==undefined) {
	var franchise_id;
} else {
	document.write('  <tr class="eventablerow reportfooter"><td align="center"><form action="" name="chat"><input type="text" name="chat" size="30" maxlength="200"  /><input type="button" onclick="postMessageHabChat(document.chat.chat,document.chat.messageToID.options[document.chat.messageToID.selectedIndex].value);" value="Post" /></td></tr>\n');
	document.write('  <tr class="eventablerow reportfooter"><td align="center"><span id="visitor_count">1</span> leaguemates on-line: <span id="visitor_list"></span></td></tr>\n');
	document.write('  <tr class="eventablerow reportfooter">\n');
	document.write('   <td style="border: 0px; padding: 0px">To: <select name="messageToID" size="1" class="my_select">\n');	
	document.write('     <option value="" selected="selected">Everyone</option>\n');
	//in firefox "var i in" fails so we need to manually count the commissioner and franchises 
	var fCount=0;
	for(var i in franchiseDatabase) {
		if (fCount<=leagueAttributes['Franchises']) document.write('     <option value="' + franchiseDatabase[i].id + '">' + franchiseDatabase[i].name + '</option>\n');
		fCount++;
	}
	document.write('    </select>\n');	
	document.write('    </form><span id="dummyspan"></span>\n');
	document.write('   </td>\n');
	document.write('  </tr>\n');
}
document.write(' </tbody>\n');
document.write('</table>\n');


var alertActive = 'true'
var chatServerTime = currentServerTime
var chatTimer=0
if (hideChatUtilities=='false') setAlertIcon()
chatMode = getHabChatCookie('chatModeCookie' + league_id)
chatDirection = getHabChatCookie('chatDirectionCookie' + league_id) 

if (hideChatUtilities=='false') togglesound(chatMode)
if (hideChatUtilities=='false') toggledirection(chatDirection)

readMessagesHabChat(true);

if (document.chat && document.chat.chat) {
	document.chat.chat.onkeypress=function(event) {
		var code = event && event.which ? event.which : window.event.keyCode;
		if (code == 13 || code == 3) {
			postMessageHabChat(document.chat.chat,document.chat.messageToID.options[document.chat.messageToID.selectedIndex].value);
			return false;
		}
	}
}
