// thatring.js
// デレステのメニューなどで背景に出てくるあの虹色輪っか風のSVGを生成する
"use strict";

function thatRing(
	colorinstr,
	stripwidths,
	strippattern,
	striphints
){//** BEGIN UNIQUE FUNCTION **//
const NEW_SVGTAG = tag => document.createElementNS("http://www.w3.org/2000/svg",tag);

//積分(配列)
const integral = (a)=>{
	let b = [], s = 0;
	for(let i in a){ b[i] = s += a[i]; }
	return b;
};
//標準化(配列,倍率,下駄)
const normalize = (a,m=1,b=0)=>{
	const x = Math.max(...a);
	return a.map( (v)=> m*v/x+b );
};
//円に内接する正多角形の辺の長さ
const edgelen_regpoly = (num_angle)=>{
	let w = 2*Math.PI/num_angle;
	let dx = Math.sin(w);
	let dy = 1-Math.cos(w);
	return Math.sqrt(dx*dx+dy*dy);
};

//stripwidthsは積分して0～1に標準化、striphintsは積分して0～2piに標準化する。
let stripwidths_i = normalize( integral(stripwidths) );
let striphints_i = [];
for(let h of striphints){ striphints_i.push( normalize( integral(h), 2*Math.PI ) ); }
//円環の中央部半径
const rad_midstrip = stripwidths_i[0]+(1-stripwidths_i[0])/2;
//色付け円の中心同士の距離(＝指定する半径)
const gap_colorcircle = rad_midstrip * edgelen_regpoly(colorinstr.length);
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
const clip = NEW_SVGTAG("clipPath");
clip.setAttribute("clip-rule","evenodd");
clip.appendChild(
	//<path>を生成して直接append
	( p =>{
		p.setAttribute("d",dstr);
		return p;
	})( NEW_SVGTAG("path") )
);
//<defs> HTML化した時に(多少)わかりやすくなる(はず)
const defz = NEW_SVGTAG("defs");
defz.appendChild(clip);
//<g>
const grp = NEW_SVGTAG("g");
grp.id = "thatring";
clip.id = "path"+grp.id; //<g>のidを加工して<clipPath>のidを決める(ことで重複させない)
grp.setAttribute("clip-path",`url(#${clip.id})`);

//「色配置」円形に配置
for( let index = 0 ; index < colorinstr.length ; ++index ){
	//グラデーション設定
	let raGdt = NEW_SVGTAG("radialGradient");
	raGdt.id = `filler${index}`;
	let s1 = NEW_SVGTAG("stop");
	s1.setAttribute("offset","0");
	s1.setAttribute("stop-color",colorinstr[index]);
	s1.setAttribute("stop-opacity","1");
	let s2 = NEW_SVGTAG("stop");
	s2.setAttribute("offset","1");
	s2.setAttribute("stop-color",colorinstr[index]);
	s2.setAttribute("stop-opacity","0");
	raGdt.appendChild(s1);
	raGdt.appendChild(s2);
	defz.appendChild(raGdt);
	//上を利用した円の描画
	let c1 = NEW_SVGTAG("circle");
	c1.cx.baseVal.value = rad_midstrip*Math.sin(2*Math.PI*index/colorinstr.length);
	c1.cy.baseVal.value = rad_midstrip*Math.cos(2*Math.PI*index/colorinstr.length);
	c1.r.baseVal.value = gap_colorcircle;
	c1.style.fill = `url(#${raGdt.id})`;
	grp.appendChild(c1);
}

//<svg> SVGを構成・接続する
const rootsvg = NEW_SVGTAG("svg");
rootsvg.style.width = rootsvg.style.height = "500px";
rootsvg.setAttribute("viewBox", "-1 -1 2 2");
rootsvg.appendChild(defz);
rootsvg.appendChild(grp);
return rootsvg;

}//** END UNIQUE FUNCTION **//

