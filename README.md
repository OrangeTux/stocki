# stocki
Making moniez thanks to Thomas Bayes

## Fire it up
All services have been defined in `docker-compose.yml`. But before starting
them all you need to set the usernames and passwods. Copy `.env.sample` to
`.env` and set the credentials for the various services.

Now you can boot them all using `docker-compose up`. The following services are
available:

* MariaDB at port 3306
* InfluxDB at port 8086
* Grafana at port 3000
