//========================================================================
// thatring.js
// デレステのメニューなどで背景に出てくるあの虹色輪っか風のモノを生成する
// いわゆる Web Components の習作。
// <imascgss-thatring> というタグで使える。
//
//	+ data-なんたら属性。CSV(カンマ区切り表現)で表す
//		+ data-colors ... 設定色を#rrggbb表現で記す。
//			PCCS->RGB http://www.wsj21.net/ghp/ghp0c_03.html 使うのは、PCCS light 色相環(12色)
//		+ data-widths  ... 塗る塗らないを切り替える幅。
//			[index&0]～[&1]間が塗られる。必ず偶数個にしてね。
//		+ data-pattern ... 0=円 1以上=直前径とジグザグ(data-hintN参照)
//		+ data-hintN   ... data-patternで非0にした値をどうジグザグさせるか。
//			[index&0]外径[&1]内径。N はdata-patternで指定した数字に対応
//	+ CSSカスタムプロパティ(--*:*)による設定
//		+ --length-size   ... 画像の大きさ
//		+ --time-per-turn ... 1回転当たりの時間
//========================================================================
class imascgssThatring extends HTMLElement{

	//--初期値用の定数--
	static get defaultColorinstr(){ return ["#d995ac","#f59fa0","#ffb195","#ffc887","#f9e08a","#d9d784","#8dd3ad","#71c5be","#71b1c7","#7e9dc3","#9c95c1","#b48fb5"] }
		// PCCS->RGB http://www.wsj21.net/ghp/ghp0c_03.html 使うのは、PCCS light 色相環(12色)
	static get defaultStripwidths(){ return [150,1,7,2,4,24,2,3,6,1] }
	static get defaultStrippattern(){return [  0,0,0,0,0, 0,0,0,0,0] }

	//--サブルーチン--
	newTagSVG = tag=>document.createElementNS("http://www.w3.org/2000/svg",tag);
	//csv2arr* : CSVを(Str:文字列|Int:整数)配列に
	csv2arrStr = (_str,_fallback=[])=> _str ? _str.split(",") : _fallback;
	csv2arrInt = (_str,_fallback=[])=> _str ? _str.split(",").map(s=>s|0) : _fallback;

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

		//dataSet読み取り
		const datasets = this.dataset;
		let colorinstr = this.csv2arrStr( datasets["colors"], imascgssThatring.defaultColorinstr );
		let stripwidths = this.csv2arrInt( datasets["widths"], imascgssThatring.defaultStripwidths );
		let strippattern = this.csv2arrInt( datasets["pattern"], imascgssThatring.defaultStrippattern );
		let striphints = (_maxhints=>{
			let retarr = [];
			for(let idx = 1 ; idx <= _maxhints ; idx++){
				retarr.push( this.csv2arrInt(datasets[`hint${idx}`]) );
			}
			return retarr;
		})( Math.max(...strippattern) );

		//stripwidthsは積分して0～1に標準化、striphintsは積分して0～2piに標準化する。
		let stripwidths_i = this.normalize( this.integral(stripwidths) );
		let striphints_i = [];
		for(let h of striphints){ striphints_i.push( this.normalize( this.integral(h), 2*Math.PI ) ); }
		//円環の中央部半径
		const rad_midstrip = stripwidths_i[0]+(1-stripwidths_i[0])/2;
		//色付け円の中心同士の距離(＝指定する半径)
		const gap_colorcircle = rad_midstrip * this.edgelen_regpoly(colorinstr.length);
		//「切り抜く形状」を表す文字列(<path>の d プロパティ)を生成する
		let dstr = "";
		for( let i = 0 ; i < stripwidths_i.length ; ++i ){
			let r = stripwidths_i[i]; //対象半径
			dstr += `M${r},0`;
			if( strippattern[i] === 0 ){
				dstr += `A${r},${r} 0 0 ${i&1} -${r},0`;
				dstr += `A${r},${r} 0 0 ${i&1} ${r},0z`;
			}
			else {
				let q = stripwidths_i[i-1]; //直前半径
				let ah = striphints_i[strippattern[i]-1]; //配列：切り替える角度
				for( let j = 0 ; j < ah.length ; ++j ){
					let s = (j&1?q:r), t = (j&1?r:q); //s=主、t=従 //反時計回りはY方向を反転
					let mx = Math.cos(ah[j]), my = Math.sin(i&1?ah[j]:-ah[j]); //
					dstr += `A${s},${s} 0 0 ${i&1} ${s*mx},${s*my}`; //円弧
					dstr += (j+1 === ah.length ? "z" : `L${t*mx},${t*my}`); //直線
				}
			}
		}	// A rx,ry 楕円の傾き 大回り(1|0) 時計回り(1|0) x,y

		//クリップパス準備
		const clip = this.newTagSVG("clipPath");
		clip.setAttribute("clip-rule","evenodd");
		clip.appendChild(
			//<path>を生成して直接append
			( p =>{
				p.setAttribute("d",dstr);
				return p;
			})( this.newTagSVG("path") )
		);
		//<defs> HTML化した時に(多少)わかりやすくなる(はず)
		const defz = this.newTagSVG("defs");
		defz.appendChild(clip);
		//<g>
		const grp = this.newTagSVG("g");
		grp.id = "thatring";
		clip.id = "path"+grp.id; //<g>のidを加工して<clipPath>のidを決める(ことで重複させない)
		grp.setAttribute("clip-path",`url(#${clip.id})`);

		//「色配置」円形に配置
		for( let index = 0 ; index < colorinstr.length ; ++index ){
			//グラデーション設定
			let raGdt = this.newTagSVG("radialGradient");
			raGdt.id = `filler${index}`;
			let s1 = this.newTagSVG("stop");
			s1.setAttribute("offset","0");
			s1.setAttribute("stop-color",colorinstr[index]);
			s1.setAttribute("stop-opacity","1");
			let s2 = this.newTagSVG("stop");
			s2.setAttribute("offset","1");
			s2.setAttribute("stop-color",colorinstr[index]);
			s2.setAttribute("stop-opacity","0");
			raGdt.appendChild(s1);
			raGdt.appendChild(s2);
			defz.appendChild(raGdt);
			//上を利用した円の描画
			let c1 = this.newTagSVG("circle");
			c1.cx.baseVal.value = rad_midstrip*Math.sin(2*Math.PI*index/colorinstr.length);
			c1.cy.baseVal.value = rad_midstrip*Math.cos(2*Math.PI*index/colorinstr.length);
			c1.r.baseVal.value = gap_colorcircle;
			c1.style.fill = `url(#${raGdt.id})`;
			grp.appendChild(c1);
		}

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

		//<svg> SVGを構成・接続する
		const rootsvg = this.newTagSVG("svg");
		rootsvg.setAttribute("viewBox", "-1 -1 2 2");
		rootsvg.appendChild(defz);
		rootsvg.appendChild(grp);
		//Shadow Root を作って、そこにぶら下げる
		let shdwroot = this.attachShadow({mode:"open"})
		shdwroot.appendChild(style);
		shdwroot.appendChild(rootsvg);
	}
} //end_of_class imascgssThatring
window.customElements.define('imascgss-thatring',imascgssThatring);
