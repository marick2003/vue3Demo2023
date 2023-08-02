import { CodeMaker } from './code-maker';
    // 开启 console 输出
    var DEBUG = false;
    var printf = DEBUG && typeof console != 'undefined' && console['log'] ? console['log'].bind(console) : function () { };
    // 函数节流
    var throttle = function (fn, delay) {
        var timer = null;
        return function () {
            window.clearTimeout(timer);
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
        var $input = $(input);
        var onInput = throttle(function (e) {
            // printf('input', cpLock);
            if (!cpLock) {
                handler.call(this, e);
            }
        }, 200);
        onInput();
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
        //this.guid = G.util.guid();

    }
    Kuaiyi.prototype.init = function () {
        var _this = this;
        _this.generator = KuaiyiGenerator(_this.codeMaker, $('#textarea')[0], $('#output'));
        this.d.on('click', '.fn_bets', function () {
            var fm = _this.generator.getFormatedMap();
            var inputV = $('.moneyInput').val().trim();
            if (!fm.hasMoney && (!inputV || inputV == 0)) {
                //$.alert('请输入金额！');
                return;
            }
            _this.toBet(_this.generator.getBets());
        });
        bindInputEvent($('.moneyInput', this.d), throttle(function (e) {
            // printf(this, e)
            _this.generator.inputMoney(this.value);
        }, 100));
        this.d.on('click', '.fn_reset', function () {
            _this.reset();
        });
    };
    Kuaiyi.prototype.toBet = function (bets) {
        if (!bets) return;
        var _this = this;
        printf(bets);
        function restoreBtn() {
            $('.fn_bets').prop("disabled", false).text('立即下注');
        }
        G.post({
            url: "/Member/BatchBet",
            data: bets,
            timeout: 120000,
            success: function (data) {
                doc.triggerHandler("playAudio.audio", data.Data.LackStatus);
                doc.triggerHandler("update");
                var fm = _this.generator.getFormatedMap();
                var Data = data.Data;
                if (fm.totalBetMoney != Data.FinalMoney || fm.totalCount != Data.FinalBetCount) {
                    $.confirm('<div class="f16">你投注的注单有<b class="red">缺码</b>。<br/>下注成功: <span class="red">'
                        + data.Data.FinalBetCount + '注</span>, 总金额: <span class="red">' + data.Data.FinalMoney + '</span>。<br/>点确定查看详情</div>', function () {
                            G.util.setHash('#!kuaida');
                        });
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
                doc.triggerHandler("scorllBtm");
                restoreBtn();
                if (textStatus == 'timeout') {//超时
                    $("#tbody").html("");
                    $.alert("网络请求超时，请点击“下注明细”查看是否下注成功！");
                }
            }
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
        var TYPES = {
            19: "口XXXX",
            20: "X口XXX",
            21: "XX口XX",
            22: "XXX口X",
            23: "XXXX口",
            1: "口口XX",
            2: "口X口X",
            3: "口XX口",
            4: "X口X口",
            5: "X口口X",
            6: "XX口口",
            7: "口口口X",
            8: "口口X口",
            9: "口X口口",
            10: "X口口口",
            11: "四定位",
            12: "二字现",
            13: "三字现",
            14: "四字现",
            15: "XXX口口",
            16: "口XXX口",
            17: "X口XX口",
            18: "XX口X口"
        };
        var ReverseTypes = {};
        Object.keys(TYPES).forEach(function (t, i) {
            ReverseTypes[TYPES[t]] = t;
        });
        ReverseTypes['口口口口'] = '11';
        // 获取号码对应的 dict_no_type_id
        function getTypeId(num, xian) {
            var numberRegs = {
                single: /\d/g
            };
            if (num.length < 4) {
                return num.length == 2 ? 12 : 13;
            }
            if (xian && num.length == 4) {
                return 14;
            }
            var tnum = num.replace(numberRegs.single, '口');
            return ReverseTypes[tnum];
        }
        // 保存输入的行
        var Rows = null;
        // 整理过的行
        var RowsList = [];
        var outputElement = null;
        var AllList = {};
        var FormatedMap = {};
        // 展示号码到页面
        var showAllList = throttle(function () {
            if (!GlobalError && outputElement) {
                FormatedMap = analyseAllList(AllList);
               // generateHTML(FormatedMap);
            }
        }, 200);

        // 分析生成出来的号码
        var analyseAllList = function (list) {
            console.log('analyseAllList:'+list);
            console.log(list)

            var hasMoney;
            for (var l in list) {
                if (list[l].money) {
                    hasMoney = true;
                    break;
                }
            }
         
            var result = [], totalCount = 0, totalBetMoney = 0;
            for (l in list) {
                var ll = list[l];
                if (hasMoney && ll.money || !hasMoney) {
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
                            bet_money: money ,
                            isXian: isStr ? ll.isXian : nn.isXian
                        });
                    }
                }

            }

            return {
                hasMoney: hasMoney,
                totalCount: totalCount,
                totalBetMoney: (totalBetMoney - 0).toFixed(1),
                bets: result,
                hasInputMoney: false
            };
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

        //替換字串
        var optimize = function (val, type) {//1: 一開始替換, 2: 數字放入後替換
            var rule = type == 1 ? REPLACE_RULES : REPLACE_RULES_AFTERNUMBER
            for (var i = 0; i < rule.length; i++) {
                var pattern = rule[i][0];
                var replacement = rule[i][1];
                val = val.replace(pattern, replacement);
            }
            return val;
        }

        //上奖跟 含比較特別, 需要進行字串判斷才可以決定要替換哪一個
        var checkString = function (string) {
            if (/上奖|上/.test(string)) {
                string = string.replace('五定', 'tempWord');
                if (/[千百十个五]/.test(string)) {
                    string = string.replace(/上奖|上/g, "上奖");
                } else {
                    string = string.replace(/上奖/g, "包含");
                }
                string = string.replace('tempWord', '五定');
            }
            return string;
        }

        // 处理原始输入的行
        var getRowsList = function () {
            RowsList.length = 0;
            for (var r = 0; r < Rows.length; r++) {
                var rr = Rows[r];
                rr = rr.replace(/^\s+/, '').replace(/\s+$/, '');
                if (!rr) continue;
                // 将 【1头2尾】 这种纠正过来
                if (ADVERSER_EGS[0].test(rr)) {
                    rr = rr.replace(ADVERSER_EGS[1], '$2$1');
                }
                RowsList.push(rr);
            }
        };
        //轉換數字
        var generateNumberString = function (num) {
            var output = "";
            for (var i = 0; i <= 9; i++) {
                var regex = new RegExp(i, "g");
                if (!num.match(regex)) {
                    output += i;
                }
            }
            return output;
        }
        //處理8千百十个8此狀況
        var checkPostionRule = function (str){
            var checkReg = /(\d+)?([^\d\s]+)?(\d+)([千百十个]{3,})(\d+)([^\d\s]+)?(\d+)?/g;
            var matchArr = checkReg.exec(str);
            var midPosText;

            if (matchArr != null) {
                midPosText = matchArr[4];
                //if () {
                //}
            }
        }
        //處理特別規則, ex: 大大 or X大X大 -> 二定大的位置
        var exceptionRule = function (obj, str, dicNoType) { //(getrule ,  RowsList[i])
            var reg = /(除|取)?([大小单双X]{2,5})([重])?/g; //先不處理除, 但還是抓出來
            var matchInfo = str.match(reg);
            var matchMiddleText;
            var numPos = [];
            var checkPos = {
                '大': [-1],
                '小': [-1],
                '单': [-1],
                '双': [-1],
            }
            if (dicNoType == 21) {
                numPos = '[0, 0]';
            } else if (dicNoType == 31) {
                numPos = '[0, 0, 0]';
            } else if (dicNoType == 50) {
                numPos = '[0, 0, 0, 0, 0]';
            } else {
                numPos = '[0, 0, 0, 0]';
            }
            Object.entries(checkPos).forEach(function([key, value]) {
                checkPos[key].push(JSON.parse(numPos));
              });
            var secondMatch = '';
            if (matchInfo != null) {
                for (var i = 0, j = matchInfo.length; i < j; i++) {
                    reg.lastIndex = 0;
                    secondMatch = reg.exec(matchInfo[i]);
                    if (secondMatch != null) {
                        if (secondMatch[3] == undefined) { //避免抓到两对重 導致錯誤
                            matchMiddleText = secondMatch[2].split('');
                            for (var x = 0, y = matchMiddleText.length; x < y; x++) {
                                if (matchMiddleText[x] != 'X') {
                                    checkPos[matchMiddleText[x]][0] = 0
                                    checkPos[matchMiddleText[x]][1][x] = 1
                                }
                            }
                        }
                    }
                }
            }
            Object.entries(checkPos).forEach(function([key, value]) {
                if (checkPos[key][0] !== -1) {
                  obj[key] = value;
                }
              });
        }
        //取得千百十各後面的數字
        var getNumberDigits = function (str) {
            //取得取或除
            var reg = /(除)([千百十个五]+([\d]+))/g;
            var returnInfo = {
                'filter': 0,
                'result': { '千': null, '百': null, '十': null, '个': null}
            }
            var regNum = /\d+/g;
            var getMatchStatus = str.match(reg);
            if (getMatchStatus != null) {
                //returnInfo.filter = 1;
                //將除的數字轉換
                var getMatchNum;
                var changeText;
                for (var i = 0, j = getMatchStatus.length; i < j; i++) {
                    getMatchNum = generateNumberString(getMatchStatus[i].match(regNum)[0]);//將號碼取出 並轉換號碼
                    changeText = getMatchStatus[i].replace(/\d+/g, getMatchNum);//將原本數字替換成轉換後的號碼
                    str = str.replace(getMatchStatus[i], changeText);
                }
            }
            //'123千百五12全轉789' > 千百123五12全轉789
            //先進行註解, 不用進行移位, 避免出現 "千123百" 不合規定的說法, 卻會變成千百123
            //千123百十45个7 會錯, 會转成千百123十45个7
            //var reg = /(\d+)([千百十个五](?![\d+大小单双]))/
            //var match
            //while (match = reg.exec(str)) {
            //    console.log('match ', match);
            //    str = str.replace(match[0], match[2] + match[1])
            //}
            //console.log('str ', str);
            //千百123 > 千123百123
            var numbersMatched = str.match(/([千百十个五]+)([\d]+)/gi);
            var component = '';
            var reg2 = /([千百十个五]+)([\d]+)/;
            if (numbersMatched != null) {
                numbersMatched.forEach(function (matched) {
                    var splited = reg2.exec(matched);
                    var tempText;
                    if (splited[1].length > 1) {
                        tempText = splited[1].split('');
                        tempText.forEach(function (spliteText) {
                            component += spliteText + splited[2];
                        });
                    } else {
                        component += splited[1] + splited[2];
                    }
                });
            }
            //var result = { '千': null, '百': null, '十': null, '个': null };
            var regex = /([千百十个五])([\d]+)?/g;
            var match;

            component != '' ? component : str;
            while (match = regex.exec(component)) {
                var key = match[1];
                var value = match[2] ? match[2].toString() : null;
                //var size = match[3] || null;

                //returnInfo.result[key] = value == null ? RE_PLACER[size]: value;
                returnInfo.result[key] = value;
            }

          
        Object.entries(returnInfo.result).forEach(function ([key, value]) {
            if (value !== null) {
            returnInfo.result[key] = value.replace(/\s/g, '');
            }
        });
            //console.log('returnInfo ', returnInfo);
            return returnInfo;
        }

        //確認同類別單一除取次數
        var checkMatchInfoText = function(str) {
            var digitCounts = {}; // 用于统计各出现次数的对象

            // 构造正则表达式，用于匹配所有字符
            var regexPattern = /[除取]/g;

            // 使用正则表达式和字符串方法统计出现的次数
            var matchResults = str.match(regexPattern);
            var countNum = 0;
            var splitStr;
            
            if (matchResults) {
                splitStr = str.split('');
                if (splitStr[0] == '除') {
                    digitCounts['除'] = 1;
                } else {
                    digitCounts['取'] = 1;
                }

                //第一格已經拿過, 因此不重複拿取
                for (var x = 1, y = splitStr.length; x < y; x++) {
                    if (splitStr[x] == '除' || splitStr[x] == '取') {
                        digitCounts[splitStr[x]] = (digitCounts[splitStr[x]] || 0) + 1;
                    }
                }
                //計算除/取是否同時出現
                Object.keys(digitCounts).forEach(function () {
                    countNum++;
                  });
            }
            if (countNum > 1) {
                return false;
            } else {
                return true;
            }
        }

        //抓取語法及後面數字
        var findErXiongDi = function (str, dicNoType) {
            var returnInfo = {};
            Object.entries(GRAMMAR_RULE_GAME_RESTRICTIONS[dicNoType]).forEach(function ([key, value]) {

                if (value) { //條件為true才進行抓數字
                    var re;
                    if (key == '对数') {
                        //取得对数後面的數字, 最多三組數字(號碼最多兩位), 用逗號空格進行分割
                        //最多可以寫对数16对数27对数38
                        //多抓取1位, 用來判斷超出組數要顯示錯誤
                        re = new RegExp("(除|取)?" + key + "(\\d{2})(?:[\\|,\\s](\\d{2})){0,1}(?:[\\|,\\s](\\d{2}))?(?:[\\|,\\s](\\d{2}))?(?:(?:(?:除|取)?" + key + "(\\d{2}))(?:[\\|\\s,](\\d{2})){0,1}(?:[\\|\\s,](\\d{2}))?)?(?:(?:(?:除|取)?" + key + "(\\d{2}))(?:[\\|\\s,](\\d{2})){0,1}(?:[\\|\\s,](\\d{2}))?)?(?:(?:(?:除|取)?" + key + "(\\d{2})))?");
                    } else if (key == '固定合分') {
                        //抓取固定分合的欄位, 最多有四組
                        re = new RegExp("(除|取)?([千百十个五]+)" + key + "(\\d+)", 'g');//因為可能出現在語句不同位置, 所以先用全句搜尋
                    } else if (key == '配'){
                        re = new RegExp("(除|取)?" + key + "(\\d+)(?:[,\\s](\\d+))?(?:[,\\s](\\d+))?(?:[,\\s](\\d+))?");
                    } else if (key == '值范围'){
                        re = new RegExp("(除|取)?" + key + "(\\d+)\\-(\\d+)?");
                    } else if (key == '大' || key == '小' || key == '单' || key == '双') {
                        re = new RegExp("(除|取)?([千百十个五]+" + key + ")", 'g');//因為可能出現在語句不同位置, 所以先用全句搜尋
                    } else {
                        re = new RegExp("(除|取)?" + key + "(\\d+)?");
                    }

                    var match;
                    if (key == '固定合分' || key == '配' || key == '大' || key == '小' || key == '单' || key == '双') {
                        match = str.match(re);
                    } else {
                        match = re.exec(str);
                    }
                    //[0] => 是否使用此判斷條件, -1: 無, 0: 取, 1: 除
                    //[1] => 條件後面的數字, 如果沒填寫則為null
                    if (match === null) {
                        returnInfo[key] = [-1, null];
                    } else {
                        if (key == '对数') {
                            var getPairNumber = [];
                            var getTempNumber;
                            var reg_check = /[,\s]/g; //檢查是否存在空格及逗號

                            if (reg_check.test(match[0])) {
                                return showError();
                            }

                            for (var i = 2; i < 13; i++) {//抓取匹配到的數字
                                if (match[i] != undefined) {
                                    getTempNumber = match[i].split('');
                                    //对数間格必須為5, 且最多三組對數
                                    if (Math.abs(getTempNumber[0] - getTempNumber[1]) == 5 && getPairNumber.length < 3) {
                                        getPairNumber.push(getTempNumber);
                                    } else {
                                        return showError();
                                    }
                                }
                            }
                            if (checkMatchInfoText(match[0])) {
                                returnInfo[key] = [match[1] === '除' ? 1 : 0, match[2] == undefined ? null : getPairNumber];
                            } else {
                                return showError();
                            }
                        } else if (key == '固定合分') {
                            var re_exclude = new RegExp("(除|取)?([千百十个五]+)固定合分(\\d+)");
                            var getText = ''
                            var checkTextRule = match.join('');

                            var numPos = [];
                            var ChangePos = { '千': 0, '百': 1, '十': 2, '个': 3, '五': 4 };
                            var matchSplit;
                            var setInfo = [];
                            var getFilter = 0;
                            //抓除取
                            if (match != null) {
                                for (var x = 0, y = match.length; x < y; x++) {
                                    getText = match[x].match(re_exclude);

                                    if (getText[1] == '除') {
                                        getFilter = 1;//只要有一個除就全部為除
                                    }

                                    matchSplit = getText[2].split('');//千百十个
                                    numPos = dicNoType == 50 ? [0, 0, 0, 0, 0] : [0, 0, 0, 0];
                                    for (var i = 0, j = matchSplit.length; i < j; i++) {
                                        numPos[ChangePos[matchSplit[i]]] = 1;
                                    }
                                    setInfo.push([numPos, getText[3].split('')]);

                                }

                                if (checkMatchInfoText(checkTextRule) && match.length < 5) {
                                    returnInfo[key] = [getFilter, setInfo];
                                } else {
                                    return showError();
                                }
                            }
                        } else if (key == '配') {
                            var matchNum = [];
                            for (var i = 2; i < 6; i++) {
                                if (match[i] != undefined) {
                                    matchNum.push(match[i]);
                                }
                            }
                            returnInfo[key] = [match[1] === '除' ? 1 : 0, match[2] == undefined ? null : matchNum];

                        } else if (key == '值范围') {
                            var matchNum = [];
                            for (var i = 2; i < 4; i++) {
                                if (match[i] != undefined) {
                                    matchNum.push(match[i]);
                                }
                            }
                            returnInfo[key] = [match[1] === '除' ? 1 : 0, match[2] == undefined ? null : matchNum];

                        } else if (key == '两重') {
                            //將两对重 双重 都抓出來, 如果有双重才帶入
                            var regEx = /(两对重)|(两重)/g;
                            var getMatch = str.match(regEx);
                            var getStatus = false;
                            getMatch.forEach(function(value) {
                                if (value == '两重') {
                                    getStatus = true;
                                }
                            });
                            if (getStatus) {
                                returnInfo[key] = [match[1] === '除' ? 1 : 0, match[2] == undefined ? null : match[2]];
                            } else {
                                returnInfo[key] = [-1, null];
                            }
                        } else if (key == '双' || key == '单' || key == '大' || key == '小') {
                            var rePos = new RegExp("(除|取)?([千百十个五]+" + key + ")");
                            var getText = ''
                            var checkTextRule = match.join('');

                            var numPos = [];
                            var ChangePos = { '千': 0, '百': 1, '十': 2, '个': 3, '五': 4 };
                            var matchSplit;
                            var setInfo = [];
                            var getFilter = 0;

                            if (dicNoType == 21) {
                                numPos = [0, 0];
                            } else if (dicNoType == 31) {
                                numPos = [0, 0, 0];
                            } else if (dicNoType == 50) {
                                numPos = [0, 0, 0, 0, 0];
                            } else {
                                numPos = [0, 0, 0, 0];
                            }

                            //抓除取
                            for (var x = 0, y = match.length; x < y; x++) {
                                getText = match[x].match(rePos);
                                if (getText[1] == '除') {
                                    getFilter = 1;//只要有一個除就全部為除
                                }

                                matchSplit = getText[2].replace(key, '').split('');//千百十个

                                for (var i = 0, j = matchSplit.length; i < j; i++) {
                                    if (ChangePos[matchSplit[i]] < numPos.length) { //二三現的大小單雙位置有數量限制
                                        numPos[ChangePos[matchSplit[i]]] = 1;
                                    } else {
                                        return showError();
                                    }
                                }
                            }
                            if (checkMatchInfoText(checkTextRule)) {
                                returnInfo[key] = [getFilter, numPos];
                            } else {
                                return showError();
                            }
                        } else {
                            returnInfo[key] = [match[1] === '除' ? 1 : 0, match[2] == undefined ? null : match[2]];
                        }
                    }
                }
            });
            return returnInfo;
        }

        var extraRules = function (str, dicNoType, getNumberDigitsObj) {
            //如果有乘號需求, 在這處理
            //配數的乘號與其他的不同
            var getKeyWord = '配';
            var getKeyWord2 = '移';
            var postionFilter = {
                '千': 0,
                '百': 0,
                '十': 0,
                '个': 0
            }
            if (dicNoType == 50) {
                postionFilter['五'] = 0
            }
            var dicNoLength = Math.floor(dicNoType / 10);

            if (str.indexOf(getKeyWord) != -1) {
                var reg = /[千百十个五]/g;
                var match = str.match(reg);
                //配裡面有千百十个, 才進行X號處理
                if (match != null && match.length == dicNoLength) {
                   Object.keys(postionFilter).forEach(function(key) {
                        if (str.indexOf(key) == -1) {
                            postionFilter[key] = 1;
                        }
                    });

                    var finalValue = [];
                    Object.values(postionFilter).forEach(function(value) {
                          finalValue.push(value);
                    });
                    if (dicNoType != 21 && dicNoType != 31 && dicNoType != 41) {
                        setOption(DICT['乘号'], finalValue);
                    }
                }
            } else if (str.indexOf(getKeyWord2) != -1) {
                var reg = /[千百十个五]/g;
                var match = str.match(reg);
                //移裡面有千百十个, 要與第一次轉換出來的X - 進行合併後, 在處理乘號位置
                if (match != null) {
                    Object.entries(postionFilter).forEach(function([key, value]) {
                        if (str.indexOf(key) === -1) {
                          postionFilter[key] = 1;
                        }
                      });
                      
                      var finalValue = [];
                      Object.values(postionFilter).forEach(function(value) {
                        finalValue.push(value);
                      });

                   var regXandPlus = /[x|+]/g;
                   var matchReg = str.match(regXandPlus);
                   if (matchReg != null) {
                       for (var a = 0, b = matchReg.length; a < b; a++) {
                           if (matchReg[a] != 'x') {
                               finalValue[a] = 0
                           }
                       }
                       if (dicNoType != 21 && dicNoType != 31 && dicNoType != 41) {
                           setOption(DICT['乘号'], finalValue);
                       }
                   }
                }
            } else {
                //移除大小单双在字串中的位置, 避免判斷錯誤
                var regRepalce = /[除取]?[千百十个五]+[大小单双]/g;
                str = str.replace(regRepalce, '');
                var reg = /[千百十个五]/g;
                var match = str.match(reg);
                var getDigitsObj = JSON.parse(JSON.stringify(getNumberDigitsObj));

                if (match) {
                    match = match.filter(function (item, index, arr) {
                        return arr.indexOf(item) === index;
                    });
                }
                if (match != null && match.length == dicNoLength) {
                    match.forEach(function(value) {
                        if (getDigitsObj.result[value] == null) {
                            getDigitsObj.result[value] = '0123456789';
                        }
                    });

                    var finalValue = [];
                    Object.entries(getDigitsObj.result).forEach(function([key, value]) {
                        finalValue.push(value == null ? 1 : 0);
                      });
                    if (dicNoType != 21 && dicNoType != 31 && dicNoType != 41) {
                        setOption(DICT['乘号'], finalValue);
                    }
                } else if (match != null && match.length > dicNoLength) {
                    return showError();
                }
            }
        }


        var replaceCheckText = function (match, key1, key2, key3) {
            if (key1 == undefined && key3 == undefined) {
                return match
            } else if (key3 == undefined) {
                return key2 + key1
            } else {
                return match
            }
        }

        var replaceMovePosText = function (match, key1, key2) {
            if (key1 == undefined) {
                return match
            } else {
                var getSplitKey1 = key1.split('');
                var numberPos = {
                    '千': 0,
                    '百': 0,
                    '十': 0,
                    '个': 0,
                }

                for (var x = 0, y = getSplitKey1.length; x < y; x++) {
                    numberPos[getSplitKey1[x]] = 1
                }
                var returnText = '';
                Object.entries(numberPos).forEach(function ([key, value]) {
                    if (value === 0) {
                      returnText += 'x';
                    } else {
                      returnText += '+';
                    }
                  });
                return returnText + key2;
            }
        }

        var replaceExclude = function (match, key1, key2, key3) {
            var returnText;
            if (key2 != undefined && key3 != undefined) {//千百十个後面有數字, 將除轉換成排除
                returnText = '排除' + key1 + key2 + key3;
            } else if (key2 != undefined) { //千百十个後面沒數字, 將數字與千百十个顛倒
                returnText = '除' + key2 + key1;
            } else if (key2 == undefined) { //後面沒有千百十个, 轉換成排除
                returnText = '排除' + key1;
            } else {
                returnText = match;
            }
            return returnText;
        }

        var replaceAllText = function (match, key1, key2, key3, key4) {
            var returnText;
            var changeText = '千百十个';
            if (key3 == '转') {
                returnText = match;
            } else {
                if (key1 == undefined && key2 == undefined) { //全的前面沒東西, 因此依定抓後面
                    returnText = changeText + key4;
                } else if (key1 == undefined && key4 == undefined) {//全的後面沒東西, 且key1也是空的
                    returnText = changeText + key2;
                } else if (key2 == undefined) {//全的前面不是大小单双, 因此一定是抓後面
                    returnText = key1 + changeText + key4;
                } else if (key4 == undefined) {//全的後面不是大小单双, 因此一定是抓前面
                    returnText = key1 + changeText + key2;
                } else if (key1 != undefined && key2 != undefined && key4 != undefined) {//全的前後都有大小单双, 再往前判斷一位, 如果第一位是千百十个, 則全是配對後面的大小单双
                    returnText = key1 + key2 + changeText + key4;
                } else if (key1 == undefined && key2 != undefined && key4 != undefined) { //上大全大
                    returnText = key2 + changeText + key4;
                }
            }
            return returnText;
        }

        //字串替換規則
        var REPLACE_RULES = [
            [/中肚/g, '百十'],
            [/两双重|双双重/g, '两对重'], //原為双双重, 避免造成內部錯誤 因此內部採取两对重名稱
            [/双重|二重/g, '两重'], //原為雙重, , 避免造成內部錯誤 因此內部採取两重名稱
            [/不要/g, '除'],
            [/仟|头/g, '千'],
            [/佰/g, '百'],
            [/拾/g, '十'],
            [/尾/g, '个'],
            [/([千百十个五])位/g, '$1'],
            [/定位|字定/g, '定'],
            [/字现|同上|字同上/g, '现'],
            [/二数合/g, '两数合'],
            [/全转/g, '全倒'],//先將全轉轉成全倒, 避免被單一轉替換掉
            [/转/g, '全转'],
            [/全倒/g, '全转'],
            [/倒/g, '全转'],
            [/(\d+)?(全转)(\d+|[大小單雙])?/g, replaceCheckText],//將前面的數字替換到後面
            [/两兄弟/g, '二兄弟'],
            [/值范围|值取|值/g, '值范围'],
            [/至|到/g, '-'],
            [/x|\+/g, 'X'],
            [/各/g, '='],
            [/含/g, '包含'],
            [/(千|百|十|个|五)合/g, '$1固定合分'],
            [/(\d+配)+\d+/g, function (match) { return "配" + match.replace(/配/g, ","); }],
            [/除(\d+)([千百十个]+)?(\d+)?/g, replaceExclude],//判斷除或者是排除, 並將數字進行顛倒
            [/上(\d+)/g, '上奖$1'],
            [/(\d+)?(上奖|上)(\d+|[大小單雙])?/g, replaceCheckText],//將前面的數字替換到後面
            [/五二定/g, '五定'],
            [/移位|跑/g, '移'],
            [/([千百十个]+)(\d+)移/g, '$1移$2'],//將前面的數字替換到後面
            [/([千百十个]+)(移)/g, replaceMovePosText],//移除移字前的千百十个
            //[/([千百十个])?([大小单双])?全([大小单双])?/g, replaceAllText] //'千百十个$1'
        ];

        var REPLACE_RULES_AFTERNUMBER = [
            [/([千百十个])?([大小单双])?全([转])?([大小单双])?/g, replaceAllText] //'千百十个$1'
        ]

        // 非法字符判断正则
        var INVALID_CHAR = /[^大小单双千百十个五头尾除取重兄弟值范围全转数和合二三四现定位元块各包含上奖复式两数固定分合对配排移位跑=\dx\+\-\*\|\s\.,，\/｡]/i;

        //大小单双轉換到千百十个五後面
        var ADVERSER_EGS = [/^(?:[大小单双])[千百十个五]+/, /([大小单双])([千百十个五]+)/g];

        //玩法定位
        var MODULE_NAMES = {
            '二定': 20,
            '三定': 30,
            '四定': 40,
            '二现': 21,
            '三现': 31,
            '四现': 41,
            '五': 50
        };

        //只適用於一種玩法, 就直接定位
        var SINGLE_PLAY_TYPE = {
            '值范围': 40,
            '两对重': 40
        }

        // 千百等代表的 options中的 对应字段
        var PLACER_NUMBER = {
            '千': 'firstNumber',
            '百': 'secondNumber',
            '十': 'thirdNumber',
            '个': 'fourthNumber',
            '五': 'fifthNumber'
        };

        // 大小单双代表的数字组合
        var RE_PLACER = {
            '大': '56789',
            '小': '01234',
            '单': '13579',
            '双': '02468'
        };

        // 关键字词典
        var DICT = {
            '定位置': 'positionFilter',
            '全转': 'transformNumbers',
            '转': 'transformNumbers',
            // 跑
            '上奖': 'upperNumbers',
            '移': 'upperNumbers',
            '排除': 'exceptNumbers',
            '值范围': 'remainValueRanges',
            // 两重. 0取1除. 下同
            '两重': 'repeatTwoWordsFilter',
            // 3重
            '三重': 'repeatThreeWordsFilter',
            // 4重
            '四重': 'repeatFourWordsFilter',
            // 双双重
            '两对重': 'repeatDoubleWordsFilter',
            // 2兄弟. 0取1除. 下同
            '二兄弟': 'twoBrotherFilter',
            // 3兄弟
            '三兄弟': 'threeBrotherFilter',
            // 4兄弟
            '四兄弟': 'fourBrotherFilter',
            // 对数设置
            '对数': ['logarithmNumberFilter', 'logarithmNumbers'],
            '单': ['oddNumberFilter', 'oddNumberPositions'],
            '双': ['evenNumberFilter', 'evenNumberPositions'],
            '大': ['bigNumberFilter', 'bigNumberPositions'],
            '小': ['smallNumberFilter', 'smallNumberPositions'],
            '包含': ['containFilter', 'containNumbers'],
            '复式': ['multipleFilter', 'multipleNumbers'],
            '固定合分': ['remainFixedFilter', 'remainFixedNumbers'],
            '两数合': ['remainMatchFilter', 'remainMatchNumbers'],
            '三数合': ['remainMatchFilter', 'remainMatchNumbers'],
            '配': ['positionFilter', 'positionType'],
            '乘号': 'symbolPositions'
        };

        //所有玩法(根據快選列表)
        var GRAMMAR_RULE_COMMON= {
            '全转': false,
            '上奖': false,
            '移': false,
            '排除': false,
            '值范围': false,
            '两重': false,
            '三重': false,
            '四重': false,
            '两对重': false,
            '二兄弟': false,
            '三兄弟': false,
            '四兄弟': false,
            '对数': false,
            '包含': false,
            '复式': false,
            '固定合分': false,
            '两数合': false,
            '三数合': false,
            '配': false,
            '单': false,
            '双': false,
            '大': false,
            '小': false
        }

        //根據快選指定開啟那些功能, key = dic_no_type;
        var GRAMMAR_RULE_OPEN = {
            '20': ['全转', '上奖', '移', '排除', '两重', '二兄弟', '对数', '包含', '复式', '固定合分', '两数合', '配', '单', '双', '大', '小'],
            '30': ['全转', '上奖', '移', '排除', '两重', '三重', '二兄弟', '三兄弟', '对数', '包含', '复式', '固定合分', '两数合', '三数合', '配', '单', '双', '大', '小'],
            '40': ['全转', '上奖', '移', '排除', '值范围', '两重', '三重', '四重', '两对重', '二兄弟', '三兄弟', '四兄弟', '对数', '包含', '复式', '固定合分', '两数合', '三数合', '配', '单', '双', '大', '小'],
            '21': ['两重', '二兄弟', '对数', '包含', '复式', '两数合', '配', '单', '双', '大', '小'],
            '31': ['两重', '三重', '二兄弟', '三兄弟', '对数', '包含', '复式', '两数合', '三数合', '配', '单', '双', '大', '小'],
            '41': ['两重', '三重', '四重', '二兄弟', '三兄弟', '四兄弟', '对数', '包含', '复式', '两数合', '三数合', '配', '单', '双', '大', '小'],
            '50': ['全转', '上奖', '移', '排除', '两重', '二兄弟', '对数', '包含', '复式', '固定合分', '两数合', '配', '单', '双', '大', '小'],
        }
        //根據上述將條件開放寫至GRAMMAR_RULE_GAME_RESTRICTIONS
		var GRAMMAR_RULE_GAME_RESTRICTIONS = {};
		for (var key in GRAMMAR_RULE_OPEN) {
		GRAMMAR_RULE_GAME_RESTRICTIONS[key] = JSON.parse(JSON.stringify(GRAMMAR_RULE_COMMON));
		for (var i = 0; i < GRAMMAR_RULE_OPEN[key].length; i++) {
		var InnerValue = GRAMMAR_RULE_OPEN[key][i];
		GRAMMAR_RULE_GAME_RESTRICTIONS[key][InnerValue] = true;
		}
		}

        //根據語法的特別規則
        var GRAMMAR_RULE_GAME_SPECIAL = {
            noneInt: ['两重', '三重', '四重', '两对重', '二兄弟', '三兄弟', '四兄弟'],//沒有數字
            noneExcept: ['两数合', '三数合', '值范围', '全转', '上奖', '移', '排除'], //沒有除
            noneSameTimeUse: [['两数合', '三数合']]//不能同時出現的玩法
        }

        return function (maker, input, output) {
            codeMaker = maker;
         
                GlobalError = null;
                var val = input;
                // 进行关键字替换
                // 可减少逻辑判断相关正则的复杂度
                val = optimize(val, 1);
                //上獎/上比較特別, 需在這裡替換
                val = checkString(val);
                if (INVALID_CHAR.test(val)) {
                    return showError();
                }
                codeMaker.reset();
                Rows = val.split(/[\n｡]/);
                getRowsList();
                //setTimeout(function () {
                //    cleanAllList(RowsList);
                //}, 1);
                //檢查玩法
                var codeMakerChoose = '';
                var getMoney = '';
                var checkNumberOrString = true;
                var cnaGenerate = false;
                var getDicNoType;
                //一次處理一行
                for (var i = 0; i < RowsList.length; i++) {
                    getMoney = '';
                    codeMakerChoose = '';
                    getDicNoType = '';
                    codeMaker.reset();
                    var regex = /^[0-9X=.现]+$/i; // 用正則表達式來匹配數字及英文X
                    checkNumberOrString = regex.test(RowsList[i].replace(/[,\s\|\/]/g, ''));
                    if (!checkNumberOrString) {
                        //只有數字組合可以用/ or |
                        var regTestPipe = /\//g;
                        if (regTestPipe.test(RowsList[i])) {
                            return showError();
                        }

                        Object.entries(MODULE_NAMES).forEach(([key, value]) => {
                            const reg = new RegExp(key);
                            if (reg.test(RowsList[i])) {
                              if (key === '五') {
                                codeMakerChoose = value;
                              } else {
                                if (codeMakerChoose !== '') {
                                  return showError();
                                } else {
                                  codeMakerChoose = value;
                                }
                              }
                            }
                          });
                        //只有一種玩法則直接帶入定位
                        for (var key in SINGLE_PLAY_TYPE) {
                            var regSingle = new RegExp(key);
                            if (regSingle.test(RowsList[i])) {
                              if (codeMakerChoose == 40 || codeMakerChoose == '') {
                                codeMakerChoose = SINGLE_PLAY_TYPE[key];
                              } else {
                                return showError();
                              }
                            }
                          }

                        //將玩法寫至codeMaker
                        codeMaker.choose(codeMakerChoose);
                        //console.log('RowsList[i] ', RowsList[i]);
                        //取千、百、十、個
                        var getNumberDigitsObj = getNumberDigits(RowsList[i]);
                        //沒有輸入幾定位時, 根據以下規則進行定位判斷
                        if (codeMakerChoose == '') {
                            //當沒有出現定位時, 會根據千百十个進行補定位, 五除外因為已經判斷過了
                            var regPosCheck = /[二三四][定]|[二三四][现]/g;
                            var regPosCheckAllBefore = /全[大小单双]/g;
                            var regPosCheckAllAfter = /[大小单双]全/g;
                            var regPosAll = /([大小单双X]{2,})/g;
                            var getPosNum = 0;
                            //優先度1
                            if (regPosCheckAllBefore.test(RowsList[i]) || regPosCheckAllAfter.test(RowsList[i])) {//有全大小單雙, 直接指派為四定
                                getPosNum = 40;
                            }
                            //優先度2
                            if (!regPosCheck.test(RowsList[i]) && getPosNum == 0) { //根據千百十个進行定位判斷
                                Object.keys(getNumberDigitsObj.result).forEach(function (key) {
                                    var value = getNumberDigitsObj.result[key];
                                    if (value !== null) {
                                      getPosNum++;
                                    }
                                  });
                                if (getPosNum > 1) {
                                    getPosNum = getPosNum * 10;
                                }
                            }
                            //優先度3
                            if (regPosAll.test(RowsList[i]) && getPosNum == 0) {//符合ex: 大大大 > 三定
                                regPosAll.lastIndex = 0;//因為前面regPosAll test搜尋過, 會導致lastIndex不在0的位置, 因此將reg的lastIndex歸0
                                var getMiddleText = regPosAll.exec(RowsList[i]);
                                if (getMiddleText != null) {
                                    if (getMiddleText[1].length > 1 && getMiddleText[1].length < 6) { //當抓取的超出範圍, 直接判定錯誤
                                        var getMiddleTextCount = 0;
                                        var getMiddleTextSplit = getMiddleText[1].split('');
                                        for (var a = 0, b = getMiddleTextSplit.length; a < b; a++) {
                                            if (getMiddleTextSplit[a] != 'X') {
                                                getMiddleTextCount++
                                            }
                                        }
                                        //五位二定判定
                                        if (getMiddleTextSplit.length == 5) {
                                            if (getMiddleTextSplit[4] == "X" || getMiddleTextCount != 2) {//五位最後一位一定有數字, 沒數字代表錯的
                                                getMiddleTextCount = 1;
                                            } else {
                                                getMiddleTextCount = 5;
                                            }
                                        }
                                        getPosNum = getMiddleTextCount * 10;
                                    } else {
                                        return showError();
                                    }
                                }
                            }
                            if (getPosNum != 0) {
                                if (getPosNum >= 20) {
                                    codeMaker.choose(getPosNum);
                                } else {
                                    return showError();
                                }
                            }
                        }
                        //取得玩法
                        getDicNoType = getOption('numberType');
                        //console.log('getDicNoType ', getDicNoType);
                        //將千、百、十、個的除取放入
                        setOption(DICT['定位置'], getNumberDigitsObj.filter);
                        //將千、百、十、個的值放入codeMaker
                        Object.keys(getNumberDigitsObj.result).forEach(function(key) {
                            if (getNumberDigitsObj.result[key]!= null || getNumberDigitsObj.result[key]!= undefined) {
                              setOption(PLACER_NUMBER[key], getNumberDigitsObj.result[key].toString());
                            }
                          });
                        //數字放入後, 才將全進行轉換
                        RowsList[i] = optimize(RowsList[i], 2);
                        //位數已經轉換成數字, 剩下的玩法直接用replace替換掉大小單双(合大)
                        var regAssign = /((两|三)数合|上奖|包含|排除|全转)大/g;
                        Object.keys(RE_PLACER).forEach(key => {
                            const value = RE_PLACER[key];
                            const regAssign = new RegExp("((两|三)数合|上奖|包含|排除|全转)" + key, 'g');
                            RowsList[i] = RowsList[i].replace(regAssign, "$1" + value);
                          });
                        //取得等號後面的金額
                        getMoney = RowsList[i].split('=')[1];

                        //檢查語法規則是否符合玩法
                        Object.keys(GRAMMAR_RULE_GAME_RESTRICTIONS[getDicNoType]).forEach(function(key) {
                            if (!GRAMMAR_RULE_GAME_RESTRICTIONS[getDicNoType][key]) {
                              if (RowsList[i].indexOf(key)!== -1) {
                                return showError();
                              }
                            }
                          });
                        //將字串語法規則抓出
                        //console.log('RowsList[i] ', RowsList[i]);
                        var getRule = findErXiongDi(RowsList[i], getDicNoType);
                        //後續追加語法規則
                        exceptionRule(getRule, RowsList[i], getDicNoType);
                        //console.log('getRule ', getRule);
                        //快選有的功能快譯的語法類型沒有定義
                        extraRules(RowsList[i], getDicNoType, getNumberDigitsObj);

                        //檢查選號邏輯有沒有出現
                        for (const [key, value] of Object.entries(getNumberDigitsObj.result)) {
                            if (value!== null) {
                              cnaGenerate = true;
                              break;
                            }
                          }

                        //檢查是否有不能同時出現的玩法 ex: 兩數合 & 三數合
                        Object.keys(GRAMMAR_RULE_GAME_SPECIAL.noneSameTimeUse).forEach(function(key) {
                            var value = GRAMMAR_RULE_GAME_SPECIAL.noneSameTimeUse[key];
                            var countCheck = 0;
                            for (var x = 0, y = value.length; x < y; x++) {
                              if (getRule[value[x]]!== undefined && getRule[value[x]][0]!== -1) {
                                countCheck++;
                              }
                            }
                            if (countCheck > 1) {
                              return showError();
                            }
                          });

                        //先檢查語法規則是否有除、或是後面沒有int
                        //將規則放入codemaker
                        Object.entries(getRule).forEach(([key, value]) => {
                            if (value[0]!== -1) { // filter out rules without a match
                              if (value[0] === 1) { // check if the item has an "except" option
                                if (GRAMMAR_RULE_GAME_SPECIAL.noneExcept.includes(key)) { // if the rule is in the list of rules without exceptions, logic error
                                  return showError();
                                }
                              }
                              if (value[1]!== null) { // check if the rule has a number after it
                                if (GRAMMAR_RULE_GAME_SPECIAL.noneInt.includes(key)) { // if the rule doesn't have a number after it, logic error
                                  return showError();
                                }
                              }
                              if (GRAMMAR_RULE_GAME_SPECIAL.noneExcept.includes(key)) {
                                if (DICT[key].length === 2) {
                                  const exceptionFliter = key === '两数合'? 2 : key === '三数合'? 3 : value[0];
                                  setOption(DICT[key][0], exceptionFliter); // "except" or "take"
                                  setOption(DICT[key][1], value[1]?.split('')); // number
                                } else {
                                  if (value[1]!== null) {
                                    setOption(DICT[key], key!== '值范围'? value[1]?.split('') : value[1]);
                                  } else {
                                    return showError();
                                  }
                                }
                              } else {
                                if (DICT[key].length === 2) {
                                  setOption(DICT[key][0], value[0].toString()); // "except" or "take"
                                  if (key === '对数' || key === '固定合分' || key === '大' || key === '小' || key === '单' || key === '双') {
                                    setOption(DICT[key][1], value[1]); // special case for "对数", "固定合分", "大", "小", "单", "双"
                                  } else if (key === '配') {
                                    setOption(DICT[key][1], 1); // "配" and "定位" use positionType separately, 0: default; 1: "配"
                                    // pass the value to the corresponding position
                                    const result = {
                                      '千': value[1][0] === undefined? null : value[1][0],
                                      '百': value[1][1] === undefined? null : value[1][1],
                                      '十': value[1][2] === undefined? null : value[1][2],
                                      '个': value[1][3] === undefined? null : value[1][3],
                                      '五': value[1][4] === undefined? null : value[1][4]
                                    };
                                    Object.entries(result).forEach(([key, value]) => {
                                      if (value!== null || value!== undefined) {
                                        setOption(PLACER_NUMBER[key], value.toString());
                                      }
                                    });
                                  } else {
                                    setOption(DICT[key][1], value[1]?.split('')); // number
                                  }
                                } else {
                                  setOption(DICT[key], value[0].toString());
                                }
                              }
                            }
                          });

                        //檢查是否有篩選條件
                        Object.keys(getRule).forEach(key => {
                            if (getRule[key][0]!== -1) {
                              cnaGenerate = true;
                            }
                          });
                    } else {//純數字 or 14xx
                        var insertNumber;
                        //將一行的數字拆解並放入numberList
                        insertNumber = RowsList[i].split(/[,\s]/g);
                        var newInsertNumber;
                        var regTestXian = /^[0-9]{2,3}?$/;
                        var resultOnlyMoney = /^=\d+(\.\d+)?$/;//等號在最下面的情況
                        var resultOnlyMoneyCheck;
                        var finalNumber = [];

                        for (var x = 0, y = insertNumber.length; x < y; x++) {
                            resultOnlyMoneyCheck = resultOnlyMoney.test(insertNumber[x]);
                            if (!resultOnlyMoneyCheck) {
                                newInsertNumber = insertNumber[x].replace(/=\d+(\.\d+)?/g, '');

                                //透過正則進行判斷輸入是哪種型態
                                //純數字  > 1234   > /^\d{4}$/, use test
                                //數字+X  > 12XX   > /([0-9]|X)/g, use match and match length == 4
                                //組合1   > 12XX12 > /([0-9]|X)/g, use match and match length > 4, use /([0-9]+|X)/g to split for number
                                //組合2   > 12|45XX    > /\|/g, use test, and  /([0-9]+|X)/g to split for string, 與組合3相比需要用 /X/g進行test
                                //組合3   > 12|23, 12|23|45, 12|23|45|67  > /\|/g, use test, and  /([0-9]+)/g to split for string
                                //現      > 12(现), 123(现), 1234(现)   > /^(\d{2,4})(现?)$/g, use test
                                //根據數字位來判斷幾定位
                                var regOnlyNumber = /^\d{4}$/;
                                var regNumberAndX = /([0-9]|X)/g;
                                var regNumberPlusAndX = /([0-9]+|X)/g;
                                var regOnlyPipe = /[\|\/]/g;
                                var regExitX = /X/g;
                                var regExitNumber = /\d/g;
                                var regOnlyNumberPlus = /([0-9]+)/g;
                                var regOnlyNumberAndXian = /^(\d{2,4})(现?)$/g;
                                var regFinalSymbol = /^(?!.*[|\/]{2,})[^|\/].*[^|\/]$/i; //檢查頭尾不能出現|/及字串中間是否連續出現|/
                                var postionNum = ['千', '百', '十', '个', '五'];

                                var chooseType;
                                var getCombation;
                                var getCombationTwo;
                                var countType = 0;

                                //最多只能有三個X
                                if (newInsertNumber.match(regExitX) != null &&
                                    newInsertNumber.match(regExitX).length > 3) {
                                    return showError();
                                }

                                if (newInsertNumber.match(regExitX) != null &&
                                    newInsertNumber.match(regExitX).length == 3) { //五二定
                                    getCombation = newInsertNumber.match(regNumberPlusAndX);
                                    getCombationTwo = newInsertNumber.match(regNumberAndX);

                                    chooseType = 50;
                                    if (getCombationTwo != null && getCombationTwo.length == 5 && getCombationTwo[4] != 'X' && getCombationTwo[4] != undefined) {
                                        finalNumber[x] = newInsertNumber;
                                    } else if (getCombation != null && getCombation.length == 5 && getCombation[4] != 'X' && getCombation[4] != undefined) {
                                        for (var x = 0, y = getCombation.length; x < y; x++) {
                                            if (getCombation[x] != "X") {
                                                setOption(PLACER_NUMBER[postionNum[x]], getCombation[x].toString());
                                            }
                                        }
                                    } else {
                                        return showError();
                                    }
                                } else {
                                    var regOnlyPipeStatus = regOnlyPipe.test(newInsertNumber);

                                    if (regOnlyNumber.test(newInsertNumber)) {
                                        chooseType = 40;
                                        finalNumber[x] = newInsertNumber;
                                    } else if ( newInsertNumber.match(regNumberAndX) != null && newInsertNumber.match(regNumberAndX).length == 4 &&
                                                newInsertNumber.match(regExitX) != null && newInsertNumber.match(regExitX).length < 3 && !regOnlyPipeStatus) {
                                        chooseType = newInsertNumber.match(regExitNumber).length * 10;
                                        finalNumber[x] = newInsertNumber;
                                    } else if ( newInsertNumber.match(regNumberAndX) != null && newInsertNumber.match(regNumberAndX).length > 4 &&
                                                newInsertNumber.match(regExitX) != null && newInsertNumber.match(regExitX).length < 3 && !regOnlyPipeStatus) {
                                        getCombation = newInsertNumber.match(regNumberPlusAndX);
                                        if (getCombation.length == 4) {
                                           getCombation.forEach(function (value) {
                                               if (value != 'X') {
                                                   countType++;
                                               }
                                           });
                                           chooseType = countType * 10;
                                           for (var x = 0, y = getCombation.length; x < y; x++) {
                                               if (getCombation[x] != "X") {
                                                   setOption(PLACER_NUMBER[postionNum[x]], getCombation[x].toString());
                                               }
                                           }
                                        } else {
                                           return showError();
                                        }
                                    } else if (regOnlyPipeStatus) {
                                        if (regExitX.test(newInsertNumber)) { //存在X
                                            getCombation = newInsertNumber.match(regNumberPlusAndX);
                                            if (getCombation.length != 4) {
                                                return showError();
                                            }
                                        } else {
                                            getCombation = newInsertNumber.match(regOnlyNumberPlus);
                                            if (!regFinalSymbol.test(newInsertNumber) || (getCombation != null && getCombation.length > 4)) {
                                                return showError();
                                            }
                                        }
                                        getCombation.forEach(function (value) {
                                            if (value != 'X') {
                                                countType++;
                                            }
                                        });
                                        chooseType = countType * 10;
                                        for (var x = 0, y = getCombation.length; x < y; x++) {
                                            if (getCombation[x] != "X") {
                                                setOption(PLACER_NUMBER[postionNum[x]], getCombation[x].toString());
                                            }
                                        }
                                    } else if (regOnlyNumberAndXian.test(newInsertNumber)) {
                                        var replaceInsert = newInsertNumber.replace('现', '');
                                        finalNumber[x] = {
                                            bet_no: replaceInsert,
                                            isXian: true
                                        }
                                    } else {
                                        return showError();
                                    }
                                }
                                if (chooseType != undefined) {
                                    codeMaker.choose(chooseType);
                                }
                            }
                        }
                        if (!resultOnlyMoneyCheck) {
                            codeMaker.numberList = finalNumber;
                        }
                        //取得等號後面的金額
                        getMoney = RowsList[i].split('=')[1];
                        cnaGenerate = true;
                    }
                    //未選號 or 沒有篩選條件, 跳格式錯誤
                    if (!cnaGenerate) {
                        return showError();
                    }

                    //生成號碼
                    codeMaker.generate();

                    var moneyRegTest = /^[0-9]+(\.[1-9])?$/;

                    if (getMoney != undefined && !moneyRegTest.test(getMoney)) {
                        return showError();
                    } else {
                        AllList[i] = {
                            numbers: codeMaker.numberList,
                            money: getMoney == undefined ? null : getMoney,
                            isXian: getOption('isXian')
                        };
                    }
                }
                //moneyAssign();
                showAllList();
            FormatedMap = analyseAllList(AllList);
            if (output) {
                outputElement = output;
              }
            return {
                getBets: function (inputBetString, periodNo) {
                    console.log(FormatedMap);
                   

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
                                DictNoTypeId: getTypeId(bb.bet_no, bb.isXian)
                            });
                        }
                    }
                    return {
                        totalCount: FormatedMap.totalCount,
                        totalBetMoney: FormatedMap.totalBetMoney,
                        bets: resultBets,
                        way: 108,
                        period_no: periodNo,
                        bet_log: encodeURIComponent(inputBetString)
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
                        FormatedMap.totalBetMoney = money ? (money * FormatedMap.bets.length).toFixed(1) : 0;
                        //generateHTML(FormatedMap);
                    }

                },
                reset: function () {
                    // $(input).val('');
                    // $(output).html('');
                    // $('.moneyInput').val(0);
                    // $('.totalCount').text(0);
                    // $('.ky_totalBetMoney').text('0.0');
                    FormatedMap = {};
                    AllList = {};
                }
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
       // generator.getAllList();
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