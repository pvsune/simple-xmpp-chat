
// ---------------- CONFIGS ---------------

    var pez_widget_online = true;
    var pez_widget_required_auth = true;
    var pez_widget_debug = false;

    var pez_widget_prefix = 'pez-widget-';

    function log(message) {
        console.log(message);
    }

    function trace(message) {
        console.log(message);
    }

    var seed = Math.floor(Date.now() / 1000);

    function get_xmpp_config() {
        var config =  {
            url: null,
            host: 'localhost',
            admin_user: 'admin@localhost'
        }
        if (pez_widget_url.indexOf('localhost') > -1)
            config.url = 'http://localhost:5280/http-bind';
        else
            config.url = 'http://35.188.27.220:5280/http-bind';
        return config
    }

    function get_dataform_response(name) {
        var responses = {
            clientauth: '[authsuccess]',
            userdata: '[userdatareceived]',
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
    var i_form;
    var i_form_button;
    var i_form_error;
    var i_user_name;
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
    }

    function load_framedivs() {
        i_form = framediv('form');
        i_form_button = framediv('form-button');
        i_form_error = framediv('form-error');
        i_user_name = framediv('form-name');
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

    var user_name = '';
    var user_email = '';
    var user_phone = '';
    var user_question = '';

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
                if (body == get_dataform_response('clientauth')) {
                    log('Auth Success')
                    post_auth();
                } else if (body == get_dataform_response('userdata')) {
                    log('User Data Sent')
                    send_message(user_question);
                    activate_chat();
                } else if (body != get_dataform_response('authfail')) {
                    log(from + ": " + body);
                    var time = append_message('server',body,null);
                    add_message_cookie('server',body,time);
                    increment_unread_count();
                    activate_chat();
                }
            }    
        } else {
            log('Received '+type+' with body:')
            log(elems)
        }

        unit_test('messageHandler',msg);
        return true;
    }

    function send_message(msg) {
        trace(' -> send_message');
        msg = msg.trim()
        if (msg == '') return;
        var message = $msg({to: xmpp.admin_user,from: connection.jid,type:"chat"})
            .c("body").t(msg)
            .up().c("auth").t(pez_widget_api_key+'|'+pez_widget_client_domain)
        connection.send(message.tree());
        var time = append_message('user',msg,null);
        add_message_cookie('user',msg,time);
        process_non_text(msg,time);
        offline_options(msg);
        i_message.value = '';
        i_message.focus();
        unit_test('send_message',msg);
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
            name = user_name;
        } else {
            imgsrc = pez_widget_url+'clients/'+client.avatar+'?'+seed
            name = client.name
        }
        message = convert_links(message);
        var avatar = '';
        if (sender == 'server') {
            avatar = `
            <div class="pez-widget-comment-container-`+sender+`-avatar">
                <div class="pez-widget-avatar">
                    <img src="`+imgsrc+`">
                </div>
            </div>`;
        }
        var d = i_framedoc.createElement('div');
        d.className = pez_widget_prefix+"conversation-part "+pez_widget_prefix+"conversation-part-"+sender+" "+pez_widget_prefix+"conversation-part-grouped"
        d.innerHTML = `
            <div id="`+pez_widget_prefix+`container-`+time+`" class="`+pez_widget_prefix+`comment-container `+pez_widget_prefix+`comment-container-`+sender+`">
                `+avatar+`
                <div class="`+pez_widget_prefix+`comment">
                    <div class="`+pez_widget_prefix+`blocks">
                        <div class="`+pez_widget_prefix+`block `+pez_widget_prefix+`block-paragraph">
                            <div id="`+pez_widget_prefix+`msg-`+time+`" class="text">
                                `+message+`
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <span>
                <div class="`+pez_widget_prefix+`conversation-part-metadata">
                    <div class="`+pez_widget_prefix+`conversation-part-metadata-save-state">
                        <span class="`+pez_widget_prefix+`timestamp `+time+`"><em>Just Now</em></span>
                    </div>
                </div>
            </span>
        `;
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
        trace(' -> save_form');
        var question = user_question.replace('\n',' ').replace(';','');
        set_cookie('user-name',user_name);
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
        }
    }

    function restore_data() {
        trace(' -> restore_data');
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
                i_message.focus();
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
            process_link(message,time);
            container.classList.add('wide');
        }
    }

    function process_link(url,time) {
        trace(' -> process_link');
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

    function display_link(data,time) {
        trace(' -> display_link');
        var target = framediv('msg-'+time);
        if (data.data_type == 'image') {
            target.innerHTML = `
                <div class="image"><a href="`+data.image+`" target="_blank"><img src="`+data.image+`" /></a></div>
                <div class="url"><a href="`+data.image+`" target="_blank">View Full Size</a></div>
                `;
        } else if (data.data_type == 'youtube') {
            target.innerHTML = `
                <div class="video"><iframe style="width:100% !important;height:250px;" src="`+data.embed_url+`" frameborder="0" allowfullscreen></iframe></div>
                <div class="url"><a href="`+data.url+`" target="_blank">Watch in YouTube</a></div>
                `;
        } else {
            var imgstr = '';
            if (data.image != '')
                imgstr = '<div class="image"><a href="'+data.url+'" target="_blank"><img src="'+data.image+'" style="width:100%;height:auto;" /></a></div>'
            title = data.title
            if (title == '') 
                title = 'Untitled'
            target.innerHTML = `
                `+imgstr+`
                <div class="title"><a href="`+data.url+`" target="_blank">`+title+`</a></div>
                <div class="descp">`+data.descp+`</div>
                <div class="url"><a href="`+data.url+`" target="_blank">Open Link</a></div>
                `;
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
        i_message.focus();
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
            target.innerHTML = '<div class="spinner"><img src="'+pez_widget_url+'images/spinner.gif?'+seed+'" width="24" height="24" /></div>';
        }
    }

    function restore_launcher_status() {
        trace(' -> restore_launcher_status');
        if (pez_widget_device != 'desktop') {
            show_widget();
        } else {
            if (get_cookie('launcher-status') == 'closed') {
                hide_widget();
            } else {
                show_widget();
            }
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
        var cnt = parseInt(get_cookie('unread-messages'));
        if (cnt > 0)
            i_bubble.innerHTML = '<span id="'+pez_widget_prefix+'unread-counter" class="unread">'+cnt+' Unread Messages</span>';
        else 
            i_bubble.innerHTML = '<span>Talk with '+client.name+'!</span>';
    }

    function load_widget() {
        var container = docdiv('container-span')
        container.innerHTML = '<div class="'+pez_widget_prefix+'frame"></div>';
        i_frame = document.createElement('iframe');
        i_frame.setAttribute('allowfullscreen','true');
        i_frame.style.height = '530px';
        i_frame.id = pez_widget_prefix+'iframe';
        document.getElementsByClassName(pez_widget_prefix+'frame')[0].appendChild(i_frame);
        var iframe_content = `
        <!DOCTYPE html>
        <html>
        <head>
            <link href="`+pez_widget_url+`common/css/pez_widget_main_`+pez_widget_device+`.css?`+seed+`" rel="stylesheet" type="text/css" />
            <link href="`+pez_widget_url+`clients/`+pez_widget_client+`.css?`+seed+`" rel="stylesheet" type="text/css" />
        </head>
        <body id="`+pez_widget_prefix+`container-body">
            <div id="`+pez_widget_prefix+`container">
                <div data-reactroot="" class="`+pez_widget_prefix+`messenger">
                    <div class="`+pez_widget_prefix+`messenger-background"></div>
                    <span>
                        <div class="`+pez_widget_prefix+`conversation">
                            <div class="`+pez_widget_prefix+`conversation-body-container">
                                <div class="`+pez_widget_prefix+`conversation-body" style="transform: translateY(-228.2px); bottom: -228.2px;">
                                    <div class="`+pez_widget_prefix+`conversation-body-profile">
                                        <div class="`+pez_widget_prefix+`conversation-profile">
                                            <div class="`+pez_widget_prefix+`team-profile">
                                                <div class="`+pez_widget_prefix+`team-profile-compact">
                                                    <div class="`+pez_widget_prefix+`team-profile-compact-contents">
                                                        <div class="`+pez_widget_prefix+`team-profile-compact-body">
                                                            <div class="`+pez_widget_prefix+`team-profile-compact-team-name">`+client.name+`</div>
                                                            <div class="`+pez_widget_prefix+`team-profile-compact-response-delay">
                                                                <span class="`+pez_widget_prefix+`team-profile-response-delay-text">`+client.slogan+`</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="`+pez_widget_prefix+`messages-area" class="`+pez_widget_prefix+`conversation-body-parts" style="top: 303.2px; bottom: 56px;">
                                        <div class="`+pez_widget_prefix+`conversation-body-parts-wrapper">
                                            <div class="`+pez_widget_prefix+`conversation-parts `+pez_widget_prefix+`conversation-parts-scrolled" style="transform: translateY(0px);">
                                                <div id="`+pez_widget_prefix+`messages"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="`+pez_widget_prefix+`form" style="display:block;">
                                        <div class="field field-name">
                                            <div class="label">Name*</div>
                                            <div class="input-holder">
                                                <input type="text" id="`+pez_widget_prefix+`form-name" />
                                            </div>
                                        </div>
                                        <div class="field field-email">
                                            <div class="label">E-mail*</div>
                                            <div class="input-holder">
                                                <input type="text" id="`+pez_widget_prefix+`form-email" />
                                            </div>
                                        </div>
                                        <div class="field field-phone">
                                            <div class="label">Phone</div>
                                            <div class="input-holder">
                                                <input type="text" id="`+pez_widget_prefix+`form-phone" />
                                            </div>
                                        </div>
                                        <div class="field field-question">
                                            <div class="label">Your Question*</div>
                                            <div class="input-holder">
                                                <textarea size="3" id="`+pez_widget_prefix+`form-question"></textarea>
                                            </div>
                                        </div>
                                        <div class="field button">
                                            <button type="button" id="`+pez_widget_prefix+`form-button" class="gradient">Start Chat!</button>
                                        </div>
                                        <div class="field error">
                                            <div id="`+pez_widget_prefix+`form-error"></div>
                                        </div>
                                    </div>
                                </div>
                                <span></span>
                            </div>
                            <div class="`+pez_widget_prefix+`conversation-footer" id="`+pez_widget_prefix+`input-area" style="display:none;">
                                <div class="`+pez_widget_prefix+`composer">
                                    <pre><br></pre>
                                    <textarea placeholder="Write a reply…" id="`+pez_widget_prefix+`message"></textarea>
                                    <span></span>
                                    <span></span>
                                    <div class="`+pez_widget_prefix+`composer-buttons">
                                        <button type="button" id="`+pez_widget_prefix+`send-button">Send</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </span>
                </div>
            </div>
        </body>
        </html>`;
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
            post_connection(); 
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

    function post_connection() {
        trace(' -> post_connection');
        if (pez_widget_online) {
            if (pez_widget_required_auth)
                send_auth();
            else {
                log('Skipped authentication')
                post_auth();
            }
        } else {
            post_auth();
        }
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
        connection.rawInput = function(str) { if (pez_widget_debug) log('Raw Received: '+str); }
        connection.rawOutput = function(str) { if (pez_widget_debug) log('Raw Sent: '+str); }
    }

    function update_status(show,status) {
        trace(' -> update_status');
        var pres = $pres().c("show").t(show).up().c("status").t(status);
        connection.send(pres);
    }

// ------------ MAIN ----------------------

    var connection = new Strophe.Connection(xmpp.url);
    set_raw_handlers();

    if (pez_widget_online) 
        connect();
    else
        post_connection();
