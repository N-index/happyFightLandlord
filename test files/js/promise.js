const getPromise = function (seconds) {
  return new Promise(function (reslove) {
    setTimeout(reslove, seconds * 1000);
  });
};

// 怎么生成特定长度的链式调用呀？ 我需要写很多个 then, 但这个then的数量是固定的。
// 这不就成代码生成器了。。我试一下 eval
function insertCards() {
  let code = 'getPromise(0.2)';
  for (let i = 0; i < 17; i++) {
    code += `.then(res=>{window.welcome.insertAdjacentHTML('beforeend','<h2>${i}</h2>');console.log('过去了0.2秒'); return getPromise(0.2) })`;
  }
  eval(code);
}
// 哈哈哈，有点搞笑的，竟然成功了。我是个天才吧。
// 话说 这样我就可以抽象出一个工具函数了，这个函数的功能是异步依次调用。可以控制曲线函数，可以控制内部调用的具体参数。
// 有点仙气飘飘的。

// getPromise(0.2)
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(2, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(3, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(4, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(5, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(6, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(7, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(8, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   })
//   .then(res => {
//     mycards.insertAdjacentHTML('beforeend', getCardHTML(9, 'red'));
//     return getPromise(0.2);
//   });
