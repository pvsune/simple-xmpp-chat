var pez_widget_online = true;
var pez_widget_required_auth = true;
var pez_widget_payload_sending = 'dataform'; // iq or dataform
var pez_widget_debug = false;

function log(message) {
    //console.log(message);
}

var prefix = 'pez-widget-';

var pez_widget_name = 'FundKo';
var pez_widget_avatar = 'fundko_logo.png';

var xmpp_server_url = 'http://35.188.27.220:5280/http-bind';
//var xmpp_server_url = 'http://localhost:5280/http-bind';
var xmpp_host = 'localhost';
var xmpp_admin_user = 'admin@localhost';

var pez_widget_jid = null; 

var authsuccess_response = '<authsuccess>';
var userdatareceived_response = '<userdatareceived>';

// divs
var i_chatbox = document.getElementById(prefix+'chatbox');
var i_form = document.getElementById(prefix+'form');
var i_form_button = document.getElementById(prefix+'form-button');
var i_form_error = document.getElementById(prefix+'form-error');
var i_user_name = document.getElementById(prefix+'form-name');
var i_user_email = document.getElementById(prefix+'form-email');
var i_user_phone = document.getElementById(prefix+'form-phone');
var i_user_question = document.getElementById(prefix+'form-question');
var i_input_area = document.getElementById(prefix+'input-area');
var i_message = document.getElementById(prefix+'message');
var i_send_button = document.getElementById(prefix+'send-button');
var i_launcher = document.getElementById(prefix+'launcher');
var i_bubble = document.getElementById(prefix+'speech-bubble');
var i_collapsible = document.getElementById(prefix+'collapsible');
var i_messages_area = document.getElementById(prefix+'messages-area');
var i_messages_area_inner = document.getElementById(prefix+'messages-area-inner');

var user_name = '';
var user_email = '';
var user_phone = '';
var user_question = '';

function log(message) {
    console.log(message);
}

function connect() {
    connection.connect(xmpp_host, null, connectHandler)
}

function connectHandler(cond) {
    if (cond == Strophe.Status.CONNECTED) {
        log("Connected");
        post_connection();
    } else if (cond == Strophe.Status.AUTHFAIL) {
        log("Authentication Fail");
    } else if (cond == Strophe.Status.CONNECTING) {
        log("Connecting");
    } else if (cond == Strophe.Status.CONNFAIL) {
        log("Connection Fail");
        setTimeout(connect,5000)
    } else if (cond == Strophe.Status.DISCONNECTED) {
        log("Disconnected");
        setTimeout(connect,5000)
    } else if (cond == Strophe.Status.DISCONNECTING) {
        log("Disconnectin");
    } else if (cond == Strophe.Status.ERROR) {
        log("Error");
    } else if (cond == Strophe.Status.ATTACHED) {
        log("Attached");
    } else if (cond == Strophe.Status.AUTHENTICATING) {
        log("Authenticating");
    }
}

function presenceHandler(presence) {
    var from = presence.getAttribute("from");
    var show = "";
    var status = "";
    Strophe.forEachChild(presence, "show", function(elem) {
        show = elem.textContent;
    });
    Strophe.forEachChild(presence, "status", function(elem) {
        status = elem.textContent;
    });
     
    if (show || status){
        log("[presence] " + from + ":" + status + " " + show);
    }
    return true;
}

function pingHandler(ping) {
    var pingId = ping.getAttribute("id");
    var from = ping.getAttribute("from");
    var to = ping.getAttribute("to");
    var pong = $iq({type: "result", "to": from, id: pingId, "from": to});
    connection.send(pong);
    return true;
}

function messageHandler(msg) {
    var to = msg.getAttribute('to');
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('body');

    log(type+' received from '+from) //+' to '+to);

    if (type == "chat" && elems.length > 0) {
        var body = Strophe.getText(elems[0]);
        if (body) {
            if (body == authsuccess_response) {
                log('Auth Success')
                post_auth();
            } else if (body == userdatareceived_response) {
                log('User Data Sent')
                send_message(user_question);
                activate_chat();
            } else {
                add_message_cookie('server',body);
                append_message('server',body);
                log(from + ": " + body);
                increment_unread_count();
            }
        }    
    }

    return true;
}

function rawInputHandler(str) {
    if (pez_widget_debug) {
        log('Raw Received: '+str);
    }
}

