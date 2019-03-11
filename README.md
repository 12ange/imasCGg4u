# Idol Master Cinderella Girls Icons on SVG

内部的にはSVGを利用した、アイコン(類)

## thatring.js - Web Components 版・デレステのメニュー背景にあるあの輪っか

```html
<imascgss-thatring
	data-colors="省略可能"
	data-widths="円周"
	data-pattern="JSON"
	data-hintN="JSON"
></imascgss-thatring>
```

でざっくり指定すれば、使える。詳しくは /thatring.htm に使用例があるのでそっちで。

## ひょっとして

属性アイコンも Custom Element 風に実装すればいいのでは。

未定義のタグは、とりあえず span タグのような見た目になる？  
例えば `<undefined-tag>content</undefined-tag>` とした場合、content と表示される

```html
<imascgss-typeicon
	data-idoltype="cute"
	data-iconstyle="major"
>(Cu)<!-- 代替文字列 --></imascgss-typeicon>
```
とすればフォールバックもいける。たぶん。

```css
imascgss-typeicon :not(:defined){ opacity:0; }
```
で、未定義状態で表示された場合に隠してもよい。

> ### 覚え書き: Custom Element の定義を含む Javascript の実行タイミング
>
> ブラウザーは Google Chrome 72, thatringを使って実験した結果
>
> 1. HTML読込・解析完了
> 1. deferで読み込んだJSを実行開始
> 1. `window.customElements.define( dashed-tag-name, class )` に当たった
> 1. 対応するクラスのコンストラクタを「使われた回数」実行
> 1. JS実行完了、`DOMContentLoaded` イベント発火
>
> という流れでした。  
> ページ内scriptなどで出現前に置くと何故か反映されなかったので、HTML解析完了してないと上手く働かないのかしら。
>
> https://developers.google.com/web/fundamentals/web-components/customelements?hl=ja
>
> HTML解析完了時点で、後の CustEle は (＝ CustEle として使える名前がついた要素は・一時的に) `HTMLElement` 型とみなされる……だからまっさらから CustEle を作るときは `extend HTMLElement` でないとなんだね。

DOMツリーを動的に生成するなら結局JSなので、
* JSが直接触るビルダークラス
* ↑を継承するなり保持するなりした CustEle 専用無名クラス (define関数の第2引数に直書き)
の2本立てにして、HTMLを手打ちしてJSノータッチの静的ページは CustEle で簡単に使えるようにすればいいかな。

----

1. attributeChangedCallback()をうまいこと使いたい
1. けれど data-pattern と data-hint* が不可分な存在である
1. 💡 data-pattern を JSON で要求すればいいじゃん 💡 そしてhint配列をpattern配列に埋め込めばいいじゃん
1. 💭 data-widths と data-pattern はともに(本来は) doublet なので、JSON 形式で doublet 単位で要求する風にしても良さげ
1. 💥 data-widths と data-pattern もそれ自体が doublet に出来るじゃん。つまり `[ [ <半径>,<幅>,<内側の形状=[]>,<外側の形状=[]> ], ...]` とまとめてしまって、それを監視する要素にするのです

てことで

* 今まで通りの `data-colors`
* 形状情報を集約した `data-json`

の 2 要素を監視すればいいってことですね。
