// Seating Data
const SEATING_DATA = {
  "event": {
    "date": "2026-09-05",
    "ceremony": {
      "time": "15:15",
      "place": "Celebration Hall -The GARDEN-"
    },
    "reception": {
      "time": "16:15-19:15",
      "place": "白鳳館"
    }
  },
  "layout": {
    "width": 100,
    "height": 100,
    "note": "x,y は 0-100 の相対座標。卓の中心点。高砂は上部中央の横長。"
  },
  "seatAngles": {
    "note": "8人円卓の席番→角度（真上を0°として時計回り）",
    "1": 22.5,
    "2": 67.5,
    "3": 112.5,
    "4": 157.5,
    "5": 202.5,
    "6": 247.5,
    "7": 292.5,
    "8": 337.5
  },
  "tables": [
    {
      "id": "takasago",
      "label": "高砂",
      "name": null,
      "x": 50,
      "y": 6,
      "shape": "head",
      "category": "新郎新婦",
      "seatCount": 2,
      "guests": [
        {
          "id": "takasago1",
          "seat": 1,
          "name": "舛甚 利樹",
          "kana": "マスジン リキ",
          "relation": "新郎",
          "side": "groom",
          "photo": null,
          "honorific": null
        },
        {
          "id": "takasago2",
          "seat": 2,
          "name": "長井 奏海",
          "kana": "ナガイ カナミ",
          "relation": "新婦",
          "side": "bride",
          "photo": null,
          "honorific": null
        }
      ]
    },
    {
      "id": "A",
      "label": "A",
      "name": null,
      "x": 20,
      "y": 17,
      "shape": "round",
      "category": "新郎 会社関係",
      "seatCount": 8,
      "guests": [
        {
          "id": "a1",
          "seat": 1,
          "name": "西山 清志郎",
          "kana": "ニシヤマ キヨシロウ",
          "relation": "新郎 会社先輩",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "a2",
          "seat": 2,
          "name": "小森 暁介",
          "kana": "コモリ キョウスケ",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "a3",
          "seat": 3,
          "name": "安達 祐貴",
          "kana": "アダチ ユウキ",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "a6",
          "seat": 6,
          "name": "宮本 藍",
          "kana": "ミヤモト ラン",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "a7",
          "seat": 7,
          "name": "清松 雅斗",
          "kana": "キヨマツ マサト",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "a8",
          "seat": 8,
          "name": "臼井 健太",
          "kana": "ウスイ ケンタ",
          "relation": "新郎 会社先輩",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        }
      ]
    },
    {
      "id": "B",
      "label": "B",
      "name": null,
      "x": 80,
      "y": 17,
      "shape": "round",
      "category": "新婦 職場",
      "seatCount": 8,
      "guests": [
        {
          "id": "b1",
          "seat": 1,
          "name": "吉藤 久子",
          "kana": "ヨシフジ ヒサコ",
          "relation": "新婦 上司",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "b2",
          "seat": 2,
          "name": "三津村 康子",
          "kana": "ミツムラ ヤスコ",
          "relation": "新婦 同僚",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "b6",
          "seat": 6,
          "name": "渡辺 大介",
          "kana": "ワタナベ ダイスケ",
          "relation": "新婦 同僚",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "b7",
          "seat": 7,
          "name": "藤原 裕樹",
          "kana": "フジワラ ユウキ",
          "relation": "新婦 同僚",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "b8",
          "seat": 8,
          "name": "大宝院 清孝",
          "kana": "ダイホウイン キヨタカ",
          "relation": "新婦 上司",
          "side": "bride",
          "photo": null,
          "note": "主賓挨拶・乾杯挨拶",
          "honorific": "様"
        }
      ]
    },
    {
      "id": "C",
      "label": "C",
      "name": null,
      "x": 50,
      "y": 28,
      "shape": "round",
      "category": "新婦 職場",
      "seatCount": 8,
      "guests": [
        {
          "id": "c1",
          "seat": 1,
          "name": "松田 美穂子",
          "kana": "マツダ ミホコ",
          "relation": "新婦 同僚",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "c2",
          "seat": 2,
          "name": "田代 真由",
          "kana": "タシロ マユ",
          "relation": "新婦 同僚",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "c6",
          "seat": 6,
          "name": "高崎 蒼生",
          "kana": "タカサキ アオイ",
          "relation": "新婦 同僚",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "c7",
          "seat": 7,
          "name": "青木 日花",
          "kana": "アオキ ニチカ",
          "relation": "新婦 同僚",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "c8",
          "seat": 8,
          "name": "藤田 茉莉",
          "kana": "フジタ マリ",
          "relation": "新婦 同僚",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        }
      ]
    },
    {
      "id": "D",
      "label": "D",
      "name": null,
      "x": 20,
      "y": 39,
      "shape": "round",
      "category": "新郎 会社関係",
      "seatCount": 8,
      "guests": [
        {
          "id": "d1",
          "seat": 1,
          "name": "瀧川 光輝",
          "kana": "タキガワ コウキ",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "note": "受付",
          "honorific": "様"
        },
        {
          "id": "d2",
          "seat": 2,
          "name": "佐藤 達哉",
          "kana": "サトウ タツヤ",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "d3",
          "seat": 3,
          "name": "中村 優太",
          "kana": "ナカムラ ユウタ",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "d6",
          "seat": 6,
          "name": "武藤 克弥",
          "kana": "ムトウ カツヤ",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "d7",
          "seat": 7,
          "name": "丹野 遼平",
          "kana": "タンノ リョウヘイ",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "note": "受付",
          "honorific": "様"
        },
        {
          "id": "d8",
          "seat": 8,
          "name": "末藤 洸洋",
          "kana": "スエトウ コウヨウ",
          "relation": "新郎 同僚",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        }
      ]
    },
    {
      "id": "E",
      "label": "E",
      "name": null,
      "x": 80,
      "y": 39,
      "shape": "round",
      "category": "新婦 先輩・友人",
      "seatCount": 8,
      "guests": [
        {
          "id": "e1",
          "seat": 1,
          "name": "内山 雄太",
          "kana": "ウチヤマ ユウタ",
          "relation": "新婦 先輩",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "e2",
          "seat": 2,
          "name": "佐々木 奈々子",
          "kana": "ササキ ナナコ",
          "relation": "新婦 先輩",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "e3",
          "seat": 3,
          "name": "高野 よもぎ",
          "kana": "タカノ ヨモギ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "e4",
          "seat": 4,
          "name": "森山 真澄",
          "kana": "モリヤマ マスミ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "e6",
          "seat": 6,
          "name": "秋元 麻衣",
          "kana": "アキモト マイ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "e7",
          "seat": 7,
          "name": "石田 有志",
          "kana": "イシダ ユウシ",
          "relation": "新婦 先輩",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "e8",
          "seat": 8,
          "name": "赤尾 晴香",
          "kana": "アカオ ハルカ",
          "relation": "新婦 先輩",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        }
      ]
    },
    {
      "id": "F",
      "label": "F",
      "name": null,
      "x": 50,
      "y": 50,
      "shape": "round",
      "category": "新婦 友人",
      "seatCount": 8,
      "guests": [
        {
          "id": "f1",
          "seat": 1,
          "name": "中島 真里恵",
          "kana": "ナカシマ マリエ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "f2",
          "seat": 2,
          "name": "中島 そら",
          "kana": "ナカシマ ソラ",
          "relation": "中島 真里恵様 お子さま",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "f3",
          "seat": 3,
          "name": "飯塚 茉佑",
          "kana": "イイヅカ マユ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "f4",
          "seat": 4,
          "name": "池端 美菜",
          "kana": "イケバタ ミナ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "f6",
          "seat": 6,
          "name": "永友 佑",
          "kana": "ナガトモ ユウ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "f7",
          "seat": 7,
          "name": "新井 小夜子",
          "kana": "アライ サヨコ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "note": "受付",
          "honorific": "様"
        },
        {
          "id": "f8",
          "seat": 8,
          "name": "藤井 香菜子",
          "kana": "フジイ カナコ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "note": "受付",
          "honorific": "様"
        }
      ]
    },
    {
      "id": "G",
      "label": "G",
      "name": null,
      "x": 20,
      "y": 61,
      "shape": "round",
      "category": "新郎 友人",
      "seatCount": 8,
      "guests": [
        {
          "id": "g1",
          "seat": 1,
          "name": "天摩 寛樹",
          "kana": "テンマ ヒロキ",
          "relation": "新郎 友人",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "g2",
          "seat": 2,
          "name": "榎本 優斗",
          "kana": "エノモト ユウト",
          "relation": "新郎 友人",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "g3",
          "seat": 3,
          "name": "佐藤 航大",
          "kana": "サトウ コウダイ",
          "relation": "新郎 友人",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "g4",
          "seat": 4,
          "name": "狩野 怜",
          "kana": "カノウ レイ",
          "relation": "新郎 友人",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "g6",
          "seat": 6,
          "name": "馬渡 大壮",
          "kana": "マワタリ ヒロアキ",
          "relation": "新郎 友人",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "g7",
          "seat": 7,
          "name": "杉沢 直樹",
          "kana": "スギサワ ナオキ",
          "relation": "新郎 友人",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "g8",
          "seat": 8,
          "name": "江戸 隆允",
          "kana": "エド リュウスケ",
          "relation": "新郎 友人",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        }
      ]
    },
    {
      "id": "H",
      "label": "H",
      "name": null,
      "x": 80,
      "y": 61,
      "shape": "round",
      "category": "新婦 友人",
      "seatCount": 8,
      "guests": [
        {
          "id": "h1",
          "seat": 1,
          "name": "川口 美聡",
          "kana": "カワグチ ミサト",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "h2",
          "seat": 2,
          "name": "髙橋 夏帆",
          "kana": "タカハシ カホ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "h3",
          "seat": 3,
          "name": "白田 大",
          "kana": "シラタ マサル",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "h6",
          "seat": 6,
          "name": "河邊 拓野",
          "kana": "カワベ タクヤ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "h7",
          "seat": 7,
          "name": "松谷 美千江",
          "kana": "マツタニ ミチエ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "h8",
          "seat": 8,
          "name": "高橋 杏実",
          "kana": "タカハシ アミ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        }
      ]
    },
    {
      "id": "I",
      "label": "I",
      "name": null,
      "x": 50,
      "y": 72,
      "shape": "round",
      "category": "新婦 友人",
      "seatCount": 8,
      "guests": [
        {
          "id": "i1",
          "seat": 1,
          "name": "新谷 萌",
          "kana": "シンタニ モエ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "i2",
          "seat": 2,
          "name": "小林 久緒",
          "kana": "コバヤシ ヒサオ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "i3",
          "seat": 3,
          "name": "宮田 みなみ",
          "kana": "ミヤタ ミナミ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "i7",
          "seat": 7,
          "name": "比企 すみれ",
          "kana": "ヒキ スミレ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "i8",
          "seat": 8,
          "name": "佐久間 友理奈",
          "kana": "サクマ ユリナ",
          "relation": "新婦 友人",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        }
      ]
    },
    {
      "id": "J",
      "label": "J",
      "name": null,
      "x": 20,
      "y": 83,
      "shape": "round",
      "category": "新郎 親族",
      "seatCount": 8,
      "guests": [
        {
          "id": "j1",
          "seat": 1,
          "name": "舘岡 誠久",
          "kana": "タテオカ マサヒサ",
          "relation": "新郎 叔父",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "j2",
          "seat": 2,
          "name": "舛甚 玲偉",
          "kana": "マスジン レイ",
          "relation": "新郎 弟",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "j3",
          "seat": 3,
          "name": "舛甚 涼央",
          "kana": "マスジン リョオ",
          "relation": "新郎 義妹",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "j6",
          "seat": 6,
          "name": "舛甚 千亜紀",
          "kana": "マスジン チアキ",
          "relation": "新郎 母",
          "side": "groom",
          "photo": null,
          "honorific": null
        },
        {
          "id": "j7",
          "seat": 7,
          "name": "舛甚 光春",
          "kana": "マスジン ミツハル",
          "relation": "新郎 父",
          "side": "groom",
          "photo": null,
          "honorific": null
        },
        {
          "id": "j8",
          "seat": 8,
          "name": "舘岡 里美",
          "kana": "タテオカ サトミ",
          "relation": "新郎 叔母",
          "side": "groom",
          "photo": null,
          "honorific": "様"
        }
      ]
    },
    {
      "id": "K",
      "label": "K",
      "name": null,
      "x": 80,
      "y": 83,
      "shape": "round",
      "category": "新婦 親族",
      "seatCount": 8,
      "guests": [
        {
          "id": "k1",
          "seat": 1,
          "name": "越村 美砂",
          "kana": "コシムラ ミサ",
          "relation": "新婦 叔母",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "k2",
          "seat": 2,
          "name": "長井 芳彦",
          "kana": "ナガイ ヨシヒコ",
          "relation": "新婦 父",
          "side": "bride",
          "photo": null,
          "honorific": null
        },
        {
          "id": "k3",
          "seat": 3,
          "name": "長井 美和",
          "kana": "ナガイ ミワ",
          "relation": "新婦 母",
          "side": "bride",
          "photo": null,
          "honorific": null
        },
        {
          "id": "k7",
          "seat": 7,
          "name": "樋口 瑛佳",
          "kana": "ヒグチ エイカ",
          "relation": "新婦 従妹",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        },
        {
          "id": "k8",
          "seat": 8,
          "name": "越村 靖",
          "kana": "コシムラ ヤスシ",
          "relation": "新婦 叔父",
          "side": "bride",
          "photo": null,
          "honorific": "様"
        }
      ]
    }
  ],
  "displayRules": {
    "honorific": "guests[].honorific が null 以外なら氏名の後ろに半角スペースなしで付けて表示する",
    "note": "ご両親（j6 舛甚千亜紀 / j7 舛甚光春 / k2 長井芳彦 / k3 長井美和）は式場データ上は敬称なし。慣例では主催者側のため呼び捨てだが、今回は指定により「様」を付与している。外す場合はこの4名の honorific を null にするだけでよい。"
  }
};
