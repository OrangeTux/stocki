package main

import (
	"fmt"
	"os"
	"time"

	"github.com/influxdata/influxdb/client/v2"
	"github.com/orangetux/stocki/stock_aggregator/sources"
)

func main() {
	c, err := client.NewHTTPClient(client.HTTPConfig{
		Addr:     os.Getenv("INFLUXDB_HOST"),
		Username: os.Getenv("INFLUXDB_USER"),
		Password: os.Getenv("INFLUXDB_PASSWORD"),
	})

	if err != nil {
		panic(fmt.Sprintf("Couldn't connect to InfluxDB: %s", err))
	}
	defer c.Close()

	bp, err := client.NewBatchPoints(client.BatchPointsConfig{
		Database:  "stock",
		Precision: "s",
	})

	if err != nil {
		panic(fmt.Sprintf("Couldn't create batchpoints: %s", err))
	}

	y := sources.NewYahoo("TSLA")

	tags := map[string]string{
		"data_source":   "yahoo",
		"ticker":        y.Meta.Ticker,
		"company_name":  y.Meta.CompanyName,
		"exchange_name": y.Meta.ExchangeName,
	}

	for _, s := range y.Series {
		fields := map[string]interface{}{
			"close":  s.Close,
			"open":   s.Open,
			"high":   s.High,
			"low":    s.Low,
			"volume": s.Volume,
		}

		pt, err := client.NewPoint("stock", tags, fields, time.Unix(s.Timestamp, 0))
		if err != nil {
			panic(fmt.Sprintf("Could not create point: %s", err))
		}

		bp.AddPoint(pt)
	}
	err = c.Write(bp)
	if err != nil {
		panic(err)
	}

}
