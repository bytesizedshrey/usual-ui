import * as THREE from "three";

/**
 * Procedural EV body — extruded panel shapes bent through two deformation
 * passes (a plan-view taper toward the nose/tail, a cross-section camber
 * that tucks the sills in and rolls the shoulder over) so the surfaces read
 * as continuous curves rather than a flat slab. Tires are lathe-revolved
 * for a real sidewall bulge. No external model asset — the whole vehicle is
 * built at runtime.
 */

export interface EVChargingMaterials {
  paint: THREE.MeshPhysicalMaterial;
  paintDark: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  trim: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  rim: THREE.MeshStandardMaterial;
  lampCool: THREE.MeshStandardMaterial;
  lampRear: THREE.MeshStandardMaterial;
  emerald: THREE.MeshStandardMaterial;
}

export interface EVChargingBuild {
  group: THREE.Group;
  materials: EVChargingMaterials;
}

/** @param paintColor body paint hex, e.g. 0x3b444c */
export function makeMaterials(paintColor: number): EVChargingMaterials {
  return {
    paint: new THREE.MeshPhysicalMaterial({ color: paintColor, metalness: 0.55, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.15, envMapIntensity: 1.05 }),
    paintDark: new THREE.MeshPhysicalMaterial({ color: 0x1d2227, metalness: 0.6, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.9 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x0d1319, metalness: 0.2, roughness: 0.035, transparent: true, opacity: 0.78, transmission: 0.18, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.6, side: THREE.DoubleSide }),
    trim: new THREE.MeshStandardMaterial({ color: 0x0c0f12, metalness: 0.5, roughness: 0.55, envMapIntensity: 0.7 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0x9aa4ac, metalness: 1, roughness: 0.18, envMapIntensity: 1.6 }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x0a0b0d, metalness: 0.05, roughness: 0.85, envMapIntensity: 0.35 }),
    rim: new THREE.MeshStandardMaterial({ color: 0x2e3a36, metalness: 0.95, roughness: 0.3, envMapIntensity: 1.3 }),
    lampCool: new THREE.MeshStandardMaterial({ color: 0xdfeef4, emissive: 0xbfe6f2, emissiveIntensity: 0.85, metalness: 0.2, roughness: 0.25 }),
    lampRear: new THREE.MeshStandardMaterial({ color: 0x2a0a0c, emissive: 0xff2a35, emissiveIntensity: 1.1, metalness: 0.3, roughness: 0.3 }),
    emerald: new THREE.MeshStandardMaterial({ color: 0x0b1a14, emissive: 0x27f59a, emissiveIntensity: 0.7, metalness: 0.2, roughness: 0.4 }),
  };
}

function extrude(shape: THREE.Shape, depth: number, bevel: number, segs = 6) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelOffset: 0,
    bevelSegments: segs,
    curveSegments: 26,
  });
  g.translate(0, 0, -(depth - bevel * 2) / 2);
  g.computeVertexNormals();
  return g;
}

/** Plan-view taper: squeeze width toward the nose/tail so the body is not a slab. */
function taperZ(geo: THREE.BufferGeometry, opts: { front?: number; rear?: number; amt?: number; pow?: number; rearAmt?: number }) {
  const { front = 2.4, rear = -2.4, amt = 0.16, pow = 2.2, rearAmt = amt } = opts;
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const t = x >= 0 ? Math.min(1, x / front) : Math.min(1, x / rear);
    const a = x >= 0 ? amt : rearAmt;
    p.setZ(i, z * (1 - a * Math.pow(t, pow)));
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Cross-section camber: tuck the sills in and roll the shoulder over. */
function camberY(geo: THREE.BufferGeometry, { low, high, lowScale = 0.88, highScale = 0.93 }: { low: number; high: number; lowScale?: number; highScale?: number }) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    const z = p.getZ(i);
    const t = Math.min(1, Math.max(0, (y - low) / (high - low)));
    const bell = Math.sin(Math.PI * t);
    const edge = t < 0.5 ? lowScale : highScale;
    p.setZ(i, z * (edge + (1 - edge) * Math.pow(bell, 0.6)));
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function roundedShape(pts: [number, number][], r: number) {
  const s = new THREE.Shape();
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const v1 = new THREE.Vector2(prev[0] - cur[0], prev[1] - cur[1]);
    const v2 = new THREE.Vector2(next[0] - cur[0], next[1] - cur[1]);
    const r1 = Math.min(r, v1.length() / 2);
    const r2 = Math.min(r, v2.length() / 2);
    const a = new THREE.Vector2(cur[0], cur[1]).add(v1.clone().normalize().multiplyScalar(r1));
    const b = new THREE.Vector2(cur[0], cur[1]).add(v2.clone().normalize().multiplyScalar(r2));
    if (i === 0) s.moveTo(a.x, a.y);
    else s.lineTo(a.x, a.y);
    s.quadraticCurveTo(cur[0], cur[1], b.x, b.y);
  }
  s.closePath();
  return s;
}

function lowerBodyShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.3, 0.8);
  s.quadraticCurveTo(-2.32, 0.58, -2.28, 0.52);
  s.lineTo(-2.19, 0.52);
  s.absarc(-1.66, 0.44, 0.53, Math.PI, 0, true);
  s.lineTo(1.09, 0.5);
  s.absarc(1.62, 0.44, 0.53, Math.PI, 0, true);
  s.lineTo(2.19, 0.52);
  s.quadraticCurveTo(2.38, 0.6, 2.46, 0.86);
  s.quadraticCurveTo(2.49, 0.98, 2.3, 1.05);
  s.bezierCurveTo(2.02, 1.1, 1.8, 1.115, 1.56, 1.11);
  s.bezierCurveTo(0.6, 1.135, -0.55, 1.16, -1.34, 1.195);
  s.quadraticCurveTo(-2.06, 1.215, -2.26, 1.09);
  s.quadraticCurveTo(-2.36, 1.0, -2.3, 0.8);
  s.closePath();
  return s;
}

function greenhouseShape() {
  const s = new THREE.Shape();
  s.moveTo(1.52, 1.06);
  s.quadraticCurveTo(1.14, 1.42, 0.78, 1.74);
  s.quadraticCurveTo(0.26, 1.845, -0.46, 1.845);
  s.quadraticCurveTo(-1.14, 1.835, -1.62, 1.72);
  s.quadraticCurveTo(-1.92, 1.6, -2.04, 1.2);
  s.lineTo(1.52, 1.06);
  s.closePath();
  return s;
}

function windowPane(kind: "front" | "rear" | "quarter") {
  if (kind === "front") return roundedShape([[0.22, 1.145], [1.09, 1.145], [0.69, 1.67], [0.29, 1.685]], 0.085);
  if (kind === "rear") return roundedShape([[-1.22, 1.145], [0.08, 1.145], [0.08, 1.675], [-1.08, 1.665]], 0.085);
  return roundedShape([[-1.72, 1.16], [-1.38, 1.16], [-1.3, 1.655], [-1.56, 1.6]], 0.06);
}

function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, name: string) {
  const m = new THREE.Mesh(geo, mat);
  m.name = name;
  return m;
}

function buildWheel(M: EVChargingMaterials) {
  const w = new THREE.Group();
  w.name = "wheel";
  const R = 0.44;
  const halfW = 0.15;
  const rimR = 0.312;

  const pts = [
    new THREE.Vector2(rimR, -halfW),
    new THREE.Vector2(R - 0.055, -halfW - 0.012),
    new THREE.Vector2(R - 0.012, -halfW * 0.82),
    new THREE.Vector2(R, -halfW * 0.55),
    new THREE.Vector2(R, halfW * 0.55),
    new THREE.Vector2(R - 0.012, halfW * 0.82),
    new THREE.Vector2(R - 0.055, halfW + 0.012),
    new THREE.Vector2(rimR, halfW),
  ];
  const tire = mesh(new THREE.LatheGeometry(pts, 64), M.rubber, "tire");
  tire.rotation.x = Math.PI / 2;
  tire.castShadow = true;
  w.add(tire);

  const face = mesh(new THREE.CylinderGeometry(rimR, rimR * 0.99, 0.11, 56), M.rim, "rim_face");
  face.rotation.x = Math.PI / 2;
  face.position.z = halfW - 0.055;
  w.add(face);

  const dish = mesh(new THREE.CylinderGeometry(rimR * 0.86, rimR * 0.7, 0.16, 48), M.trim, "rim_dish");
  dish.rotation.x = Math.PI / 2;
  dish.position.z = halfW - 0.14;
  w.add(dish);

  const lip = mesh(new THREE.TorusGeometry(rimR - 0.008, 0.016, 12, 64), M.chrome, "rim_lip");
  lip.position.z = halfW - 0.012;
  w.add(lip);

  const spokes = new THREE.Group();
  spokes.name = "spokes";
  for (let i = 0; i < 10; i++) {
    const sp = mesh(new THREE.BoxGeometry(0.245, 0.06, 0.05), M.trim, `spoke_${i}`);
    const a = (i / 10) * Math.PI * 2;
    sp.position.set(Math.cos(a) * 0.162, Math.sin(a) * 0.162, halfW - 0.006);
    sp.rotation.z = a;
    spokes.add(sp);
  }
  w.add(spokes);

  const hub = mesh(new THREE.CylinderGeometry(0.062, 0.058, 0.055, 32), M.chrome, "hub");
  hub.rotation.x = Math.PI / 2;
  hub.position.z = halfW + 0.01;
  w.add(hub);
  return w;
}

