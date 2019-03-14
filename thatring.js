//========================================================================
// thatring.js
// デレステのメニューなどで背景に出てくるあの虹色輪っか風のモノを生成する
// いわゆる Web Components の習作。
// <imascgss-thatring> というタグで使える。
//
//	+ data-なんたら属性。CSV(カンマ区切り表現)で表す
//		+ data-colors ... 設定色を#rrggbb表現で記す。
//		+ data-json  ... 形状を指定するJSON表記。二重配列で……
//			+ [ [ <半径>,<幅>,<内側の形状=[]>,<外側の形状=[]> ], ...]
//	+ CSSカスタムプロパティ(--*:*)による設定
//		+ --length-size   ... 画像の大きさ
//		+ --time-per-turn ... 1回転当たりの時間
//========================================================================
class imascgssThatring extends HTMLElement{

	//--初期値用の定数--
	static get defaultColors(){ return ["#d995ac","#f59fa0","#ffb195","#ffc887","#f9e08a","#d9d784","#8dd3ad","#71c5be","#71b1c7","#7e9dc3","#9c95c1","#b48fb5"] }
		// PCCS->RGB http://www.wsj21.net/ghp/ghp0c_03.html 使うのは、PCCS light 色相環(12色)
	static get defaultStripJson(){ return [[150,1],[6,4],[4,20],[4,4],[6,1]] }

	//--サブルーチン--
	newTagSVG = tag=>document.createElementNS("http://www.w3.org/2000/svg",tag);
	getTagsSVG = (tag,root=this.shadowRoot)=>root.getElementsByTagNameNS("http://www.w3.org/2000/svg",tag);
	//csv2arr* : CSVを(Str:文字列|Int:整数)配列に
	csv2arrStr = (_str,_fallback=[])=> _str ? _str.split(",") : _fallback;
	csv2arrInt = (_str,_fallback=[])=> _str ? _str.split(",").map(s=>s|0) : _fallback;

	//何かを負でない整数に変換
	toIntZeroPlus = _any=>Math.max(_any|0,0);
	//何かを負でない整数の配列に変換
	toArrayIntZeroPlus = _any=>Array.isArray(_any)?_any.map(o=>Math.max(o|0,0)):[];
	//外径を1とした場合の内径から帯の中央径を導出
	calcMidstrip = _r=>_r+(1-_r)/2;

	//積分(配列)
	integral = a=>{
		let b=[], s=0;
		for(let i in a){ b[i] = s += a[i]; }
		return b;
	};
	//標準化(配列,倍率,下駄)
	normalize = (a,m=1,b=0)=>{
		const x = Math.max(...a);
		return a.map( v=>m*v/x+b );
	};
	//円に内接する正多角形の辺の長さ
	edgelen_regpoly = num_angle=>{
		let w = 2*Math.PI/num_angle;
		let dx = Math.sin(w);
		let dy = 1-Math.cos(w);
		return Math.sqrt(dx*dx+dy*dy);
	};

	constructor(){ super();
		//いの一番↑に親クラスのコンストラクタを必ず呼ぶ

		//SVG各種要素準備
		const svgroot = this.newTagSVG("svg");
		this.elmDefs = this.newTagSVG("defs"); //<clipPath>,<radialGradient>を入れる
		this.elmGrp = this.newTagSVG("g"); //<circle>を入れる
		const clip = this.newTagSVG("clipPath");
		this.elmPath = this.newTagSVG("path");

		svgroot.appendChild(this.elmDefs);
		svgroot.appendChild(this.elmGrp);
		this.elmDefs.appendChild(clip);
		clip.appendChild( this.elmPath );

		svgroot.setAttribute("viewBox", "-1 -1 2 2");
		clip.setAttribute("clip-rule","evenodd");

		//クリッピング設定をつなぎ合わせる
		clip.id = "thatpath";
		this.elmGrp.setAttribute("clip-path",`url(#${clip.id})`);

		//<style> 専用 CSS Style
		let style = document.createElement("style");
		style.textContent =`
		@keyframes oneturn {
			0% {transform:rotate(0turn)}
			100% {transform:rotate(1turn)}
		}
		svg{
			animation: oneturn var(--time-per-turn,10s) linear infinite;
			height: var(--length-size,50vmin);
			width: var(--length-size,50vmin);
		}`;

		//Shadow Root を作って、そこにぶら下げる。これでshadow DOM tree は完成
		let shdwroot = this.attachShadow({mode:"open"})
		shdwroot.appendChild(style);
		shdwroot.appendChild(svgroot);

		//初期設定値を適用 : radiusMidstrip はここで最初に設定
		this.radiusMidstrip = this.calcMidstrip( this.normalize( this.integral(
			(a=>{
				//二重配列を単配列にする；頭2要素のみ
				let b=[],c;
				for(c of a){ b.push(c[0],c[1]) }
				return b;
			})(imascgssThatring.defaultStripJson)
		))[0]);
		this.updateColors(imascgssThatring.defaultColors);
		this.updateClipPath(imascgssThatring.defaultStripJson);
	}


