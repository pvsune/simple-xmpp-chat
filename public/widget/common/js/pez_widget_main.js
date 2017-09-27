
// ---------------- CONFIGS ---------------

    function log(message) {
        //console.log(message);
    }

    function trace(message) {
        //console.log(message);
    }

    var seed = Math.floor(Date.now() / 1000);

    function get_xmpp_config() {
        var config =  {
            url: null,
            host: 'localhost',
            admin_user: 'admin@localhost'
        }
        if (pez_widget_connection == 'websocket') {
            config.url = 'ws://xmpp.dev.pez.ai/xmpp';
        } else {
            config.url = '//xmpp.dev.pez.ai/http-bind';
        }
        return config
    }

    function get_dataform_response(name) {
        var responses = {
            prechatreceived: '[prechatreceived]',
            authfail: '[fail]'
        }
        if (responses[name] != undefined) {
            return responses[name]
        }
        return null
    }

    var client = get_client_data();
    var xmpp = get_xmpp_config();

    function unit_test(func,args) {
        //...
    }

// ---------------- VARIABLES ---------------

    var pez_widget_jid = null; 

    function docdiv(name) {
        var d = document.getElementById(pez_widget_prefix+name);
        if (typeof(d) == 'undefined' || d == null) {
            log('Undefined Element: '+pez_widget_prefix+name);
            return null
        }
        return d
    }

    function framediv(name) {
        var d = i_framedoc.getElementById(pez_widget_prefix+name);
        if (typeof(d) == 'undefined' || d == null) {
            log('Undefined Element: '+pez_widget_prefix+name);
            return null;
        }
        return d;
    }

    var i_frame;
    var i_framedoc;
    var is_iframe_not_loaded = true;

    var i_container;
    var i_bubble;
    var i_form;
    var i_form_button;
    var i_form_error;
    var i_user_firstname;
    var i_user_lastname;
    var i_user_email;
    var i_user_phone;
    var i_user_question;
    var i_input_area;
    var i_send_button;
    var i_message;
    var i_messages_area;
    var i_messages_area_inner;

    function load_divs() {
        i_container = docdiv('container');
        i_bubble = docdiv('launcher-open');
    }

    function load_framedivs() {
        i_form = framediv('form');
        i_form_button = framediv('form-button');
        i_form_error = framediv('form-error');
        i_user_firstname = framediv('form-first-name');
        i_user_lastname = framediv('form-last-name');
        i_user_email = framediv('form-email');
        i_user_phone = framediv('form-phone');
        i_user_question = framediv('form-question');
        i_input_area = framediv('input-area');
        i_send_button = framediv('send-button');
        i_message = framediv('message');
        i_messages_area = framediv('messages-area');
        i_messages_area_inner = framediv('messages');

        button_events();
    }

    var user_firstname = '';
    var user_lastname = '';
    var user_email = '';
    var user_phone = '';
    var user_question = '';

    var has_previous_messages = false;
    

