import * as THREE from 'three';
import { LabEnvironment } from './Lab/LabEnvironment.js';
import { Player } from './Characters/Player.js';
import { NPCManager } from './Characters/NPCManager.js';
import { ExperimentManager } from './Experiments/ExperimentManager.js';
import { InputManager } from './Input/InputManager.js';
import { UIManager } from './UI/UIManager.js';
import { InstrumentManager } from './Instruments/InstrumentManager.js';

class LabSimulation {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 100, 500);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.6, 5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('container').appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.running = false;

        this.init();
    }

    async init() {
        try {
            this.uiManager = new UIManager();
            this.inputManager = new InputManager();

            this.labEnvironment = new LabEnvironment(this.scene);
            await this.labEnvironment.init();

            this.player = new Player(this.scene, this.camera, this.inputManager);
            this.player.init();

            this.npcManager = new NPCManager(this.scene);
            await this.npcManager.init();

            this.instrumentManager = new InstrumentManager(this.scene);
            await this.instrumentManager.init();

            this.experimentManager = new ExperimentManager(this.scene, this.player);
            await this.experimentManager.init();

            this.setupLighting();

            window.addEventListener('resize', () => this.onWindowResize());
            document.getElementById('loading-screen').classList.add('hidden');

            this.running = true;
            this.animate();

            this.uiManager.log('Laboratory initialized successfully', 'success');
        } catch (error) {
            console.error('Initialization failed:', error);
            this.uiManager.log(`Error: ${error.message}`, 'error');
        }
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 50, 50);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 4096;
        dirLight.shadow.mapSize.height = 4096;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        this.scene.add(dirLight);

        const pointLight1 = new THREE.PointLight(0xffffff, 0.5, 50);
        pointLight1.position.set(0, 3, 0);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 0.3, 40);
        pointLight2.position.set(-15, 3, 0);
        this.scene.add(pointLight2);

        const spotLight = new THREE.SpotLight(0x00ff88, 0.4, 80, Math.PI / 4, 1, 2);
        spotLight.position.set(20, 4, 0);
        spotLight.castShadow = true;
        this.scene.add(spotLight);
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        if (!this.running) return;

        const deltaTime = this.clock.getDelta();
        this.player.update(deltaTime);
        this.npcManager.update(deltaTime);
        this.experimentManager.update(deltaTime);
        this.instrumentManager.update(deltaTime);
        this.checkInteractions();
        this.renderer.render(this.scene, this.camera);
    };

    checkInteractions() {
        const interactables = this.instrumentManager.getInteractableNearby(this.player.getPosition(), 5);
        if (interactables.length > 0) {
            this.uiManager.showInteractionPrompt(`Press E to interact with ${interactables[0].name}`);
            if (this.inputManager.isKeyPressed('e')) {
                interactables[0].interact(this.player);
            }
        } else {
            this.uiManager.hideInteractionPrompt();
        }
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}

const simulation = new LabSimulation();
