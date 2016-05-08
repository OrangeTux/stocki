require('colors');
var fs = require('fs');

var config = JSON.parse(fs.readFileSync('config.default.json'));
console.log("config.default.json.json read...".green);
try {
    var user_config = JSON.parse(fs.readFileSync('config.json')), key;
    console.log("config.json read...".green);
    for (key in user_config) { // Merge it
        if (user_config.hasOwnProperty(key)) {
            config[key] = user_config[key];
        }
    }
} catch (err) {
    console.log("Could not read/parse config.json...!".red.underline, err);
}
console.log("Config:".green, config);

 
if (!config.twitter_consumer_key || !config.twitter_consumer_secret ||
	!config.twitter_access_token_key || !config.twitter_access_token_secret
){
	console.warn("Missing Twitter configuration...".yellow);
	process.exit(1);
}

var Twitter = require('twitter');
var client = new Twitter({
	consumer_key       : config.twitter_consumer_key,
	consumer_secret    : config.twitter_consumer_secret,
	access_token_key   : config.twitter_access_token_key,
	access_token_secret: config.twitter_access_token_secret
});
process.on('uncaughtException', function(error) {
	console.error("uncaughtException:".red, error);
});

if (!config.mysql_host || !config.mysql_user || !config.mysql_pass || !config.mysql_db) {
	console.warn("Missing MySQL configuration...".yellow);
	process.exit(1);
}
var mysql      = require('mysql');
var connection = mysql.createConnection({
	host    : '82.196.6.127',
	user    : 'admin',
	password: 'WGydgdSVnwsWU2yP5Ypx2WYX',
	database: 'stocki'
});

connection.connect();

var searchterms = '$TSLA, $GOOG, $MSFT, $AAPL';

function onTweet(tweet){
	console.log(tweet.text.yellow);

	var insert = { "json": JSON.stringify(tweet) };
	var query = connection.query('INSERT INTO tweets_raw SET ?', insert, function(err, result) {
		if (err) {
			console.error("Insert error:".red, err);
			return;
		}
		console.log("Inserted: ".green, result.insertId);
	});
}

client.stream('statuses/filter', {track: searchterms}, function(stream) {
	stream.on('data', onTweet);
 
	stream.on('error', function(err) {
		console.error("Stream error:".red, err);
	});
});
console.log("Listening to:".grey, searchterms);

// client.get('search/tweets', {q: searchterms}, function(error, tweets, response){
// 	if (error){
// 		console.error(error);
// 		return;
// 	}

// 	tweets.statuses.forEach(onTweet);
// });
