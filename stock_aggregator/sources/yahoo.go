package sources

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
)

const (
	Host = "http://chartapi.finance.yahoo.com/instrument/1.1"
)

type Yahoo struct {
	Source string
	Meta   *Meta
	Series []*Series
}

func NewYahoo(ticker string) *Yahoo {
	url := fmt.Sprintf("%s/%s/chartdata;type=quote;range=15d/json", Host, ticker)

	resp, err := http.Get(url)
	if err != nil {
		fmt.Errorf("Could not fetch data for %s: %s", ticker, err)
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	data := string(body)
	data = string(strings.Trim(data, "finance_charts_json_callback("))
	data = string(strings.Trim(data, ")"))

	var y Yahoo
	if err = json.Unmarshal([]byte(data), &y); err != nil {
		panic(err)
	}

	return &y
}

type Meta struct {
	Ticker       string `json:"ticker"`
	CompanyName  string `json:"Company-Name"`
	ExchangeName string `json:"Exchange-Name"`
}

type Series struct {
	Timestamp int64   `json:"Timestamp"`
	Close     float64 `json:"close"`
	High      float64 `json:"high"`
	Low       float64 `json:"low"`
	Open      float64 `json:"open"`
	Volume    float64 `json:"volume"`
}