// ---------------- MESSAGES ---------------

    function messageHandler(msg) {
        trace(' -> messageHandler');
        var to = msg.getAttribute('to');
        var from = msg.getAttribute('from');
        var type = msg.getAttribute('type');
        var elems = msg.getElementsByTagName('body');
        
        if (type == "chat" && elems.length > 0) {
            var body = Strophe.getText(elems[0]);
            if (body) {
                if (body == get_dataform_response('prechatreceived')) {
                    log('Prechat Data Received')
                    post_prechat();
                } else if (body != get_dataform_response('authfail')) {
                    log(from + ": " + body);
                    var time = append_message('server',body,null);
                    add_message_cookie('server',body,time);
                    increment_unread_count();
                    activate_chat();
                }
            }    
        } else {
            log('Received '+type+' with body:');
            log(elems);
        }

        unit_test('messageHandler',msg);
        return true;
    }

    var pending_message = '';

    function post_prechat() {
        send_message(pending_message);
    }

    function send_message(msg) {
        if (!has_previous_messages) {
            send_user_info();
            pending_message = msg;
            has_previous_messages = true;
            return
        }

        trace(' -> send_message');
        msg = msg.trim()
        if (msg == '') return;
        var orig_msg = msg
        if (pez_widget_online) {
            var buf = msgpack.encode(JSON.stringify({
                "message": msg,
                "api_key": pez_widget_api_key,
                "page_id": pez_widget_client_domain
            }));
            msg = '';
            for (var i = 0, x = buf.length; i < x; i += 1)
                msg += (buf[i] <= 0xf ? '0' : '') + buf[i].toString(16);
            if (pez_widget_connection=='websocket') {
                connection.send(Strophe.xmlHtmlNode('<message to="admin@localhost" type="chat"><body>'+msg+'</body></message>').firstElementChild);
            } else {
                var message = $msg({to: xmpp.admin_user,from: connection.jid,type:"chat"}).c("body").t(msg)
                connection.send(message.tree());
            }
        }
        var time = append_message('user',orig_msg,null);
        add_message_cookie('user',orig_msg,time);
        process_non_text(orig_msg,time);
        offline_options(orig_msg);
        i_message.value = '';
        if (pez_widget_online) i_message.focus();
        unit_test('send_message',orig_msg);
    }
    
    function append_message(sender,message,time) {
        trace(' -> append_message');
        var passed_time = time;
        var passed_message
        if (time == null) {
            time = date_timestamp(new Date())
        }
        var name = '', imgsrc = '';
        if (sender == 'user') {
            imgsrc = '';
            name = user_firstname;
        } else {
            imgsrc = client.avatar+'?'+seed
            name = client.name
        }
        message = convert_links(message);
        var avatar = '';
        if (sender == 'server') {
            avatar = '<div class="pez-widget-comment-container-'+sender+'-avatar">\n<div class="pez-widget-avatar">\n<img src="'+imgsrc+'">\n</div>\n</div>';
        }
        var d = i_framedoc.createElement('div');
        d.className = pez_widget_prefix+"conversation-part "+pez_widget_prefix+"conversation-part-"+sender+" "+pez_widget_prefix+"conversation-part-grouped"
        d.innerHTML = '<div id="'+pez_widget_prefix+'container-'+time+'" class="'+pez_widget_prefix+'comment-container '+pez_widget_prefix+'comment-container-'+sender+'">\n'+avatar+'\n<div class="'+pez_widget_prefix+'comment">\n<div class="'+pez_widget_prefix+'blocks">\n<div class="'+pez_widget_prefix+'block '+pez_widget_prefix+'block-paragraph">\n<div id="'+pez_widget_prefix+'msg-'+time+'" class="text">\n'+message+'\n</div>\n</div>\n</div>\n</div>\n</div>\n<span>\n<div class="'+pez_widget_prefix+'conversation-part-metadata">\n<div class="'+pez_widget_prefix+'conversation-part-metadata-save-state">\n<span class="'+pez_widget_prefix+'timestamp '+time+'"><em>Just Now</em></span>\n</div>\n</div>\n</span>';
        i_messages_area_inner.appendChild(d);
        setTimeout(scroll_down,500);
        unit_test('append_message',[sender,message,passed_time])
        return time
    }

// ---------------- API KEY AUTHENTICATION -----------

    function send_auth() {
        trace(' -> send_auth');
        if (pez_widget_online && pez_widget_required_auth) {
            log('Authenticating API');
            var form = $msg({to: xmpp.admin_user, from: connection.jid, type:"chat"}) 
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
        }
    }

    function post_auth() {
        trace(' -> post_auth');
        load_widget();
    }

