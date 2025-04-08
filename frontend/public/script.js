let scene, camera, renderer, globe, points = [];
let rotationEnabled = true;
let pointsVisible = true;
let activityChart;


function init() {
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    
    createGlobe();
    
    window.addEventListener('resize', onWindowResize);
    document.getElementById('toggle-rotation').addEventListener('click', toggleRotation);
    document.getElementById('toggle-points').addEventListener('click', togglePoints);
    
    fetchData();
    animate();
}

function createGlobe() {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const texture = new THREE.TextureLoader().load('earth_texture.jpg');
    const material = new THREE.MeshBasicMaterial({ map: texture });
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
}

function addPoint(latitude, longitude, isSuspicious) {
    const phi = (90 - latitude) * (Math.PI / 180);
    const theta = (longitude + 180) * (Math.PI / 180);

    const radius = 1.001;
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    const color = isSuspicious ? 0xff0000 : 0x00ff00;
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute([x, y, z], 3));
    const pointMaterial = new THREE.PointsMaterial({ color, size: 0.03 });
    const point = new THREE.Points(pointGeometry, pointMaterial);

    point.userData.createdAt = Date.now();

    globe.add(point);
    points.push(point);
}

function updatePoints() {
    const now = Date.now();
    const tenSecondsAgo = now - 15000;
    
    for (let i = points.length - 1; i >= 0; i--) {
        if (points[i].userData.createdAt < tenSecondsAgo) {
            globe.remove(points[i]);
            points.splice(i, 1);
        }
    }
}

function fetchData() {
    fetch('http://localhost:5000/api/packages')
        .then(response => response.json())
        .then(data => {
            data.packages.forEach(pkg => {
                addPoint(pkg.latitude, pkg.longitude, pkg.suspicious);
            });
            updateStatistics(data.statistics);
            setTimeout(fetchData, 1000);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setTimeout(fetchData, 1000);
        });
}

function updateStatistics(stats) {
    document.getElementById('statistics').innerHTML = `
        <p>Total Packages: ${stats.total_packages}</p>
        <p>Suspicious Packages: ${stats.suspicious_packages}</p>
    `;
    
    const topLocationsDiv = document.getElementById('top-locations');
    topLocationsDiv.innerHTML = '';
    for (const [loc, count] of Object.entries(stats.top_locations)) {
        const [lat, lon] = loc.split(',');
        topLocationsDiv.innerHTML += `<p>${lat}, ${lon}: ${count} hits</p>`;
    }
    
    updateActivityChart(stats.activity);
}

function updateActivityChart(activityData) {
    const hours = Object.keys(activityData).sort();
    const counts = hours.map(h => activityData[h]);
    
    const ctx = document.getElementById('activity-chart').getContext('2d');
    
    if (activityChart) {
        activityChart.data.labels = " ";
        activityChart.data.datasets[0].data = counts;
        activityChart.update();
    } else {
        activityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: " ",
                datasets: [{
                    label: 'Packages amount',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function toggleRotation() {
    rotationEnabled = !rotationEnabled;
    document.getElementById('toggle-rotation').textContent = 
        rotationEnabled ? 'Pause Rotation' : 'Resume Rotation';
}

function togglePoints() {
    pointsVisible = !pointsVisible;
    points.forEach(point => {
        point.visible = pointsVisible;
    });
    document.getElementById('toggle-points').textContent = 
        pointsVisible ? 'Hide Points' : 'Show Points';
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (rotationEnabled) {
        globe.rotation.y += 0.001;
    }
    
    updatePoints();
    renderer.render(scene, camera);
}
init();