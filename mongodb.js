// CRUD create read update delete

const { MongoClient, ObjectId } = require('mongodb');

const connectionURL = 'mongodb://127.0.0.1:27017';
const databaseName = 'task-app-db';


MongoClient.connect(connectionURL, { useNewUrlParser : true, useUnifiedTopology: true }, (error, client) => {
	if(error) {
		return console.log('Unable to connect to database!');
	}
	
	const db = client.db(databaseName);

	// db.collection('users').updateOne({
	// 	_id: new ObjectId("6004eb657f4e4d428016516e")
	// }, {
	// 	$inc: {
	// 		age: 30
	// 	}
	// }).then((result) => {
	// 	console.log(result);
	// }).catch((error) => {
	// 	console.log(error);
	// })

	// db.collection('tasks').updateMany({
	// 	completed: false
	// }, {
	// 	$set:  {
	// 		completed : true
	// 	}
	// }).then((result) => {
	// 	console.log(result);
	// }).catch((error) => {
	// 	console.log(error);
	// });

	db.collection('tasks').deleteOne({
		_id: new ObjectId("60079abce4781e4e4ca2a4e3")
	}).then((result) => {
		console.log(result);
	}).catch((error) => {
		console.log(error);
	})

});


