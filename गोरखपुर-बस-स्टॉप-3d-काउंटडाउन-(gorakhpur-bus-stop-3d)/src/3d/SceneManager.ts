import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BusState, CameraPreset, KidInfo, TimeOfDay } from '../types';
import { KIDS_DATA } from '../data/kids';
import { soundManager } from '../utils/audio';
import { BusController, createBus } from './models/createBus';
import { createBusStop } from './models/createBusStop';
import { createEnvironment } from './models/createEnvironment';
import { createKid, KidMeshController } from './models/createKid';

export interface SceneManagerOptions {
  container: HTMLDivElement;
  onKidSelect: (kid: KidInfo) => void;
  onBusStateChange: (state: BusState) => void;
}

export class SceneManager {
  private container: HTMLDivElement;
  private onKidSelect: (kid: KidInfo) => void;
  private onBusStateChange: (state: BusState) => void;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  private isSoftwareGl: boolean;
  private frameId: number = 0;
  private clock: THREE.Clock;

  // Scene Components
  private busController: BusController;
  private kidControllers: KidMeshController[] = [];
  private envController: ReturnType<typeof createEnvironment>;
  private streetLampLight: THREE.PointLight;

  // Lighting
  private dirSunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private ambientLight: THREE.AmbientLight;

  // Interaction
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2;
  private hitMeshes: THREE.Mesh[] = [];

  // Camera Animation
  private targetCamPos: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private isCameraTransitioning: boolean = false;

  private currentTimeOfDay: TimeOfDay = 'day';

  constructor(options: SceneManagerOptions) {
    this.container = options.container;
    this.onKidSelect = options.onKidSelect;
    this.onBusStateChange = options.onBusStateChange;

    this.clock = new THREE.Clock();

    // 1. WebGL & Software GL Detection
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // 2. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    // 3. Scene & Fog (Default Day sky blue matching reference image)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x38bdf8);
    this.scene.fog = new THREE.Fog(0x38bdf8, 25, 75);

    // 4. Camera & OrbitControls
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 150);
    this.camera.position.set(0.2, 3.2, 10.5);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't clip under ground
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 28;
    this.controls.target.set(0, 1.3, 0);
    this.controls.update();

    this.targetCamPos = this.camera.position.clone();
    this.targetLookAt = this.controls.target.clone();

