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
        pez_build_chatbox();

        var style = document.createElement('link');
        style.href = pez_widget_url+'css/pez_widget'+dotmin+'.css?'+seed;
        style.rel = 'stylesheet';
        style.type = 'text/css';
        style.media = 'all';
        document.getElementsByTagName('head')[0].appendChild(style)

        var js = document.createElement('script');
        js.src = pez_widget_url+'js/strophe.min.js?'+seed
        js.onreadystatechange = pez_main_widget_load;
        //js.onload = pez_main_widget_load;
        //document.body.appendChild(js);
    }

    function pez_main_widget_load() {
        var widgetjs = document.createElement('script');
        widgetjs.async = true;
        widgetjs.src = pez_widget_url+'js/pez_widget_main'+dotmin+'.js?'+seed
        document.body.appendChild(widgetjs);
    }

    function pez_build_chatbox() {
        var iframe_url = pez_widget_url+'iframe';
        /*
        var htmlstr = `
        <div style="margin-top: 0px; margin-right: 0px; margin-bottom: 0px; padding: 0px; border: 0px none; background: transparent none repeat scroll 0% 0%; overflow: hidden; position: fixed; z-index: 16000014; right: 10px; bottom: 0px; border-top-left-radius: 5px; border-top-right-radius: 5px; display: block; width: 290px; height: 400px; box-shadow: 0px 0px 3px 2px rgba(0, 0, 0, 0.1);">
            <iframe id="pez-widget-iframe" style="background-color: transparent; vertical-align: text-bottom; position: relative; width: 100%; height: 100%; min-width: 100%; min-height: 100%; max-width: 100%; max-height: 100%; margin: 0px; overflow: hidden; display: block;" src="`+iframe_url+`" frameborder="0"></iframe>
        </div>`;
        */
        var htmlstr = `
        <div style="position: fixed; width: 0px; height: 0px; bottom: 0px; right: 0px; z-index: 2147483647;">
            <div>
                <span>
                    <div class="intercom-messenger-frame">
                        <iframe allowfullscreen="true" src="http://localhost:8080/demo/iframe"></iframe>
                    </div>
                </span>
            </div>
        </div>`
        var div = document.createElement('div');
        div.innerHTML = htmlstr;
        document.body.appendChild(div);
    }
    
    function pez_build_chatbox2() {
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

    document.addEventListener("DOMContentLoaded", pez_build_chatbox);
  
})();
