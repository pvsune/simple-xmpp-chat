from bottle import route, run, template


@route('/')
def index():
    return template('index.html', {'url': 'http://localhost:5280/http-bind'})

run(host='0.0.0.0', port=8080)
