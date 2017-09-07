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
	return static_file(filepath, root="widget/common/js")


@get("/widget/common/css/<filepath:re:.*\.css>")
def commoncss(filepath):
	return static_file(filepath, root="widget/common/css")


@get("/widget/common/images/<filepath:re:.*>")
def commonimages(filepath):
	return static_file(filepath, root="widget/common/images")


@get("/widget/clients/<filepath:re:.*>")
def clientfiles(filepath):
	return static_file(filepath, root="widget/clients")


def enable_cors(fn):
	def _enable_cors(*args, **kwargs):
		response.headers['Access-Control-Allow-Origin'] = '*'
		response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, OPTIONS'
		response.headers['Access-Control-Allow-Headers'] = 'Origin, Accept, Content-Type, X-Requested-With, X-CSRF-Token'

		if request.method != 'OPTIONS':
			return fn(*args, **kwargs)

	return _enable_cors


@route('/widget/link', method=['OPTIONS','POST'])
#@enable_cors
def link():
	url = request.forms.get('url')
	r = requests.get(url)
	response.content_type='application/json'
	if r.headers['content-type'][:6] == 'image/':
		return {
			'data_type': 'image',
			'image': url
		}
	elif 'youtube.com/watch' in url \
			or 'youtube.com/embed/' in url \
			or 'youtu.be/' in url:
		video_id = ''
		embed_url = url
		if 'watch?v=' in embed_url:
			video_id = url.split('watch?v=')[1].split('?')[0].split('#')[0].split('&')[0]
		elif 'youtu.be/' in embed_url:
			video_id = url.split('youtu.be/')[1].split('?')[0].split('#')[0].split('&')[0]
		if video_id != '':
			embed_url = 'https://www.youtube.com/embed/'+video_id
		return {
			'data_type': 'youtube',
			'embed_url': embed_url,
			'url': url
		}
	else:
		htmltext = r.text

		title = ''
		descp = ''
		image = ''
		
		reg = re.compile('<meta (.*)>')
		metas = reg.findall(htmltext)
		for meta in metas:
			if 'og:title"' in meta and title == '':
				title = meta.split('content="')[1].split('"')[0]
			if 'og:description"' in meta and descp == '':
				descp = meta.split('content="')[1].split('"')[0]
			if 'og:image"' in meta and image == '':
				image = meta.split('content="')[1].split('"')[0]
			if '' not in [title,descp,image]:
				break;

		if title == '':
			if '<title>' in htmltext:
				title = htmltext.split('<title>')[1].split('</title>')[0] 

		if image == '':
			reg = re.compile('<img (.*)>')
			imagestrs = reg.findall(htmltext)
			for imagestr in imagestrs:
				if 'logo' in imagestr:
					a = imagestr.split('logo')
					image = a[0].split('"')[-1] + 'logo' + a[1].split('"')[0]
					break;
		
		if image[:1] == '/':
			base = url.split('://')
			image = base[0]+'://'+base[1].split('/')[0]+image

		if len(title) > 100:
			title = title[:100].strip(' ')+'...'
		if len(descp) > 100:
			descp = descp[:100].strip(' ')+'...'
		
		return {
			'data_type': 'page',
			'title': title,
			'descp': descp,
			'image': image,
			'url': url
		}


run(host='0.0.0.0', port=80, server='gunicorn')
