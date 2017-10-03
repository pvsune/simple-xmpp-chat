import requests
import sys

env = sys.argv[1]
url = 'https://javascript-minifier.com/raw'

files = ['pez_widget', 'pez_widget_main']
folder = 'public/'+env+'/js/'

for js in files:
	source = folder+js+'.js'
	target = folder+js+'.min.js'
	minified = requests.post(url, data={'input': open(source, 'rb').read()})
	f = open(target,'w')
	f.seek(0)
	f.write(minified.text.encode('utf-8'))
	f.truncate()
	f.close()
	print 'minified '+target

print 'done'
