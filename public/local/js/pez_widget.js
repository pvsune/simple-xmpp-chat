var pez_widget_connection = 'bosch';

var pez_widget_api_key = null;
var pez_widget_client = null;
var pez_widget_client_domain = null;
var pez_widget_prefix = 'pez-widget-';
var pez_widget_url = 'http://localhost:8080/';
var pez_widget_env = 'local';
var pez_widget_xmpp_url = 'http://localhost:5280/http-bind'
var pez_widget_dotmin = '';
var pez_widget_online = true;
var pez_widget_debug = true;

var pez_widget_title = '',
    pez_widget_slogan = '',
    pez_widget_message = '',
    pez_widget_bubbletext = '',
    pez_widget_prechat = true,
    pez_widget_prechat_email = true,
    pez_widget_prechat_phone = true,
    pez_widget_prechat_question = true,
    pez_widget_bgcolor = '',
    pez_widget_fgcolor = '',
    pez_widget_avatar = '',
    pez_widget_window_state = 'closed';


function device_os() {
    var useragent = navigator.userAgent;

    if(useragent.match(/Android/i)) {
        return 'android';
    } else if(useragent.match(/webOS/i)) {
        return 'webos';
    } else if(useragent.match(/iPhone/i)) {
        return 'iphone';
    } else if(useragent.match(/iPod/i)) {
        return 'ipod';
    } else if(useragent.match(/iPad/i)) {
        return 'ipad';
    } else if(useragent.match(/Windows Phone/i)) {
        return 'windowsphone';
    } else if(useragent.match(/SymbianOS/i)) {
        return 'symbian';
    } else if(useragent.match(/RIM/i) || useragent.match(/BB/i)) {
        return 'blackberry';
    } else {
        return 'desktop';
    }
}

var pez_widget_device = device_os();

function get_client_data() {
    data = {}
    if (pez_widget_title != '') {
        data = {
            name: pez_widget_title,
            avatar: pez_widget_avatar,
            slogan: pez_widget_slogan,
            welcome_message: pez_widget_message,
            pre_chat: pez_widget_prechat,
            pre_chat_email: pez_widget_prechat_email,
            pre_chat_phone: pez_widget_prechat_phone,
            pre_chat_question: pez_widget_prechat_question,
            bubble_text: pez_widget_bubbletext,
            bgcolor: pez_widget_bgcolor,
            fgcolor: pez_widget_fgcolor,
            window_state: pez_widget_window_state
        }
    } else {
        data = {
            name: 'Untitled',
            avatar: pez_widget_url+'images/user.png',
            slogan: 'This is a test',
            welcome_message: 'Hi, this is a sample?',
            pre_chat: true,
            pre_chat_email: true,
            pre_chat_phone: true,
            pre_chat_question: true,
            bubble_text: 'Untitled Bot',
            bgcolor: '#1a60a3',
            fgcolor: '#fff',
            window_state: 'closed'
        }
    }
    return data;
}


(function() {

    var embedjs = document.getElementById(pez_widget_prefix+'embed');
    var srclen = embedjs.src.length

    pez_widget_api_key = embedjs.getAttribute("data-apikey");
    pez_widget_client = embedjs.getAttribute("data-client");
    pez_widget_client_domain = document.domain;

    pez_widget_title = embedjs.getAttribute("data-title");
    pez_widget_avatar = embedjs.getAttribute("data-avatar");
    pez_widget_slogan = embedjs.getAttribute("data-slogan");
    pez_widget_message = embedjs.getAttribute("data-message");
    pez_widget_bubbletext = embedjs.getAttribute("data-bubbletext");
    pez_widget_bgcolor = embedjs.getAttribute("data-bgcolor");
    pez_widget_fgcolor = embedjs.getAttribute("data-fgcolor");
    pez_widget_prechat = (embedjs.getAttribute("data-prechat") == 'true')
    pez_widget_prechat_email = (embedjs.getAttribute("data-prechat-email") == 'true')
    pez_widget_prechat_phone = (embedjs.getAttribute("data-prechat-phone") == 'true')
    pez_widget_prechat_question = (embedjs.getAttribute("data-prechat-question") == 'true')
    pez_widget_window_state = embedjs.getAttribute("data-window-state");

    if (embedjs.getAttribute("data-online") == 'false')
        pez_widget_online = false;

    var client = get_client_data();

    var seed = Math.floor(Date.now() / 1000);

    function pez_widget_load(){
        pez_build_container();

        var style = document.createElement('link');
        style.href = pez_widget_url+pez_widget_env+'/css/pez_widget_'+pez_widget_device+pez_widget_dotmin+'.css?'+seed;
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.media = 'all';
        document.getElementsByTagName('head')[0].appendChild(style)

        if (pez_widget_online) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = pez_widget_url+'library/strophe/strophe.js?'+seed;
            script.onload = pez_widget_load_websocket;
            document.getElementsByTagName('body')[0].appendChild(script)
        } else {
            pez_widget_load_main();
        }
    }

    function pez_widget_load_websocket() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = pez_widget_url+'library/strophe/strophe.websocket.js?'+seed;
        script.onload = pez_widget_load_msgpk;
        document.getElementsByTagName('body')[0].appendChild(script)
    }

    function pez_widget_load_msgpk() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = pez_widget_url+'library/msgpack/msgpack.min.js?'+seed;
        script.onload = pez_widget_load_main;
        document.getElementsByTagName('body')[0].appendChild(script)
    }
    
    function pez_widget_load_main() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = pez_widget_url+pez_widget_env+'/js/pez_widget_main'+pez_widget_dotmin+'.js?'+seed;
        document.getElementsByTagName('body')[0].appendChild(script)
    }

    function pez_build_container() {
        var style_override = '<style>\n#'+pez_widget_prefix+'launcher-open{\nbackground: '+client.bgcolor+' !important;color: '+client.fgcolor+' !important;}\n#'+pez_widget_prefix+'launcher-open:after {\nborder-color: '+client.bgcolor+' transparent !important;}\n</style>';
        var htmlstr = '<div id="'+pez_widget_prefix+'container" style="display:none;height:80px;">\n<div id="'+pez_widget_prefix+'launcher-close" style="display:none;">CLOSE</div>\n<span id="'+pez_widget_prefix+'container-span" style="display:none;"></span>\n</div>\n<div id="'+pez_widget_prefix+'launcher-open" class="speech-bubble shadow gradient" style="display:none;">'+client.bubble_text+'</div>'+style_override
        var div = document.createElement('div');
        div.innerHTML = htmlstr;
        document.body.appendChild(div);
    }

    document.addEventListener("DOMContentLoaded", pez_widget_load);

})();