function rawOutputHandler(str) {
    if (pez_widget_debug) {
        log('Raw Sent: '+str);
    }
}

function post_auth() {
    restore_data();
    restore_launcher_status();
    setInterval(update_timestamps,5000);
}

function send_message(msg) {
    msg = msg.trim()
    if (msg == '') return;
    var message = $msg({to: xmpp_admin_user, from: connection.jid, type:"chat"})
        .c("body").t(msg);
    connection.send(message.tree());
    log('To: '+xmpp_admin_user+' Message: '+msg)
    add_message_cookie('user',msg);
    var time = append_message('user',msg);
    process_non_text(msg,time);
    if (!pez_widget_online) fake_reply(msg)
    i_message.value = '';
    i_message.focus();
}

function update_status(show,status) {
    var pres = $pres()
        .c("show").t(show).up()
        .c("status").t(status);
    connection.send(pres);
}

function post_connection() {
    if (pez_widget_online) {
        update_jid();
        connection.addHandler(presenceHandler, null, "presence", pez_widget_jid);
        connection.addHandler(pingHandler, "urn:xmpp:ping", "iq", "get", pez_widget_jid);
        connection.addHandler(messageHandler, null, "message", "chat", pez_widget_jid);
        connection.send($pres());
        if (pez_widget_required_auth)
            send_auth();
        else {
            log('Skipped authentication')
            post_auth();
        }
    }
}

function send_user_info() {
    if (pez_widget_online) {
        if (pez_widget_payload_sending == 'dataform') {
            var form = $msg({to: xmpp_admin_user, from: connection.jid, type:"chat"}) 
                .c('x', {xmlns:'jabber:x:data', type:'result'})//, from: connection.jid, to: xmpp_admin_user})
                .c('title','userdata')
                .up().c('instructions','Pre-chat form data')
                .up().c('field', {'var':'user_name', type:'text-single', label:'User Name'})
                    .c('descp','User Name')
                    .up().c('required')
                    .up().c('value',user_name)
                .up().up().c('field', {'var':'user_email', type:'text-single', label:'User Email'})
                    .c('descp','User Email')
                    .up().c('required')
                    .up().c('value',user_email)
                .up().up().c('field', {'var':'user_phone', type:'text-single', label:'User Phone'})
                    .c('descp','User Phone')
                    .up().c('required')
                    .up().c('value',user_phone)
                .up().up().c('field', {'var':'user_question', type:'text-single', label:'User Question'})
                    .c('descp','User Question')
                    .up().c('required')
                    .up().c('value',user_question)
            connection.send(form);
        } else if (pez_widget_payload_sending == 'iq') {
            var iq = $iq({type: 'set', id: 'userdata'})//, from: connection.jid, to: xmpp_admin_user})
              .c('query', {xmlns: 'jabber:iq:private'})
              .c('userdata', {xmlns: 'userdata:prefs'})
              .c('name', user_name)
              .up().c('email', user_email)
              .up().c('phone', user_phone)
              .tree();
            connection.sendIQ(iq);
        }   
    }
}

function send_auth() {
    if (pez_widget_online && pez_widget_required_auth) {
        log('Authenticating');
        if (pez_widget_payload_sending == 'dataform') {
            var form = $msg({to: xmpp_admin_user, from: connection.jid, type:"chat"}) 
                .c('x', {xmlns:'jabber:x:data', type:'result'})//, from: connection.jid, to: xmpp_admin_user})
                .c('title','clientauth')
                .up().c('instructions','')
                .up().c('field', {'var':'api_key', type:'text-single', label:'API Key'})
                    .c('descp','API Key')
                    .up().c('required')
                    .up().c('value',pez_widget_api_key)
                .up().up().c('field', {'var':'domain', type:'text-single', label:'Client Domain'})
                    .c('descp','Client Domain')
                    .up().c('required')
                    .up().c('value',pez_widget_client_domain)
            connection.send(form);
        } else if (pez_widget_payload_sending == 'iq') {
            var iq = $iq({type: 'set', id: 'clientauth'})//, from: connection.jid, to: xmpp_admin_user})
              .c('query', {xmlns: 'jabber:iq:private'})
              .c('clientauth', {xmlns: 'clientauth:prefs'})
              .c('api_key', pez_widget_api_key)
              .up().c('domain', pez_widget_client_domain)
              .tree();
            connection.sendIQ(iq);
        }
    }
}

