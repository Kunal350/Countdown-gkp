import * as THREE from 'three';
import { createBusStopSignTexture, createTimetableTexture } from '../materials';

export interface BusStopResult {
  group: THREE.Group;
  lampLight: THREE.PointLight;
  benchPosition: THREE.Vector3;
}

export function createBusStop(): BusStopResult {
  const group = new THREE.Group();
  group.name = 'bus_stop_assembly';

  // --- 1. Sidewalk Platform ---
  const sidewalkGeo = new THREE.BoxGeometry(14, 0.35, 6);
  const sidewalkMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.85,
    metalness: 0.05,
  });
  const sidewalk = new THREE.Mesh(sidewalkGeo, sidewalkMat);
  sidewalk.position.set(0, 0.175, 0.2);
  sidewalk.receiveShadow = true;
  group.add(sidewalk);

  // Sidewalk Curb (Road facing)
  const curbGeo = new THREE.BoxGeometry(14, 0.4, 0.3);
  const curbMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.7,
    metalness: 0.1,
  });
  const curb = new THREE.Mesh(curbGeo, curbMat);
  curb.position.set(0, 0.2, 3.25);
  curb.receiveShadow = true;
  group.add(curb);

  // Alternating safety stripes on curb
  const stripeGeo = new THREE.BoxGeometry(0.8, 0.405, 0.32);
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
  for (let i = -6; i <= 6; i += 1.6) {
    const s = new THREE.Mesh(stripeGeo, Math.abs(i) % 3.2 < 1 ? yellowMat : blackMat);
    s.position.set(i, 0.2, 3.25);
    group.add(s);
  }

  // --- 2. Bus Shelter Structure ---
  const shelterGroup = new THREE.Group();
  shelterGroup.position.set(-0.5, 0.35, -0.6);

  // Steel Pillars
  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.3,
    metalness: 0.75,
  });
  const pillarGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16);

  const pillarCoords: [number, number][] = [
    [-2.6, -1.2],
    [2.6, -1.2],
    [-2.6, 1.2],
    [2.6, 1.2],
  ];

  pillarCoords.forEach(([x, z]) => {
    const p = new THREE.Mesh(pillarGeo, pillarMat);
    p.position.set(x, 1.6, z);
    p.castShadow = true;
    p.receiveShadow = true;
    shelterGroup.add(p);

    // Pillar base foot
    const footGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.12, 16);
    const foot = new THREE.Mesh(footGeo, pillarMat);
    foot.position.set(x, 0.06, z);
    shelterGroup.add(foot);
  });

  // Crossbeams
  const beamGeoX = new THREE.BoxGeometry(5.4, 0.12, 0.12);
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
  const frontBeam = new THREE.Mesh(beamGeoX, beamMat);
  frontBeam.position.set(0, 3.15, 1.2);
  shelterGroup.add(frontBeam);

  const backBeam = new THREE.Mesh(beamGeoX, beamMat);
  backBeam.position.set(0, 3.15, -1.2);
  shelterGroup.add(backBeam);

  // Curved Canopy Roof
  const roofCurve = new THREE.Shape();
  roofCurve.moveTo(-2.9, 0);
  roofCurve.lineTo(2.9, 0);
  roofCurve.lineTo(2.9, 0.12);
  roofCurve.quadraticCurveTo(0, 0.5, -2.9, 0.12);
  roofCurve.closePath();

  const roofExtrudeSettings = {
    steps: 1,
    depth: 3.0,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
  };
  const roofGeo = new THREE.ExtrudeGeometry(roofCurve, roofExtrudeSettings);
  roofGeo.center();
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // vibrant travel cyan/blue
    roughness: 0.35,
    metalness: 0.25,
  });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 3.35, 0);
  roof.castShadow = true;
  shelterGroup.add(roof);

  // Roof Trim Accent (Orange travel stripe)
  const trimGeo = new THREE.BoxGeometry(5.9, 0.08, 3.15);
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.4 });
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.position.set(0, 3.22, 0);
  shelterGroup.add(trim);

  // Back Glass Windbreak Panels
  const glassGeo = new THREE.BoxGeometry(5.0, 2.3, 0.04);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe0f2fe,
    transparent: true,
    opacity: 0.65,
    roughness: 0.1,
    metalness: 0.1,
    clearcoat: 1.0,
    depthWrite: false,
  });
  const backGlass = new THREE.Mesh(glassGeo, glassMat);
  backGlass.position.set(0, 1.6, -1.18);
  shelterGroup.add(backGlass);

  // Side Glass Panel with Timetable
  const sideGlassGeo = new THREE.BoxGeometry(0.04, 2.3, 2.2);
  const sideGlass = new THREE.Mesh(sideGlassGeo, glassMat);
  sideGlass.position.set(-2.58, 1.6, 0);
  shelterGroup.add(sideGlass);

  // Timetable Board attached to side glass
  const timetableTexture = createTimetableTexture();
  const timetableGeo = new THREE.PlaneGeometry(1.2, 1.2);
  const timetableMat = new THREE.MeshStandardMaterial({
    map: timetableTexture,
    roughness: 0.4,
  });
  const timetable = new THREE.Mesh(timetableGeo, timetableMat);
  timetable.position.set(-2.55, 1.7, 0);
  timetable.rotation.y = Math.PI / 2;
  shelterGroup.add(timetable);

  // --- 3. Bus Stop Wooden Bench ---
  const benchGroup = new THREE.Group();
  benchGroup.position.set(-0.6, 0, -0.6);

  const slatMat = new THREE.MeshStandardMaterial({
    color: 0xb45309, // warm natural wood
    roughness: 0.65,
    metalness: 0.05,
  });
  const benchLegMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.8,
  });

  // Bench legs / metal frame
  const benchLegGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
  const legCoords: [number, number][] = [
    [-1.2, -0.22],
    [1.2, -0.22],
    [-1.2, 0.22],
    [1.2, 0.22],
  ];
  legCoords.forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(benchLegGeo, benchLegMat);
    leg.position.set(lx, 0.25, lz);
    benchGroup.add(leg);
  });

  // Wooden Seat Slats
  const slatGeo = new THREE.BoxGeometry(2.6, 0.04, 0.13);
  for (let s = -2; s <= 2; s++) {
    const slat = new THREE.Mesh(slatGeo, slatMat);
    slat.position.set(0, 0.52, s * 0.12);
    slat.castShadow = true;
    slat.receiveShadow = true;
    benchGroup.add(slat);
  }

  // Wooden Backrest Slats
  const backSlatGeo = new THREE.BoxGeometry(2.6, 0.12, 0.04);
  for (let b = 0; b <= 2; b++) {
    const bSlat = new THREE.Mesh(backSlatGeo, slatMat);
    bSlat.position.set(0, 0.72 + b * 0.14, -0.3);
    bSlat.castShadow = true;
    benchGroup.add(bSlat);
  }

  shelterGroup.add(benchGroup);
  group.add(shelterGroup);

  // --- 4. Yellow Bus Stop Post & Signboard ("गोरखपुर") ---
  const signpostGroup = new THREE.Group();
  signpostGroup.position.set(3.8, 0.35, 1.8);

  // Concrete footing
  const footBaseGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.2, 16);
  const footBase = new THREE.Mesh(footBaseGeo, curbMat);
  footBase.position.set(0, 0.1, 0);
  signpostGroup.add(footBase);

  // Yellow striped steel pole
  const signPoleGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.4, 16);
  const signPoleMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.3,
    metalness: 0.4,
  });
  const signPole = new THREE.Mesh(signPoleGeo, signPoleMat);
  signPole.position.set(0, 1.7, 0);
  signPole.castShadow = true;
  signpostGroup.add(signPole);

  // Signboard Box
  const signTexture = createBusStopSignTexture();
  const signBoardGeo = new THREE.BoxGeometry(1.2, 1.2, 0.08);
  const signFrontMat = new THREE.MeshStandardMaterial({ map: signTexture, roughness: 0.35 });
  const signSideMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
  const signMaterials = [
    signSideMat,
    signSideMat,
    signSideMat,
    signSideMat,
    signFrontMat, // Front face facing road
    signFrontMat, // Back face
  ];
  const signBoard = new THREE.Mesh(signBoardGeo, signMaterials);
  signBoard.position.set(0, 2.7, 0);
  signBoard.castShadow = true;
  signpostGroup.add(signBoard);

  // Red top beacon cap
  const beaconGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.2,
    metalness: 0.2,
  });
  const beacon = new THREE.Mesh(beaconGeo, beaconMat);
  beacon.position.set(0, 3.36, 0);
  signpostGroup.add(beacon);

  group.add(signpostGroup);

  // --- 5. Modern Street Light ---
  const streetLightGroup = new THREE.Group();
  streetLightGroup.position.set(-4.6, 0.35, 1.8);

  const lampPoleGeo = new THREE.CylinderGeometry(0.07, 0.1, 4.6, 16);
  const lampPole = new THREE.Mesh(lampPoleGeo, pillarMat);
  lampPole.position.set(0, 2.3, 0);
  lampPole.castShadow = true;
  streetLightGroup.add(lampPole);

  // Overhanging curved arm
  const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.2, 12);
  const arm = new THREE.Mesh(armGeo, pillarMat);
  arm.position.set(0.45, 4.5, 0);
  arm.rotation.z = -Math.PI / 3;
  streetLightGroup.add(arm);

  // Lamp Fixture
  const fixtureGeo = new THREE.ConeGeometry(0.26, 0.24, 16);
  const fixture = new THREE.Mesh(fixtureGeo, pillarMat);
  fixture.position.set(0.8, 4.25, 0);
  fixture.rotation.x = Math.PI;
  streetLightGroup.add(fixture);

  // Glowing bulb
  const bulbGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const bulb = new THREE.Mesh(bulbGeo, bulbMat);
  bulb.position.set(0.8, 4.18, 0);
  streetLightGroup.add(bulb);

  // Street PointLight
  const lampLight = new THREE.PointLight(0xffedd5, 1.2, 16, 1.2);
  lampLight.position.set(0.8, 4.15, 0);
  lampLight.castShadow = true;
  lampLight.shadow.bias = -0.001;
  streetLightGroup.add(lampLight);

  group.add(streetLightGroup);

  // --- 6. Trash / Recycle Bin ---
  const binGroup = new THREE.Group();
  binGroup.position.set(4.8, 0.35, -0.6);
  const binGeo = new THREE.CylinderGeometry(0.25, 0.22, 0.75, 16);
  const binMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.4, metalness: 0.2 });
  const binMesh = new THREE.Mesh(binGeo, binMat);
  binMesh.position.set(0, 0.375, 0);
  binMesh.castShadow = true;
  binGroup.add(binMesh);

  // Bin lid
  const lidGeo = new THREE.TorusGeometry(0.24, 0.04, 8, 20);
  const lid = new THREE.Mesh(lidGeo, pillarMat);
  lid.rotation.x = Math.PI / 2;
  lid.position.set(0, 0.75, 0);
  binGroup.add(lid);
  group.add(binGroup);

  // --- 7. Flower Planter Box ---
  const planterGroup = new THREE.Group();
  planterGroup.position.set(-4.0, 0.35, -1.8);
  const planterGeo = new THREE.BoxGeometry(2.4, 0.4, 0.6);
  const planterMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const planter = new THREE.Mesh(planterGeo, planterMat);
  planter.position.set(0, 0.2, 0);
  planterGroup.add(planter);

  // Bush / Flowers
  const flowerGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const flowerColors = [0xf43f5e, 0xfbbf24, 0xa855f7, 0xec4899];
  for (let f = -1.0; f <= 1.0; f += 0.3) {
    const fMat = new THREE.MeshStandardMaterial({
      color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
      roughness: 0.5,
    });
    const fl = new THREE.Mesh(flowerGeo, fMat);
    fl.position.set(f + (Math.random() - 0.5) * 0.1, 0.45 + Math.random() * 0.1, (Math.random() - 0.5) * 0.2);
    planterGroup.add(fl);
  }
  const bushGeo = new THREE.SphereGeometry(0.25, 8, 8);
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.7 });
  for (let b = -0.9; b <= 0.9; b += 0.5) {
    const bu = new THREE.Mesh(bushGeo, bushMat);
    bu.scale.set(1.2, 0.8, 1);
    bu.position.set(b, 0.35, 0);
    planterGroup.add(bu);
  }
  group.add(planterGroup);

  return {
    group,
    lampLight,
    benchPosition: new THREE.Vector3(-0.6, 0.87, -0.6),
  };
}
