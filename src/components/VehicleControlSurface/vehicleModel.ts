import * as THREE from "three";

/**
 * Procedural low-poly EV body — extruded shapes for the lower/upper body and
 * greenhouse, tubed trim, boxed lamps/vents, and a charge cable curve. No
 * external model asset: the whole vehicle is built at runtime so the
 * component ships with zero binary dependencies.
 */

export interface VehicleMaterials {
  paint: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  trim: THREE.MeshStandardMaterial;
  gap: THREE.MeshStandardMaterial;
  tire: THREE.MeshStandardMaterial;
  rim: THREE.MeshStandardMaterial;
  tail: THREE.MeshStandardMaterial;
  head: THREE.MeshStandardMaterial;
  plate: THREE.MeshStandardMaterial;
  cable: THREE.MeshStandardMaterial;
  glow: THREE.MeshStandardMaterial;
  pulse: THREE.MeshStandardMaterial;
}

export interface VehicleBuild {
  group: THREE.Group;
  materials: VehicleMaterials;
  cablePath: THREE.CatmullRomCurve3;
  chargePulse: THREE.Mesh;
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, name: string) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  return m;
}

function extrude(shape: THREE.Shape, depth: number, bevelThickness: number) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness,
    bevelSize: bevelThickness * 0.6,
    bevelSegments: 7,
    curveSegments: 26,
  });
  g.translate(0, 0, -(depth / 2 + bevelThickness));
  g.computeVertexNormals();
  return g;
}

