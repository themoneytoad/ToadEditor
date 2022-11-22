# syntax=docker/dockerfile:1
from python:3.9.5-slim-buster
WORKDIR .
COPY . .
RUN apt-get update \
	&& apt-get -y install libpq-dev gcc
RUN if [ -e requirements.txt ]; then pip install -r requirements.txt; fi
EXPOSE 5100
CMD ["python", "-m", "flask", "--debug", "run", "-h", "0.0.0.0", "-p", "5100"]