export const cardsRules = {
  INVALID: {
    id: 0,
    limit: -1,
    audioFileName: '',
    description: '无效的牌',
    example: '876, 9998877',
  },
  BIG_BOMB: {
    id: 1,
    limit: -1,
    audioFileName: 'bigBomb',
    description: '王炸',
    example: '对王(唯一code: 99 100)',
  },
  NORMAL_BOMB: {
    id: 2,
    limit: 4,
    audioFileName: 'normalBomb',
    description: '四张(炸弹)',
    example: '尖炸(code: 14 14 14 14)',
  },
  SINGLE: {
    id: 3,
    limit: 1,
    audioFileName: 'singleCard/',
    description: '单张',
    example: '[ J (code:11),  2(code:80) ]',
  },
  DOUBLE: {
    id: 4,
    limit: 2,
    audioFileName: 'doubleCards/',
    description: '对张',
    example: '对8(code: 80 80)',
  },
  TRIPLE: {
    id: 5,
    limit: 3,
    audioFileName: 'default',
    description: '三张(单纯三张)',
    example: '3个7(code: 7 7 7 )',
  },
  THREE_PULL_ONE: {
    id: 6,
    limit: 3,
    audioFileName: 'default',

    description: '三带一',
    example: '5带3(code: 5 5 5 3)',
  },
  THREE_PULL_TWO: {
    id: 7,
    limit: 3,
    audioFileName: 'default',

    description: '三带二',
    example: '八带对九(code: 8 8 8 9 9)',
  },
  FOUR_PULL_TWO_SINGLE: {
    id: 8,
    limit: 4,
    audioFileName: 'default',

    description: '四带两个单(不算炸弹)',
    example: '四个4带个8和Q(code: 4 4 4 4 8 12)',
  },
  FOUR_PULL_TWO_DOUBLE: {
    id: 9,
    limit: 4,
    audioFileName: 'default',

    description: '四带两个对(不算炸弹)',
    example: '四个5带对4和对3',
  },
  SINGLE_BELT: {
    id: 10,
    limit: 1,
    audioFileName: 'singleBelt',
    description: '单连牌(长度>=5)',
    example: '顺子4-10(code: 4 5 6 7 8 9 10)',
  },
  DOUBLE_BELT: {
    id: 11,
    limit: 2,
    audioFileName: 'doubleBelt',
    description: '连对(长度>=6)',
    example: 'J-K连对(code: 11 11 12 12 13 13)',
  },
  TRIPLE_BELT: {
    id: 12,
    limit: 3,
    audioFileName: 'default',
    description: '三顺(长度>=6)',
    example: '444555(code: 4 4 4 5 5 5)',
  },
  AIRPLANE_PULL_SINGLE: {
    id: 13,
    limit: 3,
    audioFileName: 'airplane',

    description: '飞机带翅膀(single)',
    example: '77788846(code: 7 7 7 8 8 8 4 6)',
  },
  AIRPLANE_PULL_DOUBLE: {
    id: 14,
    limit: 3,
    audioFileName: 'airplane',

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
function getCounts(cards) {
  let counts = {};
  for (let card of cards) {
    counts[card] = counts[card] ? counts[card] + 1 : 1;
  }
  return counts;
}
function getMaxContinuousAndMainItems(cards) {
  // Get the longest continuous cards combined by card whose count equals 3.
  // (Assume player perfers to put up longest airplane cards, or there is more complex.
  // actually cards like '888777666555' is the most hard cards to handle, but for brief, fn return false at the beginning.)
  let maxContinuous = 1;
  let currentContinuous = 1;
  let mainLastIndex = 0;
  for (let i = 0; i < cards.length - 1; i++) {
    if (cards[i] - cards[i + 1] === 1) {
      currentContinuous++;
      maxContinuous =
        currentContinuous > maxContinuous ? currentContinuous : maxContinuous;
      mainLastIndex = i + 1;
    } else {
      currentContinuous = 1;
    }
  }
  const mainItems = cards.slice(
    mainLastIndex - maxContinuous + 1,
    mainLastIndex + 1
  );
  return [mainItems, maxContinuous];
}
function getSuitableCardsArr(propArr, size) {
  // 找到数组中连续长度等于size的【所有】牌组，

  let continuousCount = 1;
  const suitableCardsArr = [];
  for (let i = 0; i < propArr.length - 1; i++) {
    if (propArr[i] - propArr[i + 1] === 1) {
      continuousCount++;
      if (continuousCount >= size) {
        suitableCardsArr.push(propArr.slice(i - size + 2, i + 2));
      }
    } else {
      continuousCount = 1;
    }
  }
  return suitableCardsArr;
}
function hasBiggerThanDesktopWithSameType(playerCards, desktopCardsInfo) {
  // 机器出牌与人出牌的最大不同是：
  // 👴人可以主动选牌，然后将选中的牌与场上的牌比较。
  // 🤖机器人无法主动选牌，倒是之后的比较功能可以复用一点点。

  // Q:机器人的选牌可以依靠随意组合得到，然后与场上的牌比较吗？
  // A：否，资源消耗太大，不具备可行性。
  // 此时必须要依靠 programmer(我) 的智力进行剪枝。

  // 机器人暂定出牌方式为鲁莽型，表现为：不留牌、拆牌、攻击友军、为了出牌不惜破坏自己的连牌。

  if (
    [
      cardsRules.SINGLE,
      cardsRules.DOUBLE,
      cardsRules.TRIPLE,
      cardsRules.NORMAL_BOMB,
    ].includes(desktopCardsInfo.type)
  ) {
    // Convert counts obj to array for more convient operation like 'sort'.
    const countsArr = Object.entries(getCounts(playerCards))
      .filter(
        ([prop, count]) =>
          parseInt(prop) > desktopCardsInfo.mainItems[0] &&
          count >= desktopCardsInfo.type.limit
      )
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => b - a);

    const suitableCardsArr = [];
    countsArr.forEach(item => {
      const suitableCards = [];
      for (let i = 0; i < desktopCardsInfo.type.limit; i++) {
        suitableCards.push(item);
      }
      suitableCardsArr.push(suitableCards);
    });

    return suitableCardsArr.length ? suitableCardsArr : false;
  }

  if (
    [
      cardsRules.SINGLE_BELT,
      cardsRules.DOUBLE_BELT,
      cardsRules.TRIPLE_BELT,
    ].includes(desktopCardsInfo.type)
  ) {
    const countsArr = Object.entries(getCounts(playerCards))
      .filter(
        ([prop, count]) =>
          parseInt(prop) >
            desktopCardsInfo.mainItems[desktopCardsInfo.mainItems.length - 1] &&
          count >= desktopCardsInfo.type.limit
      )
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => b - a);

    const suitableCardsArr = [];
    const mainItems = getSuitableCardsArr(
      countsArr,
      desktopCardsInfo.mainItems.length
    );
    // 如果为单顺子，那么mainItems则可能为[ [10,9,8,7,6], [9,8,7,6,5], [8,7,6,5,4] ]
    mainItems.forEach(cards => {
      const suitableCards = [];
      /// cards为 [10,9,8,7,6]

      cards.forEach(item => {
        for (let i = 0; i < desktopCardsInfo.type.limit; i++) {
          suitableCards.push(item);
        }
      });
      // suitableCards为[10,9,8,7,6]

      suitableCardsArr.push(suitableCards);
    });

    return suitableCardsArr.length ? suitableCardsArr : false;
  }

  if (desktopCardsInfo.type === cardsRules.THREE_PULL_ONE) {
    const countEntries = Object.entries(getCounts(playerCards));

    // 得到大于场上3带1主元素(desktopInfo.mainItems[0])的牌的数组。
    const numberWithThreeCount = countEntries
      .filter(
        ([prop, count]) =>
          parseInt(prop) > desktopCardsInfo.mainItems[0] &&
          count >= desktopCardsInfo.type.limit
      )
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => b - a);

    if (!numberWithThreeCount.length) {
      return false;
    }
    // 为每一个主元素配单牌、此处单牌先设置为最小size为1的单牌吧。这点后面应该会变

    // 单牌升序
    const numberWithOneCount = countEntries
      .filter(([, count]) => count === 1)
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => a - b);

    if (!numberWithOneCount.length) return false;

    const suitableCardsArr = [];
    numberWithThreeCount.forEach(v => {
      suitableCardsArr.push(
        [v, v, v, numberWithOneCount[0]].sort((a, b) => b - a)
      );
    });

    return suitableCardsArr;
  }

  if (desktopCardsInfo.type === cardsRules.THREE_PULL_TWO) {
    const countEntries = Object.entries(getCounts(playerCards));

    // 得到大于场上3带2主元素(desktopInfo.mainItems[0])的牌的数组。
    const numberWithThreeCount = countEntries
      .filter(
        ([prop, count]) =>
          parseInt(prop) > desktopCardsInfo.mainItems[0] &&
          count >= desktopCardsInfo.type.limit
      )
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => b - a);

    if (!numberWithThreeCount.length) {
      return false;
    }

    const numberWithTwoCount = countEntries
      .filter(([, count]) => count === 1)
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => a - b);

    if (!numberWithTwoCount.length) return false;

    const suitableCardsArr = [];
    numberWithThreeCount.forEach(v => {
      suitableCardsArr.push(
        [v, v, v, numberWithTwoCount[0], numberWithTwoCount[0]].sort(
          (a, b) => b - a
        )
      );
    });

    return suitableCardsArr;
  }
  if (desktopCardsInfo.type === cardsRules.FOUR_PULL_TWO_SINGLE) {
    const countEntries = Object.entries(getCounts(playerCards));

    const numberWithFourCount = countEntries
      .filter(
        ([prop, count]) =>
          parseInt(prop) > desktopCardsInfo.mainItems[0] &&
          count >= desktopCardsInfo.type.limit
      )
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => b - a);

    if (!numberWithFourCount.length) {
      return false;
    }

    // 单牌升序
    const numberWithOneCount = countEntries
      .filter(([, count]) => count === 1)
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => a - b);

    if (numberWithOneCount.length < 2) return false;

    const suitableCardsArr = [];
    numberWithFourCount.forEach(v => {
      suitableCardsArr.push(
        [v, v, v, v, numberWithOneCount[0], numberWithOneCount[1]].sort(
          (a, b) => b - a
        )
      );
    });

    return suitableCardsArr;
  }
  if (desktopCardsInfo.type === cardsRules.FOUR_PULL_TWO_DOUBLE) {
    const countEntries = Object.entries(getCounts(playerCards));

    const numberWithFourCount = countEntries
      .filter(
        ([prop, count]) =>
          parseInt(prop) > desktopCardsInfo.mainItems[0] &&
          count >= desktopCardsInfo.type.limit
      )
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => b - a);

    if (!numberWithFourCount.length) {
      return false;
    }

    // 单牌升序
    const numberWithTwoCount = countEntries
      .filter(([, count]) => count === 2)
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => a - b);

    if (numberWithOneCount.length < 2) return false;

    const suitableCardsArr = [];
    numberWithFourCount.forEach(v => {
      suitableCardsArr.push(
        [v, v, v, v, numberWithTwoCount[0], numberWithTwoCount[1]].sort(
          (a, b) => b - a
        )
      );
    });

    return suitableCardsArr;
  }
  if (desktopCardsInfo.type === cardsRules.AIRPLANE_PULL_SINGLE) {
    const countEntries = Object.entries(getCounts(playerCards));

    const numberWithThreeCount = countEntries
      .filter(
        ([prop, count]) =>
          parseInt(prop) >
            desktopCardsInfo.mainItems[desktopCardsInfo.mainItems.length - 1] &&
          count >= desktopCardsInfo.type.limit
      )
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => b - a);

    if (numberWithThreeCount.length < desktopCardsInfo.mainItems.length) {
      return false;
    }

    // 飞机中的三连主牌组合。
    const mainCardsArr = getSuitableCardsArr(
      numberWithThreeCount,
      desktopCardsInfo.mainItems.length
    );

    if (!mainCardsArr.length) {
      return false;
    }

    // 暂为 count ==1 的纯单牌，在飞机中可能真的不好找。
    const numberWithOneCount = countEntries
      .filter(([, count]) => count === 1)
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => a - b);

    if (numberWithOneCount.length < desktopCardsInfo.mainItems.length) {
      return false;
    }

    const suitableCardsArr = [];
    mainCardsArr.forEach(cards => {
      const mainItems = [];
      cards.forEach(item => {
        mainItems.push(item, item, item);
      });
      suitableCardsArr.push([
        ...mainItems,
        ...numberWithOneCount.slice(0, mainCardsArr.length),
      ]);
    });

    return suitableCardsArr;
  }
  if (desktopCardsInfo.type === cardsRules.AIRPLANE_PULL_DOUBLE) {
    const countEntries = Object.entries(getCounts(playerCards));

    const numberWithThreeCount = countEntries
      .filter(
        ([prop, count]) =>
          parseInt(prop) >
            desktopCardsInfo.mainItems[desktopCardsInfo.mainItems.length - 1] &&
          count >= desktopCardsInfo.type.limit
      )
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => b - a);

    if (numberWithThreeCount.length < desktopCardsInfo.mainItems.length) {
      return false;
    }

    // 飞机中的三连主牌组合。
    const mainCardsArr = getSuitableCardsArr(
      numberWithThreeCount,
      desktopCardsInfo.mainItems.length
    );

    if (!mainCardsArr.length) {
      return false;
    }

    // 暂为 count ==2 的纯对牌
    const numberWithTwoCount = countEntries
      .filter(([, count]) => count === 2)
      .map(([prop]) => parseInt(prop))
      .sort((a, b) => a - b);

    if (numberWithOneCount.length < desktopCardsInfo.mainItems.length) {
      return false;
    }

    // 最终结果数组
    const suitableCardsArr = [];

    // 副元素数组
    const suitableSecondaryArr = numberWithTwoCount.slice(
      0,
      mainCardsArr.length
    );
    // 副元素完全体
    const secondaryItems = [];
    suitableSecondaryArr.forEach(item => {
      secondaryItems.push(item, item);
    });

    mainCardsArr.forEach(cards => {
      const mainItems = [];
      cards.forEach(item => {
        mainItems.push(item, item, item);
      });
      // 最终结果将主元素完全体和副元素完全体组合到一起
      suitableCardsArr.push([...mainItems, ...secondaryItems]);
    });

    return suitableCardsArr;
  }
  if (desktopCardsInfo.type === cardsRules.BIG_BOMB) {
    return false;
  }
}

