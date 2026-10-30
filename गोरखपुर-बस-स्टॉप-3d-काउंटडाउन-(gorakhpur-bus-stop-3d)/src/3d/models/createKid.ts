import * as THREE from 'three';
import { KidInfo } from '../../types';
import { createBoyLuggageTexture, createCartoonEyeTexture, createCuteLuggageTexture } from '../materials';

export interface KidMeshController {
  group: THREE.Group;
  kidInfo: KidInfo;
  hitBox: THREE.Mesh;
  jumpTimer: number;
  triggerJump: () => void;
  update: (time: number, delta: number, isBusArriving: boolean) => void;
}

const eyeTexture = createCartoonEyeTexture(true);
const pinkLuggageTexture = createCuteLuggageTexture();
const boyLuggageTexture = createBoyLuggageTexture();

export function createKid(kidInfo: KidInfo): KidMeshController {
  const group = new THREE.Group();
  group.name = `kid_${kidInfo.id}`;
  group.position.set(...kidInfo.position);
  group.rotation.y = kidInfo.rotationY;

  // Shared Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: kidInfo.id === 'pinku' ? 0xffdfba : 0xf1c27d,
    roughness: 0.55,
    metalness: 0.05,
  });

  const hairMat = new THREE.MeshStandardMaterial({
    color: kidInfo.id === 'kunal' ? 0x1f2937 : kidInfo.id === 'aditya' ? 0x3f2314 : 0x18181b,
    roughness: 0.8,
  });

  const clothesMat = new THREE.MeshStandardMaterial({
    color: kidInfo.avatarColor,
    roughness: 0.6,
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a, // denim blue
    roughness: 0.7,
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });

  // Base kid pivot (placed flush with sidewalk height Y=0.35)
  group.position.y = 0.35;

  const bodyGroup = new THREE.Group();
  bodyGroup.position.y = 0;
  group.add(bodyGroup);

  const isSeatedBench = kidInfo.id === 'aditya';
  const isSeatedSuitcase = kidInfo.id === 'pranjal';
  const isStanding = !isSeatedBench && !isSeatedSuitcase;

  // --- Head & Face ---
  const headGroup = new THREE.Group();
  const headGeo = new THREE.SphereGeometry(0.24, 20, 20);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Eyes
  const eyeMat = new THREE.MeshBasicMaterial({ map: eyeTexture, transparent: true });
  const eyeGeo = new THREE.PlaneGeometry(0.09, 0.09);

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.08, 0.03, 0.22);
  headGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.08, 0.03, 0.22);
  headGroup.add(rightEye);

  // Cute Smile
  const smileCurve = new THREE.EllipseCurve(0, 0, 0.05, 0.035, Math.PI * 0.15, Math.PI * 0.85, false, 0);
  const smilePoints = smileCurve.getPoints(12);
  const smileGeo = new THREE.BufferGeometry().setFromPoints(smilePoints.map(p => new THREE.Vector3(p.x, -p.y - 0.06, 0.23)));
  const smileMat = new THREE.LineBasicMaterial({ color: 0x7f1d1d, linewidth: 2 });
  const smile = new THREE.Line(smileGeo, smileMat);
  headGroup.add(smile);

  // Blush Cheeks
  const blushMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.5 });
  const blushGeo = new THREE.CircleGeometry(0.035, 12);
  const leftBlush = new THREE.Mesh(blushGeo, blushMat);
  leftBlush.position.set(-0.13, -0.04, 0.21);
  headGroup.add(leftBlush);
  const rightBlush = new THREE.Mesh(blushGeo, blushMat);
  rightBlush.position.set(0.13, -0.04, 0.21);
  headGroup.add(rightBlush);

  // --- Hair / Hats customization for the 5 BOYS ---
  if (kidInfo.id === 'kunal') {
    // Kunal: Red backwards baseball cap (sporty leader look)
    const capMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 });
    const capDome = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), capMat);
    capDome.position.set(0, 0.08, 0);
    headGroup.add(capDome);

    // Visor pointed backwards
    const visorGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 16, 1, false, Math.PI * 0.7, Math.PI * 0.6);
    const visor = new THREE.Mesh(visorGeo, capMat);
    visor.position.set(0, 0.06, -0.12);
    visor.rotation.x = 0.2;
    headGroup.add(visor);
  } else if (kidInfo.id === 'aditya') {
    // Aditya: Cool boy haircut with side-swept bangs / front quiff
    const hairDome = new THREE.Mesh(new THREE.SphereGeometry(0.255, 16, 12), hairMat);
    hairDome.scale.set(1.02, 1.05, 0.98);
    hairDome.position.set(0, 0.04, -0.01);
    headGroup.add(hairDome);

    // Boy's stylish front hair tufts / spikes
    const quiffGeo = new THREE.ConeGeometry(0.07, 0.16, 8);
    const q1 = new THREE.Mesh(quiffGeo, hairMat);
    q1.position.set(0, 0.24, 0.12);
    q1.rotation.x = 0.6;
    headGroup.add(q1);

    const q2 = new THREE.Mesh(quiffGeo, hairMat);
    q2.position.set(-0.08, 0.22, 0.1);
    q2.rotation.x = 0.5;
    q2.rotation.z = 0.2;
    headGroup.add(q2);

    const q3 = new THREE.Mesh(quiffGeo, hairMat);
    q3.position.set(0.08, 0.22, 0.1);
    q3.rotation.x = 0.5;
    q3.rotation.z = -0.2;
    headGroup.add(q3);
  } else if (kidInfo.id === 'pranjal') {
    // Pranjal: Geek-chic glasses + side-parted short boy hair
    const hairDome = new THREE.Mesh(new THREE.SphereGeometry(0.252, 16, 12), hairMat);
    hairDome.position.set(0, 0.04, -0.02);
    headGroup.add(hairDome);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2 });
    const ringGeo = new THREE.TorusGeometry(0.05, 0.012, 8, 16);
    const leftRing = new THREE.Mesh(ringGeo, frameMat);
    leftRing.position.set(-0.08, 0.03, 0.23);
    headGroup.add(leftRing);

    const rightRing = new THREE.Mesh(ringGeo, frameMat);
    rightRing.position.set(0.08, 0.03, 0.23);
    headGroup.add(rightRing);

    const bridgeGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.06, 6);
    const bridge = new THREE.Mesh(bridgeGeo, frameMat);
    bridge.rotation.z = Math.PI / 2;
    bridge.position.set(0, 0.03, 0.23);
    headGroup.add(bridge);
  } else if (kidInfo.id === 'karan') {
    // Karan: Cool textured boy haircut with black & electric blue gaming headphones
    const hairDome = new THREE.Mesh(new THREE.SphereGeometry(0.252, 16, 12), hairMat);
    hairDome.position.set(0, 0.04, -0.02);
    headGroup.add(hairDome);

    // Front spiky boy quiff
    const spikeGeo = new THREE.ConeGeometry(0.06, 0.14, 8);
    const sp1 = new THREE.Mesh(spikeGeo, hairMat);
    sp1.position.set(0, 0.22, 0.12);
    sp1.rotation.x = 0.5;
    headGroup.add(sp1);

    const sp2 = new THREE.Mesh(spikeGeo, hairMat);
    sp2.position.set(0.07, 0.21, 0.11);
    sp2.rotation.x = 0.45;
    sp2.rotation.z = -0.2;
    headGroup.add(sp2);

    // Pro DJ / Gaming Headphone band (Matte Black with Electric Blue accents)
    const bandGeo = new THREE.TorusGeometry(0.26, 0.026, 8, 20, Math.PI);
    const hpMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.3, metalness: 0.8 });
    const band = new THREE.Mesh(bandGeo, hpMat);
    band.position.set(0, 0.04, 0);
    band.rotation.x = -Math.PI / 2;
    headGroup.add(band);

    // Chunky Boy Gaming Ear pads (Black with Cyan Ring)
    const padGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    const leftPad = new THREE.Mesh(padGeo, hpMat);
    leftPad.rotation.z = Math.PI / 2;
    leftPad.position.set(-0.25, 0.04, 0);
    headGroup.add(leftPad);

    const ringL = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 16), ringMat);
    ringL.rotation.y = Math.PI / 2;
    ringL.position.set(-0.285, 0.04, 0);
    headGroup.add(ringL);

    const rightPad = new THREE.Mesh(padGeo, hpMat);
    rightPad.rotation.z = Math.PI / 2;
    rightPad.position.set(0.25, 0.04, 0);
    headGroup.add(rightPad);

    const ringR = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.012, 6, 16), ringMat);
    ringR.rotation.y = Math.PI / 2;
    ringR.position.set(0.285, 0.04, 0);
    headGroup.add(ringR);
  } else if (kidInfo.id === 'pinku') {
    // Pinku: Cute boy dinosaur/animal ear hoodie cap
    const capMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.6 });
    const hoodGeo = new THREE.SphereGeometry(0.26, 16, 14);
    const hood = new THREE.Mesh(hoodGeo, capMat);
    hood.position.set(0, 0.02, -0.02);
    headGroup.add(hood);

    // Cute animal ears on hood
    const earGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const leftEar = new THREE.Mesh(earGeo, capMat);
    leftEar.position.set(-0.18, 0.24, -0.02);
    headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, capMat);
    rightEar.position.set(0.18, 0.24, -0.02);
    headGroup.add(rightEar);

    // Pinku's DJ headphones to match his dialogue
    const pinkuHpMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.3, roughness: 0.4 });
    const pinkuBand = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.022, 8, 20, Math.PI), pinkuHpMat);
    pinkuBand.position.set(0, 0.04, 0);
    pinkuBand.rotation.x = -Math.PI / 2;
    headGroup.add(pinkuBand);

    const pinkuPadGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 14);
    const pPadL = new THREE.Mesh(pinkuPadGeo, pinkuHpMat);
    pPadL.rotation.z = Math.PI / 2;
    pPadL.position.set(-0.25, 0.04, 0);
    headGroup.add(pPadL);

    const pPadR = new THREE.Mesh(pinkuPadGeo, pinkuHpMat);
    pPadR.rotation.z = Math.PI / 2;
    pPadR.position.set(0.25, 0.04, 0);
    headGroup.add(pPadR);
  }

  // --- Torso & Clothing ---
  const torsoGroup = new THREE.Group();
  const torsoGeo = new THREE.CylinderGeometry(0.16, 0.19, 0.45, 14);
  const torsoMesh = new THREE.Mesh(torsoGeo, clothesMat);
  torsoMesh.castShadow = true;
  torsoGroup.add(torsoMesh);

  // Kunal's sporty denim vest
  if (kidInfo.id === 'kunal') {
    const jacketGeo = new THREE.CylinderGeometry(0.17, 0.2, 0.42, 14, 1, true, 0.4, Math.PI * 1.6);
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.7 });
    const jacket = new THREE.Mesh(jacketGeo, jacketMat);
    torsoGroup.add(jacket);
  }

  // Karan's sporty boy hoodie kangaroo pocket & drawstrings
  if (kidInfo.id === 'karan') {
    const pocketGeo = new THREE.BoxGeometry(0.24, 0.14, 0.04);
    const pocketMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 });
    const pocket = new THREE.Mesh(pocketGeo, pocketMat);
    pocket.position.set(0, -0.06, 0.18);
    torsoGroup.add(pocket);

    // White drawstrings
    const stringGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.15, 6);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const strL = new THREE.Mesh(stringGeo, stringMat);
    strL.position.set(-0.06, 0.1, 0.19);
    torsoGroup.add(strL);
    const strR = new THREE.Mesh(stringGeo, stringMat);
    strR.position.set(0.06, 0.1, 0.19);
    torsoGroup.add(strR);
  }

  // Pinku's dungarees straps
  if (kidInfo.id === 'pinku') {
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x0e7490 });
    const strapGeo = new THREE.BoxGeometry(0.04, 0.4, 0.02);
    const sL = new THREE.Mesh(strapGeo, strapMat);
    sL.position.set(-0.08, 0, 0.17);
    torsoGroup.add(sL);
    const sR = new THREE.Mesh(strapGeo, strapMat);
    sR.position.set(0.08, 0, 0.17);
    torsoGroup.add(sR);
  }

  // --- Arms ---
  const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.36, 10);
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.21, 0.16, 0);
  const leftArm = new THREE.Mesh(armGeo, clothesMat);
  leftArm.position.y = -0.16;
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);

  // Hand
  const handGeo = new THREE.SphereGeometry(0.05, 10, 10);
  const leftHand = new THREE.Mesh(handGeo, skinMat);
  leftHand.position.set(0, -0.34, 0);
  leftArmPivot.add(leftHand);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.21, 0.16, 0);
  const rightArm = new THREE.Mesh(armGeo, clothesMat);
  rightArm.position.y = -0.16;
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);

  const rightHand = new THREE.Mesh(handGeo, skinMat);
  rightHand.position.set(0, -0.34, 0);
  rightArmPivot.add(rightHand);

  torsoGroup.add(leftArmPivot);
  torsoGroup.add(rightArmPivot);

  // --- Legs & Shoes (Standing vs Sitting) ---
  const legGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.42, 10);
  const shoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.2);

  const leftLegPivot = new THREE.Group();
  const rightLegPivot = new THREE.Group();

  let balloonMesh: THREE.Mesh | null = null;
  let comicMesh: THREE.Mesh | null = null;

  if (isStanding) {
    // Standing positioning
    torsoGroup.position.y = 0.65;
    headGroup.position.set(0, 0.98, 0);

    leftLegPivot.position.set(-0.1, 0.42, 0);
    const leftLeg = new THREE.Mesh(legGeo, pantsMat);
    leftLeg.position.y = -0.21;
    leftLeg.castShadow = true;
    leftLegPivot.add(leftLeg);

    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.4, 0.03);
    leftShoe.castShadow = true;
    leftLegPivot.add(leftShoe);

    rightLegPivot.position.set(0.1, 0.42, 0);
    const rightLeg = new THREE.Mesh(legGeo, pantsMat);
    rightLeg.position.y = -0.21;
    rightLeg.castShadow = true;
    rightLegPivot.add(rightLeg);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.4, 0.03);
    rightShoe.castShadow = true;
    rightLegPivot.add(rightShoe);

    bodyGroup.add(leftLegPivot);
    bodyGroup.add(rightLegPivot);
  } else if (isSeatedBench) {
    // Aditya sitting comfortably on bus shelter bench (height Y=0.52 above sidewalk)
    torsoGroup.position.y = 0.76;
    headGroup.position.set(0, 1.08, 0);

    // Thighs horizontal
    const thighGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.32, 10);
    const calfGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.32, 10);

    leftLegPivot.position.set(-0.1, 0.54, 0.05);
    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.rotation.x = Math.PI / 2;
    leftThigh.position.set(0, 0, 0.14);
    leftLegPivot.add(leftThigh);

    const leftCalf = new THREE.Mesh(calfGeo, pantsMat);
    leftCalf.position.set(0, -0.16, 0.3);
    leftLegPivot.add(leftCalf);

    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.32, 0.33);
    leftLegPivot.add(leftShoe);

    rightLegPivot.position.set(0.1, 0.54, 0.05);
    const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
    rightThigh.rotation.x = Math.PI / 2;
    rightThigh.position.set(0, 0, 0.14);
    rightLegPivot.add(rightThigh);

    const rightCalf = new THREE.Mesh(calfGeo, pantsMat);
    rightCalf.position.set(0, -0.16, 0.3);
    rightLegPivot.add(rightCalf);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.32, 0.33);
    rightLegPivot.add(rightShoe);

    bodyGroup.add(leftLegPivot);
    bodyGroup.add(rightLegPivot);

    // Ice cream cone in Aditya's hand
    const coneGeo = new THREE.ConeGeometry(0.04, 0.12, 10);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.set(0, -0.38, 0.06);
    cone.rotation.x = -Math.PI;

    const scoopGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const scoopMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 }); // blue sky bubblegum scoop
    const scoop = new THREE.Mesh(scoopGeo, scoopMat);
    scoop.position.set(0, -0.44, 0.06);
    rightArmPivot.add(cone);
    rightArmPivot.add(scoop);
  } else if (isSeatedSuitcase) {
    // Pranjal sitting on his yellow suitcase (suitcase height Y=0.45)
    torsoGroup.position.y = 0.68;
    headGroup.position.set(0, 1.0, 0);

    const thighGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.28, 10);
    const calfGeo = new THREE.CylinderGeometry(0.06, 0.055, 0.28, 10);

    leftLegPivot.position.set(-0.1, 0.48, 0.06);
    const leftThigh = new THREE.Mesh(thighGeo, pantsMat);
    leftThigh.rotation.x = Math.PI / 2.2;
    leftThigh.position.set(0, 0, 0.13);
    leftLegPivot.add(leftThigh);

    const leftCalf = new THREE.Mesh(calfGeo, pantsMat);
    leftCalf.position.set(0, -0.16, 0.26);
    leftLegPivot.add(leftCalf);

    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(0, -0.3, 0.29);
    leftLegPivot.add(leftShoe);

    rightLegPivot.position.set(0.1, 0.48, 0.06);
    const rightThigh = new THREE.Mesh(thighGeo, pantsMat);
    rightThigh.rotation.x = Math.PI / 2.2;
    rightThigh.position.set(0, 0, 0.13);
    rightLegPivot.add(rightThigh);

    const rightCalf = new THREE.Mesh(calfGeo, pantsMat);
    rightCalf.position.set(0, -0.16, 0.26);
    rightLegPivot.add(rightCalf);

    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0, -0.3, 0.29);
    rightLegPivot.add(rightShoe);

    bodyGroup.add(leftLegPivot);
    bodyGroup.add(rightLegPivot);

    // Comic Book held in hands
    const comicGeo = new THREE.BoxGeometry(0.18, 0.02, 0.26);
    const comicMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    comicMesh = new THREE.Mesh(comicGeo, comicMat);
    comicMesh.position.set(0, 0.2, 0.22);
    comicMesh.rotation.x = 0.5;
    torsoGroup.add(comicMesh);
  }

  bodyGroup.add(headGroup);
  bodyGroup.add(torsoGroup);

  // --- Bags & Luggage Per Kid ---
  if (kidInfo.id === 'kunal') {
    // Kunal's Large sports duffel bag on ground
    const bagGroup = new THREE.Group();
    bagGroup.position.set(-0.35, 0.15, 0.1);
    const duffelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.52, 16);
    const duffelMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const duffel = new THREE.Mesh(duffelGeo, duffelMat);
    duffel.rotation.z = Math.PI / 2;
    duffel.castShadow = true;
    bagGroup.add(duffel);

    // Straps
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
    const strapGeo = new THREE.TorusGeometry(0.17, 0.02, 8, 16);
    const s1 = new THREE.Mesh(strapGeo, strapMat);
    s1.position.set(-0.14, 0, 0);
    s1.rotation.y = Math.PI / 2;
    bagGroup.add(s1);
    const s2 = new THREE.Mesh(strapGeo, strapMat);
    s2.position.set(0.14, 0, 0);
    s2.rotation.y = Math.PI / 2;
    bagGroup.add(s2);

    group.add(bagGroup);
  } else if (kidInfo.id === 'aditya') {
    // Aditya's adventure explorer backpack resting next to him on the bench
    const bpGroup = new THREE.Group();
    bpGroup.position.set(0.35, 0.72, -0.05);
    const bpGeo = new THREE.BoxGeometry(0.24, 0.32, 0.16);
    const bpMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const bp = new THREE.Mesh(bpGeo, bpMat);
    bp.castShadow = true;
    bpGroup.add(bp);

    // Front pocket
    const pocketGeo = new THREE.BoxGeometry(0.2, 0.16, 0.06);
    const pocketMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
    const pocket = new THREE.Mesh(pocketGeo, pocketMat);
    pocket.position.set(0, -0.06, 0.1);
    bpGroup.add(pocket);

    group.add(bpGroup);
  } else if (kidInfo.id === 'pranjal') {
    // Pranjal's Sturdy Yellow suitcase with wheels (VIP Chair)
    const scGroup = new THREE.Group();
    scGroup.position.set(0, 0.22, 0);
    const scGeo = new THREE.BoxGeometry(0.38, 0.44, 0.42);
    const scMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 });
    const sc = new THREE.Mesh(scGeo, scMat);
    sc.castShadow = true;
    scGroup.add(sc);

    // Suitcase corners
    const cornerMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
    const cornerGeo = new THREE.BoxGeometry(0.4, 0.04, 0.44);
    const c1 = new THREE.Mesh(cornerGeo, cornerMat);
    c1.position.set(0, 0.21, 0);
    scGroup.add(c1);
    const c2 = new THREE.Mesh(cornerGeo, cornerMat);
    c2.position.set(0, -0.21, 0);
    scGroup.add(c2);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.04, 10);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
    [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, -0.21, wz);
      scGroup.add(w);
    });

    group.add(scGroup);
  } else if (kidInfo.id === 'karan') {
    // Karan's Cool Boy Hard-Case Trolley Suitcase (Deep Cobalt Blue & Carbon with Speed Racing Stripes)
    const trolleyGroup = new THREE.Group();
    trolleyGroup.position.set(0.36, 0.26, 0.1);

    const tcGeo = new THREE.BoxGeometry(0.34, 0.52, 0.24);
    const tcFaceMat = new THREE.MeshStandardMaterial({ map: boyLuggageTexture, roughness: 0.3 });
    const tcPlainMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35, metalness: 0.3 });
    const tcMaterials = [
      tcPlainMat, tcPlainMat, tcPlainMat, tcPlainMat,
      tcFaceMat, // Front face with racing stripe and star badge
      tcPlainMat
    ];
    const trolley = new THREE.Mesh(tcGeo, tcMaterials);
    trolley.castShadow = true;
    trolleyGroup.add(trolley);

    // Heavy duty carbon bumpers on corners
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.4 });
    const bumpGeo = new THREE.BoxGeometry(0.36, 0.04, 0.26);
    const bTop = new THREE.Mesh(bumpGeo, bumperMat);
    bTop.position.set(0, 0.25, 0);
    trolleyGroup.add(bTop);
    const bBottom = new THREE.Mesh(bumpGeo, bumperMat);
    bBottom.position.set(0, -0.25, 0);
    trolleyGroup.add(bBottom);

    // Telescoping silver handle
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.15 });
    const handleBarGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.42, 8);
    const h1 = new THREE.Mesh(handleBarGeo, handleMat);
    h1.position.set(-0.09, 0.44, 0);
    trolleyGroup.add(h1);
    const h2 = new THREE.Mesh(handleBarGeo, handleMat);
    h2.position.set(0.09, 0.44, 0);
    trolleyGroup.add(h2);

    const topGripGeo = new THREE.BoxGeometry(0.22, 0.03, 0.04);
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x09090b });
    const topGrip = new THREE.Mesh(topGripGeo, gripMat);
    topGrip.position.set(0, 0.65, 0);
    trolleyGroup.add(topGrip);

    // 4 sturdy trolley wheels
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b });
    const wheelGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8);
    [[-0.12, -0.1], [0.12, -0.1], [-0.12, 0.1], [0.12, 0.1]].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, -0.27, wz);
      trolleyGroup.add(w);
    });

    group.add(trolleyGroup);
  } else if (kidInfo.id === 'pinku') {
    // Pinku's Explorer Backpack + Floating Red Balloon
    const kbGroup = new THREE.Group();
    kbGroup.position.set(0, 0.65, -0.16);
    const kbGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const kbMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
    const kb = new THREE.Mesh(kbGeo, kbMat);
    kb.scale.set(0.9, 1.1, 0.7);
    kb.castShadow = true;
    kbGroup.add(kb);
    group.add(kbGroup);

    // Red Floating Balloon on a string held by right hand!
    const balloonGroup = new THREE.Group();
    balloonGroup.position.set(0.24, 0.6, 0.1);

    const bGeo = new THREE.SphereGeometry(0.18, 16, 16);
    const bMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.25,
      metalness: 0.1,
    });
    balloonMesh = new THREE.Mesh(bGeo, bMat);
    balloonMesh.scale.set(1, 1.25, 1);
    balloonMesh.position.set(0, 0.85, 0);
    balloonMesh.castShadow = true;
    balloonGroup.add(balloonMesh);

    // Balloon knot
    const knotGeo = new THREE.ConeGeometry(0.03, 0.04, 8);
    const knot = new THREE.Mesh(knotGeo, bMat);
    knot.position.set(0, 0.61, 0);
    balloonGroup.add(knot);

    // Balloon string
    const stringCurve = new THREE.LineCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.6, 0));
    const stringGeo = new THREE.TubeGeometry(stringCurve, 8, 0.004, 4, false);
    const stringMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
    const stringMesh = new THREE.Mesh(stringGeo, stringMat);
    balloonGroup.add(stringMesh);

    group.add(balloonGroup);
  }

  // --- Clickable HitBox for Raycasting ---
  const hitGeo = new THREE.BoxGeometry(0.8, 1.4, 0.8);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const hitBox = new THREE.Mesh(hitGeo, hitMat);
  hitBox.position.set(0, 0.7, 0);
  hitBox.userData = { kidId: kidInfo.id };
  group.add(hitBox);

  // Jump animation state
  let jumpTime = 0;
  const triggerJump = () => {
    jumpTime = 1.0;
  };

  const update = (time: number, delta: number, isBusArriving: boolean) => {
    // Natural subtle breathing bob
    const breath = Math.sin(time * 2.5 + kidInfo.age) * 0.015;
    headGroup.position.y = (isStanding ? 0.98 : isSeatedBench ? 1.08 : 1.0) + breath;

    // Head look around
    const headYaw = Math.sin(time * 0.8 + kidInfo.age * 2) * 0.15;
    headGroup.rotation.y = headYaw + (isBusArriving ? -0.3 : 0);

    // Leg swinging for seated kids
    if (isSeatedBench) {
      const swing1 = Math.sin(time * 2.2) * 0.18;
      const swing2 = Math.cos(time * 2.2) * 0.18;
      leftLegPivot.rotation.x = swing1;
      rightLegPivot.rotation.x = swing2;
    } else if (isSeatedSuitcase) {
      const swing = Math.sin(time * 1.8) * 0.12;
      leftLegPivot.rotation.x = swing;
      rightLegPivot.rotation.x = -swing;
    }

    // Balloon gentle floating wobble
    if (balloonMesh) {
      balloonMesh.position.x = Math.sin(time * 1.5) * 0.06;
      balloonMesh.position.z = Math.cos(time * 1.2) * 0.04;
      balloonMesh.rotation.z = Math.sin(time * 1.5) * 0.08;
    }

    // Waving or jump animation
    if (jumpTime > 0) {
      jumpTime -= delta * 2.2;
      const jumpProgress = Math.max(0, jumpTime);
      const jumpHeight = Math.sin((1 - jumpProgress) * Math.PI) * 0.35;
      bodyGroup.position.y = jumpHeight;

      // Excited arm waves
      rightArmPivot.rotation.z = -Math.PI * 0.7 + Math.sin(time * 18) * 0.4;
      leftArmPivot.rotation.z = Math.PI * 0.7 - Math.cos(time * 18) * 0.4;
    } else if (isBusArriving) {
      // Both arms up cheering for the bus arrival!
      rightArmPivot.rotation.z = -Math.PI * 0.75 + Math.sin(time * 10 + kidInfo.age) * 0.25;
      leftArmPivot.rotation.z = Math.PI * 0.75 - Math.sin(time * 10 + kidInfo.age) * 0.25;
      bodyGroup.position.y = Math.abs(Math.sin(time * 8 + kidInfo.age)) * 0.15;
    } else {
      bodyGroup.position.y = 0;
      // Default resting arm positions
      rightArmPivot.rotation.z = -0.15;
      leftArmPivot.rotation.z = 0.15;
    }
  };

  return {
    group,
    kidInfo,
    hitBox,
    jumpTimer: 0,
    triggerJump,
    update,
  };
}
