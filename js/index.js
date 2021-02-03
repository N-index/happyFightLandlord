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
      putUpCards: false,
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
          console.error(err);
        } finally {
          console.log('---进入下一轮---');

          await waiting(1);
          playerIndex = (playerIndex + 1) % 3;
        }
      }
      console.log('出牌完毕！');
    },
    resetGame() {
      this.desktopCardsInfo = {
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
      console.log(this.firstUserCardsShuffled);
      console.log(this.secondUserCardsShuffled);
      console.log(this.myselfUserCardsShuffled);
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
      console.log('出牌coutdown开始');
      this.countdownNumber.putUp = 20;
      while (this.countdownNumber.putUp > 0) {
        await waiting(1);
        this.countdownNumber.putUp--;
      }
      console.log('出牌coutdown结束');
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
        console.log(error);
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
      this.displayStatus.putUpCards = true;
      this.displayStatus.controls = true;
      try {
        await this.getPutUpPromise(20, playerIndex);
      } catch (err) {
        console.error(err);
      } finally {
        // breaking the running of putup countdown
        this.countdownNumber.putUp = -1;

        this.displayStatus.putUpCards = false;
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
      console.log('抢地主完毕');
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
      // timeout 后自动 reject 的 promise
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
      const putUpBtn = this.$refs['put-up-btn'];
      const notPutUpBtn = this.$refs['not-put-up-btn'];

      putUpBtn.removeEventListener('click', this.temp.putUpFn);
      notPutUpBtn.removeEventListener('click', this.temp.notPutUpFn);

      if (this.putUpInfo.currentPutUpTurnIndex !== 1) {
        return new Promise(
          function (resolve, reject) {
            // 机器人手中是否有比场上牌大的牌。
            hasCardsBiggerThanDesktop(
              [
                this.firstUserCardsBindedView,
                this.myselfUserCardsBindedView,
                this.secondUserCardsBindedView,
              ][this.putUpInfo.currentPutUpTurnIndex],
              this.desktopCardsInfo
            );
            setTimeout(reject, 5000, new Error('测试，电脑自动不出牌'));
          }.bind(this)
        );
      }
      return new Promise(
        function (resolve, reject) {
          const putUpHandler = () => {
            if (this.putUpCards(playerIndex)) {
              // 出牌合规
              console.log('牌合规');
              resolve(true);
            } else {
              console.error('牌不合规');
            }
          };
          const notPutUpHandler = () => {
            this.notPutUpCards();
            reject(new Error('手动不出牌'));
          };

          putUpBtn.addEventListener('click', putUpHandler);
          notPutUpBtn.addEventListener('click', notPutUpHandler);
          this.temp.putUpFn = putUpHandler;
          this.temp.notPutUpFn = notPutUpHandler;
          setTimeout(
            err => {
              this.notPutUpCards();
              reject(err);
            },
            rejectTime * 1000,
            new Error('自动不出牌')
          );
        }.bind(this)
      );
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
    putUpCards: function (playerIndex) {
      console.log('-------');
      console.log('进入到判断出牌逻辑函数');
      console.log(`几号玩家？${playerIndex}`);

      const selectedCards = this.myselfUserCardsBindedView
        .filter(item => item.isSelected)
        .map(item => item.number);

      const selectedCardsInfo = getCardsTypeAndMainItems(selectedCards);

      if (selectedCardsInfo.type === cardsRules.INVALID) {
        console.log('无效的牌组');
        console.log('-----');

        return false;
      }

      if (!isBiggerThanDesktopCards(selectedCardsInfo, this.desktopCardsInfo)) {
        console.log('牌没有大过上家');
        console.log('-----');
        return false;
      }

      // 这个代码块里是应该是原子操作。应该加锁。相当于转账操作。
      // 出牌
      [
        this.desktopCardsInfo.cards,
        this.desktopCardsInfo.type,
        this.desktopCardsInfo.mainItems,
      ] = [selectedCards, selectedCardsInfo.type, selectedCardsInfo.mainItems];

      // 出牌
      // 方案1：把当前选中的牌全部删掉。
      // 可能问题：在极端情况下选中的牌与要出的符合规则的牌不同。
      // 解决方案：再判断一次选中牌与要出牌的一致性。不过暂时不考虑这点。
      this.myselfUserCardsBindedView = this.myselfUserCardsBindedView.filter(
        item => !item.isSelected
      );
      console.log('逻辑正确，出牌成功！');
      console.log('-----');

      return true;
    },
    notPutUpCards() {
      // 清场
      this.desktopCardsInfo = {
        cards: [],
        type: {},
        mainItems: [],
      };
      this.myselfUserCardsBindedView.forEach((myCardItem, index, arr) => {
        if (myCardItem.isSelected) {
          myCardItem.isSelected = false;
        }
      });

      // 播放声音
      // 按钮显隐
    },
  },
});
