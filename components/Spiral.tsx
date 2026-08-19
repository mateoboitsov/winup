"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import gsap from "gsap";
import { PROJECTS_DATA, coverUrl, type Project } from "@/lib/projects";
import { transition, type GalleryView } from "@/lib/transition";
import { playPageEnter } from "@/lib/pageTransition";

// ─── Parámetros compartidos + por vista ────────────────────────────────
const PARAMS = {
  // Espiral
  radius: 4.0,
  heightSpacing: 1.0,
  angleIncrement: 1.0,
  spiralFogNear: 7,
  spiralFogFar: 20,
  spiralCamZ: 10.5,
  // Grid (2 en línea)
  cols: 2,
  colGap: 0.45,
  rowGap: 0.4,
  gridFogNear: 14,
  gridFogFar: 28,
  gridCamZ: 9.5,
  // Común
  sensitivity: 0.0015,
  lightIntensity: 1.5,
  autoScrollSpeed: 0.0025,
  shadowBase: 0.32,
  shadowHover: 0.55,
  limeHover: 0.55,
  exitDist: 15,
  exitSpeed: 1.7,
  exitStagger: 0.1,
  enterDelay: 0.1,
  closeDuration: 1.1,
  viewMorphDuration: 0.95,
};

const MOBILE_MAX_WIDTH = 720;
const CAMERA_FOV = 46;
const CARD_W = 3.6;
const GRID_SPAN = PARAMS.cols * (CARD_W + PARAMS.colGap) - PARAMS.colGap;

type ViewportTuning = {
  spiralCamZ: number;
  gridCamZ: number;
  spiralFogNear: number;
  spiralFogFar: number;
  gridFogNear: number;
  gridFogFar: number;
};

function getViewportTuning(width: number, height: number): ViewportTuning {
  if (width > MOBILE_MAX_WIDTH) {
    return {
      spiralCamZ: PARAMS.spiralCamZ,
      gridCamZ: PARAMS.gridCamZ,
      spiralFogNear: PARAMS.spiralFogNear,
      spiralFogFar: PARAMS.spiralFogFar,
      gridFogNear: PARAMS.gridFogNear,
      gridFogFar: PARAMS.gridFogFar,
    };
  }

  const aspect = width / height;
  const tanHalf = Math.tan(((CAMERA_FOV * Math.PI) / 180) / 2);

  function fitCamZ(baseZ: number, contentSpan: number, targetFill: number) {
    const viewW = 2 * baseZ * tanHalf * aspect;
    const fill = contentSpan / viewW;
    if (fill <= targetFill) return baseZ;
    return (contentSpan / targetFill) / (2 * tanHalf * aspect);
  }

  const spiralBaseDist = PARAMS.spiralCamZ - PARAMS.radius;
  const spiralViewW = 2 * spiralBaseDist * tanHalf * aspect;
  const spiralFill = CARD_W / spiralViewW;
  const spiralTargetFill = 0.62;
  const spiralCamZ =
    spiralFill <= spiralTargetFill
      ? PARAMS.spiralCamZ
      : (CARD_W / spiralTargetFill) / (2 * tanHalf * aspect) + PARAMS.radius;

  const gridCamZ = fitCamZ(PARAMS.gridCamZ, GRID_SPAN, 0.92);
  const spiralScale = spiralCamZ / PARAMS.spiralCamZ;
  const gridScale = gridCamZ / PARAMS.gridCamZ;

  return {
    spiralCamZ,
    gridCamZ,
    spiralFogNear: PARAMS.spiralFogNear * spiralScale,
    spiralFogFar: PARAMS.spiralFogFar * spiralScale,
    gridFogNear: PARAMS.gridFogNear * gridScale,
    gridFogFar: PARAMS.gridFogFar * gridScale,
  };
}

function camZFor(mode: GalleryView, viewport: ViewportTuning) {
  return mode === "spiral" ? viewport.spiralCamZ : viewport.gridCamZ;
}

function fogFor(mode: GalleryView, viewport: ViewportTuning) {
  return mode === "spiral"
    ? { near: viewport.spiralFogNear, far: viewport.spiralFogFar }
    : { near: viewport.gridFogNear, far: viewport.gridFogFar };
}

