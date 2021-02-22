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
    new Audio('./asset/music/putUpCards.mp3').play();
  }
  return identifier;
};

const app = new Vue({
  el: '#app',
  data: {
    audio: {
      bg: new Audio('./asset/music/bg.mp3'),
      clickButton: new Audio('./asset/music/bubble.mp3'),
      putCards: new Audio('./asset/music/putUpCards.mp3'),
      success: new Audio('./asset/music/success.mp3'),
      fail: new Audio('./asset/music/fail.mp3'),
    },
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
    winnerIndex: -1,
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
      isRotate: true,
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
      result: false,
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
    // 随机开始抢地主
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
    bubble() {
      this.audio.clickButton.play();
    },
    toggleBgMusic() {
      this.displayStatus.isRotate = !this.displayStatus.isRotate;
      if (this.audio.bg.paused) {
        this.audio.bg.play();
      } else {
        this.audio.bg.pause();
      }
    },
    enterStage() {
      // 按钮和舞台显隐
      this.displayStatus.welcome = false;
      this.displayStatus.controls = true;
      this.displayStatus.stage = true;
    },
    async startGame() {
      // 按钮显隐
      this.displayStatus.result = false;
      this.displayStatus.controls = false;
      this.displayStatus.deliver = false;

      // 音乐开始
      // this.audio.bg.currentTime = 1.5;
      // this.audio.bg.play();

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

      this.desktopCardsInfo.ownerIndex = this.grabLandlordInfo.landlordPlayerIndex;
      this.displayStatus.countdownOfPutUp = true;
      this.displayStatus.countdownOfGrab = false;
      // 发地主牌
      this.deliverCardsToLandlord();

      // 出牌
      await this.startPutUp();

      // 停止播放背景音乐
      this.audio.bg.pause();
      this.audio.bg.currentTime = 0;

      this.gameOver();
    },
    gameOver() {
      // 逻辑
      this.winnerIndex = this.putUpInfo.currentPutUpTurnIndex;
      // 显示
      this.displayStatus.result = true;
      // 音效
      if (this.winnerIndex === 1) {
        this.audio.success.play();
      } else {
        this.audio.fail.play();
      }
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
          0.3
        ),
        moveOldArrToNewArr(
          this.secondUserCardsShuffled,
          this.secondUserCardsBindedView,
          'two',
          0.3
        ),
        moveOldArrToNewArr(
          this.myselfUserCardsShuffled,
          this.myselfUserCardsBindedView,
          'myself',
          0.3
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
      if (playerIndex === 1) {
        this.displayStatus.putUpGroup = true;
        this.displayStatus.controls = true;
      }
      this.displayStatus.clock = true;

      try {
        await this.getPutUpPromise(20, playerIndex);
        // 出牌成功的音效
        this.audio.putCards.play();
      } catch (err) {
        // 不出的音效
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
        // 一轮出牌完毕后，桌牌所属者拥有初始发牌权。
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
          const setTimeoutFn = () => {
            console.log('玩家的setTimeout函数到期，调用函数');
            const isLeader = this.desktopCardsInfo.ownerIndex === playerIndex;
            // 这种写法中传给this.putUpCards的参数一定是true，传给this.notPutUpCards的一定是false
            // 我在怀疑，是不是因为我函数接口写的太烂了，才造成能产生这种写法的局面。
            (isLeader ? this.putUpCards : this.notPutUpCards)(
              playerIndex,
              isLeader
            );
            (isLeader ? resolve : reject)(isLeader);
          };
          const putUpHandler = () => {
            if (this.putUpCards(playerIndex, false)) {
              this.desktopCardsInfo.ownerIndex = playerIndex;
              clearTimeout(setTimeoutFn);
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
            notPutUpHandler = () => {
              clearTimeout(setTimeoutFn);
            };
          } else {
            this.displayStatus.notPutUpCards = true;
            notPutUpHandler = () => {
              this.notPutUpCards(playerIndex, false);
              reject(new Error('手动不出牌'));
              clearTimeout(setTimeoutFn);
            };
          }

          putUpBtn.addEventListener('click', putUpHandler);
          notPutUpBtn.addEventListener('click', notPutUpHandler);
          this.temp.putUpFn = putUpHandler;
          this.temp.notPutUpFn = notPutUpHandler;

          setTimeout(setTimeoutFn, rejectTime * 1000);
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
          // 选择可行的牌中最小的
          selectedCards = suitableCardsArr[suitableCardsArr.length - 1];
        }
        // ——————————🔺🔺🔺电脑玩家选牌🔺🔺🔺——————————
      }

      if (!selectedCards.length) {
        return false;
      }

      const selectedCardsInfo = getCardsTypeAndMainItems(selectedCards);

      if (selectedCardsInfo.type === cardsRules.INVALID) {
        return false;
      }

      if (!isBiggerThanDesktopCards(selectedCardsInfo, this.desktopCardsInfo)) {
        console.error('选牌没有大过上家');
        return false;
      }

      // ——————————🔻🔻🔻选牌合规，更新桌面状态🔻🔻🔻——————————
      // TODO: 需要将以下出牌和更新桌面状态的逻辑独立出当前函数

      // 单张牌的音效
      let fileName = 'default';
      if (
        [
          cardsRules.TRIPLE,
          cardsRules.SINGLE_BELT,
          cardsRules.DOUBLE_BELT,
          cardsRules.TRIPLE_BELT,
          cardsRules.AIRPLANE_PULL_DOUBLE,
          cardsRules.AIRPLANE_PULL_DOUBLE,
          cardsRules.NORMAL_BOMB,
          cardsRules.BIG_BOMB,
        ].includes(selectedCardsInfo.type)
      ) {
        fileName = selectedCardsInfo.type.audioFileName;
        // 暂无特殊配音
      }
      if (selectedCardsInfo.type === cardsRules.SINGLE) {
        fileName = `singleCard/${selectedCardsInfo.mainItems[0]}`;
      }
      if (selectedCardsInfo.type === cardsRules.DOUBLE) {
        fileName = `doubleCards/${selectedCardsInfo.mainItems[0]}`;
      }

      const src = `./asset/music/cards/${fileName}.mp3`;

      const cardsAudio = new Audio(src);
      cardsAudio.volume = 1;
      cardsAudio.play();

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
