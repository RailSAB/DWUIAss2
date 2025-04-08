import csv
import time
import requests

def send_packages(csv_file):
    with open(csv_file, 'r') as file:
        reader = csv.DictReader(file)
        first_row = next(reader)
        
        initial_time = int(first_row['Timestamp'])
        send_package(first_row)
        
        for row in reader:
            current_time = int(row['Timestamp'])
            time_diff = current_time - initial_time
            if time_diff > 0:
                time.sleep(time_diff)
            
            send_package(row)
            initial_time = current_time

def send_package(package):
    payload = {
        'ip': package['ip address'],
        'latitude': float(package['Latitude']),
        'longitude': float(package['Longitude']),
        'timestamp': package['Timestamp'],
        'suspicious': int(float(package['suspicious']))
    }
    try:
        response = requests.post(
            'http://server:5000/api/packages',
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        print(f"Sent package from {payload['ip']}, status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Failed to send package: {e}")

if __name__ == '__main__':
    send_packages('ip_addresses.csv')