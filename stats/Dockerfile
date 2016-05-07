FROM python:3.5

WORKDIR /data
RUN apt-get update \
	&& apt-get install -y libmysqlclient-dev python3-dev \
	&& pip install mysqlclient

CMD python main.py
