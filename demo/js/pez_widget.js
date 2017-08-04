var pez_widget_api_key = null;
var pez_widget_client_domain = null;
//var pez_widget_url = 'http://localhost:8080/demo/';
var pez_widget_url = 'http://35.188.25.143/demo/';

function pez_widget_build_element(data) {
    var value, div = document.createElement(data.tag);
    for (var prop in data) {
        if (data.hasOwnProperty(prop) && prop!='tag' && prop!='children') {
            value = data[prop]
            if (prop == 'id') value = 'pez-widget-'+value;
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

    var embedjs = document.getElementById('pez-widget-embed');
    var srclen = embedjs.src.length
    var dotmin = '';
    if (embedjs.src.substring(srclen-7,srclen) == '.min.js')
        dotmin = '.min';

    pez_widget_api_key = embedjs.getAttribute("data-apikey");
    pez_widget_client_domain = document.domain;
    var seed = Math.floor(Date.now() / 1000);

    function pez_widget_load(){
        pez_build_chatbox();

        var style = document.createElement('link');
        style.href = pez_widget_url+'css/pez_widget'+dotmin+'.css?'+seed;
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.media = 'all';
        document.getElementsByTagName('head')[0].appendChild(style)

        
        if (typeof jQuery == 'undefined') {
            var js = document.createElement('script');
            js.src = "https://code.jquery.com/jquery-3.2.1.min.js"
            js.setAttribute('integrity',"sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=");
            js.setAttribute('crossorigin',"anonymous");
            js.onreadystatechange = pez_widget_load2;
            js.onload = pez_widget_load2;
            document.body.appendChild(js);
        } else {
            pez_widget_load2()
        }
    }

    function pez_widget_load2() {
        var js = document.createElement('script');
        js.src = pez_widget_url+'js/strophe.min.js?'+seed
        js.onreadystatechange = pez_widget_load3;
        js.onload = pez_widget_load3;
        document.body.appendChild(js);
    }

    function pez_widget_load3() {
        var js = document.createElement('script');
        js.src = pez_widget_url+'js/strophe.dataform.js?'+seed
        js.onreadystatechange = pez_main_widget_load;
        js.onload = pez_main_widget_load;
        document.body.appendChild(js);
    }

    function pez_main_widget_load() {
        var widgetjs = document.createElement('script');
        widgetjs.async = true;
        widgetjs.src = pez_widget_url+'js/pez_widget_main'+dotmin+'.js?'+seed
        document.body.appendChild(widgetjs);
    }

    function pez_build_chatbox() {
        var prefix = 'pez-widget-';
        var chatbox = {tag: 'div', id: 'container', children: [
                {tag: 'div', id: "speech-bubble", className: 'speech-bubble shadow gradient', hidden: true},
                {tag: 'div', id: 'chatbox', className: 'shadow', hidden: true, children: [
                    {tag: 'div', id: "collapsible", children: [
                        {tag: 'div', className: "chatbox-inner", children: [
                            {tag: 'div', id: "launcher", className: 'open gradient', children: [
                                {tag: 'span', innerText: "Close"}]},
        // -------- pre-chat form
                            {tag: 'div', id: 'form', children: [
                                {tag: 'div', className: 'field field-name', children: [
                                    {tag: 'div', className: 'label', innerText: 'Name*'},
                                    {tag: 'div', className: 'input-holder', children: [
                                        {tag: 'input', type: 'text', id: 'form-name'}]}]},
                                {tag: 'div', className: 'field field-email', children: [
                                    {tag: 'div', className: 'label', innerText: 'E-mail*'},
                                    {tag: 'div', className: 'input-holder', children: [
                                        {tag: 'input', type: 'text', id: 'form-email'}]}]},
                                {tag: 'div', className: 'field field-phone', children: [
                                    {tag: 'div', className: 'label', innerText: 'Phone'},
                                    {tag: 'div', className: 'input-holder', children: [
                                        {tag: 'input', type: 'text', id: 'form-phone'}]}]},
                                {tag: 'div', className: 'field field-question', children: [
                                    {tag: 'div', className: 'label', innerText: 'Your Question*'},
                                    {tag: 'div', className: 'input-holder', children: [
                                        {tag: 'textarea', size: '3', id: 'form-question'}]}]},
                                {tag: 'div', className: 'field', children: [
                                    {tag: 'input', type: "button", value: 'Start Chat!', id: 'form-button', className: 'gradient'}]},
                                {tag: 'div', className: 'field', children: [
                                    {tag: 'div', id: 'form-error'}]}]},
        // ----------- chat messages area
                            {tag: 'div', id: "messages-area", children: [
                                {tag: 'div', id: "messages-area-inner"}]},
        // ----------- message input and button
                            {tag: 'div', id: 'input-area', children: [
                                {tag: 'input', type: 'text', id: 'message'},
                                {tag: 'input', type: 'button', value: 'Send', id: "send-button"}]}]}]}]}]}
        document.body.appendChild(pez_widget_build_element(chatbox));
    }

    document.addEventListener("DOMContentLoaded", pez_widget_load);
  
})();
