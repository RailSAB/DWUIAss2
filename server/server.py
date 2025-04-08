from flask import Flask, request, jsonify
from flask_cors import CORS
from collections import defaultdict
from datetime import datetime

app = Flask(__name__)
CORS(app)

packages = []
statistics = {
    'total_packages': 0,
    'suspicious_packages': 0,
    'locations_count': defaultdict(int),
    'activity': defaultdict(int)
}

@app.route('/api/packages', methods=['POST'])
def receive_package():
    package = request.json

    try:
        timestamp = float(package['timestamp']) 
        package['timestamp'] = timestamp
        hour = datetime.fromtimestamp(timestamp).strftime('%H') 
        package['latitude'] = float(package['latitude'])
        package['longitude'] = float(package['longitude'])
        package['suspicious'] = int(package['suspicious'])
        package['sent'] = False
    except (ValueError, KeyError):
        return jsonify({'error': 'Invalid package format'}), 400

    packages.append(package)

    statistics['total_packages'] += 1
    if package['suspicious'] == 1:
        statistics['suspicious_packages'] += 1

    location_key = f"{package['latitude']},{package['longitude']}"
    statistics['locations_count'][location_key] += 1
    statistics['activity'][hour] += 1

    return jsonify({'status': 'success'}), 200

@app.route('/api/packages', methods=['GET'])
def get_packages():
    unsent_packages = [p for p in packages if not p['sent']]

    for package in unsent_packages:
        package['sent'] = True

    return jsonify({
        'packages': unsent_packages,
        'statistics': {
            'total_packages': statistics['total_packages'],
            'suspicious_packages': statistics['suspicious_packages'],
            'top_locations': dict(sorted(
                statistics['locations_count'].items(),
                key=lambda item: item[1],
                reverse=True
            )[:5]),
            'activity': statistics['activity']
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)