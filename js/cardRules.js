export const cardsRules = {
  INVALID: {
    id: 0,
    description: '无效的牌',
    example: '876, 9998877',
  },
  BIG_BOMB: {
    id: 1,
    description: '王炸',
    example: '对王(唯一code: 99 100)',
  },
  NORMAL_BOMB: {
    id: 2,
    description: '四张(炸弹)',
    example: '尖炸(code: 14 14 14)',
  },
  SINGLE: {
    id: 3,
    description: '单张',
    example: '[ J (code:11),  2(code:80) ]',
  },
  DOUBLE: {
    id: 4,
    description: '对张',
    example: '对8(code: 80 80)',
  },
  TRIPLE: {
    id: 5,
    description: '三张(单纯三张)',
    example: '3个7(code: 7 7 7 )',
  },
  THREE_PULL_ONE: {
    id: 6,
    description: '三带一',
    example: '5带3(code: 5 5 5 3)',
  },
  THREE_PULL_TWO: {
    id: 7,
    description: '三带二',
    example: '八带对九(code: 8 8 8 9 9)',
  },
  FOUR_PULL_TWO_SINGLE: {
    id: 8,
    description: '四带两个单(不算炸弹)',
    example: '四个4带个8和Q(code: 4 4 4 4 8 12)',
  },
  FOUR_PULL_TWO_DOUBLE: {
    id: 9,
    description: '四带两个对(不算炸弹)',
    example: '四个5带对4和对3',
  },
  SINGLE_BELT: {
    id: 10,
    description: '单连牌(长度>=5)',
    example: '顺子4-10(code: 4 5 6 7 8 9 10)',
  },
  DOUBLE_BELT: {
    id: 11,
    description: '连对(长度>=6)',
    example: 'J-K连对(code: 11 11 12 12 13 13)',
  },
  TRIPLE_BELT: {
    id: 12,
    description: '三顺(长度>=6)',
    example: '444555(code: 4 4 4 5 5 5)',
  },
  AIRPLANE_PULL_SINGLE: {
    id: 13,
    description: '飞机带翅膀(single)',
    example: '77788846(code: 7 7 7 8 8 8 4 6)',
  },
  AIRPLANE_PULL_DOUBLE: {
    id: 14,
    description: '飞机带翅膀(double)',
    example: '77788846(code: 7 7 7 8 8 8 4 4 6 6)',
  },
};
export const isBiggerThanDesktopCards = (
  selectedCardsInfo,
  desktopCardsInfo
) => {
  // 场上无牌
  if (
    desktopCardsInfo.cards.length < 1 ||
    desktopCardsInfo.mainItems.length < 1
  ) {
    return true;
  }

  // 通用逻辑--王炸、普通炸弹。
  if (selectedCardsInfo.type === cardsRules.BIG_BOMB) return true;
  if (desktopCardsInfo.type === cardsRules.BIG_BOMB) return false;
  if (
    desktopCardsInfo.type !== cardsRules.NORMAL_BOMB &&
    selectedCardsInfo.type === cardsRules.NORMAL_BOMB
  ) {
    return true;
  }
  if (desktopCardsInfo.type === cardsRules.NORMAL_BOMB) {
    if (selectedCardsInfo.type !== cardsRules.NORMAL_BOMB) return false;
    return selectedCardsInfo.mainItems[0] > desktopCardsInfo.mainItems[0];
  }

  // 除去上面的通用规则，其他情况下 type 必须相同。
  if (selectedCardsInfo.type !== desktopCardsInfo.type) return false;

  // in 操作符检测属性是否在该对象中，并不用来检测一个元素是否在 array 中。这个问题我踩了。
  // 单牌、对牌、三牌
  if (
    [cardsRules.SINGLE, cardsRules.DOUBLE, cardsRules.TRIPLE].includes(
      desktopCardsInfo.type
    )
  ) {
    return selectedCardsInfo.mainItems[0] > desktopCardsInfo.mainItems[0];
  }

  // 顺子，连对，三连
  if (
    [
      cardsRules.SINGLE_BELT,
      cardsRules.DOUBLE_BELT,
      cardsRules.TRIPLE_BELT,
    ].includes(desktopCardsInfo.type)
  ) {
    return (
      selectedCardsInfo.mainItems.length ===
        desktopCardsInfo.mainItems.length &&
      selectedCardsInfo.mainItems[0] > desktopCardsInfo.mainItems[0]
    );
  }

  // 三带一、三带二、四带两张个牌、四带两个对牌
  if (
    [
      cardsRules.THREE_PULL_ONE,
      cardsRules.THREE_PULL_TWO,
      cardsRules.FOUR_PULL_TWO_SINGLE,
      cardsRules.FOUR_PULL_TWO_DOUBLE,
    ].includes(desktopCardsInfo.type)
  ) {
    return selectedCardsInfo.mainItems[0] > desktopCardsInfo.mainItems[0];
  }

  // 飞机带翅膀
  if (
    [cardsRules.AIRPLANE_PULL_SINGLE, cardsRules.AIRPLANE_PULL_DOUBLE].includes(
      desktopCardsInfo.type
    )
  ) {
    return (
      selectedCardsInfo.mainItems.length ===
        desktopCardsInfo.mainItems.length &&
      selectedCardsInfo.mainItems[0] > desktopCardsInfo.mainItems[0]
    );
  }
};

