#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
    SleekXMPP: The Sleek XMPP Library
    Copyright (C) 2010  Nathanael C. Fritz
    This file is part of SleekXMPP.

    See the file LICENSE for copying permission.
"""

import sys
import logging
import getpass
from optparse import OptionParser

import sleekxmpp


#xmpp_url = '35.188.27.220'
xmpp_url = 'localhost'

authsuccess_response = '[authsuccess]';
userdatareceived_response = '[userdatareceived]';
fail_response = '[fail]'

if sys.version_info < (3, 0):
    reload(sys)
    sys.setdefaultencoding('utf8')
else:
    raw_input = input


class EchoBot(sleekxmpp.ClientXMPP):

    def __init__(self, jid, password):
        sleekxmpp.ClientXMPP.__init__(self, jid, password)
        self.add_event_handler("session_start", self.start)
        self.add_event_handler("message", self.message)
        self.add_event_handler("message_xform", self.message_xform)
        '''
        self.add_event_handler("connected", self.connected)
        self.add_event_handler("changed_status", self.changed_status)
        self.add_event_handler("changed_subscription", self.changed_subscription)
        self.add_event_handler("disco_info", self.disco_info)
        self.add_event_handler("disco_info_request", self.disco_info_request)
        self.add_event_handler("disco_items", self.disco_items)
        self.add_event_handler("disco_items_request", self.disco_items_request)
        self.add_event_handler("disconnected", self.disconnected)
        self.add_event_handler("failed_auth", self.failed_auth)
        self.add_event_handler("gmail_notify", self.gmail_notify)
        self.add_event_handler("got_online", self.got_online)
        self.add_event_handler("got_offline", self.got_offline)
        self.add_event_handler("groupchat_message", self.groupchat_message)
        self.add_event_handler("groupchat_presence", self.groupchat_presence)
        self.add_event_handler("groupchat_subject", self.groupchat_subject)
        self.add_event_handler("message_form", self.message_form)
        self.add_event_handler("presence_available", self.presence_available)
        self.add_event_handler("presence_error", self.presence_error)
        self.add_event_handler("presence_form", self.presence_form)
        self.add_event_handler("presence_probe", self.presence_probe)
        self.add_event_handler("presence_subscribe", self.presence_subscribe)
        self.add_event_handler("presence_subscribed", self.presence_subscribed)
        self.add_event_handler("presence_unavailable", self.presence_unavailable)
        self.add_event_handler("presence_unsubscribe", self.presence_unsubscribe)
        self.add_event_handler("presence_unsubscribed", self.presence_unsubscribed)
        self.add_event_handler("roster_update", self.roster_update)
        self.add_event_handler("sent_presence", self.sent_presence)
        '''

    def start(self, event):
        self.send_presence()
        self.get_roster()

    def message(self, msg):
        print 'Message: '+msg['body']
        print 'Auth: '+('%s' % msg).split('<auth>')[1].split('</auth>')[0]
        if msg['type'] in ('chat', 'normal'):
            msg.reply("Thanks for sending\n%(body)s" % msg).send()

    def message_form(self, data):
        print "message_form"
        print data

    def message_xform(self, data):
        print "message_xform"
        form = data['form']
        reply = fail_response

        api_keys = {
            "s0A1m2P3l4e5K6e7Y": ['localhost','35.188.25.143']
        }

        if form['title'] == 'clientauth':
            api_key = form['fields']['api_key']['value']
            domain = form['fields']['domain']['value']
            print "client authentication: "+api_key+' | '+domain
            if api_key in api_keys and domain in api_keys[api_key]:
                reply = authsuccess_response
        elif form['title'] == 'userdata':
            user_name = form['fields']['user_name']['value']
            user_email = form['fields']['user_email']['value']
            user_phone = form['fields']['user_phone']['value']
            user_question = form['fields']['user_question']['value']
            print "user data: "+user_name+' | '+user_email+' | '+user_phone+' | '+user_question
            # under construction
            reply = userdatareceived_response
        
        print "reply: "+reply
        data.reply(reply).send()

    '''
    def connected(self, data):
		print "connected"
		print data

    def changed_status(self, data):
		print "changed_status"
		print data

    def changed_subscription(self, data):
		print "changed_subscription"
		print data

    def disco_info(self, data):
		print "disco_info"
		print data

    def disco_info_request(self, data):
		print "disco_info_request"
		print data

    def disco_items(self, data):
		print "disco_items"
		print data

    def disco_items_request(self, data):
		print "disco_items_request"
		print data

    def disconnected(self, data):
		print "disconnected"
		print data

    def failed_auth(self, data):
		print "failed_auth"
		print data

    def gmail_notify(self, data):
		print "gmail_notify"
		print data

    def got_online(self, data):
		print "got_online"
		print data

    def got_offline(self, data):
		print "got_offline"
		print data

    def groupchat_message(self, data):
		print "groupchat_message"
		print data

    def groupchat_presence(self, data):
		print "groupchat_presence"
		print data

    def groupchat_subject(self, data):
		print "groupchat_subject"
		print data

    def presence_available(self, data):
		print "presence_available"
		print data

    def presence_error(self, data):
		print "presence_error"
		print data

    def presence_form(self, data):
		print "presence_form"
		print data

    def presence_probe(self, data):
		print "presence_probe"
		print data

    def presence_subscribe(self, data):
		print "presence_subscribe"
		print data

    def presence_subscribed(self, data):
		print "presence_subscribed"
		print data

    def presence_unavailable(self, data):
		print "presence_unavailable"
		print data

    def presence_unsubscribe(self, data):
		print "presence_unsubscribe"
		print data

    def presence_unsubscribed(self, data):
		print "presence_unsubscribed"
		print data

    def roster_update(self, data):
		print "roster_update"
		print data

    def sent_presence(self, data):
		print "sent_presence"
		print data
    '''


if __name__ == '__main__':
    optp = OptionParser()
    optp.add_option('-q', '--quiet', help='set logging to ERROR',
                    action='store_const', dest='loglevel',
                    const=logging.ERROR, default=logging.INFO)
    optp.add_option('-d', '--debug', help='set logging to DEBUG',
                    action='store_const', dest='loglevel',
                    const=logging.DEBUG, default=logging.INFO)
    optp.add_option('-v', '--verbose', help='set logging to COMM',
                    action='store_const', dest='loglevel',
                    const=5, default=logging.INFO)

    optp.add_option("-j", "--jid", dest="jid",
                    help="JID to use")
    optp.add_option("-p", "--password", dest="password",
                    help="password to use")
    opts, args = optp.parse_args()
    logging.basicConfig(level=opts.loglevel,
                        format='%(levelname)-8s %(message)s')

    opts.jid = 'admin@localhost'
    opts.password = 'icanseeyou'

    xmpp = EchoBot(opts.jid, opts.password)
    xmpp.register_plugin('xep_0030') # Service Discovery
    xmpp.register_plugin('xep_0004') # Data Forms
    xmpp.register_plugin('xep_0060') # PubSub
    xmpp.register_plugin('xep_0199') # XMPP Ping

    # xmpp.ssl_version = ssl.PROTOCOL_SSLv3

    # xmpp.ca_certs = "path/to/ca/cert"

    if xmpp.connect((xmpp_url,5222)):
        xmpp.process(block=True)
        print("Done")
    else:
        print("Unable to connect.")