export default function Spiral() {
  const router = useRouter();
  const routerRef = useRef(router);
  routerRef.current = router;

  const mountRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const hoverLabelRef = useRef<HTMLDivElement>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const hoveredProjectRef = useRef<Project | null>(null);
  hoveredProjectRef.current = hoveredProject;
  const [displayProject, setDisplayProject] = useState<Project | null>(null);
  const displayProjectRef = useRef<Project | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const transitioningRef = useRef(false);
  const [viewMode, setViewMode] = useState<GalleryView>(() => transition.viewMode);
  const viewModeRef = useRef<GalleryView>(transition.viewMode);
  const switchViewRef = useRef<((mode: GalleryView) => void) | null>(null);
  const [reverseBg, setReverseBg] = useState<string | null>(() =>
    transition.active ? coverUrl(transition.projectId) : null
  );
  const [vignetteStart] = useState(() => (transition.active ? 0 : 1));
  const introRef = useRef({
    yOffset: 0,
    spinOffset: 0,
    speedBoost: 1,
  });

  const stateRef = useRef({
    scrollPos: 0,
    targetScroll: 0,
    isDragging: false,
    prevX: 0,
    prevY: 0,
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const initialMode = viewModeRef.current;
    let viewport = getViewportTuning(width, height);

    const scene = new THREE.Scene();
    const initialFog = fogFor(initialMode, viewport);
    scene.fog = new THREE.Fog(0x1a1a1a, initialFog.near, initialFog.far);

    const camera = new THREE.PerspectiveCamera(CAMERA_FOV, width / height, 0.1, 1000);
    camera.position.set(0, 0, camZFor(initialMode, viewport));

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const pointLight = new THREE.PointLight(0xffffff, PARAMS.lightIntensity, 50);
    pointLight.position.set(0, 5, 8);
    scene.add(pointLight);

    function createMorphableCardGeometry(w: number, h: number, segments: number, radius: number) {
      const geo = new THREE.PlaneGeometry(w, h, segments, segments);
      const pos = geo.attributes.position;
      const baseX = new Float32Array(pos.count);
      for (let i = 0; i < pos.count; i++) baseX[i] = pos.getX(i);

      const setCurvature = (c: number) => {
        for (let i = 0; i < pos.count; i++) {
          const x = baseX[i]!;
          const zCurve = radius - Math.sqrt(Math.max(0, radius * radius - x * x));
          pos.setZ(i, -zCurve * c);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
      };

      return { geo, setCurvature };
    }

    const cardW = 3.6;
    const cardH = 2.4;
    const cardSegments = 32;
    const { geo: cardGeometry, setCurvature: setCardCurvature } = createMorphableCardGeometry(
      cardW,
      cardH,
      cardSegments,
      PARAMS.radius
    );
    // Grid = plano (0), espiral = curvado (1)
    setCardCurvature(initialMode === "spiral" ? 1 : 0);
    const cellW = cardW + PARAMS.colGap;
    const cellH = cardH + PARAMS.rowGap;
    const COLS = PARAMS.cols;

    function createRoundedAlphaTexture(w: number, h: number, r: number) {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
      ctx.fill();
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }
    const CARD_CORNER_RADIUS = 20;
    const roundedAlphaMap = createRoundedAlphaTexture(512, 342, CARD_CORNER_RADIUS);

    const cardAspect = cardW / cardH;
    /** Lado máximo de textura en GPU. */
    const CARD_TEX_MAX = 1024;

    /**
     * Bake object-fit:cover al aspect de la tarjeta en un canvas fijo.
     * Así todas las portadas llenan el plano 0–1 sin repeat/offset
     * (evita el “saltito” al escalar / morph).
     */
    function textureFromImage(source: CanvasImageSource, srcW: number, srcH: number) {
      const outW = CARD_TEX_MAX;
      const outH = Math.max(1, Math.round(CARD_TEX_MAX / cardAspect));
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d")!;

      const imageAspect = srcW / srcH;
      let dw: number;
      let dh: number;
      let dx: number;
      let dy: number;
      if (imageAspect > cardAspect) {
        dh = outH;
        dw = outH * imageAspect;
        dx = (outW - dw) / 2;
        dy = 0;
      } else {
        dw = outW;
        dh = outW / imageAspect;
        dx = 0;
        dy = (outH - dh) / 2;
      }
      ctx.drawImage(source, dx, dy, dw, dh);

      const tex = new THREE.CanvasTexture(canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = false;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, 1);
      tex.offset.set(0, 0);
      return tex;
    }

    function createHiddenPlaceholderTexture() {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, 1, 1);
      const texture = new THREE.CanvasTexture(canvas);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;
      return texture;
    }

    const placeholderTexture = createHiddenPlaceholderTexture();

    const textureReady: boolean[] = PROJECTS_DATA.map(() => false);
    const cachedTextures: THREE.Texture[] = PROJECTS_DATA.map(() => placeholderTexture);

    function createSoftShadowTexture(size: number) {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, "rgba(0,0,0,0.6)");
      grad.addColorStop(0.6, "rgba(0,0,0,0.25)");
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      return tex;
    }
    const shadowTex = createSoftShadowTexture(128);
    const shadowGeometry = new THREE.PlaneGeometry(cardW * 1.2, cardH * 1.35);
    const SHADOW_OFFSET = new THREE.Vector3(0, -cardH * 0.15, -0.5);
    const _shadowOffset = new THREE.Vector3();
    const _tmpVec = new THREE.Vector3();

    const cardsGroup = new THREE.Group();
    scene.add(cardsGroup);

    const poolSize = 18;
    const cardMeshes: THREE.Mesh[] = [];

    const LIME = 0xc8ff00;

    for (let i = 0; i < poolSize; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: cachedTextures[i % PROJECTS_DATA.length],
        side: THREE.DoubleSide,
        toneMapped: false,
        alphaMap: roundedAlphaMap,
        alphaTest: 0.5,
      });
      const mesh = new THREE.Mesh(cardGeometry, material);

      const limeMat = new THREE.MeshBasicMaterial({
        color: LIME,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
        fog: false,
        alphaMap: roundedAlphaMap,
        // alphaTest bajo: con opacity < 0.5, un alphaTest de 0.5 descartaba toda la capa
        alphaTest: 0.05,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      const limeOverlay = new THREE.Mesh(cardGeometry, limeMat);
      limeOverlay.position.z = 0.03;
      limeOverlay.renderOrder = 2;
      limeOverlay.raycast = () => {};
      mesh.add(limeOverlay);

      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        fog: false,
        opacity: PARAMS.shadowBase,
      });
      const shadowMesh = new THREE.Mesh(shadowGeometry, shadowMat);
      shadowMesh.renderOrder = -1;
      cardsGroup.add(shadowMesh);

      mesh.userData = {
        virtIdx: null,
        data: null,
        shadow: shadowMesh,
        shadowMat,
        limeMat,
        shadowBaseOpacity: PARAMS.shadowBase,
      };
      cardsGroup.add(mesh);
      cardMeshes.push(mesh);
    }

    function revealInCascadeFromCenter(mesh: THREE.Mesh, tex: THREE.Texture) {
      const mat = mesh.material as THREE.MeshBasicMaterial;
      const dist = Math.abs(((mesh.userData.virtIdx as number) ?? 0) - stateRef.current.scrollPos);
      const delay = Math.min(dist * 0.045, 0.75);
      mat.map = tex;
      mat.transparent = true;
      mat.opacity = 0;
      mat.needsUpdate = true;
      gsap.to(mat, {
        opacity: 1,
        duration: 0.6,
        delay,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => {
          mat.transparent = false;
        },
      });
    }

    // Carga covers reescaladas tras crear el pool (evita carrera con caché del navegador)
    const coverLoaders: HTMLImageElement[] = [];
    PROJECTS_DATA.forEach((data, i) => {
      const img = new Image();
      coverLoaders.push(img);
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        const next = textureFromImage(img, img.naturalWidth, img.naturalHeight);
        cachedTextures[i] = next;
        const loadedProjectId = data.id;
        cardMeshes.forEach((mesh) => {
          const meshData = mesh.userData.data as Project | null;
          if (meshData?.id !== loadedProjectId) return;
          revealInCascadeFromCenter(mesh, next);
        });
        textureReady[i] = true;
      };
      img.src = coverUrl(data.id);
    });

    function setShadowFade(m: THREE.Mesh, factor: number) {
      const shadowMat = m.userData.shadowMat as THREE.MeshBasicMaterial;
      const base = (m.userData.shadowBaseOpacity as number) ?? PARAMS.shadowBase;
      shadowMat.opacity = base * factor;
    }

    function setCardFade(m: THREE.Mesh, factor: number) {
      (m.material as THREE.MeshBasicMaterial).opacity = factor;
      setShadowFade(m, factor);
    }

    const HERO_DIST = 6;
    const GROUP_ZOOMOUT = 0.55;
    let viewMorphing = false;

    function heroFullscreenScale(dist: number) {
      const vFov = (camera.fov * Math.PI) / 180;
      const viewH = 2 * dist * Math.tan(vFov / 2);
      const viewW = viewH * camera.aspect;
      return Math.max(viewW / cardW, viewH / cardH);
    }

    function createHero(map: THREE.Texture | null, curved: boolean) {
      const geo = curved
        ? new THREE.PlaneGeometry(cardW, cardH, cardSegments, cardSegments)
        : new THREE.PlaneGeometry(cardW, cardH, 1, 1);
      const posAttr = geo.attributes.position;
      const baseX = new Float32Array(posAttr.count);
      for (let i = 0; i < posAttr.count; i++) baseX[i] = posAttr.getX(i);
      const setCurvature = (c: number) => {
        if (!curved) return;
        const r = PARAMS.radius;
        for (let i = 0; i < posAttr.count; i++) {
          const x = baseX[i];
          const zCurve = r - Math.sqrt(Math.max(0, r * r - x * x));
          posAttr.setZ(i, -zCurve * c);
        }
        posAttr.needsUpdate = true;
      };

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = 512;
      maskCanvas.height = 342;
      const maskCtx = maskCanvas.getContext("2d")!;
      const maskTex = new THREE.CanvasTexture(maskCanvas);
      const setRadius = (r: number) => {
        const w = maskCanvas.width;
        const h = maskCanvas.height;
        maskCtx.fillStyle = "#000";
        maskCtx.fillRect(0, 0, w, h);
        maskCtx.fillStyle = "#fff";
        if (r <= 0.5) {
          maskCtx.fillRect(0, 0, w, h);
        } else {
          maskCtx.beginPath();
          maskCtx.moveTo(r, 0);
          maskCtx.lineTo(w - r, 0);
          maskCtx.quadraticCurveTo(w, 0, w, r);
          maskCtx.lineTo(w, h - r);
          maskCtx.quadraticCurveTo(w, h, w - r, h);
          maskCtx.lineTo(r, h);
          maskCtx.quadraticCurveTo(0, h, 0, h - r);
          maskCtx.lineTo(0, r);
          maskCtx.quadraticCurveTo(0, 0, r, 0);
          maskCtx.closePath();
          maskCtx.fill();
        }
        maskTex.needsUpdate = true;
      };
      setRadius(CARD_CORNER_RADIUS);

      const mat = new THREE.MeshBasicMaterial({
        map,
        side: THREE.DoubleSide,
        toneMapped: false,
        alphaMap: maskTex,
        alphaTest: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      return { mesh, geo, mat, maskTex, setCurvature, setRadius };
    }

    type CardPose = {
      x: number;
      y: number;
      z: number;
      rotY: number;
      groupRotY: number;
      groupY: number;
    };

    function poseForVirt(virtIdx: number, sPos: number, mode: GalleryView): Omit<CardPose, "groupRotY" | "groupY"> {
      if (mode === "spiral") {
        const angle = virtIdx * PARAMS.angleIncrement;
        return {
          x: Math.sin(angle) * PARAMS.radius,
          y: virtIdx * PARAMS.heightSpacing,
          z: Math.cos(angle) * PARAMS.radius,
          rotY: angle,
        };
      }
      const col = ((virtIdx % COLS) + COLS) % COLS;
      const row = Math.floor(virtIdx / COLS);
      return {
        x: (col - (COLS - 1) / 2) * cellW,
        y: row * cellH,
        z: 0,
        rotY: 0,
      };
    }

    function groupPose(sPos: number, mode: GalleryView) {
      if (mode === "spiral") {
        return {
          groupRotY: -sPos * PARAMS.angleIncrement,
          groupY: -sPos * PARAMS.heightSpacing,
        };
      }
      return { groupRotY: 0, groupY: -(sPos / COLS) * cellH };
    }

    function formulaVirtIdx(poolIndex: number, sPos: number) {
      let relativeIndex = poolIndex - (sPos % poolSize);
      while (relativeIndex < -poolSize / 2) relativeIndex += poolSize;
      while (relativeIndex >= poolSize / 2) relativeIndex -= poolSize;
      return Math.round(sPos + relativeIndex);
    }

    function layoutCards(sPos: number, mode: GalleryView = viewModeRef.current) {
      const len = PROJECTS_DATA.length;
      const g = groupPose(sPos, mode);
      const intro = introRef.current;

      cardMeshes.forEach((mesh, i) => {
        const virtIdx = formulaVirtIdx(i, sPos);

        if (mesh.userData.virtIdx !== virtIdx) {
          mesh.userData.virtIdx = virtIdx;
          const dataIdx = ((virtIdx % len) + len) % len;
          mesh.userData.data = PROJECTS_DATA[dataIdx]!;
          const mat = mesh.material as THREE.MeshBasicMaterial;
          const ready = textureReady[dataIdx];
          mat.map = cachedTextures[dataIdx];
          mat.transparent = !ready;
          mat.opacity = ready ? 1 : 0;
          mat.needsUpdate = true;
        }

        const pose = poseForVirt(virtIdx, sPos, mode);
        mesh.position.set(pose.x, pose.y, pose.z);
        mesh.rotation.set(0, pose.rotY, 0);

        const shadow = mesh.userData.shadow as THREE.Mesh;
        shadow.quaternion.copy(mesh.quaternion);
        shadow.scale.copy(mesh.scale);
        _shadowOffset.copy(SHADOW_OFFSET).applyQuaternion(mesh.quaternion);
        shadow.position.copy(mesh.position).add(_shadowOffset);
        // En espiral la sombra se asoma por el canto → solo en grid
        shadow.visible = mode === "grid";
      });

      cardsGroup.rotation.y = g.groupRotY + intro.spinOffset;
      cardsGroup.position.y = g.groupY + intro.yOffset;
    }

    function switchView(mode: GalleryView) {
      if (mode === viewModeRef.current || viewMorphing || transitioningRef.current) return;
      viewMorphing = true;
      const sPos = stateRef.current.scrollPos;
      const fromMode = viewModeRef.current;
      const gFrom = {
        rotY: cardsGroup.rotation.y,
        y: cardsGroup.position.y,
      };
      const gTo = groupPose(sPos, mode);

      cardsGroup.updateMatrixWorld(true);
      const startWorld = cardMeshes.map((m) => {
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        m.getWorldPosition(pos);
        m.getWorldQuaternion(quat);
        return { pos, quat, virtIdx: m.userData.virtIdx as number };
      });

      // Pose destino (layout temporal, luego se restaura)
      cardsGroup.rotation.y = gTo.groupRotY;
      cardsGroup.position.y = gTo.groupY;
      cardMeshes.forEach((m, i) => {
        const pose = poseForVirt(startWorld[i]!.virtIdx, sPos, mode);
        m.position.set(pose.x, pose.y, pose.z);
        m.rotation.set(0, pose.rotY, 0);
      });
      cardsGroup.updateMatrixWorld(true);
      const endWorld = cardMeshes.map((m) => {
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        m.getWorldPosition(pos);
        m.getWorldQuaternion(quat);
        return { pos, quat };
      });

      cardsGroup.rotation.y = gFrom.rotY;
      cardsGroup.position.y = gFrom.y;
      cardMeshes.forEach((m, i) => {
        const pose = poseForVirt(startWorld[i]!.virtIdx, sPos, fromMode);
        m.position.set(pose.x, pose.y, pose.z);
        m.rotation.set(0, pose.rotY, 0);
      });
      cardsGroup.updateMatrixWorld(true);

      const curveFrom = fromMode === "spiral" ? 1 : 0;
      const curveTo = mode === "spiral" ? 1 : 0;
      setCardCurvature(curveFrom);

      type MorphCard = {
        mesh: THREE.Mesh;
        shadow: THREE.Mesh;
        startPos: THREE.Vector3;
        startQuat: THREE.Quaternion;
        endPos: THREE.Vector3;
        endQuat: THREE.Quaternion;
        virtIdx: number;
        camDist: number;
        travel: number;
        startDepth: number;
        endDepth: number;
      };

      const camPos = camera.position.clone();
      const camEnd = new THREE.Vector3(0, 0, camZFor(mode, viewport));

      const depthFor = (pos: THREE.Vector3, virtIdx: number, layout: GalleryView, cam: THREE.Vector3) => {
        if (layout === "spiral") return pos.distanceTo(cam);
        const focus = Math.abs(virtIdx - sPos);
        return focus * 1.25 + pos.distanceTo(cam) * 0.15;
      };

      const morphCards: MorphCard[] = cardMeshes.map((mesh, i) => {
        const shadow = mesh.userData.shadow as THREE.Mesh;
        const sw = startWorld[i]!;
        const ew = endWorld[i]!;

        cardsGroup.remove(mesh);
        cardsGroup.remove(shadow);
        scene.add(mesh);
        scene.add(shadow);

        mesh.position.copy(sw.pos);
        mesh.quaternion.copy(sw.quat);
        mesh.scale.set(1, 1, 1);

        shadow.visible = false;
        gsap.killTweensOf(shadow.material as THREE.MeshBasicMaterial);
        (shadow.material as THREE.MeshBasicMaterial).opacity = 0;

        return {
          mesh,
          shadow,
          startPos: sw.pos.clone(),
          startQuat: sw.quat.clone(),
          endPos: ew.pos.clone(),
          endQuat: ew.quat.clone(),
          virtIdx: sw.virtIdx,
          camDist: sw.pos.distanceToSquared(camPos),
          travel: sw.pos.distanceToSquared(ew.pos),
          startDepth: depthFor(sw.pos, sw.virtIdx, fromMode, camPos),
          endDepth: depthFor(ew.pos, sw.virtIdx, mode, camEnd),
        };
      });

      morphCards.sort((a, b) => a.camDist - b.camDist || a.travel - b.travel);

      const fog = scene.fog as THREE.Fog;
      const camZ = camZFor(mode, viewport);
      const { near, far } = fogFor(mode, viewport);
      const d = PARAMS.viewMorphDuration;
      const ease = "power3.inOut";
      const maxStagger = 0.35;
      const last = Math.max(1, morphCards.length - 1);

      morphCards.forEach((c, order) => {
        const delay = (order / last) * maxStagger;
        const mat = c.mesh.material as THREE.MeshBasicMaterial;
        mat.depthTest = false;
        mat.depthWrite = false;

        const proxy = { t: 0 };
        gsap.to(proxy, {
          t: 1,
          duration: d,
          delay,
          ease,
          overwrite: true,
          onUpdate: () => {
            c.mesh.position.lerpVectors(c.startPos, c.endPos, proxy.t);

            const depth = THREE.MathUtils.lerp(c.startDepth, c.endDepth, proxy.t);
            c.mesh.renderOrder = Math.round(10000 - depth * 100);

            const frontness = THREE.MathUtils.clamp(1 - depth / 18, 0, 1);
            const arc = Math.sin(proxy.t * Math.PI) * 0.55 * frontness;
            _tmpVec.copy(camPos).lerp(camEnd, proxy.t).sub(c.mesh.position);
            if (_tmpVec.lengthSq() > 1e-6) {
              _tmpVec.normalize();
              c.mesh.position.addScaledVector(_tmpVec, arc);
            }

            c.mesh.quaternion.slerpQuaternions(c.startQuat, c.endQuat, proxy.t);
          },
        });
      });

      const curveProxy = { c: curveFrom };
      gsap.to(curveProxy, {
        c: curveTo,
        duration: d,
        ease,
        overwrite: true,
        onUpdate: () => setCardCurvature(curveProxy.c),
        onComplete: () => setCardCurvature(curveTo),
      });

      gsap.to(cardsGroup.rotation, { y: gTo.groupRotY, duration: d, ease, overwrite: true });
      gsap.to(cardsGroup.position, { y: gTo.groupY, duration: d, ease, overwrite: true });
      gsap.to(camera.position, { z: camZ, duration: d, ease, overwrite: true });
      gsap.to(fog, { near, far, duration: d, ease, overwrite: true });

      viewModeRef.current = mode;
      transition.viewMode = mode;

      gsap.delayedCall(d + maxStagger + 0.05, () => {
        morphCards.forEach((c) => {
          scene.remove(c.mesh);
          scene.remove(c.shadow);
          cardsGroup.add(c.mesh);
          cardsGroup.add(c.shadow);
          c.mesh.scale.set(1, 1, 1);
          c.shadow.scale.set(1, 1, 1);
          c.mesh.renderOrder = 0;
          c.shadow.renderOrder = -1;
          const mat = c.mesh.material as THREE.MeshBasicMaterial;
          mat.depthTest = true;
          mat.depthWrite = true;
        });

        setCardCurvature(curveTo);

        const byVirt = new Map(morphCards.map((c) => [c.virtIdx, c.mesh]));
        for (let i = 0; i < poolSize; i++) {
          const v = formulaVirtIdx(i, sPos);
          const m = byVirt.get(v);
          if (m) cardMeshes[i] = m;
        }

        layoutCards(stateRef.current.scrollPos, mode);

        morphCards.forEach((c) => {
          const shadowMat = c.shadow.material as THREE.MeshBasicMaterial;
          const base = (c.mesh.userData.shadowBaseOpacity as number) ?? PARAMS.shadowBase;
          shadowMat.opacity = base;
          c.shadow.visible = mode === "grid";
        });

        viewMorphing = false;
      });
    }

    switchViewRef.current = switchView;

    function openProject(mesh: THREE.Mesh, data: Project) {
      if (transitioningRef.current || viewMorphing) return;
      transitioningRef.current = true;
      setTransitioning(true);

      transition.active = true;
      transition.scroll = stateRef.current.scrollPos;
      transition.virtIdx = (mesh.userData.virtIdx as number) ?? 0;
      transition.projectId = data.id;
      transition.viewMode = viewModeRef.current;

      gsap.to(".vignette", { opacity: 0, duration: 0.15, ease: "power1.out", overwrite: true });

      // Congelar escala de hover para que el morph parta del tamaño real de la tarjeta
      gsap.killTweensOf(mesh.scale);
      mesh.scale.set(1, 1, 1);
      gsap.killTweensOf(mesh.userData.limeMat);
      (mesh.userData.limeMat as THREE.MeshBasicMaterial).opacity = 0;

      const curved = viewModeRef.current === "spiral";
      const { mesh: hero, setCurvature, setRadius } = createHero(
        (mesh.material as THREE.MeshBasicMaterial).map,
        curved
      );
      setCurvature(curved ? 1 : 0);

      mesh.updateWorldMatrix(true, false);
      const startPos = new THREE.Vector3();
      const startQuat = new THREE.Quaternion();
      const startScale = new THREE.Vector3();
      mesh.matrixWorld.decompose(startPos, startQuat, startScale);
      // Normalizar por si el grupo o el mundo aportan escala no uniforme
      const base = Math.max(startScale.x, startScale.y, startScale.z);
      startScale.set(base, base, base);
      hero.position.copy(startPos);
      hero.quaternion.copy(startQuat);
      hero.scale.copy(startScale);
      scene.add(hero);
      mesh.visible = false;
      setShadowFade(mesh, 0);

      const endPos = new THREE.Vector3(0, 0, camera.position.z - HERO_DIST);
      const endQuat = new THREE.Quaternion();
      const s = heroFullscreenScale(HERO_DIST);
      const endScale = new THREE.Vector3(s, s, s);

      const focalIdx = mesh.userData.virtIdx as number;
      const flyData = cardMeshes
        .filter((m) => m !== mesh)
        .map((m) => {
          const shadow = m.userData.shadow as THREE.Mesh;
          const dir = (m.userData.virtIdx as number) < focalIdx ? -1 : 1;
          return {
            mesh: m,
            shadow,
            baseY: m.position.y,
            shadowBaseY: shadow.position.y,
            dir,
            seqDist: Math.abs((m.userData.virtIdx as number) - focalIdx),
            order: 0,
          };
        });
      flyData.sort((a, b) => a.seqDist - b.seqDist);
      flyData.forEach((d, i) => (d.order = i));
      const flyLast = Math.max(1, flyData.length - 1);

      const proxy = { t: 0 };
      gsap.to(proxy, {
        t: 1,
        duration: 0.9,
        ease: "power3.inOut",
        onUpdate: () => {
          hero.position.lerpVectors(startPos, endPos, proxy.t);
          hero.quaternion.slerpQuaternions(startQuat, endQuat, proxy.t);
          hero.scale.lerpVectors(startScale, endScale, proxy.t);
          if (curved) setCurvature(1 - proxy.t);
          setRadius(CARD_CORNER_RADIUS * (1 - proxy.t));
          const gs = 1 - (1 - GROUP_ZOOMOUT) * proxy.t;
          cardsGroup.scale.set(gs, gs, gs);
          const fly = Math.min(1, proxy.t * PARAMS.exitSpeed);
          const stag = PARAMS.exitStagger;
          const span = Math.max(0.001, 1 - stag);
          flyData.forEach(({ mesh, shadow, baseY, shadowBaseY, dir, order }) => {
            const delay = (order / flyLast) * stag;
            const p = Math.min(1, Math.max(0, (fly - delay) / span));
            const dy = dir * PARAMS.exitDist * p;
            mesh.position.y = baseY + dy;
            shadow.position.y = shadowBaseY + dy;
          });
        },
        onComplete: () => {
          const go = () => routerRef.current.push(`/proyecto/${data.id}`);
          const pre = new Image();
          pre.crossOrigin = "anonymous";
          pre.src = coverUrl(data.id);
          if (pre.decode) pre.decode().then(go).catch(go);
          else go();
        },
      });
    }

    function startReverse() {
      const saved = {
        scroll: transition.scroll,
        virtIdx: transition.virtIdx,
        projectId: transition.projectId,
        viewMode: transition.viewMode,
      };
      transition.active = false;
      transitioningRef.current = true;
      setTransitioning(true);

      viewModeRef.current = saved.viewMode;
      transition.viewMode = saved.viewMode;
      setViewMode(saved.viewMode);
      setCardCurvature(saved.viewMode === "spiral" ? 1 : 0);
      const camZ = camZFor(saved.viewMode, viewport);
      const { near, far } = fogFor(saved.viewMode, viewport);
      camera.position.z = camZ;
      (scene.fog as THREE.Fog).near = near;
      (scene.fog as THREE.Fog).far = far;

      stateRef.current.scrollPos = saved.scroll;
      stateRef.current.targetScroll = saved.scroll;

      cardsGroup.scale.set(1, 1, 1);
      layoutCards(saved.scroll, saved.viewMode);
      cardsGroup.updateMatrixWorld(true);

      const targetMesh =
        cardMeshes.find((m) => m.userData.virtIdx === saved.virtIdx) ?? null;
      if (!targetMesh) {
        transitioningRef.current = false;
        setTransitioning(false);
        setReverseBg(null);
        document.body.style.background = "#000";
        return;
      }

      targetMesh.updateWorldMatrix(true, false);
      const targetPos = new THREE.Vector3();
      const targetQuat = new THREE.Quaternion();
      const targetScale = new THREE.Vector3();
      targetMesh.matrixWorld.decompose(targetPos, targetQuat, targetScale);

      gsap.set(".vignette", { opacity: 0 });

      cardsGroup.scale.set(GROUP_ZOOMOUT, GROUP_ZOOMOUT, GROUP_ZOOMOUT);
      cardMeshes.forEach((m) => {
        (m.material as THREE.MeshBasicMaterial).transparent = true;
        setCardFade(m, 0);
      });
      targetMesh.visible = false;

      const heroIdx = PROJECTS_DATA.findIndex((p) => p.id === saved.projectId);
      const curved = saved.viewMode === "spiral";

      const beginMorph = () => {
        const { mesh: hero, geo: heroGeo, mat: heroMat, maskTex: heroMaskTex, setCurvature, setRadius } =
          createHero((targetMesh.material as THREE.MeshBasicMaterial).map, curved);
        setCurvature(0);
        setRadius(0);

        const fsPos = new THREE.Vector3(0, 0, camera.position.z - HERO_DIST);
        const idQuat = new THREE.Quaternion();
        const s = heroFullscreenScale(HERO_DIST);
        const fsScale = new THREE.Vector3(s, s, s);
        hero.position.copy(fsPos);
        hero.quaternion.copy(idQuat);
        hero.scale.copy(fsScale);
        scene.add(hero);

        renderer.render(scene, camera);
        requestAnimationFrame(() => {
          setReverseBg(null);
          document.body.style.background = "#000";
        });

        cardMeshes.forEach((m) => {
          if (m !== targetMesh) {
            (m.material as THREE.MeshBasicMaterial).opacity = 1;
            setShadowFade(m, 1);
          }
        });

        const focalIdx = targetMesh.userData.virtIdx as number;
        const flyData = cardMeshes
          .filter((m) => m !== targetMesh)
          .map((m) => {
            const shadow = m.userData.shadow as THREE.Mesh;
            const dir = (m.userData.virtIdx as number) < focalIdx ? -1 : 1;
            return {
              mesh: m,
              shadow,
              baseY: m.position.y,
              shadowBaseY: shadow.position.y,
              dir,
              seqDist: Math.abs((m.userData.virtIdx as number) - focalIdx),
              order: 0,
            };
          });
        flyData.sort((a, b) => a.seqDist - b.seqDist);
        flyData.forEach((d, i) => (d.order = i));
        const flyLast = Math.max(1, flyData.length - 1);

        const proxy = { t: 0 };
        gsap.to(proxy, {
          t: 1,
          duration: PARAMS.closeDuration,
          ease: "power3.inOut",
          onUpdate: () => {
            hero.position.lerpVectors(fsPos, targetPos, proxy.t);
            hero.quaternion.slerpQuaternions(idQuat, targetQuat, proxy.t);
            hero.scale.lerpVectors(fsScale, targetScale, proxy.t);
            if (curved) setCurvature(proxy.t);
            setRadius(CARD_CORNER_RADIUS * proxy.t);
            const gs = GROUP_ZOOMOUT + (1 - GROUP_ZOOMOUT) * proxy.t;
            cardsGroup.scale.set(gs, gs, gs);
            const stag = PARAMS.exitStagger;
            const d0 = PARAMS.enterDelay;
            const usable = Math.max(0.001, 1 - d0);
            const span = Math.max(0.001, usable * (1 - stag));
            flyData.forEach(({ mesh, shadow, baseY, shadowBaseY, dir, order }) => {
              const delay = d0 + (order / flyLast) * usable * stag;
              const p = Math.min(1, Math.max(0, (proxy.t - delay) / span));
              const dy = dir * PARAMS.exitDist * (1 - p);
              mesh.position.y = baseY + dy;
              shadow.position.y = shadowBaseY + dy;
            });
            setShadowFade(targetMesh, proxy.t);
            gsap.set(".vignette", { opacity: proxy.t });
          },
          onComplete: () => {
            targetMesh.visible = true;
            scene.remove(hero);
            heroGeo.dispose();
            heroMat.dispose();
            heroMaskTex.dispose();
            cardMeshes.forEach((m) => {
              (m.material as THREE.MeshBasicMaterial).transparent = false;
              setCardFade(m, 1);
            });
            cardsGroup.scale.set(1, 1, 1);
            transitioningRef.current = false;
            setTransitioning(false);
          },
        });
      };

      const waitForTexture = () => {
        if (heroIdx < 0 || textureReady[heroIdx]) {
          beginMorph();
        } else {
          requestAnimationFrame(waitForTexture);
        }
      };
      waitForTexture();
    }

    const CLICK_THRESHOLD = 6;
    let downX = 0;
    let downY = 0;

    const isNavUIEventTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      // Importante: el componente de la espiral escucha eventos a nivel `window`,
      // así que al clicar en el menú también podría disparar `openProject()`.
      // Para evitarlo, ignoramos interacciones que vengan del propio `SiteNav`.
      return !!target.closest(
        ".site-nav-bar, #nav-services-submenu, .nav-submenu, .nav-services-overlay, .view-toggle"
      );
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (viewMorphing || transitioningRef.current) return;
      stateRef.current.targetScroll += e.deltaY * PARAMS.sensitivity;
    };

    const handleMouseDown = (e: MouseEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.prevX = e.clientX;
      stateRef.current.prevY = e.clientY;
      downX = e.clientX;
      downY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      if (!stateRef.current.isDragging) return;
      const deltaY = e.clientY - stateRef.current.prevY;
      const deltaX = e.clientX - stateRef.current.prevX;
      stateRef.current.targetScroll -= (deltaY - deltaX * 0.3) * 0.005;
      stateRef.current.prevX = e.clientX;
      stateRef.current.prevY = e.clientY;
    };

    const handleMouseUp = (e: MouseEvent) => {
      stateRef.current.isDragging = false;
      if (isNavUIEventTarget(e.target)) return;
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < CLICK_THRESHOLD && !transitioningRef.current && !viewMorphing && currentHoveredMesh) {
        const data = currentHoveredMesh.userData.data as Project | null;
        if (data) openProject(currentHoveredMesh, data);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        stateRef.current.isDragging = true;
        stateRef.current.prevX = e.touches[0].clientX;
        stateRef.current.prevY = e.touches[0].clientY;
        downX = e.touches[0].clientX;
        downY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!stateRef.current.isDragging || e.touches.length !== 1) return;
      const deltaY = e.touches[0].clientY - stateRef.current.prevY;
      const deltaX = e.touches[0].clientX - stateRef.current.prevX;
      stateRef.current.targetScroll -= (deltaY - deltaX * 0.3) * 0.005;
      stateRef.current.prevX = e.touches[0].clientX;
      stateRef.current.prevY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      stateRef.current.isDragging = false;
      if (isNavUIEventTarget(e.target)) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const moved = Math.hypot(t.clientX - downX, t.clientY - downY);
      mouse.x = (t.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(t.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(cardMeshes)[0]?.object as THREE.Mesh | undefined;
      if (moved < CLICK_THRESHOLD && !transitioningRef.current && !viewMorphing && hit) {
        const data = hit.userData.data as Project | null;
        if (data) openProject(hit, data);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-1000, -1000);
    let currentHoveredMesh: THREE.Mesh | null = null;
    let lastHoveredId: number | null = null;

    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (transitioningRef.current || viewMorphing) {
        renderer.render(scene, camera);
        return;
      }

      if (!stateRef.current.isDragging) {
        stateRef.current.targetScroll += PARAMS.autoScrollSpeed * introRef.current.speedBoost;
      }

      stateRef.current.scrollPos += (stateRef.current.targetScroll - stateRef.current.scrollPos) * 0.08;
      layoutCards(stateRef.current.scrollPos);

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(cardMeshes);
      const targetMesh = intersects.length > 0 ? (intersects[0].object as THREE.Mesh) : null;

      if (currentHoveredMesh !== targetMesh) {
        if (currentHoveredMesh) {
          gsap.to(currentHoveredMesh.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: "power2.out", overwrite: true });
          currentHoveredMesh.userData.shadowBaseOpacity = PARAMS.shadowBase;
          gsap.to(currentHoveredMesh.userData.shadowMat, {
            opacity: PARAMS.shadowBase,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
          gsap.to(currentHoveredMesh.userData.limeMat, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
        }
        currentHoveredMesh = targetMesh;
        if (currentHoveredMesh) {
          gsap.to(currentHoveredMesh.scale, { x: 1.06, y: 1.06, z: 1.06, duration: 0.4, ease: "power2.out", overwrite: true });
          currentHoveredMesh.userData.shadowBaseOpacity = PARAMS.shadowHover;
          gsap.to(currentHoveredMesh.userData.shadowMat, {
            opacity: PARAMS.shadowHover,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
          const hoverData = currentHoveredMesh.userData.data as Project | null;
          gsap.to(currentHoveredMesh.userData.limeMat, {
            opacity: hoverData?.featured ? 0 : PARAMS.limeHover,
            duration: 0.4,
            ease: "power2.out",
            overwrite: true,
          });
          const data = currentHoveredMesh.userData.data as Project | null;
          if (data && data.id !== lastHoveredId) {
            lastHoveredId = data.id;
            setHoveredProject(data);
            routerRef.current.prefetch(`/proyecto/${data.id}`);
          }
        } else {
          lastHoveredId = null;
          setHoveredProject(null);
        }
      }

      renderer.render(scene, camera);
    };

    const featuredIndex = PROJECTS_DATA.findIndex((p) => p.featured);
    const initialScroll = featuredIndex >= 0 ? featuredIndex : 0;
    if (!transition.active) {
      stateRef.current.scrollPos = initialScroll;
      stateRef.current.targetScroll = initialScroll;
    }

    layoutCards(transition.active ? transition.scroll : initialScroll, initialMode);

    function playSpiralIntro() {
      // Entrada: desde abajo + giro rápido inicial, luego se asienta al centro.
      introRef.current.yOffset = 14;
      introRef.current.spinOffset = Math.PI * 11.5;
      // Durante la intro, dejamos el auto-scroll base casi neutral para evitar
      // choque de direcciones y que el frenado se sienta "en seco".
      introRef.current.speedBoost = 0;

      const intro = { t: 0 };
      gsap.to(intro, {
        t: 1,
        duration: 2.4,
        ease: "power4.out",
        onUpdate: () => {
          const k = 1 - intro.t;
          // Cola más larga para que el frenado final sea más suave.
          introRef.current.yOffset = 14 * Math.pow(k, 1.35);
          introRef.current.spinOffset = Math.PI * 11.5 * Math.pow(k, 1.45);
          introRef.current.speedBoost = 1 - Math.pow(k, 1.2);
        },
        onComplete: () => {
          introRef.current.yOffset = 0;
          introRef.current.spinOffset = 0;
          introRef.current.speedBoost = 1;
        },
      });
    }

    if (process.env.NODE_ENV !== "production") {
      const spiralPage = pageRef.current;
      const vignette = spiralPage?.querySelector<HTMLElement>(".vignette") ?? null;
      const viewToggle = spiralPage?.querySelector<HTMLElement>(".view-toggle") ?? null;
      const canvas = mountRef.current?.querySelector<HTMLCanvasElement>("canvas") ?? null;
      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const probeBottomRight = document.elementFromPoint(vpW - 24, vpH - 24);
      const probeCenter = document.elementFromPoint(vpW / 2, vpH / 2);
      const payload = {
        transitionActive: transition.active,
        viewMode_initial: initialMode,
        spiralZ_inline: spiralPage?.style.zIndex ?? null,
        spiralZ_computed: spiralPage ? getComputedStyle(spiralPage).zIndex : null,
        spiralDisplay: spiralPage ? getComputedStyle(spiralPage).display : null,
        spiralVisibility: spiralPage ? getComputedStyle(spiralPage).visibility : null,
        spiralOpacity: spiralPage ? getComputedStyle(spiralPage).opacity : null,
        vignette: vignette
          ? {
              opacity_inline: vignette.style.opacity,
              opacity_computed: getComputedStyle(vignette).opacity,
              display: getComputedStyle(vignette).display,
              visibility: getComputedStyle(vignette).visibility,
              z_inline: vignette.style.zIndex,
              z_computed: getComputedStyle(vignette).zIndex,
            }
          : null,
        viewToggle: viewToggle
          ? {
              z_inline: viewToggle.style.zIndex,
              z_computed: getComputedStyle(viewToggle).zIndex,
              opacity: getComputedStyle(viewToggle).opacity,
              display: getComputedStyle(viewToggle).display,
              visibility: getComputedStyle(viewToggle).visibility,
              pointerEvents: getComputedStyle(viewToggle).pointerEvents,
              rect: viewToggle.getBoundingClientRect().toJSON(),
            }
          : null,
        canvas: canvas
          ? {
              canvasZ_computed: getComputedStyle(canvas).zIndex,
              canvasPos: getComputedStyle(canvas).position,
              canvasOpacity: getComputedStyle(canvas).opacity,
            }
          : null,
        probe: {
          bottomRightTag: probeBottomRight?.tagName ?? null,
          bottomRightClass: probeBottomRight?.className ?? null,
          centerTag: probeCenter?.tagName ?? null,
          centerClass: probeCenter?.className ?? null,
        },
      };

      // eslint-disable-next-line no-console
      console.log("[Spiral] mount stack", payload);
      // eslint-disable-next-line no-console
      console.log("[Spiral] mount stack:json", JSON.stringify(payload));
    }

    if (transition.active) {
      startReverse();
    } else {
      document.body.style.background = "#000";
      playSpiralIntro();
    }

    animate();

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      viewport = getViewportTuning(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (!transitioningRef.current && !viewMorphing) {
        const mode = viewModeRef.current;
        camera.position.z = camZFor(mode, viewport);
        const fog = scene.fog as THREE.Fog;
        const { near, far } = fogFor(mode, viewport);
        fog.near = near;
        fog.far = far;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      switchViewRef.current = null;
      coverLoaders.forEach((img) => {
        img.onload = null;
        img.src = "";
      });
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
      gsap.killTweensOf(cardsGroup.scale);
      gsap.killTweensOf(cardsGroup.rotation);
      gsap.killTweensOf(cardsGroup.position);
      gsap.killTweensOf(introRef.current);
      gsap.killTweensOf(camera.position);
      if (scene.fog) gsap.killTweensOf(scene.fog);
      cardMeshes.forEach((m) => {
        gsap.killTweensOf(m.material);
        gsap.killTweensOf(m.scale);
        gsap.killTweensOf(m.position);
        gsap.killTweensOf(m.rotation);
        gsap.killTweensOf(m.userData.shadowMat);
        gsap.killTweensOf(m.userData.limeMat);
        gsap.killTweensOf(m.userData.shadow.position);
        const mat = m.material as THREE.MeshBasicMaterial;
        mat.opacity = 1;
        mat.transparent = false;
        (m.material as THREE.MeshBasicMaterial).dispose();
        (m.userData.shadowMat as THREE.MeshBasicMaterial).dispose();
        (m.userData.limeMat as THREE.MeshBasicMaterial).dispose();
      });
      cachedTextures.forEach((t) => {
        if (t !== placeholderTexture) t.dispose();
      });
      placeholderTexture.dispose();
      roundedAlphaMap.dispose();
      shadowTex.dispose();
      shadowGeometry.dispose();
      cardGeometry.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    playPageEnter(el);
  }, []);

  useEffect(() => {
    const el = hoverLabelRef.current;
    if (!el) return;

    gsap.killTweensOf(el);

    if (transitioning || !hoveredProject) {
      gsap.to(el, {
        opacity: 0,
        y: 8,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => {
          if (!hoveredProjectRef.current || transitioningRef.current) {
            setDisplayProject(null);
            displayProjectRef.current = null;
          }
        },
      });
      return;
    }

    const prev = displayProjectRef.current;

    if (!prev) {
      setDisplayProject(hoveredProject);
      displayProjectRef.current = hoveredProject;
      gsap.fromTo(
        el,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
      return;
    }

    if (prev.id === hoveredProject.id) {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
      return;
    }

    const next = hoveredProject;
    gsap.to(el, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        if (hoveredProjectRef.current?.id !== next.id) return;
        setDisplayProject(next);
        displayProjectRef.current = next;
        gsap.to(el, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" });
      },
    });
  }, [hoveredProject, transitioning]);

  return (
    <div
      ref={pageRef}
      data-page="spiral"
      className="spiral-ui"
      style={{ position: "relative", width: "100vw", height: "100dvh", background: "var(--bg-soft)", overflow: "hidden", zIndex: 35 }}
    >
      {reverseBg && (
        <img
          src={reverseBg}
          crossOrigin="anonymous"
          decoding="sync"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 0,
          }}
        />
      )}
      <div
        ref={mountRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          cursor: hoveredProject ? "pointer" : "grab",
        }}
      />

      <div
        className="vignette"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          opacity: vignetteStart,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 82%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Toggle espiral ↔ grid */}
      {!transitioning && (
        <div
          className="view-toggle"
          style={{
            position: "fixed",
            bottom: "2rem",
            right: "clamp(1.5rem, 5vw, 4.5rem)",
            zIndex: 40,
            pointerEvents: "auto",
          }}
        >
          <button
            type="button"
            className="ui-label"
            aria-pressed={viewMode === "spiral"}
            onClick={() => {
              if (viewMode === "spiral" || transitioning) return;
              setViewMode("spiral");
              switchViewRef.current?.("spiral");
            }}
          >
            Espiral
          </button>
          <button
            type="button"
            className="ui-label"
            aria-pressed={viewMode === "grid"}
            onClick={() => {
              if (viewMode === "grid" || transitioning) return;
              setViewMode("grid");
              switchViewRef.current?.("grid");
            }}
          >
            Grid
          </button>
        </div>
      )}

      <div
        ref={hoverLabelRef}
        style={{
          position: "fixed",
          bottom: "2rem",
          left: 0,
          right: 0,
          padding: "0 clamp(1.5rem, 5vw, 4.5rem)",
          zIndex: 40,
          pointerEvents: "none",
          opacity: 0,
        }}
      >
        <div className="content-width">
          {displayProject && (
            <>
              <p
                className="ui-label"
                style={{ marginBottom: "0.35rem", color: "var(--accent)" }}
              >
                {displayProject.category} · {displayProject.year}
              </p>
              <p className="hover-project-title">{displayProject.title}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
