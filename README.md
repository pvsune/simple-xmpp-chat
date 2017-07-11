# ejabberd XMPP Server + strophe.js Client
## Description
Simple chat service using ejabberd + strophe.js. The app will echo back your message.
## Synopsis
```
$ docker-compose up

# Create chat account.
$ docker-compose exec xmpp /home/p1/ejabberd-api register \
  --endpoint=http://127.0.0.1:5280/ \
  --jid=user@localhost \
  --password=icanseeyou
  
# Send message.
$ docker-compose exec web python send_client.py -d \
  -j admin@localhost -p icanseeyou \
  -t user@localhost -m "Hello, World!"

# Run echobot (Optional).
$ docker-compose exec web python echobot.py -d -j admin@localhost -p icanseeyou
```
## How-to
1. Run the compose app. `$ docker-compose up`
1. Create two chat accounts (e.g. _user@localhost_, _admin@localhost_). `See synopsis.`
1. Go to `http://localhost:8080` and login.
1. Send message to user. You should see logs about it. `See synopsis.`

## Disclaimer
This is meant to be a proof-of-concept app. Not for production use.
