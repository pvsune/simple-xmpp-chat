from bottle import get, post, route, run, static_file, template, request, response, template
import requests, json, re


@route('/')
def fundko():
	return template('fundko.html')


@route('/mercer')
def mercer():
	return template('mercer.html')


@get("/widget/common/js/<filepath:re:.*\.js>")
def commonjs(filepath):
	return static_file(filepath, root="public/widget/common/js")


@get("/widget/common/css/<filepath:re:.*\.css>")
def commoncss(filepath):
	return static_file(filepath, root="public/widget/common/css")


@get("/widget/common/images/<filepath:re:.*>")
def commonimages(filepath):
	return static_file(filepath, root="public/widget/common/images")


@get("/widget/clients/<filepath:re:.*>")
def clientfiles(filepath):
	return static_file(filepath, root="public/widget/clients")


run(host='0.0.0.0', port=8080, debug=True, reload=True)
