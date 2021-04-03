'use strict';

var threePlatformize = require('./chunk-three-platformize.js');
var screenshot = require('./chunk-screenshot.js');

function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// index.ts

const DEMO_MAP = {
  // BasisLoader: DemoBasisLoader,
  MemoryTest: screenshot.DemoMemoryTest,

  MeshOpt: screenshot.DemoMeshOpt,
  TGALoader: screenshot.DemoTGALoader,
  PDBLoader: screenshot.DemoPDBLoader,
  STLLoader: screenshot.DemoSTLLoader,
  TTFLoader: screenshot.DemoTTFLoader,
  BVHLoader: screenshot.DemoBVHLoader,
  FBXLoader: screenshot.DemoFBXLoader,
  LWOLoader: screenshot.DemoLWOLoader,
  MTLLoader: screenshot.DemoMTLLoader,
  EXRLoader: screenshot.DemoEXRLoader,
  OBJLoader: screenshot.DemoOBJLoader,
  SVGLoader: screenshot.DemoSVGLoader,
  RGBELoader: screenshot.DemoRGBELoader,
  GLTFLoader: screenshot.DemoGLTFLoader,
  ColladaLoader: screenshot.DemoColladaLoader,
  MeshQuantization: screenshot.DemoMeshQuantization,
  ThreeSpritePlayer: screenshot.DemoThreeSpritePlayer,
  HDRPrefilterTexture: screenshot.DemoHDRPrefilterTexture,
  DeviceOrientationControls: screenshot.DemoDeviceOrientationControls
};

const getNode = (id) => new Promise(r => wx.createSelectorQuery().select(id).fields({ node: true, size: true }).exec(r));

// @ts-ignore
Page({
  disposing: false,
  switchingItem: false,
  deps: {} ,
  currDemo: null ,
  platform: null ,
  helperCanvas: null ,

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
      'BVHLoader',
      'ColladaLoader',
      'MeshQuantization',
      'TTFLoader',
      'STLLoader',
      'PDBLoader',
      'TGALoader',
      'MemoryTest',
      // 'BasisLoader(TODO)',
      // 'Raycaster(TODO)',
      // 'Geometry(TODO)',
    ]
  },

  onReady() {
    this.onCanvasReady();
  },

  onCanvasReady() {
    console.log('onCanvasReady');
    Promise.all([
      getNode('#gl'),
      getNode('#canvas'),
    ]).then(([glRes, canvasRes]) => {
      // @ts-ignore
      this.initCanvas(glRes[0].node, canvasRes[0].node);
    });
  },

  initCanvas(canvas, helperCanvas) {
    const platform = new screenshot.WechatPlatform(canvas);
    this.platform = platform;
    platform.enableDeviceOrientation('game');
    threePlatformize.PLATFORM.set(platform);

    console.log(threePlatformize.$window.innerWidth, threePlatformize.$window.innerHeight);
    console.log(canvas.width, canvas.height);

    const renderer = new threePlatformize.WebGL1Renderer({ canvas, antialias: true, alpha: true });
    const camera = new threePlatformize.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
    const scene = new threePlatformize.Scene();
    const clock = new threePlatformize.Clock();
    const gltfLoader = new screenshot.GLTFLoader();
    const textureLoader = new threePlatformize.TextureLoader();

    this.deps = { renderer, camera, scene, clock, gltfLoader, textureLoader };
    this.helperCanvas = helperCanvas;

    scene.position.z = -3;
    renderer.outputEncoding = threePlatformize.sRGBEncoding;
    renderer.setSize(canvas.width, canvas.height);
    renderer.setPixelRatio(threePlatformize.$window.devicePixelRatio);

    const render = () => {
      if (this.disposing) return
      threePlatformize.$requestAnimationFrame(render);
      _optionalChain([(this.currDemo ), 'optionalAccess', _ => _.update, 'call', _2 => _2()]);
      renderer.render(scene, camera);
    };

    render();
    console.log('canvas inited');
  },

  onMenuClick() {
    const showMenu = !this.data.showMenu;
    if (showMenu) {
      this.setData({ showMenu, showCanvas: false });
    } else {
      this.setData({ showMenu });
      setTimeout(() => {
        this.setData({ showCanvas: true });
      }, 330);
    }
  },

  async onMenuItemClick(e) {
    const { i, item } = e.currentTarget.dataset;
    wx.showLoading({ mask: false, title: '加载中' });
    if (this.switchingItem || !DEMO_MAP[item]) return

    _optionalChain([(this.currDemo ), 'optionalAccess', _3 => _3.dispose, 'call', _4 => _4()]);
    this.switchingItem = true;
    this.currDemo = null ;

    const demo = new (DEMO_MAP[item])(this.deps) ;
    await demo.init();
    this.currDemo = demo;
    this.setData({ currItem: i });
    this.onMenuClick();
    this.switchingItem = false;
    wx.hideLoading();
  },

  onTX(e) {
    this.platform.dispatchTouchEvent(e);
    this.platform.dispatchTouchEvent(e);
  },

  screenshot() {
    const { renderer, scene, camera } = this.deps;
    const [data, w, h] = screenshot.screenshot(renderer, scene, camera, threePlatformize.WebGLRenderTarget);
    const ctx = this.helperCanvas.getContext('2d');
    const imgData = this.helperCanvas.createImageData(data, w, h);
    this.helperCanvas.height = imgData.height;
    this.helperCanvas.width = imgData.width;
    ctx.putImageData(imgData, 0, 0);
    const imgDataFromCanvas = ctx.getImageData(0, 0, w, h);
    const hasPixel = imgDataFromCanvas.data.some(i => i !== 0);
    console.log('hasPixel', hasPixel);
    wx.canvasToTempFilePath({
      // @ts-ignore
      canvas: this.helperCanvas,
      success(res) {
        wx.previewImage({
          urls: [res.tempFilePath],
        });
      }
    });
  },

  onUnload() {
    this.disposing = true;
    _optionalChain([(this.currDemo ), 'optionalAccess', _5 => _5.dispose, 'call', _6 => _6()]);
    threePlatformize.PLATFORM.dispose();
  }
});
