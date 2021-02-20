function getSuitableCards(propArr, size) {
  let continuousCount = 1;
  const resArr = [];
  for (let i = 0; i < propArr.length - 1; i++) {
    if (propArr[i] - propArr[i + 1] === 1) {
      continuousCount++;
      if (continuousCount >= size) {
        resArr.push(propArr.slice(i - size + 2, i + 2));
      }
    } else {
      // 不连续
      continuousCount = 1;
    }
  }
  return resArr;
}

let arr = [14, 13, 12, 11, 10, 8, 7, 6, 5, 4, 3];
console.log(getSuitableCards(arr, 5));
// 棒棒
