/*
* Model Resources
* */
export const COLLISION_SCENE_URL = new URL("../assets/models/playground.glb", import.meta.url).href;
export const CHARACTER_URL = new URL("../assets/models/character.glb", import.meta.url).href;
export const CHARACTER_URL1 = new URL("../assets/models/character1.glb", import.meta.url).href;
export const CHARACTER_URL2 = new URL("../assets/models/character2.glb", import.meta.url).href;
export const CHARACTER_IDLE_ACTION_URL = new URL("../assets/models/character-idle.fbx", import.meta.url).href;
export const CHARACTER_WALK_ACTION_URL = new URL("../assets/models/character-walk.fbx", import.meta.url).href;
export const CHARACTER_JUMP_ACTION_URL = new URL("../assets/models/character-jump.fbx", import.meta.url).href;

/*
* Texture Resources
* */
export const SCENE_BACKGROUND_TEXTURE = new URL("../assets/img/env-bg.jpeg", import.meta.url).href;
export const SCENE_BACKGROUND1_TEXTURE = new URL("../assets/img/vertopal.jpg", import.meta.url).href;
export const WATER_NORMAL1_TEXTURE = new URL("../assets/img/Water_1_M_Normal.jpg", import.meta.url).href;
export const WATER_NORMAL2_TEXTURE = new URL("../assets/img/Water_2_M_Normal.jpg", import.meta.url).href;

const pathImg = "../assets/shaders/images/";
export const PORTAL_PERLINNOISE_TEXTURE = new URL(pathImg + "perlinnoise.png", import.meta.url).href;
export const PORTAL_SPARKNOISE_TEXTURE = new URL(pathImg + "sparknoise.png", import.meta.url).href;
export const PORTAL_WATERURBURBULENCE_TEXTURE = new URL(pathImg + "waterturbulence.png", import.meta.url).href;
export const PORTAL_NOISE_TEXTURE = new URL(pathImg + "noise.png", import.meta.url).href;
const portalPath = "../assets/shaders/portal1/";
export const PORTAL_MAGIC_TEXTURE = new URL(portalPath + "magic.png", import.meta.url).href;
export const PORTAL_AROUND_TEXTURE = new URL(portalPath + "guangyun.png", import.meta.url).href;
export const PORTAL_POINT1_TEXTURE = new URL(portalPath + "point1.png", import.meta.url).href;
export const PORTAL_POINT2_TEXTURE = new URL(portalPath + "point2.png", import.meta.url).href;
export const PORTAL_POINT3_TEXTURE = new URL(portalPath + "point3.png", import.meta.url).href;
export const PORTAL_POINT4_TEXTURE = new URL(portalPath + "point4.png", import.meta.url).href;



/*
* Events
* */
export const ON_LOAD_PROGRESS = "on-load-progress";
export const ON_LOAD_SCENE_FINISH = "on-load-scene-finish";
export const ON_KEY_DOWN = "on-key-down";
export const ON_KEY_UP = "on-key-up";
export const ON_INTERSECT_TRIGGER = "on-intersect-trigger";
export const ON_INTERSECT_TRIGGER_STOP = "on-intersect-trigger-stop";

/*
* NES Game Resources
* */
export const NES_GAME_SRC1 = new URL("../assets/nes/Super Mario Bros (JU).nes", import.meta.url).href;
export const NES_GAME_SRC2 = new URL("../assets/nes/Super Mario Bros 3.nes", import.meta.url).href;
export const NES_GAME_SRC3 = new URL("../assets/nes/Mighty Final Fight (USA).nes", import.meta.url).href;
export const NES_GAME_SRC4 = new URL("../assets/nes/Mitsume ga Tooru (Japan).nes", import.meta.url).href;

/*
* Audio  Resources
* */
export const AUDIO_URL = new URL("../assets/audio/Midnight City.m4a", import.meta.url).href;


//mode == Plaza
export const PLAZA_COLLISION_SCENE_URL = new URL("../assets/models/KBCL.glb", import.meta.url).href;
export const PLAZA_FLOOR_SCENE_URL = new URL("../assets/img/WoodFloor_2K.jpg", import.meta.url).href;
export const PLAZA_UFO_SCENE_URL = new URL("../assets/models/low_poly_ufo.glb", import.meta.url).href;
export const PLAZA_DESERT_SCENE_URL = new URL("../assets/models/low_poly_desert.glb", import.meta.url).href;
export const PLAZA_CITY_SCENE_URL = new URL("../assets/models/low_poly_city.glb", import.meta.url).href;
export const PLAZA_EFFECT_SCENE_URL = new URL("../assets/img/smoke.png", import.meta.url).href;


export const ON_CLICK_RAY_CAST = "on-click-ray-cast";
export const ON_SHOW_TOOLTIP = "on-show-tooltip";
export const ON_HIDE_TOOLTIP = "on-hide-tooltip";
export const ON_IN_PORTAL = "on-in-portal";

export const portalPositions: [number, number, number][] = [
    [-1.4, 0.05, 16],
    [1.0, 0.5, 12],
    [-2.3, 0.0, 8],
];
