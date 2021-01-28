// 测试成功！
// 写法可能不太规范，但是我已经利用await达到了自己的目的。
// 把手写的promise当作一个间隔控制器了

const oldArr = [1, 2, 3, 4, 5];
const newArr = [];

function waiting(duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration * 1000);
  });
}

async function allSteps(oldArr, newArr) {
  let length = oldArr.length;
  for (let i = 0; i < length; i++) {
    await waiting(3);
    let item = oldArr.shift();
    console.log(item);
    newArr.push(item);
  }
  return [oldArr, newArr];
}
allSteps(oldArr, newArr).then(console.log);
// console.log(oldArr);
// console.log(newArr);
