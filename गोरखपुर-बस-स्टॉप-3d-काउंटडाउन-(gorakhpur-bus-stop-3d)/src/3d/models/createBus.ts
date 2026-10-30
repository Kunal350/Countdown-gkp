import * as THREE from 'three';
import { BusState } from '../../types';
import { createBusDestinationTexture, createCuteLuggageTexture } from '../materials';

export interface BusController {
  group: THREE.Group;
  headlightLeft: THREE.SpotLight;
  headlightRight: THREE.SpotLight;
  setState: (state: BusState) => void;
  getState: () => BusState;
  triggerArrival: () => void;
  triggerDeparture: () => void;
  resetBus: () => void;
  update: (delta: number) => void;
}

export function createBus(): BusController {
  const group = new THREE.Group();
  group.name = 'gorakhpur_express_bus';

  // State management
  let busState: BusState = 'away';
  let targetX = 35; // Far down the road
  let currentX = 35;
  let speed = 0;
  let wheelAngle = 0;

  group.position.set(currentX, 0, 5.0); // Placed in the bus lane on the asphalt road
  group.rotation.y = -Math.PI / 2; // Facing towards the stop

  // Materials
  const busTealMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // vibrant classic travel teal/sky
    roughness: 0.35,
    metalness: 0.15,
  });

  const busCreamMat = new THREE.MeshStandardMaterial({
    color: 0xfef08a, // warm cream/butter accent
    roughness: 0.4,
    metalness: 0.05,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.15,
    metalness: 0.95,
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    roughness: 0.9,
    metalness: 0.1,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    depthWrite: false,
  });

  // --- 1. Main Bus Body Chassis ---
  const busBody = new THREE.Group();
  busBody.position.y = 1.6;

  // Lower chassis
  const chassisGeo = new THREE.BoxGeometry(2.6, 1.3, 7.2);
  const chassis = new THREE.Mesh(chassisGeo, busTealMat);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  busBody.add(chassis);

  // Upper cabin / window section
  const cabinGeo = new THREE.BoxGeometry(2.52, 1.1, 7.0);
  const cabin = new THREE.Mesh(cabinGeo, busCreamMat);
  cabin.position.y = 1.1;
  cabin.castShadow = true;
  busBody.add(cabin);

  // Curved Roof
  const roofGeo = new THREE.CylinderGeometry(1.3, 1.3, 6.9, 16, 1, false, 0, Math.PI);
  const roof = new THREE.Mesh(roofGeo, busTealMat);
  roof.rotation.z = Math.PI / 2;
  roof.rotation.x = Math.PI / 2;
  roof.scale.set(0.3, 1, 1);
  roof.position.y = 1.65;
  busBody.add(roof);

  // Lower bumper trims
  const bumperGeo = new THREE.BoxGeometry(2.7, 0.35, 7.4);
  const bumper = new THREE.Mesh(bumperGeo, chromeMat);
  bumper.position.y = -0.55;
  bumper.castShadow = true;
  busBody.add(bumper);

  // --- 2. Windows & Front Windshield ---
  // Front Windshield (curved panoramic feel)
  const frontWindshieldGeo = new THREE.PlaneGeometry(2.3, 0.95);
  const frontWindshield = new THREE.Mesh(frontWindshieldGeo, glassMat);
  frontWindshield.position.set(0, 1.1, 3.52);
  frontWindshield.rotation.x = -0.12;
  busBody.add(frontWindshield);

  // Rear Window
  const rearWindshield = new THREE.Mesh(frontWindshieldGeo, glassMat);
  rearWindshield.position.set(0, 1.1, -3.52);
  rearWindshield.rotation.y = Math.PI;
  rearWindshield.rotation.x = -0.12;
  busBody.add(rearWindshield);

  // Side Passenger Windows (5 windows on each side)
  const sideWindowGeo = new THREE.BoxGeometry(0.08, 0.75, 0.95);
  for (let w = -2.2; w <= 2.2; w += 1.1) {
    // Left side windows
    const winLeft = new THREE.Mesh(sideWindowGeo, glassMat);
    winLeft.position.set(1.28, 1.1, w);
    busBody.add(winLeft);

    // Right side windows (facing bus stop!)
    const winRight = new THREE.Mesh(sideWindowGeo, glassMat);
    winRight.position.set(-1.28, 1.1, w);
    busBody.add(winRight);
  }

  // --- 3. Front LED Destination Board ("गोरखपुर एक्सप्रेस") ---
  const destTexture = createBusDestinationTexture();
  const destBoardGeo = new THREE.BoxGeometry(1.9, 0.45, 0.08);
  const destBoardMat = new THREE.MeshStandardMaterial({
    map: destTexture,
    roughness: 0.2,
    emissive: 0x15803d,
    emissiveIntensity: 0.4,
  });
  const destBoard = new THREE.Mesh(destBoardGeo, destBoardMat);
  destBoard.position.set(0, 1.82, 3.52);
  destBoard.rotation.x = -0.05;
  busBody.add(destBoard);

  // --- 4. Headlights & Taillights ---
  const headlightGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 16);
  const headlightBulbMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });

  const hlLeftMesh = new THREE.Mesh(headlightGeo, headlightBulbMat);
  hlLeftMesh.rotation.x = Math.PI / 2;
  hlLeftMesh.position.set(-0.95, -0.1, 3.62);
  busBody.add(hlLeftMesh);

  const hlRightMesh = new THREE.Mesh(headlightGeo, headlightBulbMat);
  hlRightMesh.rotation.x = Math.PI / 2;
  hlRightMesh.position.set(0.95, -0.1, 3.62);
  busBody.add(hlRightMesh);

  // Left & Right Spotlight beams
  const headlightLeft = new THREE.SpotLight(0xfef08a, 2.5, 25, Math.PI / 6, 0.4, 1.2);
  headlightLeft.position.set(-0.95, 1.5, 3.7);
  headlightLeft.target.position.set(-0.95, 0, 15);
  group.add(headlightLeft);
  group.add(headlightLeft.target);

  const headlightRight = new THREE.SpotLight(0xfef08a, 2.5, 25, Math.PI / 6, 0.4, 1.2);
  headlightRight.position.set(0.95, 1.5, 3.7);
  headlightRight.target.position.set(0.95, 0, 15);
  group.add(headlightRight);
  group.add(headlightRight.target);

  // Red Taillights
  const tailLightGeo = new THREE.BoxGeometry(0.35, 0.18, 0.08);
  const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const tlLeft = new THREE.Mesh(tailLightGeo, tailLightMat);
  tlLeft.position.set(-1.0, -0.1, -3.62);
  busBody.add(tlLeft);

  const tlRight = new THREE.Mesh(tailLightGeo, tailLightMat);
  tlRight.position.set(1.0, -0.1, -3.62);
  busBody.add(tlRight);

  // Radiator Grille
  const grilleGeo = new THREE.BoxGeometry(1.3, 0.45, 0.08);
  const grilleMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });
  const grille = new THREE.Mesh(grilleGeo, grilleMat);
  grille.position.set(0, -0.15, 3.62);
  busBody.add(grille);

  // --- 5. Luggage Carrier on Roof Rack (Inspired by user image!) ---
  const rackGroup = new THREE.Group();
  rackGroup.position.set(0, 1.95, -0.3);

  // Metal rack frame
  const railGeoX = new THREE.BoxGeometry(2.1, 0.05, 3.6);
  const railMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
  const rackBase = new THREE.Mesh(railGeoX, railMat);
  rackGroup.add(rackBase);

  // Surrounding railing posts
  const guardGeo = new THREE.BoxGeometry(2.15, 0.18, 0.04);
  const gFront = new THREE.Mesh(guardGeo, railMat);
  gFront.position.set(0, 0.1, 1.8);
  rackGroup.add(gFront);

  const gBack = new THREE.Mesh(guardGeo, railMat);
  gBack.position.set(0, 0.1, -1.8);
  rackGroup.add(gBack);

  // --- Stacked Colorful Luggage on Roof (Pink smiling suitcase, Yellow luggage, Vintage trunk!) ---
  const luggageGroup = new THREE.Group();
  luggageGroup.position.y = 0.08;

  // 1. Large Brown Leather Trunk
  const trunkGeo = new THREE.BoxGeometry(1.6, 0.45, 0.85);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.set(0, 0.22, -0.9);
  trunk.castShadow = true;
  luggageGroup.add(trunk);

  // 2. Bright Yellow Suitcase
  const yellowSuitcaseGeo = new THREE.BoxGeometry(1.3, 0.4, 0.75);
  const yellowSuitcaseMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const ySc = new THREE.Mesh(yellowSuitcaseGeo, yellowSuitcaseMat);
  ySc.position.set(0.1, 0.2, 0.2);
  ySc.castShadow = true;
  luggageGroup.add(ySc);

  // 3. Cute Pink Suitcase with Smiley Eyes! (Directly matching user's image)
  const pinkSuitcaseTexture = createCuteLuggageTexture();
  const pinkScGeo = new THREE.BoxGeometry(1.1, 0.38, 0.65);
  const pinkScMat = new THREE.MeshStandardMaterial({ map: pinkSuitcaseTexture, roughness: 0.4 });
  const pinkScPlain = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.4 });
  const pinkMaterials = [pinkScPlain, pinkScPlain, pinkScMat, pinkScPlain, pinkScMat, pinkScPlain];
  const pinkSc = new THREE.Mesh(pinkScGeo, pinkMaterials);
  pinkSc.position.set(0.05, 0.58, 0.2); // stacked right on top of yellow suitcase!
  pinkSc.castShadow = true;
  luggageGroup.add(pinkSc);

  // 4. Rolled Camping Sleeping Mat / Bedroll
  const rollGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16);
  const rollMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.7 });
  const roll = new THREE.Mesh(rollGeo, rollMat);
  roll.rotation.z = Math.PI / 2;
  roll.position.set(0, 0.18, 1.1);
  roll.castShadow = true;
  luggageGroup.add(roll);

  // Tie-down ropes
  const ropeGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.9, 6);
  const ropeMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const r1 = new THREE.Mesh(ropeGeo, ropeMat);
  r1.rotation.z = Math.PI / 2;
  r1.position.set(0, 0.78, 0.2);
  luggageGroup.add(r1);

  rackGroup.add(luggageGroup);
  busBody.add(rackGroup);

  group.add(busBody);

  // --- 6. Wheels (6 Wheels) ---
  const wheels: THREE.Mesh[] = [];
  const wheelGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.36, 20);
  const hubcapGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.38, 16);

  const wheelPositions: [number, number, number][] = [
    [-1.25, 0.48, 2.2], // Front Left
    [1.25, 0.48, 2.2],  // Front Right
    [-1.25, 0.48, -1.5], // Rear Left 1
    [1.25, 0.48, -1.5],  // Rear Right 1
    [-1.25, 0.48, -2.5], // Rear Left 2
    [1.25, 0.48, -2.5],  // Rear Right 2
  ];

  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wx, wy, wz);

    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheelGroup.add(tire);

    const hubcap = new THREE.Mesh(hubcapGeo, chromeMat);
    hubcap.rotation.z = Math.PI / 2;
    wheelGroup.add(hubcap);

    wheels.push(tire);
    group.add(wheelGroup);
  });

  // State Transitions
  const setState = (newState: BusState) => {
    busState = newState;
    if (newState === 'away') {
      targetX = 40;
      currentX = 40;
      speed = 0;
      group.position.x = currentX;
    } else if (newState === 'approaching') {
      targetX = 0;
    } else if (newState === 'at_stop') {
      targetX = 0;
      currentX = 0;
      group.position.x = 0;
      speed = 0;
    } else if (newState === 'departing') {
      targetX = -40;
    }
  };

  const triggerArrival = () => {
    if (busState === 'at_stop') {
      // Re-trigger arrival from away
      setState('away');
      setTimeout(() => setState('approaching'), 100);
    } else {
      setState('approaching');
    }
  };

  const triggerDeparture = () => {
    setState('departing');
  };

  const resetBus = () => {
    setState('away');
  };

  const update = (delta: number) => {
    if (busState === 'approaching') {
      const dist = currentX - targetX;
      if (dist > 0.05) {
        // Smooth deceleration as it arrives near stop
        const desiredSpeed = Math.max(2.5, Math.min(18.0, dist * 0.9));
        currentX -= desiredSpeed * delta;
        speed = desiredSpeed;
        wheelAngle -= (desiredSpeed / 0.48) * delta;
        wheels.forEach(w => {
          w.rotation.x = wheelAngle;
        });

        // Slight suspension rocking
        busBody.position.y = 1.6 + Math.sin(wheelAngle * 4) * 0.02;
        busBody.rotation.z = Math.sin(wheelAngle * 2) * 0.015;
      } else {
        currentX = 0;
        speed = 0;
        busState = 'at_stop';
        busBody.position.y = 1.6;
        busBody.rotation.z = 0;
      }
      group.position.x = currentX;
    } else if (busState === 'departing') {
      const dist = targetX - currentX;
      if (Math.abs(dist) > 0.5) {
        speed = Math.min(22.0, speed + 12.0 * delta);
        currentX -= speed * delta;
        wheelAngle -= (speed / 0.48) * delta;
        wheels.forEach(w => {
          w.rotation.x = wheelAngle;
        });
        group.position.x = currentX;
      } else {
        setState('away');
      }
    }
  };

  return {
    group,
    headlightLeft,
    headlightRight,
    setState,
    getState: () => busState,
    triggerArrival,
    triggerDeparture,
    resetBus,
    update,
  };
}