// ---------------- USER DATA PROCESSING -----------


    function process_form(){
        trace(' -> process_form');
        user_firstname = i_user_firstname.value.trim();
        user_lastname = i_user_lastname.value.trim();
        user_email = i_user_email.value.trim();
        user_phone = i_user_phone.value.trim();
        user_question = i_user_question.value.trim();

        if (user_firstname == '') {
            i_form_error.innerText = 'First Name is required';
            i_user_firstname.focus();
        } else if (user_lastname == '') {
            i_form_error.innerText = 'Last Name is required';
            i_user_lastname.focus();
        } else if (user_email != '' && !validate_email(user_email)) {
            i_form_error.innerText = 'Email is invalid';
            i_user_email.focus();
            i_user_email.select();
        } else{
            i_user_firstname.disabled = true;
            i_user_lastname.disabled = true;
            i_user_email.disabled = true;
            i_user_phone.disabled = true;
            i_user_question.disabled = true;
            i_form_button.disabled = true;
            i_form_error.innerText = 'Saving your info...';
            save_form();
            if (user_question != '') {
                send_message(user_question);
            } else {
                client = get_client_data();
                var time = append_message('server',client.welcome_message,null);
                add_message_cookie('server',client.welcome_message,time);
                increment_unread_count();
            }
            activate_chat();
        }
    }

    function save_form() {
        trace(' -> save_form');
        var question = user_question.replace('\n',' ').replace(';','');
        set_cookie('user-firstname',user_firstname);
        set_cookie('user-lastname',user_lastname);
        set_cookie('user-email',user_email);
        set_cookie('user-phone',user_phone);
        set_cookie('user-question',question);
    }

    function validate_email(email) {
        trace(' -> validate_email');
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function send_user_info() {
        trace(' -> send_user_info');
        if (pez_widget_online) {
            var form = $msg({to: xmpp.admin_user, from: connection.jid, type:"chat"}) 
                .c('x', {xmlns:'jabber:x:data', type:'result'})//, from: connection.jid, to: xmpp_admin_user})
                .c('title','userdata')
                .up().c('instructions','Pre-chat form data')
                .up().c('field', {'var':'first_name', type:'text-single', label:'First Name'})
                    .c('descp','First Name')
                    .up().c('required')
                    .up().c('value',user_firstname)
                .up().up().c('field', {'var':'last_name', type:'text-single', label:'Last Name'})
                    .c('descp','Last Name')
                    .up().c('required')
                    .up().c('value',user_lastname)
                .up().up().c('field', {'var':'email', type:'text-single', label:'Email'})
                    .c('descp','User Email')
                    .up().c('required')
                    .up().c('value',user_email)
                .up().up().c('field', {'var':'phone', type:'text-single', label:'Phone'})
                    .c('descp','User Phone')
                    .up().c('required')
                    .up().c('value',user_phone)
                .up().up().c('field', {'var':'question', type:'text-single', label:'Question'})
                    .c('descp','User Question')
                    .up().c('required')
                    .up().c('value',user_question)
                .up().up().c('field', {'var':'api_key', type:'text-single', label:'API Key'})
                    .c('descp','API Key')
                    .up().c('required')
                    .up().c('value',pez_widget_api_key)
            connection.send(form);
        }
    }

    function restore_data() {
        trace(' -> restore_data');
        var data = get_cookie('user-firstname');
        if (data != null && data != '') {
            activate_chat();
            
            // get user data
            user_firstame = data;
            user_lastname = get_cookie('user-lastname');
            user_email = get_cookie('user-email');
            user_phone = get_cookie('user-phone');
            user_question = get_cookie('user-question');

            log('User data is present');

            // get message history
            var messages = get_cookie('messages');
            if (messages!={}) {
                has_previous_messages = true;
                log('Previous messages are present');
                var keys = [];
                for (var key in messages)
                    keys.push(key);
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
                if (pez_widget_online) i_message.focus();
            } else {
                log('No previous messages');
            }
        }
    }

// ---------------- OFFLINE REPLIES -----------

    function offline_options(msg) {
        trace(' -> offline_options');
        if (!pez_widget_online) fake_reply(msg)
    }

    function fake_reply(message) {
        trace(' -> fake_reply');
        setTimeout(function(){
            var reply = "Chat server is offline";
            if (message == 'show link')
                reply = 'http://pez.ai/about';
            else if (message == 'show image')
                reply = 'http://pez.ai/wp-content/uploads/2015/08/brian.jpg';
            else if (message == 'show video') 
                reply =  'https://www.youtube.com/embed/WXHM_i-fgGo';
            add_message_cookie('server',reply,new Date());
            var time = append_message('server',reply,null);
            process_non_text(reply,time)
        },2000);
    }

    function process_non_text(message,time) {
        trace(' -> process_non_text');
        var container = framediv('container-'+time);
        container.classList.remove('wide');
        if (message.substring(0,4) == 'http') {
            display_spinner(time);
            container.classList.add('wide');
            process_video(message,time);
        }
    }

    function process_video(message,time) {
        if (message.indexOf('youtube.com/watch') !== -1 || 
            message.indexOf('youtube.com/embed/') !== -1 || 
            message.indexOf('youtu.be/') !== -1) {
            var video_id = '';
            var embed_url = message;
            if (message.indexOf('watch?v=') !== -1)
                video_id = message.split('watch?v=')[1].split('?')[0].split('#')[0].split('&')[0];
            else if (message.indexOf('youtu.be/') !== -1)
                video_id = url.split('youtu.be/')[1].split('?')[0].split('#')[0].split('&')[0];
            if (video_id != '')
                embed_url = 'https://www.youtube.com/embed/'+video_id
            framediv('msg-'+time).innerHTML = '<div class="video"><iframe style="width:100% !important;height:250px;" src="'+embed_url+'" frameborder="0" allowfullscreen></iframe></div>\n<div class="url"><a href="'+message+'" target="_blank">Watch in YouTube</a></div>';
        } else {
            process_link(message,time);
        }
    }

    function process_link(url,time) {
        var urlEncoded = encodeURIComponent(url);
        var apiKey = '59b23d0ebf6665630cf1e35a';
        var requestUrl = "https://opengraph.io/api/1.0/site/" + urlEncoded + '?app_id=' + apiKey;

        xhr = new XMLHttpRequest();
        xhr.open('GET', requestUrl, true);
        xhr.onload = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                display_link(JSON.parse(xhr.responseText),url,time)
            } else {
                log('Error '+xhr.status);
            }
        }
        xhr.send();
    }
    
    function process_image(message,time) {
        var img = document.createElement('img');
        img.setAttribute('src', message);
        img.onerror = (function(message,time){
            process_video(message,time);
        })(message,time);
        framediv('msg-'+time).innerHTML = '<div class="image"><a href="'+img.src+'" target="_blank"><img src="'+img.src+'" /></a></div>\n<div class="url"><a href="'+img.src+'" target="_blank">View Full Size</a></div>';
    }

    function display_link(data,url,time) {
        trace(' -> display_link');
        var target = framediv('msg-'+time);
        if (data.error != null) {
            framediv('msg-'+time).innerHTML = '<div class="image"><a href="'+url+'" target="_blank"><img src="'+url+'" /></a></div>\n<div class="url"><a href="'+url+'" target="_blank">View Full Size</a></div>';
        } else if (data.hybridGraph != null) {
            var imgstr = '';
            if (data.hybridGraph.image != '')
                imgstr = '<div class="image"><a href="'+url+'" target="_blank"><img src="'+data.hybridGraph.image+'" style="width:100%;height:auto;" /></a></div>'
            title = data.hybridGraph.title
            if (title == '') 
                title = 'Untitled'
            else if (title.length > 100)
                title = title.substring(0,100).trim()+'...'
            descp = data.hybridGraph.description
            if (descp.length > 100) 
                descp = descp.substring(0,100).trim()+'...'
            target.innerHTML = imgstr+'\n<div class="title"><a href="'+url+'" target="_blank">'+title+'</a></div>\n<div class="descp">'+descp+'</div>\n<div class="url"><a href="'+url+'" target="_blank">Open Link</a></div>';

        }
        setTimeout(scroll_down,500);
    }

    function convert_links(message) {
        //trace(' -> convert_links');
        if (message.substring(0,4) == 'http') {
            message = '<a href="'+message+'" target="_blank">'+message+'</a>';
        }
        return message;
    }

