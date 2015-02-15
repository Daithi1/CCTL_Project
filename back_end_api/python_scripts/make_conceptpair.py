import urllib2
import json
import sys
import hashlib

base_url = 'http://127.0.0.1:3000'
header = {'Content-Type': 'application/json'}

c1 = str(sys.argv[1])
c2 = str(sys.argv[2])

data = json.dumps({
	'c1' : c1,
	'c2' : c2
	})

address = base_url + '/conceptpairs'
req = urllib2.Request(address, data, header)
response = urllib2.urlopen(req)
response.close()
