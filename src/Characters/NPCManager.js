import * as THREE from 'three';
import { NPC } from './NPC.js';

export class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];
        this.npcData = [
            { name: 'Dr. Smith', role: 'Lab Director', position: { x: -10, z: -8 }, color: 0x4488ff, messages: ['Welcome to the lab! Start with the basic experiments.', 'Always follow proper safety protocols!', 'Great work on completing that experiment!'] },
            { name: 'Assistant Maria', role: 'Lab Assistant', position: { x: 10, z: 8 }, color: 0xff88aa, messages: ['Can I help you with anything?', 'The microscope is ready for use.', 'Remember to clean up after your experiments!'] },
            { name: 'Prof. Johnson', role: 'Senior Researcher', position: { x: 0, z: -12 }, color: 0x88ff88, messages: ['Precision and accuracy are key!', 'Have you calibrated the instruments?', 'Excellent experimental design!'] }
        ];
    }

    async init() { this.npcData.forEach((data) => { const npc = new NPC(this.scene, data.name, data.role, data.position, data.color, data.messages); npc.init(); this.npcs.push(npc); }); }
    update(deltaTime) { this.npcs.forEach(npc => npc.update(deltaTime)); }
    getNPCNearby(playerPosition, radius) { return this.npcs.filter(npc => playerPosition.distanceTo(npc.getPosition()) < radius); }
    getNPCByName(name) { return this.npcs.find(npc => npc.name === name); }
}