/** @param paintColor body paint hex, e.g. 0x121519 */
export function buildVehicle(paintColor: number): VehicleBuild {
  const materials: VehicleMaterials = {
    paint: new THREE.MeshPhysicalMaterial({ color: paintColor, metalness: 0.18, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.9 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x090b0f, metalness: 0.05, roughness: 0.045, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 3.0 }),
    trim: new THREE.MeshStandardMaterial({ color: 0x2c3136, metalness: 0.35, roughness: 0.4, envMapIntensity: 1.3 }),
    gap: new THREE.MeshStandardMaterial({ color: 0x020203, metalness: 0, roughness: 1 }),
    tire: new THREE.MeshStandardMaterial({ color: 0x0b0b0d, metalness: 0, roughness: 0.95, envMapIntensity: 0.4 }),
    rim: new THREE.MeshStandardMaterial({ color: 0x565d64, metalness: 0.45, roughness: 0.36, envMapIntensity: 1.4 }),
    tail: new THREE.MeshStandardMaterial({ color: 0x2a0603, emissive: 0xff2a12, emissiveIntensity: 0.42, roughness: 0.3, metalness: 0.1 }),
    head: new THREE.MeshStandardMaterial({ color: 0x1a1d22, emissive: 0xdfe8ff, emissiveIntensity: 0.42, roughness: 0.25, metalness: 0.1 }),
    plate: new THREE.MeshStandardMaterial({ color: 0x8f9492, metalness: 0.1, roughness: 0.62 }),
    cable: new THREE.MeshStandardMaterial({ color: 0x141618, metalness: 0.2, roughness: 0.7 }),
    glow: new THREE.MeshStandardMaterial({ color: 0x07130a, emissive: 0x2edc46, emissiveIntensity: 0.06, roughness: 0.4 }),
    pulse: new THREE.MeshStandardMaterial({ color: 0x07130a, emissive: 0x2edc46, emissiveIntensity: 3.2, roughness: 0.4 }),
  };

  const car = new THREE.Group();
  car.name = "vehicle";

  const lower = new THREE.Shape();
  lower.moveTo(2.22, 0.34);
  lower.lineTo(2.04, 0.34);
  lower.absarc(1.48, 0.34, 0.56, 0, Math.PI, false);
  lower.lineTo(-0.92, 0.32);
  lower.absarc(-1.48, 0.32, 0.56, 0, Math.PI, false);
  lower.lineTo(-2.2, 0.36);
  lower.quadraticCurveTo(-2.42, 0.46, -2.4, 0.64);
  lower.lineTo(-2.36, 0.8);
  lower.quadraticCurveTo(0.0, 0.85, 2.32, 0.86);
  lower.lineTo(2.3, 0.62);
  lower.quadraticCurveTo(2.3, 0.4, 2.22, 0.34);
  car.add(mesh(extrude(lower, 1.74, 0.07), materials.paint, "body_lower"));

  const upper = new THREE.Shape();
  upper.moveTo(-2.28, 0.74);
  upper.quadraticCurveTo(-2.34, 0.83, -2.18, 0.87);
  upper.quadraticCurveTo(-1.7, 0.94, -1.14, 0.99);
  upper.lineTo(-0.2, 1.01);
  upper.quadraticCurveTo(0.9, 1.04, 1.56, 1.05);
  upper.quadraticCurveTo(1.9, 1.05, 2.02, 1.01);
  upper.quadraticCurveTo(2.26, 0.93, 2.3, 0.82);
  upper.lineTo(2.3, 0.74);
  upper.lineTo(-2.28, 0.74);
  car.add(mesh(extrude(upper, 1.64, 0.06), materials.paint, "body_upper"));

  const house = new THREE.Shape();
  house.moveTo(-1.1, 0.94);
  house.quadraticCurveTo(-0.7, 1.3, -0.05, 1.45);
  house.quadraticCurveTo(0.5, 1.55, 1.0, 1.49);
  house.quadraticCurveTo(1.56, 1.41, 1.99, 1.0);
  house.lineTo(1.97, 0.94);
  house.lineTo(-1.1, 0.94);
  car.add(mesh(extrude(house, 1.44, 0.07), materials.glass, "greenhouse"));

  const roofCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.58, 1.26, 0),
    new THREE.Vector3(0.0, 1.46, 0),
    new THREE.Vector3(0.55, 1.54, 0),
    new THREE.Vector3(1.1, 1.46, 0),
    new THREE.Vector3(1.5, 1.29, 0),
  ]);
  for (const z of [-0.7, 0.7]) {
    const rail = mesh(new THREE.TubeGeometry(roofCurve, 40, 0.024, 12, false), materials.trim, "roof_rail");
    rail.position.z = z;
    car.add(rail);
  }

  const dloPts: THREE.Vector3[] = [];
  for (const p of house.getPoints(90)) dloPts.push(new THREE.Vector3(p.x, p.y, 0));
  const dloCurve = new THREE.CatmullRomCurve3(dloPts, true);
  for (const z of [-0.735, 0.735]) {
    const dlo = mesh(new THREE.TubeGeometry(dloCurve, 200, 0.013, 8, true), materials.trim, "window_trim");
    dlo.position.z = z;
    car.add(dlo);
    const bpillar = mesh(new THREE.BoxGeometry(0.075, 0.52, 0.022), materials.paint, "b_pillar");
    bpillar.position.set(0.3, 1.16, z * 0.995);
    bpillar.rotation.z = 0.13;
    car.add(bpillar);
  }

  for (const z of [-0.882, 0.882]) {
    const s = Math.sign(z);
    const belt = mesh(new THREE.BoxGeometry(3.0, 0.024, 0.026), materials.trim, "beltline_trim");
    belt.position.set(0.42, 0.965, z * 0.995);
    car.add(belt);
    for (const x of [-0.44, 0.6]) {
      const h = mesh(new THREE.BoxGeometry(0.18, 0.034, 0.024), materials.trim, "door_handle");
      h.position.set(x, 0.885, z + s * 0.008);
      car.add(h);
    }
    for (const x of [-0.94, 0.08, 1.06]) {
      const g = mesh(new THREE.BoxGeometry(0.012, 0.3, 0.008), materials.gap, "panel_gap");
      g.position.set(x, 0.875, z + s * 0.004);
      car.add(g);
    }
    const arm = mesh(new THREE.BoxGeometry(0.1, 0.05, 0.12), materials.trim, "mirror_arm");
    arm.position.set(-0.98, 1.03, z + s * 0.05);
    car.add(arm);
    const mir = mesh(new THREE.BoxGeometry(0.22, 0.11, 0.08), materials.paint, "mirror_shell");
    mir.position.set(-1.04, 1.06, z + s * 0.16);
    mir.rotation.y = s * 0.16;
    car.add(mir);
  }

  function wheel(x: number, z: number, name: string) {
    const g = new THREE.Group();
    g.name = name;
    const s = Math.sign(z);
    const tire = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.27, 52), materials.tire, name + "_tire");
    tire.rotation.x = Math.PI / 2;
    g.add(tire);
    const face = mesh(new THREE.CylinderGeometry(0.295, 0.295, 0.278, 48), materials.rim, name + "_rim");
    face.rotation.x = Math.PI / 2;
    g.add(face);
    const lip = mesh(new THREE.TorusGeometry(0.285, 0.024, 12, 48), materials.rim, name + "_lip");
    lip.position.z = s * 0.133;
    g.add(lip);
    for (let i = 0; i < 5; i++) {
      const spoke = mesh(new THREE.BoxGeometry(0.062, 0.26, 0.03), materials.trim, name + "_spoke");
      spoke.position.set(Math.sin((i / 5) * Math.PI * 2) * 0.135, Math.cos((i / 5) * Math.PI * 2) * 0.135, s * 0.142);
      spoke.rotation.z = (-i / 5) * Math.PI * 2;
      g.add(spoke);
    }
    const cap = mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.3, 20), materials.trim, name + "_cap");
    cap.rotation.x = Math.PI / 2;
    g.add(cap);
    g.position.set(x, 0.4, z);
    return g;
  }
  car.add(wheel(-1.48, 0.79, "wheel_fl"), wheel(-1.48, -0.79, "wheel_fr"), wheel(1.48, 0.79, "wheel_rl"), wheel(1.48, -0.79, "wheel_rr"));

  const bar = mesh(new THREE.BoxGeometry(0.05, 0.042, 1.3), materials.tail, "tail_bar");
  bar.position.set(2.355, 0.9, 0);
  car.add(bar);
  const barTrim = mesh(new THREE.BoxGeometry(0.035, 0.09, 1.36), materials.gap, "tail_recess");
  barTrim.position.set(2.345, 0.9, 0);
  car.add(barTrim);
  for (const z of [-0.62, 0.62]) {
    const hl = mesh(new THREE.BoxGeometry(0.05, 0.05, 0.44), materials.head, "headlamp");
    hl.position.set(-2.44, 0.76, z);
    car.add(hl);
  }
  const plate = mesh(new THREE.BoxGeometry(0.02, 0.12, 0.34), materials.plate, "plate");
  plate.position.set(2.37, 0.6, 0.06);
  car.add(plate);
  const intake = mesh(new THREE.BoxGeometry(0.06, 0.12, 1.1), materials.gap, "front_intake");
  intake.position.set(-2.42, 0.45, 0);
  car.add(intake);
  const diffuser = mesh(new THREE.BoxGeometry(0.08, 0.13, 1.16), materials.gap, "rear_diffuser");
  diffuser.position.set(2.24, 0.4, 0);
  car.add(diffuser);
  const spoiler = mesh(new THREE.BoxGeometry(0.24, 0.045, 1.22), materials.paint, "spoiler");
  spoiler.position.set(1.95, 1.09, 0);
  spoiler.rotation.z = -0.5;
  car.add(spoiler);

  const port = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 28), materials.gap, "charge_port");
  port.rotation.x = Math.PI / 2;
  port.position.set(1.92, 0.9, 0.885);
  car.add(port);
  const plug = mesh(new THREE.BoxGeometry(0.13, 0.15, 0.14), materials.trim, "charge_plug");
  plug.position.set(1.92, 0.9, 0.94);
  car.add(plug);

  const cablePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(1.92, 0.9, 1.01),
    new THREE.Vector3(2.02, 0.7, 1.26),
    new THREE.Vector3(1.92, 0.28, 1.58),
    new THREE.Vector3(1.45, 0.05, 1.84),
    new THREE.Vector3(0.3, 0.045, 2.0),
    new THREE.Vector3(-1.4, 0.045, 1.88),
  ]);
  car.add(mesh(new THREE.TubeGeometry(cablePath, 96, 0.036, 14, false), materials.cable, "charge_cable"));
  const cableGlow = mesh(new THREE.TubeGeometry(cablePath, 96, 0.0125, 10, false), materials.glow, "charge_trace");
  cableGlow.position.y = 0.031;
  car.add(cableGlow);

  const chargePulse = mesh(new THREE.SphereGeometry(0.045, 18, 14), materials.pulse, "charge_pulse");
  chargePulse.visible = false;
  car.add(chargePulse);

  return { group: car, materials, cablePath, chargePulse };
}

export function disposeVehicle(build: VehicleBuild) {
  build.group.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.dispose();
  });
  Object.values(build.materials).forEach((mat) => mat.dispose());
}
