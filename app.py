from bottle import get, post, route, run, static_file, template, request, response, template
import requests, json, re


@route("/fundko/<env>")
def fundko(env):
	url = 'http://localhost:8080/'+env+'/'
	dotmin = '.min' if env != 'local' else ''
	return template('templates/fundko.html', url=url, dotmin=dotmin)


@route("/mercer/<env>")
def fundko(env):
	url = 'http://localhost:8080/'+env+'/'
	dotmin = '.min' if env != 'local' else ''
	return template('templates/mercer.html', url=url, dotmin=dotmin)
	

@get("/local/<filepath:re:.*\.js>")
@get("/local/<filepath:re:.*\.css>")
def local(filepath):
	return static_file(filepath, root="public/local")


@get("/dev/<filepath:re:.*\.js>")
@get("/dev/<filepath:re:.*\.css>")
def dev(filepath):
	return static_file(filepath, root="public/dev")


@get("/prod/<filepath:re:.*\.js>")
@get("/prod/<filepath:re:.*\.css>")
def prod(filepath):
	return static_file(filepath, root="public/prod")


@get("/library/<filepath:re:.*\.js>")
def library(filepath):
	return static_file(filepath, root="public/library")


@get("/images/<filepath:re:.*\.*>")
def images(filepath):
	return static_file(filepath, root="public/images")


@get("/clients/<filepath:re:.*\.*>")
def clients(filepath):
	return static_file(filepath, root="public/clients")


run(host='0.0.0.0', port=8080, debug=True)