export const getCardsTypeAndMainItems = cards => {
  const fnAndType = [
    [isSingleThenId, cardsRules.SINGLE],
    [isDoubleThenId, cardsRules.DOUBLE],
    [isTripleThenId, cardsRules.TRIPLE],
    [isNormalBombThenId, cardsRules.NORMAL_BOMB],
    [isSingleBeltThenId, cardsRules.SINGLE_BELT],
    [isDoubleBeltThenId, cardsRules.DOUBLE_BELT],
    [isTripleBeltThenId, cardsRules.TRIPLE_BELT],
    [isThreePullOneThenId, cardsRules.THREE_PULL_ONE],
    [isThreePullTwoThenId, cardsRules.THREE_PULL_TWO],
    [isFourPullTwoSingleThenId, cardsRules.FOUR_PULL_TWO_SINGLE],
    [isFourPullTwoDoubleThenId, cardsRules.FOUR_PULL_TWO_DOUBLE],
    [isAirplanePullSingleThenId, cardsRules.AIRPLANE_PULL_SINGLE],
    [isAirplanePullDoubleThenId, cardsRules.AIRPLANE_PULL_DOUBLE],
    [isBigBombThenId, cardsRules.BIG_BOMB],
  ];
  let type = cardsRules.INVALID,
    mainItems = [];
  for (let i = 0; i < fnAndType.length; i++) {
    let [isType, identifier] = fnAndType[i][0](cards);
    if (isType) {
      type = fnAndType[i][1];
      mainItems = identifier;
      break;
    }
  }
  return { type: type, mainItems: mainItems };
};

function isSingleThenId(arr) {
  return [arr.length === 1, [arr[0]]];
}

function isDoubleThenId(arr) {
  return [arr.length === 2 && arr[0] === arr[1], [arr[0]]];
}
function isTripleThenId(arr) {
  return [arr.length === 3 && arr[0] === arr[1] && arr[0] === arr[2], [arr[0]]];
}
function isNormalBombThenId(arr) {
  return [
    arr.length === 4 &&
      arr[0] === arr[2] &&
      arr[0] === arr[1] &&
      arr[2] === arr[3],
    [arr[0]],
  ];
}

function isSingleBeltThenId(arr) {
  if (arr.length < 5 || arr[0] > 14) {
    return [false];
  }
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] - arr[i + 1] !== 1) {
      return [false];
    }
  }
  // 顺子、连对、三连中的identifier 返回arr也是为了更好地比较
  return [true, arr];
}

function isDoubleBeltThenId(arr) {
  if (arr.length < 6 || arr[0] > 14 || arr.length % 2 !== 0) {
    return [false];
  }
  // 根据偶数牌进行判断，
  // 1. 偶数牌与相邻的下一个奇数不同时，错误。
  // 2. 偶数牌与相邻的下一个偶数牌相差不为1时，错误。
  // 3. 检查最后一组是否为 Double
  for (let i = 0; i < arr.length - 2; i += 2) {
    if (arr[i] - arr[i + 2] !== 1 || arr[i] !== arr[i + 1]) {
      return [false];
    }
  }
  if (!isDoubleThenId(arr.slice(-2))[0]) return [false];
  return [true, arr];
}

function isTripleBeltThenId(arr) {
  if (arr.length < 6 || arr[0] > 14 || arr.length % 3 !== 0) {
    return [false];
  }
  for (let i = 0; i < arr.length - 3; i += 3) {
    if (
      arr[i] - arr[i + 3] !== 1 ||
      arr[i] !== arr[i + 1] ||
      arr[i] !== arr[i + 2]
    ) {
      return [false];
    }
  }
  if (!isTripleThenId(arr.slice(-3))[0]) {
    return [false];
  }
  return [true, arr];
}

