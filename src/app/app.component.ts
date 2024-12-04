import { Component, ElementRef, ViewChild, HostListener, AfterViewInit } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  title = 'testObiekt3d';

  @ViewChild('rendererContainer') rendererContainer!: ElementRef;

  renderer = new THREE.WebGLRenderer();
  scene: THREE.Scene = null!;
  camera: THREE.PerspectiveCamera = null!;
  mesh: THREE.Object3D | null = null;


  moveDirection = 1;
  speed = 0.004;
  rotateDirection = 1;
  rotationSpeed = 0.0003

  constructor() {
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(0x747474);

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 12;

    let ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    let pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(50, 50, 50);
    this.scene.add(pointLight);

    let loader = new GLTFLoader();
    loader.load(
      'assets/3dObjects/normandysr2.glb',
      (gltf) => {
        this.mesh = gltf.scene;
        this.scene.add(this.mesh);

        let object = gltf.scene;
        this.scene.add(object);

        let distance = 10;
        this.camera.position.x = object.position.x + distance;
        this.camera.lookAt(object.position);
        this.camera.updateProjectionMatrix();

        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material.color.set(0xffffff);
          }
        });
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      },
      (error) => {
        console.log('An error happened');
      }
    );
  }

  ngAfterViewInit() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.animate();
  }

  animate() {
    window.requestAnimationFrame(() => this.animate());

    if (this.mesh) {
      if (this.mesh.position.y > 2) this.moveDirection = -1;
      else if (this.mesh.position.y < -2) this.moveDirection = 1;
      this.mesh.position.y += this.speed * this.moveDirection;

      if (this.mesh.rotation.z > THREE.MathUtils.degToRad(3)) this.rotateDirection = -1;
      else if (this.mesh.rotation.z < -THREE.MathUtils.degToRad(3)) this.rotateDirection = 1;
      this.mesh.rotation.z += this.rotationSpeed * this.rotateDirection;
    }

    this.renderer.render(this.scene, this.camera);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.mesh && event.buttons === 1) {
      this.mesh.rotation.y += event.movementX * 0.01;
    }
  }
  touchStartX = 0;
  @HostListener('document:touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.mesh) {
      let deltaX = event.touches[0].clientX - this.touchStartX;
      this.touchStartX = event.touches[0].clientX;
      this.mesh.rotation.y += deltaX * 0.01;
    }
  }

}
