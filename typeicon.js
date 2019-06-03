//========================================================================
// typeicon.js
//	+ data-なんたら属性。
//		+ data-type  (cute|cool|passion)
//		+ data-style (major|minor|shadow)
//	+ CSSカスタムプロパティ(--*:*)による設定
//		+ --length-size   ... 画像の大きさ
//========================================================================

class imascgssTypeIcon extends HTMLElement {

	static get validType(){ return ["cute","cool","passion"] }
	static get validStyle(){ return ["major","minor","shadow"] }
	static get invalidName(){ return "none" }

	//--サブルーチン--
	newTagSVG = tag=>document.createElementNS("http://www.w3.org/2000/svg",tag);
	//getTagsSVG = (tag,root=this.shadowRoot)=>root.getElementsByTagNameNS("http://www.w3.org/2000/svg",tag);
	removeAllChildren = node=>{ while(node.lastChild){node.removeChild(node.lastChild)} }

	constructor(){ super();
		//いの一番↑に親クラスのコンストラクタを必ず呼ぶ

		//形状合成・スタイル毎
		const defsStyles = this.newTagSVG("defs");
		const templateSvgSymbol = this.newTagSVG("symbol"); //テンプレートは同一
		templateSvgSymbol.setAttribute("viewBox","-100,-100,200,200");
		templateSvgSymbol.setAttribute("overflow","visible");
		defsStyles.appendChild( this.svgSymbolMajor  = templateSvgSymbol.cloneNode(true) );
		defsStyles.appendChild( this.svgSymbolMinor  = templateSvgSymbol.cloneNode(true) );
		defsStyles.appendChild( this.svgSymbolShadow = templateSvgSymbol.cloneNode(true) );
		this.svgSymbolMajor.id = imascgssTypeIcon.validStyle[0];
		this.svgSymbolMinor.id = imascgssTypeIcon.validStyle[1];
		this.svgSymbolShadow.id = imascgssTypeIcon.validStyle[2];

		//ルートとなるSVG
		this.svgRoot = this.newTagSVG("svg");
		this.svgRoot.appendChild( this.svgDefs = this.newTagSVG("defs") ); //属性ごとの素材
		this.svgRoot.appendChild( defsStyles );
		this.svgRoot.appendChild( this.svgUse  = this.newTagSVG("use") ); //選択に応じた表示

		//CSS 設定
		const strCssSize = "var(--length-size,1.5em)";
		const sty = document.createElement("style");
		sty.textContent =`svg{display:inline-block;vertical-align:middle;height:${strCssSize};width:${strCssSize}}`;

		const shdwroot = this.attachShadow({mode:"open"});
		shdwroot.appendChild(sty);
		shdwroot.appendChild(this.svgRoot);
	}