function isThreePullOneThenId(arr) {
  if (arr.length != 4) {
    return [false];
  }
  // 4444 不是三带一而是💣。此处需要优化，其实需要根据用户的需求和场上牌的内容决定改以什么方式出牌。
  if (arr[0] === arr[1] && arr[0] === arr[2] && arr[0] !== arr[3]) {
    return [true, [arr[0]]];
  }
  if (arr[1] === arr[2] && arr[1] === arr[3] && arr[0] !== arr[1]) {
    return [true, [arr[1]]];
  }
  return [false];
}
function isThreePullTwoThenId(arr) {
  if (arr.length != 5) {
    return [false];
  }
  if (arr[0] === arr[1] && arr[0] === arr[2] && arr[3] === arr[4]) {
    return [true, [arr[0]]];
  }
  if (arr[0] === arr[1] && arr[2] === arr[3] && arr[2] === arr[4]) {
    return [true, [arr[2]]];
  }
  return [false];
}
function isFourPullTwoSingleThenId(arr) {
  let mainItem = (function () {
    const counts = {};
    const numberWithFourCount = [];
    for (let i = 0; i < arr.length; i++) {
      counts[arr[i]] = arr[i] in counts ? counts[arr[i]] + 1 : 1;
    }
    for (let num in counts) {
      if (counts[num] === 4) numberWithFourCount.push(num);
    }
    return numberWithFourCount;
  })();
  if (mainItem.length !== 1) return [false];
  mainItem = mainItem.map(v => parseInt(v));
  const restCards = arr.filter(v => !mainItem.includes(v));
  if (restCards.length !== 2) return [false];

  return [true, [mainItem]];
}
function isFourPullTwoDoubleThenId(arr) {
  let mainItem = (function () {
    const counts = {};
    const numberWithFourCount = [];
    for (let i = 0; i < arr.length; i++) {
      counts[arr[i]] = arr[i] in counts ? counts[arr[i]] + 1 : 1;
    }
    for (let num in counts) {
      if (counts[num] === 4) numberWithFourCount.push(num);
    }
    return numberWithFourCount;
  })();
  if (mainItem.length !== 1) return [false];
  mainItem = mainItem.map(v => parseInt(v));
  const restCards = arr.filter(v => !mainItem.includes(v));
  if (restCards.length !== 4) return [false];

  if (restCards.length === 4) {
    for (let i = 0; i < restCards.length; i += 2) {
      if (restCards[i] !== restCards[i + 1]) {
        return [false];
      }
    }
  }

  return [true, [mainItem]];
}

function isAirplanePullSingleThenId(arr) {
  if (isTripleBeltThenId(arr)[0]) {
    return [false];
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
  if (numberWithThreeCount.length < 2) {
    return [false];
  }

  // 经过counts处理后，value变成了字符串，所以需要转换回来。
  numberWithThreeCount = numberWithThreeCount
    .map(v => parseInt(v))
    .sort((a, b) => b - a);

  // 检查 3 个数量的最长连续(默认玩家要出最长的飞机，要继续多想那情况更复杂了)。
  // 更难处理的： 888777666555也可能是飞机（但为了简化处理，这种情况在函数开头已经提前 return false了）
  // 因为闭包的存在，所以IIFE能够取得外面的变量
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

  if (groupCount < 2) return [false];

  let restCardCount = arr.length - groupCount * 3;
  if (restCardCount % groupCount !== 0) {
    return [false];
  }
  const restCards = arr.filter(v => !mainItems.includes(v));
  if (restCardCount / groupCount !== 1) {
    return [false];
  }

  return [true, mainItems];
}

function isAirplanePullDoubleThenId(arr) {
  if (isTripleBeltThenId(arr)[0]) {
    return [false];
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
  if (numberWithThreeCount.length < 2) {
    return [false];
  }

  // 经过counts处理后，value变成了字符串，所以需要转换回来。
  numberWithThreeCount = numberWithThreeCount
    .map(v => parseInt(v))
    .sort((a, b) => b - a);

  // 检查 3 个数量的最长连续(默认玩家要出最长的飞机，要继续多想那情况更复杂了)。
  // 更难处理的： 888777666555也可能是飞机（但为了简化处理，这种情况在函数开头已经提前 return false了）
  // 因为闭包的存在，所以IIFE能够取得外面的变量
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

  if (groupCount < 2) return [false];

  let restCardCount = arr.length - groupCount * 3;
  if (restCardCount % groupCount !== 0) {
    return [false];
  }
  const restCards = arr.filter(v => !mainItems.includes(v));

  if (restCardCount / groupCount !== 2) {
    return [false];
  }

  // 副元素为 DOUBLE类型 的牌组
  for (let i = 0; i < restCards.length; i += 2) {
    if (restCards[i] !== restCards[i + 1]) {
      return [false];
    }
  }

  return [true, mainItems];
}
function isBigBombThenId(arr) {
  return [arr.length === 2 && arr[0] === 100 && arr[1] === 99, arr];
}
