# ejabberd XMPP Server + converjs Client
## Description
Simple chat service using ejabberd + conversejs. The app will echo back your message.
## Synopsis
```
$ docker-compose up

# Create chat account.
$ docker-compose exec xmpp /home/p1/ejabberd-api register \
  --endpoint=http://127.0.0.1:5280/ \
  --jid=admin@localhost \
  --password=icanseeyou

# Run echobot.
$ docker-compose exec web python echobot.py -d -j admin@localhost -p icanseeyou
```
## How-to
1. Run the compose app. `$ docker-compose up`
1. Create a chat account. `See synopsis.`
1. Run echobot. Check `echobot.py` listening on "message" event and returning back your message. `See synopsis.`
1. Go to `http://localhost:8080`. Toggle chat and message yourself. You should receive back `Thanks for sending <your-message>`

## Disclaimer
This is meant to be a proof-of-concept app. Not for production use.
