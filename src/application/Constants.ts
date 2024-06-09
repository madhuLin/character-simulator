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
// export const PORTAL_PERLINNOISE_TEXTURE = new URL(pathImg + "perlinnoise.png", import.meta.url).href;
// export const PORTAL_SPARKNOISE_TEXTURE = new URL(pathImg + "sparknoise.png", import.meta.url).href;
// export const PORTAL_WATERURBURBULENCE_TEXTURE = new URL(pathImg + "waterturbulence.png", import.meta.url).href;
// export const PORTAL_NOISE_TEXTURE = new URL(pathImg + "noise.png", import.meta.url).href;
const portalPath = "../assets/shaders/portal/";
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
export const AUDIO_URL = new URL("../assets/audio/Sunny.m4a", import.meta.url).href;
export const AUDIO_URL1 = new URL("../assets/audio/Break Your Little Heart.m4a", import.meta.url).href;
export const AUDIO_URL2 = new URL("../assets/audio/Midnight City.m4a", import.meta.url).href;


//mode == Plaza
// export const PLAZA_FLOOR_SCENE_URL = new URL(".../assets/img/WoodFloor_2K.jpg", import.meta.url).href;
// export const PLAZA_DESERT_SCENE_URL = new URL(".../assets/models/low_poly_desert.glb", import.meta.url).href;
export const PLAZA_CITY_SCENE_URL = new URL("../assets/models/low_poly_city.glb", import.meta.url).href;
export const PLAZA_EFFECT_SCENE_URL = new URL("../assets/img/smoke.png", import.meta.url).href;
export const PLAZA_PORTAL_SCENE_URL = new URL("../assets/models/portal.glb", import.meta.url).href;

export const ON_CLICK_RAY_CAST = "on-click-ray-cast";
export const ON_SHOW_TOOLTIP = "on-show-tooltip";
export const ON_HIDE_TOOLTIP = "on-hide-tooltip";
export const ON_IN_PORTAL = "on-in-portal";

export const portalPositions: [number, number, number][] = [
    [19, 0.7, -18],
    [-1.4, 0.05, 16],
    [-2.1, 0.05, 4],
    [0, 9.4, -92],

];




//gallery
/*
* Model Resources
* */
export const GALLETY_SCENE_URL = new URL("../assets/models/scene_collision.glb", import.meta.url).href;
export const STATIC_SCENE_URL = new URL("../assets/models/scene_desk_obj.glb", import.meta.url).href;
export const FLOOR_SCENE_URL = new URL("../assets/img/WoodFloor_2K.jpg", import.meta.url).href;
/*
* Texture Resources
* */
export const BOARD_TEXTURES = [
    new URL("../assets/boards/1.png", import.meta.url).href,
    new URL("../assets/boards/2.png", import.meta.url).href,
    new URL("../assets/boards/3.jpg", import.meta.url).href,
    new URL("../assets/boards/4.jpg", import.meta.url).href,
    new URL("../assets/boards/5.png", import.meta.url).href,
    new URL("../assets/boards/6.png", import.meta.url).href,
    new URL("../assets/boards/7.png", import.meta.url).href,
    new URL("../assets/boards/8.jpg", import.meta.url).href,
    new URL("../assets/boards/9.jpg", import.meta.url).href,
    new URL("../assets/boards/10.png", import.meta.url).href
];

/*
* Audio Resources
* */
export const AUDIO_GRALLERY_URL = new URL("../assets/audio/我記得.m4a", import.meta.url).href;

