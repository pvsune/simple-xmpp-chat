import requests
import sys

env = sys.argv[1]
url = 'https://javascript-minifier.com/raw'

files = ['pez_widget', 'pez_widget_main']
folder = 'public/'+env+'/js/'

for js in files:
	minified = requests.post(url, data={'input': open(folder+js+'.js', 'rb').read()})
	f = open(folder+js+'.min.js','w')
	f.seek(0)
	f.write(minified)
	f.truncate()
	f.close()

print done