// ---------------- UI ----------------------

    function activate_chat() {
        trace(' -> activate_chat');
        i_form.style.display = 'none';
        i_input_area.style.display = 'block';
        if (pez_widget_online) i_message.focus();
    }

    function scroll_down() {
        trace(' -> scroll_down');
        i_messages_area.scrollTop = i_messages_area.scrollHeight
    }

    function display_spinner(time) {
        trace(' -> display_spinner');
        var target = framediv('msg-'+time)
        if (target != null) {
            target.className = 'preview'
            target.innerHTML = '<div class="spinner"><img src="'+pez_widget_url+'common/images/spinner.gif?'+seed+'" width="24" height="24" /></div>';
        }
    }

    function restore_launcher_status() {
        trace(' -> restore_launcher_status');
        if (pez_widget_device != 'desktop') {
            show_widget();
        } else {
            var state = get_cookie('launcher-status')
            if (state != 'open' && state != 'closed')
                state = client.window_state;
            if (state == 'open') show_widget();
            else hide_widget();
        }
    }

    function update_timestamps() {
        trace(' -> update_timestamps');
        var times = i_framedoc.getElementsByClassName(pez_widget_prefix+'timestamp');
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
        trace(' -> increment_unread_count');
        if (get_cookie('launcher-status')=='closed') {
            var cnt = parseInt(get_cookie('unread-messages'));
            set_cookie('unread-messages',cnt+1);
            update_speech_bubble();
        }

    }

    function update_speech_bubble() {
        trace(' -> update_speech_bubble');
        var client = get_client_data();
        var cnt = parseInt(get_cookie('unread-messages'));
        if (cnt > 0)
            i_bubble.innerHTML = '<span id="'+pez_widget_prefix+'unread-counter" class="unread">'+cnt+' Unread Messages</span>';
        else 
            i_bubble.innerHTML = '<span>'+client.bubble_text+'!</span>';
    }

    function load_widget() {
        trace(' -> load_widget');
        var container = docdiv('container-span')
        container.innerHTML = '<div class="'+pez_widget_prefix+'frame"></div>';
        i_frame = document.createElement('iframe');
        i_frame.setAttribute('allowfullscreen','true');
        i_frame.style.height = '530px';
        i_frame.id = pez_widget_prefix+'iframe';
        document.getElementsByClassName(pez_widget_prefix+'frame')[0].appendChild(i_frame);
        var style_override = '<style>\n.pez-widget-team-profile-compact-team-name,.pez-widget-team-profile-response-delay-text,#pez-widget-launcher-open,#pez-widget-container .pez-widget-conversation-body-profile,#pez-widget-container .pez-widget-comment-container-user .pez-widget-comment{\nbackground-color: '+pez_widget_bgcolor+' !important;color: '+pez_widget_fgcolor+' !important;}\n#pez-widget-launcher-open {\nbackground: '+pez_widget_bgcolor+' !important;}\n#pez-widget-launcher-open:after {\nborder-color: '+pez_widget_bgcolor+' transparent !important;}\n#pez-widget-send-button,#pez-widget-form-button,#pez-widget-send-button:hover,#pez-widget-form-button:hover{\nbackground-color: '+pez_widget_bgcolor+' !important;color: '+pez_widget_fgcolor+' !important;\n}\n</style>';
        var iframe_content = '<!DOCTYPE html>\n<html>\n<head>\n<link href="'+pez_widget_url+'common/css/pez_widget_main_'+pez_widget_device+pez_widget_dotmin+'.css?'+seed+'" rel="stylesheet" type="text/css" />\n'+style_override+'</head>\n<body id="'+pez_widget_prefix+'container-body">\n<div id="'+pez_widget_prefix+'container">\n<div data-reactroot="" class="'+pez_widget_prefix+'messenger">\n<div class="'+pez_widget_prefix+'messenger-background"></div>\n<span>\n<div class="'+pez_widget_prefix+'conversation">\n<div class="'+pez_widget_prefix+'conversation-body-container">\n<div class="'+pez_widget_prefix+'conversation-body" style="transform: translateY(-228.2px); bottom: -228.2px;">\n<div class="'+pez_widget_prefix+'conversation-body-profile">\n<div class="'+pez_widget_prefix+'conversation-profile">\n<div class="'+pez_widget_prefix+'team-profile">\n<div class="'+pez_widget_prefix+'team-profile-compact">\n<div class="'+pez_widget_prefix+'team-profile-compact-contents">\n<div class="'+pez_widget_prefix+'team-profile-compact-body">\n<div class="'+pez_widget_prefix+'team-profile-compact-team-name">'+client.name+'</div>\n<div class="'+pez_widget_prefix+'team-profile-compact-response-delay">\n<span class="'+pez_widget_prefix+'team-profile-response-delay-text">'+client.slogan+'</span>\n</div>\n</div>\n</div>\n</div>\n</div>\n</div>\n</div>\n<div id="'+pez_widget_prefix+'messages-area" class="'+pez_widget_prefix+'conversation-body-parts" style="top: 303.2px; bottom: 56px;">\n<div class="'+pez_widget_prefix+'conversation-body-parts-wrapper">\n<div class="'+pez_widget_prefix+'conversation-parts '+pez_widget_prefix+'conversation-parts-scrolled" style="transform: translateY(0px);">\n<div id="'+pez_widget_prefix+'messages"></div>\n</div>\n</div>\n</div>\n<div id="'+pez_widget_prefix+'form" style="display:block;">\n<div class="field field-first-name">\n<div class="label">First Name*</div>\n<div class="input-holder">\n<input type="text" id="'+pez_widget_prefix+'form-first-name" />\n</div>\n</div>\n<div class="field field-last-name">\n<div class="label">Last Name*</div>\n<div class="input-holder">\n<input type="text" id="'+pez_widget_prefix+'form-last-name" />\n</div>\n</div>\n<div id="pez-widget-field-email" class="field field-email" style="display: block;">\n<div class="label">E-mail</div>\n<div class="input-holder">\n<input type="text" id="'+pez_widget_prefix+'form-email" />\n</div>\n</div>\n<div id="pez-widget-field-phone" class="field field-phone" style="display: block;">\n<div class="label">Phone</div>\n<div class="input-holder">\n<input type="text" id="'+pez_widget_prefix+'form-phone" />\n</div>\n</div>\n<div id="pez-widget-field-question" class="field field-question" style="display: block;">\n<div class="label">Your Question</div>\n<div class="input-holder">\n<textarea size="3" id="'+pez_widget_prefix+'form-question"></textarea>\n</div>\n</div>\n<div class="field button">\n<button type="button" id="'+pez_widget_prefix+'form-button" class="gradient">Start Chat!</button>\n</div>\n<div class="field error">\n<div id="'+pez_widget_prefix+'form-error"></div>\n</div>\n</div>\n</div>\n<span></span>\n</div>\n<div class="'+pez_widget_prefix+'conversation-footer" id="'+pez_widget_prefix+'input-area" style="display:none;">\n<div class="'+pez_widget_prefix+'composer">\n<pre><br></pre>\n<textarea placeholder="Write a reply…" id="'+pez_widget_prefix+'message"></textarea>\n<span></span>\n<span></span>\n<div class="'+pez_widget_prefix+'composer-buttons">\n<button type="button style="display: block;"" id="'+pez_widget_prefix+'send-button">Send</button>\n</div>\n</div>\n</div>\n</div>\n</span>\n</div>\n</div>\n</body>\n</html>';
        i_framedoc = i_frame.contentDocument || i_frame.contentWindow.document;
        i_framedoc.open();
        i_framedoc.write(iframe_content);
        i_framedoc.close();
        iframe_loaded();
    }


    function show_widget() {
        trace(' -> show_widget');
        docdiv('container-span').style.display = "block";
        docdiv('launcher-close').style.display = "block";
        docdiv('launcher-open').style.display = "none";
        set_cookie('launcher-status','open');
        scroll_down();
    }

    function hide_widget() {
        trace(' -> hide_widget');
        docdiv('container-span').style.display = "none";
        docdiv('launcher-close').style.display = "none";
        docdiv('launcher-open').style.display = "block";
        set_cookie('launcher-status','closed');
    }

    function iframe_loaded() {
        load_divs();
        load_framedivs();
        i_container.style.display = 'block';
        restore_data();
        restore_launcher_status();
        var client = get_client_data();
        if (client.pre_chat) {
            if (!pez_widget_prechat_email)
                framediv('field-email').style.display = 'none';
            if (!pez_widget_prechat_phone)
                framediv('field-phone').style.display = 'none';
            if (!pez_widget_prechat_question)
                framediv('field-question').style.display = 'none';
        } else {
            if (!has_previous_messages) {
                var time = append_message('server',client.welcome_message,null);
                add_message_cookie('server',client.welcome_message,time);
                increment_unread_count();
                send_user_info();
                set_cookie('user-name','');
                set_cookie('user-email','');
                set_cookie('user-phone','');
                set_cookie('user-question','');
            }
            activate_chat();
        }
        setInterval(update_timestamps,5000);
    }

