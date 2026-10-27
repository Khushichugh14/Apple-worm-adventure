export const same = (a,b) => a[0]===b[0] && a[1]===b[1];
export function step(state, direction, level){
 if(state.status!=='playing') return state;
 const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction]; if(!delta)return state;
 const head=[state.worm[0][0]+delta[0],state.worm[0][1]+delta[1]];
 const wall=level.walls.some(p=>same(p,head));
 const eating=state.apples.some(p=>same(p,head));
 const body=eating?state.worm:state.worm.slice(0,-1);
 const hitBody=body.some(p=>same(p,head));
 if(head[0]<0||head[1]<0||head[0]>=level.size||head[1]>=level.size||wall||hitBody){return {...state,status:'failed',moves:state.moves+1,reason:wall?'A stone wall blocks the way.':hitBody?'You bumped into your own tail.':'You wandered beyond the garden.'};}
 const worm=[head,...state.worm.slice(0,eating?state.worm.length:state.worm.length-1)];
 const apples=eating?state.apples.filter(p=>!same(p,head)):state.apples;
 const moves=state.moves+1;
 if(moves>level.moveLimit) return {...state,status:'failed',worm,apples,moves,reason:'No moves left. Try a different route.'};
 const portalReady=apples.length===0 && same(head,level.portal);
 return {...state,worm,apples,moves,score:state.score+(eating?10:0),status:portalReady?'completed':'playing',reason:eating?'Apple collected!':portalReady?'Portal reached!':''};
}
export const initialState = level => ({worm:level.worm.map(p=>[...p]),apples:level.apples.map(p=>[...p]),moves:0,score:0,status:'playing',reason:''});
