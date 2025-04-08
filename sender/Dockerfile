FROM python:3.9-slim

WORKDIR /app
COPY sender.py ip_addresses.csv requirements.txt /app/

RUN pip install -r requirements.txt

CMD ["python", "sender.py"]