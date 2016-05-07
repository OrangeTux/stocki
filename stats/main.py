import os
import obo
import MySQLdb

cnx = MySQLdb.connect(
    os.environ.get('MYSQL_HOST'),
    os.environ.get('MYSQL_USER'),
    os.environ.get('MYSQL_PASSWORD'),
    os.environ.get('MYSQL_DATABASE')
)
cursor = cnx.cursor()

query = ("SELECT id, body FROM articles WHERE symbol = %s AND scraped = 1")
symbol = 'MAUV'

cursor.execute(query, [symbol])

gains = {}
losses = {}

for (attr) in cursor:
    id = attr[0]
    gain = id % 2 == 0
    text = attr[1].lower()
    wordlist = obo.stripNonAlphaNum(text)
    wordlist = obo.removeStopwords(wordlist, obo.stopwords)
    dict = obo.wordListToFreqDict(wordlist)
    """
    sorteddict = obo.sortFreqDict(dict)
    for s in sorteddict: print(str(s))
    """
    results = gains if gain else losses
    for key in dict:
        if not key in results:
            results[key] = 0
        results[key] += dict[key]

cursor.close()
cnx.close()

totals = {}
for key in gains:
    if not key in totals:
        totals[key] = 0
    totals[key] += gains[key]
for key in losses:
    if not key in totals:
        totals[key] = 0
    totals[key] += losses[key]
gainPercentages = {}
lossPercentages = {}
for key in gains:
    gainPercentages[key] = float(gains[key]) / totals[key]
for key in losses:
    lossPercentages[key] = float(losses[key]) / totals[key]

print(gainPercentages, lossPercentages)