export function buildCar(paintColor: number): EVChargingBuild {
  const M = makeMaterials(paintColor);
  const car = new THREE.Group();
  car.name = "ev_charging_vehicle";
  const BW = 1.96;
  const GW = 1.7;

  const body = mesh(
    camberY(taperZ(extrude(lowerBodyShape(), BW, 0.1, 8), { amt: 0.07, rearAmt: 0.05, pow: 3.2 }), { low: 0.44, high: 1.2, lowScale: 0.84, highScale: 0.91 }),
    M.paint,
    "body_lower",
  );
  body.castShadow = true;
  body.receiveShadow = true;
  car.add(body);

  const cabin = mesh(
    camberY(taperZ(extrude(greenhouseShape(), GW, 0.15, 8), { front: 1.5, rear: -1.97, amt: 0.14, rearAmt: 0.2, pow: 2 }), { low: 1.06, high: 1.85, lowScale: 0.97, highScale: 0.82 }),
    M.paint,
    "greenhouse",
  );
  cabin.castShadow = true;
  car.add(cabin);

  const seams = new THREE.Group();
  seams.name = "panel_seams";
  ([[-1.3, 0.86, 0.86], [0.16, 0.88, 0.9], [1.44, 0.94, 0.8]] as const).forEach(([x, y, h], i) => {
    const g = new THREE.BoxGeometry(0.012, h, 0.02);
    [-1, 1].forEach((s) => {
      const m = mesh(g, M.trim, `seam_${i}_${s > 0 ? "r" : "l"}`);
      m.position.set(x, y, s * (BW / 2 - 0.055));
      seams.add(m);
    });
  });
  car.add(seams);

  const belt = mesh(new THREE.BoxGeometry(2.9, 0.026, GW + 0.045), M.chrome, "beltline_trim");
  belt.position.set(-0.28, 1.142, 0);
  belt.rotation.z = 0.012;
  car.add(belt);

  // Cowl crease — separates the hood from the windshield/A-pillar so the
  // front panel reads as its own surface instead of blending into the roof.
  const cowl = mesh(new THREE.BoxGeometry(0.018, 0.02, GW - 0.06), M.trim, "cowl_crease");
  cowl.position.set(1.5, 1.065, 0);
  cowl.rotation.z = -1.0;
  car.add(cowl);

  (["front", "rear", "quarter"] as const).forEach((kind) => {
    const g = extrude(windowPane(kind), 0.05, 0.018, 4);
    [-1, 1].forEach((s) => {
      const m = mesh(g, M.glass, `glass_${kind}_${s > 0 ? "r" : "l"}`);
      m.position.z = s * (GW / 2 - 0.1);
      car.add(m);
    });
  });

  const ws = mesh(new THREE.BoxGeometry(0.82, 0.026, GW - 0.4), M.glass, "windshield");
  ws.position.set(1.1, 1.39, 0);
  ws.rotation.z = -0.7;
  car.add(ws);

  const hatch = mesh(new THREE.BoxGeometry(0.58, 0.026, GW - 0.52), M.glass, "hatch_glass");
  hatch.position.set(-1.84, 1.42, 0);
  hatch.rotation.z = 0.86;
  car.add(hatch);

  const AX = [1.62, -1.66];
  AX.forEach((x, i) => {
    const arch = mesh(new THREE.TorusGeometry(0.535, 0.095, 14, 44, Math.PI * 1.06), M.trim, `arch_${i}`);
    arch.rotation.y = Math.PI / 2;
    arch.rotation.x = -0.03;
    arch.position.set(x, 0.44, 0);
    const archInner = arch.clone();
    car.add(arch);
    archInner.name = `arch_inner_${i}`;
    archInner.scale.setScalar(0.98);
    car.add(archInner);

    [-1, 1].forEach((s) => {
      const w = buildWheel(M);
      w.name = `wheel_${i}_${s > 0 ? "r" : "l"}`;
      w.position.set(x, 0.44, s * (BW / 2 - 0.025));
      if (s < 0) w.rotation.y = Math.PI;
      car.add(w);
    });
  });

  const hl = extrude(roundedShape([[2.16, 0.99], [2.47, 1.015], [2.46, 0.895], [2.18, 0.865]], 0.045), 0.09, 0.028, 4);
  [-1, 1].forEach((s) => {
    const m = mesh(hl, M.lampCool, `headlamp_${s > 0 ? "r" : "l"}`);
    m.position.z = s * (BW / 2 - 0.19);
    car.add(m);
  });
  const tl = mesh(new THREE.BoxGeometry(0.055, 0.1, BW - 0.44), M.lampRear, "taillamp_bar");
  tl.position.set(-2.315, 1.02, 0);
  car.add(tl);

  const skirt = mesh(new THREE.BoxGeometry(2.55, 0.12, BW - 0.3), M.trim, "rocker_skirt");
  skirt.position.set(-0.03, 0.52, 0);
  car.add(skirt);

  // Wireless-charging receiver pad — tucked fully behind the rocker skirt
  // (never poking below it) so it reads as a hidden emitter, not a visible
  // plate hanging off the underbody.
  const pad = mesh(new THREE.BoxGeometry(0.95, 0.03, 0.7), M.emerald, "receiver_pad");
  pad.position.set(-0.05, 0.495, 0);
  car.add(pad);

  return { group: car, materials: M };
}

export function disposeCar(build: EVChargingBuild) {
  build.group.traverse((obj) => {
    const m = obj as THREE.Mesh;
    if (!m.isMesh) return;
    m.geometry.dispose();
  });
  Object.values(build.materials).forEach((mat) => mat.dispose());
}
