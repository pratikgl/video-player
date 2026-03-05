"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { videoController } from "@/lib/videoController";

export default function ThreeVideoPlayer() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = 700;
    const height = 400;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000,
    );
    camera.position.z = 1;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);

    mountRef.current.appendChild(renderer.domElement);

    // -------- Background Image --------

    const loader = new THREE.TextureLoader();
    const bgTexture = loader.load("/background.jpg");

    const bgGeometry = new THREE.PlaneGeometry(width, height);
    const bgMaterial = new THREE.MeshBasicMaterial({ map: bgTexture });

    const backgroundMesh = new THREE.Mesh(bgGeometry, bgMaterial);
    scene.add(backgroundMesh);

    // -------- Video Texture --------

    const video = document.createElement("video");
    video.src = "/video.mp4";
    video.crossOrigin = "anonymous";
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";

    videoController.setVideo(video);
    videoController.startLoop();

    const videoTexture = new THREE.VideoTexture(video);

    const videoGeometry = new THREE.PlaneGeometry(500, 280);

    const videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTexture,
    });

    const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);

    scene.add(videoMesh);

    // -------- Render Loop --------

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-[700px] h-[400px] rounded-xl overflow-hidden"
    />
  );
}
