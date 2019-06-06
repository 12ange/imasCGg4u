# Custom Elements for IM@S Cinderella Girls

内部的にはSVGを利用した、アイコン(類)

## thatring.js - デレステのメニュー背景にあるあの輪っか

```html
<imascgss-thatring
	data-colors="省略可能"
	data-json="JSON"
></imascgss-thatring>
```

でざっくり指定すれば、使える。詳しくは /thatring.htm に使用例があるのでそっちで。


## typeicon.js - シンデレラガールズ属性アイコン

```html
<imascgss-typeicon
	data-type="cute"
	data-style="major"
>(Cu)<!-- 代替文字列 --></imascgss-typeicon>
```
とすればフォールバックもいける。たぶん。

```css
imascgss-typeicon :not(:defined){ opacity:0; }
```
で、未定義状態で表示された場合に隠してもよい。

## imascgss.css - デレステのボタン風ボタンを含む、良さげなスタイルシート

- `<button class="imascgss"> ~ </button>` でデレステのボタン風ボタン
- `<span class="imascgss `属性名小文字/notidol`"> ~ </span>` で属性っぽい強調表示
- `<imascgss-typeicon class="followtype" data-type="~" data-style="~"></imascgss-typeicon>` で属性に応じた色を自動適用

> ### 覚え書き: Custom Element の定義を含む Javascript の実行タイミング
>
> ブラウザーは Google Chrome 72, thatringを使って実験した結果
>
> 1. HTML読込・解析完了
> 1. deferで読み込んだJSを実行開始
> 1. `window.customElements.define( dashed-tag-name, class )` 関数に到達
> 1. ⬆️の第1引数と同名のタグが使われた回数、第2引数クラスのコンストラクタを実行
> 1. JS実行完了、`DOMContentLoaded` イベント発火
>
> という流れでした。  
> ページ内scriptなどで出現前に置くと何故か反映されなかったので、HTML解析完了してないと上手く働かないのかしら。
>
> https://developers.google.com/web/fundamentals/web-components/customelements?hl=ja
>
> HTML解析完了時点で、後の CustEle は (＝ CustEle として使える名前がついた要素は・一時的に) `HTMLElement` 型とみなされる……だからまっさらから CustEle を作るときは `extend HTMLElement` でないとなんだね。
