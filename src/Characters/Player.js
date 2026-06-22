import * as THREE from 'three';

export class Player {
    constructor(scene, camera, inputManager) {
        this.scene = scene;
        this.camera = camera;
        this.inputManager = inputManager;
        this.position = new THREE.Vector3(0, 1.6, 5);
        this.velocity = new THREE.Vector3();
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.direction = new THREE.Vector3();
        this.moveSpeed = 10;
        this.jumpForce = 15;
        this.gravity = 30;
        this.isGrounded = true;
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = 0.002;
        this.hands = null;
        this.health = 100;
        this.stamina = 100;
    }

    init() {
        this.createCharacterModel();
        this.setupMouseLock();
    }

    createCharacterModel() {
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 1.2, 8, 8), new THREE.MeshStandardMaterial({ color: 0xff9999, roughness: 0.7 }));
        body.position.set(0, 0.6, 0);
        body.castShadow = true;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.6 }));
        head.position.set(0, 1.35, 0);
        head.castShadow = true;
        this.createHands();
        this.playerGroup = new THREE.Group();
        this.playerGroup.position.copy(this.position);
        this.playerGroup.add(body, head, this.hands);
        this.scene.add(this.playerGroup);
    }

    createHands() {
        this.hands = new THREE.Group();
        const handGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const handMaterial = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.6 });
        const leftHand = new THREE.Mesh(handGeometry, handMaterial);
        leftHand.position.set(-0.3, 0.8, -0.3);
        const rightHand = new THREE.Mesh(handGeometry, handMaterial);
        rightHand.position.set(0.3, 0.8, -0.3);
        const forearmGeometry = new THREE.BoxGeometry(0.08, 0.35, 0.08);
        const leftForearm = new THREE.Mesh(forearmGeometry, handMaterial);
        leftForearm.position.set(-0.3, 1.1, -0.2);
        const rightForearm = new THREE.Mesh(forearmGeometry, handMaterial);
        rightForearm.position.set(0.3, 1.1, -0.2);
        this.hands.add(leftHand, rightHand, leftForearm, rightForearm);
        this.hands.position.set(0, 0.5, -0.5);
    }

    setupMouseLock() {
        document.addEventListener('click', () => { document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock; document.body.requestPointerLock(); });
        document.addEventListener('mousemove', (e) => { if (document.pointerLockElement === document.body) this.handleMouseMove(e); });
    }

    handleMouseMove(event) {
        this.yaw -= event.movementX * this.mouseSensitivity;
        this.pitch -= event.movementY * this.mouseSensitivity;
        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));
        this.euler.set(this.pitch, this.yaw, 0, 'YXZ');
        this.camera.quaternion.setFromEuler(this.euler);
    }

    update(deltaTime) {
        this.handleInput(deltaTime);
        this.velocity.y -= this.gravity * deltaTime;
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        if (this.position.y <= 1.6) { this.position.y = 1.6; this.velocity.y = 0; this.isGrounded = true; } else { this.isGrounded = false; }
        this.position.x = Math.max(-23, Math.min(23, this.position.x));
        this.position.z = Math.max(-18, Math.min(18, this.position.z));
        this.camera.position.copy(this.position);
        this.playerGroup.position.copy(this.position);
        this.updateStamina(deltaTime);
    }

    handleInput() {
        this.direction.set(0, 0, 0);
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion); forward.y = 0; forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.camera.quaternion); right.y = 0; right.normalize();
        if (this.inputManager.isKeyPressed('w')) this.direction.add(forward);
        if (this.inputManager.isKeyPressed('s')) this.direction.sub(forward);
        if (this.inputManager.isKeyPressed('a')) this.direction.sub(right);
        if (this.inputManager.isKeyPressed('d')) this.direction.add(right);
        if (this.direction.length() > 0) { this.direction.normalize(); this.velocity.x = this.direction.x * this.moveSpeed; this.velocity.z = this.direction.z * this.moveSpeed; } else { this.velocity.x *= 0.9; this.velocity.z *= 0.9; }
        if (this.inputManager.isKeyPressed(' ') && this.isGrounded && this.stamina > 5) { this.velocity.y = this.jumpForce; this.stamina -= 10; this.isGrounded = false; }
    }

    updateStamina(deltaTime) { this.stamina = this.direction.length() > 0.5 ? Math.max(0, this.stamina - 15 * deltaTime) : Math.min(100, this.stamina + 10 * deltaTime); this.moveSpeed = this.stamina < 10 ? 5 : 10; }
    getPosition() { return this.position.clone(); }
    getDirection() { return new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion); }
    takeDamage(amount) { this.health = Math.max(0, this.health - amount); }
    heal(amount) { this.health = Math.min(100, this.health + amount); }
    getStats() { return { health: this.health, stamina: this.stamina, position: this.position.clone() }; }
}