	//属性(data-type)変更に対応
	mayUpdateType(_older, _newer){
		const valids = imascgssTypeIcon.validType, //有効な文字列
			ixOld = valids.indexOf(_older), ixNew = valids.indexOf(_newer);
		if( ixOld === ixNew ){ return }

		// console.log(`new data-type= ${_newer} -> ${ixNew}`);
		this.removeAllChildren(this.svgDefs);
		this.removeAllChildren(this.svgSymbolMajor);
		this.removeAllChildren(this.svgSymbolMinor);
		this.removeAllChildren(this.svgSymbolShadow);
		let temp;
		switch( ixNew ){
			case 0: //cute
				this.svgDefs.innerHTML=`
				<!--Cute属性 {.309; .588; .809; .951}==sin({1-4}*pi/10) -->
				<!--元となる形状-->
				<symbol id="polyCu_about" viewBox="-666,-666,1332,1332" overflow="visible">
					<path d="M0,0C-588,-809,588,-809,0,0C588,-809,951,309,0,0C951,309,0,1000,0,0C0,1000,-951,309,0,0C-951,309,-588,-809,0,0z"/>
				</symbol>
				<!--合成したもの：大きく描いて、maskで小さく抜く-->
				<symbol id="symbolCute" viewBox="0,0,10,10" overflow="visible">
					<mask id="maskSymbolCute">
						<rect x="0" y="0" width="10" height="10" fill="white"/>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyCu_about" x="1" y="1" width="8" height="8" stroke="black" stroke-width="10" fill="black"/>
					</mask>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyCu_about" mask="url(#maskSymbolCute)" stroke-width="100"/>
				</symbol>
				`;
				this.svgSymbolMajor.innerHTML=`
				<circle cx="0" cy="0" r="99" stroke="none" fill="currentColor"/>
				<circle cx="0" cy="0" r="92" stroke="white" stroke-width="4" fill="none"/>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolCute" x="-80" y="-80" width="160" height="160" stroke="white" fill="white"/>
				`;
				this.svgSymbolMinor.innerHTML=`
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyCu_about" x="-64" y="-59" width="128" height="128" stroke-width="800" stroke="currentColor" fill="currentColor"/>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolCute" x="-64" y="-59" width="128" height="128" stroke="white" fill="white"/>
				`;
				this.svgSymbolShadow.innerHTML=`
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolCute" x="-80" y="-80" width="160" height="160" stroke="currentColor" fill="currentColor"/>
				`;
				break;
			case 1: //cool
				this.svgDefs.innerHTML=`
				<!--Cool属性 .707==1/sqrt2 ; .414==sqrt2-1 -->
				<!--外側の線：形状のみ-->
				<symbol id="polyCo_frame" viewBox="-1000,-1000,2000,2000" overflow="visible">
					<path d="M707,-707L1000,0L0,1000L-1000,0L-707,-707z"/>
				</symbol>
				<!--内側の線：形状のみ-->
				<symbol id="pathCo_detail" viewBox="-1000,-1000,2000,2000" overflow="visible">
					<path d="M-1000,0H1000M707,-707L0,1000L-707,-707M414,0L0,-707L-414,0"/>
				</symbol>
				<!--合成したもの：描画時の太さ(比)まで定義-->
				<symbol id="symbolCool" viewBox="0,0,1,1" overflow="visible">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#pathCo_detail" stroke-width="80"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyCo_frame" stroke-width="120"/>
				</symbol>
				`;
				this.svgSymbolMajor.innerHTML=`
				<circle cx="0" cy="0" r="99" stroke="none" fill="currentColor"/>
				<circle cx="0" cy="0" r="92" stroke="white" stroke-width="4" fill="none"/>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolCool" x="-72" y="-72" width="144" height="144" stroke="white" fill="none"/>
				`;
				this.svgSymbolMinor.innerHTML=`
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyCo_frame" x="-54" y="-59" width="108" height="108" stroke-width="1440" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="currentColor"/>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolCool" x="-60" y="-65" width="120" height="120" stroke="white" fill="none"/>
				`;
				this.svgSymbolShadow.innerHTML=`
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolCool" x="-72" y="-72" width="144" height="144" stroke="currentColor" fill="none"/>
				`;
				break;
			case 2: //passion
				this.svgDefs.innerHTML=`
				<!--Passion属性 整数だけでそれっぽい形に-->
				<!--外のひらひら単体-->
				<symbol id="polyPa_onefly" viewBox="-5,0,10,10" overflow="visible">
					<path d="M4,10C6,6,-3,5,2,0C-10,5,-2,6,-4,10z"/>
				</symbol>
				<!--外のひらひら全体-->
				<symbol id="polyPa_flare" viewBox="0,0,100,100" overflow="visible">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_onefly" x="38" y="0" width="24" height="24"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_onefly" x="38" y="0" width="24" height="24" transform="rotate(45,50,50)"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_onefly" x="38" y="0" width="24" height="24" transform="rotate(90,50,50)"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_onefly" x="38" y="0" width="24" height="24" transform="rotate(135,50,50)"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_onefly" x="38" y="0" width="24" height="24" transform="rotate(180,50,50)"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_onefly" x="38" y="0" width="24" height="24" transform="rotate(225,50,50)"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_onefly" x="38" y="0" width="24" height="24" transform="rotate(270,50,50)"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_onefly" x="38" y="0" width="24" height="24" transform="rotate(315,50,50)"/>
				</symbol>
				<!--中央の丸……マスクにも塗りつぶしにも使うために独立させた-->
				<symbol id="polyPa_sphere" viewBox="0,0,100,100" overflow="visible">
					<circle cx="50" cy="50" r="28"/>
				</symbol>
				<!--合成したもの：中央はドーナツ状にすることでfillのみ(stroke=none)で完成するように-->
				<symbol id="symbolPassion" viewBox="0,0,100,100" overflow="visible">
					<mask id="maskPassionFlare">
						<rect x="0" y="0" width="100" height="100" fill="white"/>
						<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_sphere" fill="black"/>
					</mask>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_flare" mask="url(#maskPassionFlare)"/>
					<path d="M29,50a21,21,0,0,1,42,0m-7,0a14,14,0,0,0,-28,0a14,14,0,0,0,28,0m7,0a21,21,0,0,1,-42,0"/>
				</symbol>
				`;
				this.svgSymbolMajor.innerHTML=`
				<circle cx="0" cy="0" r="99" stroke="none" fill="currentColor"/>
				<circle cx="0" cy="0" r="92" stroke="white" stroke-width="4" fill="none"/>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolPassion" x="-83" y="-83" width="166" height="166" stroke="none" fill="white"/>
					`;
				this.svgSymbolMinor.innerHTML=`
				<g stroke-width="16" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="currentColor">
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_sphere" x="-66" y="-66" width="132" height="132"/>
					<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#polyPa_flare" x="-66" y="-66" width="132" height="132"/>
				</g>
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolPassion" x="-66" y="-66" width="132" height="132" stroke="none" fill="white"/>
				`;
				this.svgSymbolShadow.innerHTML=`
				<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#symbolPassion" x="-83" y="-83" width="166" height="166" stroke="none" fill="currentColor"/>
				`;
				break;
			default: //other
				temp = this.newTagSVG("rect");
				temp.x.baseVal.value = this.svgSymbolMajor.viewBox.baseVal.x;
				temp.y.baseVal.value = this.svgSymbolMajor.viewBox.baseVal.y;
				temp.width.baseVal.value = this.svgSymbolMajor.viewBox.baseVal.width;
				temp.height.baseVal.value = this.svgSymbolMajor.viewBox.baseVal.height;
				temp.setAttribute("fill","currentColor");
				//this.svgDefs.innerHTML=``;
				this.svgSymbolMajor.appendChild( temp.cloneNode(true) );
				this.svgSymbolMinor.appendChild( temp.cloneNode(true) );
				this.svgSymbolShadow.appendChild( temp.cloneNode(true) );
				break;
		}
	}

	//スタイル(data-style)変更に対応
	mayUpdateStyle(_older, _newer){
		const valids = imascgssTypeIcon.validStyle, //有効な文字列
			ixOld = valids.indexOf(_older), ixNew = valids.indexOf(_newer);
		if( ixOld === ixNew ){ return }
		//indexOf()+1 の計算結果の範囲が [0,length] になるのだ
		// console.log(`new data-style= ${_newer} -> ${ixNew}`);
		this.svgUse.href.baseVal = "#"+[imascgssTypeIcon.invalidName,...valids][ixNew+1];
	}

	attributeChangedCallback(_attrName, _oldVal, _newVal){
		let _older = (""+_oldVal).toLowerCase(),
			_newer = (""+_newVal).toLowerCase();
		switch(_attrName){
			case "data-type":
				this.mayUpdateType(_older, _newer);
				break;
			case "data-style":
				this.mayUpdateStyle(_older, _newer);
				break;
		}
	}
	static get observedAttributes(){ return ["data-type","data-style"] }

} //end_of_class imascgssTypeIcon
window.customElements.define('imascgss-typeicon',imascgssTypeIcon);
