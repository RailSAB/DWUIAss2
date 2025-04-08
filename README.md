- frontend folder contains public folder with all  files relsted to vizualization, Dockerfile for frontend and nginx config file
- sender folder contains csv file with "senders" related data, Dockerfile, requirements for script, sender.py script
- server folder contains all files related to backend: server.py script, reuiremetns for script, Dockerfile for server
- docker-compose.yml

# Vizualization
- The visualization is a globe (the world) with dots appearing on it that show the location of the sent packet, the color of the packet shows Suspicious it or not. There is also a section with statistics that updates the data with the arrival of new packets. There is also a barplot with the number of packets for the whole time.

# To run
- clone project and run in terminal:
- docker-compose build --no-cache
- docker-compose up
- to access vizualization go to http://127.0.0.1:8080/