function fake_reply(message) {
    setTimeout(function(){
        var reply = "Chat server is offline";
        if (message == 'show link')
            reply = 'http://pez.ai/about';
        else if (message == 'show image')
            reply = 'http://pez.ai/wp-content/uploads/2015/08/brian.jpg';
        else if (message == 'show video') 
            reply =  'https://www.youtube.com/embed/WXHM_i-fgGo';
        add_message_cookie('server',reply);
        var time = append_message('server',reply);
        process_non_text(reply,time)
    },2000);
}

function activate_chat() {
    i_form.style.display = 'none';
    i_input_area.style.display = 'block';
    i_message.focus();
}

function append_message(sender,message,time) {
    if (time == null) {
        time = date_timestamp(new Date())
    }
    var name = '', imgsrc = ''
    if (sender == 'user') {
        imgsrc = pez_widget_url+'images/anonymous-user-icon.png';
        name = user_name;
    } else {
        imgsrc = pez_widget_url+'images/'+pez_widget_avatar
        name = pez_widget_name
    }
    message = convert_links(message);
    //message = message.replace(/\n/g,'<br />');

    var div = {
        tag: 'div', className: sender+' message', children: [
            {tag: 'div', className: 'info', children: [
                {tag: 'img', src: imgsrc},
                {tag: 'div', className: 'name', innerText: name}]},
            {tag: 'div', className: 'text', children: [
                {tag: 'div', id: 'msg-'+time, innerText: message},
                {tag: 'span', className: 'pez-widget-timestamp '+time, title: '', innerHTML: '<em>Just Now</em>'}]}
        ]}
    i_messages_area_inner.appendChild(pez_widget_build_element(div))
    i_messages_area_inner.innerHTML += '<div class="divider"></div>';
    setTimeout(scroll_down,500);
    return time
}

function display_link(data,time) {
    if (data.data_type == 'image') {
        var target = document.getElementById('pez-widget-msg-'+time)
        target.innerHTML = '<div class="image"><a href="'+data.image+'" target="_blank"><img src="'+data.image+'" /></a></div>';
    } else if (data.data_type == 'youtube') {
        var target = document.getElementById('pez-widget-msg-'+time)
        target.innerHTML = '<div class="video"><iframe width="175" height="200" src="'+data.embed_url+'" frameborder="0" allowfullscreen></iframe></div>'+convert_links(data.url);
    } else {
        var imgstr = '';
        if (data.image != '')
            imgstr = '<div class="image"><a href="'+data.url+'" target="_blank"><img src="'+data.image+'" /></a></div>'
        title = data.title
        if (title == '') 
            title = 'Untitled'
        var target = document.getElementById('pez-widget-msg-'+time)
        target.innerHTML = `
            `+imgstr+`
            <div class="title"><a href="`+data.url+`" target="_blank">`+title+`</a></div>
            <div class="descp">`+data.descp+`</div>
            <div class="url"><a href="`+data.url+`" target="_blank">`+data.url+`</a></div>
        `;
    }
    setTimeout(scroll_down,500);
}

function process_link(url,time) {
    xhr = new XMLHttpRequest();
    xhr.open('POST', pez_widget_url+'link');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('crossDomain', '*');
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhr.onload = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            display_link(JSON.parse(xhr.responseText),time)
        } else {
            log('Error '+xhr.status);
        }
    }
    xhr.send("url="+url);
}

function ajaxpost(link,data,callback) {
}

function display_spinner(time) {
    var target = document.getElementById('pez-widget-msg-'+time)
    if (target != null) {
        target.className = 'preview'
        target.innerHTML = '<div class="spinner"><img src="'+pez_widget_url+'images/spinner.gif" /></div>';
    } else {
        log('Target: pez-widget-msg-'+time)
    }
}

function process_non_text(message,time) {
    if (message.substring(0,4) == 'http') {
        display_spinner(time);
        process_link(message,time);
    }
}

function convert_links(message) {
    if (message.substring(0,4) == 'http') {
        message = '<a href="'+message+'" target="_blank">'+message+'</a>';
    }
    return message;
}

