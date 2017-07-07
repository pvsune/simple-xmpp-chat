FROM python:3.5

COPY ./requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

COPY . /simple_chat
WORKDIR /simple_chat

EXPOSE 8080
CMD python app.py