// ---------------- COOKIES HANDLING ----------------------

    function set_cookie(name,value) {
        trace(' -> set_cookie');
        var data = get_all_cookies();
        data[name] = value
        var expiry = new Date(new Date().getTime() + 365 * 86400000 * 5);
        delete_all_cookies();
        document.cookie = pez_widget_prefix+'data='+JSON.stringify(data)+'; expires='+expiry.toUTCString()+'; path=/';
        log('Cookie: '+name+'='+value);
    }

    function get_cookie(name) {
        //trace(' -> get_cookie');
        var data = get_all_cookies();
        if (data != {} && data[name] != undefined) 
            return data[name]
        else
            return null
    }

    function get_all_cookies() {
        //trace(' -> get_all_cookies');
        var result = document.cookie.match(new RegExp(pez_widget_prefix+'data=([^;]+)'))
        if (result) {
            try {
                var obj = JSON.parse(result[1]);
            } catch (e) {
                delete_all_cookies();
                return {};
            }
            return obj;
        }
        return {};
    }

    function delete_all_cookies() {
        //trace(' -> delete_all_cookies');
        var expiry = new Date(new Date().getTime() - 365 * 86400000);
        document.cookie = pez_widget_prefix+'data=; expires='+expiry.toUTCString()+'; path=/';
        log('Deleted Corrupt Cookies');
    }

    function add_message_cookie(sender,message,time) {
        trace(' -> add_message_cookie');
        var data = get_all_cookies()
        if (data['messages'] == undefined) {
            data['messages'] = {}
        }
        if (data['messages'])
        data['messages'][date_timestamp(time)] = {
            sender: sender,
            message: message
        }
        set_cookie('messages',data['messages'])
    }

