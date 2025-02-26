import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

// --- Three.js Setup for GLB Animations in the Small Container ---
const container3D = document.getElementById('container3D');
const camera = new THREE.PerspectiveCamera(
  45,
  container3D.clientWidth / container3D.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 13);

const scene = new THREE.Scene();
const bgColorSelect = document.getElementById('backgroundColorSelect');
scene.background = new THREE.Color(bgColorSelect.value);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(container3D.clientWidth, container3D.clientHeight);
container3D.appendChild(renderer.domElement);

bgColorSelect.addEventListener('change', (event) => {
  scene.background = new THREE.Color(event.target.value);
});

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
scene.add(ambientLight);
const topLight = new THREE.DirectionalLight(0xffffff, 1.4);
topLight.position.set(500, 500, 500);
scene.add(topLight);
const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
frontLight.position.set(0, 0, 10);
scene.add(frontLight);

const loader = new GLTFLoader();
let mixer = null;

/**
 * Loads a GLB model from the given path and returns a Promise that resolves
 * after the model's animation has completed. No transitions are used.
 * @param {string} modelPath - Path to the GLB model.
 * @returns {Promise} - Resolves when the animation is complete.
 */
function loadGLBModelAsync(modelPath) {
  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      function (gltf) {
        // Create and configure the new model
        const newModel = gltf.scene;
        newModel.scale.set(8, 8, 8);
        newModel.position.set(0, -10, 0);
        scene.add(newModel);

        // Set up animation mixer for the new model
        const localMixer = new THREE.AnimationMixer(newModel);
        mixer = localMixer;
        let clipDuration = 2; // Default duration in seconds
        if (gltf.animations && gltf.animations.length > 0) {
          const action = localMixer.clipAction(gltf.animations[0]);
          action.play();
          if (gltf.animations[0].duration) {
            clipDuration = gltf.animations[0].duration;
          }
        }

        // After the animation finishes, remove the model
        setTimeout(() => {
          scene.remove(newModel);
          resolve();
        }, clipDuration * 1000);
      },
      undefined,
      function (error) {
        console.error('Error loading GLB model:', error);
        reject(error);
      }
    );
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  if (mixer) mixer.update(0.02);
}
animate();

window.addEventListener('resize', () => {
  renderer.setSize(container3D.clientWidth, container3D.clientHeight);
  camera.aspect = container3D.clientWidth / container3D.clientHeight;
  camera.updateProjectionMatrix();
});

// --- Video Upload and Transcription Handling ---
let segments = [];
let currentSegmentIndex = -1;
let currentActiveSegmentId = null;
const videoPlayer = document.getElementById('videoPlayer');
videoPlayer.playbackRate = 1;

document.getElementById('uploadVideo').addEventListener('click', async () => {
  const fileInput = document.getElementById('videoFile');
  if (fileInput.files.length === 0) {
    alert("Please select a video file.");
    return;
  }

  // --- RESET any old video data and segments to avoid overlap ---
  videoPlayer.pause();
  videoPlayer.currentTime = 0;
  videoPlayer.src = '';
  currentSegmentIndex = -1;
  currentActiveSegmentId = null;
  segments = [];

  // Now load and play the new file
  const file = fileInput.files[0];
  const videoURL = URL.createObjectURL(file);
  videoPlayer.src = videoURL;
  videoPlayer.load();
  videoPlayer.play().catch(err => {
    console.error("Video playback failed:", err);
  });

  // Send the new video for transcription
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8001/transcribe', {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    segments = data.segments || [];
    document.getElementById('subtitles').innerText = "";
  } catch (err) {
    console.error('Error uploading video:', err);
  }
});

// Monitor video time and update subtitles and GLB animations based on the current segment
videoPlayer.addEventListener('timeupdate', () => {
  const currentTime = videoPlayer.currentTime;
  const newIndex = segments.findIndex(seg => currentTime >= seg.start && currentTime <= seg.end);
  if (newIndex !== -1 && newIndex !== currentSegmentIndex) {
    currentSegmentIndex = newIndex;
    const segment = segments[newIndex];
    document.getElementById('subtitles').innerText = segment.text;
    playGLBSequence(segment);
  }
});

/**
 * Plays the sequence of GLB animations for the given segment sequentially,
 * without transitions. The video is slowed during the entire sequence and
 * restored after the sequence finishes. If a new segment is activated,
 * the current sequence is aborted.
 * @param {Object} segment - The segment object containing glb_sequence.
 */
async function playGLBSequence(segment) {
  currentActiveSegmentId = segment.start;
  const sequence = segment.glb_sequence;
  const slowRate = 0.5; // Adjust as needed
  videoPlayer.playbackRate = slowRate;

  for (const modelPath of sequence) {
    // If a new segment is activated, abort this sequence
    if (currentActiveSegmentId !== segment.start) break;
    await loadGLBModelAsync(modelPath);
  }

  videoPlayer.playbackRate = 1;
}
