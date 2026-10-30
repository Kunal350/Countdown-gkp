import * as THREE from 'three';

export interface EnvironmentResult {
  group: THREE.Group;
  update: (time: number, delta: number) => void;
  setSunMood: (mood: 'day' | 'sunset' | 'night') => void;
}

export function createEnvironment(): EnvironmentResult {
  const group = new THREE.Group();
  group.name = 'environment_scene';

  // --- 1. Asphalt Road ---
  const roadGeo = new THREE.PlaneGeometry(80, 8);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // dark slate asphalt
    roughness: 0.8,
    metalness: 0.1,
  });
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0.02, 5.8);
  road.receiveShadow = true;
  group.add(road);

  // Road Dashed Center Line
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  const dashGeo = new THREE.PlaneGeometry(1.6, 0.18);
  for (let x = -36; x <= 36; x += 3.6) {
    const dash = new THREE.Mesh(dashGeo, dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(x, 0.025, 5.8);
    group.add(dash);
  }

  // Road White Edge Lines
  const edgeLineGeo = new THREE.PlaneGeometry(80, 0.16);
  const edgeLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const nearEdge = new THREE.Mesh(edgeLineGeo, edgeLineMat);
  nearEdge.rotation.x = -Math.PI / 2;
  nearEdge.position.set(0, 0.025, 3.5);
  group.add(nearEdge);

  const farEdge = new THREE.Mesh(edgeLineGeo, edgeLineMat);
  farEdge.rotation.x = -Math.PI / 2;
  farEdge.position.set(0, 0.025, 8.1);
  group.add(farEdge);

  // --- 2. Grassy Ground & Landscape ---
  const terrainGeo = new THREE.PlaneGeometry(100, 70);
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x4ade80, // vibrant cartoon lime grass
    roughness: 0.9,
    metalness: 0.0,
  });
  const terrain = new THREE.Mesh(terrainGeo, grassMat);
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.set(0, 0, -10);
  terrain.receiveShadow = true;
  group.add(terrain);

  // Far road verge grass
  const farVerge = new THREE.Mesh(new THREE.PlaneGeometry(100, 30), grassMat);
  farVerge.rotation.x = -Math.PI / 2;
  farVerge.position.set(0, 0, 20);
  farVerge.receiveShadow = true;
  group.add(farVerge);

  // --- 3. Distant Rolling Hills & Snowcapped Mountain Peaks (Reference Image style!) ---
  const mountainsGroup = new THREE.Group();
  mountainsGroup.position.set(0, 0, -25);

  const mountainMat1 = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.85 }); // Middle green hills
  const mountainMat2 = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.9 }); // Darker back hills
  const snowMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }); // Snow peak caps

  const hillConfigs = [
    { x: -28, y: 7, z: -8, r: 12, mat: mountainMat2, hasSnow: true },
    { x: -14, y: 5.5, z: -4, r: 9, mat: mountainMat1, hasSnow: false },
    { x: 0, y: 8.5, z: -10, r: 14, mat: mountainMat2, hasSnow: true },
    { x: 15, y: 6.0, z: -5, r: 10, mat: mountainMat1, hasSnow: false },
    { x: 28, y: 7.8, z: -9, r: 13, mat: mountainMat2, hasSnow: true },
  ];

  hillConfigs.forEach(h => {
    const hillGeo = new THREE.ConeGeometry(h.r, h.y * 2, 7);
    const hill = new THREE.Mesh(hillGeo, h.mat);
    hill.position.set(h.x, h.y, h.z);
    hill.rotation.y = Math.random() * Math.PI;
    mountainsGroup.add(hill);

    if (h.hasSnow) {
      const snowGeo = new THREE.ConeGeometry(h.r * 0.32, h.y * 0.65, 7);
      const snow = new THREE.Mesh(snowGeo, snowMat);
      snow.position.set(h.x, h.y * 1.68, h.z);
      snow.rotation.y = hill.rotation.y;
      mountainsGroup.add(snow);
    }
  });

  group.add(mountainsGroup);

  // --- 4. Fluffy Cartoon Trees & Foliage ---
  const treeGroup = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
  const leavesMat1 = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 });
  const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.6 });
  const leavesMat3 = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.6 });

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.25, 1.8, 8);
  const foliageGeo1 = new THREE.SphereGeometry(1.1, 8, 8);
  const foliageGeo2 = new THREE.SphereGeometry(0.85, 8, 8);

  const treeCoords = [
    { x: -8, z: -3.5, s: 1.1, mat: leavesMat1 },
    { x: -11, z: -4.5, s: 1.3, mat: leavesMat2 },
    { x: -15, z: -2.8, s: 0.9, mat: leavesMat3 },
    { x: 7.5, z: -3.8, s: 1.2, mat: leavesMat2 },
    { x: 10.5, z: -4.2, s: 1.0, mat: leavesMat1 },
    { x: 14, z: -3.2, s: 1.3, mat: leavesMat3 },
    { x: 18, z: -5.0, s: 1.1, mat: leavesMat2 },
    // Near side across road
    { x: -9, z: 12, s: 1.2, mat: leavesMat1 },
    { x: 2, z: 13, s: 1.0, mat: leavesMat3 },
    { x: 12, z: 11, s: 1.3, mat: leavesMat2 },
  ];

  treeCoords.forEach(t => {
    const singleTree = new THREE.Group();
    singleTree.position.set(t.x, 0, t.z);
    singleTree.scale.setScalar(t.s);

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.9;
    trunk.castShadow = true;
    singleTree.add(trunk);

    // Fluffy cloud-like leaves
    const fol1 = new THREE.Mesh(foliageGeo1, t.mat);
    fol1.position.y = 2.4;
    fol1.castShadow = true;
    singleTree.add(fol1);

    const fol2 = new THREE.Mesh(foliageGeo2, t.mat);
    fol2.position.set(0.3, 2.7, 0.2);
    fol2.castShadow = true;
    singleTree.add(fol2);

    const fol3 = new THREE.Mesh(foliageGeo2, t.mat);
    fol3.position.set(-0.35, 2.2, -0.2);
    fol3.castShadow = true;
    singleTree.add(fol3);

    treeGroup.add(singleTree);
  });

  group.add(treeGroup);

  // --- 5. Drifting Cartoon Puffy Clouds ---
  const cloudsGroup = new THREE.Group();
  cloudsGroup.position.set(0, 14, -14);

  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.2,
    metalness: 0.0,
  });

  interface CloudItem {
    group: THREE.Group;
    speed: number;
    initialX: number;
  }
  const clouds: CloudItem[] = [];

  const cloudPuffGeo = new THREE.SphereGeometry(1.2, 12, 12);
  const cloudConfigs = [
    { x: -24, y: 3, z: 0, s: 1.2, speed: 0.8 },
    { x: -8, y: 5, z: 4, s: 1.5, speed: 0.6 },
    { x: 10, y: 2, z: -2, s: 1.0, speed: 0.9 },
    { x: 26, y: 4.5, z: 2, s: 1.3, speed: 0.7 },
  ];

  cloudConfigs.forEach(c => {
    const cGroup = new THREE.Group();
    cGroup.position.set(c.x, c.y, c.z);
    cGroup.scale.setScalar(c.s);

    // Assembly of 5 overlapping puffy spheres
    const p1 = new THREE.Mesh(cloudPuffGeo, cloudMat);
    p1.scale.set(1.4, 0.9, 1.0);
    cGroup.add(p1);

    const p2 = new THREE.Mesh(cloudPuffGeo, cloudMat);
    p2.position.set(-1.1, -0.2, 0.1);
    p2.scale.set(0.9, 0.7, 0.8);
    cGroup.add(p2);

    const p3 = new THREE.Mesh(cloudPuffGeo, cloudMat);
    p3.position.set(1.1, -0.2, -0.1);
    p3.scale.set(0.9, 0.7, 0.8);
    cGroup.add(p3);

    const p4 = new THREE.Mesh(cloudPuffGeo, cloudMat);
    p4.position.set(0.4, 0.6, 0.1);
    p4.scale.set(0.8, 0.7, 0.8);
    cGroup.add(p4);

    cloudsGroup.add(cGroup);
    clouds.push({ group: cGroup, speed: c.speed, initialX: c.x });
  });

  group.add(cloudsGroup);

  // --- 6. Stylized Sun / Moon in the Sky (Reference Image style!) ---
  const celestialGroup = new THREE.Group();
  celestialGroup.position.set(18, 16, -18);

  const sunGeo = new THREE.SphereGeometry(2.4, 24, 24);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  celestialGroup.add(sunMesh);

  // Sun rays ring
  const sunRayGeo = new THREE.TorusGeometry(3.2, 0.16, 8, 24);
  const sunRayMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.5 });
  const sunRay = new THREE.Mesh(sunRayGeo, sunRayMat);
  celestialGroup.add(sunRay);

  group.add(celestialGroup);

  // Animation Update Loop
  const update = (time: number, delta: number) => {
    // Drifting clouds across the sky
    clouds.forEach(c => {
      c.group.position.x += c.speed * delta;
      if (c.group.position.x > 45) {
        c.group.position.x = -45;
      }
    });

    // Sun gentle pulse
    sunRay.rotation.z = time * 0.1;
  };

  const setSunMood = (mood: 'day' | 'sunset' | 'night') => {
    if (mood === 'day') {
      sunMat.color.setHex(0xfbbf24);
      sunRayMat.color.setHex(0xf59e0b);
      sunRay.visible = true;
      celestialGroup.position.set(18, 16, -18);
    } else if (mood === 'sunset') {
      sunMat.color.setHex(0xf97316);
      sunRayMat.color.setHex(0xd97706);
      sunRay.visible = true;
      celestialGroup.position.set(15, 7, -18);
    } else {
      // Night Moon
      sunMat.color.setHex(0xf1f5f9);
      sunRay.visible = false;
      celestialGroup.position.set(-14, 15, -18);
    }
  };

  return {
    group,
    update,
    setSunMood,
  };
}
