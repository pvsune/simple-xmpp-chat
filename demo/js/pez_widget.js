var pez_widget_api_key = null;
var pez_widget_client_domain = null;
var pez_widget_prefix = 'pez-widget-';
var pez_widget_url = null;
//http://35.188.25.143/demo/';

function pez_widget_build_element(data) {
    var value, div = document.createElement(data.tag);
    for (var prop in data) {
        if (data.hasOwnProperty(prop) && prop!='tag' && prop!='children') {
            value = data[prop]
            if (prop == 'id') value = pez_widget_prefix+value;
            div[prop] = value;
        }
    }
    if (data.hasOwnProperty('children')) {
        var i;
        for (i=0;i<data.children.length;i++) {
            div.appendChild(pez_widget_build_element(data.children[i]));
        }
    }
    return div;
}

(function() {

    var embedjs = document.getElementById(pez_widget_prefix+'embed');
    var srclen = embedjs.src.length
    var dotmin = '';
    if (embedjs.src.substring(srclen-7,srclen) == '.min.js')
        dotmin = '.min';

    pez_widget_api_key = embedjs.getAttribute("data-apikey");
    pez_widget_client_domain = document.domain;
    pez_widget_url = embedjs.src.split('/js/')[0]+'/'

    var seed = Math.floor(Date.now() / 1000);

    function pez_widget_load(){
        pez_build_container();

        var style = document.createElement('link');
        style.href = pez_widget_url+'css/pez_widget'+dotmin+'.css?'+seed;
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.media = 'all';
        document.getElementsByTagName('head')[0].appendChild(style)

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = pez_widget_url+'js/strophe.min.js?'+seed;
        script.onload = pez_widget_load_main;
        document.getElementsByTagName('body')[0].appendChild(script)
    }

    function pez_widget_load_main() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = pez_widget_url+'js/pez_widget_main'+dotmin+'.js?'+seed;
        document.getElementsByTagName('body')[0].appendChild(script)
    }

    function pez_build_container() {
        var iframe_url = pez_widget_url+'iframe';
        var htmlstr = `
        <div id="pez-widget-container" style="display:none;">
            <div id="pez-widget-launcher-close" style="display:none;">CLOSE</div>
            <div id="pez-widget-launcher-open" class="speech-bubble shadow gradient" style="display:none;">Talk to FundKo!</div>
            <span id="pez-widget-container-span" style="display:none;"></span>
        </div>`
        var div = document.createElement('div');
        div.innerHTML = htmlstr;
        document.body.appendChild(div);
    }

    document.addEventListener("DOMContentLoaded", pez_widget_load);

})();
