
function dmp(){this.Diff_Timeout=1.0;this.Diff_DualThreshold=32}
dmp.prototype.main=function(a,b,c){if(a==b){return[[0,a]]}if(typeof c=='undefined'){c=true}var d=c;var e=this.commonPrefix(a,b);var f=a.substring(0,e);a=a.substring(e);b=b.substring(e);e=this.commonSuffix(a,b);var g=a.substring(a.length-e);a=a.substring(0,a.length-e);b=b.substring(0,b.length-e);var h=this.compute(a,b,d);if(f){h.unshift([0,f])}if(g){h.push([0,g])}this.cleanupMerge(h);return h}
dmp.prototype.compute=function(b,c,d){var e;if(!b){return[[1,c]]}if(!c){return[[-1,b]]}var f=b.length>c.length?b:c;var g=b.length>c.length?c:b;var i=f.indexOf(g);if(i!=-1){e=[[1,f.substring(0,i)],[0,g],[1,f.substring(i+g.length)]];if(b.length>c.length){e[0][0]=e[2][0]=-1}return e}f=g=null;var h=this.halfMatch(b,c);if(h){var k=h[0],l=h[1],m=h[2],n=h[3],o=h[4],p=this.main(k,m,d);var q=this.main(l,n,d);return p.concat([[0,o]],q)}if(d&&(b.length<100||c.length<100)){d=false}var r;if(d){var a=this.linesToChars(b,c);b=a[0];c=a[1];r=a[2]}e=this.map(b,c);if(!e){e=[[-1,b],[1,c]]}if(d){this.charsToLines(e,r);this.cleanupSemantic(e);e.push([0,'']);var s=0,t=0,u=0,v='',w='';while(s<e.length){switch(e[s][0]){case 1:++u;w+=e[s][1];break;case -1:++t;v+=e[s][1];break;case 0:if(t>=1&&u>=1){var a=this.main(v,w,false);e.splice(s-t-u,t+u);s=s-t-u;for(var j=a.length-1;j>=0;j--){e.splice(s,0,a[j])}s=s+a.length}u=0;t=0;v='';w='';break}++s}e.pop()}return e}
dmp.prototype.linesToChars=function(g,h){var i=[],j={};i[0]='';function diff_linesToCharsMunge(a){var b='',c=0,d=-1,e=i.length;while(d<a.length-1){d=a.indexOf('\n',c);if(d==-1){d=a.length-1}var f=a.substring(c,d+1);c=d+1;if(j.hasOwnProperty?j.hasOwnProperty(f):(j[f]!==undefined)){b+=String.fromCharCode(j[f])}else{b+=String.fromCharCode(e);j[f]=e;i[e++]=f}}return b}var k=diff_linesToCharsMunge(g);var l=diff_linesToCharsMunge(h);return[k,l,i]}
dmp.prototype.charsToLines=function(a,b){for(var x=0;x<a.length;++x){var c=a[x][1],d=[];for(var y=0;y<c.length;++y){d[y]=b[c.charCodeAt(y)]}a[x][1]=d.join('')}}
dmp.prototype.map=function(b,c){var e=(new Date()).getTime()+this.Diff_Timeout*1000;var f=b.length+c.length-1;var g=this.Diff_DualThreshold*2<f;var h=[],i=[],j={},l={};j[1]=0;l[1]=0;var x,y,m,n={},o=false;var hasOwnProperty=!!(n.hasOwnProperty);var p=(b.length+c.length)%2;for(var d=0;d<f;++d){if(this.Diff_Timeout>0&&(new Date()).getTime()>e){return null}h[d]={};for(var k=-d;k<=d;k+=2){if(k==-d||k!=d&&j[k-1]<j[k+1]){x=j[k+1]}else{x=j[k-1]+1}y=x-k;if(g){m=x+','+y;if(p&&(hasOwnProperty?n.hasOwnProperty(m):(n[m]!==undefined))){o=true}if(!p){n[m]=d}}while(!o&&x<b.length&&y<c.length&&b.charAt(x)==c.charAt(y)){++x;++y;if(g){m=x+','+y;if(p&&(hasOwnProperty?n.hasOwnProperty(m):(n[m]!==undefined))){o=true}if(!p){n[m]=d}}}j[k]=x;h[d][x+','+y]=true;if(x==b.length&&y==c.length){return this.path1(h,b,c)}else if(o){i=i.slice(0,n[m]+1);var a=this.path1(h,b.substring(0,x),c.substring(0,y));return a.concat(this.path2(i,b.substring(x),c.substring(y)))}}if(g){i[d]={};for(var k=-d;k<=d;k+=2){if(k==-d||k!=d&&l[k-1]<l[k+1]){x=l[k+1]}else{x=l[k-1]+1}y=x-k;m=(b.length-x)+','+(c.length-y);if(!p&&(hasOwnProperty?n.hasOwnProperty(m):(n[m]!==undefined))){o=true}if(p){n[m]=d}while(!o&&x<b.length&&y<c.length&&b.charAt(b.length-x-1)==c.charAt(c.length-y-1)){++x;++y;m=(b.length-x)+','+(c.length-y);if(!p&&(hasOwnProperty?n.hasOwnProperty(m):(n[m]!==undefined))){o=true}if(p){n[m]=d}}l[k]=x;i[d][x+','+y]=true;if(o){h=h.slice(0,n[m]+1);var a=this.path1(h,b.substring(0,b.length-x),c.substring(0,c.length-y));return a.concat(this.path2(i,b.substring(b.length-x),c.substring(c.length-y)))}}}}return null}
dmp.prototype.path1=function(a,b,c){var e=[],x=b.length,y=c.length,f=null;for(var d=a.length-2;d>=0;d--){while(1){if(a[d].hasOwnProperty?a[d].hasOwnProperty((x-1)+','+y):(a[d][(x-1)+','+y]!==undefined)){x--;if(f===-1){e[0][1]=b.charAt(x)+e[0][1]}else{e.unshift([-1,b.charAt(x)])}f=-1;break}else if(a[d].hasOwnProperty?a[d].hasOwnProperty(x+','+(y-1)):(a[d][x+','+(y-1)]!==undefined)){y--;if(f===1){e[0][1]=c.charAt(y)+e[0][1]}else{e.unshift([1,c.charAt(y)])}f=1;break}else{x--;y--;if(f===0){e[0][1]=b.charAt(x)+e[0][1]}else{e.unshift([0,b.charAt(x)])}f=0}}}return e}
dmp.prototype.path2=function(a,b,c){var e=[],f=0,x=b.length,y=c.length,g=null;for(var d=a.length-2;d>=0;d--){while(1){if(a[d].hasOwnProperty?a[d].hasOwnProperty((x-1)+','+y):(a[d][(x-1)+','+y]!==undefined)){x--;if(g===-1){e[f-1][1]+=b.charAt(b.length-x-1)}else{e[f++]=[-1,b.charAt(b.length-x-1)]}g=-1;break}else if(a[d].hasOwnProperty?a[d].hasOwnProperty(x+','+(y-1)):(a[d][x+','+(y-1)]!==undefined)){y--;if(g===1){e[f-1][1]+=c.charAt(c.length-y-1)}else{e[f++]=[1,c.charAt(c.length-y-1)]}g=1;break}else{x--;y--;if(g===0){e[f-1][1]+=b.charAt(b.length-x-1)}else{e[f++]=[0,b.charAt(b.length-x-1)]}g=0}}}return e}
dmp.prototype.commonPrefix=function(a,b){if(!a||!b||a.charCodeAt(0)!==b.charCodeAt(0)){return 0}var c=0,d=Math.min(a.length,b.length);var e=d,f=0;while(c<e){if(a.substring(f,e)==b.substring(f,e)){c=e;f=c}else{d=e}e=Math.floor((d-c)/2+c)}return e}
dmp.prototype.commonSuffix=function(a,b){if(!a||!b||a.charCodeAt(a.length-1)!==b.charCodeAt(b.length-1)){return 0}var c=0,d=Math.min(a.length,b.length);var e=d,f=0;while(c<e){if(a.substring(a.length-e,a.length-f)==b.substring(b.length-e,b.length-f)){c=e;f=c}else{d=e}e=Math.floor((d-c)/2+c)}return e}
dmp.prototype.halfMatch=function(h,k){var l=h.length>k.length?h:k;var m=h.length>k.length?k:h;if(l.length<10||m.length<1){return null}var n=this;function diff_halfMatchI(a,b,i){var c=a.substring(i,i+Math.floor(a.length/4));var j=-1,d='',e,best_longtext_b,best_shorttext_a,best_shorttext_b;while((j=b.indexOf(c,j+1))!=-1){var f=n.commonPrefix(a.substring(i),b.substring(j));var g=n.commonSuffix(a.substring(0,i),b.substring(0,j));if(d.length<g+f){d=b.substring(j-g,j)+b.substring(j,j+f);e=a.substring(0,i-g);best_longtext_b=a.substring(i+f);best_shorttext_a=b.substring(0,j-g);best_shorttext_b=b.substring(j+f)}}if(d.length>=a.length/2){return[e,best_longtext_b,best_shorttext_a,best_shorttext_b,d]}else{return null}}var o=diff_halfMatchI(l,m,Math.ceil(l.length/4));var p=diff_halfMatchI(l,m,Math.ceil(l.length/2));var q;if(!o&&!p){return null}else if(!p){q=o}else if(!o){q=p}else{q=o[4].length>p[4].length?o:p}var r,text1_b,text2_a,text2_b;if(h.length>k.length){r=q[0];text1_b=q[1];text2_a=q[2];text2_b=q[3]}else{text2_a=q[0];text2_b=q[1];r=q[2];text1_b=q[3]}var s=q[4];return[r,text1_b,text2_a,text2_b,s]}
dmp.prototype.cleanupSemantic=function(a){var b=false,c=[],d=0,e=null,f=0,g=0,h=0;while(f<a.length){if(a[f][0]==0){c[d++]=f;g=h;h=0;e=a[f][1]}else{h+=a[f][1].length;if(e!==null&&(e.length<=g)&&(e.length<=h)){a.splice(c[d-1],0,[-1,e]);a[c[d-1]+1][0]=1;d-=2;f=d>0?c[d-1]:-1;g=h=0;e=null;b=true}}++f}if(b){this.cleanupMerge(a)}this.cleanupSemanticLossless(a)}
dmp.prototype.cleanupSemanticLossless=function(d){var e=/[^a-zA-Z0-9]/,f=/\s/,g=/[\r\n]/,h=/\n\r?\n$/,i=/^\r?\n\r?\n/;function cleanupSemanticScore(a,b){if(!a||!b){return 5}var c=0;if(a.charAt(a.length-1).match(e)||b.charAt(0).match(e)){++c;if(a.charAt(a.length-1).match(f)||b.charAt(0).match(f)){++c;if(a.charAt(a.length-1).match(g)||b.charAt(0).match(g)){++c;if(a.match(h)||b.match(i)){++c}}}}return c}var j=1;while(j<d.length-1){if(d[j-1][0]==0&&d[j+1][0]==0){var k=d[j-1][1],l=d[j][1],m=d[j+1][1],n=this.commonSuffix(k,l);if(n){var o=l.substring(l.length-n);k=k.substring(0,k.length-n);l=o+l.substring(0,l.length-n);m=o+m}var p=k,q=l,r=m, s=cleanupSemanticScore(k,l)+cleanupSemanticScore(l,m);while(l.charAt(0)===m.charAt(0)){k+=l.charAt(0);l=l.substring(1)+m.charAt(0);m=m.substring(1);var t=cleanupSemanticScore(k,l)+cleanupSemanticScore(l,m);if(t>=s){s=t;p=k;q=l;r=m}}if(d[j-1][1]!=p){if(p){d[j-1][1]=p}else{d.splice(j-1,1);j--}d[j][1]=q;if(r){d[j+1][1]=r}else{d.splice(j+1,1);j--}}}++j}}
dmp.prototype.cleanupMerge=function(a){a.push([0,'']);var b=0,c=0,d=0,e='',f='',g;while(b<a.length){switch(a[b][0]){case 1:++d;f+=a[b][1];++b;break;case -1:++c;e+=a[b][1];++b;break;case 0:if(c!==0||d!==0){if(c!==0&&d!==0){g=this.commonPrefix(f,e);if(g!==0){if((b-c-d)>0&&a[b-c-d-1][0]==0){a[b-c-d-1][1]+=f.substring(0,g)}else{a.splice(0,0,[0,f.substring(0,g)]);++b}f=f.substring(g);e=e.substring(g)}g=this.commonSuffix(f,e);if(g!==0){a[b][1]=f.substring(f.length-g)+a[b][1];f=f.substring(0,f.length-g);e=e.substring(0,e.length-g)}}if(c===0){a.splice(b-c-d,c+d,[1,f])}else if(d===0){a.splice(b-c-d,c+d,[-1,e])}else{a.splice(b-c-d,c+d,[-1,e],[1,f])}b=b-c-d+(c?1:0)+(d?1:0)+1}else if(b!==0&&a[b-1][0]==0){a[b-1][1]+=a[b][1];a.splice(b,1)}else{++b}d=0;c=0;e='';f='';break}}if(a[a.length-1][1]===''){a.pop()}var h=false;b=1;while(b<a.length-1){if(a[b-1][0]==0&&a[b+1][0]==0){if(a[b][1].substring(a[b][1].length-a[b-1][1].length)==a[b-1][1]){a[b][1]=a[b-1][1]+a[b][1].substring(0,a[b][1].length-a[b-1][1].length);a[b+1][1]=a[b-1][1]+a[b+1][1];a.splice(b-1,1);h=true}else if(a[b][1].substring(0,a[b+1][1].length)==a[b+1][1]){a[b-1][1]+=a[b+1][1];a[b][1]=a[b][1].substring(a[b+1][1].length)+a[b+1][1];a.splice(b+1,1);h=true}}++b}if(h){this.cleanupMerge(a)}}

