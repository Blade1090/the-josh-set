// ShelfCheck layout stability pass v1.
// Locks browse/roulette geometry so async cover loads and different title lengths do not move controls.
(()=>{
  const style=document.createElement('style');
  style.textContent=`
/* Main shelf: preserve Art Department cover sizes and reserve their space before images load. */
#results .card{box-sizing:border-box;contain:layout style;}
#results .card>.cover-shell{flex:0 0 auto;box-sizing:border-box;}
#results .card>.top{min-width:0;}
#results .card>.top b{min-width:0;line-height:1.2;}

/* Shelf Roulette: every hand uses identical geometry so PICK FOR ME never jumps. */
.roulette-hand{align-items:stretch;}
.roulette-card{box-sizing:border-box;height:158px;min-height:158px;grid-template-rows:102px 34px;overflow:hidden;}
.roulette-cover{width:76px!important;height:102px!important;min-width:76px;min-height:102px;max-width:76px;max-height:102px;box-sizing:border-box;}
.roulette-info{height:102px;min-height:102px;overflow:hidden;}
.roulette-info b{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;line-height:1.22;min-height:2.44em;}
.roulette-hook{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;max-height:2.7em;}
.roulette-actions{height:34px;align-self:end;}
.roulette-played,.roulette-beaten{height:34px;box-sizing:border-box;padding:6px 5px;}
.roulette-pick-btn,.roulette-deal{box-sizing:border-box;min-height:48px;}

@media(min-width:700px){
  .roulette-hand{align-items:stretch;}
  .roulette-card{height:420px;min-height:420px;display:flex;flex-direction:column;overflow:hidden;}
  .roulette-cover{width:100%!important;height:190px!important;min-width:0;min-height:190px;max-width:none;max-height:190px;}
  .roulette-info{height:156px;min-height:156px;overflow:hidden;width:100%;}
  .roulette-info b{-webkit-line-clamp:2;min-height:2.44em;}
  .roulette-hook{display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden!important;max-height:5.4em;}
  .roulette-actions{height:42px;min-height:42px;margin-top:auto;}
  .roulette-played,.roulette-beaten{height:42px;}
}
`;
  document.head.appendChild(style);
  window.SHELFCHECK_LAYOUT_STABILITY={version:1};
})();
