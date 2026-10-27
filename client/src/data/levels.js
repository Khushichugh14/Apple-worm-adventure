const layouts = [
  { worm:[ [1,5],[0,5] ], apples:[[3,5],[5,3]], portal:[6,1], walls:[[2,2],[2,3],[4,4]], objective:'Collect every apple, then reach the portal.' },
  { worm:[[1,6],[0,6]], apples:[[4,6],[4,2]], portal:[6,1], walls:[[2,4],[3,4],[4,4],[5,4]], objective:'Plan around the stone barrier.' },
  { worm:[[1,1],[0,1]], apples:[[3,1],[5,2],[5,5]], portal:[6,6], walls:[[2,3],[3,3],[4,3],[4,4]], objective:'Collect all three apples to unlock the portal.' },
  { worm:[[1,6],[0,6]], apples:[[2,2],[5,2]], portal:[6,1], walls:[[3,3],[3,4],[3,5],[5,4]], objective:'Find a safe route through the ruins.' },
  { worm:[[1,1],[0,1]], apples:[[5,1],[5,5],[2,5]], portal:[6,6], walls:[[2,2],[2,3],[4,3],[4,4]], objective:'Grow carefully. Your body blocks the path.' }
];
export const LEVELS = Array.from({length:50},(_,i)=>{
 const base=layouts[i%layouts.length];
 const walls=base.walls.map(([x,y])=>[x,y]);
 if(i>=5){ const x=2+(i%3), y=2+Math.floor(i/5)%3; if(!walls.some(([a,b])=>a===x&&b===y)) walls.push([x,y]); }
 return {id:i+1, title:`Level ${String(i+1).padStart(2,'0')}`, difficulty:i<10?'Beginner':i<20?'Easy':i<30?'Medium':i<40?'Hard':'Expert', size:8, worm:base.worm.map(p=>[...p]), apples:base.apples.map(p=>[...p]), portal:[...base.portal], walls, objective:base.objective, moveLimit:24+Math.min(i,20)};
});
