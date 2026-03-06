"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { videoController } from "@/lib/videoController";

const WIDTH = 700;
const HEIGHT = 400;

export default function ThreeVideoPlayer() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    initPlayer(mountRef.current);

    return () => {
      mountRef.current?.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-[700px] h-[400px] rounded-xl overflow-hidden"
    />
  );
}

/* ----------------------------- */
/* Player Initialization */
/* ----------------------------- */

async function initPlayer(container: HTMLDivElement) {
  const media = await fetch("/api/media").then((r) => r.json());

  const scene = new THREE.Scene();
  const camera = createCamera();
  const renderer = createRenderer(container);

  const background = createBackground(media.backgroundUrl);
  scene.add(background);

  const videoMesh = createVideoMesh(media.videoUrl);
  scene.add(videoMesh);

  startRenderLoop(renderer, scene, camera);
}

/* ----------------------------- */
/* Scene Helpers */
/* ----------------------------- */

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

function createRenderer(container: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(WIDTH, HEIGHT);

  container.appendChild(renderer.domElement);

  return renderer;
}

/* ----------------------------- */
/* Background */
/* ----------------------------- */

function createBackground(backgroundUrl: string) {
  const loader = new THREE.TextureLoader();
  const texture = loader.load(backgroundUrl);

  const geometry = new THREE.PlaneGeometry(WIDTH, HEIGHT);
  const material = new THREE.MeshBasicMaterial({ map: texture });

  return new THREE.Mesh(geometry, material);
}

/* ----------------------------- */
/* Video */
/* ----------------------------- */

function createVideoMesh(videoUrl: string) {
  const video = document.createElement("video");

  video.src = videoUrl;
  video.crossOrigin = "anonymous";
  video.loop = false;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";

  videoController.setVideo(video);
  videoController.startLoop();

  const texture = new THREE.VideoTexture(video);

  const geometry = new THREE.PlaneGeometry(500, 280);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });

  return new THREE.Mesh(geometry, material);
}

/* ----------------------------- */
/* Render Loop */
/* ----------------------------- */

function startRenderLoop(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
) {
  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  animate();
}
