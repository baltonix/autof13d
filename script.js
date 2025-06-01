// Configuración inicial
let scene, camera, renderer, controls;
let model;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let hotspots = [];
let hotspotObjects = [];
let modelCenter = null;
let modelScale = 1;
let activeHotspot = null;

// Definición de hotspots
const hotspotDefinitions = [
    {
        id: 'aleron-delantero-yz-pos',
        position: { x: -685.473297, y: -352.138322 , z: 2927.529448 },
        content: {
            es: '<h3>Alerón Delantero</h3><p>Genera carga aerodinámica en la parte delantera y dirige el flujo de aire hacia el resto del auto. Es clave para el agarre en curvas y la eficiencia aerodinámica general.</p>',
            en: '<h3>Front Wing</h3><p>Generates front downforce and directs airflow to the rest of the car. It is crucial for cornering grip and overall aerodynamic efficiency.</p>'
        }
    },
    {
        id: 'suspensionhot',
        position: { x: -500.457661, y: 678.647427 - 700, z: 1962.783203 },
        content: {
            es: '<h3>Suspensión</h3><p>Transfiere el movimiento de la rueda al chasis y ayuda a mantener el control del auto. Su diseño también mejora la eficiencia aerodinámica.</p>',
            en: '<h3>Suspension</h3><p>Transfers wheel movement to the chassis and helps maintain car control. Its design also improves aerodynamic efficiency.</p>'
        }
    },
    {
        id: 'halohot',
        position: { x: -2.627543, y: 1145.001057 - 700, z: 603.72996 },
        content: {
            es: '<h3>Halo</h3><p>Estructura de titanio que protege la cabeza del piloto ante impactos y vuelcos. Es obligatoria y está diseñada para ser segura y aerodinámica.</p>',
            en: '<h3>Halo</h3><p>Titanium structure that protects the driver\'s head from impacts and rollovers. It is mandatory and designed to be both safe and aerodynamic.</p>'
        }
    },
    {
        id: 'pontoneshot',
        position: { x: 401.239652, y: 460.866834 - 700, z: 446.605669 },
        content: {
            es: '<h3>Pontones</h3><p>Alojan los radiadores para enfriar el motor y guían el aire hacia la parte trasera. Su forma afecta la carga aerodinámica y la refrigeración.</p>',
            en: '<h3>Sidepods</h3><p>House radiators to cool the engine and guide air to the rear. Their shape affects downforce and cooling.</p>'
        }
    },
    {
        id: 'airboxhot',
        position: { x: -37.499606, y: 1326.356835 - 700, z: -507.122144 },
        content: {
            es: '<h3>Airbox</h3><p>Entrada principal de aire para el motor, ubicada sobre el piloto. También forma parte de la estructura de seguridad del auto.</p>',
            en: '<h3>Airbox</h3><p>Main air intake for the engine, located above the driver. It is also part of the car\'s safety structure.</p>'
        }
    },
    {
        id: 'enginecoverhot',
        position: { x: 3.35227, y: 500.684725, z: -3013.534228 },
        content: {
            es: '<h3>Cubierta Motor</h3><p>Cubre el motor y la transmisión, ayudando a la aerodinámica trasera. Puede incluir una aleta para mejorar la estabilidad.</p>',
            en: '<h3>Engine Cover</h3><p>Covers the engine and transmission, helping rear aerodynamics. May include a fin for better stability.</p>'
        }
    },
    {
        id: 'diffuserhot',
        position: { x: 4.222827, y: 541.570618 - 700, z: -3650.108163 },
        content: {
            es: '<h3>Difusor</h3><p>Expande y desacelera el aire bajo el auto, aumentando la succión y la carga aerodinámica trasera. Es clave para el rendimiento en curvas.</p>',
            en: '<h3>Diffuser</h3><p>Expands and slows air under the car, increasing suction and rear downforce. It is key for cornering performance.</p>'
        }
    }
];

function getLangFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lang') === 'en' ? 'en' : 'es'; // Por defecto español
}
let currentLang = getLangFromUrl();

// Inicialización
function init() {
    // Crear escena
    scene = new THREE.Scene();
    scene.background = null; // Eliminamos el fondo para que sea transparente

    // Crear cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // Posicionamos la cámara para ver el auto desde el costado, más cerca y más arriba
    camera.position.set(2.5, 1.5, 0);
    camera.lookAt(0, 0, 0);

    // Crear renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = false;
    document.getElementById('viewer-container').appendChild(renderer.domElement);

    // Añadir controles
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Añadir luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(1, 2, 2);
    scene.add(directionalLight);

    // Luz direccional extra (opcional, baja intensidad)
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    directionalLight2.position.set(-2, -1, -2);
    scene.add(directionalLight2);

    // Plano receptor de sombras
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    const shadowPlane = new THREE.Mesh(planeGeometry, planeMaterial);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.5;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Cargar modelo
    loadModel();

    // Crear hotspots
    createHotspots();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onMouseClick);
    document.querySelector('.close-button').addEventListener('click', hideHotspotInfo);

    // Iniciar animación
    animate();
}

