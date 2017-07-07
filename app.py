from bottle import route, run, template


@route('/')
def index():
    return template('index.html')

run(host='localhost', port=8080)
