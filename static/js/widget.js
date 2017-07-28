(function () {

    var scriptName = "embed.js"; //name of this script, used to get reference to own tag
    var jQuery; //noconflict reference to jquery
    var jqueryPath = "http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js";
    var jqueryVersion = "1.8.3";
    var scriptTag; //reference to the html script tag

    /******** Get reference to self (scriptTag) *********/
    var allScripts = document.getElementsByTagName('script');
    var targetScripts = [];
    for (var i in allScripts) {
        var name = allScripts[i].src
        if(name && name.indexOf(scriptName) > 0)
            targetScripts.push(allScripts[i]);
    }

    scriptTag = targetScripts[targetScripts.length - 1];

    /******** helper function to load external scripts *********/
    function loadScript(src, onLoad) {
        var script_tag = document.createElement('script');
        script_tag.setAttribute("type", "text/javascript");
        script_tag.setAttribute("src", src);

        if (script_tag.readyState) {
            script_tag.onreadystatechange = function () {
                if (this.readyState == 'complete' || this.readyState == 'loaded') {
                    onLoad();
                }
            };
        } else {
            script_tag.onload = onLoad;
        }
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(script_tag);
    }

    /******** helper function to load external css  *********/
    function loadCss(href) {
        var link_tag = document.createElement('link');
        link_tag.setAttribute("type", "text/css");
        link_tag.setAttribute("rel", "stylesheet");
        link_tag.setAttribute("href", href);
        (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(link_tag);
    }

    /******** load jquery into 'jQuery' variable then call main ********/
    if (window.jQuery === undefined || window.jQuery.fn.jquery !== jqueryVersion) {
        loadScript(jqueryPath, initjQuery);
    } else {
        initjQuery();
    }

    function initjQuery() {
        jQuery = window.jQuery.noConflict(true);
        main();
    }

    /******** starting point for your widget ********/
    function main() {
      //your widget code goes here

        jQuery(document).ready(function ($) {
            //or you could wait until the page is ready

            //example jsonp call
            //var jsonp_url = "www.example.com/jsonpscript.js?callback=?";
            //jQuery.getJSON(jsonp_url, function(result) {
            //    alert("win");
            //});

            // TODO: Do not add big css files that might affect host site's layout.
            // Do inline styles?
            loadCss("https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css");
            loadCss("https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css");
            loadCss("/static/css/styles.css");

            jQuery('body').append('<div class="pez-chat"><div class="chat-panel panel panel-default"><div class="panel-body"><h4 class="text-center">Pez.AI Messenger</h4><hr></div><div class="panel-footer"><div class="input-group"><input id="btn-input" type="text" class="form-control input-sm" placeholder="Type your message here..." /><span class="input-group-btn"><button class="btn btn-warning btn-sm" id="btn-chat">Send</button></span></div></div></div><div class="text-right"><button class="btn btn-primary" id="pez-btn"><span class="h4"><i class="fa fa-comments fa-fw"></i> Chat</span></button></div></div>');

            jQuery('div.pez-chat div.chat-panel').hide();
            jQuery('#pez-btn').click(function () {
                jQuery('div.pez-chat div.chat-panel').toggle();
            });

            //example script load
            loadScript("/static/js/strophe.js", function() {
                var BOSH_SERVICE = 'http://35.188.27.220:5280/http-bind';
                var connection = null;

                function log(msg)
                {
                    jQuery('div.pez-chat div.panel-body').append('<p></p>').append(document.createTextNode(msg)).append('<hr>');
                }

                function onConnect(status)
                {
                    if (status == Strophe.Status.CONNECTING) {
                        console.log('Strophe is connecting.');
                    } else if (status == Strophe.Status.CONNFAIL) {
                        console.log('Strophe failed to connect.');
                        // jQuery('#connect').get(0).value = 'connect';
                    } else if (status == Strophe.Status.DISCONNECTING) {
                        console.log('Strophe is disconnecting.');
                    } else if (status == Strophe.Status.DISCONNECTED) {
                        console.log('Strophe is disconnected.');
                        // jQuery('#connect').get(0).value = 'connect';
                    } else if (status == Strophe.Status.CONNECTED) {
                        console.log('Strophe is connected.');
                        console.log('ECHOBOT: Send a message to ' + connection.jid +
                            ' to talk to me.');

                        connection.addHandler(onMessage, null, 'message', null, null,  null);
                        connection.send($pres().tree());
                    }
                }

                function onMessage(msg) {
                    var to = msg.getAttribute('to');
                    var from = msg.getAttribute('from');
                    var type = msg.getAttribute('type');
                    var elems = msg.getElementsByTagName('body');

                    if (type == "chat" && elems.length > 0) {
                        var body = elems[0];

                        console.log('ECHOBOT: I got a message from ' + from + ': ' +
                            Strophe.getText(body));
                        log('Agent: ' + Strophe.getText(body));
                    }

                    // we must return true to keep the handler alive.
                    // returning false would remove it after it finishes.
                    return true;
                }

                function onSend() {
                    var body = jQuery('#btn-input').val()
                    var user = 'admin@localhost';

                    var reply = $msg({to: user, from: connection.jid, type: 'chat'})
                        .c("body").t(body);
                    connection.send(reply.tree());
                    console.log('ECHOBOT: I sent ' + user + ': ' + body);
                    log('Me: ' + body);
                }

                jQuery(document).ready(function () {
                    connection = new Strophe.Connection(BOSH_SERVICE);

                    // Uncomment the following lines to spy on the wire traffic.
                    //connection.rawInput = function (data) { log('RECV: ' + data); };
                    //connection.rawOutput = function (data) { log('SEND: ' + data); };

                    // Uncomment the following line to see all the debug output.
                    //Strophe.log = function (level, msg) { log('LOG: ' + msg); };


                    connection.connect('localhost', null, onConnect);
                    jQuery('#btn-chat').bind('click', onSend);
                });
            });
        });

    }

})();
