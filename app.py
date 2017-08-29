from bottle import get, route, run, static_file, template


@route('/')
def index():
    return template('index.html', {'url': 'http://localhost:5280/http-bind'})


@get("/static/js/<filepath:re:.*\.js>")
def js(filepath):
    return static_file(filepath, root="static/js")


@get("/static/css/<filepath:re:.*\.css>")
def css(filepath):
    return static_file(filepath, root="static/css")

run(host='0.0.0.0', port=80, server='gunicorn')
