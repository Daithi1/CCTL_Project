import urllib2 as url
import json
import sys
import re
from bs4 import BeautifulSoup as bs

api_url = sys.argv[1]
print api_url

base_url = 'http://134.226.40.5:8080/ct4l/knowledge'
header = {'Content-Type': 'application/json'}

req = url.Request(base_url, None, header)
res = url.urlopen(req)

soup = bs(res.read())
res.close()

links = soup.find_all('a', 'summary url')

for l in links:
	address = l.get('href')

	req = url.Request(address, None, header)
	res = url.urlopen(req)

	page_soup = bs(res.read())
	res.close()

	title = page_soup.find(id='parent-fieldname-title').get_text()
	description = page_soup.find(id='parent-fieldname-description').get_text()
	description = description + page_soup.find('div', {'id' : re.compile('parent-fieldname-text.*')}).get_text()

	data = {
	'concept' : {
				'name' : title,
				'description' : description
				}
	}
	
	address = api_url + '/concepts'
	print address
	req = url.Request(address, json.dumps(data), header)
	res = url.urlopen(req)
	res.close()

