// 危机敌人数据
export const crisisEnemies = [
    // 白色品质 - 基础敌人
    { name: "跑刀仔", icon: "🔪", attack: 8, baseAttack: 5, maxAttack: 12, escapeChance: 0.85, description: "手持小刀的快速突击手，移动迅速但防御薄弱" },
    { name: "阿萨拉士兵", icon: "👤", attack: 10, baseAttack: 7, maxAttack: 15, escapeChance: 0.82, description: "阿萨拉组织的标准步兵，装备基础武器" },
    { name: "哈夫克士兵", icon: "🪖", attack: 9, baseAttack: 6, maxAttack: 13, escapeChance: 0.84, description: "哈夫克集团的正规军，训练有素" },
    { name: "人机哈基蜂", icon: "🐝", attack: 7, baseAttack: 4, maxAttack: 11, escapeChance: 0.88, description: "AI控制的蜂群无人机，数量多但单体脆弱" },
    { name: "幸运鼠鼠", icon: "🐭", attack: 11, baseAttack: 8, maxAttack: 16, escapeChance: 0.80, description: "运气极好的侦察兵，总能找到战利品" },
    
    // 绿色品质 - 标准敌人
    { name: "制式套鼠鼠", icon: "🐭", attack: 18, baseAttack: 15, maxAttack: 25, escapeChance: 0.70, description: "装备标准制式装备的精英鼠鼠战士" },
    { name: "麦小鼠同行", icon: "🐹", attack: 20, baseAttack: 17, maxAttack: 28, escapeChance: 0.68, description: "成对行动的麦小鼠组合，配合默契" },
    { name: "哈夫克盾兵", icon: "🛡️", attack: 22, baseAttack: 18, maxAttack: 30, escapeChance: 0.65, description: "装备重型防弹盾的哈夫克特种部队" },
    { name: "阿萨拉盾兵", icon: "🛡️", attack: 19, baseAttack: 16, maxAttack: 26, escapeChance: 0.69, description: "阿萨拉组织的重装防御单位" },
    { name: "阴暗爬行鼠鼠", icon: "🦎", attack: 21, baseAttack: 18, maxAttack: 29, escapeChance: 0.67, description: "擅长隐蔽和伏击的特种鼠鼠" },
    
    // 蓝色品质 - 精英敌人
    { name: "哈夫克机枪兵", icon: "🔫", attack: 35, baseAttack: 30, maxAttack: 45, escapeChance: 0.55, description: "装备重机枪的哈夫克火力支援单位" },
    { name: "阿萨拉机枪兵", icon: "🔫", attack: 38, baseAttack: 33, maxAttack: 48, escapeChance: 0.52, description: "阿萨拉的重型机枪手，压制火力极强" },
    { name: "哈夫克喷火兵", icon: "🔥", attack: 40, baseAttack: 35, maxAttack: 50, escapeChance: 0.50, description: "装备火焰喷射器的哈夫克特种兵种" },
    { name: "阿萨拉喷火兵", icon: "🔥", attack: 42, baseAttack: 37, maxAttack: 52, escapeChance: 0.48, description: "阿萨拉的火焰兵，擅长清场作战" },
    { name: "幽默静步男无名", icon: "🚶", attack: 45, baseAttack: 40, maxAttack: 55, escapeChance: 0.45, description: "神秘的静步高手，行动无声无息" },
    { name: "哈夫克狙击兵", icon: "🎯", attack: 43, baseAttack: 38, maxAttack: 53, escapeChance: 0.47, description: "哈夫克的精英狙击手，一击必杀" },
    { name: "阿萨拉火箭兵", icon: "🚀", attack: 41, baseAttack: 36, maxAttack: 51, escapeChance: 0.49, description: "装备火箭筒的阿萨拉重火力单位" },
    
    // 紫色品质 - 高级敌人
    { name: "渡鸦", icon: "🦅", attack: 60, baseAttack: 55, maxAttack: 75, escapeChance: 0.35, description: "神秘的空中侦察单位，机动性极强" },
    { name: "赛伊德", icon: "👤", attack: 65, baseAttack: 60, maxAttack: 80, escapeChance: 0.32, description: "传说中的精英战士，战斗力爆表" },
    { name: "曼巴肘击王雷斯", icon: "💪", attack: 62, baseAttack: 57, maxAttack: 77, escapeChance: 0.34, description: "近战格斗专家，肘击威力惊人" },
    { name: "超雄老太", icon: "👵", attack: 58, baseAttack: 53, maxAttack: 73, escapeChance: 0.36, description: "看似无害实则危险的老太，爆发力惊人" },
    { name: "蓝鹰直升机", icon: "🚁", attack: 68, baseAttack: 63, maxAttack: 83, escapeChance: 0.30, description: "重型武装直升机，空中火力支援" },
    
    // 金色品质 - 顶级敌人
    { name: "红皮花来", icon: "🌸", attack: 85, baseAttack: 80, maxAttack: 100, escapeChance: 0.20, description: "传说中的红色精英，实力深不可测" },
    { name: "单三威龙", icon: "🐉", attack: 90, baseAttack: 85, maxAttack: 105, escapeChance: 0.18, description: "单人成军的威龙战士，战斗力爆表" },
    { name: "坝顶乌鲁鲁", icon: "🏔️", attack: 88, baseAttack: 83, maxAttack: 103, escapeChance: 0.19, description: "占据制高点的乌鲁鲁狙击手" },
    { name: "堵桥乌鲁鲁", icon: "🌉", attack: 92, baseAttack: 87, maxAttack: 107, escapeChance: 0.17, description: "封锁桥梁的乌鲁鲁重装兵" },
    { name: "三盾狗", icon: "🐕", attack: 87, baseAttack: 82, maxAttack: 102, escapeChance: 0.21, description: "装备三重护盾的机械战犬" },
    { name: "M14大人", icon: "🔫", attack: 95, baseAttack: 90, maxAttack: 110, escapeChance: 0.15, description: "传说中的M14步枪大师，百发百中" },
    
    // 红色品质 - 终极敌人
    { name: "刘涛全装队", icon: "👥", attack: 120, baseAttack: 110, maxAttack: 150, escapeChance: 0.08, description: "刘涛率领的满配精英小队，战力恐怖" },
    { name: "佐娅护航队", icon: "🛡️", attack: 125, baseAttack: 115, maxAttack: 155, escapeChance: 0.06, description: "佐娅指挥的护航编队，防御无懈可击" },
    { name: "天才少年", icon: "🧠", attack: 130, baseAttack: 120, maxAttack: 160, escapeChance: 0.05, description: "智商超群的战术天才，预判所有行动" },
    { name: "寻血猎犬", icon: "🐕", attack: 135, baseAttack: 125, maxAttack: 165, escapeChance: 0.04, description: "永不放弃的追踪者，一旦锁定不死不休" },
    { name: "清图主播队", icon: "📺", attack: 140, baseAttack: 130, maxAttack: 170, escapeChance: 0.03, description: "直播清图的职业战队，配合完美无瑕" },
    { name: "巅峰5000星威龙", icon: "⭐", attack: 150, baseAttack: 140, maxAttack: 200, escapeChance: 0.02, description: "达到5000星巅峰的威龙，传说中的存在" }
];
