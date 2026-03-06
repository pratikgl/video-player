"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { videoController } from "@/lib/videoController";
import { playerController } from "@/lib/playerController";

const WIDTH = 900;
const HEIGHT = 500;

export default function ThreeVideoPlayer() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    const renderer = createRenderer(container);
    const scene = new THREE.Scene();
    const camera = createCamera();

    const bgMesh = createBackgroundMesh();
    scene.add(bgMesh);

    const { videoMesh, videoMaterial, video } = createVideoMesh();
    scene.add(videoMesh);

    loadMedia(video, bgMesh);
    registerPlayerActions(container, videoMesh, videoMaterial);

    const stopLoop = startRenderLoop(renderer, scene, camera);
    return () => {
      stopLoop();
      renderer.dispose();
      container.replaceChildren();
    };
  }, []);

  return <div ref={mountRef} className="w-[900px] h-[500px] overflow-hidden" />;
}

/* ---------------------------------- */
/* Renderer + Camera                  */
/* ---------------------------------- */

function createRenderer(container: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  container.appendChild(renderer.domElement);
  return renderer;
}

function createCamera() {
  const camera = new THREE.OrthographicCamera(
    WIDTH / -2,
    WIDTH / 2,
    HEIGHT / 2,
    HEIGHT / -2,
    1,
    1000,
  );
  camera.position.z = 1;
  return camera;
}

/* ---------------------------------- */
/* Background                         */
/* ---------------------------------- */

function createBackgroundMesh() {
  const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
  const material = new THREE.MeshBasicMaterial();
  return new THREE.Mesh(geometry, material);
}

/* ---------------------------------- */
/* Video                              */
/* ---------------------------------- */

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Rounded rectangle SDF — discards pixels outside the rounded corners
const fragmentShader = `
  uniform sampler2D map;
  uniform float uRadius;
  uniform vec2  uSize;
  varying vec2 vUv;

  float roundedRectSDF(vec2 p, vec2 halfSize, float r) {
    vec2 q = abs(p) - halfSize + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    if (roundedRectSDF(p, uSize * 0.5, uRadius) > 0.0) discard;
    gl_FragColor = texture2D(map, vUv);
  }
`;

function createVideoMesh() {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.loop = false;
  video.muted = false;
  video.playsInline = true;
  video.preload = "auto";

  const videoMaterial = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: new THREE.VideoTexture(video) },
      uRadius: { value: 0.0 },
      uSize: { value: new THREE.Vector2(WIDTH, HEIGHT) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  const videoMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(WIDTH, HEIGHT),
    videoMaterial,
  );

  return { videoMesh, videoMaterial, video };
}

/* ---------------------------------- */
/* Media Loading                      */
/* ---------------------------------- */

async function loadMedia(video: HTMLVideoElement, bgMesh: THREE.Mesh) {
  const media = await fetch("/api/media").then((r) => r.json());

  new THREE.TextureLoader().load(media.backgroundUrl, (tex) => {
    (bgMesh.material as THREE.MeshBasicMaterial).map = tex;
    (bgMesh.material as THREE.MeshBasicMaterial).needsUpdate = true;
  });

  video.src = media.videoUrl;
  videoController.setVideo(video);
  videoController.startLoop();
}

/* ---------------------------------- */
/* Player Controls                    */
/* ---------------------------------- */

function registerPlayerActions(
  container: HTMLDivElement,
  videoMesh: THREE.Mesh,
  videoMaterial: THREE.ShaderMaterial,
) {
  playerController.register({
    setPadding(percent) {
      const scale = 1 - percent * 0.35;
      videoMesh.scale.set(scale, scale, 1);
      videoMaterial.uniforms.uSize.value.set(WIDTH * scale, HEIGHT * scale);
    },
    setRadius(percent) {
      videoMaterial.uniforms.uRadius.value = percent * 60;
      container.style.borderRadius = `${percent * 60}px`;
    },
  });

  // Apply defaults
  playerController.setPadding(0.3);
  playerController.setRadius(0.3);
}

/* ---------------------------------- */
/* Render Loop                        */
/* ---------------------------------- */

function startRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
) {
  let animId: number;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();
  return () => cancelAnimationFrame(animId);
}
