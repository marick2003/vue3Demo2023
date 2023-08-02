import { CodeMaker } from './code-maker';
// 开启 console 输出
var DEBUG = false;
var printf =
  DEBUG && typeof console != 'undefined' && console['log']
    ? console['log'].bind(console)
    : function () {};
// 函数节流
var throttle = function (fn, delay) {
  var timer = null;
  return function () {
    clearTimeout(timer);
    var args = Array.prototype.slice.call(arguments);
    var _this = this;
    timer = setTimeout(function () {
      fn.apply(_this, args);
      timer = null;
    }, delay);
  };
};
function bindInputEvent(input, handler) {
  var cpLock = false;
  //var $input = $(input);
  var onInput = throttle(function (e) {
    // printf('input', cpLock);
    if (!cpLock) {
      handler.call(this, e);
    }
  }, 200);
  onInput();
  /*
  $input.on('input', onInput);
  // 如果是 IE9
  if (/msie 9/i.test(navigator.userAgent)) {
    $input.on('cut', onInput);
    $input.on('paste', onInput);
  }
  // if IE 8 or below
  if (!document.addEventListener) {
    $input.on('propertychange', function (e) {
      var event = e.originalEvent;
      if (event.propertyName.toLowerCase() == 'value') {
        // alert ("The new content: " + e.srcElement.value);
        onInput.call(this, e);
      }
    });
  }
  $input.on('compositionstart', function (e) {
    cpLock = true;
  });
  $input.on('compositionend', function (e) {
    // printf('compositionend');
    cpLock = false;
  });*/
}
function Kuaiyi(d) {
  this.d = $(d);
  this.dom = {};
  this.json = d.json;
  this.codeMaker = new CodeMaker();
  this.codeMaker.onReset = function () {
    this.options.isXian = 0;
    this.options.numberType = 20;
  };
  this.guid = G.util.guid();
  // this._statusTimer = setInterval(function () {
  // if (OPEN_STATUS != 1) {
  //     IS_PERIOD_OPEN = 0;
  // } else if (OPEN_STATUS == 0) {
  //     IS_PERIOD_OPEN = 1;
  // }
  // IS_PERIOD_OPEN = OPEN_STATUS != 1 && OPEN_STATUS != 0 ? '' : ([1, 0][OPEN_STATUS]);
  // }, 1000);
}
Kuaiyi.prototype.init = function () {
  var _this = this;
  _this.generator = KuaiyiGenerator(
    _this.codeMaker,
    $('#textarea')[0],
    $('#output')
  );
  this.d.on('click', '.fn_bets', function () {
    var fm = _this.generator.getFormatedMap();
    var inputV = $('.moneyInput').val().trim();
    if (!fm.hasMoney && (!inputV || inputV == 0)) {
      $.alert('请输入金额！');
      return;
    }
    _this.toBet(_this.generator.getBets());
  });
  bindInputEvent(
    $('.moneyInput', this.d),
    throttle(function (e) {
      // printf(this, e)
      _this.generator.inputMoney(this.value);
    }, 100)
  );
  this.d.on('click', '.fn_reset', function () {
    _this.reset();
  });
};
Kuaiyi.prototype.toBet = function (bets) {
  if (!bets) return;
  var _this = this;
  printf(bets);
  $('.fn_bets').prop('disabled', true).text('投注中...');
  function restoreBtn() {
    $('.fn_bets').prop('disabled', false).text('立即下注');
  }
  G.post({
    url: '/Member/BatchBet',
    data: bets,
    timeout: 120000,
    success: function (data) {
      doc.triggerHandler('playAudio.audio', data.Data.LackStatus);
      doc.triggerHandler('update');
      var fm = _this.generator.getFormatedMap();
      var Data = data.Data;
      if (
        fm.totalBetMoney != Data.FinalMoney ||
        fm.totalCount != Data.FinalBetCount
      ) {
        $.confirm(
          '<div class="f16">你投注的注单有<b class="red">缺码</b>。<br/>下注成功: <span class="red">' +
            data.Data.FinalBetCount +
            '注</span>, 总金额: <span class="red">' +
            data.Data.FinalMoney +
            '</span>。<br/>点确定查看详情</div>',
          function () {
            G.util.setHash('#!kuaida');
          }
        );
      }

      _this.reset();
    },
    bussiness: function (msg) {
      $.alert(msg);
      restoreBtn();
    },
    error: function () {
      restoreBtn();
    },
    complete: function (XMLHttpRequest, textStatus, errorText) {
      doc.triggerHandler('scorllBtm');
      restoreBtn();
      if (textStatus == 'timeout') {
        //超时
        $('#tbody').html('');
        $.alert('网络请求超时，请点击“下注明细”查看是否下注成功！');
      }
    },
  });
};
Kuaiyi.prototype.reset = function () {
  this.generator.reset();
};

