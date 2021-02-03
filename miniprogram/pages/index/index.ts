// index.ts
import { $requestAnimationFrame as requestAnimationFrame, $window as window, Clock, PerspectiveCamera, PLATFORM, Scene, sRGBEncoding, TextureLoader, WebGL1Renderer } from 'three-platformize'
import { WechatPlatform } from 'three-platformize/src/WechatPlatform'
import { GLTFLoader } from 'three-platformize/examples/jsm/loaders/GLTFLoader'
import { DemoDeps, Demo, DemoGLTFLoader, DemoThreeSpritePlayer, DemoDeviceOrientationControls, DemoRGBELoader, DemoSVGLoader, DemoOBJLoader, DemoMeshOpt, DemoEXRLoader, DemoHDRPrefilterTexture, DemoMTLLoader, DemoLWOLoader, DemoFBXLoader } from 'three-platformize-demo/src/index'

const DEMO_MAP = {
  // BasisLoader: DemoBasisLoader,
  MeshOpt: DemoMeshOpt,
  FBXLoader: DemoFBXLoader,
  LWOLoader: DemoLWOLoader,
  MTLLoader: DemoMTLLoader,
  EXRLoader: DemoEXRLoader,
  OBJLoader: DemoOBJLoader,
  SVGLoader: DemoSVGLoader,
  RGBELoader: DemoRGBELoader,
  GLTFLoader: DemoGLTFLoader,
  ThreeSpritePlayer: DemoThreeSpritePlayer,
  HDRPrefilterTexture: DemoHDRPrefilterTexture,
  DeviceOrientationControls: DemoDeviceOrientationControls
}

// @ts-ignore
Page({
  disposing: false,
  switchingItem: false,
  deps: {} as DemoDeps,
  currDemo: null as unknown as Demo,
  platform: null as unknown as WechatPlatform,

  data: {
    showMenu: true,
    showCanvas: false,
    currItem: -1,
    menuList: [
      'GLTFLoader',
      'ThreeSpritePlayer',
      'DeviceOrientationControls',
      'RGBELoader',
      'SVGLoader',
      'OBJLoader',
      'MeshOpt',
      'EXRLoader',
      'HDRPrefilterTexture',
      'MTLLoader',
      'LWOLoader',
      'FBXLoader',
      'BasisLoader(TODO)',
      'Raycaster(TODO)',
      'Geometry(TODO)',
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

  initCanvas(canvas) {
    const platform = new WechatPlatform(canvas);
    this.platform = platform;
    platform.enableDeviceOrientation('game');
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

  onMenuClick() {
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
    const { i, item } = e.currentTarget.dataset;

    if (this.switchingItem || !DEMO_MAP[item]) return

    (this.currDemo as Demo)?.dispose();
    this.switchingItem = true;
    this.currDemo = null as unknown as Demo;

    const demo = new (DEMO_MAP[item])(this.deps) as Demo;
    await demo.init();
    this.currDemo = demo;
    this.setData({ currItem: i })
    this.onMenuClick()
    this.switchingItem = false
  },

  onTS(e) {
    this.platform.dispatchTouchEvent(e);
  },

  onTM(e) {
    this.platform.dispatchTouchEvent(e);
  },

  onTE(e) {
    this.platform.dispatchTouchEvent(e);
  },

  onUnload() {
    this.disposing = true;
    (this.currDemo as Demo)?.dispose()
    PLATFORM.dispose()
  }
})
