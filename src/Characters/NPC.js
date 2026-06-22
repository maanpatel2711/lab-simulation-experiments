import * as THREE from 'three';

export class NPC {
    constructor(scene, name, role, position, color, messages) {
        this.scene = scene;
        this.name = name;
        this.role = role;
        this.position = new THREE.Vector3(position.x, 1.6, position.z);
        this.color = color;
        this.messages = messages;
        this.model = null;
        this.wanderTarget = this.position.clone();
        this.wanderSpeed = 1.5;
        this.wanderTimer = 0;
        this.wanderInterval = 5;
        this.messageIndex = 0;
        this.speechBubble = null;
        this.speechTimer = 0;
    }

    init() { this.createModel(); this.createNameTag(); }

    createModel() {
        const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 1.2, 6, 8), new THREE.MeshStandardMaterial({ color: this.color, roughness: 0.7 }));
        body.position.y = 0.6; body.castShadow = true;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.6 }));
        head.position.y = 1.3; head.castShadow = true;
        const eyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial); leftEye.position.set(-0.08, 1.38, -0.18);
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial); rightEye.position.set(0.08, 1.38, -0.18);
        const coat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.3, 0.35), new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.8 }));
        coat.position.y = 0.65;
        const armGeometry = new THREE.CapsuleGeometry(0.06, 0.9, 4, 4);
        const armMaterial = new THREE.MeshStandardMaterial({ color: 0xffccaa, roughness: 0.6 });
        const leftArm = new THREE.Mesh(armGeometry, armMaterial); leftArm.position.set(-0.3, 0.9, 0);
        const rightArm = new THREE.Mesh(armGeometry, armMaterial); rightArm.position.set(0.3, 0.9, 0);
        const legGeometry = new THREE.CapsuleGeometry(0.06, 0.8, 4, 4);
        const leftLeg = new THREE.Mesh(legGeometry, armMaterial); leftLeg.position.set(-0.15, 0.4, 0);
        const rightLeg = new THREE.Mesh(legGeometry, armMaterial); rightLeg.position.set(0.15, 0.4, 0);
        this.model = new THREE.Group();
        this.model.position.copy(this.position);
        this.model.add(body, head, coat, leftArm, rightArm, leftLeg, rightLeg, leftEye, rightEye);
        this.scene.add(this.model);
    }

    createNameTag() {
        const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128; const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff88'; ctx.font = 'bold 32px Arial'; ctx.textAlign = 'center'; ctx.fillText(this.name, canvas.width / 2, 45);
        ctx.fillStyle = '#88ff00'; ctx.font = '24px Arial'; ctx.fillText(this.role, canvas.width / 2, 80);
        const texture = new THREE.CanvasTexture(canvas);
        const nameTag = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ map: texture }));
        nameTag.position.y = 2.2;
        this.model.add(nameTag);
    }

    update(deltaTime) {
        this.wanderTimer += deltaTime;
        if (this.wanderTimer >= this.wanderInterval) { this.setNewWanderTarget(); this.wanderTimer = 0; }
        const direction = new THREE.Vector3().subVectors(this.wanderTarget, this.model.position);
        if (direction.length() > 0.1) { direction.normalize(); this.model.position.add(direction.multiplyScalar(this.wanderSpeed * deltaTime)); }
        this.position.copy(this.model.position);
        if (this.speechBubble) { this.speechTimer -= deltaTime; if (this.speechTimer <= 0) { this.scene.remove(this.speechBubble); this.speechBubble = null; } }
    }

    setNewWanderTarget() {
        const randomAngle = Math.random() * Math.PI * 2; const randomDistance = Math.random() * 5;
        this.wanderTarget = new THREE.Vector3(this.position.x + Math.cos(randomAngle) * randomDistance, 1.6, this.position.z + Math.sin(randomAngle) * randomDistance);
        this.wanderTarget.x = Math.max(-23, Math.min(23, this.wanderTarget.x));
        this.wanderTarget.z = Math.max(-18, Math.min(18, this.wanderTarget.z));
    }

    speak() { this.showSpeechBubble(this.messages[this.messageIndex]); this.messageIndex = (this.messageIndex + 1) % this.messages.length; }
    showSpeechBubble(text) {
        if (this.speechBubble) this.scene.remove(this.speechBubble);
        const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 128; const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fillRect(10, 10, 236, 108); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.strokeRect(10, 10, 236, 108);
        ctx.fillStyle = '#000'; ctx.font = '16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text.slice(0, 28), 128, 64);
        const texture = new THREE.CanvasTexture(canvas);
        this.speechBubble = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), new THREE.MeshBasicMaterial({ map: texture }));
        this.speechBubble.position.copy(this.model.position); this.speechBubble.position.y += 2.5;
        this.scene.add(this.speechBubble); this.speechTimer = 4;
    }

    getPosition() { return this.position.clone(); }
    getStats() { return { name: this.name, role: this.role, position: this.position.clone() }; }
}
