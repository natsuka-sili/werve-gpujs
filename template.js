//初期化
const canvas = document.getElementById("lifegame");

const gpu = new GPU({canvas: canvas});

const s = 720

const life = gpu.createKernel(function(board) {
  //現在位置とワールドの大きさ、集計用の変数
  const x = this.thread.x;
  const y = this.thread.y;
  const l = this.constants.size;
  let sum = 0;
  //盤面の端なら絶対死亡
  if(x==0||y==0||x==l-1||y==l-1){
    return 0;
  }
  //周囲八マスの生きているセルを集計
  sum = board[y-1][x-1] + board[y-1][x  ] + board[y-1][x+1] +
        board[y  ][x-1]                   + board[y  ][x+1] +
        board[y+1][x-1] + board[y+1][x  ] + board[y+1][x+1];
  //ルールに照らし合わせて生死を判断（1が生、0が死）
  if(board[y][x]==1&&(sum==2||sum==3)){
    return 1;
  }
  if(board[y][x]==0&&sum==3){
    return 1;
  }
  return 0;
}, {
  constants: { size: s },
  output: [s,s]
}); 

//描画用
const render = gpu.createKernel(function(board) {
  this.color(
    board[this.thread.y][this.thread.x],
    board[this.thread.y][this.thread.x],
    board[this.thread.y][this.thread.x],
  1);
}, {
  output: [s,s],
  graphical:true
});

//盤面を作る
let board = [];
for (let i = 0; i < s; i++) {
  let p = [];
  for (let j = 0; j < s; j++) {
    p.push(Math.round(Math.random()));
  }
  board.push(p);
}

//fps60で計算と描画
var fps = 60;
setInterval(function(){
  board = life(board);
  render(board);
},1000/fps);