var DIFF = new dmp;


function diffOldNew(tA, tB)
{
	var diffs = DIFF.main(tA, tB);
	DIFF.cleanupSemantic(diffs);
	var d, text, n = diffs.length, sA = "", sB= "";
	for (var x = 0; x < n; ++x)
	{
		d = diffs[x];
		text = d[1].replace(/&/g, '&amp;').replace(/</g, '&lt;')
				   .replace(/>/g, '&gt;').replace(/\t/g, "&nbsp; &nbsp; ");
		d = d[0];
		if (d < 0)
			sA = sA.concat('<del>', text.replace(/\n/g, '</del>\n<del>'), '</del>');
		else if (d)
			sB = sB.concat('<ins>', text.replace(/\n/g, '</ins>\n<ins>'), '</ins>');
		else
		{
			sA += text;
			sB += text;
		}
	}
	return (sA + sB).replace(/\r/g, "<br/>").split('\n');
}


function diffChars(lines)
{
	var t = diffHead(lines), i = t.i, S = t.S, ip = t.p,
		numA = 0, numB = 0, line, linCount = lines.length,
		prevTyp, typ = 3, nextTyp, LINES = [{t:0, a:0, b:0, txt:""}], n = 0;

	if (ip)
	  while (i < linCount)
	  {
		line = lines[i++];
		if (typ == 2) ++numA; else ++numB;
		if (line.beginswith("Name: "))
			LINES.push({t:8, a:numA=0, b:numB=0, txt:line.substring(6)});
		else if (line.beginswith("   + "))
			LINES.push({t:typ=1, a:0, b:numB, txt:line.substring(5)});
		else if (line.beginswith("   - "))
			LINES.push({t:typ=2, a:numA, b:0, txt:line.substring(5), ins:0});
		else if (line.length)
			LINES.push({t:typ, a:numA, b:numB, txt:line});
	  }
	else
	  while (i < linCount)
	  {
		line = lines[i++];
		typ = line.charCodeAt(0);
		t = line.substring(1);
		switch (typ)
		{
		case 64:	// '@'
			n = 0;
			t = line.match(lnumRE);
			numA = parseInt(t[1]);
			numB = parseInt(t[2]);
			if (t[3].length > 0)
				LINES.push({t:9, a:0, b:0, txt:t[3]});
			break;
		case 43:	// '+'
			if (n != 0) LINES[n].ins = LINES.length; else n = 0;
			LINES.push({t:1, a:0, b:numB++, txt:t});
			break;
		case 45:	// '-'
			if (n == 0) n = LINES.length;
			LINES.push({t:2, a:numA++, b:0, txt:t, ins:0});
			break;
		case 32:	// ' '
			n = 0;
			LINES.push({t:3, a:numA++, b:numB++, txt:t});
			break;
		case 92:	// '\\'
			LINES.push({t:3, a:'', b:'', txt:t});
			break;
		}
		prevTyp = typ;
	  }

	LINES.push(LINES[0]);
	linCount = LINES.length - 1;
	var tA = "", tB = "", m = "";
	for (i = 1; i <= linCount; ++i)
	{
		line = LINES[i];
		typ = line.t;
		t = line.txt;
		if (typ == 2 && line.ins)
		{
			n = i;
			tA = t + '\n';
		}
		else if (tA.length)
		{
			if (typ == 2)
				tA = tA.concat(t, '\n');
			else if (typ == 1)
				tB = tB.concat(t, '\n');
			else
			{
				m = diffOldNew(tA, tB);
				for (var j = 0; n < i; ++j)
					LINES[n++].txt = m[j];
				line.txt = esc(t);
				tA = tB = "";
			}
		}
		else
			line.txt = esc(t);
	}

	typ = 9;
	nextTyp = LINES[1].t;
	var isFirst, isLast, tr;
	for (i = 1; i < linCount; )
	{
		line = LINES[i];
		prevTyp = typ;
		typ = nextTyp;
		nextTyp = LINES[++i].t;
		t = line.txt;
		isFirst = (typ != prevTyp);
		isLast  = (typ != nextTyp);
		tr = isLast ? "</td></tr></tbody>\n" : "</td></tr>\n";
		switch (typ)
		{
		case 1:		// '+'
			S = S.concat(isFirst ? "<tbody>" : "",
						 (isFirst && prevTyp != 2) ? (isLast ? cOnly : cFirst) : (isLast ? cLast : cOther),
						 "<th></th><th>", line.b, "</th><td class='R'>", t, tr);
			break;
		case 2:		// '-'
			S = S.concat(isFirst ? "<tbody>" : "",
						 (isLast && nextTyp != 1) ? (isFirst ? cOnly : cLast) : (isFirst ? cFirst : cOther),
						 "<th>", line.a, "</th><th></th><td class='L'>", t, tr);
			break;
		case 3:		// ' '
			S = S.concat(isFirst ? "<tbody><tr><th>" : "<tr><th>",
						 line.a, "</th><th>", line.b, "</th><td>", t, tr);
			break;
		case 8:
			S = S.concat("<tr><th colspan='2'>Property:</th><td class='F'>", t, "</td></tr>");
			break;
		case 9:		// '@'
			if (t.length)
				S = S.concat("<tr><th colspan='2'>Function:</th><td class='F'>", t, "</td></tr>");
			else if (i > 2)
				S += "<tr><th>…</th><th>…</th><td class='F'></td></tr>";
			break;
		}
	}

	t = lines.join('\n').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return S.concat("</table><pre style='display:none'>", t, "</pre></li></ul></div>\n");
}

diff = diffChars;