export const hasCardsBiggerThanDesktop = (playerCards, desktopCardsInfo) => {
  // 返回 *所有* 可能的牌组组合
  console.log('🔸🔸🔸正在选牌🔸🔸🔸');

  const suitableCardsArr = hasBiggerThanDesktopWithSameType(
    playerCards,
    desktopCardsInfo
  );

  if (suitableCardsArr) {
    return suitableCardsArr;
  } else {
    // TODO：出大牌，炸弹或者王炸。
    return [];
    // return
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
  return [
    true,
    arr.filter((v, i) => {
      i % 2 === 0;
    }),
  ];
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
  return [
    true,
    arr.filter((v, i) => {
      i % 3 === 0;
    }),
  ];
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
  let mainItem = Object.entries(getCounts(arr))
    .filter(([, count]) => count === 4)
    .map(([prop]) => parseInt(prop));

  const restCards = arr.filter(v => !mainItem.includes(v));

  if (mainItem.length !== 1 || restCards.length !== 2) {
    return [false];
  }

  return [true, [mainItem]];
}
function isFourPullTwoDoubleThenId(arr) {
  let mainItem = Object.entries(getCounts(arr))
    .filter(([, count]) => count === 4)
    .map(([prop]) => parseInt(prop));

  const restCards = arr.filter(v => !mainItem.includes(v));

  if (
    mainItem.length !== 1 ||
    restCards.length !== 4 ||
    !isDoubleThenId(restCards.slice(0, 2))[0] ||
    !isDoubleThenId(restCards.slice(2))[0]
  ) {
    return [false];
  }

  return [true, [mainItem]];
}

function isAirplanePullSingleThenId(arr) {
  // haha, tower defense mode I call it.

  if (isTripleBeltThenId(arr)[0]) {
    return [false];
  }

  const numberWithThreeCount = Object.entries(getCounts(arr))
    .filter(([, count]) => count === 3)
    .map(([prop]) => parseInt(prop))
    .sort((a, b) => b - a);

  // 飞机主元素的长度 <= numberWithThreeCount.length
  if (numberWithThreeCount.length < 2) {
    return [false];
  }

  let [mainItems, groupCount] = getMaxContinuousAndMainItems(
    numberWithThreeCount
  );

  if (groupCount < 2) return [false];

  let restCardCount = arr.length - groupCount * 3;

  if (restCardCount % groupCount !== 0 || restCardCount / groupCount !== 1) {
    return [false];
  }

  return [true, mainItems];
}

function isAirplanePullDoubleThenId(arr) {
  if (isTripleBeltThenId(arr)[0]) {
    return [false];
  }

  const numberWithThreeCount = Object.entries(getCounts(arr))
    .filter(([, count]) => count === 3)
    .map(([prop]) => parseInt(prop))
    .sort((a, b) => b - a);

  // 飞机主元素的长度 <= numberWithThreeCount.length。
  if (numberWithThreeCount.length < 2) {
    return [false];
  }

  let [mainItems, groupCount] = getMaxContinuousAndMainItems(
    numberWithThreeCount
  );

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
