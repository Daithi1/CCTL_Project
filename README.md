#CCTL_Project

###Installation

Follow the instructions in install.txt to install the project and its dependencies

###Run the project

With the dependencies installed, go the backend directory:

```
CCTL_Project/backend
```

Start the backend API running on a port of your choice :

```
forever start api.js <port number>

```

The backend is now running on the specified port number.

Go to the frontend directory:

```
CCTL_Project/frontend
```

Start the frontend running on a port of your choice. You will need
to provide the URL for the backend also:

```
forever start server.js <port number> <backend url>
```

For example to run the backend on port 3000, and the frontend of port 80 of the same host,
the two commands would be:

```
forever start api.js 3000

forever start server.js 80 'http://localhost:3000'

```