function scroll_down() {
    i_messages_area.scrollTop = i_messages_area.scrollHeight
}

function process_form(){
    user_name = i_user_name.value.trim();
    user_email = i_user_email.value.trim();
    user_phone = i_user_phone.value.trim();
    user_question = i_user_question.value.trim();

    if (user_name == '') {
        i_form_error.innerText = 'Name is required';
        i_user_name.focus();
    } else if (user_email == '') {
        i_form_error.innerText = 'Email is required';
        i_user_email.focus();
    } else if (!validate_email(user_email)) {
        i_form_error.innerText = 'Email is invalid';
        i_user_email.focus();
        i_user_email.select();
    } else if (user_question == '') {
        i_form_error.innerText = 'Question is required';
        i_user_question.focus();
    } else{
        i_user_name.disabled = true;
        i_user_email.disabled = true;
        i_user_phone.disabled = true;
        i_user_question.disabled = true;
        i_form_button.disabled = true;
        i_form_error.innerText = 'Saving your info...';
        save_form();
        send_user_info();
    }
}

function save_form() {
    var question = user_question.replace('\n',' ').replace(';','');
    set_cookie('user-name',user_name);
    set_cookie('user-email',user_email);
    set_cookie('user-phone',user_phone);
    set_cookie('user-question',question);
}

