import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationMixer } from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
});

if (window.innerWidth < 768) {
  camera.position.setZ(40);
  camera.position.setX(0);
}


renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);
camera.position.setX(-3);

renderer.render(scene, camera);

const textureLoader = new THREE.TextureLoader();
textureLoader.load('/outerspace.jpg', function (texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  scene.background = texture;
});


const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);


const starTexture = new THREE.TextureLoader().load('/star.png');

function addStar() {
  const geometry = new THREE.PlaneGeometry(1, 1);
  const material = new THREE.MeshBasicMaterial({
    map: starTexture,
    transparent: true,
    side: THREE.DoubleSide
  });

  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(150));

  star.position.set(x, y, z);
  scene.add(star);
}
Array(1000).fill().forEach(addStar);

function addBackgroundStar() {
  const material = new THREE.SpriteMaterial({
    map: starTexture,
    transparent: true,
  });

  const backgroundStar = new THREE.Sprite(material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(150));

  backgroundStar.position.set(x, y, z);
  scene.add(backgroundStar);
}

Array(500).fill().forEach(addBackgroundStar);


const loader = new GLTFLoader();
let mixer;

let astronaut;
loader.load('/models/astronaut.glb', function (gltf) {
  astronaut = gltf.scene;
  astronaut.scale.set(2, 2, 2);
  astronaut.position.set(0.5, -5, -7); 
  scene.add(astronaut);

  if (gltf.animations.length > 0) {
    mixer = new AnimationMixer(astronaut);
    const action = mixer.clipAction(gltf.animations[0]);
    action.play();
  }
});


const earthTexture = new THREE.TextureLoader().load('/nightearth.jpeg');
const moonTexture = new THREE.TextureLoader().load('/moon.jpg');
const sunTexture = new THREE.TextureLoader().load('/sun.jpeg');

const planetTwo = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: sunTexture,
  })
);
planetTwo.position.z = -17;
planetTwo.position.setY(3.5);
planetTwo.position.setX(-13);
scene.add(planetTwo);

const planet = new THREE.Mesh(
  new THREE.SphereGeometry(4, 32, 32),
  new THREE.MeshStandardMaterial({
    map: earthTexture,
  })
);
planet.position.z = 20;
planet.position.y = 5;
planet.position.setX(-10);
scene.add(planet);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(3, 32, 32),
  new THREE.MeshStandardMaterial({
    map: moonTexture,
  })
);
moon.position.z = 40;
moon.position.y = 10;
moon.position.setX(-40);
scene.add(moon);


function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  planet.rotation.y += 0.02;
  planet.position.y = t * 0.00001;
  planet.position.x = t * 0.003;

  if(astronaut) {
    astronaut.position.x = t * -0.008;
  }
  planetTwo.rotation.y += 0.02;
  planetTwo.position.x = t * -0.008;

  moon.rotation.y += 0.01;
  moon.position.x = t * 0.01;
  moon.position.z = t * -0.0001;

  camera.position.z = t * -0.008;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();


function animate() {
  requestAnimationFrame(animate);
  planet.rotation.y += 0.002;
  planetTwo.rotation.y += 0.003;
  planetTwo.rotation.x += 0.003;
  moon.rotation.y += 0.002;

  document.addEventListener("DOMContentLoaded", () => {
    function scrambleText(element, delay = 20, duration = 900, callback) {
      const originalText = element.dataset.text;
      const chars = "!@#$%^&*_+-<>?/|~";
      let scrambled = originalText.split("").map((char) => (char === " " ? " " : chars[Math.floor(Math.random() * chars.length)]));
      element.textContent = scrambled.join("");
    
      let iteration = 0;
      const interval = setInterval(() => {
        scrambled = scrambled.map((char, index) => {
          if (Math.random() < (iteration / originalText.length) * 2) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        });
  
        element.textContent = scrambled.join("");
  
        iteration++;
        if (iteration >= originalText.length * 2) {
          clearInterval(interval);
          element.textContent = originalText;
          if (callback) callback();
        }
      }, delay);
    }
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          scrambleText(el, 40, 900);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.2 });
  
    document.querySelectorAll(".scramble-scroll").forEach((el) => observer.observe(el));
    const elements = document.querySelectorAll(".scramble");
  
    elements.forEach((el, index) => {
      if (index > 0) el.style.opacity = "0";
    });
  
    if (elements.length > 0) {
      scrambleText(elements[0], 20, 900, () => {
        if (elements.length > 1) {
          elements[1].style.opacity = "1";
          scrambleText(elements[1], 20, 900, () => {
            if (elements.length > 2) {
              elements[2].style.opacity = "1";
              scrambleText(elements[2], 20, 900);
            }
          });
        }
      });
    }
  });
  

  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}

const clock = new THREE.Clock();
animate();