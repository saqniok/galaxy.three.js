import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loader texture
 */

const textureLoader = new THREE.TextureLoader();
const particlesTexture = textureLoader.load('texture/5.png');
/**
 * Galaxy
 */
let galaxy = new THREE.Group();
const galaxyParametrs = {};
galaxyParametrs.count = 30000;
galaxyParametrs.size = 0.02;
galaxyParametrs.radius = 2;
galaxyParametrs.branches = 5;
galaxyParametrs.spin = 1;
galaxyParametrs.randomnes = 1.5;
galaxyParametrs.randomPower = 5;
galaxyParametrs.insideColor = '#bbff00';
galaxyParametrs.outsideColor = '#4f4ff3';

let geometry = null;
let material = null;
let points = null;

const galaxyGenerate = () => 
{
    galaxy.clear();
    if(points !== null) 
    {
        geometry.dispose();
        material.dispose();
        scene.remove(points);
    }

    // Geometry
    geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(galaxyParametrs.count * 3);
    const colors = new Float32Array(galaxyParametrs.count * 3);

    const colorInside = new THREE.Color(galaxyParametrs.insideColor);
    const colorOutside = new THREE.Color(galaxyParametrs.outsideColor);


    for(let i = 0; i < galaxyParametrs.count * 3; i++) 
    {
        const i3 = i * 3;
        // Positions
        const radius = Math.random() * galaxyParametrs.radius;
        const spingAngle = radius * galaxyParametrs.spin * galaxyParametrs.branches;
        const branchAngle = ((i % galaxyParametrs.branches) / galaxyParametrs.branches) * (Math.PI * 2);
        const randomX = Math.pow(Math.random(), galaxyParametrs.randomPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParametrs.randomnes;
        const randomY = Math.pow(Math.random(), galaxyParametrs.randomPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParametrs.randomnes;
        const randomZ = Math.pow(Math.random(), galaxyParametrs.randomPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParametrs.randomnes;

        positions[i3] = Math.cos(branchAngle + spingAngle) * radius + randomX;
        positions[i3 + 1] = (Math.cos(branchAngle + spingAngle) * radius) - 1 + randomY;
        positions[i3 + 2] = Math.sin(branchAngle + spingAngle) * radius + randomZ;

        // Colors
        const mixedColor = colorInside.clone();
        mixedColor.lerp(colorOutside, radius / galaxyParametrs.radius)

        colors[i3] = mixedColor.r;
        colors[i3 + 1] = Math.random();
        colors[i3 + 2] = mixedColor.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material
    material = new THREE.PointsMaterial({
        sizeAttenuation: true,
        alphaMap: particlesTexture,
        transparent: true,
        size: galaxyParametrs.size,
        depthTest: false,
        // depthWrith: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    // Points
    points = new THREE.Points(geometry, material);
    galaxy.add(points);
}
galaxyGenerate();
gui.add(galaxyParametrs, 'count').min(100).max(100000).step(100).onFinishChange(galaxyGenerate);
gui.add(galaxyParametrs, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(galaxyGenerate);
gui.add(galaxyParametrs, 'radius').min(0.1).max(20).step(0.1).onFinishChange(galaxyGenerate);
gui.add(galaxyParametrs, 'branches').min(1).max(20).step(1).onFinishChange(galaxyGenerate);
gui.add(galaxyParametrs, 'spin').min(-5).max(5).step(0.01).onFinishChange(galaxyGenerate);
gui.add(galaxyParametrs, 'randomnes').min(0).max(2).step(0.01).onFinishChange(galaxyGenerate);
gui.add(galaxyParametrs, 'randomPower').min(1).max(10).step(0.001).onFinishChange(galaxyGenerate);
gui.addColor(galaxyParametrs, 'insideColor').onFinishChange(galaxyGenerate);
gui.addColor(galaxyParametrs, 'outsideColor').onFinishChange(galaxyGenerate);


// const galaxyMaterial = new THREE.PointsMaterial();
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

scene.add(galaxy);

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    //Update Galaxy
    
    if(galaxy) {
        galaxy.rotation.x = Math.cos(elapsedTime * 0.1);
        galaxy.rotation.y = Math.cos(elapsedTime * 0.1) - 1;
        galaxy.position.z = Math.sin(elapsedTime * 0.1);
    }

    

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()