// ----------------- TOOLS -------------------

    function date_timestamp(date) {
        //trace(' -> date_timestamp');
        function pad2(n) {  // always returns a string
            return (n < 10 ? '0' : '') + n;
        }
        if (!(date instanceof Date))
            date = new Date()
        return date.getFullYear() +
           pad2(date.getMonth() + 1) + 
           pad2(date.getDate()) +
           pad2(date.getHours()) +
           pad2(date.getMinutes()) +
           pad2(date.getSeconds()) +
           pad2(date.getMilliseconds());
    }

    function month_name(num) {
        var names = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return names[num];
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

//---------------- CONNECTION -----------------

    function update_jid() {
        trace(' -> update_jid');
        pez_widget_jid = get_cookie('jid');
        if (pez_widget_jid == null) {
            pez_widget_jid = new Date().getTime()+'@localhost';
            set_cookie('jid',pez_widget_jid);
        }
    }

    function connect() {
        trace(' -> connect');
        update_jid();
        connection.connect(pez_widget_jid, '', connectHandler)
    }

    function connectHandler(cond) {
        trace(' -> connectHandler');
        if (cond == Strophe.Status.CONNECTED){ 
            log("Connected");
            connection.addHandler(presenceHandler, null, "presence");//, connection.jid);
            connection.addHandler(pingHandler, "urn:xmpp:ping", "iq", "get");//, connection.jid);
            connection.addHandler(messageHandler, null, "message", null, null, null);//, connection.jid);
            connection.send($pres().tree());
            post_auth(); 
        } 
        else if (cond == Strophe.Status.AUTHFAIL)       { log("Authentication Fail"); } 
        else if (cond == Strophe.Status.CONNECTING)     { log("Connecting"); } 
        else if (cond == Strophe.Status.CONNFAIL)       { log("Connection Fail"); } //setTimeout(connect,5000) }
        else if (cond == Strophe.Status.DISCONNECTED)   { log("Disconnected"); }//setTimeout(connect,5000) }
        else if (cond == Strophe.Status.DISCONNECTING)  { log("Disconnectin"); }
        else if (cond == Strophe.Status.ERROR)          { log("Error"); }
        else if (cond == Strophe.Status.ATTACHED)       { log("Attached"); }
        else if (cond == Strophe.Status.AUTHENTICATING) { log("Authenticating"); }
    }

// ------------ OTHER EVENTS HANDLERS ----------------------

    function button_events() {
        trace(' -> button_events');
    
        var opener = docdiv('launcher-open')
        var closer = docdiv('launcher-close')
        opener.addEventListener("click", function(e) {
            show_widget();
        }, false);
        closer.addEventListener("click", function(e) {
            hide_widget();
        }, false);

        i_form_button.addEventListener("click", process_form, false);
        
        i_send_button.addEventListener("click", function(e) {
            send_message(i_message.value);
        }, false);
        
        i_message.addEventListener("keyup", function (e) {
            e = e || window.event;
            if (e.keyCode == 13) { // Return key
                send_message(i_message.value)
            }
        }, false);
    }


    function presenceHandler(presence) {
        trace(' -> presenceHandler');
        var from = presence.getAttribute("from");
        var show = "", status = "";
        Strophe.forEachChild(presence, "show", function(elem) { show = elem.textContent; });
        Strophe.forEachChild(presence, "status", function(elem) { status = elem.textContent; });
        if (show || status) log("[presence] " + from + ":" + status + " " + show);
        return true;
    }

    function pingHandler(ping) {
        trace(' -> pingHandler');
        var pingId = ping.getAttribute("id");
        var from = ping.getAttribute("from");
        var to = ping.getAttribute("to");
        var pong = $iq({type: "result", "to": from, id: pingId, "from": to});
        connection.send(pong);
        return true;
    }

    function set_raw_handlers() {
        trace(' -> set_raw_handlers');
        connection.rawInput = function(str) { if (pez_widget_debug) log('Raw Received: '); log(str); }
        connection.rawOutput = function(str) { if (pez_widget_debug) log('Raw Sent: '); log(str); }
    }

    function update_status(show,status) {
        trace(' -> update_status');
        var pres = $pres().c("show").t(show).up().c("status").t(status);
        connection.send(pres);
    }

// ------------ MAIN ----------------------

    if (pez_widget_online) {
        if (pez_widget_connection == 'websocket')
            var connection = new Strophe.WebSocket(xmpp.url);
        else
            var connection = new Strophe.Connection(xmpp.url);
        set_raw_handlers();
        connect();
    } else {
        post_auth();
    }
