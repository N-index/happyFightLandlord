import { allCardNumbers } from './allCardNumbers.js';
import {
  cardsRules,
  getCardsTypeAndMainItems,
  isBiggerThanDesktopCards,
  hasCardsBiggerThanDesktop,
} from './cardRules.js';

const waiting = function (duration) {
  return new Promise(resolve => {
    setTimeout(resolve, duration * 1000);
  });
};
const moveOldArrToNewArr = async function (
  oldArr,
  newArr,
  identifier,
  duration
) {
  let len = oldArr.length;
  for (let i = 0; i < len; i++) {
    await waiting(duration);
    // 对不起，这本来是一个通用的工具类函数，但是为了在其他地方改会有点麻烦，所以就为myself定制化一下吧。。
    newArr.push(
      identifier == 'myself'
        ? { number: oldArr[i], isSelected: false, isSelecting: false }
        : oldArr[i]
    );
  }
  return identifier;
};

const app = new Vue({
  el: '#app',
  data: {
    username: 'Joker!',
    shuffledCards: [],

    landLordCardsShuffled: [],
    firstUserCardsShuffled: [],
    myselfUserCardsShuffled: [],
    secondUserCardsShuffled: [],

    firstUserCardsBindedView: [],
    myselfUserCardsBindedView: [],
    secondUserCardsBindedView: [],

    player: ['user-left', 'myself', 'user-right'],
    grabLandlordInfo: {
      currentGrabTurnIndex: -1,

      firstGrabPlayerIndex: -1,
      secondGrabPlayerIndex: -1,
      thirdGrabPlayerIndex: -1,
      grabIndexRecord: null,
      landlordPlayerIndex: -1,
    },
    putUpInfo: {
      currentPutUpTurnIndex: -1,
      firstPutUpPlayerIndex: -1,
      secondPutUpPlayerIndex: -1,
      thirdPutUpPlayerIndex: -1,
      putUpIndexRecord: null,

      history: [],
      bigBombNumber: 0,
      normalBombNumber: 0,
    },
    countdownNumber: {
      grab: 8,
      putUp: 20,
    },
    desktopCardsInfo: {
      ownerIndex: -1,
      cards: [],
      type: {},
      mainItems: [],
    },
    displayStatus: {
      welcome: true,
      stage: false,
      controls: false,
      clock: false,
      deliver: true,
      grabLordland: false,
      putUpGroup: false,
      putUpCards: true,
      notPutUpCards: true,
      countdownOfGrab: false,
      countdownOfPutUp: false,
    },
    gameStatus: [
      'beforeBeginning',
      'afterBeginning',
      'beforeGrabLordland',
      'afterGrabLordland',
      'waitingForLordland',
      'waitingForNextUser',
      'waitingForNextNextUser',
    ],
    cardsSelectionInfo: {
      startIndex: 0,
      endIndex: 0,
      isStartSelecting: false,
    },
    // currentGameStatus: gameStatus[0],
    temp: {
      snatchFn: null,
      notSnatchFn: null,
      putUpFn: null,
      notPutUpFn: null,
    },
  },
  created() {
    this.grabLandlordInfo.firstGrabPlayerIndex = Math.floor(Math.random() * 3);
    this.grabLandlordInfo.secondGrabPlayerIndex =
      (this.grabLandlordInfo.firstGrabPlayerIndex + 1) % 3;
    this.grabLandlordInfo.thirdGrabPlayerIndex =
      (this.grabLandlordInfo.firstGrabPlayerIndex + 2) % 3;
    this.grabLandlordInfo.currentGrabTurnIndex = this.grabLandlordInfo.firstGrabPlayerIndex;
    // 拥有抢地主资格的 playerIndex Set
    this.grabLandlordInfo.grabIndexRecord = new Set([
      this.grabLandlordInfo.firstGrabPlayerIndex,
      this.grabLandlordInfo.secondGrabPlayerIndex,
      this.grabLandlordInfo.thirdGrabPlayerIndex,
    ]);
  },
  methods: {
    enterStage() {
      // 按钮和舞台显隐
      this.displayStatus.welcome = false;
      this.displayStatus.controls = true;
      this.displayStatus.stage = true;
    },
    async startGame() {
      // 按钮显隐
      this.displayStatus.controls = false;
      this.displayStatus.deliver = false;

      // 重置舞台
      this.resetGame();

      // 洗牌、理牌
      this.shuffle();

      // 发牌
      await this.deliverCardsToPlayers();
      this.displayStatus.countdownOfGrab = true;
      this.displayStatus.countdownOfPutUp = false;
      // 抢地主
      await this.grabLandlord();
      console.log(
        `抢完地主，索引是${this.grabLandlordInfo.landlordPlayerIndex}`
      );
      this.desktopCardsInfo.ownerIndex = this.grabLandlordInfo.landlordPlayerIndex;
      this.displayStatus.countdownOfPutUp = true;
      this.displayStatus.countdownOfGrab = false;
      // 发地主牌
      this.deliverCardsToLandlord();

      // 出牌
      await this.startPutUp();
    },
    async startPutUp() {
      // 确定出牌顺序
      this.putUpInfo.firstPutUpPlayerIndex = this.grabLandlordInfo.landlordPlayerIndex;
      this.putUpInfo.secondPutUpPlayerIndex =
        (this.putUpInfo.firstPutUpPlayerIndex + 1) % 3;
      this.putUpInfo.thirdPutUpPlayerIndex =
        (this.putUpInfo.firstPutUpPlayerIndex + 2) % 3;
      this.putUpInfo.putUpIndexRecord = new Set([
        this.putUpInfo.firstPutUpPlayerIndex,
        this.putUpInfo.secondPutUpPlayerIndex,
        this.putUpInfo.thirdPutUpPlayerIndex,
      ]);
      let playerIndex = this.putUpInfo.firstPutUpPlayerIndex;
      while (
        this.firstUserCardsBindedView.length > 0 &&
        this.secondUserCardsBindedView.length > 0 &&
        this.myselfUserCardsBindedView.length > 0
      ) {
        this.putUpInfo.currentPutUpTurnIndex = playerIndex;

        try {
          await Promise.all([
            this.getPutUpResult(playerIndex),
            this.countdownPutUp(),
          ]);
        } catch (err) {
        } finally {
          console.log('\n\n🔵🔵🔵进入下一轮🔵🔵🔵');

          await waiting(1);
          playerIndex = (playerIndex + 1) % 3;
        }
      }
    },
    resetGame() {
      this.desktopCardsInfo = {
        ownerIndex: -1,
        cards: [],
        type: {},
        mainItems: [],
      };
      this.myselfUserCardsBindedView = [];
      this.firstUserCardsBindedView = [];
      this.secondUserCardsBindedView = [];
    },
    shuffle() {
      // 洗牌
      this.shuffledCards = allCardNumbers;
      for (let i = this.shuffledCards.length - 1; i > 0; i--) {
        // 从 [0,a] 中选择一个跟 a 交换
        const j = Math.floor(Math.random() * (i + 1));
        [this.shuffledCards[j], this.shuffledCards[i]] = [
          this.shuffledCards[i],
          this.shuffledCards[j],
        ];
      }
      // 逻辑发牌
      this.firstUserCardsShuffled = this.shuffledCards.slice(0, 17);
      this.secondUserCardsShuffled = this.shuffledCards.slice(17, 34);
      this.myselfUserCardsShuffled = this.shuffledCards.slice(34, -3);

      this.landLordCardsShuffled = this.shuffledCards.slice(-3);

      // 理牌
      this.firstUserCardsShuffled.sort((a, b) => b - a);
      this.secondUserCardsShuffled.sort((a, b) => b - a);
      this.myselfUserCardsShuffled.sort((a, b) => b - a);
    },
    async deliverCardsToPlayers() {
      //箭头函数中this会混乱，所以没用箭头
      let allRes = await Promise.all([
        moveOldArrToNewArr(
          this.firstUserCardsShuffled,
          this.firstUserCardsBindedView,
          'one',
          0.15
        ),
        moveOldArrToNewArr(
          this.secondUserCardsShuffled,
          this.secondUserCardsBindedView,
          'two',
          0.15
        ),
        moveOldArrToNewArr(
          this.myselfUserCardsShuffled,
          this.myselfUserCardsBindedView,
          'myself',
          0.05
        ),
      ]);
    },
    async countdownPutUp() {
      this.countdownNumber.putUp = 20;
      while (this.countdownNumber.putUp > 0) {
        await waiting(1);
        this.countdownNumber.putUp--;
      }
    },
    async countdownGrab() {
      this.countdownNumber.grab = 8;
      // tools
      while (this.countdownNumber.grab > 0) {
        await waiting(1);
        this.countdownNumber.grab--;
      }
    },
    async getGrabResult(playerIndex) {
      // tools
      this.grabLandlordInfo.currentGrabTurnIndex = playerIndex;
      // 按钮显隐
      this.displayStatus.grabLordland = true;
      this.displayStatus.controls = true;
      try {
        //  grabIndexRecord 是淘汰式的。
        await this.getGrabPromise(8);
      } catch (error) {
        // error = reject value = false;
        this.grabLandlordInfo.grabIndexRecord.delete(playerIndex);
      } finally {
        // break the running of grab countdown
        this.countdownNumber.grab = -1;

        // change view status
        this.displayStatus.grabLordland = false;
        this.displayStatus.controls = false;
      }
    },
    async getPutUpResult(playerIndex) {
      this.displayStatus.clock = true;
      this.displayStatus.putUpGroup = true;
      this.displayStatus.controls = true;
      try {
        await this.getPutUpPromise(20, playerIndex);
      } catch (err) {
        console.error(err);
      } finally {
        // breaking the running of putup countdown
        this.countdownNumber.putUp = -1;

        this.displayStatus.putUpGroup = false;
        this.displayStatus.controls = false;
        this.displayStatus.clock = false;
      }
    },
    async grabLandlord() {
      for (let playerIndex of this.grabLandlordInfo.grabIndexRecord) {
        this.displayStatus.clock = true;
        await Promise.all([
          this.getGrabResult(playerIndex),
          this.countdownGrab(),
        ]);
        this.displayStatus.clock = false;

        await waiting(1);
      }
      // 首轮抢地主结果
      switch (this.grabLandlordInfo.grabIndexRecord.size) {
        case 0: {
          // 0人抢地主
          this.grabLandlordInfo.landlordPlayerIndex = this.grabLandlordInfo.firstGrabPlayerIndex;
          break;
        }
        case 1: {
          // 1人抢地主
          for (let playerIndex of this.grabLandlordInfo.grabIndexRecord) {
            this.grabLandlordInfo.landlordPlayerIndex = playerIndex;
          }
          break;
        }
        case 2: {
          if (
            this.grabLandlordInfo.grabIndexRecord.has(
              this.grabLandlordInfo.firstGrabPlayerIndex
            )
          ) {
            // 那就再让地主抢一次
            this.displayStatus.clock = true;

            await Promise.all([
              this.getGrabResult(this.grabLandlordInfo.firstGrabPlayerIndex),
              this.countdownGrab(),
            ]);
            this.displayStatus.clock = false;

            await waiting(1);
            if (
              this.grabLandlordInfo.grabIndexRecord.has(
                this.grabLandlordInfo.firstGrabPlayerIndex
              )
            ) {
              // 默认地主再抢！
              this.grabLandlordInfo.landlordPlayerIndex = this.grabLandlordInfo.firstGrabPlayerIndex;
            } else {
              // 默认地主不抢了！
              for (let playerIndex of this.grabLandlordInfo.grabIndexRecord) {
                this.grabLandlordInfo.landlordPlayerIndex = playerIndex;
              }
            }
          } else {
            // 除默认地主外的剩下2人继续抢地主
            this.displayStatus.clock = true;

            await Promise.all([
              this.getGrabResult(this.grabLandlordInfo.secondGrabPlayerIndex),
              this.countdownGrab(),
            ]);
            this.displayStatus.clock = false;

            await waiting(1);

            // 除默认地主外剩下两人中成功选出地主。
            this.grabLandlordInfo.landlordPlayerIndex = this.grabLandlordInfo.grabIndexRecord.has(
              this.grabLandlordInfo.secondGrabPlayerIndex
            )
              ? this.grabLandlordInfo.secondGrabPlayerIndex
              : this.grabLandlordInfo.thirdGrabPlayerIndex;
          }
          break;
        }
        case 3: {
          this.displayStatus.clock = true;

          await Promise.all([
            this.getGrabResult(this.grabLandlordInfo.firstGrabPlayerIndex),
            this.countdownGrab(),
          ]);
          this.displayStatus.clock = false;

          await waiting(1);
          if (
            this.grabLandlordInfo.grabIndexRecord.has(
              this.grabLandlordInfo.firstGrabPlayerIndex
            )
          ) {
            // 默认地主再抢
            this.grabLandlordInfo.landlordPlayerIndex = this.grabLandlordInfo.firstGrabPlayerIndex;
          } else {
            // 默认地主不抢了
            this.displayStatus.clock = true;

            await Promise.all([
              this.getGrabResult(this.grabLandlordInfo.secondGrabPlayerIndex),
              this.countdownGrab(),
            ]);
            this.displayStatus.clock = false;

            await waiting(1);

            // 除默认地主外剩下两人中成功选出地主。
            this.grabLandlordInfo.landlordPlayerIndex = this.grabLandlordInfo.grabIndexRecord.has(
              this.grabLandlordInfo.secondGrabPlayerIndex
            )
              ? this.grabLandlordInfo.secondGrabPlayerIndex
              : this.grabLandlordInfo.thirdGrabPlayerIndex;
          }
        }
      }
    },
    deliverCardsToLandlord() {
      // 给地主发地主牌
      this.landLordCardsShuffled.forEach(cardNumber => {
        const item =
          this.grabLandlordInfo.landlordPlayerIndex !== 1
            ? cardNumber
            : {
                isSelected: true,
                isSelecting: false,
                number: cardNumber,
              };
        const compareFn =
          this.grabLandlordInfo.landlordPlayerIndex !== 1
            ? (a, b) => b - a
            : (a, b) => b.number - a.number;
        [
          this.firstUserCardsBindedView,
          this.myselfUserCardsBindedView,
          this.secondUserCardsBindedView,
        ][this.grabLandlordInfo.landlordPlayerIndex].push(item);
        [
          this.firstUserCardsBindedView,
          this.myselfUserCardsBindedView,
          this.secondUserCardsBindedView,
        ][this.grabLandlordInfo.landlordPlayerIndex].sort(compareFn);
      });
    },
    getGrabPromise(rejectTime) {
      const snatchElement = this.$refs['snatch-btn'];
      const notSnatchElement = this.$refs['not-snatch-btn'];

      snatchElement.removeEventListener('click', this.temp.snatchFn);
      notSnatchElement.removeEventListener('click', this.temp.notSnatchFn);
      return new Promise(
        function (resolve, reject) {
          const snatchHandler = () => {
            resolve(true);
          };
          const notSnatchHandler = () => {
            reject(false);
          };
          snatchElement.addEventListener('click', snatchHandler);
          notSnatchElement.addEventListener('click', notSnatchHandler);
          this.temp.snatchFn = snatchHandler;
          this.temp.notSnatchFn = notSnatchHandler;
          setTimeout(reject, rejectTime * 1000, false);
        }.bind(this)
      );
    },
    getPutUpPromise(rejectTime, playerIndex) {
      // 此处可以确保当前玩家可以大过自己的牌。
      if (this.desktopCardsInfo.ownerIndex === playerIndex) {
        console.log('一轮出牌完毕后，桌牌所属者拥有初始发牌权。');
        this.desktopCardsInfo.cards = [];
        this.desktopCardsInfo.type = {};
        this.desktopCardsInfo.mainItems = [];
      }

      // ——————————🔻🔻🔻电脑玩家的出牌 Promise🔻🔻🔻——————————
      if (this.putUpInfo.currentPutUpTurnIndex !== 1) {
        return new Promise(
          function (resolve, reject) {
            const isLeader = this.desktopCardsInfo.ownerIndex === playerIndex;
            const setTimeoutFn = function () {
              if (this.putUpCards(playerIndex, isLeader)) {
                this.desktopCardsInfo.ownerIndex = playerIndex;
                resolve(true);
              } else {
                reject(
                  new Error('机器自动出牌，但是没牌打得过场上的牌。所以不出')
                );
              }
            }.bind(this);
            setTimeout(setTimeoutFn, 3000);
          }.bind(this)
        );
      }
      // ——————————🔺🔺🔺电脑玩家的出牌 Promise🔺🔺🔺——————————

      // ——————————🔻🔻🔻活体玩家的出牌 Promise🔻🔻🔻——————————
      const putUpBtn = this.$refs['put-up-btn'];
      const notPutUpBtn = this.$refs['not-put-up-btn'];

      // 因为按钮是复用的，并没有每次都重新创建，所以需要删除并添加新的响应事件
      putUpBtn.removeEventListener('click', this.temp.putUpFn);
      notPutUpBtn.removeEventListener('click', this.temp.notPutUpFn);

      return new Promise(
        function (resolve, reject) {
          const putUpHandler = () => {
            if (this.putUpCards(playerIndex, false)) {
              this.desktopCardsInfo.ownerIndex = playerIndex;
              resolve(true);
            } else {
              // 选择的牌不合规则，不比场上的牌大。
            }
          };

          // 若用户首发牌，则必须出牌
          const isLeader = this.desktopCardsInfo.ownerIndex === playerIndex;
          let notPutUpHandler;
          if (isLeader) {
            this.displayStatus.notPutUpCards = false;
            notPutUpHandler = null;
          } else {
            notPutUpHandler = () => {
              this.notPutUpCards(playerIndex, false);
              reject(new Error('手动不出牌'));
            };
          }

          putUpBtn.addEventListener('click', putUpHandler);
          notPutUpBtn.addEventListener('click', notPutUpHandler);
          this.temp.putUpFn = putUpHandler;
          this.temp.notPutUpFn = notPutUpHandler;

          // 倒计时到期
          setTimeout(msg => {
            const isLeader = this.desktopCardsInfo.ownerIndex === playerIndex;
            console.log(msg);
            this.putUpCards(playerIndex, isLeader);
            (isLeader ? resolve : reject)(isLeader);
          }, rejectTime * 1000);
        }.bind(this)
      );
      // ——————————🔺🔺🔺活体玩家的出牌 Promise🔺🔺🔺——————————
    },
    mousedownHandler(itemIndex, item) {
      this.cardsSelectionInfo.isStartSelecting = true;
      this.cardsSelectionInfo.startIndex = itemIndex;
      this.cardsSelectionInfo.endIndex = itemIndex;
      item.isSelecting = !item.isSelecting;
    },
    mouseupHandler(itemIndex, item) {
      if (this.cardsSelectionInfo.isStartSelecting) {
        this.cardsSelectionInfo.endIndex = itemIndex;
        this.cardsSelectionInfo.isStartSelecting = false;

        // 找出所有处于 selecting 的元素，并
        this.myselfUserCardsBindedView.forEach((myCardItem, index, array) => {
          if (myCardItem.isSelecting) {
            myCardItem.isSelecting = !myCardItem.isSelecting;
            myCardItem.isSelected = !myCardItem.isSelected;
          }
        });
      }
    },
    mouseenterHandler(itemIndex, item) {
      if (this.cardsSelectionInfo.isStartSelecting) {
        if (
          itemIndex > this.cardsSelectionInfo.endIndex &&
          itemIndex >= this.cardsSelectionInfo.startIndex
        ) {
          this.cardsSelectionInfo.endIndex = itemIndex;
          item.isSelecting = !item.isSelecting;
        }
        if (
          itemIndex < this.cardsSelectionInfo.endIndex &&
          itemIndex >= this.cardsSelectionInfo.startIndex
        ) {
          this.myselfUserCardsBindedView[itemIndex + 1].isSelecting = !this
            .myselfUserCardsBindedView[itemIndex + 1].isSelecting;
          this.cardsSelectionInfo.endIndex = itemIndex;
        }
        if (
          itemIndex < this.cardsSelectionInfo.endIndex &&
          itemIndex <= this.cardsSelectionInfo.startIndex
        ) {
          this.cardsSelectionInfo.endIndex = itemIndex;
          item.isSelecting = !item.isSelecting;
        }
        if (
          itemIndex > this.cardsSelectionInfo.endIndex &&
          itemIndex <= this.cardsSelectionInfo.startIndex
        ) {
          this.myselfUserCardsBindedView[itemIndex - 1].isSelecting = !this
            .myselfUserCardsBindedView[itemIndex - 1].isSelecting;

          this.cardsSelectionInfo.endIndex = itemIndex;
        }
      }
    },
    putUpCards: function (playerIndex, isLeader) {
      console.log(`${playerIndex}号玩家开始选牌,isLeader为${isLeader}`);
      let selectedCards;

      if (playerIndex === 1) {
        // ——————————🔻🔻🔻活体玩家选牌🔻🔻🔻——————————
        if (isLeader) {
          // 活体玩家首发牌
          this.myselfUserCardsBindedView.forEach((value, index, array) => {
            value.isSelected = index === array.length - 1 ? true : false;
          });
        }
        selectedCards = this.myselfUserCardsBindedView
          .filter(item => item.isSelected)
          .map(item => item.number);
        // ——————————🔺🔺🔺活体玩家选牌🔺🔺🔺——————————
      } else {
        // ——————————🔻🔻🔻电脑玩家选牌🔻🔻🔻——————————
        // 电脑玩家自动出牌
        if (isLeader) {
          // 轮到机器人首发牌，选择最后一张牌
          selectedCards = [
            [
              this.firstUserCardsBindedView,
              this.myselfUserCardsBindedView,
              this.secondUserCardsBindedView,
            ][playerIndex].slice(-1)[0],
          ];
        } else {
          // 轮到机器人压牌，找出所有合适大小的牌组
          const suitableCardsArr = hasCardsBiggerThanDesktop(
            [
              this.firstUserCardsBindedView,
              this.myselfUserCardsBindedView,
              this.secondUserCardsBindedView,
            ][this.putUpInfo.currentPutUpTurnIndex],
            this.desktopCardsInfo
          );
          console.log(`所有的可行的牌组有：`);
          console.log(suitableCardsArr);
          if (!suitableCardsArr.length) {
            return false;
          }
          selectedCards = suitableCardsArr[suitableCardsArr.length - 1];
        }
        // ——————————🔺🔺🔺电脑玩家选牌🔺🔺🔺——————————
      }
      console.log(`${playerIndex}号玩家选牌完毕：选牌是:`);
      console.log(selectedCards);
      if (!selectedCards.length) {
        console.log('没选牌');
        return false;
      }

      // 提取选牌的主要元素
      const selectedCardsInfo = getCardsTypeAndMainItems(selectedCards);

      if (selectedCardsInfo.type === cardsRules.INVALID) {
        return false;
      }

      if (!isBiggerThanDesktopCards(selectedCardsInfo, this.desktopCardsInfo)) {
        console.log('选牌没有大过上家的，出牌失败');
        return false;
      }

      // ——————————🔻🔻🔻选牌合规，更新桌面状态🔻🔻🔻——————————
      console.log('选牌合规，出牌完毕，更新桌面状态');

      // 出牌成功 这个代码块里是应该是原子操作。应该加锁。相当于转账操作。
      [
        this.desktopCardsInfo.ownerIndex,
        this.desktopCardsInfo.cards,
        this.desktopCardsInfo.type,
        this.desktopCardsInfo.mainItems,
      ] = [
        playerIndex,
        selectedCards,
        selectedCardsInfo.type,
        selectedCardsInfo.mainItems,
      ];
      // ——————————🔺🔺🔺选牌合规，更新桌面状态🔺🔺🔺——————————

      // 出牌
      // 方案1：把当前选中的牌全部删掉。
      // 可能问题：在极端情况下选中的牌与要出的符合规则的牌不同。
      // 解决方案：再判断一次选中牌与要出牌的一致性。不过暂时不考虑这点。
      // 为当前 player 出牌，TODO: 机器人出牌还没有设置。
      if (playerIndex !== 1) {
        // ——————————🔻🔻🔻电脑玩家出牌成功🔻🔻🔻——————————
        selectedCards.forEach(item => {
          [
            this.firstUserCardsBindedView,
            this.myselfUserCardsBindedView,
            this.secondUserCardsBindedView,
          ][playerIndex].splice(
            [
              this.firstUserCardsBindedView,
              this.myselfUserCardsBindedView,
              this.secondUserCardsBindedView,
            ][playerIndex].indexOf(item),
            1
          );
        });
        // ——————————🔺🔺🔺电脑玩家出牌成功🔺🔺🔺——————————
      } else {
        // ——————————🔻🔻🔻活体玩家出牌成功🔻🔻🔻——————————
        this.myselfUserCardsBindedView = this.myselfUserCardsBindedView.filter(
          item => !item.isSelected
        );
        // ——————————🔺🔺🔺活体玩家出牌成功🔺🔺🔺——————————
      }

      return true;
    },
    notPutUpCards(playerIndex, timeout) {
      console.log(`当前第${playerIndex}号玩家不出牌，timeout为${timeout}`);

      if (playerIndex === 1) {
        this.myselfUserCardsBindedView.forEach((myCardItem, index, arr) => {
          if (myCardItem.isSelected) {
            myCardItem.isSelected = false;
          }
        });
      }

      // 播放声音
      // 按钮显隐
    },
  },
});
