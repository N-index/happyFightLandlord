const cardsRules={INVALID:{id:0,limit:-1,audioFileName:"",description:"无效的牌",example:"876, 9998877"},BIG_BOMB:{id:1,limit:-1,audioFileName:"bigBomb",description:"王炸",example:"对王(唯一code: 99 100)"},NORMAL_BOMB:{id:2,limit:4,audioFileName:"normalBomb",description:"四张(炸弹)",example:"尖炸(code: 14 14 14 14)"},SINGLE:{id:3,limit:1,audioFileName:"singleCard/",description:"单张",example:"[ J (code:11),  2(code:80) ]"},DOUBLE:{id:4,limit:2,audioFileName:"doubleCards/",description:"对张",example:"对8(code: 80 80)"},TRIPLE:{id:5,limit:3,audioFileName:"default",description:"三张(单纯三张)",example:"3个7(code: 7 7 7 )"},THREE_PULL_ONE:{id:6,limit:3,audioFileName:"default",description:"三带一",example:"5带3(code: 5 5 5 3)"},THREE_PULL_TWO:{id:7,limit:3,audioFileName:"default",description:"三带二",example:"八带对九(code: 8 8 8 9 9)"},FOUR_PULL_TWO_SINGLE:{id:8,limit:4,audioFileName:"default",description:"四带两个单(不算炸弹)",example:"四个4带个8和Q(code: 4 4 4 4 8 12)"},FOUR_PULL_TWO_DOUBLE:{id:9,limit:4,audioFileName:"default",description:"四带两个对(不算炸弹)",example:"四个5带对4和对3"},SINGLE_BELT:{id:10,limit:1,audioFileName:"singleBelt",description:"单连牌(长度>=5)",example:"顺子4-10(code: 4 5 6 7 8 9 10)"},DOUBLE_BELT:{id:11,limit:2,audioFileName:"doubleBelt",description:"连对(长度>=6)",example:"J-K连对(code: 11 11 12 12 13 13)"},TRIPLE_BELT:{id:12,limit:3,audioFileName:"default",description:"三顺(长度>=6)",example:"444555(code: 4 4 4 5 5 5)"},AIRPLANE_PULL_SINGLE:{id:13,limit:3,audioFileName:"airplane",description:"飞机带翅膀(single)",example:"77788846(code: 7 7 7 8 8 8 4 6)"},AIRPLANE_PULL_DOUBLE:{id:14,limit:3,audioFileName:"airplane",description:"飞机带翅膀(double)",example:"77788846(code: 7 7 7 8 8 8 4 4 6 6)"}},isBiggerThanDesktopCards=(e,t)=>t.cards.length<1||t.mainItems.length<1||(e.type===cardsRules.BIG_BOMB||t.type!==cardsRules.BIG_BOMB&&(t.type!==cardsRules.NORMAL_BOMB&&e.type===cardsRules.NORMAL_BOMB||(t.type===cardsRules.NORMAL_BOMB?e.type===cardsRules.NORMAL_BOMB&&e.mainItems[0]>t.mainItems[0]:e.type===t.type&&([cardsRules.SINGLE,cardsRules.DOUBLE,cardsRules.TRIPLE].includes(t.type)?e.mainItems[0]>t.mainItems[0]:[cardsRules.SINGLE_BELT,cardsRules.DOUBLE_BELT,cardsRules.TRIPLE_BELT].includes(t.type)?e.mainItems.length===t.mainItems.length&&e.mainItems[0]>t.mainItems[0]:[cardsRules.THREE_PULL_ONE,cardsRules.THREE_PULL_TWO,cardsRules.FOUR_PULL_TWO_SINGLE,cardsRules.FOUR_PULL_TWO_DOUBLE].includes(t.type)?e.mainItems[0]>t.mainItems[0]:[cardsRules.AIRPLANE_PULL_SINGLE,cardsRules.AIRPLANE_PULL_DOUBLE].includes(t.type)?e.mainItems.length===t.mainItems.length&&e.mainItems[0]>t.mainItems[0]:void 0))));function getCounts(e){let t={};for(var n of e)t[n]=t[n]?t[n]+1:1;return t}function getMaxContinuousAndMainItems(t){let n=1,s=1,i=0;for(let e=0;e<t.length-1;e++)t[e]-t[e+1]==1?(s++,n=s>n?s:n,i=e+1):s=1;return[t.slice(i-n+1,i+1),n]}function getSuitableCardsArr(t,n){let s=1;const i=[];for(let e=0;e<t.length-1;e++)t[e]-t[e+1]==1?(s++,s>=n&&i.push(t.slice(e-n+2,e+2))):s=1;return i}function hasBiggerThanDesktopWithSameType(e,s){if([cardsRules.SINGLE,cardsRules.DOUBLE,cardsRules.TRIPLE,cardsRules.NORMAL_BOMB].includes(s.type)){const n=Object.entries(getCounts(e)).filter(([e,t])=>parseInt(e)>s.mainItems[0]&&t>=s.type.limit).map(([e])=>parseInt(e)).sort((e,t)=>t-e),i=[];return n.forEach(t=>{const n=[];for(let e=0;e<s.type.limit;e++)n.push(t);i.push(n)}),!!i.length&&i}if([cardsRules.SINGLE_BELT,cardsRules.DOUBLE_BELT,cardsRules.TRIPLE_BELT].includes(s.type)){var t=Object.entries(getCounts(e)).filter(([e,t])=>parseInt(e)>s.mainItems[s.mainItems.length-1]&&t>=s.type.limit).map(([e])=>parseInt(e)).sort((e,t)=>t-e);const r=[],l=getSuitableCardsArr(t,s.mainItems.length);return l.forEach(e=>{const n=[];e.forEach(t=>{for(let e=0;e<s.type.limit;e++)n.push(t)}),r.push(n)}),!!r.length&&r}if(s.type===cardsRules.THREE_PULL_ONE){const a=Object.entries(getCounts(e)),u=a.filter(([e,t])=>parseInt(e)>s.mainItems[0]&&t>=s.type.limit).map(([e])=>parseInt(e)).sort((e,t)=>t-e);if(!u.length)return!1;const numberWithOneCount=a.filter(([,e])=>1===e).map(([e])=>parseInt(e)).sort((e,t)=>e-t);if(!numberWithOneCount.length)return!1;const o=[];return u.forEach(e=>{o.push([e,e,e,numberWithOneCount[0]].sort((e,t)=>t-e))}),o}if(s.type===cardsRules.THREE_PULL_TWO){const d=Object.entries(getCounts(e)),c=d.filter(([e,t])=>parseInt(e)>s.mainItems[0]&&t>=s.type.limit).map(([e])=>parseInt(e)).sort((e,t)=>t-e);if(!c.length)return!1;const m=d.filter(([,e])=>1===e).map(([e])=>parseInt(e)).sort((e,t)=>e-t);if(!m.length)return!1;const p=[];return c.forEach(e=>{p.push([e,e,e,m[0],m[0]].sort((e,t)=>t-e))}),p}if(s.type===cardsRules.FOUR_PULL_TWO_SINGLE){const h=Object.entries(getCounts(e)),I=h.filter(([e,t])=>parseInt(e)>s.mainItems[0]&&t>=s.type.limit).map(([e])=>parseInt(e)).sort((e,t)=>t-e);if(!I.length)return!1;const numberWithOneCount=h.filter(([,e])=>1===e).map(([e])=>parseInt(e)).sort((e,t)=>e-t);if(numberWithOneCount.length<2)return!1;const L=[];return I.forEach(e=>{L.push([e,e,e,e,numberWithOneCount[0],numberWithOneCount[1]].sort((e,t)=>t-e))}),L}if(s.type===cardsRules.FOUR_PULL_TWO_DOUBLE){const g=Object.entries(getCounts(e)),f=g.filter(([e,t])=>parseInt(e)>s.mainItems[0]&&t>=s.type.limit).map(([e])=>parseInt(e)).sort((e,t)=>t-e);if(!f.length)return!1;const T=g.filter(([,e])=>2===e).map(([e])=>parseInt(e)).sort((e,t)=>e-t);if(numberWithOneCount.length<2)return!1;const E=[];return f.forEach(e=>{E.push([e,e,e,e,T[0],T[1]].sort((e,t)=>t-e))}),E}if(s.type===cardsRules.AIRPLANE_PULL_SINGLE){const R=Object.entries(getCounts(e));t=R.filter(([e,t])=>parseInt(e)>s.mainItems[s.mainItems.length-1]&&t>=s.type.limit).map(([e])=>parseInt(e)).sort((e,t)=>t-e);if(t.length<s.mainItems.length)return!1;const B=getSuitableCardsArr(t,s.mainItems.length);if(!B.length)return!1;const numberWithOneCount=R.filter(([,e])=>1===e).map(([e])=>parseInt(e)).sort((e,t)=>e-t);if(numberWithOneCount.length<s.mainItems.length)return!1;const _=[];return B.forEach(e=>{const t=[];e.forEach(e=>{t.push(e,e,e)}),_.push([...t,...numberWithOneCount.slice(0,B.length)])}),_}if(s.type===cardsRules.AIRPLANE_PULL_DOUBLE){const O=Object.entries(getCounts(e));e=O.filter(([e,t])=>parseInt(e)>s.mainItems[s.mainItems.length-1]&&t>=s.type.limit).map(([e])=>parseInt(e)).sort((e,t)=>t-e);if(e.length<s.mainItems.length)return!1;const N=getSuitableCardsArr(e,s.mainItems.length);if(!N.length)return!1;const P=O.filter(([,e])=>2===e).map(([e])=>parseInt(e)).sort((e,t)=>e-t);if(numberWithOneCount.length<s.mainItems.length)return!1;const U=[],b=P.slice(0,N.length),A=[];return b.forEach(e=>{A.push(e,e)}),N.forEach(e=>{const t=[];e.forEach(e=>{t.push(e,e,e)}),U.push([...t,...A])}),U}if(s.type===cardsRules.BIG_BOMB)return!1}const hasCardsBiggerThanDesktop=(e,t)=>{console.log("🔸🔸🔸正在选牌🔸🔸🔸");t=hasBiggerThanDesktopWithSameType(e,t);return t||[]},getCardsTypeAndMainItems=t=>{const n=[[isSingleThenId,cardsRules.SINGLE],[isDoubleThenId,cardsRules.DOUBLE],[isTripleThenId,cardsRules.TRIPLE],[isNormalBombThenId,cardsRules.NORMAL_BOMB],[isSingleBeltThenId,cardsRules.SINGLE_BELT],[isDoubleBeltThenId,cardsRules.DOUBLE_BELT],[isTripleBeltThenId,cardsRules.TRIPLE_BELT],[isThreePullOneThenId,cardsRules.THREE_PULL_ONE],[isThreePullTwoThenId,cardsRules.THREE_PULL_TWO],[isFourPullTwoSingleThenId,cardsRules.FOUR_PULL_TWO_SINGLE],[isFourPullTwoDoubleThenId,cardsRules.FOUR_PULL_TWO_DOUBLE],[isAirplanePullSingleThenId,cardsRules.AIRPLANE_PULL_SINGLE],[isAirplanePullDoubleThenId,cardsRules.AIRPLANE_PULL_DOUBLE],[isBigBombThenId,cardsRules.BIG_BOMB]];let s=cardsRules.INVALID,i=[];for(let e=0;e<n.length;e++){var[r,l]=n[e][0](t);if(r){s=n[e][1],i=l;break}}return{type:s,mainItems:i}};function isSingleThenId(e){return[1===e.length,[e[0]]]}function isDoubleThenId(e){return[2===e.length&&e[0]===e[1],[e[0]]]}function isTripleThenId(e){return[3===e.length&&e[0]===e[1]&&e[0]===e[2],[e[0]]]}function isNormalBombThenId(e){return[4===e.length&&e[0]===e[2]&&e[0]===e[1]&&e[2]===e[3],[e[0]]]}function isSingleBeltThenId(t){if(t.length<5||14<t[0])return[!1];for(let e=0;e<t.length-1;e++)if(t[e]-t[e+1]!=1)return[!1];return[!0,t]}function isDoubleBeltThenId(t){if(t.length<6||14<t[0]||t.length%2!=0)return[!1];for(let e=0;e<t.length-2;e+=2)if(t[e]-t[e+2]!=1||t[e]!==t[e+1])return[!1];return isDoubleThenId(t.slice(-2))[0]?[!0,t.filter((e,t)=>{})]:[!1]}function isTripleBeltThenId(t){if(t.length<6||14<t[0]||t.length%3!=0)return[!1];for(let e=0;e<t.length-3;e+=3)if(t[e]-t[e+3]!=1||t[e]!==t[e+1]||t[e]!==t[e+2])return[!1];return isTripleThenId(t.slice(-3))[0]?[!0,t.filter((e,t)=>{})]:[!1]}function isThreePullOneThenId(e){return 4!=e.length?[!1]:e[0]===e[1]&&e[0]===e[2]&&e[0]!==e[3]?[!0,[e[0]]]:e[1]===e[2]&&e[1]===e[3]&&e[0]!==e[1]?[!0,[e[1]]]:[!1]}function isThreePullTwoThenId(e){return 5!=e.length?[!1]:e[0]===e[1]&&e[0]===e[2]&&e[3]===e[4]?[!0,[e[0]]]:e[0]===e[1]&&e[2]===e[3]&&e[2]===e[4]?[!0,[e[2]]]:[!1]}function isFourPullTwoSingleThenId(e){let t=Object.entries(getCounts(e)).filter(([,e])=>4===e).map(([e])=>parseInt(e));e=e.filter(e=>!t.includes(e));return 1!==t.length||2!==e.length?[!1]:[!0,[t]]}function isFourPullTwoDoubleThenId(e){let t=Object.entries(getCounts(e)).filter(([,e])=>4===e).map(([e])=>parseInt(e));const n=e.filter(e=>!t.includes(e));return 1===t.length&&4===n.length&&isDoubleThenId(n.slice(0,2))[0]&&isDoubleThenId(n.slice(2))[0]?[!0,[t]]:[!1]}function isAirplanePullSingleThenId(e){if(isTripleBeltThenId(e)[0])return[!1];var t=Object.entries(getCounts(e)).filter(([,e])=>3===e).map(([e])=>parseInt(e)).sort((e,t)=>t-e);if(t.length<2)return[!1];var[n,t]=getMaxContinuousAndMainItems(t);if(t<2)return[!1];e=e.length-3*t;return e%t!=0||e/t!=1?[!1]:[!0,n]}function isAirplanePullDoubleThenId(e){if(isTripleBeltThenId(e)[0])return[!1];var t=Object.entries(getCounts(e)).filter(([,e])=>3===e).map(([e])=>parseInt(e)).sort((e,t)=>t-e);if(t.length<2)return[!1];let[n,s]=getMaxContinuousAndMainItems(t);if(s<2)return[!1];t=e.length-3*s;if(t%s!=0)return[!1];var i=e.filter(e=>!n.includes(e));if(t/s!=2)return[!1];for(let e=0;e<i.length;e+=2)if(i[e]!==i[e+1])return[!1];return[!0,n]}function isBigBombThenId(e){return[2===e.length&&100===e[0]&&99===e[1],e]}export{cardsRules as cardsRules,isBiggerThanDesktopCards as isBiggerThanDesktopCards,hasCardsBiggerThanDesktop as hasCardsBiggerThanDesktop,getCardsTypeAndMainItems as getCardsTypeAndMainItems};