/*
* Intro
* */
export const BOARDS_INFO: Record<string, { title: string, author: string, describe: string }> = {
    1: {
        title: "《小橘貝》",
author: "小雅",
        describe: `
它站在畫面中央，靜靜地凝視著觀眾，柔和的橘色將它的柔軟毛髮和靈動眼眸嫵媚地勾勒出來。 <br>
小貓的小耳朵微微豎起，似乎在傾聽著什麼，身體略微前傾，展現出它對周圍世界的好奇和敏感。 <br>
畫面的背景色以淡藍色為主，這種色彩營造了溫馨輕柔的氛圍，讓人彷彿置身於陽光明媚的午後時光中。 <br>
整幅畫作細緻精緻、色彩明亮而溫暖，帶給人們一種溫馨、親切的感受。
`
    },
    2: {
        title: "《微光》",
author: "小雅",
        describe: `
微小的星光和銀河組成了一個神秘的宇宙世界，讓人感到無限的遐想和想像。 <br>
當你凝視著這幅畫時，你會感受到無邊無際的深邃與寧靜。 <br>
你彷彿置身於一個沒有噪音、沒有煩擾的夜空中。 在這個寧靜的空間裡，你可以看到銀河中微光閃爍的樣子。 <br>
這些微光似乎是夜空中唯一的生命體，它們微弱卻堅定地發出光芒，點亮著整個銀河系。 <br>
這些微光是如此的纖細而又強大，彷彿在無邊的黑暗中，只有它們才能給人帶來希望和力量。
`
    },
    3: {
        title: "《天鵝》",
author: "小雅",
        describe: `
湖面靜謐如鏡，微風拂過，泛起一圈圈細微的漣漪，彷彿為優雅的白色天鵝們鋪上了一層晶瑩剔透的紗帳。 <br>
其中一隻白羽如雪的天鵝在水中自由自在地舞動著優美的姿態，如同一位華麗的舞者在水上翩翩起舞。 <br>
純白色羽毛在陽光的照射下，閃爍著淡淡的光暈，如同珍珠一般璀璨奪目。
`
    },
    4: {
        title: "《山中小屋》",
        author: "小雅",
        describe: `
寧靜而恬淡，遠山隱現於雲霧中，彷彿是一幅夢幻般的畫卷。 <br>
小屋在山腳下寧靜地佇立，牆體潔白，屋頂泛著淡淡的陽光，使得小屋與周圍的環境相互映襯。 <br>
流露出一種自然的和諧之美。
`
    },
    5: {
        title: "《太空人》",
author: "小雅",
        describe: `
太空人身披著黑夜在星羅棋布的宇宙中漫遊。 <br>
雖說現在已經是太空時代，人類早就可以搭太空船去月球，<br>
但卻永遠無法探索別人內心的宇宙。
`
    },
    6: {
        title: "《粉紅色海洋》",
        author: "小雅",
        describe: `
粉紅色雲朵蓬鬆如棉花糖展開眼前，彎月微笑在縫隙間，月光柔和，清雅動人。 <br>
紫色天空如夢，星輝閃爍，默默傾聽，輕輕地，微風拂面，悄悄地，生命在流動。
`
    },
    7: {
        title: "《風平浪靜》",
        author: "小雅",
        describe: `
撐一艘船，離開岸邊一百米，風平浪靜，彩霞慢慢淡下去。 <br>
撐一艘船，離開岸邊兩百米，風平浪靜，夜晚輕輕呼喚你。 <br>
撐一艘船，離開岸邊三百米，風平浪靜，大魚笑我傻兮兮。 <br>
撐一艘船 離開岸邊四百米，風平浪靜，星兒閃閃笑瞇瞇。 <br>
撐一艘船 離開岸邊五百米，風平浪靜，海龜向我揮手。
`
    },
    8: {
        title: "《向日葵》",
author: "小雅",
        describe: `
陽光照耀，金黃色的花盤。 <br>
宛如一盞明燈，指引前進。 <br>
向日葵，你是信仰，你是力量，你是光輝，你是堅毅，你是忠誠，你是愛慕，你是美麗。
`
    },
    9: {
        title: "《花·虎·蝶》",
        author: "小雅",
        describe: `
一段奇妙的相遇，是自由和勇氣的結合，是一份神秘而又動人的韻味。 <br>
在這片色彩繽紛的花海之中，一隻帶著蝴蝶翅膀的老虎，騎著踏板車，<br>
它像是一道閃電，劃破了這片美好的天地。 <br>
翅膀輕輕地振動，彷彿隨時可以飛離這片美好的天地，飛向更廣闊的天空。
`
    },
    10: {
        title: "《天竺》",
        author: "小雅",
        describe: `
所有的轉折隱藏在密集的鳥群中，天空與海洋都無法察覺，但懷著美夢卻可以看見。 <br>
摸索顛倒的一瞬間，所有的懷念隱藏在相似的日子裡，心裡的蜘蛛模仿人類張燈結彩
`
    }
};

/*
* Computer Iframe SRC
* */
export const IFRAME_SRC = new URL("/universe/index.html", import.meta.url).href;
export const ON_ENTER_APP = "on-enter-app";



//mode == Playground
export const PLAYGROUND_SCENE_URL = new URL("../assets/models/trip-fellas-map-transformed.glb", import.meta.url).href;
// export const PLAYGROUND_EFFECT_SCENE_URL = new URL("../assets/img/smoke.png", import.meta.url).href;