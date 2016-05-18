# Indoor positioning system server

This repository is an indoor positioning system who has the goal to locate users inside a building. It can use different fingerprint model to work. Here you will find the server part. It was written in JavaScript with NodeJs. You also need a database to save all fingerprints data.

This repository is a part of 2 other repository:
- System AP : [indoor-positioning-system-ap](https://github.com/FlorianeEnnaji/indoor-positioning-system-ap)
- Android app : [indoor-positioning-system-android](https://github.com/FlorianeEnnaji/indoor-positioning-system-android)

## Instalation 

1. First install all dependencies by typing:

	```
	npm install
	```

2. Then you need to create a file named "databaseConf.js" with the database configuration (you can use the example as model). Place it inside the directory **configurations**
3. Launch the server:

	```
	node server.js
	```

## Configuration

There are several parameters you can change to configure the server, there are all located inside the file: **configurations/globalConf.js**

## Example 

You can test the server with a sample of data, to load this data in your database, you can use the migration (sequelize-cli package need to be installed globaly)

	sequelize --config configurations/databaseConf.json db:migrate
	sequelize --config configurations/databaseConf.json db:seed:all

Then launch the server:

	node server.js


We also wrote a script that simulates a user who want to be located:

	node test/ClientTests.js

At the end you can remove all data inside the DataBase:

	sequelize --config configurations/databaseConf.json db:migrate:undo:all