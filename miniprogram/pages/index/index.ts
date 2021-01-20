// index.ts
import { $requestAnimationFrame as requestAnimationFrame, $window as window, Clock, PerspectiveCamera, PLATFORM, Scene, sRGBEncoding, TextureLoader, WebGL1Renderer } from 'three-platformize'
import { WechatPlatform } from 'three-platformize/src/WechatPlatform'
import { GLTFLoader } from 'three-platformize/examples/jsm/loaders/GLTFLoader'
import { DemoDeps, Demo, DemoGLTFLoader, DemoThreeSpritePlayer, DemoDeviceOrientationControls } from 'three-platformize-demo/src/index'

const DEMO_MAP = {
  GLTFLoader: DemoGLTFLoader,
  ThreeSpritePlayer: DemoThreeSpritePlayer,
  DeviceOrientationControls: DemoDeviceOrientationControls
}

// @ts-ignore
Page({
  disposing: false,
  switchingItem: false,
  deps: {} as DemoDeps,
  currDemo: null as unknown as Demo,

  data: {
    showMenu: true,
    showCanvas: false,
    currItem: -1,
    menuList: [
      'GLTFLoader',
      'ThreeSpritePlayer',
      'DeviceOrientationControls',
      'Raycaster',
      'Geometry'
    ]
  },

  onReady() {
    this.onCanvasReady()
  },

  onCanvasReady() {
    wx.createSelectorQuery().select('#gl').fields({ node: true, size: true }).exec((res) => {
      if (res[0]) this.initCanvas(res[0].node)
    })
  },

  onMenuClick() {
    this.toggleMenu()
  },

  toggleMenu() {
    const showMenu = !this.data.showMenu
    if (showMenu) {
      this.setData({ showMenu, showCanvas: false })
    } else {
      this.setData({ showMenu })
      setTimeout(() => {
        this.setData({ showCanvas: true })
      }, 330)
    }
  },

  async onMenuItemClick(e) {
    if (this.switchingItem) return
    this.switchingItem = true

    const { i, item } = e.currentTarget.dataset;

    const demo = new (DEMO_MAP[item])(this.deps) as Demo;
    await demo.init();

    (this.currDemo as Demo)?.dispose()
    this.currDemo = demo;
    this.setData({ currItem: i })
    this.toggleMenu()
    this.switchingItem = false
  },

  initCanvas(canvas) {
    const platform = new WechatPlatform(canvas);
    platform.enableDeviceOrientation('game')
    PLATFORM.set(platform);

    console.log(window.innerWidth, window.innerHeight)
    console.log(canvas.width, canvas.height)

    const renderer = new WebGL1Renderer({ canvas, antialias: true, alpha: true });
    const camera = new PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const scene = new Scene();
    const clock = new Clock();
    const gltfLoader = new GLTFLoader();
    const textureLoader = new TextureLoader();

    this.deps = { renderer, camera, scene, clock, gltfLoader, textureLoader }

    scene.position.z = -3;
    renderer.outputEncoding = sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);

    const render = () => {
      if (this.disposing) return
      requestAnimationFrame(render);
      (this.currDemo as Demo)?.update()
      renderer.render(scene, camera);
    }

    render()
  },

  onUnload() {
    this.disposing = true;
    (this.currDemo as Demo)?.dispose()
    PLATFORM.dispose()
  }
})
