function isTriple(arr) {
  let res = false;
  if (arr.length === 3 && arr[0] === arr[1] && arr[0] === arr[2]) {
    res = true;
  }
  return res;
}
function isTripleBelt(arr) {
  let res = false;
  if (arr.length < 6 || arr[0] > 14 || arr.length % 3 !== 0) {
    return res;
  }
  for (let i = 0; i < arr.length - 3; i += 3) {
    if (
      arr[i] - arr[i + 3] !== 1 ||
      arr[i] !== arr[i + 1] ||
      arr[i] !== arr[i + 2]
    ) {
      return res;
    }
  }
  if (!isTriple(arr.slice(-3))) return res;
  res = true;
  return res;
}

// 写了这么久我发现我声明这个res干嘛，其实没必要的。用false直接退出蛮清晰的。
function isAirplane(arr) {
  if (isTripleBelt(arr)) {
    return false;
  }

  let numberWithThreeCount = (function () {
    const counts = {};
    const numberWithThreeCount = [];
    for (let i = 0; i < arr.length; i++) {
      counts[arr[i]] = arr[i] in counts ? counts[arr[i]] + 1 : 1;
    }
    for (let num in counts) {
      if (counts[num] === 3) numberWithThreeCount.push(num);
    }
    return numberWithThreeCount;
  })();

  // 飞机主元素的长度 <= numberWithThreeCount.length。
  // 如 888777666444 中，numberWithThreeCount是 [8,7,6,4]
  // 但如果掺水后都不行，就退出。
  if (numberWithThreeCount.length < 2) return false;

  // 经过counts处理后，value变成了字符串，所以需要转换回来。
  numberWithThreeCount = numberWithThreeCount
    .map(v => parseInt(v))
    .sort((a, b) => b - a);

  // 检查3个数量的最长连续(默认玩家要出最长的飞机，要继续多想那情况更复杂了)。
  // 更难处理的： 888777666555也可能是飞机（但为了简化处理，这种情况在函数开头已经提前 return false了）
  // 因为闭包的存在，所以IIFE能够取得外面的变量。
  let [mainItems, groupCount] = (function () {
    let maxContinuous = 1;
    let currentContinuous = 1;
    let mainLastIndex = 0;
    for (let i = 0; i < numberWithThreeCount.length - 1; i++) {
      if (numberWithThreeCount[i] - numberWithThreeCount[i + 1] === 1) {
        currentContinuous++;
        maxContinuous =
          currentContinuous > maxContinuous ? currentContinuous : maxContinuous;
        mainLastIndex = i + 1;
      } else {
        currentContinuous = 1;
      }
    }
    const mainItems = numberWithThreeCount.slice(
      mainLastIndex - maxContinuous + 1,
      mainLastIndex + 1
    );
    return [mainItems, maxContinuous];
  })();

  if (groupCount < 2) return false;
  // 现在飞机的三连长度为 groupCount，也就是可以分成 groupCount 组 3带1 或者 3带2
  // 数组总长度 arr.length, 三连的总长度 groupCount * 3, 剩余牌的总长度 arr.length - groupCount * 3
  let restCardCount = arr.length - groupCount * 3;
  if (restCardCount % groupCount !== 0) {
    return false;
  }
  let restCards = arr.filter(v => !mainItems.includes(v));
  if (restCardCount / groupCount !== 1 && restCardCount / groupCount !== 2) {
    return false;
  }

  if (restCardCount / groupCount === 2) {
    for (let i = 0; i < restCards.length; i += 2) {
      if (restCards[i] !== restCards[i + 1]) {
        return false;
      }
    }
  }

  return true;
}

let arr = [9, 9, 9, 8, 8, 8, 7, 6];
console.log(isAirplane(arr));
