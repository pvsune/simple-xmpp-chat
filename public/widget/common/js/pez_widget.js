var pez_widget_api_key = null;
var pez_widget_client = null;
var pez_widget_client_domain = null;
var pez_widget_prefix = 'pez-widget-';
var pez_widget_url = null;
var pez_widget_url = 'https://panoptez.firebaseapp.com/widget/';
var pez_widget_dotmin = '.min';

var pez_widget_title = '',
    pez_widget_slogan = '',
    pez_widget_message = '',
    pez_widget_bubbletext = '',
    pez_widget_prechat = true,
    pez_widget_prechat_email = true,
    pez_widget_prechat_phone = true,
    pez_widget_prechat_question = true
    pez_widget_color = ''
    pez_widget_avatar = '';


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
            color: pez_widget_color
        }
    } else {
        if (pez_widget_client == 'fundko') {
            data = {
                name: 'FundKo',
                avatar: 'https://panoptez.firebaseapp.com/widget/clients/fundko.png',
                slogan: 'Invest and transform lives',
                welcome_message: 'Hi, how may I help you?',
                pre_chat: true,
                pre_chat_email: true,
                pre_chat_phone: true,
                pre_chat_question: true,
                bubble_text: 'Talk to FundKo!',
                color: '#1a60a3'
            }
        } else if (pez_widget_client == 'mercer') {
            data = {
                name: 'Mercer',
                avatar: 'https://panoptez.firebaseapp.com/widget/clients/mercer.png',
                slogan: 'Make Tomorrow, Today',
                welcome_message: 'Hi, how may I help you?',
                pre_chat: false,
                pre_chat_email: true,
                pre_chat_phone: true,
                pre_chat_question: true,
                bubble_text: 'Talk to Mercer!',
                color: '#00a8c8'
            }
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

    var client = get_client_data();

    var seed = Math.floor(Date.now() / 1000);

    function pez_widget_load(){
        pez_build_container();

        var style = document.createElement('link');
        style.href = pez_widget_url+'common/css/pez_widget_'+pez_widget_device+pez_widget_dotmin+'.css?'+seed;
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.media = 'all';
        document.getElementsByTagName('head')[0].appendChild(style)

        var style = document.createElement('link');
        style.href = pez_widget_url+'clients/'+pez_widget_client+'.css?'+seed;
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.media = 'all';
        document.getElementsByTagName('head')[0].appendChild(style)

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = pez_widget_url+'common/js/strophe.min.js?'+seed;
        script.onload = pez_widget_load_msgpk;
        document.getElementsByTagName('body')[0].appendChild(script)
    }


    function pez_widget_load_msgpk() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = pez_widget_url+'common/js/msgpack/msgpack.min.js?'+seed;
        script.onload = pez_widget_load_main;
        document.getElementsByTagName('body')[0].appendChild(script)
    }
    
    function pez_widget_load_main() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = pez_widget_url+'common/js/pez_widget_main'+pez_widget_dotmin+'.js?'+seed;
        document.getElementsByTagName('body')[0].appendChild(script)
    }

    function pez_build_container() {
        var iframe_url = pez_widget_url+'iframe';
        var htmlstr = '<div id="pez-widget-container" style="display:none;">\n<div id="pez-widget-launcher-close" style="display:none;">CLOSE</div>\n<div id="pez-widget-launcher-open" class="speech-bubble shadow gradient" style="display:none;">Talk to '+client.name+'!</div>\n<span id="pez-widget-container-span" style="display:none;"></span>\n</div>'
        var div = document.createElement('div');
        div.innerHTML = htmlstr;
        document.body.appendChild(div);
    }

    document.addEventListener("DOMContentLoaded", pez_widget_load);

})();
