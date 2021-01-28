// 取得最长的连续数字的长度
// 如 [9,8,7,5,4,3,2,11]
// 得到的是4

function test(arr) {
  let max = 1;
  let current = 1;
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] - arr[i + 1] === 1) {
      current++;
      max = current > max ? current : max;
    } else {
      current = 1;
    }
  }
  return max;
}

console.log(test([9, 8, 7, 5, 4, 3, 2, 11, 0, -1, -2, -3, -4, -5]));