    // 5. PMREM Room Environment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 6. Lighting Rig
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x86efac, 0.8);
    this.scene.add(this.hemiLight);

    this.dirSunLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    this.dirSunLight.position.set(16, 22, 12);
    this.dirSunLight.castShadow = !this.isSoftwareGl;
    this.dirSunLight.shadow.mapSize.width = 1024;
    this.dirSunLight.shadow.mapSize.height = 1024;
    this.dirSunLight.shadow.camera.near = 1;
    this.dirSunLight.shadow.camera.far = 60;
    this.dirSunLight.shadow.camera.left = -15;
    this.dirSunLight.shadow.camera.right = 15;
    this.dirSunLight.shadow.camera.top = 15;
    this.dirSunLight.shadow.camera.bottom = -15;
    this.dirSunLight.shadow.bias = -0.0005;
    this.dirSunLight.shadow.normalBias = 0.02;
    this.scene.add(this.dirSunLight);

    // 7. Add 3D Models
    // Environment
    this.envController = createEnvironment();
    this.scene.add(this.envController.group);

    // Bus Stop Structure
    const busStop = createBusStop();
    this.scene.add(busStop.group);
    this.streetLampLight = busStop.lampLight;
    this.streetLampLight.intensity = 0.2; // Dim in day

    // 5 Kids
    KIDS_DATA.forEach(kidData => {
      const kidController = createKid(kidData);
      this.kidControllers.push(kidController);
      this.scene.add(kidController.group);
      this.hitMeshes.push(kidController.hitBox);
    });

    // Gorakhpur Express Bus
    this.busController = createBus();
    this.scene.add(this.busController.group);

    // 8. Raycaster & Pointer
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // 9. Event Listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.controls.addEventListener('start', () => {
      this.isCameraTransitioning = false;
    });

    // Start Animation Loop
    this.startLoop();
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerMove = (e: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const visibleHitBoxes = this.kidControllers
      .filter(k => k.group.visible)
      .map(k => k.hitBox);
    const intersects = this.raycaster.intersectObjects(visibleHitBoxes, false);
    if (intersects.length > 0) {
      this.renderer.domElement.style.cursor = 'pointer';
    } else {
      this.renderer.domElement.style.cursor = 'grab';
    }
  };

  private onPointerDown = () => {
    this.raycaster.setFromCamera(this.pointer, this.camera);
    const visibleHitBoxes = this.kidControllers
      .filter(k => k.group.visible)
      .map(k => k.hitBox);
    const intersects = this.raycaster.intersectObjects(visibleHitBoxes, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object as THREE.Mesh;
      const kidId = hit.userData.kidId;
      const kidController = this.kidControllers.find(k => k.kidInfo.id === kidId);
      if (kidController) {
        kidController.triggerJump();
        soundManager.playKidChime(KIDS_DATA.findIndex(k => k.id === kidId));
        this.onKidSelect(kidController.kidInfo);
      }
    }
  };

  public setTimeOfDay(mood: TimeOfDay) {
    this.currentTimeOfDay = mood;
    this.envController.setSunMood(mood);

    if (mood === 'day') {
      const skyDay = new THREE.Color(0x38bdf8);
      this.scene.background = skyDay;
      this.scene.fog = new THREE.Fog(0x38bdf8, 25, 75);
      this.dirSunLight.intensity = 1.5;
      this.dirSunLight.color.setHex(0xfffbeb);
      this.hemiLight.intensity = 0.8;
      this.ambientLight.intensity = 0.5;
      this.streetLampLight.intensity = 0.2;
      this.busController.headlightLeft.intensity = 0.5;
      this.busController.headlightRight.intensity = 0.5;
    } else if (mood === 'sunset') {
      const skySunset = new THREE.Color(0xf97316);
      this.scene.background = skySunset;
      this.scene.fog = new THREE.Fog(0xf97316, 20, 65);
      this.dirSunLight.intensity = 1.2;
      this.dirSunLight.color.setHex(0xf97316);
      this.hemiLight.intensity = 0.6;
      this.ambientLight.intensity = 0.35;
      this.streetLampLight.intensity = 1.5;
      this.busController.headlightLeft.intensity = 2.0;
      this.busController.headlightRight.intensity = 2.0;
    } else {
      // Night
      const skyNight = new THREE.Color(0x090d16);
      this.scene.background = skyNight;
      this.scene.fog = new THREE.Fog(0x090d16, 18, 55);
      this.dirSunLight.intensity = 0.2;
      this.dirSunLight.color.setHex(0x60a5fa);
      this.hemiLight.intensity = 0.25;
      this.ambientLight.intensity = 0.15;
      this.streetLampLight.intensity = 3.2;
      this.busController.headlightLeft.intensity = 4.0;
      this.busController.headlightRight.intensity = 4.0;
    }
  }

  public setCameraPreset(preset: CameraPreset) {
    this.isCameraTransitioning = true;
    switch (preset) {
      case 'overview':
        this.targetCamPos.set(0.2, 3.2, 10.5);
        this.targetLookAt.set(0, 1.3, 0);
        break;
      case 'kids':
        this.targetCamPos.set(0.4, 1.6, 3.8);
        this.targetLookAt.set(0.2, 0.9, 0.2);
        break;
      case 'road':
        // Down the highway looking towards approaching Gorakhpur bus
        this.targetCamPos.set(-7.5, 2.2, 6.2);
        this.targetLookAt.set(12, 1.8, 5.5);
        break;
      case 'shelter':
        this.targetCamPos.set(-3.2, 2.0, 2.5);
        this.targetLookAt.set(-0.5, 1.4, -0.6);
        break;
      case 'bus':
        this.targetCamPos.set(1.5, 2.8, 7.5);
        this.targetLookAt.set(0, 1.6, 5.0);
        break;
    }
  }

  public callBus() {
    // Ensure all 5 boys are visible and ready at the stop
    this.kidControllers.forEach(k => {
      k.group.visible = true;
    });
    this.busController.triggerArrival();
    soundManager.playBusHorn();
    this.onBusStateChange('approaching');
  }

  public departBus() {
    // All 5 boys board the bus and leave!
    // Make them invisible so the bus stop is left completely empty!
    this.kidControllers.forEach(k => {
      k.group.visible = false;
    });
    this.busController.triggerDeparture();
    soundManager.playBusHorn();
    this.onBusStateChange('departing');
  }

  public resetBus() {
    // When bus is reset, the 5 boys return to the station
    this.kidControllers.forEach(k => {
      k.group.visible = true;
    });
    this.busController.resetBus();
    this.onBusStateChange('away');
  }

  public getBusState(): BusState {
    return this.busController.getState();
  }

  public triggerKidAnimation(id: string) {
    const kid = this.kidControllers.find(k => k.kidInfo.id === id);
    if (kid) {
      kid.triggerJump();
    }
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private startLoop = () => {
    let lastBusState = this.busController.getState();

    const tick = () => {
      const delta = Math.min(this.clock.getDelta(), 0.1);
      const elapsedTime = this.clock.getElapsedTime();

      // Update bus
      this.busController.update(delta);
      const currentBusState = this.busController.getState();
      if (currentBusState !== lastBusState) {
        lastBusState = currentBusState;
        this.onBusStateChange(currentBusState);
      }

      // Update environment clouds and sun
      this.envController.update(elapsedTime, delta);

      // Update kids idle & jump animations
      const isBusAtStop = currentBusState === 'at_stop' || currentBusState === 'approaching';
      this.kidControllers.forEach(k => {
        k.update(elapsedTime, delta, isBusAtStop);
      });

      // Smooth camera preset interpolation
      if (this.isCameraTransitioning) {
        this.camera.position.lerp(this.targetCamPos, delta * 3.5);
        this.controls.target.lerp(this.targetLookAt, delta * 3.5);
        this.controls.update();

        if (this.camera.position.distanceTo(this.targetCamPos) < 0.05) {
          this.isCameraTransitioning = false;
        }
      } else {
        this.controls.update();
      }

      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    if (this.isSoftwareGl) {
      this.afterDraw(tick);
    } else {
      this.frameId = requestAnimationFrame(tick);
    }
  };

  public dispose() {
    window.removeEventListener('resize', this.onResize);
    this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);

    if (this.isSoftwareGl) {
      clearTimeout(this.frameId);
    } else {
      cancelAnimationFrame(this.frameId);
    }

    this.controls.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
