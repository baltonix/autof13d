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
            es: '<h3>Alerón Delantero</h3><p>Función: Es el primer componente que interactúa con el aire. Su principal propósito es generar carga aerodinámica en la parte delantera del auto, pegando las ruedas delanteras al asfalto para mejorar el agarre en curva. También es crucial para dirigir el flujo de aire hacia el resto del auto, optimizando la aerodinámica general y el rendimiento de otras partes como el suelo y los pontones. Está compuesto por varios planos y endplates.</p>',
            en: '<h3>Front Wing</h3><p>Function: It is the first component that interacts with the air. Its main purpose is to generate downforce at the front of the car, which sticks the front wheels to the asphalt to improve cornering grip. It is also crucial for directing airflow to the rest of the car, optimizing overall aerodynamics and the performance of other parts such as the floor and pontoons. It consists of multiple planes and endplates.</p>'
        }
    },
    {
        id: 'suspensionhot',
        position: { x: -500.457661, y: 678.647427 - 700, z: 1962.783203 },
        content: {
            es: '<h3>Suspensión (brazos de suspensión)</h3><p>Push Rods: Son elementos de suspensión que conectan el conjunto de la rueda con el chasis. Cuando la rueda se mueve hacia arriba por un bache o fuerzas aerodinámicas, la varilla empuja los resortes o amortiguadores de la suspensión. La varilla es "empujada" a medida que la rueda sube, de ahí el nombre. Las suspensiones push rod suelen ubicar los amortiguadores y resortes más arriba en el chasis, lo que puede mejorar la eficiencia aerodinámica. Pull Rods: Funcionan de manera similar pero al revés. En lugar de ser comprimida, la varilla es "jalada" cuando la rueda sube, activando los componentes de la suspensión. Las suspensiones pull rod permiten montar los amortiguadores y resortes más abajo, lo que baja el centro de gravedad y optimiza el flujo de aire para el rendimiento aerodinámico.</p>',
            en: '<h3>Suspension (wishbones)</h3><p>Push Rods: These are suspension elements that connect the wheel assembly to the chassis. When the wheel moves upwards due to a bump or aerodynamic forces, the push rod compresses the suspension springs or dampers. The rod is "pushed" as the wheel moves up, hence the name. Push rod suspensions typically position the dampers and springs higher in the chassis, which can improve aerodynamic efficiency. Pull Rods: These work similarly but in the opposite way. Instead of being compressed, the rod is "pulled" when the wheel moves up, activating the suspension components. Pull rod suspensions allow for lower mounting of dampers and springs, which can lower the car\'s center of gravity and optimize airflow for aerodynamic performance.</p>'
        },
    },
    {
        id: 'halohot',
        position: { x: -2.627543, y: 1145.001057 - 700, z: 603.72996 },
        content: {
            es: '<h3>Halo</h3><p>Función: Es una estructura de protección obligatoria hecha de titanio, ubicada sobre y alrededor del cockpit del piloto. Su función es proteger la cabeza del piloto de impactos de objetos grandes o en caso de vuelco. A pesar de su apariencia, está diseñada para ser aerodinámicamente eficiente.</p>',
            en: '<h3>Halo</h3><p>Function: It is a mandatory protective structure made of titanium, located above and around the pilot\'s cockpit. Its function is to protect the pilot\'s head from impacts of large objects or in case of rollover. Despite its appearance, it is designed to be aerodynamically efficient.</p>'
        }
    },
    {
        id: 'pontoneshot',
        position: { x: 401.239652, y: 460.866834 - 700, z: 446.605669 },
        content: {
            es: '<h3>Pontones (Sidepods)</h3><p>Función: Son los cuerpos laterales del auto, a ambos lados del cockpit. Su función principal es alojar los radiadores para enfriar la unidad de potencia (motor, ERS). Su forma externa es crítica para la aerodinámica, ya que dirigen el flujo de aire hacia la parte trasera del auto, interactuando con el suelo para generar carga aerodinámica. El diseño de los pontones varía mucho entre equipos.</p>',
            en: '<h3>Pontones (Sidepods)</h3><p>Function: They are the side bodies of the car, on both sides of the cockpit. Their main function is to house the radiators for cooling the power unit (engine, ERS). Their external shape is critical for aerodynamics, as they direct the airflow towards the rear of the car, interacting with the ground to generate downforce. The design of the pontoons varies greatly between teams.</p>'
        }
    },
    {
        id: 'airboxhot',
        position: { x: -37.499606, y: 1326.356835 - 700, z: -507.122144 },
        content: {
            es: '<h3>Airbox (Toma de aire superior)</h3><p>Función: Es la toma de aire principal ubicada sobre y detrás de la cabeza del piloto. Su función principal es suministrar aire limpio al motor para la combustión. La estructura que la rodea también funciona como el principal arco antivuelco del auto.</p>',
            en: '<h3>Airbox (Roll Hoop Intake)</h3><p>Function: It is the main air intake located above and behind the pilot\'s head. Its primary function is to supply clean air to the engine for combustion. The surrounding structure also functions as the main roll hoop of the car.</p>'
        }
    },
    {
        id: 'enginecoverhot',
        position: { x: 3.35227, y: 500.684725, z: -3013.534228 },
        content: {
            es: '<h3>Cubierta del motor / Aleta de tiburón</h3><p>Función: Cubre la unidad de potencia y la transmisión. Su forma está diseñada para ser aerodinámicamente eficiente, ayudando a dirigir el aire hacia el alerón trasero y gestionar la turbulencia. Algunas pueden incluir una "aleta de tiburón" para mejorar la estabilidad en curva, especialmente con el DRS abierto.</p>',
            en: '<h3>Engine Cover / Shark Fin</h3><p>Function: Covers the power unit and transmission. Its shape is designed to be aerodynamically efficient, helping direct air toward the rear wing and manage turbulence. Some may include a "shark fin" to improve yaw stability, especially with the rear wing open (DRS).</p>'
        }
    },
    {
        id: 'diffuserhot',
        position: { x: 4.222827, y: 541.570618 - 700, z: -3650.108163 },
        content: {
            es: '<h3>Difusor</h3><p>Función: Es la sección final y ascendente del suelo en la parte trasera del auto. Ayuda a expandir y desacelerar el aire que ha pasado por debajo del auto (a través de los túneles Venturi), permitiendo que se reintegre de manera controlada con el flujo de aire ambiente. Un difusor eficiente aumenta la succión generada por el suelo, mejorando aún más la carga aerodinámica trasera.</p>',
            en: '<h3>Diffuser</h3><p>Function: It is the final, rising section of the floor at the rear of the car. It helps to expand and decelerate the air that has passed under the car (through the Venturi tunnels), allowing it to reintegrate in a controlled manner with the ambient airflow. An efficient diffuser increases the suction generated by the ground, further improving rear downforce.</p>'
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