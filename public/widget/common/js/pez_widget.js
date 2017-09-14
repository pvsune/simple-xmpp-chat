var pez_widget_api_key = null;
var pez_widget_client = null;
var pez_widget_client_domain = null;
var pez_widget_prefix = 'pez-widget-';
var pez_widget_url = null;
var pez_widget_url = 'http://localhost:8080/widget/';
var pez_widget_dotmin = '';
var pez_widget_use_msgpack = true;


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
    if (pez_widget_client == 'fundko') {
        return {
            name: 'FundKo',
            avatar: 'fundko.png',
            slogan: 'Invest and transform lives',
            pre_chat: true
        }
    } else if (pez_widget_client == 'mercer') {
        return {
            name: 'Mercer',
            avatar: 'mercer.png',
            slogan: 'Make Tomorrow, Today',
            pre_chat: false
        }
    }
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
        if (pez_widget_use_msgpack) script.onload = pez_widget_load_msgpk;
        else script.onload = pez_widget_load_main;
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
