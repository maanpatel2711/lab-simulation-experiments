import * as THREE from 'three';

export class LabEnvironment {
    constructor(scene) {
        this.scene = scene;
        this.labObjects = [];
    }

    async init() {
        this.createFloor();
        this.createWalls();
        this.createCeiling();
        this.createWorkBenches();
        this.createStorageCabinets();
        this.createSafetyEquipment();
        this.createDoorAndWindows();
    }

    createFloor() {
        const floorGeometry = new THREE.PlaneGeometry(50, 40);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.6, metalness: 0.1 });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);
        this.labObjects.push(floor);

        const gridHelper = new THREE.GridHelper(50, 25, 0x333344, 0x222233);
        gridHelper.position.y = 0.01;
        this.scene.add(gridHelper);
    }

    createWalls() {
        const wallHeight = 4;
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.7 });

        const backWall = new THREE.Mesh(new THREE.PlaneGeometry(50, wallHeight), wallMaterial);
        backWall.position.z = -20;
        backWall.position.y = wallHeight / 2;
        this.scene.add(backWall);

        const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(50, wallHeight), wallMaterial);
        frontWall.rotation.y = Math.PI;
        frontWall.position.z = 20;
        frontWall.position.y = wallHeight / 2;
        this.scene.add(frontWall);

        const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(40, wallHeight), wallMaterial);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.x = -25;
        leftWall.position.y = wallHeight / 2;
        this.scene.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(40, wallHeight), wallMaterial);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.x = 25;
        rightWall.position.y = wallHeight / 2;
        this.scene.add(rightWall);

        this.labObjects.push(backWall, frontWall, leftWall, rightWall);
    }

    createCeiling() {
        const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xe8e8e8, roughness: 0.5, metalness: 0.2 });
        const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(50, 40), ceilingMaterial);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = 4;
        this.scene.add(ceiling);
        this.labObjects.push(ceiling);
        this.addCeilingLights();
    }

    addCeilingLights() {
        const lightPositions = [[-15, 3.9, -10], [0, 3.9, -10], [15, 3.9, -10], [-15, 3.9, 0], [0, 3.9, 0], [15, 3.9, 0], [-15, 3.9, 10], [0, 3.9, 10], [15, 3.9, 10]];
        lightPositions.forEach(pos => {
            const light = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0xffff99, emissive: 0xffff99, emissiveIntensity: 0.5 }));
            light.position.set(...pos);
            this.scene.add(light);
        });
    }

    createWorkBenches() {
        const benchPositions = [{ x: -12, z: -8 }, { x: 0, z: -8 }, { x: 12, z: -8 }, { x: -12, z: 8 }, { x: 0, z: 8 }, { x: 12, z: 8 }];
        benchPositions.forEach((pos, idx) => this.createWorkBench(pos.x, pos.z, idx));
    }

    createWorkBench(x, z, index) {
        const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a5e, roughness: 0.4, metalness: 0.6 });
        const legGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
        const legPositions = [[-1.5, 0.4, -1], [1.5, 0.4, -1], [-1.5, 0.4, 1], [1.5, 0.4, 1]];
        legPositions.forEach(legPos => {
            const leg = new THREE.Mesh(legGeometry, frameMaterial);
            leg.position.set(x + legPos[0], legPos[1], z + legPos[2]);
            this.scene.add(leg);
        });

        const topMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.6, metalness: 0.2 });
        const top = new THREE.Mesh(new THREE.BoxGeometry(3, 0.05, 2), topMaterial);
        top.position.set(x, 0.85, z);
        top.userData.type = 'workbench';
        top.userData.benchIndex = index;
        this.scene.add(top);

        const shelf = new THREE.Mesh(new THREE.BoxGeometry(3, 0.05, 2), topMaterial);
        shelf.position.set(x, 0.2, z);
        this.scene.add(shelf);

        this.labObjects.push(top, shelf);
    }

    createStorageCabinets() {
        const cabinetPositions = [{ x: -22, z: -12, label: 'Chemicals' }, { x: -22, z: 0, label: 'Tools' }, { x: -22, z: 12, label: 'Samples' }, { x: 22, z: -12, label: 'Glassware' }, { x: 22, z: 0, label: 'Safety Equipment' }, { x: 22, z: 12, label: 'Records' }];
        cabinetPositions.forEach(pos => this.createCabinet(pos.x, pos.z, pos.label));
    }

    createCabinet(x, z, label) {
        const cabinetMaterial = new THREE.MeshStandardMaterial({ color: 0x3a3a4e, roughness: 0.5, metalness: 0.4 });
        const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2, 0.6), cabinetMaterial);
        cabinet.position.set(x, 1, z);
        cabinet.userData.type = 'cabinet';
        cabinet.userData.label = label;
        this.scene.add(cabinet);
        this.labObjects.push(cabinet);
    }

    createSafetyEquipment() {
        const shower = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.5, 16), new THREE.MeshStandardMaterial({ color: 0xff4444, roughness: 0.3, metalness: 0.7 }));
        shower.position.set(-20, 0.75, -18);
        this.scene.add(shower);

        const sign = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 0.2 }));
        sign.position.set(-18, 2.5, -18);
        this.scene.add(sign);

        const extinguisher = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0xdd0000, roughness: 0.4, metalness: 0.6 }));
        extinguisher.position.set(20, 0.3, -18);
        this.scene.add(extinguisher);

        this.labObjects.push(shower, sign, extinguisher);
    }

    createDoorAndWindows() {
        const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.5, 0.05), new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.6 }));
        doorFrame.position.set(-24, 1.25, 0);
        this.scene.add(doorFrame);

        const door = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.4, 0.05), new THREE.MeshStandardMaterial({ color: 0xa0826d, roughness: 0.5 }));
        door.position.set(-23.85, 1.25, 0);
        this.scene.add(door);

        const windowPositions = [{ x: -10, z: -19.5 }, { x: 10, z: -19.5 }, { x: -20, z: 19.5 }, { x: 0, z: 19.5 }, { x: 20, z: 19.5 }];
        const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.3, metalness: 0.8, roughness: 0.1 });
        windowPositions.forEach(pos => {
            const window = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.5), windowMaterial);
            window.position.set(pos.x, 2.5, pos.z);
            if (Math.abs(pos.z) > 15) window.rotation.y = 0; else window.rotation.y = Math.PI / 2;
            this.scene.add(window);
        });

        this.labObjects.push(doorFrame, door);
    }

    getLabObjects() { return this.labObjects; }
}
