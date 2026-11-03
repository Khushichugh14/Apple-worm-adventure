export const WORLDS = [
  {
    id: 1,
    name: 'Mossy Meadow',
    subtitle: 'Gentle glades & lush beginnings',
    range: [1, 10],
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.15)',
    difficulty: 'Beginner',
    icon: '🌱'
  },
  {
    id: 2,
    name: 'Stone Ruins',
    subtitle: 'Narrow pillars & ancient monoliths',
    range: [11, 20],
    color: '#f59e0b',
    accentBg: 'rgba(245, 158, 11, 0.15)',
    difficulty: 'Easy',
    icon: '🏛️'
  },
  {
    id: 3,
    name: 'Crystal Caverns',
    subtitle: 'Glowing geodes & twisting corridors',
    range: [21, 30],
    color: '#38bdf8',
    accentBg: 'rgba(56, 189, 248, 0.15)',
    difficulty: 'Medium',
    icon: '💎'
  },
  {
    id: 4,
    name: 'Mystic Orchard',
    subtitle: 'Enchanted branches & maze passages',
    range: [31, 40],
    color: '#a855f7',
    accentBg: 'rgba(168, 85, 247, 0.15)',
    difficulty: 'Hard',
    icon: '🔮'
  },
  {
    id: 5,
    name: 'Celestial Sanctuary',
    subtitle: 'The master labyrinth of the garden spirits',
    range: [41, 50],
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.15)',
    difficulty: 'Expert',
    icon: '✨'
  }
];

const ARCHETYPES = [
  // 1. Gentle Curves (Mossy Meadow)
  {
    name: 'Gentle Meadow',
    worm: [[1, 5], [0, 5]],
    apples: [[3, 5], [5, 3]],
    portal: [6, 1],
    baseWalls: [[2, 2], [2, 3], [4, 4]],
    safeExtraWalls: [[6, 4], [1, 3], [5, 6], [3, 1], [0, 2], [4, 6], [6, 6]],
    par: 12
  },
  // 2. The Stone Divide
  {
    name: 'Stone Divide',
    worm: [[1, 6], [0, 6]],
    apples: [[4, 6], [4, 2]],
    portal: [6, 1],
    baseWalls: [[2, 4], [3, 4], [4, 4], [5, 4]],
    safeExtraWalls: [[1, 2], [6, 3], [2, 1], [0, 4], [6, 5], [3, 1], [5, 6]],
    par: 14
  },
  // 3. Crystal Grove
  {
    name: 'Crystal Grove',
    worm: [[1, 1], [0, 1]],
    apples: [[3, 1], [5, 2], [5, 5]],
    portal: [6, 6],
    baseWalls: [[2, 3], [3, 3], [4, 3], [4, 4]],
    safeExtraWalls: [[1, 4], [3, 6], [0, 5], [6, 2], [6, 4], [1, 6], [2, 6]],
    par: 16
  },
  // 4. Twisting Ruins
  {
    name: 'Twisting Ruins',
    worm: [[1, 6], [0, 6]],
    apples: [[3, 2], [5, 2]],
    portal: [6, 1],
    baseWalls: [[3, 4], [3, 5], [5, 4]],
    safeExtraWalls: [[1, 3], [5, 6], [0, 2], [6, 3], [2, 5], [4, 6], [1, 1]],
    par: 13
  },
  // 5. Ancient Sanctuary
  {
    name: 'Ancient Labyrinth',
    worm: [[1, 1], [0, 1]],
    apples: [[5, 1], [5, 5], [2, 5]],
    portal: [6, 6],
    baseWalls: [[2, 3], [4, 3]],
    safeExtraWalls: [[3, 6], [0, 4], [6, 3], [1, 4], [4, 1], [6, 1], [3, 1]],
    par: 15
  },
  // 6. Center Island
  {
    name: 'Emerald Atoll',
    worm: [[1, 2], [1, 1]],
    apples: [[3, 5], [5, 2]],
    portal: [1, 6],
    baseWalls: [[3, 3], [3, 4], [4, 3], [4, 4]],
    safeExtraWalls: [[5, 5], [6, 3], [0, 4], [2, 0], [6, 0], [4, 6], [5, 6]],
    par: 14
  },
  // 7. Serpent Crossing
  {
    name: 'Serpent Crossing',
    worm: [[2, 6], [1, 6]],
    apples: [[2, 2], [5, 5]],
    portal: [5, 1],
    baseWalls: [[3, 1], [3, 2], [3, 3], [3, 5]],
    safeExtraWalls: [[0, 3], [6, 4], [1, 4], [5, 3], [6, 6], [0, 1], [4, 6]],
    par: 15
  },
  // 8. Four Corners
  {
    name: 'Corner Cache',
    worm: [[1, 4], [0, 4]],
    apples: [[1, 1], [6, 2], [6, 5]],
    portal: [1, 6],
    baseWalls: [[2, 2], [2, 5], [5, 2], [5, 4]],
    safeExtraWalls: [[3, 0], [4, 6], [0, 1], [3, 6], [4, 1], [0, 6], [5, 6]],
    par: 18
  },
  // 9. Spiral Garden
  {
    name: 'Spiral Garden',
    worm: [[6, 6], [6, 5]],
    apples: [[2, 6], [2, 2], [5, 2]],
    portal: [4, 4],
    baseWalls: [[3, 3], [4, 3], [5, 3], [3, 5]],
    safeExtraWalls: [[1, 4], [6, 1], [0, 2], [6, 3], [0, 6], [4, 1], [1, 1]],
    par: 17
  },
  // 10. Prismatic Gate
  {
    name: 'Prismatic Gate',
    worm: [[1, 2], [0, 2]],
    apples: [[4, 1], [5, 6], [2, 5]],
    portal: [6, 2],
    baseWalls: [[3, 2], [3, 3], [3, 4]],
    safeExtraWalls: [[1, 6], [5, 4], [0, 5], [6, 5], [4, 3], [1, 4], [5, 1]],
    par: 16
  }
];

export const LEVELS = Array.from({ length: 50 }, (_, i) => {
  const levelId = i + 1;
  const world = WORLDS.find(w => levelId >= w.range[0] && levelId <= w.range[1]) || WORLDS[0];
  const archIndex = i % ARCHETYPES.length;
  const arch = ARCHETYPES[archIndex];

  // Progressive wall density based on world progression
  const extraCount = Math.min(Math.floor(i / 10), arch.safeExtraWalls.length);
  const extraWalls = arch.safeExtraWalls.slice(0, extraCount);
  const walls = [...arch.baseWalls, ...extraWalls];

  return {
    id: levelId,
    worldId: world.id,
    worldName: world.name,
    worldColor: world.color,
    title: `${arch.name} ${String(levelId).padStart(2, '0')}`,
    difficulty: world.difficulty,
    size: 8,
    worm: arch.worm.map(p => [...p]),
    apples: arch.apples.map(p => [...p]),
    portal: [...arch.portal],
    walls,
    objective: `Collect ${arch.apples.length} apple${arch.apples.length > 1 ? 's' : ''} and enter the portal.`,
    moveLimit: 25 + Math.floor(i * 0.4),
    parMoves: arch.par + Math.floor(extraCount * 0.8)
  };
});