// Cargar modelo
function loadModel() {
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('Project Name.glb', (gltf) => {
        model = gltf.scene;

        // No modificar materiales, dejar como vienen exportados

        // Centrar y escalar el modelo (menos agresivo)
        const box = new THREE.Box3().setFromObject(model);
        modelCenter = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        modelScale = 4 / maxDim; // Escala menos agresiva
        model.scale.multiplyScalar(modelScale);
        model.position.sub(modelCenter.multiplyScalar(modelScale));

        scene.add(model);
        // Crear hotspots después de cargar el modelo
        createHotspots();
        // Ocultar loader
        const loaderDiv = document.getElementById('loader');
        if (loaderDiv) loaderDiv.style.display = 'none';
    });
}

// Crear hotspots
function createHotspots() {
    // Eliminar hotspots previos si existen
    hotspotObjects.forEach(h => scene.remove(h.object));
    hotspotObjects = [];
    
    hotspotDefinitions.forEach(hotspot => {
        // Ajustar posición del hotspot igual que el modelo
        const pos = new THREE.Vector3(hotspot.position.x, hotspot.position.y, hotspot.position.z);
        if (modelCenter && modelScale) {
            pos.sub(modelCenter).multiplyScalar(modelScale);
        }
        // Crear esfera para el hotspot (azul)
        const geometry = new THREE.SphereGeometry(0.03, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x0074D9 });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.position.copy(pos);
        scene.add(sphere);
        hotspotObjects.push({
            object: sphere,
            data: hotspot
        });
    });
}

// Manejar clic del mouse
function onMouseClick(event) {
    // Calcular posición normalizada del mouse
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Actualizar raycaster
    raycaster.setFromCamera(mouse, camera);

    // Verificar intersecciones con hotspots
    const intersects = raycaster.intersectObjects(hotspotObjects.map(h => h.object));

    if (intersects.length > 0) {
        const hotspotObject = hotspotObjects.find(h => h.object === intersects[0].object);
        if (hotspotObject) {
            showHotspotInfo(hotspotObject.data);
        }
    }
}

// Mostrar información del hotspot
function showHotspotInfo(hotspot) {
    const hotspotInfo = document.getElementById('hotspot-info');
    const hotspotText = hotspotInfo.querySelector('.hotspot-text');
    hotspotText.innerHTML = hotspot.content[currentLang] || hotspot.content['es'];
    hotspotInfo.style.display = 'block';
    activeHotspot = hotspot;
}

// Ocultar información del hotspot
function hideHotspotInfo() {
    document.getElementById('hotspot-info').style.display = 'none';
    activeHotspot = null;
}

// Manejar redimensionamiento de ventana
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Bucle de animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);

    // Si hay un hotspot activo, mueve el popup
    if (activeHotspot) {
        const hotspotInfo = document.getElementById('hotspot-info');
        // Busca el objeto 3D correspondiente
        const hotspotObj = hotspotObjects.find(h => h.data.id === activeHotspot.id);
        if (hotspotObj) {
            // Proyecta la posición 3D a 2D
            const vector = hotspotObj.object.position.clone();
            vector.project(camera);

            const rect = renderer.domElement.getBoundingClientRect();
            const x = (vector.x + 1) / 2 * rect.width + rect.left;
            const y = (-vector.y + 1) / 2 * rect.height + rect.top;

            hotspotInfo.style.left = `${x + 10}px`;
            hotspotInfo.style.top = `${y + 10}px`;
        }
    }
}

// Iniciar la aplicación
init();

// Loader visual
if (!document.getElementById('loader')) {
    const loaderDiv = document.createElement('div');
    loaderDiv.id = 'loader';
    loaderDiv.style.position = 'fixed';
    loaderDiv.style.top = '0';
    loaderDiv.style.left = '0';
    loaderDiv.style.width = '100vw';
    loaderDiv.style.height = '100vh';
    loaderDiv.style.background = 'rgba(255,255,255,0.9)';
    loaderDiv.style.display = 'flex';
    loaderDiv.style.alignItems = 'center';
    loaderDiv.style.justifyContent = 'center';
    loaderDiv.style.zIndex = '2000';
    loaderDiv.innerHTML = '<span style="font-size:2rem;color:#333;font-family:sans-serif;">Cargando modelo 3D...</span>';
    document.body.appendChild(loaderDiv);
} 