import * as THREE from 'three';

export class ExperimentManager {
    constructor(scene, player, uiManager = null) {
        this.scene = scene;
        this.player = player;
        this.uiManager = uiManager;
        this.currentStep = 0;
        this.completed = false;
        this.stepTimer = 0;
        this.activeExperiment = null;

        this.experiments = [
            {
                id: 'safety_intro',
                name: 'Lab Safety Introduction',
                steps: [
                    'Put on safety goggles',
                    'Locate the emergency shower',
                    'Identify the fire extinguisher',
                    'Review spill cleanup kit',
                    'Complete safety checklist'
                ]
            },
            {
                id: 'basic_measurement',
                name: 'Basic Measurement Protocol',
                steps: [
                    'Collect the digital scale',
                    'Place empty beaker on scale',
                    'Zero the scale',
                    'Measure sample mass',
                    'Record the result'
                ]
            },
            {
                id: 'liquid_transfer',
                name: 'Liquid Transfer Protocol',
                steps: [
                    'Pick up the pipette',
                    'Select the correct volume',
                    'Draw liquid from source',
                    'Transfer to destination beaker',
                    'Dispose of tip safely'
                ]
            }
        ];

        this.protocolMarkers = [];
        this.protocolPad = null;
    }

    async init() {
        this.activeExperiment = this.experiments[0];
        this.createProtocolPad();
        this.createStepMarkers();
        this.updateUI();
    }

    createProtocolPad() {
        const pad = new THREE.Mesh(
            new THREE.BoxGeometry(1.8, 0.05, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x223344, roughness: 0.7, metalness: 0.15 })
        );
        pad.position.set(0, 0.92, 2.5);
        pad.castShadow = true;
        pad.receiveShadow = true;
        pad.userData.type = 'protocol_pad';
        this.scene.add(pad);
        this.protocolPad = pad;
    }

    createStepMarkers() {
        const markerPositions = [
            [-0.6, 0, 0.3],
            [0, 0, 0.3],
            [0.6, 0, 0.3],
            [-0.3, 0, -0.25],
            [0.3, 0, -0.25]
        ];

        markerPositions.forEach((pos, index) => {
            const marker = new THREE.Mesh(
                new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16),
                new THREE.MeshStandardMaterial({
                    color: index === 0 ? 0x00ff88 : 0x555555,
                    emissive: index === 0 ? 0x00ff88 : 0x000000,
                    emissiveIntensity: 0.2
                })
            );
            marker.position.set(
                this.protocolPad.position.x + pos[0],
                this.protocolPad.position.y + 0.04,
                this.protocolPad.position.z + pos[2]
            );
            marker.userData.step = index;
            this.scene.add(marker);
            this.protocolMarkers.push(marker);
        });
    }

    startExperiment(index = 0) {
        this.activeExperiment = this.experiments[index] || this.experiments[0];
        this.currentStep = 0;
        this.completed = false;
        this.stepTimer = 0;
        this.highlightCurrentStep();
        this.updateUI();

        if (this.uiManager) {
            this.uiManager.log(`Started experiment: ${this.activeExperiment.name}`, 'success');
        }
    }

    update(deltaTime) {
        if (!this.activeExperiment || this.completed) return;

        this.stepTimer += deltaTime;

        if (this.stepTimer >= 6) {
            this.advanceStep();
            this.stepTimer = 0;
        }
    }

    advanceStep() {
        if (!this.activeExperiment) return;

        this.currentStep++;

        if (this.currentStep >= this.activeExperiment.steps.length) {
            this.completed = true;
            if (this.uiManager) {
                this.uiManager.log(`${this.activeExperiment.name} completed successfully.`, 'success');
            }
        } else {
            if (this.uiManager) {
                this.uiManager.log(`Next step: ${this.getCurrentStep()}`, 'warning');
            }
        }

        this.highlightCurrentStep();
        this.updateUI();
    }

    highlightCurrentStep() {
        this.protocolMarkers.forEach((marker, index) => {
            const active = index === this.currentStep && !this.completed;
            marker.material.color.setHex(active ? 0x00ff88 : 0x555555);
            marker.material.emissive.setHex(active ? 0x00ff88 : 0x000000);
        });
    }

    updateUI() {
        if (!this.uiManager || !this.activeExperiment) return;

        const progress = this.completed
            ? 100
            : Math.floor((this.currentStep / this.activeExperiment.steps.length) * 100);

        this.uiManager.setTask(
            `${this.activeExperiment.name}: ${this.getCurrentStep()}`,
            progress
        );
    }

    getCurrentStep() {
        if (!this.activeExperiment) return 'No active experiment';
        if (this.completed) return 'Experiment complete';
        return this.activeExperiment.steps[this.currentStep] || 'Ready for next step';
    }

    isComplete() {
        return this.completed;
    }

    getProgress() {
        if (!this.activeExperiment) return 0;
        return this.completed
            ? 100
            : Math.floor((this.currentStep / this.activeExperiment.steps.length) * 100);
    }
}
