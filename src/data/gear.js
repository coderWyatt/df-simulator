// 装备价格配置 - 与卡牌显示价格一致
export const GEAR_PRICES = {
    weapon: [10000, 20000, 40000, 80000, 150000, 300000],
    armor: [15000, 30000, 60000, 120000, 250000, 500000],
    backpack: [10000, 20000, 40000, 80000, 160000, 320000]
};

// 配装系统 - 三角洲行动真实数据
export const gearData = {
    weapons: [
        { name: "G18", icon: "🔫", attack: 5, speed: -2, cost: 10000, rarity: "普通", color: "text-gray-400" },
        { name: "野牛", icon: "🔫", attack: 8, speed: -3, cost: 20000, rarity: "优秀", color: "text-green-400" },
        { name: "CAR-15", icon: "🔫", attack: 12, speed: -5, cost: 40000, rarity: "稀有", color: "text-blue-400" },
        { name: "AUG", icon: "🔫", attack: 18, speed: -7, cost: 80000, rarity: "史诗", color: "text-purple-400" },
        { name: "高配M250", icon: "🔫", attack: 25, speed: -10, cost: 150000, rarity: "传说", color: "text-yellow-400" },
        { name: "满改M14", icon: "🔫", attack: 35, speed: -15, cost: 300000, rarity: "神话", color: "text-red-400" }
    ],
    armors: [
        { name: "户外棒球帽", icon: "🧢", defense: 10, speed: -2, cost: 15000, rarity: "普通", color: "text-gray-400" },
        { name: "通用战术背心", icon: "🦺", defense: 20, speed: -4, cost: 30000, rarity: "优秀", color: "text-green-400" },
        { name: "制式防弹背心", icon: "🛡️", defense: 35, speed: -6, cost: 60000, rarity: "稀有", color: "text-blue-400" },
        { name: "突击手防弹背心", icon: "🛡️", defense: 55, speed: -8, cost: 120000, rarity: "史诗", color: "text-purple-400" },
        { name: "FS复合防弹衣", icon: "🛡️", defense: 80, speed: -12, cost: 250000, rarity: "传说", color: "text-yellow-400" },
        { name: "泰坦防弹装甲", icon: "🛡️", defense: 120, speed: -15, cost: 500000, rarity: "神话", color: "text-red-400" }
    ],
    backpacks: [
        { name: "斜挎包", icon: "👜", capacity: 4, speed: -1, cost: 10000, rarity: "普通", color: "text-gray-400" },
        { name: "轻型户外背包", icon: "🎒", capacity: 6, speed: -2, cost: 20000, rarity: "优秀", color: "text-green-400" },
        { name: "GA野战背包", icon: "🎒", capacity: 8, speed: -3, cost: 40000, rarity: "稀有", color: "text-blue-400" },
        { name: "D2战术登山包", icon: "🎒", capacity: 12, speed: -4, cost: 80000, rarity: "史诗", color: "text-purple-400" },
        { name: "HLS-2重型背包", icon: "🎒", capacity: 16, speed: -6, cost: 160000, rarity: "传说", color: "text-yellow-400" },
        { name: "GTO重型战术包", icon: "🎒", capacity: 20, speed: -8, cost: 320000, rarity: "神话", color: "text-red-400" }
    ]
};
