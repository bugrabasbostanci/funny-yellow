import { type Database } from "./supabase";
import { DatabaseService } from "./database-service";

type StickerData = Database["public"]["Tables"]["stickers"]["Row"];
type PackData = Database["public"]["Tables"]["sticker_packs"]["Row"];

export interface StickerPack {
  id: string;
  name: string;
  description: string;
  character: string;
  previewStickers: string[];
  stickerIds: string[];
  thumbnail?: string;
  totalStickers: number;
}

// Convert database pack to StickerPack format
function convertDbPackToStickerPack(pack: PackData, stickers: StickerData[]): StickerPack {
  const stickerIds = stickers.map(s => s.slug || s.name.toLowerCase().replace(/\s+/g, '-'));
  
  return {
    id: pack.id,
    name: pack.name,
    description: pack.description || "",
    character: pack.character || "Various",
    previewStickers: stickerIds.slice(0, 3),
    stickerIds: stickerIds,
    thumbnail: pack.thumbnail_url || (stickers[0]?.thumbnail_url),
    totalStickers: stickers.length,
  };
}

// Load packs from database with fallback to hardcoded
export async function loadPacksFromDatabase(): Promise<StickerPack[]> {
  try {
    const dbPacks = await DatabaseService.getAllPacks();
    const packsWithStickers = await Promise.all(
      dbPacks.map(async (pack) => {
        const packData = await DatabaseService.getPackById(pack.id);
        return convertDbPackToStickerPack(pack, packData.stickers);
      })
    );
    
    console.log("✅ Loaded packs from database:", packsWithStickers.length);
    return packsWithStickers;
  } catch (error) {
    console.error("❌ Failed to load packs from database, using fallback:", error);
    return FALLBACK_STICKER_PACKS;
  }
}

const FALLBACK_STICKER_PACKS: StickerPack[] = [
  {
    id: "kermit-pack",
    name: "Kermit Collection",
    description: "Iconic Kermit the Frog memes and reactions",
    character: "Kermit",
    previewStickers: ["kermit-sitting", "kermit-sad", "kermit-middle-finger"],
    stickerIds: ["kermit-middle-finger", "kermit-sad", "kermit-sitting"],
    thumbnail: "/stickers/source/kermit-sitting.png",
    totalStickers: 3,
  },
  {
    id: "pocoyo-pack",
    name: "Pocoyo Adventures",
    description: "Cute and expressive Pocoyo character stickers",
    character: "Pocoyo",
    previewStickers: [
      "pocoyo-sitting-happy-sticker",
      "pocoyo-angry-sticker",
      "pocoyo-sleeping-sticker",
    ],
    stickerIds: [
      "pocoyo-angry-sticker",
      "pocoyo-sitting-crying-sticker", 
      "pocoyo-sitting-happy-sticker",
      "pocoyo-sleeping-sticker",
      "pocoyo-standing-sticker",
    ],
    thumbnail: "/stickers/source/pocoyo-sitting-happy-sticker.png",
    totalStickers: 5,
  },
  {
    id: "shrek-pack",
    name: "Shrek Memes",
    description: "Hilarious Shrek reaction stickers",
    character: "Shrek",
    previewStickers: ["shrek-funny", "shrek-rizz"],
    stickerIds: ["shrek-funny", "shrek-rizz"],
    thumbnail: "/stickers/source/shrek-funny.png",
    totalStickers: 2,
  },
  {
    id: "yellow-emoji-pack",
    name: "Yellow Emoji Collection",
    description: "Classic yellow emoji reactions and expressions",
    character: "Emoji",
    previewStickers: ["10", "15", "20"],
    stickerIds: [
      "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
      "20", "21", "22", "23", "24", "25", "27", "3", "4", "5", "6", "8"
    ],
    thumbnail: "/stickers/source/15.png",
    totalStickers: 22,
  },
  {
    id: "reaction-pack",
    name: "Reaction Collection",
    description: "Perfect reactions for every conversation",
    character: "Various",
    previewStickers: ["face-palm-sticker", "side-eye-sticker", "suspicious-sticker"],
    stickerIds: [
      "agent-sticker", "angry-walking-sticker", "binoculars-sticker",
      "bowing-down-sticker", "coban-sticker", "covering-ear-sticker",
      "crazy-sticker", "cute-manga-sticker", "denying-sticker",
      "depressed-sticker", "despair-sticker", "eyelid-pulling-sticker",
      "face-palm-sticker", "feet-up-sticker", "giving-hand-sticker",
      "hand-on-cheek-sticker", "hiding-smile-sticker", "hope-sticker",
      "middle-finger-sticker", "nervous-sticker", "pointing-eyes-sticker",
      "ponder-sticker", "poor-sticker", "refuse-sticker", "rubbing-belly-sticker",
      "shinny-smile-sticker", "side-eye-sticker", "sly-sticker",
      "small-size-sticker", "spy-sticker", "suspicious-sticker",
      "thumos-down-sticker", "thump-up-winking-witcker", "thumps-up-sticker",
      "touching-nose-sticker", "villain-sticker", "wink-fingers-sticker",
      "wonder-female-sticker", "yuck-face-sticker"
    ],
    thumbnail: "/stickers/source/face-palm-sticker.png",
    totalStickers: 38,
  },
  {
    id: "animals-pack",
    name: "Animal Friends",
    description: "Cute animal stickers including cats and monkeys",
    character: "Animals",
    previewStickers: ["smoking-cat-sticker", "monkey-side-eye", "flower-sticker"],
    stickerIds: [
      "smoking-cat-sticker", "monkey-side-eye", "flower-sticker",
      "rose-sticker", "plants-and-zombies-aesthetic -sunflower"
    ],
    thumbnail: "/stickers/source/smoking-cat-sticker.png",
    totalStickers: 5,
  },
];

export function getPackById(packId: string): StickerPack | undefined {
  return FALLBACK_STICKER_PACKS.find(pack => pack.id === packId);
}

export function getPackByStickerId(stickerId: string): StickerPack | undefined {
  return FALLBACK_STICKER_PACKS.find(pack => 
    pack.stickerIds.includes(stickerId)
  );
}

export function getStickersByPack(packId: string, allStickers: StickerData[]): StickerData[] {
  const pack = getPackById(packId);
  if (!pack) return [];
  
  return allStickers.filter(sticker => 
    pack.stickerIds.some(packStickerId => 
      sticker.slug === packStickerId || sticker.name.toLowerCase().includes(packStickerId)
    )
  );
}