// ===================================================================
// FACE YOGA EXERCISES — 拡張44種（v6.11）
//
// 既存76種と重ならない「抜けていた切り口」を足して、30日を飽きずに
// 続けられるようにするための追加セット。合計120種。
//
// 追加の考え方:
//   ・同じ部位でも「鍛える／ゆるめる／抵抗をかける／感覚をつかむ」で別種目にする
//   ・道具なしで場所を選ばないものを優先（続けやすさ）
//   ・朝向き／夜向きを散らして、1日の中でも飽きないようにする
//
// 手順の本文とイラストは motion-data-ext.js に1本化。
// このファイルは「種目のプロフィール」だけを持つ。
// ===================================================================
import { ICON } from './exercise-icons.js';

export const EXERCISES_EXT = {

  // ============== 額・眉間（4） ==============
  browInnerLift: {
    id:'browInnerLift', name:'眉頭アップ', category:'training', kind:'training',
    duration:'約1分', equipment:'鏡', illustration: ICON.brow,
    purpose:'眉全体ではなく「眉頭だけ」を上げ分ける練習。眉の左右差や、眉間の力みぐせを整えます。',
    targets:['眉頭','眉間','おでこ'],
    cues:{ do:'眉頭だけを、真上にそっと持ち上げる', dont:'眉を寄せない／目を見開かない' },
    why:'眉は「頭側」「山」「尻」で動きが違います。分けて動かせるようになると、表情の細かい調整がききます。',
  },
  foreheadHold: {
    id:'foreheadHold', name:'おでこ固定・目あけトレ', category:'training', kind:'training',
    duration:'約1分', equipment:'指', illustration: ICON.eye,
    purpose:'手でおでこを押さえたまま目を見開きます。おでこに頼らずまぶただけで開く感覚をつかむ種目です。',
    targets:['上まぶた','おでこ'],
    cues:{ do:'おでこは動かさず、目だけを開く', dont:'眉が上がってしまうなら、力を弱めてOK' },
    why:'目を開くときにおでこで代用するクセがあると、額に横ジワが寄りやすくなります。役割を分ける練習です。',
  },
  browBonePress: {
    id:'browBonePress', name:'眉の骨きわ押し', category:'training', kind:'stretch',
    duration:'約40秒', equipment:'指', illustration: ICON.relax,
    purpose:'眉の下にある骨のふちを、眉頭から眉尻へ押していきます。目の奥の重だるさに。',
    targets:['眉の下','目のまわり'],
    cues:{ do:'骨のふちに親指をあて、5秒ずつ押す', dont:'目の玉を押さない' },
    why:'眉の下の骨のふちは、まぶたを持ち上げる動きに関わる場所。ゆるむと目が開けやすく感じます。',
  },
  foreheadTap: {
    id:'foreheadTap', name:'おでこタッピング', category:'training', kind:'stretch',
    duration:'約40秒', equipment:'指', illustration: ICON.relax,
    purpose:'指の腹でおでこ全体を軽くトントン。こすらずに血色と軽さを出したいときに。',
    targets:['おでこ','生えぎわ'],
    cues:{ do:'指の腹で、雨だれのように軽く', dont:'爪を立てない／強く叩かない' },
    why:'こするより刺激が弱いぶん、皮ふへの負担が少ない方法です。メイクの上からでもできます。',
  },

  // ============== 目（6） ==============
  upperLidHold: {
    id:'upperLidHold', name:'まぶた単独トレ', category:'training', kind:'training',
    duration:'約1分', equipment:'指', illustration: ICON.eye,
    purpose:'眉を指で押さえて動かないようにし、まぶただけで目を開いてキープします。',
    targets:['上まぶた'],
    cues:{ do:'眉は指で止めたまま、黒目の上が見えるまで開く', dont:'あごを上げて見ようとしない' },
    why:'眉を止めると、まぶたを上げる動きだけを取り出せます。回数より「使えている感覚」が大事な種目です。',
  },
  squintHold: {
    id:'squintHold', name:'下まぶた細めキープ', category:'training', kind:'training',
    duration:'約1分', equipment:'鏡', illustration: ICON.eye,
    purpose:'下まぶただけを持ち上げて、目を細める形をキープ。目の下のハリと涙袋づくりに。',
    targets:['下まぶた','目の下'],
    cues:{ do:'下まぶただけを持ち上げる（笑うときの下まぶた）', dont:'眉やほおまで一緒に動かさない' },
    why:'目の下は意識しないとほとんど動かない場所。動かし分けができると、目元の印象が変わります。',
  },
  eyeSqueeze: {
    id:'eyeSqueeze', name:'ギュッと閉じて・パッと開く', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.eye,
    purpose:'目を強く閉じる→大きく開くをくり返し、目のまわり全体の切り替えを目覚めさせます。',
    targets:['目のまわり','まぶた'],
    cues:{ do:'閉じるときも開くときも、5秒ずつしっかり', dont:'肩や首まで力を入れない' },
    why:'ずっと同じ開き具合でいると、目のまわりは動きが小さくなります。振り幅を作るのが目的です。',
  },
  orbitPress: {
    id:'orbitPress', name:'目のふち（骨）押し', category:'training', kind:'stretch',
    duration:'約1分', equipment:'指', illustration: ICON.relax,
    purpose:'目のまわりをぐるりと囲む骨のふちを、内側から外側へ順に押していきます。',
    targets:['目のまわり','目の下'],
    cues:{ do:'骨の上だけを、3秒ずつやさしく', dont:'眼球を押さない／強く押さない' },
    why:'骨のふちに沿って押すと、目の玉に触れずに目元まわりをゆるめられます。夜のケアにも向きます。',
  },
  palming: {
    id:'palming', name:'手のひらで目を温める', category:'training', kind:'stretch',
    duration:'約1分', equipment:'なし', illustration: ICON.relax,
    purpose:'こすった手のひらで目を覆い、光を遮って休ませます。画面を見続けた日の終わりに。',
    targets:['目のまわり'],
    cues:{ do:'手のひらのくぼみで、目を圧迫せずに覆う', dont:'目の玉を押さえない' },
    why:'まぶたを閉じて光を遮るだけでも、目のまわりの力みは抜けます。道具がいらないのが利点です。',
  },
  eyeFigure8: {
    id:'eyeFigure8', name:'目で8の字', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.eye,
    purpose:'顔を動かさず、目だけで大きく8の字を描きます。ぐるぐる運動より広い範囲を使えます。',
    targets:['目のまわり'],
    cues:{ do:'顔は正面のまま、目だけをゆっくり', dont:'速く動かさない／首を回さない' },
    why:'同じ距離・同じ向きばかり見ていると動きが偏ります。普段使わない向きまで動かすのが目的です。',
  },

  // ============== 頬（6） ==============
  cheekBoneLift: {
    id:'cheekBoneLift', name:'ほお骨リフト', category:'training', kind:'training',
    duration:'約1分', equipment:'鏡', illustration: ICON.cheek,
    purpose:'口角を上げたまま、ほお骨の一番高いところを真上に押し上げるイメージでキープします。',
    targets:['ほお骨','ほお'],
    cues:{ do:'ほおの一番高い位置が上がっているか鏡で確認', dont:'あごを前に出さない' },
    why:'ほおが上がると、その下の影が減って中顔面が短く見えます。「高さ」を意識するのがコツです。',
  },
  cheekResist: {
    id:'cheekResist', name:'ほお ふくらませ・押し返し', category:'training', kind:'training',
    duration:'約1分', equipment:'指', illustration: ICON.cheek,
    purpose:'ほおを空気でふくらませ、手で外から軽く押し返して、抵抗をかけながらキープします。',
    targets:['ほお','口のまわり'],
    cues:{ do:'空気が漏れないよう、唇はしっかり閉じる', dont:'強く押しすぎない／息を止め続けない' },
    why:'抵抗をかけると、ふくらませるだけより手ごたえが出ます。強度を上げたい日に向きます。',
  },
  smileSquint: {
    id:'smileSquint', name:'目も笑う笑顔', category:'training', kind:'training',
    duration:'約1分', equipment:'鏡', illustration: ICON.cheek,
    purpose:'口角だけでなく、下まぶたも一緒に持ち上げる笑顔をつくります。写真うつりの練習にも。',
    targets:['ほお','下まぶた','口角'],
    cues:{ do:'下まぶたが少し持ち上がるところまで', dont:'目を細めすぎて力まない' },
    why:'口元だけの笑顔と、目元まで動く笑顔は見え方が変わります。ほおと目元を連動させる練習です。',
  },
  cheekTongueSweep: {
    id:'cheekTongueSweep', name:'ほおの内側なぞり上げ', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.tongue,
    purpose:'舌先でほおの内側を、下から上へゆっくりなぞり上げます。口を閉じたままできます。',
    targets:['ほお','口のまわり'],
    cues:{ do:'外から見て、ほおが下から上へ動くのがわかる速さで', dont:'速く回さない（ベロ回しとは別物）' },
    why:'ぐるぐる回すのと違い、上向きの動きだけを繰り返します。方向を決めて動かすのが狙いです。',
  },
  midfaceLift: {
    id:'midfaceLift', name:'中顔面リフト（指サポート）', category:'training', kind:'training',
    duration:'約1分', equipment:'指', illustration: ICON.cheek,
    purpose:'小鼻の横に指をそえて軽く支え、その状態で口角とほおを引き上げます。',
    targets:['小鼻の横','ほお','口角'],
    cues:{ do:'指はあくまで軽い目印。力は顔で出す', dont:'指で皮ふを引っぱり上げない' },
    why:'目印があると、狙った場所が動いているか確かめやすくなります。感覚がつかめたら指なしでも。',
  },
  cheekHoldOne: {
    id:'cheekHoldOne', name:'片ほお高さキープ', category:'training', kind:'training',
    duration:'約1分', equipment:'鏡', illustration: ICON.cheek,
    purpose:'片方のほおだけを上げてキープし、左右を比べます。上げにくい側を長めにキープします。',
    targets:['ほお','口角'],
    cues:{ do:'上げにくい側を2倍の時間キープ', dont:'首をかたむけて「上がったこと」にしない' },
    why:'利き側ばかり使うクセは誰にでもあります。苦手な側を多めにやるのが左右差ケアの基本です。',
  },

  // ============== 口・唇（6） ==============
  strawPose: {
    id:'strawPose', name:'ストロー吸い込み', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.mouth,
    purpose:'ストローを吸うように唇をすぼめて、そのまま吸い込む力をキープします。',
    targets:['口のまわり','鼻の下'],
    cues:{ do:'ほおがへこむくらい、吸い込む形をキープ', dont:'実際に息を吸い続けない（形だけ）' },
    why:'唇をすぼめるだけより、吸い込む形にすると口のまわり全体に力が入ります。',
  },
  lipRollIn: {
    id:'lipRollIn', name:'唇の巻き込みキープ', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.mouth,
    purpose:'上下の唇を歯の内側に巻き込んで、10秒キープします。口のまわりの引き締めに。',
    targets:['口のまわり','鼻の下','あご先'],
    cues:{ do:'あご先に力が入りすぎないように', dont:'歯で唇を噛まない' },
    why:'唇を「内へ」動かすのは普段しない動きです。使っていない向きを入れるのが目的です。',
  },
  whistlePose: {
    id:'whistlePose', name:'口笛の形キープ', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.mouth,
    purpose:'口笛を吹く形を作り、10秒キープ×数回。鼻の下の縦の伸びを感じる種目です。',
    targets:['口のまわり','鼻の下'],
    cues:{ do:'鼻の下が縦に伸びる感じがあればOK', dont:'あごを前に突き出さない' },
    why:'口をすぼめる形の中でも、口笛の形は鼻の下が伸びやすい形です。すぼめ系のバリエーションに。',
  },
  mouthWideI: {
    id:'mouthWideI', name:'「い」の横引きキープ', category:'training', kind:'training',
    duration:'約1分', equipment:'鏡', illustration: ICON.mouth,
    purpose:'「い」の形で口角を真横いっぱいに引き、そのまま10秒キープします。',
    targets:['口角','ほお','あご下'],
    cues:{ do:'左右が同じ幅に引けているか鏡で確認', dont:'首すじが浮くほど力まない' },
    why:'「あいうえお体操」を通しでやる代わりに、いちばん効かせたい形だけを長くキープする種目です。',
  },
  lipCornerPull: {
    id:'lipCornerPull', name:'片口角アップ', category:'training', kind:'training',
    duration:'約1分', equipment:'鏡', illustration: ICON.mouth,
    purpose:'片方の口角だけを斜め上に引き上げます。左右を比べて、上がりにくい側を多めに。',
    targets:['口角','ほお'],
    cues:{ do:'反対側の口角は動かさないまま', dont:'顔全体を傾けない' },
    why:'片側だけ動かす種目は難しいぶん、左右の違いがはっきり出ます。苦手な側の練習になります。',
  },
  lipUpDownAir: {
    id:'lipUpDownAir', name:'唇の上下 空気移動', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.mouth,
    purpose:'口を閉じたまま、空気を上唇の裏→下唇の裏へ交互に移します。鼻の下とあご先に効きます。',
    targets:['鼻の下','あご先','口のまわり'],
    cues:{ do:'鼻の下がふくらむところまでしっかり', dont:'息を止めっぱなしにしない' },
    why:'ほおの空気ころがしの「縦版」です。横だけでなく縦にも動かすと、口のまわりを一周使えます。',
  },

  // ============== 舌（4） ==============
  tongueUpHold: {
    id:'tongueUpHold', name:'舌の吸い付けキープ', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.tongue,
    purpose:'舌全体を上あごに吸い付けて、口を閉じたまま30秒キープ。あご下の土台づくりに。',
    targets:['舌','あご下'],
    cues:{ do:'舌先だけでなく、舌の真ん中まで吸い付ける', dont:'あごを前に出さない' },
    why:'舌が上あごについている状態は、口を閉じていられる土台になります。キープ系の基本種目です。',
  },
  tongueSidePush: {
    id:'tongueSidePush', name:'舌でほお押し（左右）', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.tongue,
    purpose:'舌先でほおの内側を強く押し、外から手で軽く押し返して5秒キープ。左右交互に行います。',
    targets:['舌','ほお'],
    cues:{ do:'押す側のほおが外にふくらむのを手で感じる', dont:'あごが痛むときは中止' },
    why:'抵抗をかけると、舌の力の左右差がはっきりわかります。弱い側を多めにやると整えやすくなります。',
  },
  tongueGumTrace: {
    id:'tongueGumTrace', name:'歯ぐきなぞり', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.tongue,
    purpose:'舌先で上の歯ぐき→下の歯ぐきを、外側からゆっくりなぞって一周します。',
    targets:['舌','口のまわり'],
    cues:{ do:'口は閉じたまま、ゆっくり一周', dont:'速く回さない' },
    why:'ベロ回しより舌先を細かく使います。口を閉じたままできるので、人前でもこっそりできます。',
  },
  tongueDownPress: {
    id:'tongueDownPress', name:'舌下げ押し合い', category:'training', kind:'training',
    duration:'約1分', equipment:'指', illustration: ICON.chin,
    purpose:'舌を下に押し下げ、同時にあご下を親指で上に押し返して5秒キープします。',
    targets:['あご下','舌'],
    cues:{ do:'あご下が硬くなるのを指で感じる', dont:'のどを強く押さない' },
    why:'あご下は自分では動きが見えにくい場所。押し返して硬さを感じると、使えているか確認できます。',
  },

  // ============== あご・フェイスライン（5） ==============
  chinKissUp: {
    id:'chinKissUp', name:'あご上げキス', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.chin,
    purpose:'斜め上を向いて、天井にキスするように唇をとがらせ、あご下から首の前を伸ばします。',
    targets:['あご下','首の前'],
    cues:{ do:'首の前がしっかり伸びるところで5秒', dont:'のけぞりすぎない／首が痛むときは中止' },
    why:'あご上げポーズに唇の動きを足した形です。首の前を伸ばしながら口元も使えます。',
  },
  jawResist: {
    id:'jawResist', name:'あご開き・押し合い', category:'training', kind:'training',
    duration:'約1分', equipment:'指', illustration: ICON.jaw,
    purpose:'あご先に手をあてて閉じる方向に軽く抵抗をかけながら、ゆっくり口を開きます。',
    targets:['あご','あご下'],
    cues:{ do:'指2本ぶん開くところまで、ゆっくり', dont:'あごに痛みや音が出たら中止' },
    why:'ただ開くより、ゆっくり抵抗をかけたほうが動きを丁寧にコントロールできます。',
  },
  submentalPush: {
    id:'submentalPush', name:'あご下の押し上げ', category:'training', kind:'training',
    duration:'約1分', equipment:'指', illustration: ICON.chin,
    purpose:'両手の親指をあご下にあてて上に押し上げ、その手に向かってあごを引き下げて押し合います。',
    targets:['あご下','首の前'],
    cues:{ do:'押し合ったまま5秒、息は止めない', dont:'のど仏の上を強く押さない' },
    why:'あご下の「押し合い」は道具なしでできる強めの種目です。二重あごが気になる日に。',
  },
  jawLineTrace: {
    id:'jawLineTrace', name:'フェイスラインなぞり上げ', category:'training', kind:'stretch',
    duration:'約40秒', equipment:'指', illustration: ICON.relax,
    purpose:'指の関節であご先からエラ、耳の下へ、フェイスラインに沿ってなぞり上げます。',
    targets:['フェイスライン','エラ','耳の下'],
    cues:{ do:'骨のきわに沿って、耳の下まで流す', dont:'強くこすらない／肌が乾いたままやらない' },
    why:'輪郭のラインに沿って一方向に流す動きです。仕上げに耳の下まで通すのがポイントです。',
  },
  chinSideTuck: {
    id:'chinSideTuck', name:'斜めチンタック', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.chin,
    purpose:'あごを斜め後ろに引いて5秒キープ。左右それぞれで行い、引きにくい側を多めにします。',
    targets:['あご下','首の前','首の横'],
    cues:{ do:'斜め後ろへ、水平にスライドさせる', dont:'あごを上げない／首が痛むときは中止' },
    why:'まっすぐ引くチンタックに角度を足した形です。左右差のある人はこちらのほうが違いが出ます。',
  },

  // ============== エラ・こめかみ（4） ==============
  masseterDeep: {
    id:'masseterDeep', name:'エラの深ほぐし（口を開けて）', category:'training', kind:'stretch',
    duration:'約1分', equipment:'指', illustration: ICON.jaw,
    purpose:'口を軽く開けてエラの力を抜いた状態で、指の腹でゆっくり円を描いてほぐします。',
    targets:['エラ','あごの関節まわり'],
    cues:{ do:'口を開けて力が抜けた状態でほぐす', dont:'痛みが出るほど押さない／あごが痛むときは中止' },
    why:'噛みしめたままほぐすより、口を開けて力が抜けた状態のほうが深いところまで届きます。',
  },
  templeCircle: {
    id:'templeCircle', name:'こめかみ円マッサージ', category:'training', kind:'stretch',
    duration:'約40秒', equipment:'指', illustration: ICON.relax,
    purpose:'こめかみに指の腹をあて、大きくゆっくり円を描きます。かみしめや目の疲れの後に。',
    targets:['こめかみ'],
    cues:{ do:'皮ふごと動かすくらい、ゆっくり大きく', dont:'滑らせてこすらない' },
    why:'こめかみは噛む動きでも目の動きでも使われる場所。どちらの疲れにもはさみたい種目です。',
  },
  jawDrop: {
    id:'jawDrop', name:'あごストン（脱力）', category:'training', kind:'stretch',
    duration:'約40秒', equipment:'なし', illustration: ICON.relax,
    purpose:'あごの力を完全に抜いて、自分の重さで下に落とします。力みに気づくための種目です。',
    targets:['あご','エラ','口のまわり'],
    cues:{ do:'歯と歯が触れていない状態を30秒', dont:'口を大きく開けようとしない（脱力だけ）' },
    why:'力を抜く感覚は、鍛える種目と同じくらい大切です。日中のかみしめに気づくきっかけになります。',
  },
  innerCheekRelease: {
    id:'innerCheekRelease', name:'口の中からエラをゆるめる', category:'training', kind:'stretch',
    duration:'約1分', equipment:'指', illustration: ICON.jaw,
    purpose:'清潔な指を口の中に入れ、ほおの内側からエラのあたりを外側の指とはさんでゆるめます。',
    targets:['エラ','ほおの内側'],
    cues:{ do:'手を洗ってから。はさんで、じっとしているだけ', dont:'強くつままない／あごが痛むときは中止' },
    why:'外からだけでは届きにくい厚みに、内と外からはさんで届かせる方法です。夜のケア向きです。',
  },

  // ============== 首・肩・姿勢（5） ==============
  chestOpen: {
    id:'chestOpen', name:'胸を開くストレッチ', category:'training', kind:'stretch',
    duration:'約1分', equipment:'なし', illustration: ICON.neck,
    purpose:'手を後ろで組んで胸を開き、あごを軽く引いたまま30秒キープします。',
    targets:['胸','肩の前','首の前'],
    cues:{ do:'あごは引いたまま、胸だけを開く', dont:'腰を反らせない／あごを突き出さない' },
    why:'胸が閉じていると頭が前に出やすくなります。顔の前に、まず土台をひらく種目です。',
  },
  scapulaSqueeze: {
    id:'scapulaSqueeze', name:'肩甲骨寄せ', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.neck,
    purpose:'左右の肩甲骨を背中の中心に寄せて5秒キープ×10回。デスクワークの合間に。',
    targets:['背中','肩'],
    cues:{ do:'肩を上げずに、後ろへ引いて寄せる', dont:'肩がすくむ／腰が反る' },
    why:'肩が前に入ったままだと首の前がつぶれます。背中から整えると、あごを引きやすくなります。',
  },
  sternoRelease: {
    id:'sternoRelease', name:'首の太い筋ゆるめ', category:'training', kind:'stretch',
    duration:'約1分', equipment:'指', illustration: ICON.neck,
    purpose:'顔を横に向けると浮き出る首の太い筋を、耳の下から鎖骨へやさしくつまんで流します。',
    targets:['首の横','首の前'],
    cues:{ do:'つまんで、離す。上から下へ順に', dont:'強くつままない／首が痛むときは中止' },
    why:'首の前の太い筋は、姿勢でも噛みしめでも張りやすい場所です。ゆるむと首が長く見えます。',
  },
  wallPosture: {
    id:'wallPosture', name:'壁立ち姿勢リセット', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.neck,
    purpose:'かかと・お尻・背中・後頭部を壁につけて30秒。自分の「まっすぐ」を覚え直します。',
    targets:['姿勢','首','背中'],
    cues:{ do:'後頭部が壁につく位置まであごを引く', dont:'あごを上げて無理に頭をつけない' },
    why:'毎日の姿勢は自分では気づきにくいもの。壁を基準にすると、ズレがその場でわかります。',
  },
  headSlideBack: {
    id:'headSlideBack', name:'頭のスライドバック', category:'training', kind:'training',
    duration:'約1分', equipment:'なし', illustration: ICON.neck,
    purpose:'頭を水平のまま後ろへスライドさせて5秒キープ。スマホ姿勢のリセットに。',
    targets:['首','あご下'],
    cues:{ do:'目線の高さは変えず、頭だけ後ろへ', dont:'あごを上げ下げしない' },
    why:'うつむく時間が長いと頭が前に残りがちです。水平にスライドするだけの、どこでもできる種目です。',
  },

  // ============== 全体・呼吸・リラックス（4） ==============
  noseBreathTrain: {
    id:'noseBreathTrain', name:'鼻呼吸トレ', category:'training', kind:'stretch',
    duration:'約1分', equipment:'なし', illustration: ICON.breath,
    purpose:'舌を上あごにつけ、口を閉じたまま鼻でゆっくり4秒吸って6秒吐くをくり返します。',
    targets:['呼吸','舌','口のまわり'],
    cues:{ do:'吐くほうを長く。舌は上あごにつけたまま', dont:'苦しくなるまで我慢しない' },
    why:'口が開いたままの時間が長いと、口元はゆるみやすくなります。閉じている時間を増やす練習です。',
  },
  faceTapAll: {
    id:'faceTapAll', name:'顔ぜんたいタッピング', category:'training', kind:'stretch',
    duration:'約1分', equipment:'指', illustration: ICON.whole,
    purpose:'おでこ→目のまわり→ほお→あご→首へ、指の腹で軽くトントンと降りていきます。',
    targets:['顔全体','首'],
    cues:{ do:'雨だれのように、軽く速く', dont:'目の玉の上は叩かない／強く叩かない' },
    why:'こすらずに顔全体をひと通り触れる方法です。朝の血色づくり、夜の締めのどちらにも使えます。',
  },
  parotidDrain: {
    id:'parotidDrain', name:'耳の下〜首の流し', category:'training', kind:'stretch',
    duration:'約40秒', equipment:'指', illustration: ICON.neck,
    purpose:'耳の下のくぼみに指をあて、首すじに沿って鎖骨まで、ゆっくり一方向に流します。',
    targets:['耳の下','首すじ','鎖骨'],
    cues:{ do:'なでるだけの弱さで、上から下へ一方向', dont:'往復させない／強く押さない' },
    why:'顔の流しは「出口」まで通すのがポイント。耳の下から鎖骨までをつなぐ役割の種目です。',
  },
  nightReset: {
    id:'nightReset', name:'おやすみ前の顔リセット', category:'training', kind:'stretch',
    duration:'約2分', equipment:'なし', illustration: ICON.relax,
    purpose:'眉間→あご→舌→肩の順に、力が入っているところを見つけて抜いていく夜の締めの種目です。',
    targets:['眉間','あご','舌','肩'],
    cues:{ do:'順番に「今ここ力んでる？」と確かめてから抜く', dont:'眠くなったらそのまま終えてOK' },
    why:'力みは自分では気づきにくいもの。場所を順番に確かめると、抜く感覚がつかみやすくなります。',
  },

};
