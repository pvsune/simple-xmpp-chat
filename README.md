# ejabberd XMPP Server + strophe.js Client
## Description
Simple chat service using ejabberd + strophe.js.
## Synopsis
```
$ docker-compose up

# Create chat account.
$ docker-compose exec xmpp /home/p1/ejabberd-api register \
  --endpoint=http://127.0.0.1:5280/ \
  --jid=user@localhost \
  --password=icanseeyou
  
# Run echobot.
$ docker-compose exec web python echobot.py -d -j admin@localhost -p icanseeyou
  
# Send message on server. (Optional)
$ docker-compose exec web python send_client.py -d \
  -j admin@localhost -p icanseeyou \
  -t user@localhost -m "Hello, World!"
```
## How-to
1. Run the compose app. `$ docker-compose up`
1. Create two chat accounts (e.g. _user@localhost_, _admin@localhost_). `See synopsis.`
1. Go to `http://localhost:8080` and login.
1. Send message to admin. You should see logs about it.

## Disclaimer
This is meant to be a proof-of-concept app. Not for production use.
