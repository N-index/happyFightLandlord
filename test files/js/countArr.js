function test(cards) {
  let res = {};
  for (let card of cards) {
    res[card] = res[card] ? res[card] + 1 : 1;
  }
  return res;
}

const arr = [99, 88, 77, 77, 2, 1, 99];
const res = test(arr);

function fn(obj) {
  for (let i in obj) {
    console.log(i, obj[i]);
  }
}
fn(res);
