import urllib2
import json
import sys

base_url = 'http://127.0.0.1:3000'
header = {'Content-Type': 'application/json'}

c1 = str(sys.argv[1])
c2 = str(sys.argv[2])

address = base_url + '/conceptpairs/' + c1 + "/" + c2
req = urllib2.Request(address, None, header)
req.get_method = lambda: 'DELETE'
response = urllib2.urlopen(req)
response.close()
