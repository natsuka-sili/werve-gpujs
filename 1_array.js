const canvas = document.getElementById("verve");
const gpu = new GPU();
const gpuCanvas = new GPU({canvas: canvas});


const make = gpu.createKernel(function() {
  const x = this.thread.x;
  return x;
}, {
  output: [90000]
});


const render = gpuCanvas.createKernel(function(board) {
  const x = board[this.thread.x];
  let color = x*0.005;
  this.color(
    color,
    color,
    color,
    1
    );
}, {
  output: [300,300],
  graphical:true
});



render(make());