function validate_email(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function set_cookie(name,value) {
    var data = get_all_cookies();
    data[name] = value
    var expiry = new Date(new Date().getTime() + 365 * 86400000 * 5);
    document.cookie = prefix+'data='+JSON.stringify(data)+'; expires='+expiry.toUTCString()+'; path=/';
    log('Cookie: '+name+'='+value);
}

function get_cookie(name) {
    var data = get_all_cookies();
    if (data != {} && data[name] != undefined) 
        return data[name]
    else
        return null
}

function get_all_cookies() {
    var result = document.cookie.match(new RegExp(prefix+'data=([^;]+)'))
    if (result) {
        try {
            var obj = JSON.parse(result[1]);
            return obj
        } catch (e) {
            delete_all_cookies();
            return {}
        }
    } else {
        return {}
    }
}

function delete_all_cookies() {
    var expiry = new Date(new Date().getTime() - 365 * 86400000);
    document.cookie = prefix+'data=; expires='+expiry.toUTCString()+'; path=/';
    log('Deleted Corrupt Cookies');
}

function add_message_cookie(sender,message) {
    var data = get_all_cookies()
    if (data['messages'] == undefined) {
        data['messages'] = {}
    }
    if (data['messages'])
    data['messages'][date_timestamp(new Date())] = {
        sender: sender,
        message: message
    }
    set_cookie('messages',data['messages'])
}

function date_timestamp(date) {
    function pad2(n) {  // always returns a string
        return (n < 10 ? '0' : '') + n;
    }
    return date.getFullYear() +
       pad2(date.getMonth() + 1) + 
       pad2(date.getDate()) +
       pad2(date.getHours()) +
       pad2(date.getMinutes()) +
       pad2(date.getSeconds()) +
       pad2(date.getMilliseconds());
}

function escape_schars(str) {
    return str.replace(/\\n/g, "\\n")
       .replace(/\\'/g, "\\'")
       .replace(/\\"/g, '\\"')
       .replace(/\\&/g, "\\&")
       .replace(/\\r/g, "\\r")
       .replace(/\\t/g, "\\t")
       .replace(/\\b/g, "\\b")
       .replace(/\\f/g, "\\f");
} 

function month_name(num) {
    var names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return names[num];
}

function update_timestamps() {
    var times = document.getElementsByClassName('pez-widget-timestamp');
    if (times.length > 0) {
        var i, t, d, h, a, seconds, text, timestr
        var now = new Date();
        var yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        for (i=0;i<times.length;i++) {
            t = times[i].className.split(' ')[1];
            d = new Date(
                t.substring(0,4),
                parseInt(t.substring(4,6))-1,
                t.substring(6,8),
                t.substring(8,10),
                t.substring(10,12),
                t.substring(12,14)
                //,t.substring(14,t.length)
                );
            seconds = Math.floor((now.getTime() - d.getTime())/(1000));
            if (seconds < 1) {
                text = 'Just now';
            } else if (seconds < 60) {
                text = seconds+' seconds ago';
            } else if (seconds < (60 * 60)) {
                text = Math.floor(seconds/60)+' minutes ago';
            } else {
                text = '';
                if (t.substr(0,8) != date_timestamp(now).substring(0,8)) {
                    if (t.substr(0,8) == date_timestamp(yesterday).substring(0,8)) {
                        text = 'Yesterday';
                    } else {
                        text = month_name(d.getMonth())+' '+d.getDate();
                        if (now.getFullYear() - d.getFullYear() > 0) {
                            text += ', '+d.getFullYear()
                        }
                    }
                    text += ' ';
                }
                h = parseInt(d.getHours());
                a = 'am';
                if (h == 0) {
                    h = 12;
                } else if (parseInt(t.substring(8,14)) == 120000) {
                    a = 'nn';
                } else if (parseInt(t.substring(8,14)) > 120000) {
                    if (h > 12) {
                        h = h - 12;
                    }
                    a = 'pm';
                }
                timestr = h+':'+d.getMinutes()+' '+a;
                text += timestr;
            }
            times[i].innerHTML = '<em>'+text+'</em>';
            times[i].title = month_name(d.getMonth())+' '+d.getDate()+', '+d.getFullYear()+' '+timestr;
        }
    }
}


function increment_unread_count() {
    if (get_cookie('launcher-status')=='closed') {
        var cnt = parseInt(get_cookie('unread-messages'));
        set_cookie('unread-messages',cnt+1);
        update_speech_bubble();
    }

}

function update_speech_bubble() {
    var cnt = parseInt(get_cookie('unread-messages'));
    if (cnt > 0)
        i_bubble.innerHTML = '<span id="'+prefix+'unread-counter" class="unread">'+cnt+' Unread Messages</span>';
    else 
        i_bubble.innerHTML = '<span>Talk with FundKoBot!</span>';
}

function update_jid() {
    // disabled for now
    /*
    pez_widget_jid = get_cookie('jid');
    if (pez_widget_jid == null) {
        pez_widget_jid = connection.jid.split('@localhost')[0]+'@localhost';
        set_cookie('jid',pez_widget_jid);
    }
    */
    pez_widget_jid = connection.jid;
}

function restore_launcher_status() {
    if (get_cookie('launcher-status') == 'closed') {
        i_launcher.click();
    } else {
        i_bubble.click();
    }
    i_chatbox.hidden = false;
}

function restore_data() {
    var data = get_cookie('user-name');
    if (data != null && data != '') {
        activate_chat();
        // get user data
        user_name = data;
        user_email = get_cookie('user-email');
        user_phone = get_cookie('user-phone');
        user_question = get_cookie('user-question');

        log('User data is present');

        // get message history
        var messages = get_cookie('messages');
        if (messages!={}) {
            var keys = [];
            for (var key in messages)
                keys.push(key)
            keys = keys.sort();
            if (keys.length > 30)
                keys = keys.slice((keys.length - 30), keys.length)
            var msg, i;
            for (i=0;i<keys.length;i++) {
                key = keys[i]
                msg = messages[key]
                append_message(msg.sender,unescape(msg.message),key);
            }
            update_timestamps();
            i_message.focus();
            
            log('Previous messages are present')
        }
    }
}

var connection = new Strophe.Connection(xmpp_server_url);
connection.rawInput = rawInputHandler;
connection.rawOutput = rawOutputHandler;

i_form_button.onclick = process_form;
i_send_button.onclick = function(e) {
    send_message(i_message.value);
}
i_message.onkeyup = function (e) {
    e = e || window.event;
    if (e.keyCode == 13) { // Return key
        send_message(i_message.value)
    }
}
i_launcher.onclick = function(){
    i_collapsible.className = 'slide-down';
    i_launcher.classList.remove('open');
    i_launcher.classList.add('closed');
    update_speech_bubble(); 
    i_bubble.hidden = false;
    set_cookie('launcher-status','closed');
}
i_bubble.onclick = function() {
    i_collapsible.className = 'slide-up';
    i_launcher.classList.remove('closed');
    i_launcher.classList.add('open');
    i_launcher.innerHTML = '<span>Close</span>';
    i_message.focus();
    i_bubble.hidden = true;
    set_cookie('unread-messages', 0);
    set_cookie('launcher-status','open');
}

if (pez_widget_online) connect();
