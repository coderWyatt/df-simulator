// 宝箱配置数据
export const chestConfig = {
    // 红色品质 - 最高级
    safe: { name: "保险柜", icon: "🗄️", cost: 100000, appearanceChance: 0.02, rates: { red: 0.15, gold: 0.25, purple: 0.25, blue: 0.20, green: 0.10, white: 0.05 }, color: "red", rarity: "legendary", crisisChance: 0.90 },
    small_safe: { name: "小保险箱", icon: "🔐", cost: 85000, appearanceChance: 0.03, rates: { red: 0.10, gold: 0.20, purple: 0.25, blue: 0.25, green: 0.15, white: 0.05 }, color: "red", rarity: "legendary", crisisChance: 0.85 },
    server: { name: "服务器", icon: "🖥️", cost: 90000, appearanceChance: 0.025, rates: { red: 0.08, gold: 0.18, purple: 0.25, blue: 0.25, green: 0.18, white: 0.06 }, color: "red", rarity: "legendary", crisisChance: 0.88 },
    computer: { name: "电脑", icon: "💻", cost: 80000, appearanceChance: 0.035, rates: { red: 0.06, gold: 0.15, purple: 0.22, blue: 0.28, green: 0.20, white: 0.09 }, color: "red", rarity: "legendary", crisisChance: 0.82 },
    // 金色品质 - 史诗级
    computer_case: { name: "电脑机箱", icon: "🖱️", cost: 75000, appearanceChance: 0.05, rates: { red: 0.15, gold: 0.30, purple: 0.35, blue: 0.15, green: 0.04, white: 0.01 }, color: "gold", rarity: "epic", crisisChance: 0.80 },
    aviation_storage: { name: "航空储物箱", icon: "✈️", cost: 70000, appearanceChance: 0.06, rates: { red: 0.12, gold: 0.28, purple: 0.35, blue: 0.18, green: 0.06, white: 0.01 }, color: "gold", rarity: "epic", crisisChance: 0.78 },
    medical_supplies_pile: { name: "医疗物资堆", icon: "🏥", cost: 65000, appearanceChance: 0.07, rates: { red: 0.05, gold: 0.15, purple: 0.25, blue: 0.25, green: 0.20, white: 0.10 }, color: "gold", rarity: "epic", crisisChance: 0.75 },
    airdrop_box: { name: "空投箱", icon: "📦", cost: 60000, appearanceChance: 0.08, rates: { red: 0.04, gold: 0.12, purple: 0.22, blue: 0.30, green: 0.25, white: 0.07 }, color: "gold", rarity: "epic", crisisChance: 0.72 },
    // 紫色品质 - 稀有级
    advanced_storage: { name: "高级储物箱", icon: "📦", cost: 35000, appearanceChance: 0.10, rates: { red: 0.03, gold: 0.10, purple: 0.20, blue: 0.30, green: 0.30, white: 0.07 }, color: "purple", rarity: "rare", crisisChance: 0.65 },
    advanced_travel_case: { name: "高级旅行箱", icon: "🧳", cost: 32000, appearanceChance: 0.11, rates: { red: 0.07, gold: 0.18, purple: 0.35, blue: 0.28, green: 0.10, white: 0.02 }, color: "purple", rarity: "rare", crisisChance: 0.63 },
    suitcase: { name: "手提箱", icon: "💼", cost: 30000, appearanceChance: 0.12, rates: { red: 0.06, gold: 0.16, purple: 0.35, blue: 0.30, green: 0.10, white: 0.03 }, color: "purple", rarity: "rare", crisisChance: 0.60 },
    medical_kit: { name: "医疗包", icon: "💊", cost: 28000, appearanceChance: 0.13, rates: { red: 0.05, gold: 0.15, purple: 0.30, blue: 0.35, green: 0.12, white: 0.03 }, color: "purple", rarity: "rare", crisisChance: 0.58 },
    cement_truck: { name: "水泥车", icon: "🚛", cost: 25000, appearanceChance: 0.14, rates: { red: 0.04, gold: 0.12, purple: 0.28, blue: 0.40, green: 0.14, white: 0.02 }, color: "purple", rarity: "rare", crisisChance: 0.55 },
    // 蓝色品质 - 精良级
    lab_coat: { name: "实验服", icon: "🥼", cost: 15000, appearanceChance: 0.18, rates: { red: 0.01, gold: 0.05, purple: 0.15, blue: 0.35, green: 0.30, white: 0.14 }, color: "blue", rarity: "uncommon", crisisChance: 0.45 },
    weapon_box: { name: "武器箱", icon: "🔫", cost: 14000, appearanceChance: 0.19, rates: { red: 0.008, gold: 0.04, purple: 0.12, blue: 0.35, green: 0.30, white: 0.13 }, color: "blue", rarity: "uncommon", crisisChance: 0.43 },
    hiking_bag: { name: "登山包", icon: "🎒", cost: 13000, appearanceChance: 0.20, rates: { red: 0.006, gold: 0.03, purple: 0.10, blue: 0.32, green: 0.35, white: 0.14 }, color: "blue", rarity: "uncommon", crisisChance: 0.40 },
    tool_box: { name: "工具盒", icon: "🔧", cost: 12000, appearanceChance: 0.21, rates: { red: 0.012, gold: 0.05, purple: 0.15, blue: 0.50, green: 0.23, white: 0.05 }, color: "blue", rarity: "uncommon", crisisChance: 0.38 },
    drawer_cabinet: { name: "抽屉柜", icon: "🗄️", cost: 10000, appearanceChance: 0.22, rates: { red: 0.01, gold: 0.04, purple: 0.12, blue: 0.45, green: 0.30, white: 0.08 }, color: "blue", rarity: "uncommon", crisisChance: 0.35 },
    // 绿色品质 - 普通级
    ammo_crate: { name: "弹药箱", icon: "🎯", cost: 5000, appearanceChance: 0.25, rates: { red: 0.005, gold: 0.02, purple: 0.08, blue: 0.30, green: 0.40, white: 0.20 }, color: "green", rarity: "common", crisisChance: 0.25 },
    tool_cabinet: { name: "工具柜", icon: "🧰", cost: 4500, appearanceChance: 0.27, rates: { red: 0.002, gold: 0.01, purple: 0.05, blue: 0.20, green: 0.45, white: 0.29 }, color: "green", rarity: "common", crisisChance: 0.23 },
    storage_locker: { name: "收纳盒", icon: "🗄️", cost: 4000, appearanceChance: 0.28, rates: { red: 0.001, gold: 0.008, purple: 0.04, blue: 0.18, green: 0.45, white: 0.32 }, color: "green", rarity: "common", crisisChance: 0.22 },
    trash_bin: { name: "垃圾箱", icon: "🗑️", cost: 3500, appearanceChance: 0.30, rates: { red: 0.001, gold: 0.005, purple: 0.03, blue: 0.15, green: 0.45, white: 0.36 }, color: "green", rarity: "common", crisisChance: 0.20 },
    field_supplies: { name: "野外物资箱", icon: "📦", cost: 3000, appearanceChance: 0.32, rates: { red: 0.001, gold: 0.005, purple: 0.02, blue: 0.12, green: 0.45, white: 0.40 }, color: "green", rarity: "common", crisisChance: 0.20 },
    // 白色品质 - 最低级
    express_box: { name: "快递箱", icon: "📦", cost: 1000, appearanceChance: 0.40, rates: { red: 0.0002, gold: 0.002, purple: 0.01, blue: 0.08, green: 0.40, white: 0.51 }, color: "white", rarity: "trash", crisisChance: 0.20 },
    travel_bag: { name: "旅行袋", icon: "🧳", cost: 800, appearanceChance: 0.42, rates: { red: 0.0003, gold: 0.003, purple: 0.015, blue: 0.12, green: 0.58, white: 0.283 }, color: "white", rarity: "trash", crisisChance: 0.20 },
    clothes: { name: "衣服", icon: "👕", cost: 500, appearanceChance: 0.45, rates: { red: 0.0001, gold: 0.001, purple: 0.005, blue: 0.05, green: 0.35, white: 0.59 }, color: "white", rarity: "trash", crisisChance: 0.20 },
    manhole_cover: { name: "井盖", icon: "⚙️", cost: 300, appearanceChance: 0.48, rates: { red: 0.00005, gold: 0.0005, purple: 0.003, blue: 0.03, green: 0.30, white: 0.666 }, color: "white", rarity: "trash", crisisChance: 0.20 },
    bird_nest: { name: "鸟窝", icon: "🪹", cost: 200, appearanceChance: 0.50, rates: { red: 0.00001, gold: 0.0003, purple: 0.002, blue: 0.02, green: 0.25, white: 0.72769 }, color: "white", rarity: "trash", crisisChance: 0.15 }
};