var KuaiyiGenerator = (function () {
  var codeMaker = null;
  function setOption(key, v) {
    codeMaker.options[key] = v;
  }
  function getOption(key) {
    return codeMaker.options[key];
  }

  function checkOption(key) {
    return codeMaker.options[key] == -1 ? true : false;
  }
  var Consts = {
    CHU: '除',
    QU: '取',
    DAN: '单',
    SHUANG: '双',
    DA: '大',
    XIAO: '小',
    DING: '定',
    XIAN: '现',
    ER: '二',
    SAN: '三',
    SI: '四',
    WU: '五',
  };
  var TYPES = {
    19: '口XXXX',
    20: 'X口XXX',
    21: 'XX口XX',
    22: 'XXX口X',
    23: 'XXXX口',
    1: '口口XX',
    2: '口X口X',
    3: '口XX口',
    4: 'X口X口',
    5: 'X口口X',
    6: 'XX口口',
    7: '口口口X',
    8: '口口X口',
    9: '口X口口',
    10: 'X口口口',
    11: '四定位',
    12: '二字现',
    13: '三字现',
    14: '四字现',
    15: 'XXX口口',
    16: '口XXX口',
    17: 'X口XX口',
    18: 'XX口X口',
  };
  var ReverseTypes = {};
  Object.keys(TYPES).forEach(function (t, i) {
    ReverseTypes[TYPES[t]] = t;
  });
  ReverseTypes['口口口口'] = 11;
  // 获取号码对应的 dict_no_type_id
  function getTypeId(num, xian) {
    if (num.length < 4) {
      return num.length == 2 ? 12 : 13;
    }
    if (xian && num.length == 4) {
      return 14;
    }
    var tnum = num.replace(numberRegs.single, '口');
    return ReverseTypes[tnum];
  }
  // 关键字词典
  var Dict = {
    全转: 'transformNumbers',
    转: 'transformNumbers',
    // 跑
    上奖: 'upperNumbers',
    排除: 'exceptNumbers',
    值范围: 'remainValueRanges',
    // 双重. 0取1除. 下同
    双重: 'repeatTwoWordsFilter',
    // 3重
    三重: 'repeatThreeWordsFilter',
    // 4重
    四重: 'repeatFourWordsFilter',
    // 双双重
    双双重: 'repeatDoubleWordsFilter',
    // 2兄弟. 0取1除. 下同
    二兄弟: 'twoBrotherFilter',
    // 3兄弟
    三兄弟: 'threeBrotherFilter',
    // 4兄弟
    四兄弟: 'fourBrotherFilter',
    // 对数设置
    对数: ['logarithmNumberFilter', 'logarithmNumbers'],
    单: ['oddNumberFilter', 'oddNumberPositions'],
    双: ['evenNumberFilter', 'evenNumberPositions'],
    大: ['bigNumberFilter', 'bigNumberPositions'],
    小: ['smallNumberFilter', 'smallNumberPositions'],
    包含: ['containFilter', 'containNumbers'],
    复式: ['multipleFilter', 'multipleNumbers'],
    固定合分: ['remainFixedFilter', 'remainFixedNumbers'],
    不定合分: ['remainMatchFilter', 'remainMatchNumbers'],
  };

  var moduleCodes = {
    erd: 20,
    sand: 30,
    sid: 40,
    erx: 21,
    sanx: 31,
    six: 41,
    fifteen: 50,
  };
  var moduleNames = {
    二定: 20,
    三定: 30,
    四定: 40,
    二现: 21,
    三现: 31,
    四现: 41,
    五二定: 50,
  };
  var numberObj = {
    1: 'firstNumber',
    2: 'secondNumber',
    3: 'thirdNumber',
    4: 'fourthNumber',
    5: 'fifthNumber',
  };
  // 大小单双代表的数字组合
  var replacer = {
    大: '56789',
    小: '01234',
    单: '13579',
    双: '02468',
  };
  // 千百等代表的 options中的 对应字段
  var placerNumber = {
    千: 'firstNumber',
    头: 'firstNumber',
    百: 'secondNumber',
    十: 'thirdNumber',
    个: 'fourthNumber',
    五: 'fifthNumber',
    尾: 'fourthNumber',
  };
  // 千百等在数组中的位置
  var placerIndex = {
    千: '0',
    百: 1,
    十: 2,
    个: 3,
    五: 4,
    头: '0',
    尾: 3,
  };
  var getTailPlace = function () {
    return getOption('numberType') == 50 ? 4 : 3;
  };
  // var WholeReg = /([\d\*]{1,4}现?
  // 	|[\dx\+\|]{4,}
  var moneyRegStr = '[各=](\\d+(?:\\.\\d+)?)(?:[元块]?)';
  // 行内有金额
  var moneyReg = new RegExp(moneyRegStr);
  // 行尾有金额
  var tailMoneyReg = new RegExp(moneyRegStr + '$');
  // 整行金额
  var rowMoneyReg = new RegExp('^' + moneyRegStr + '$');
  var DanShuang = {};
  // 一些会重复使用的正则表达式(字符串)
  var RegStrings = {
    234: '[二三四]',
    s34: '[双三四]',
    12345: '[千百十个五头尾]',
    dsdx: '[单双大小]',
  };
  var RegSet = {
    chu2single: new RegExp(
      RegStrings['12345'] +
        '(\\d+|' +
        RegStrings['dsdx'] +
        ')|([双三四]|双双)重|' +
        RegStrings['234'] +
        '兄弟',
      'ig'
    ),
    // 千单百13类似
    qiandan: new RegExp(
      '(' + RegStrings['12345'] + '+)(\\d+|' + RegStrings['dsdx'] + ')',
      'ig'
    ),
    dx: /\d+|[\+x大小单双]/gi,
    'x+': /[x\+]/i,
    pureNumber: /^[x\+\d]{4,5}(?![x\+\d\|])/i,
    singleG: /([千百十个五头尾]+)(\d+|[大小单双])/,
  };
  // 获取与指定的数字们相反的数字
  var oppositeKeys = {
    大: '小',
    小: '大',
    单: '双',
    双: '单',
  };
  var getOpposite = function (numStr) {
    if (oppositeKeys[numStr]) {
      return replacer[oppositeKeys[numStr]];
    }
    var s = '';
    for (var i = 0; i < 10; i++) {
      if (!~numStr.indexOf(i)) {
        s += '' + i;
      }
    }
    return s;
  };
  // 组合数字, 返回无重复的最终结果
  var addingNumber = function (old, n) {
    if (!old) return n;
    for (var i = 0; i < n.length; i++) {
      if (old.indexOf(n[i]) < 0) {
        old += n[i];
      }
    }
    return old;
  };
  // 过滤条件正则及处理函数
  var AllFilterRegs = {
    // 处理写在后面的定现
    dingxian: {
      reg: /([二三四])([定现])/gi,
      handler: function (matched) {
        matched = matched[0];
        var whole = matched[0];
        if (moduleNames[whole]) {
          codeMaker.choose(moduleNames[whole]);
        }
      },
    },
    // 这种 除 较特殊, 取字不能省略
    chu1: {
      reg: /([除取])(\d+)/gi,
      handler: function (matched) {
        matched = matched[0];
        if (matched[1] == Consts.CHU) {
          setOption([Dict['排除']], matched[2].split(''));
        }
      },
    },
    chu2: {
      // reg: /(除|取)([二三四]兄弟|([双三四]|双双)重|([千百十个五头尾])(\d+|[单双大小]))+/ig,
      reg: new RegExp(
        '(除|取)(' +
          RegStrings['234'] +
          '兄弟|(' +
          RegStrings['s34'] +
          '|双双)重|(' +
          RegStrings['12345'] +
          ')(\\d+|' +
          RegStrings['dsdx'] +
          '))+',
        'ig'
      ),
      handler: function (allMatched) {
        var dan, shuang, weiNumer, big, small;
        var d = /\d+/;
        // var rr = /[千百十个五头尾](\d+|[单双大小])|([双三四]|双双)重|[二三四]兄弟/ig;
        var rr = RegSet.chu2single;
        var type;
        // 单双 除/取很特殊, 设置过一次就定下了
        var evenFilter = -1;
        var oddFilter = -1;
        var bigFilter = -1;
        var smallFilter = -1;
        var reverseType = [1, 0];
        var pos = [0, 0, 0, 0];

        function initDS(ds) {
          if (ds == 'odd') {
            if (!dan && oddFilter == -1) {
              oddFilter = type;
              dan = { type: oddFilter, val: [] };
            }
          } else if (ds == 'even') {
            if (!shuang && evenFilter == -1) {
              evenFilter = type;
              shuang = { type: evenFilter, val: [] };
            }
          } else if (ds == 'big') {
            if (!big && bigFilter == -1) {
              bigFilter = type;
              big = { type: bigFilter, val: [] };
            }
          } else if (ds == 'small') {
            if (!small && smallFilter == -1) {
              smallFilter = type;
              small = { type: smallFilter, val: [] };
            }
          }
        }
        var fixedNumbers = ['', '', '', '', ''];
        function handleValue(val) {
          if (Dict[val]) {
            if (checkOption(Dict[val])) {
              //[二三四]兄弟|([双三四]|双双)重 確認除取是否重複過
              setOption([Dict[val]], type);
            } else {
              return false;
            }
          } else {
            // var p = matched[4];
            // var danOrShuang = matched[5];
            var p = val[0];
            var danOrShuang = val.substr(1);
            var pp = placerIndex[p] || getTailPlace();
            // 数字
            //if (danOrShuang == '大' || danOrShuang == '小' || d.test(danOrShuang)) {
            if (d.test(danOrShuang)) {
              // 不等于 -1, 表明已经设置过
              // 如果此时的type与是1除, 则取反
              if (0 != type) {
                danOrShuang = getOpposite(danOrShuang);
              } else if (replacer[danOrShuang]) {
                danOrShuang = replacer[danOrShuang];
              }
              if (!weiNumer) {
                // 固定 type 为 0 (取)
                weiNumer = { type: 0, val: getOption(Dict['固定合分'][1]) };
              }
              if (pos[pp] == 0) {
                //條件固定位置相同 返回錯誤 (取千12除千34)
                pos[pp] = 1;
              } else {
                return false;
              }

              // weiNumer.val.push([pos, danOrShuang.split('')]);
              var res = [
                pos,
                (fixedNumbers[pp] = addingNumber(
                  fixedNumbers[pp],
                  danOrShuang
                )).split(''),
              ];
              printf(pp, res);
              // weiNumer.val[pp] = res;
              if (weiNumer.val.length < 4) {
                if (JSON.stringify(weiNumer.val) == '[[[],[]]]') {
                  weiNumer.val = [];
                }
                weiNumer.val.push(res);
              }
              // setOption([Dict['固定合分'][1]], weiNumer.val);
            } else {
              var temp;
              if (danOrShuang == Consts.SHUANG) {
                initDS('even');
                if (type == evenFilter) {
                  temp = shuang;
                } else {
                  type = reverseType[type];
                  if (oddFilter != -1 && type != oddFilter) {
                    return false;
                  }
                  initDS('odd');
                  temp = dan;
                }
              } else if (danOrShuang == Consts.DAN) {
                initDS('odd');
                if (type == oddFilter) {
                  temp = dan;
                } else {
                  type = reverseType[type];
                  if (evenFilter != -1 && type != evenFilter) {
                    return false;
                  }
                  initDS('even');
                  temp = shuang;
                }
              } else if (danOrShuang == Consts.DA) {
                initDS('big');
                if (type == bigFilter) {
                  temp = big;
                } else {
                  type = reverseType[type];
                  if (smallFilter != -1 && type != smallFilter) {
                    return false;
                  }
                  initDS('small');
                  temp = small;
                }
              } else if (danOrShuang == Consts.XIAO) {
                initDS('small');
                if (type == smallFilter) {
                  temp = small;
                } else {
                  type = reverseType[type];
                  if (bigFilter != -1 && type != bigFilter) {
                    return false;
                  }
                  initDS('big');
                  temp = big;
                }
              }
              // var all = matched[0].match(rr);
              // all.forEach(function (a) {
              if (temp.val[pp] == 1) {
                return false;
              } else {
                temp.val[pp] = 1;
              }
              // });
            }
          }
        }
        for (var a = 0; a < allMatched.length; a++) {
          var matched = allMatched[a];
          type = matched[1] == Consts.CHU ? 1 : 0;
          // 如果长度一致, 表示只有一组匹配而非多组
          if (matched[1] + matched[2] == matched[0]) {
            var f = handleValue(matched[2]);
            if (f === false) return f;
            continue;
          }
          var subMatched = matched[0].match(rr);
          for (var s = 0; s < subMatched.length; s++) {
            var ff = handleValue(subMatched[s]);
            if (ff === false) return ff;
          }
        }
        var getXianNumberTypeLength =
          codeMaker.options.numberType == 21
            ? 2
            : codeMaker.options.numberType == 31
            ? 3
            : 4;
        // 除单双的数组长度
        // var oddEvenLen = getOption('fifthNumber') ? 5 : 4;
        if (dan) {
          setOption([Dict[Consts.DAN][0]], dan.type);
          for (var i = 0; i < getXianNumberTypeLength; i++) {
            dan.val[i] = dan.val[i] || 0;
          }
          setOption([Dict[Consts.DAN][1]], dan.val);
        }
        if (shuang) {
          setOption([Dict[Consts.SHUANG][0]], shuang.type);
          for (i = 0; i < getXianNumberTypeLength; i++) {
            shuang.val[i] = shuang.val[i] || 0;
          }
          setOption([Dict[Consts.SHUANG][1]], shuang.val);
        }
        if (big) {
          setOption([Dict[Consts.DA][0]], big.type);
          for (var i = 0; i < getXianNumberTypeLength; i++) {
            big.val[i] = big.val[i] || 0;
          }
          setOption([Dict[Consts.DA][1]], big.val);
        }
        if (small) {
          setOption([Dict[Consts.XIAO][0]], small.type);
          for (i = 0; i < getXianNumberTypeLength; i++) {
            small.val[i] = small.val[i] || 0;
          }
          setOption([Dict[Consts.XIAO][1]], small.val);
        }
        if (weiNumer) {
          setOption([Dict['固定合分'][0]], weiNumer.type);
          for (i = 0; i < 4; i++) {
            weiNumer.val[i] = weiNumer.val[i] || [[], []];
          }
          setOption(Dict['固定合分'][1], weiNumer.val);
        }
        // printf(codeMaker.options);
      },
    },
    zhi: {
      reg: /值范围(\d+)(\-(\d+))?/gi,
      handler: function (matched) {
        matched = matched[0];
        var arr = [matched[1], matched[3]];
        setOption([Dict['值范围']], arr);
      },
    },
    zhuan: {
      reg: /全?转(\d+)?/gi,
      handler: function (matched) {
        matched = matched[0];
        // 全转后有数字则使用, 否则取 firstNumber
        var num = matched[1] || getOption('firstNumber');
        // printf(matched, num);
        setOption([Dict['转']], num.split(''));
      },
    },
    he: {
      reg: /([二三])数和(\d+)/gi,
      handler: function (matched) {
        matched = matched[0];
        var indexed = {
          二: 2,
          三: 3,
        };
        var num = matched[2];
        printf(indexed[matched[1]], num);
        setOption('remainMatchFilter', indexed[matched[1]]);
        setOption('remainMatchNumbers', num.split(''));
      },
    },
    pao: {
      reg: /跑(\d+)/gi,
      handler: function (matched) {
        matched = matched[0];
        var num = matched[1];
        if (num) {
          setOption(Dict['上奖'], num.split(''));
        }
      },
    },
  };
  function checkFilters(fstring, ri) {
    // codeMaker.reset();
    var tempStr = fstring;
    var hasOne;
    for (var a in AllFilterRegs) {
      printf(AllFilterRegs[a], tempStr);
      if (!tempStr) break;
      var filter = AllFilterRegs[a];
      var reg = filter.reg;
      var matched = null;
      var allMatched = [];
      while ((matched = reg.exec(fstring))) {
        tempStr = tempStr.replace(matched[0], '');
        if (!hasOne) {
          hasOne = true;
        }
        allMatched.push(matched);
      }
      if (allMatched.length) {
        if ((filter.handler && filter.handler(allMatched, ri)) === false)
          return false;
      }
    }
    if (!hasOne || tempStr) {
      return false;
    }
  }

  var weiIndex = {
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
  };
  var indexedNumber = [
    'firstNumber',
    'secondNumber',
    'thirdNumber',
    'fourthNumber',
    'fifthNumber',
  ];
  var weiNumbers = {
    2: 'er',
    3: 'san',
    4: 'si',
    5: 'fifteen',
  };
  function setNumberModule(numbers, wei, xian, zhuan) {
    codeMaker.reset();
    // 这个需要手动重置
    setOption('remainFixedFilter', -1);
    if (wei >= 5) {
      xian = false;
    }
    printf(numbers, wei, xian, zhuan);
    // 定位置
    var positionType;
    if (zhuan) {
      positionType = 1;
    } else {
      positionType = xian ? 1 : 0;
    }
    // 配数全转
    // if (numbers.length == 1) {
    //     for (var n = 1; n < wei; n++) {
    //         numbers.push(numbers[0]);
    //     }
    //     positionType = 1;
    // }
    printf('numbers', numbers);
    var numReg = /^\d+$/;
    numbers.forEach(function (num, i) {
      var isNum = numReg.test(num);
      setOption(indexedNumber[i], isNum ? num : '');
    });
    var mod = wei + '' + (xian ? 1 : 0);
    printf('module ------>', wei, mod);
    codeMaker.choose(mod - 0);

    // 设置配数全转或定位置
    setOption('positionType', positionType);
    // printf(codeMaker.options)
  }
  var numbersReg = [
    {
      reg: /^(\d+)全?转(?![二三四][定现])/gi,
      handler: function (matched) {
        codeMaker.reset();
        setOption([Dict['转']], matched[1].split(''));
      },
    },
    {
      // 没有定位置
      // reg: /^(\d+)(?:全?转)?([二三四])(?:(?:字?([定现]))|(定位?))/ig,
      reg: /^(\d+)(?:全?转)?([二三四])([定现])/gi,
      handler: function (matched) {
        printf(matched);
        var wei = weiIndex[matched[2]];
        var num = matched[1];
        var res = [];
        for (var i = 0; i < wei; i++) {
          res.push(num);
        }
        var isXian = matched[3] == Consts.XIAN;
        setNumberModule(res, wei, isXian, true);
        // if (!isXian) {
        // 直接设为全转
        setOption([Dict['转']], num.split(''));
        // }
      },
    },
    {
      // 有定位置
      // reg: /^(?:[千百十个五头尾]+(?:\d+|[大小单双])){1,5}(?:(?:([二三四])(?:(?:字?([定现]))|(定位?)))|(现))?/ig,
      // reg: /^(?:[千百十个五头尾]+(?:\d+|[大小单双])){1,5}(?:(?:([二三四])([定现]))|(现))?/ig,
      // 改为没有现的
      reg: /^(?:[千百十个五头尾]+(?:\d+|[大小单双])){1,5}(?:(?:([二三四])(定)))?/gi,
      handler: function (matched) {
        printf(matched);
        var exp = matched[0];
        var wei = matched[1];
        // N字定
        var dx = matched[2];
        // N定位
        var dw = matched[3];
        var onlyXian = matched[4];
        if (dw == '定位' || dw == Consts.DING) {
          dx = Consts.DING;
        }
        var dingxian = wei && dx;
        var matchReg = RegSet['qiandan'];
        var numbersMatched = exp.match(matchReg);
        // 如果长度不满2,且不是 五n 这种, 且没有定现
        // if (numbersMatched.length < 2 && exp[0] != Consts.WU && !dingxian || numbersMatched.length > 5) {
        //     return false;
        // }
        var formated = [];
        // 将千百123替换成千123百123
        numbersMatched.forEach(function (matched) {
          var splited = RegSet.singleG.exec(matched);
          var posi = splited[1];
          var nb = splited[2];
          // printf(splited);
          if (splited && posi && nb) {
            if (posi.length > 1) {
              for (var p = 0; p < posi.length; p++) {
                formated.push(posi[p] + nb);
              }
            } else {
              formated.push(splited[0]);
            }
          }
        });
        numbersMatched = formated;
        // printf(numbersMatched);
        // var singleReg = /[千百十个五头尾]|\d+|[大小单双]/ig;
        var numbers = [];
        var checkSameFilter = true;
        numbersMatched.forEach(function (num) {
          // 千大 或 百123 这种
          var p = num[0],
            n = num.substr(1);
          var pp = placerIndex[p] || getTailPlace();
          if (numbers[pp] == undefined) {
            numbers[pp] = replacer[n] ? replacer[n] : n;
          } else {
            checkSameFilter = false; //同位置不能重複輸入 千大千大 / 千大头大
          }
        });
        if (!checkSameFilter) return false;
        printf(numbers.join(','), numbersMatched.length);
        // 千12二定, 千12三定, 千12个12三定 特殊处理
        var allNum = '0123456789';
        // 如果没有跑，则进行补位
        if (!/跑/.test(matched.input)) {
          // 有定现
          if (dx == Consts.DING) {
            if (wei == Consts.ER && numbersMatched.length == 1) {
              if (numbers[0]) {
                numbers[1] = allNum;
              } else {
                numbers[0] = allNum;
              }
            } else if (wei == Consts.SAN) {
              if (numbersMatched.length == 1) {
                if (numbers[0]) {
                  numbers[1] = numbers[2] = allNum;
                } else {
                  numbers[0] = allNum;
                  for (var n = 1; n < 4; n++) {
                    if (!numbers[n]) {
                      numbers[n] = allNum;
                      break;
                    }
                  }
                }
              } else if (numbersMatched.length == 2) {
                if (!numbers[0]) {
                  numbers[0] = allNum;
                } else {
                  for (n = 1; n < 4; n++) {
                    if (!numbers[n]) {
                      numbers[n] = allNum;
                      break;
                    }
                  }
                }
              }
            }
          }
          // 没有定现，且只有一位如千123 / 百小 / 十单 等
          else if (numbersMatched.length == 1) {
            if (numbers[0]) {
              numbers[1] = allNum;
            } else {
              numbers[0] = allNum;
            }
          }
        }

        // 强制 length 为 5
        numbers.length = 5;
        // 如果有五, 则位固定为 5
        if (numbers[4]) {
          printf(
            numbersMatched.length > 2,
            wei != Consts.WU,
            dx != Consts.DING
          );
          // 如果位数超过 2 组, 或 后面输的不是"五字定"
          if (
            numbersMatched.length > 2 ||
            (dingxian && (wei != Consts.WU || dx != Consts.DING))
          ) {
            return false;
          }
          // 注释掉，不再对五二定进行补位
          // if (numbersMatched.length == 1) {
          //     numbers[0] = allNum;
          // }
          // printf(numbers);
          setNumberModule(numbers, 5, false);
        } else if (!onlyXian) {
          // 如果有定现, 则数字部分很可能不足 4 位
          // 否则, 根据数字部分猜位数
          // printf(numbers,dx)
          setNumberModule(
            numbers,
            dingxian ? weiIndex[wei] : numbersMatched.length,
            dx == Consts.XIAN
          );
          // 如果只有个现字
        } else {
          setNumberModule(
            numbers,
            numbersMatched.length,
            onlyXian == Consts.XIAN
          );
        }
        // 如果有跑，且没有明确定现，则变化为3定
        if (
          numbersMatched.length == 2 &&
          /跑/.test(matched.input) &&
          !/现/.test(matched.input) &&
          !/[二三四]定/.test(matched.input)
        ) {
          codeMaker.choose(30);
        }
      },
    },
    {
      // reg: /^(?:(\d{2,4})(现?)|[\dx]{2,5})(?:[各=]\d+(?:\.\d+)?)?$/ig,
      reg: /^(?:(\d{2,4})(现?)|[\dx\+]{4,5})$/gi,
      handler: function (matched) {
        printf(matched);
        var exp = matched[0];
        if (RegSet['x+'].test(exp)) {
          var num = exp.match(/\d/gi) ? exp.match(/\d/gi) : [];
          var splited = exp.split('');
          var xlength = splited.length - num.length;
          printf(num);
          var xIsOk = isXLength(splited, xlength);
          if (xIsOk === false) return xIsOk;
          if (num) {
            printf(num.length);
            setNumberModule(
              exp.split(''),
              exp.length == 5 && num.length == 2 ? 5 : num.length
            );
          }
        } else {
          num = matched[1];
          var xian = matched[2] == Consts.XIAN || (num && num.length < 4);
          printf(num, xian);
          // 属于 123x 这种
          if (!num) {
            num = exp;
          }
          num = num.split('');
          setNumberModule(num, num.length, xian);
        }
      },
    },
    {
      reg: /^(\d+|[\|\+x大小单双]){2,}(现?)/gi,
      handler: function (matched) {
        printf('dddddddddddd', matched);
        var exp = matched[0];
        printf(exp);
        // 如果是直接的单一号码
        // if (RegSet.pureNumber.test(exp)) {
        //     var num = exp.match(/\d/ig);
        //     if (num) {
        //         printf(num.length);
        //         setNumberModule(exp.split(''), exp.length == 5 && num.length == 2 ? 5 : num.length);
        //     } else {
        //         return false;
        //     }
        //     return;
        // }
        // 可以不要 | , 因为只是个分隔符,取出来没用
        var temp = RegSet.dx;
        var x = RegSet['x+'];
        var splited = exp.match(temp);
        printf(splited, 'splited.length', splited.length);
        // 位数太长或太短, 都不合法
        if (splited.length > 5 || splited.length == 1) {
          return false;
        }
        var xlength = 0;
        splited = splited.map(function (s, i) {
          if (x.test(s)) {
            xlength += 1;
          }
          return replacer[s] || s;
        });
        if (splited.length < 4 && xlength != 0) {
          return false;
        }

        var xIsOk = isXLength(splited, xlength);
        if (xIsOk === false) return xIsOk;
        // printf(splited, xlength);
        setNumberModule(
          splited,
          splited.length == 5 ? splited.length : splited.length - xlength,
          matched[2] == Consts.XIAN
        );
      },
    },
    {
      reg: /([千百十个五头尾]{2,4})和(\d+)/gi,
      handler: function (matched) {
        // 因为不过 setNumberModule ,所以这里手动重置一下
        codeMaker.reset();
        var m1 = matched[1];
        var pos = m1.split('');
        // 五二定
        if (m1.indexOf('五') > -1) {
          if (m1.length == 2) {
            codeMaker.choose(50);
          } else {
            return false;
          }
        } else {
          codeMaker.choose(pos.length * 10);
        }

        var num = matched[2];
        setOption([Dict['固定合分'][0]], 0);
        var place = [0, 0, 0, 0];
        pos.forEach(function (p) {
          place[placerIndex[p]] = 1;
        });
        setOption(Dict['固定合分'][1], [[place, num.split('')]]);
      },
    },
  ];
  var AllList = {};
  var FormatedMap = {};
  // 展示号码到页面
  var showAllList = throttle(function () {
    console.log(AllList);
    printf('GlobalError', GlobalError);
    if (!GlobalError && outputElement) {
      FormatedMap = analyseAllList(AllList);
      //generateHTML(FormatedMap);
    }
  }, 200);
  var generateHTML = function (fm) {
    $('.totalCount').text(fm.totalCount);
    $('.ky_totalBetMoney').text(fm.totalBetMoney);
    printf(fm);
    var table = '<table class="t-1 tc table_bg ssc_table_bg"><thead><tr>';
    var total = 0;
    var perRow = 12;
    var endRow = 11;
    // 先检查是否有金额, 有的话表头会输出 `金额` 列
    var hasMoney = fm.hasMoney;
    $('.moneyInput')[hasMoney ? 'addClass' : 'removeClass']('hide');
    for (var i = 0; i < perRow; i++) {
      if (i % 2 == 1 && (hasMoney || fm.hasInputMoney)) {
        table += '<td>金额</td>';
      } else {
        table += '<td>号码</td>';
      }
    }
    table += '</thead><tbody>';
    var bets = fm.bets;
    $('#tr_bets')[bets && bets.length ? 'removeClass' : 'addClass']('hide');

    for (var a = 0; a < bets.length; a++) {
      var bet = bets[a];
      var money = bet.bet_money;
      var no = bet.bet_no;
      var xian = bet.isXian;
      if (hasMoney && (!money || money == 0)) {
        continue;
      }
      // total += numbers.length;
      if (total % perRow == 0) {
        table += '<tr>';
      }
      table +=
        '<td>' + no + (xian ? '<span class="red">现</span>' : '') + '</td>';
      if (money != null && total % 2 == 0) {
        table += '<td>' + money + '</td>';
        total += 1;
        // printf(total)
      }
      if (total % perRow == 11) {
        table += '</tr>';
      }
      total += 1;
    }
    table += '</tr></tbody></table>';
    $(outputElement).html(table);
  };
  // 分析生成出来的号码
  var analyseAllList = function (list) {
    console.log('analyseAllList:'+list);
    console.log(list);
    var hasMoney;
    for (var l in list) {
      if (list[l].money) {
        hasMoney = true;
        break;
      }
    }

    var result = [],
      totalCount = 0,
      totalBetMoney = 0;
    for (l in list) {
      var ll = list[l];
      if ((hasMoney && ll.money) || !hasMoney) {
        var numbers = ll.numbers;
        var money = ll.money;
        if (money) {
          var llMoney = money * numbers.length;
          totalBetMoney += llMoney;
        }
        totalCount += numbers.length;
        for (var n = 0, nn, isStr; n < numbers.length; n++) {
          nn = numbers[n];
          isStr = typeof nn == 'string';
          result.push({
            bet_no: isStr ? nn : nn.bet_no,
            bet_money: money,
            isXian: isStr ? ll.isXian : nn.isXian,
          });
        }
      }
    }

    return {
      hasMoney: hasMoney,
      totalCount: totalCount,
      totalBetMoney: (totalBetMoney - 0).toFixed(1),
      bets: result,
    };
  };

  // 提取行中的金额并处理
  var refineMoney = function (rowObj, rowIndex) {
    var row = rowObj.row,
      money = rowObj.money;
    setTimeout(function () {
      // printf('mmmmmmmmmmmmmmmmmmmmmmm,' ,matched, rowIndex);
      if (rowIndex > -1) {
        var plus = rowIndex + 1;
        for (; plus--; ) {
          // moneyReg.lastIndex = 0;
          printf('rowIndex', rowIndex, RowsList[plus].row, plus);
          // 如果再碰到一个金额, 就跳出
          if (plus < rowIndex && RowsList[plus].money) {
            break;
          }
          var aa = AllList[RowsList[plus].row];
          if (aa && (!aa.money || aa.moneyType == 0)) {
            aa.money = money;
            aa.moneyType = 0;
          }
        }
      }
    }, 1);
  };
  // 分析号码中有几位数字
  var Int0_9 = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1 };
  var getIntNumber = function (num) {
    var len = 0;
    for (var n = 0; n < num.length; n++) {
      if (Int0_9[num[n]]) {
        len += 1;
      }
    }
    return len;
  };
  var dR = /^\d+$/;
  var xReplace = /[\+\*x]/g;
  var invalidNum = /[^\+\*x\d定现二三四]/i;
  var numberRegs = {
    single: /\d/g,
    four: /^\d{4}$/,
    two: /^\d{2}$/,
    three: /^\d{3}$/,
    dingxian: /([二三四][定现])$/,
  };
  // var numberTesters = {
  //     '二定': function (num) {
  //         return num.length == 4 && num.match(numberRegs.single).length == 2;
  //     },
  //     '三定': function (num) {
  //         return num.length == 4 && num.match(numberRegs.single).length == 3;
  //     },
  //     '四定': function (num) {
  //         return numberRegs.four.test(num);
  //     },
  //     '二现': function (num) {
  //         return numberRegs.two.test(num);
  //     },
  //     '三现': function (num) {
  //         return numberRegs.three.test(num);
  //     },
  //     '四现': function (num) {
  //         return numberRegs.four.test(num);
  //     }
  // };
  var isValidNum = function (ss) {
    // if (numberRegs.dingxian.test(ss)) {
    //     var def = RegExp.$1;
    //     ss = ss.replace(def, '');
    //     console.log(def);
    //     if (!numberTesters[def](ss)) {
    //         return false;
    //     }
    //     // 判断成功且是 4 现
    //     if (def == '四现') {
    //         return {isXian: true, bet_no: ss};
    //     }
    // }
    if (ss.length > 5 || invalidNum.test(ss)) return false;
    if (ss.length < 4 && dR.test(ss)) {
      return { isXian: true, bet_no: ss };
    }
    var hasXian = ss[ss.length - 1] == Consts.XIAN;
    if (hasXian) {
      ss = ss.slice(0, -1);
    }
    if (hasXian && dR.test(ss)) {
      return { isXian: true, bet_no: ss };
    }
    var intN = getIntNumber(ss);
    var xlength = ss.length - intN;
    printf(ss, ss.length, intN);
    // 如果小于4位，且不是纯数字
    if (ss.length < 4 && !dR.test(ss)) {
      return false;
    }
    var xIsOk = isXLength(ss, xlength);
    // if (xIsOk === false) return xIsOk;
    // xlength = 4 表示是 ‘一定’
    if (xIsOk === false && xlength != 4) {
      return false;
    }
    var xWord = new RegExp('[xX]{4}');
    if (ss.length == 4 && xWord.test(ss)) {
      return false;
    }
    // 如果位数是 5 位，则只能有1位或2位数字，且最后一位必须是数字
    // 如果位数是 4 位, 则至少要有 两位是数字
    // if (ss.length > 4 && Int0_9[ss[4]] && intN > 0 && intN < 3 || (ss.length < 5 && intN > 1)) {
    //     return ss.replace(xReplace, 'X');
    // }
    return ss.replace(xReplace, 'X');
    // return false;
  };
  // 判断号码是否符合除`一定`外的其他类型
  var isXLength = function (splited, xlength) {
    if (
      (splited.length == 5 && (!dR.test(splited[4]) || xlength != 3)) ||
      (splited.length < 5 && xlength > 2)
    ) {
      return false;
    }
  };
  // 分析输入的行(已初步处理过)
  var analyseRow = function (rowObj, rowIndex) {
    var row = rowObj.row;
    printf(rowObj);
    if (row) {
      // 纯号码, 不用 codeMaker处理
      if (rowObj.pure) {
        var splited = row.split(/[\s\.,，]+/);
        printf(splited);
        var result = [];
        // 检查， 并格式化
        for (var s = 0, ss, intN; s < splited.length; s++) {
          ss = splited[s];
          if (ss.length < 2) {
            return false;
          }
          if (ss) {
            ss = isValidNum(ss);
            if (ss === false) return false;
            // 现的号码要排序
            if (ss.isXian) {
              ss.bet_no = ss.bet_no.split('').sort().join('');
            }
            result.push(ss);
          }
        }
        AllList[row] = {
          numbers: result,
          money: null,
          pure: true,
        };
        showAllList();
      } else {
        var hasOne;
        for (var n = 0; n < numbersReg.length; n++) {
          var obj = numbersReg[n];
          var reg = obj.reg;
          // Important!
          reg.lastIndex = 0;
          var t = reg.exec(row);
          printf(reg, t, reg.lastIndex);
          if (t) {
            var valid = obj.handler(t);
            // 如果严格等于 false, 表示表达式不合法
            if (valid === false) {
              return showError();
            }
            // 检查过滤条件
            var remain = row.substr(t[0].length);
            if (remain) {
              var passed = checkFilters(remain, rowIndex);
              if (passed === false) {
                return showError();
              }
            }

            codeMaker.generate();
            AllList[row] = {
              numbers: codeMaker.numberList,
              money: null,
              isXian: getOption('isXian'),
            };
            // console.log(remain, codeMaker.options);
            showAllList();
            hasOne = true;
            break;
          }
        }
        // 如果一个都没匹配上
        if (!hasOne) {
          return showError();
        }
      }
    }
    if (rowObj.money != null && rowObj.money != false) {
      refineMoney(rowObj, rowIndex);
    }
  };
  // 用来清理 AllList 中已不存在的缓存
  function cleanAllList(rl) {
    var temp = {};
    for (var r = 0; r < rl.length; r++) {
      temp[rl[r].row] = rl[r];
    }
    for (var a in AllList) {
      printf(temp[a], AllList[a]);
      if (!temp[a]) {
        delete AllList[a];
      }
      if (temp[a] && !temp[a].money && AllList[a]) {
        AllList[a].money = null;
      }
    }
    showAllList();
  }
  var outputElement = null;
  // 保存输入的行
  var Rows = null;
  // 整理过的行
  var RowsList = [];
  // 处理数位相反的行
  var adverseRegs = [
    /^(?:\d+|[大小单双])[千百十个五头尾]+/,
    /(\d+|[大小单双])([千百十个五头尾]+)/g,
  ];
  // 处理直接号码行
  // var directNumbersReg = /^((\b\d{2,4}(?:\b|现)|\b[\dx+\*]{2,5}\b)([\s\.,，]+)?)+$/ig;
  // printf(directNumbersReg.test('12xx3 4567x x789,902x.456x '), RegExp.$1);
  // 分隔符(包括金额的标识符)
  var sepaSymbol = /[\s\.,，各=]/;
  // 粗略号码判断正则
  var numR = /^([\dx+X+\*]{2,5}|\d{2,4}现?)$/;
  var multR = /^(\d+,)+\d+[二三四][定现]/;
  // 处理原始输入的行
  var getRowsList = function () {
    RowsList.length = 0;
    for (var r = 0; r < Rows.length; r++) {
      var rr = Rows[r];
      rr = rr.replace(/^\s+/, '').replace(/\s+$/, '');
      if (!rr) continue;
      // 将 【1头2尾】 这种纠正过来
      if (adverseRegs[0].test(rr)) {
        rr = rr.replace(adverseRegs[1], '$2$1');
      }
      // important!
      // directNumbersReg.lastIndex = 0;
      // if (directNumbersReg.test(rr)) {
      //     pure = true;
      // } else {
      //     rr = Rows[r].replace(/\s+/g, '');
      // }
      var money;
      if (multR.test(rr)) {
        var allParts = rr.split(',');
        var remain = allParts[allParts.length - 1].replace(/^\d+/, '');
        money = moneyReg.test(rr) && RegExp.$1;
        if (money) {
          remain = remain.replace(moneyReg, '');
          allParts[allParts.length - 1] = allParts[allParts.length - 1].replace(
            moneyReg,
            ''
          );
        }
        for (var a = allParts.length - 1; a--; ) {
          allParts[a] += remain;
        }

        // console.log(remain,allParts);
        for (a = 0; a < allParts.length; a++) {
          RowsList.push({
            money: money,
            row: allParts[a],
          });
        }
        // RowsList.push.call(RowsList, allParts);
      } else {
        var pure = false;
        var ind = rr.search(sepaSymbol);
        var first = ind > 0 ? rr.substring(0, ind) : rr;
        if (numR.test(first) && isValidNum(first)) {
          pure = true;
          // 纯号码金额只能在最后
          money = tailMoneyReg.test(rr) && RegExp.$1;
        } else {
          rr = rr.replace(/\s+/g, '');
          money = moneyReg.test(rr) && RegExp.$1;
        }
        if (money) {
          rr = rr.replace(moneyReg, '');
        }
        // 如果不是纯号码，尝试判断有没有不合法分隔符
        if (!pure && sepaSymbol.test(rr)) {
          return showError();
        }
        RowsList.push({
          money: money,
          row: rr,
          pure: pure,
        });
      }
    }
  };
  var errTipSpan;
  var errorTip = function (hide) {
    errTipSpan[!hide ? 'removeClass' : 'addClass']('hide');
    $('#tr_bets')[hide ? 'removeClass' : 'addClass']('hide');
  };
  var GlobalError = null;
  var showError = function () {
    // setTimeout(function () {
    GlobalError = true;
    outputElement.empty();
    errorTip();
    $('#tr_bets').addClass('hide');
    // },200);
    return false;
  };

  // 非法字符判断正则
  var invalidChar =
    /[^大小单双千百十个五头尾除取重兄弟值范围全转跑数和合一二三四字现定位元块各=\dx\+\-\*\|\s\.,，]/i;
  return function (maker, input, output) {
    codeMaker = maker;
    GlobalError = null;
    var val = input;
    // 进行关键字替换
    // 可减少逻辑判断相关正则的复杂度
    val = val
      .replace(/中肚/g, '百十')
      .replace(/倒/g, '转')
      .replace(/直码/g, '四定')
      // 注意这句要在 “直码” 替换之后
      .replace(/码/g, '定')
      .replace(/两/g, '二')
      .replace(/不要/g, '除')
      .replace(/[走移]/g, '跑')
      .replace(/合/g, '和')
      .replace(/([千百十个五头尾])位/g, '$1')
      .replace(/定位|字定/g, '定')
      .replace(/字现/g, '现');
    if (invalidChar.test(val)) {
      return {
        getAllList: function () {
          return AllList;
        },
      };
    }
    Rows = val.split('\n');
    getRowsList();
    printf(Rows, RowsList);

    for (var i = 0; i < RowsList.length; i++) {
      var rowObj = RowsList[i];
      var row = rowObj.row;
      // AllList 中没有的, 才生成
      // row 没有, 表示这是一行纯金额
      if (!row || !AllList[row] || rowObj.money) {
        var isvalid = analyseRow(rowObj, i);
        if (isvalid === false) {
          return {
            getAllList: function () {
              return AllList;
            },
          };
        }
      }
      // 更新已缓存的结果的 money
      if (AllList[row]) {
        AllList[row].money = rowObj.money || null;
        showAllList();
      }
    }
    FormatedMap = analyseAllList(AllList);
    if (output) {
      outputElement = output;
    }
    // 错误提示
    return {
      getAllList: function () {
        return AllList;
      },
      getBets: function (inputBetString, periodNo) {
        
        if (!FormatedMap.totalBetMoney) {
          return false;
        }
        var bets = FormatedMap.bets;
        var resultBets = [];
        for (var b = 0; b < bets.length; b++) {
          var bb = bets[b];
          if (bb.bet_money && bb.bet_money != 0) {
            resultBets.push({
              BetMoney: bb.bet_money,
              BetNo: bb.bet_no,
              DictNoTypeId: getTypeId(bb.bet_no, bb.isXian),
            });
          }
        }
        return {
          totalCount: FormatedMap.totalCount,
          totalBetMoney: FormatedMap.totalBetMoney,
          bets: resultBets,
          way: 108,
          period_no: 0,
          bet_log: encodeURIComponent(inputBetString),
          period_no: periodNo,
        };
      },
      getFormatedMap: function () {
        return FormatedMap;
      },
      inputMoney: function (money) {
        if (money.trim() == '') {
          money = null;
        }
        if (FormatedMap && FormatedMap.bets) {
          FormatedMap.bets.forEach(function (bet) {
            bet.bet_money = money;
          });
          printf(FormatedMap.bets.length);
          FormatedMap.hasMoney = false;
          FormatedMap.hasInputMoney = money ? true : false;
          FormatedMap.totalBetMoney = money
            ? (money * FormatedMap.bets.length).toFixed(1)
            : 0;
          //generateHTML(FormatedMap);
        }
      },
      reset: function () {
        /*
        $(input).val('');
        $(output).html('');
        $('.moneyInput').val(0);
        $('.totalCount').text(0);
        $('.ky_totalBetMoney').text('0.0');
        */
        FormatedMap = {};
        AllList = {};
      },
    };
  };
})();

function GenerateBets(inputBetString, periodNo) {
  console.log(`inputBetString:${inputBetString}`);

  let outputBetList = '';
  let generator = KuaiyiGenerator(
    new CodeMaker(),
    inputBetString,
    outputBetList
  );
  console.log(generator);
  generator.getAllList();
  let fm = generator.getFormatedMap();
  const postData = generator.getBets(inputBetString, periodNo);
  generator.reset();
  if (fm.hasMoney) {
    return postData;
  } else {
    return {};
  }
}

export { GenerateBets };
