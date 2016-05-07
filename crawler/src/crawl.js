import mysql from 'mysql'
import { RateLimiter } from 'limiter'
import request from 'request'

const token = process.env['DIFFBOT_TOKEN']

var client = mysql.createConnection({
	host: process.env['MYSQL_HOST'],
	user: process.env['MYSQL_USER'],
	password: process.env['MYSQL_PASSWORD'],
	database: process.env['MYSQL_DATABASE']
})

var limiter = new RateLimiter(1, 10000) // one per ten seconds
function throttledRequest (...args) {
	limiter.removeTokens(1, () => {
		request.apply(this, args)
	})
}

client.query('SELECT id, url FROM articles WHERE scraped = 0 ORDER BY insert_timestamp ASC', (err, results) => {
	var i = 0
	function next () {
		var result = results[i]
		console.log(result)
		var j = i
		i += 1

		if ( ! result) return console.info('No more results to process.')

		var url = `http://api.diffbot.com/v3/article?token=${token}&url=${encodeURIComponent(result.url)}`

		throttledRequest({
			url,
			json: true
		}, (err, res, body) => {
			next()

			if (err) return console.error(err)
			var info = body.objects[0]
			if (typeof info !== 'object') return console.error('No info')

			var symbol = 'TSLA'
			client.query(
				`
				UPDATE articles
				SET symbol = ?, title = ?, body = ?,
					timestamp = ?, scraped = 1
				WHERE id = ?
				LIMIT 1
				`,
				[symbol, info.title, info.text, new Date(info.date), result.id],
				(err) => {
					if (j + 1 === results.length) client.end()
					if (err) console.error(err)
				}
			)
		})
	}

	next()
})