	//グラデーションと円の個数連携(新しい円の数)
	updateGradientCirclesRelation(_newLength){
		let aGradients = this.getTagsSVG("radialGradient",this.elmDefs);
		let aCircles = this.getTagsSVG("circle",this.elmGrp);
		//多い分減らす
		while(_newLength < aCircles.length){
			aGradients[aGradients.length-1].remove();
			aCircles[aCircles.length-1].remove();
		}
		//少ない分増やす
		while(aCircles.length < _newLength){
			let nxtidx = aCircles.length;
			//グラデーション設定
			let raGdt = this.newTagSVG("radialGradient");
			raGdt.id = `filler${nxtidx}`;
			let s1 = this.newTagSVG("stop");
			s1.setAttribute("offset","0");
			s1.setAttribute("stop-opacity","1");
			let s2 = this.newTagSVG("stop");
			s2.setAttribute("offset","1");
			s2.setAttribute("stop-opacity","0");
			raGdt.appendChild(s1);
			raGdt.appendChild(s2);
			this.elmDefs.appendChild(raGdt);
			//上を利用して円を描画
			let c1 = this.newTagSVG("circle");
			c1.style.fill = `url(#${raGdt.id})`;
			this.elmGrp.appendChild(c1);
		}
	}

	//グラデーション円の位置調整
	updateGradientCirclesPos(){
		//circleのcollectionを準備
		let aCircles = this.getTagsSVG("circle",this.elmGrp);
		//色付け円の中心同士の距離(＝指定する半径)
		let gapCircle = this.radiusMidstrip * this.edgelen_regpoly(aCircles.length);
		for( let i=0; i<aCircles.length; ++i){
			let theta = 2*Math.PI*i/aCircles.length
			aCircles[i].cx.baseVal.value = this.radiusMidstrip*Math.sin(theta);
			aCircles[i].cy.baseVal.value = this.radiusMidstrip*Math.cos(theta);
			aCircles[i].r.baseVal.value = gapCircle;
		}
	}

	//色配置の更新
	updateColors(_aData){
		//radialGradientの数と新しいデータの数を比較して
		let aGradients = this.getTagsSVG("radialGradient",this.elmDefs);
		if( aGradients.length !== _aData.length){
			//1. 等しくないなら、radialGradient と circle の過不足を調整して、更にcircle の位置を調整
			this.updateGradientCirclesRelation(_aData.length);
			this.updateGradientCirclesPos();
		}
		//2. radialGradient > stop-color 更新
		//aGradientsは「生きている」ので、個数が変更されていてもへっちゃら。
		for( let i = 0 ; i < _aData.length ; ++i ){
			aGradients[i].firstElementChild.setAttribute("stop-color",_aData[i]);
			aGradients[i].lastElementChild.setAttribute("stop-color",_aData[i]);
		}
	}

	//クリップパスの更新
	updateClipPath(_aData){
		//入力データをpath/dに変換しやすい状態に加工する
		let aRanges=[], aaHints=[]; //半径配列とヒント二重配列
		while(_aData.length>0){
			let a = _aData.shift();
			if( Array.isArray(a) ){
				//期待する配列は、[数,数,配列,配列]
				aRanges.push( this.toIntZeroPlus(a[0]), this.toIntZeroPlus(a[1]) );
				aaHints.push( this.toArrayIntZeroPlus(a[2]), this.toArrayIntZeroPlus(a[3]) );
			}else{
				console.warn(`(updateClipPath) ${a} is skipped; ain't Array.`);
			}
		}
		//aRangesは積分して0～1に標準化、aaHintsの各要素は積分して0～2piに標準化する。
		aRanges = this.normalize( this.integral(aRanges) );
		aaHints = aaHints.map( a=>
			a.length>0 ? this.normalize( this.integral(a), 2*Math.PI ) : a
		);
		//円環の中央部半径
		this.radiusMidstrip = this.calcMidstrip(aRanges[0]);
		this.updateGradientCirclesPos(); //radiusMidstripが変更されたので

		//変換してpath/dに渡す
		let i=0, strPathD="";
		for( ; i < aRanges.length ; ++i ){
			let r = aRanges[i]; //対象半径
			strPathD += `M${r},0`;
			if( aaHints[i].length === 0 ){
				strPathD += `A${r},${r} 0 0 ${i&1} -${r},0`;
				strPathD += `A${r},${r} 0 0 ${i&1} ${r},0z`;
			}
			else {
				let q = i<1 ? 0 : aRanges[i-1]; //直前半径
				let ah = aaHints[i]; //配列：切り替える角度
				for( let j = 0 ; j < ah.length ; ++j ){
					let s = (j&1?q:r), t = (j&1?r:q); //s=主、t=従 //反時計回りはY方向を反転
					let mx = Math.cos(ah[j]), my = Math.sin(i&1?ah[j]:-ah[j]); //
					strPathD += `A${s},${s} 0 0 ${i&1} ${s*mx},${s*my}`; //円弧
					strPathD += (j+1 === ah.length ? "z" : `L${t*mx},${t*my}`); //直線
				}
			}
		}	// A rx,ry 楕円の傾き 大回り(1|0) 時計回り(1|0) x,y
		this.elmPath.setAttribute("d",strPathD);
	}

	//<callback>属性に変更があった
	attributeChangedCallback(_attrName, _oldVal, _newVal){
		console.log(`aCCb : ${_attrName}`);
		let newData;
		switch(_attrName){
			case "data-colors":
				newData = this.csv2arrStr(_newVal);
				if( newData.length<=5 ){
					console.warn(`data-colors="${_newVal}" 6色以上指定してください。初期値を使用します`);
					newData = imascgssThatring.defaultColors;
				}
				this.updateColors(newData);
				break;
			case "data-json":
				try{
					newData = JSON.parse(_newVal);
				}catch(e){
					console.warn(`data-json="${_newVal}" 変換失敗。初期値を使用します`);
					newData = imascgssThatring.defaultStripJson;
				}
				this.updateClipPath(newData);
				break;
		}
	}
	static get observedAttributes(){ return ["data-colors","data-json"] }

} //end_of_class imascgssThatring
window.customElements.define('imascgss-thatring',imascgssThatring);
