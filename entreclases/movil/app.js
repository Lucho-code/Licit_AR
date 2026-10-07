var We,j,Yt,Nn,de,Gt,Xt,Zt,mt,Be,Te,Jt,ht,ft,gt,ea,Ue={},Oe=[],jn=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,He=Array.isArray;function re(t,e){for(var a in e)t[a]=e[a];return t}function vt(t){t&&t.parentNode&&t.parentNode.removeChild(t)}function yt(t,e,a){var n,o,s,r={};for(s in e)s=="key"?n=e[s]:s=="ref"?o=e[s]:r[s]=e[s];if(arguments.length>2&&(r.children=arguments.length>3?We.call(arguments,2):a),typeof t=="function"&&t.defaultProps!=null)for(s in t.defaultProps)r[s]===void 0&&(r[s]=t.defaultProps[s]);return Ve(t,r,n,o,null)}function Ve(t,e,a,n,o){var s={type:t,props:e,key:a,ref:n,__k:null,__:null,__b:0,__e:null,__c:null,constructor:void 0,__v:o??++Yt,__i:-1,__u:0};return o==null&&j.vnode!=null&&j.vnode(s),s}function Ge(t){return t.children}function qe(t,e){this.props=t,this.context=e}function ge(t,e){if(e==null)return t.__?ge(t.__,t.__i+1):null;for(var a;e<t.__k.length;e++)if((a=t.__k[e])!=null&&a.__e!=null)return a.__e;return typeof t.type=="function"?ge(t):null}function zn(t){if(t.__P&&t.__d){var e=t.__v,a=e.__e,n=[],o=[],s=re({},e);s.__v=e.__v+1,j.vnode&&j.vnode(s),$t(t.__P,s,e,t.__n,t.__P.namespaceURI,32&e.__u?[a]:null,n,a??ge(e),!!(32&e.__u),o),s.__v=e.__v,s.__.__k[s.__i]=s,sa(n,s,o),e.__e=e.__=null,s.__e!=a&&ta(s)}}function ta(t){if((t=t.__)!=null&&t.__c!=null)return t.__e=t.__c.base=null,t.__k.some(function(e){if(e!=null&&e.__e!=null)return t.__e=t.__c.base=e.__e}),ta(t)}function bt(t){(!t.__d&&(t.__d=!0)&&de.push(t)&&!Fe.__r++||Gt!=j.debounceRendering)&&((Gt=j.debounceRendering)||Xt)(Fe)}function Fe(){try{for(var t,e=1;de.length;)de.length>e&&de.sort(Zt),t=de.shift(),e=de.length,zn(t)}finally{de.length=Fe.__r=0}}function aa(t,e,a,n,o,s,r,l,u,i,p){var m,c,f,g,y,$,h=n&&n.__k||Oe,b=e.length;for(u=Bn(a,e,h,u,b),m=0;m<b;m++)(f=a.__k[m])!=null&&(c=f.__i!=-1&&h[f.__i]||Ue,f.__i=m,$=$t(t,f,c,o,s,r,l,u,i,p),g=f.__e,f.ref&&c.ref!=f.ref&&(c.ref&&xt(c.ref,null,f),p.push(f.ref,f.__c||g,f)),y==null&&g!=null&&(y=g),4&f.__u?(u=na(f,u,t),c.__e&&(c.__e=null)):typeof f.type=="function"&&$!==void 0?u=$:g&&(u=g.nextSibling),f.__u&=-7);return a.__e=y,u}function Bn(t,e,a,n,o){var s,r,l,u,i,p=a.length,m=p,c=0;for(t.__k=new Array(o),s=0;s<o;s++)(r=e[s])!=null&&typeof r!="boolean"&&typeof r!="function"?(typeof r=="string"||typeof r=="number"||typeof r=="bigint"||r.constructor==String?r=t.__k[s]=Ve(null,r,null,null,null):He(r)?r=t.__k[s]=Ve(Ge,{children:r},null,null,null):r.constructor===void 0&&r.__b>0?r=t.__k[s]=Ve(r.type,r.props,r.key,r.ref?r.ref:null,r.__v):t.__k[s]=r,u=s+c,r.__=t,r.__b=t.__b+1,l=null,(i=r.__i=Vn(r,a,u,m))!=-1&&(m--,(l=a[i])&&(l.__u|=2)),l==null||l.__v==null?(i==-1&&(o>p?c--:o<p&&c++),typeof r.type!="function"&&(r.__u|=4)):i!=u&&(i==u-1?c--:i==u+1?c++:(i>u?c--:c++,r.__u|=4))):t.__k[s]=null;if(m)for(s=0;s<p;s++)(l=a[s])!=null&&(2&l.__u)==0&&(l.__e==n&&(n=ge(l)),ia(l,l));return n}function na(t,e,a){var n,o;if(typeof t.type=="function"){for(n=t.__k,o=0;n&&o<n.length;o++)n[o]&&(n[o].__=t,e=na(n[o],e,a));return e}t.__e!=e&&(e&&t.type&&!e.parentNode&&(e=ge(t)),e=a.insertBefore(t.__e,e||null));do e=e&&e.nextSibling;while(e!=null&&e.nodeType==8);return e}function Vn(t,e,a,n){var o,s,r,l=t.key,u=t.type,i=e[a],p=i!=null&&(2&i.__u)==0;if(i===null&&l==null||p&&l==i.key&&u==i.type)return a;if(n>(p?1:0)){for(o=a-1,s=a+1;o>=0||s<e.length;)if((i=e[r=o>=0?o--:s++])!=null&&(2&i.__u)==0&&l==i.key&&u==i.type)return r}return-1}function Kt(t,e,a){e[0]=="-"?t.setProperty(e,a??""):t[e]=a==null?"":typeof a!="number"||jn.test(e)?a:a+"px"}function ze(t,e,a,n,o){var s,r;e:if(e=="style")if(typeof a=="string")t.style.cssText=a;else{if(typeof n=="string"&&(t.style.cssText=n=""),n)for(e in n)a&&e in a||Kt(t.style,e,"");if(a)for(e in a)n&&a[e]==n[e]||Kt(t.style,e,a[e])}else if(e[0]=="o"&&e[1]=="n")s=e!=(e=e.replace(Jt,"$1")),r=e.toLowerCase(),e=r in t||e=="onFocusOut"||e=="onFocusIn"?r.slice(2):e.slice(2),t.l||(t.l={}),t.l[e+s]=a,a?n?a[Te]=n[Te]:(a[Te]=ht,t.addEventListener(e,s?gt:ft,s)):t.removeEventListener(e,s?gt:ft,s);else{if(o=="http://www.w3.org/2000/svg")e=e.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(e!="width"&&e!="height"&&e!="href"&&e!="list"&&e!="form"&&e!="tabIndex"&&e!="download"&&e!="rowSpan"&&e!="colSpan"&&e!="role"&&e!="popover"&&e in t)try{t[e]=a??"";break e}catch{}typeof a=="function"||(a==null||a===!1&&e[4]!="-"?t.removeAttribute(e):t.setAttribute(e,e=="popover"&&a==1?"":a))}}function Qt(t){return function(e){if(this.l){var a=this.l[e.type+t];if(e[Be]==null)e[Be]=ht++;else if(e[Be]<a[Te])return;return a(j.event?j.event(e):e)}}}function $t(t,e,a,n,o,s,r,l,u,i){var p,m,c,f,g,y,$,h,b,w,S,C,_,E,k,B,D=e.type;if(e.constructor!==void 0)return null;128&a.__u&&(u=!!(32&a.__u),s=[l=e.__e=a.__e]),(p=j.__b)&&p(e);e:if(typeof D=="function"){m=r.length;try{if(b=e.props,w=D.prototype&&D.prototype.render,S=(p=D.contextType)&&n[p.__c],C=p?S?S.props.value:p.__:n,a.__c?h=(c=e.__c=a.__c).__=c.__E:(w?e.__c=c=new D(b,C):(e.__c=c=new qe(b,C),c.constructor=D,c.render=Un),S&&S.sub(c),c.state||(c.state={}),c.__n=n,f=c.__d=!0,c.__h=[],c._sb=[]),w&&c.__s==null&&(c.__s=c.state),w&&D.getDerivedStateFromProps!=null&&(c.__s==c.state&&(c.__s=re({},c.__s)),re(c.__s,D.getDerivedStateFromProps(b,c.__s))),g=c.props,y=c.state,c.__v=e,f)w&&D.getDerivedStateFromProps==null&&c.componentWillMount!=null&&c.componentWillMount(),w&&c.componentDidMount!=null&&c.__h.push(c.componentDidMount);else{if(w&&D.getDerivedStateFromProps==null&&b!==g&&c.componentWillReceiveProps!=null&&c.componentWillReceiveProps(b,C),e.__v==a.__v||!c.__e&&c.shouldComponentUpdate!=null&&c.shouldComponentUpdate(b,c.__s,C)===!1){e.__v!=a.__v&&(c.props=b,c.state=c.__s,c.__d=!1),e.__e=a.__e,e.__k=a.__k,e.__k.some(function(I){I&&(I.__=e)}),Oe.push.apply(c.__h,c._sb),c._sb=[],c.__h.length&&r.push(c),l=ge(a);break e}c.componentWillUpdate!=null&&c.componentWillUpdate(b,c.__s,C),w&&c.componentDidUpdate!=null&&c.__h.push(function(){c.componentDidUpdate(g,y,$)})}if(c.context=C,c.props=b,c.__P=t,c.__e=!1,_=j.__r,E=0,w)c.state=c.__s,c.__d=!1,_&&_(e),p=c.render(c.props,c.state,c.context),Oe.push.apply(c.__h,c._sb),c._sb=[];else do c.__d=!1,_&&_(e),p=c.render(c.props,c.state,c.context),c.state=c.__s;while(c.__d&&++E<25);c.state=c.__s,c.getChildContext!=null&&(n=re(re({},n),c.getChildContext())),w&&!f&&c.getSnapshotBeforeUpdate!=null&&($=c.getSnapshotBeforeUpdate(g,y)),k=p!=null&&p.type===Ge&&p.key==null?ra(p.props.children):p,l=aa(t,He(k)?k:[k],e,a,n,o,s,r,l,u,i),c.base=e.__e,e.__u&=-161,c.__h.length&&r.push(c),h&&(c.__E=c.__=null)}catch(I){if(r.length=m,e.__v=null,u||s!=null){if(I.then){for(e.__u|=u?160:128;l&&l.nodeType==8&&l.nextSibling;)l=l.nextSibling;s!=null&&(s[s.indexOf(l)]=null),e.__e=l}else if(s!=null)for(B=s.length;B--;)vt(s[B])}else e.__e=a.__e;e.__k==null&&(e.__k=a.__k||[]),I.then||oa(e),j.__e(I,e,a)}}else s==null&&e.__v==a.__v?(e.__k=a.__k,e.__e=a.__e):l=e.__e=qn(a.__e,e,a,n,o,s,r,u,i);return(p=j.diffed)&&p(e),128&e.__u?void 0:l}function oa(t){t&&(t.__c&&(t.__c.__e=!0),t.__k&&t.__k.some(oa))}function sa(t,e,a){for(var n=0;n<a.length;n++)xt(a[n],a[++n],a[++n]);j.__c&&j.__c(e,t),t.some(function(o){try{t=o.__h,o.__h=[],t.some(function(s){s.call(o)})}catch(s){j.__e(s,o.__v)}})}function ra(t){return typeof t!="object"||t==null||t.__b>0?t:He(t)?t.map(ra):t.constructor!==void 0?null:re({},t)}function qn(t,e,a,n,o,s,r,l,u){var i,p,m,c,f,g,y,$=a.props||Ue,h=e.props,b=e.type;if(b=="svg"?o="http://www.w3.org/2000/svg":b=="math"?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),s!=null){for(i=0;i<s.length;i++)if((f=s[i])&&"setAttribute"in f==!!b&&(b?f.localName==b:f.nodeType==3)){t=f,s[i]=null;break}}if(t==null){if(b==null)return document.createTextNode(h);t=document.createElementNS(o,b,h.is&&h),l&&(j.__m&&j.__m(e,s),l=!1),s=null}if(b==null)$===h||l&&t.data==h||(t.data=h);else{if(s=b=="textarea"&&h.defaultValue!=null?null:s&&We.call(t.childNodes),!l&&s!=null)for($={},i=0;i<t.attributes.length;i++)$[(f=t.attributes[i]).name]=f.value;for(i in $)f=$[i],i=="dangerouslySetInnerHTML"?m=f:i=="children"||i in h||i=="value"&&"defaultValue"in h||i=="checked"&&"defaultChecked"in h||ze(t,i,null,f,o);for(i in h)f=h[i],i=="children"?c=f:i=="dangerouslySetInnerHTML"?p=f:i=="value"?g=f:i=="checked"?y=f:l&&typeof f!="function"||$[i]===f||ze(t,i,f,$[i],o);if(p)l||m&&(p.__html==m.__html||p.__html==t.innerHTML)||(t.innerHTML=p.__html),e.__k=[];else if(m&&(t.innerHTML=""),aa(e.type=="template"?t.content:t,He(c)?c:[c],e,a,n,b=="foreignObject"?"http://www.w3.org/1999/xhtml":o,s,r,s?s[0]:a.__k&&ge(a,0),l,u),s!=null)for(i=s.length;i--;)vt(s[i]);l&&b!="textarea"||(i="value",b=="progress"&&g==null?t.removeAttribute("value"):g!=null&&(g!==t[i]||b=="progress"&&!g||b=="option"&&g!=$[i])&&ze(t,i,g,$[i],o),i="checked",y!=null&&y!=t[i]&&ze(t,i,y,$[i],o))}return t}function xt(t,e,a){try{if(typeof t=="function"){var n=typeof t.__u=="function";n&&t.__u(),n&&e==null||(t.__u=t(e))}else t.current=e}catch(o){j.__e(o,a)}}function ia(t,e,a){var n,o;if(j.unmount&&j.unmount(t),(n=t.ref)&&(n.current&&n.current!=t.__e||xt(n,null,e)),(n=t.__c)!=null){if(n.componentWillUnmount)try{n.componentWillUnmount()}catch(s){j.__e(s,e)}n.base=n.__P=n.__n=null}if(n=t.__k)for(o=0;o<n.length;o++)n[o]&&ia(n[o],e,a||typeof t.type!="function");a||vt(t.__e),t.__c=t.__=t.__e=void 0}function Un(t,e,a){return this.constructor(t,a)}function la(t,e,a){var n,o,s,r;e==document&&(e=document.documentElement),j.__&&j.__(t,e),o=(n=typeof a=="function")?null:a&&a.__k||e.__k,s=[],r=[],$t(e,t=(!n&&a||e).__k=yt(Ge,null,[t]),o||Ue,Ue,e.namespaceURI,!n&&a?[a]:o?null:e.firstChild?We.call(e.childNodes):null,s,!n&&a?a:o?o.__e:e.firstChild,n,r),sa(s,t,r),t.props.children=null}function ca(t){function e(a){var n,o;return this.getChildContext||(n=new Set,(o={})[e.__c]=this,this.getChildContext=function(){return o},this.componentWillUnmount=function(){n=null},this.shouldComponentUpdate=function(s){this.props.value!=s.value&&n.forEach(function(r){r.__e=!0,bt(r)})},this.sub=function(s){n.add(s);var r=s.componentWillUnmount;s.componentWillUnmount=function(){n&&n.delete(s),r&&r.call(s)}}),a.children}return e.__c="__cC"+ea++,e.__=t,e.Provider=e.__l=(e.Consumer=function(a,n){return a.children(n)}).contextType=e,e}We=Oe.slice,j={__e:function(t,e,a,n){for(var o,s,r;e=e.__;)if((o=e.__c)&&!o.__)try{if((s=o.constructor)&&s.getDerivedStateFromError!=null&&(o.setState(s.getDerivedStateFromError(t)),r=o.__d),o.componentDidCatch!=null&&(o.componentDidCatch(t,n||{}),r=o.__d),r)return o.__E=o}catch(l){t=l}throw t}},Yt=0,Nn=function(t){return t!=null&&t.constructor===void 0},qe.prototype.setState=function(t,e){var a;a=this.__s!=null&&this.__s!=this.state?this.__s:this.__s=re({},this.state),typeof t=="function"&&(t=t(re({},a),this.props)),t&&re(a,t),t!=null&&this.__v&&(e&&this._sb.push(e),bt(this))},qe.prototype.forceUpdate=function(t){this.__v&&(this.__e=!0,t&&this.__h.push(t),bt(this))},qe.prototype.render=Ge,de=[],Xt=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,Zt=function(t,e){return t.__v.__b-e.__v.__b},Fe.__r=0,mt=Math.random().toString(8),Be="__d"+mt,Te="__a"+mt,Jt=/(PointerCapture)$|Capture$/i,ht=0,ft=Qt(!1),gt=Qt(!0),ea=0;var ua=function(t,e,a,n){var o;e[0]=0;for(var s=1;s<e.length;s++){var r=e[s++],l=e[s]?(e[0]|=r?1:2,a[e[s++]]):e[++s];r===3?n[0]=l:r===4?n[1]=Object.assign(n[1]||{},l):r===5?(n[1]=n[1]||{})[e[++s]]=l:r===6?n[1][e[++s]]+=l+"":r?(o=t.apply(l,ua(t,l,a,["",null])),n.push(o),l[0]?e[0]|=2:(e[s-2]=0,e[s]=o)):n.push(l)}return n},da=new Map;function pa(t){var e=da.get(this);return e||(e=new Map,da.set(this,e)),(e=ua(this,e.get(t)||(e.set(t,e=(function(a){for(var n,o,s=1,r="",l="",u=[0],i=function(c){s===1&&(c||(r=r.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?u.push(0,c,r):s===3&&(c||r)?(u.push(3,c,r),s=2):s===2&&r==="..."&&c?u.push(4,c,0):s===2&&r&&!c?u.push(5,0,!0,r):s>=5&&((r||!c&&s===5)&&(u.push(s,0,r,o),s=6),c&&(u.push(s,c,0,o),s=6)),r=""},p=0;p<a.length;p++){p&&(s===1&&i(),i(p));for(var m=0;m<a[p].length;m++)n=a[p][m],s===1?n==="<"?(i(),u=[u],s=3):r+=n:s===4?r==="--"&&n===">"?(s=1,r=""):r=n+r[0]:l?n===l?l="":r+=n:n==='"'||n==="'"?l=n:n===">"?(i(),s=1):s&&(n==="="?(s=5,o=r,r=""):n==="/"&&(s<5||a[p][m+1]===">")?(i(),s===3&&(u=u[0]),s=u,(u=u[0]).push(2,0,s),s=0):n===" "||n==="	"||n===`
`||n==="\r"?(i(),s=2):r+=n),s===3&&r==="!--"&&(s=4,u=u[0])}return i(),u})(t)),e),arguments,[])).length>1?e:e[0]}var d=pa.bind(yt);var _e,z,wt,ma,Ie=0,xa=[],V=j,fa=V.__b,ga=V.__r,ba=V.diffed,ha=V.__c,va=V.unmount,ya=V.__;function Qe(t,e){V.__h&&V.__h(z,t,Ie||e),Ie=0;var a=z.__H||(z.__H={__:[],__h:[]});return t>=a.__.length&&a.__.push({}),a.__[t]}function x(t){return Ie=1,On(ka,t)}function On(t,e,a){var n=Qe(_e++,2);if(n.t=t,!n.__c&&(n.__=[a?a(e):ka(void 0,e),function(l){var u=n.__N?n.__N[0]:n.__[0],i=n.t(u,l);u!==i&&(n.__N=[i,n.__[1]],n.__c.setState({}))}],n.__c=z,!z.__f)){var o=function(l,u,i){if(!n.__c.__H)return!0;var p=!1,m=n.__c.props!==l;if(n.__c.__H.__.some(function(f){if(f.__N){p=!0;var g=f.__[0];f.__=f.__N,f.__N=void 0,g!==f.__[0]&&(m=!0)}}),s){var c=s.call(this,l,u,i);return p?c||m:c}return!p||m};z.__f=!0;var s=z.shouldComponentUpdate,r=z.componentWillUpdate;z.componentWillUpdate=function(l,u,i){if(this.__e){var p=s;s=void 0,o(l,u,i),s=p}r&&r.call(this,l,u,i)},z.shouldComponentUpdate=o}return n.__N||n.__}function P(t,e){var a=Qe(_e++,3);!V.__s&&_a(a.__H,e)&&(a.__=t,a.u=e,z.__H.__h.push(a))}function U(t){return Ie=5,ee(function(){return{current:t}},[])}function ee(t,e){var a=Qe(_e++,7);return _a(a.__H,e)&&(a.__=t(),a.__H=e,a.__h=t),a.__}function be(t,e){return Ie=8,ee(function(){return t},e)}function wa(t){var e=z.context[t.__c],a=Qe(_e++,9);return a.c=t,e?(a.__==null&&(a.__=!0,e.sub(z)),e.props.value):t.__}function Fn(){for(var t;t=xa.shift();){var e=t.__H;if(t.__P&&e)try{e.__h.some(Ke),e.__h.some(_t),e.__h=[]}catch(a){e.__h=[],V.__e(a,t.__v)}}}V.__b=function(t){z=null,fa&&fa(t)},V.__=function(t,e){t&&e.__k&&e.__k.__m&&(t.__m=e.__k.__m),ya&&ya(t,e)},V.__r=function(t){ga&&ga(t),_e=0;var e=(z=t.__c).__H;e&&(wt===z?(e.__h=[],z.__h=[],e.__.some(function(a){a.__N&&(a.__=a.__N),a.u=a.__N=void 0})):(e.__h.some(Ke),e.__h.some(_t),e.__h=[],_e=0)),wt=z},V.diffed=function(t){ba&&ba(t);var e=t.__c;e&&e.__H&&(e.__H.__h.length&&(xa.push(e)!==1&&ma===V.requestAnimationFrame||((ma=V.requestAnimationFrame)||Wn)(Fn)),e.__H.__.some(function(a){a.u&&(a.__H=a.u,a.u=void 0)})),wt=z=null},V.__c=function(t,e){e.some(function(a){try{a.__h.some(Ke),a.__h=a.__h.filter(function(n){return!n.__||_t(n)})}catch(n){e.some(function(o){o.__h&&(o.__h=[])}),e=[],V.__e(n,a.__v)}}),ha&&ha(t,e)},V.unmount=function(t){va&&va(t);var e,a=t.__c;a&&a.__H&&(a.__H.__.some(function(n){try{Ke(n)}catch(o){e=o}}),a.__H=void 0,e&&V.__e(e,a.__v))};var $a=typeof requestAnimationFrame=="function";function Wn(t){var e,a=function(){clearTimeout(n),$a&&cancelAnimationFrame(e),setTimeout(t)},n=setTimeout(a,35);$a&&(e=requestAnimationFrame(a))}function Ke(t){var e=z,a=t.__c;typeof a=="function"&&(t.__c=void 0,a()),z=e}function _t(t){var e=z;t.__c=t.__(),z=e}function _a(t,e){return!t||t.length!==e.length||e.some(function(a,n){return a!==t[n]})}function ka(t,e){return typeof e=="function"?e(t):e}var kt=ca(null),M=()=>wa(kt);var Hn="entreclases";function oe(t){return new Promise((e,a)=>{t.onsuccess=()=>e(t.result),t.onerror=()=>a(t.error)})}function Gn(){return new Promise((t,e)=>{let a;try{a=indexedDB.open(Hn,1)}catch(n){e(n);return}a.onupgradeneeded=()=>{let n=a.result;n.objectStoreNames.contains("docs")||n.createObjectStore("docs"),n.objectStoreNames.contains("blobs")||n.createObjectStore("blobs")},a.onsuccess=()=>t(a.result),a.onerror=()=>e(a.error),a.onblocked=()=>e(new Error("IndexedDB bloqueada"))})}var Sa=t=>e=>e.startsWith(t)&&!e.slice(t.length).includes("/");function Kn(t){let e=(a,n="readonly")=>t.transaction(a,n).objectStore(a);return{persistent:!0,get:a=>oe(e("docs").get(a)).then(n=>n??null),set:(a,n)=>oe(e("docs","readwrite").put(n,a)),delete:a=>oe(e("docs","readwrite").delete(a)),async list(a){let n=IDBKeyRange.bound(a,`${a}\uFFFF`),o=e("docs"),[s,r]=await Promise.all([oe(o.getAllKeys(n)),oe(o.getAll(n))]),l=Sa(a);return s.map((u,i)=>({path:u,value:r[i]})).filter(u=>l(u.path))},async deletePrefix(a){let n=IDBKeyRange.bound(a,`${a}\uFFFF`);await oe(e("docs","readwrite").delete(n))},getBlob:a=>oe(e("blobs").get(a)).then(n=>n??null),setBlob:(a,n)=>oe(e("blobs","readwrite").put(n,a)),deleteBlob:a=>oe(e("blobs","readwrite").delete(a)),async clear(){await oe(e("docs","readwrite").clear()),await oe(e("blobs","readwrite").clear())}}}function Qn(){let t=new Map,e=new Map,a=n=>n==null?null:structuredClone(n);return{persistent:!1,get:async n=>a(t.get(n)),set:async(n,o)=>{t.set(n,a(o))},delete:async n=>{t.delete(n)},async list(n){let o=Sa(n);return[...t.entries()].filter(([s])=>o(s)).sort(([s],[r])=>s<r?-1:1).map(([s,r])=>({path:s,value:a(r)}))},async deletePrefix(n){for(let o of[...t.keys()])o.startsWith(n)&&t.delete(o)},getBlob:async n=>e.get(n)??null,setBlob:async(n,o)=>{e.set(n,o)},deleteBlob:async n=>{e.delete(n)},async clear(){t.clear(),e.clear()}}}async function Ca(){try{if(typeof indexedDB>"u")throw new Error("sin IndexedDB");let t=await Promise.race([Gn(),new Promise((a,n)=>setTimeout(()=>n(new Error("IndexedDB no responde")),2e3))]),e=Kn(t);return await e.set("meta/probe",1),e}catch{return Qn()}}var St="ABCDEFGHJKMNPQRSTUVWXYZ23456789";function Da(t,e){let a=new Uint32Array(t);return globalThis.crypto.getRandomValues(a),Array.from(a,n=>n%e)}function ke(t=""){let e="0123456789abcdefghijklmnopqrstuvwxyz",a=Da(12,e.length).map(n=>e[n]).join("");return t?`${t}_${a}`:a}function Ea(){return Da(6,St.length).map(t=>St[t]).join("")}function Ye(t){return String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6)}function Aa(t){return/^[A-Z0-9]{6}$/.test(t)&&[...t].every(e=>St.includes(e))}function Se(t){return String(t||"").split(/[,/]/)[0].trim().toUpperCase().replace(/[¿?¡!.]/g,"").replace(/\s+/g,"-")}function se(t=new Date){let e=t.getFullYear(),a=String(t.getMonth()+1).padStart(2,"0"),n=String(t.getDate()).padStart(2,"0");return`${e}-${a}-${n}`}function Xe(t){let[e,a,n]=t.split("-").map(Number);return Date.UTC(e,a-1,n)}function Yn(t){let e=new Date(t),a=e.getUTCFullYear(),n=String(e.getUTCMonth()+1).padStart(2,"0"),o=String(e.getUTCDate()).padStart(2,"0");return`${a}-${n}-${o}`}function Z(t,e){return Yn(Xe(t)+e*864e5)}function Ma(t,e){return Math.round((Xe(e)-Xe(t))/864e5)}function ue(t){return new Date(Xe(t)).getUTCDay()}function Ta(t){let e=ue(t);return Z(t,e===0?-6:1-e)}var ie=["domingo","lunes","martes","mi\xE9rcoles","jueves","viernes","s\xE1bado"],Ia=["dom","lun","mar","mi\xE9","jue","vie","s\xE1b"];function Ra(t){let[e,a,n]=t.split("-").map(Number),o=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];return`${ie[ue(t)]} ${n} ${o[a-1]} ${e}`}function Pa(t){let[,e,a]=t.split("-").map(Number);return`${a}/${e}`}var Ct=[{n:1,title:"Saludos",signs:["hola","chau","gracias","por favor","perd\xF3n"],phrases:["\xBFC\xF3mo est\xE1s?","Bien, \xBFy vos?"]},{n:2,title:"Presentarse",signs:["nombre","yo","vos","sordo / sorda","oyente"],phrases:["\xBFC\xF3mo te llam\xE1s?","\xBFSos sordo u oyente?"]},{n:3,title:"Preguntas",signs:["qu\xE9","qui\xE9n","d\xF3nde","cu\xE1ndo","por qu\xE9"],phrases:["\xBFD\xF3nde viv\xEDs?","\xBFQu\xE9 hac\xE9s?"]},{n:4,title:"Familia",signs:["mam\xE1","pap\xE1","hermano / hermana","hijo / hija","familia"],phrases:["\xBFTen\xE9s hermanos?","Mi familia es grande"]},{n:5,title:"Tiempo",signs:["hoy","ma\xF1ana","ayer","semana","d\xEDa"],phrases:["\xBFQu\xE9 d\xEDa es hoy?","Nos vemos ma\xF1ana"]},{n:6,title:"C\xF3mo estoy",signs:["contento / contenta","triste","cansado / cansada","enojado / enojada","bien"],phrases:["Estoy cansado","\xBFQu\xE9 te pasa?"]},{n:7,title:"Lugares",signs:["casa","escuela","trabajo","ba\xF1o","hospital"],phrases:["\xBFD\xF3nde est\xE1 el ba\xF1o?","Voy al trabajo"]},{n:8,title:"Acciones",signs:["comer","tomar (beber)","dormir","trabajar","estudiar"],phrases:["\xBFComiste?","Tengo que estudiar"]},{n:9,title:"Comunicarse",signs:["entender","repetir","despacio","aprender","lengua de se\xF1as"],phrases:["No entiendo, \xBFpod\xE9s repetir?","Estoy aprendiendo lengua de se\xF1as"]},{n:10,title:"Ayudar",signs:["s\xED","no","querer","poder","ayudar"],phrases:["\xBFNecesit\xE1s ayuda?","Quiero aprender m\xE1s"]}];function La(){let t=[];for(let e of Ct)e.signs.forEach((a,n)=>{t.push({kind:"sign",meanings:[a],lesson:e.n,order:n+1})}),e.phrases.forEach((a,n)=>{t.push({kind:"phrase",meanings:[a],lesson:e.n,order:e.signs.length+n+1})});return t}function Na(t=Ct.length){return Array.from({length:t},(e,a)=>{var n;return{n:a+1,title:((n=Ct[a])==null?void 0:n.title)||""}})}var Y=Object.freeze({PENDING:"pendiente",RECORDED:"grabada",VALIDATED:"validada"});function Ze(t,e){return!e||e.length===0?Y.PENDING:t.validatedBy?Y.VALIDATED:Y.RECORDED}function Dt(t,e,{onlyValidated:a=!0}={}){let n=Ce(e);return t.filter(o=>(n.get(o.id)||[]).length===0?!1:a?!!o.validatedBy:!0)}function Ce(t){let e=new Map;for(let a of t)e.has(a.itemId)||e.set(a.itemId,[]),e.get(a.itemId).push(a);return e}function Et({course:t,items:e,media:a,signers:n,version:o,onlyValidated:s=!0,now:r=Date.now()}){let l=Ce(a),u=new Map((n||[]).map(p=>[p.id,p.name])),i=Dt(e,a,{onlyValidated:s}).map(p=>{var c;let m=(l.get(p.id)||[]).slice().sort((f,g)=>f.id===p.primaryMediaId?-1:g.id===p.primaryMediaId?1:(f.createdAt||0)-(g.createdAt||0));return{id:p.id,kind:p.kind,meanings:(p.meanings||[]).filter(Boolean),gloss:p.gloss||Se((c=p.meanings)==null?void 0:c[0]),lesson:Number(p.lesson)||1,order:Number(p.order)||0,notes:p.notes||"",region:p.region||t.region||"",media:m.map(f=>({id:f.id,src:f.src,signer:u.get(f.signerId)||"",angle:f.angle||"frente"}))}}).sort((p,m)=>p.lesson-m.lesson||p.order-m.order);return{version:o,publishedAt:r,signLanguage:t.signLanguage||"lsa",lessons:(t.lessonTitles||[]).map(p=>({n:p.n,title:p.title||""})),items:i}}function Ba(t){let e=t>>>0;return function(){e=e+1831565813>>>0;let n=e;return n=Math.imul(n^n>>>15,n|1),n^=n+Math.imul(n^n>>>7,n|61),((n^n>>>14)>>>0)/4294967296}}function De(t,e=Math.random){let a=t.slice();for(let n=a.length-1;n>0;n--){let o=Math.floor(e()*(n+1));[a[n],a[o]]=[a[o],a[n]]}return a}function J(t){return t.meanings&&t.meanings.find(e=>e&&e.trim())||t.gloss||"\u2014"}var ja=t=>String(t||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[¿?¡!.,]/g,"").trim();function za(t,e){let a=new Set([ja(e)]),n=[];for(let o of t){let s=ja(J(o));a.has(s)||(a.add(s),n.push(o))}return n}function Je(t,e,a,n=Math.random,o={}){let s=o.textOptions??4,r=o.videoOptions??3,l=(t==="text-to-video"?r:s)-1,u=a.filter(f=>f.id!==e.id&&f.media&&f.media.length>0),i=De(u.filter(f=>f.kind===e.kind),n),p=za(i,J(e));if(p.length<l&&t==="video-to-text"){let f=De(u.filter(g=>g.kind!==e.kind),n);p=za([...p,...f],J(e))}let m=p.slice(0,l);if(m.length===0)return null;let c=De([e,...m],n).map(f=>({id:f.id,label:J(f)}));return{key:`${t}:${e.id}`,type:t,itemId:e.id,kind:e.kind,options:c,answerId:e.id}}function Va(t,e,a=Math.random){let n=[],o=0;for(let s of t){let r="video-to-text";s.kind==="sign"&&(r=o%2===0?"video-to-text":"text-to-video",o+=1);let l=Je(r,s,e,a)||(r==="text-to-video"?Je("video-to-text",s,e,a):null);l&&n.push(l)}return De(n,a)}function At(t,e,a=Math.random,n=12){let o=[];for(let s of t.slice(0,n)){let r=s.kind==="sign"&&a()<.5?"text-to-video":"video-to-text",l=Je(r,s,e,a)||Je("video-to-text",s,e,a);l&&o.push(l)}return o}function qa(t,e){return t.answerId===e}var Xn=[{name:"constante",share:.35,pDay:.88,stopAfter:null},{name:"irregular",share:.25,pDay:.5,stopAfter:null},{name:"abandona",share:.2,pDay:.9,stopAfter:3},{name:"antes-de-clase",share:.2,pDay:0,stopAfter:null}];function Ua({n:t=40,startKey:e,todayKey:a,classWeekday:n=3,windowDays:o=10,lessonsCount:s=10,itemIds:r=[],seed:l=42}){let u=Ba(l),i=[],p=[],m=(Number(n??3)+6)%7,c=0;for(let f of Xn){let g=Math.round(t*f.share);for(let y=0;y<g&&c<t;y++,c++){let $=`sim_${c+1}`,h=Z(e,Math.floor(u()*3));i.push({uid:$,alias:`Simulado ${c+1}`,joinedDate:h,joinedAt:Date.parse(`${h}T12:00:00Z`),simulated:!0});let b=0;for(let w=0;w<o;w++){let S=Z(h,w);if(S>a)break;let C;if(f.name==="antes-de-clase"?C=w===0||ue(S)===m:f.stopAfter!==null&&w>=f.stopAfter?C=!1:C=w===0||u()<f.pDay,!C)continue;let _=f.name==="antes-de-clase"?22:18+Math.floor(u()*4),k=Date.parse(`${S}T${String(_).padStart(2,"0")}:00:00Z`),B=D=>p.push({uid:$,d:S,at:k+=2e4+Math.floor(u()*4e4),...D});if(b<s){b+=1;for(let D=0;D<7;D++)B({t:"learn",i:r[(b*7+D)%Math.max(1,r.length)]||null,l:b});for(let D=0;D<7;D++)B({t:"answer",ok:u()<.82,l:b,q:"video-to-text"});B({t:"lesson_done",l:b})}else{for(let D=0;D<6;D++)B({t:"answer",ok:u()<.88,q:"video-to-text"});B({t:"review_done"})}}}}return{participants:i,events:p}}var Ee=Object.freeze({windowDays:10,minActiveDays:7,confirmShare:.5,reachLesson:5,refuteShare:.25,preClassShare:.4}),Oa=new Set(["learn","mirror","self","answer","lesson_done","review_done"]);function Zn(t,e,a,n){let o={...Ee,...a},s=e.filter(g=>g.uid===t.uid),r=t.joinedDate,l=Z(r,o.windowDays-1),u=[...new Set(s.filter(g=>Oa.has(g.t)).map(g=>g.d))].sort(),i=u.filter(g=>g>=r&&g<=l),p=s.filter(g=>g.t==="answer"),m=p.filter(g=>g.ok).length,c=new Set(s.filter(g=>g.t==="lesson_done").map(g=>g.l)).size,f=s.reduce((g,y)=>Math.max(g,y.at||0),0)||null;return{uid:t.uid,alias:t.alias,joinedDate:r,windowEnd:l,windowEnded:n>l,activeDates:u,activeInWindow:i.length,dayIndexes:new Set(i.map(g=>Ma(r,g)+1)),lessonsDone:c,answers:p.length,accuracy:p.length?m/p.length:null,lastAt:f,completed:i.length>=o.minActiveDays,reachedLesson:c>=o.reachLesson}}function Jn(t){if(!t.length)return null;let e=t.slice().sort((n,o)=>n-o),a=Math.floor(e.length/2);return e.length%2?e[a]:(e[a-1]+e[a])/2}function Fa({participants:t,events:e,classWeekday:a=null,thresholds:n,paymentSignal:o=!1,todayKey:s}){let r={...Ee,...n},l=t.map(b=>Zn(b,e,r,s)),u=l.length,i=[];for(let b=1;b<=r.windowDays;b++){let w=l.filter(C=>Z(C.joinedDate,b-1)<=s),S=w.filter(C=>C.dayIndexes.has(b));i.push({day:b,eligible:w.length,active:S.length,share:w.length?S.length/w.length:null})}let p=null;if(a!=null&&a!==""){let b=(Number(a)+6)%7,w=l.flatMap(C=>C.activeDates.filter(_=>_>=C.joinedDate&&_<=C.windowEnd)),S=w.filter(C=>ue(C)===b).length;p=w.length?{weekday:b,share:S/w.length,days:w.length}:null}let m=new Map;for(let b of e){if(!Oa.has(b.t)||!b.at)continue;let w=`${b.uid}|${b.d}`,S=m.get(w)||[b.at,b.at];m.set(w,[Math.min(S[0],b.at),Math.max(S[1],b.at)])}let c=[...m.values()].map(([b,w])=>Math.min(60,(w-b)/6e4)),f=l.filter(b=>b.windowEnded),g=f.length?f:l,y=(b,w)=>b.length?b.filter(w).length/b.length:null,$=l.filter(b=>b.accuracy!==null),h={n:u,ended:f.length,completionShare:y(g,b=>b.completed),reachShare:y(g,b=>b.reachedLesson),avgActiveDays:u?l.reduce((b,w)=>b+w.activeInWindow,0)/u:null,avgAccuracy:$.length?$.reduce((b,w)=>b+w.accuracy,0)/$.length:null,medianMinutes:Jn(c),retention:i,preClass:p};return{thresholds:r,stats:l,summary:h,verdict:eo(h,r,o)}}function eo(t,e,a){let n=!!(t.preClass&&t.preClass.share>=e.preClassShare);return t.n===0?{code:"sin-datos",title:"Todav\xEDa no hay alumnos",detail:"Compart\xED el c\xF3digo del curso para empezar la cohorte.",preClassFlag:n}:t.ended<Math.ceil(t.n*.8)?{code:"en-curso",title:"Piloto en curso",detail:`${t.ended} de ${t.n} alumnos terminaron su ventana de ${e.windowDays} d\xEDas. Los valores son parciales.`,preClassFlag:n}:t.reachShare!==null&&t.reachShare<e.refuteShare?{code:"refuta",title:"La hip\xF3tesis no se sostiene",detail:`Menos del ${X(e.refuteShare)} lleg\xF3 a la lecci\xF3n ${e.reachLesson}. Con material diario hecho por su docente, el grupo no sostuvo la pr\xE1ctica.`,preClassFlag:n}:t.completionShare!==null&&t.completionShare>=e.confirmShare?n?{code:"no-concluyente",title:"Hay uso, pero no h\xE1bito",detail:"Se alcanz\xF3 el umbral de d\xEDas, pero la pr\xE1ctica se concentra el d\xEDa anterior a la clase.",preClassFlag:n}:a?{code:"confirma",title:"La hip\xF3tesis se confirma",detail:"El grupo practic\xF3 entre clases y hay se\xF1al de pago.",preClassFlag:n}:{code:"confirma-uso",title:"El uso se confirma; falta la se\xF1al de pago",detail:"El grupo practic\xF3 entre clases. Falta que la instituci\xF3n acepte un piloto pago o que haya pre-compras.",preClassFlag:n}:{code:"no-concluyente",title:"Resultado no concluyente",detail:"Qued\xF3 entre los dos umbrales. Revis\xE1 las entrevistas antes de decidir.",preClassFlag:n}}function X(t,e=0){return t==null||Number.isNaN(t)?"\u2014":`${(t*100).toFixed(e).replace(".",",")}\xA0%`}var he=class extends Error{constructor(e,a){super(a),this.code=e}};function Mt(t){return Math.max(1,Math.min(60,Number(t)||10))}function to(t){return t===""||t===null||t===void 0?null:Number(t)}function ao(t){return Object.fromEntries(Object.entries(t||{}).filter(([,e])=>e!==void 0))}function Wa({name:t,region:e,classWeekday:a,lessonsCount:n,lessonTitles:o},{code:s,ownerUid:r,now:l=Date.now()}){let u=Mt(n);return{name:String(t||"").trim().slice(0,80)||"Curso sin nombre",code:s,region:String(e||"").trim().slice(0,60),classWeekday:to(a),lessonsCount:u,lessonTitles:o||Array.from({length:u},(i,p)=>({n:p+1,title:""})),signLanguage:"lsa",publishedVersion:0,ownerUid:r,createdAt:l,pilot:{thresholds:{...Ee},paymentSignal:!1,notes:""}}}function Ha(t,e,a=Date.now()){let o={...{kind:"sign",meanings:[],lesson:1,order:0,notes:"",region:"",params:{},validatedBy:null,validatedAt:null,primaryMediaId:null,createdAt:a},...t||{},...ao(e),updatedAt:a};return o.kind=o.kind==="phrase"?"phrase":"sign",o.meanings=(o.meanings||[]).map(s=>String(s).trim()).filter(Boolean),o.lesson=Number(o.lesson)||1,o.order=Number(o.order)||0,o.gloss=e&&e.gloss||Se(o.meanings[0]),o}function Ga(t,e,a,n=Date.now()){return{uid:t,alias:e,joinedAt:n,joinedDate:a,srs:{},lastLessonDate:null,practiceDates:[],lastActiveAt:n}}var tt={name:"Curso de muestra",code:"PRUEBA",region:"Muestra",classWeekday:3,lessonTitles:[{n:1,title:"Trazos simples"},{n:2,title:"M\xE1s trazos"}]},no="Video de muestra para probar la app. No es una se\xF1a de LSA.",Ka=[{key:"circulo",kind:"sign",meanings:["C\xEDrculo"],lesson:1,order:1},{key:"ocho",kind:"sign",meanings:["Ocho"],lesson:1,order:2},{key:"zigzag",kind:"sign",meanings:["Zigzag"],lesson:1,order:3},{key:"vaiven",kind:"sign",meanings:["Vaiv\xE9n"],lesson:1,order:4},{key:"frase-circulo-vaiven",kind:"phrase",meanings:["C\xEDrculo y vaiv\xE9n"],lesson:1,order:5},{key:"arriba-abajo",kind:"sign",meanings:["Arriba y abajo"],lesson:2,order:1},{key:"diagonal",kind:"sign",meanings:["Diagonal"],lesson:2,order:2},{key:"frase-ocho-diagonal",kind:"phrase",meanings:["Ocho y diagonal"],lesson:2,order:3}].map(t=>({...t,notes:no})),Qa={name:"Piloto LSA (borrador)",region:"Litoral (Rosario)",classWeekday:3,lessonsCount:10},et=null;function oo(){var t;if(et===null)try{let e=(t=globalThis.document)==null?void 0:t.createElement("video");et=e?!e.canPlayType('video/mp4; codecs="avc1.4D401E"'):!1}catch{et=!1}return!et}function Ya(t){let e=oo()?"mp4":"webm",a=globalThis.__ENTRECLASES_DEMO_VIDEOS__;return a&&a[`${t}.${e}`]?a[`${t}.${e}`]:`demo/${t}.${e}`}var so="demo-user",Tt=1;var at=class{constructor(){this.mode="demo",this.kv=null,this.urls=new Map,this.session={uid:so,email:null,name:"Vos",isAnonymous:!1,staff:!0}}async init(){this.kv=await Ca(),this.persistent=this.kv.persistent;let e=await this.kv.get("meta/seed");(!e||e.version!==Tt)&&(await this.seedDemo(),await this.kv.set("meta/seed",{version:Tt,at:Date.now()}))}getSession(){return this.session}onSessionChange(e){return e(this.session),()=>{}}async signInStaff(){return this.session}async signOut(){}async seedDemo(){let e=Date.now(),a=await this._newCourse({...tt,lessonsCount:tt.lessonTitles.length},tt.code),n={id:"sg_muestra",name:"Muestra",region:"",role:"muestra",consent:null,sample:!0,createdAt:e};await this.kv.set(`courses/${a.id}/signers/${n.id}`,n);let o=[],s=[];for(let l of Ka){let u={id:`it_${l.key}`,kind:l.kind,meanings:l.meanings,gloss:Se(l.meanings[0]),lesson:l.lesson,order:l.order,notes:l.notes,region:"",params:{},validatedBy:"Muestra",validatedAt:e,primaryMediaId:`md_${l.key}`,createdAt:e,updatedAt:e},i={id:`md_${l.key}`,itemId:u.id,signerId:n.id,angle:"frente",src:`demo:${l.key}`,mimeType:"video/mp4",width:480,height:360,fps:50,durationMs:l.kind==="phrase"?6e3:3e3,createdAt:e};o.push(u),s.push(i),await this.kv.set(`courses/${a.id}/items/${u.id}`,u),await this.kv.set(`courses/${a.id}/media/${i.id}`,i)}let r=Et({course:a,items:o,media:s,signers:[n],version:1,now:e});await this.kv.set(`courses/${a.id}/packs/1`,r),await this.updateCourse(a.id,{publishedVersion:1}),await this.createCourse({...Qa,withDraftPlan:!0})}async resetDemo(){for(let e of this.urls.values())URL.revokeObjectURL(e);this.urls.clear(),await this.kv.clear(),await this.seedDemo(),await this.kv.set("meta/seed",{version:Tt,at:Date.now()})}async _uniqueCode(e){if(e&&!await this.kv.get(`codes/${e}`))return e;for(;;){let a=Ea();if(!await this.kv.get(`codes/${a}`))return a}}async _newCourse(e,a){let n=ke("c"),o=await this._uniqueCode(a),s={id:n,...Wa(e,{code:o,ownerUid:this.session.uid})};return await this.kv.set(`courses/${n}`,s),await this.kv.set(`codes/${o}`,{courseId:n,name:s.name}),s}async createCourse({name:e,region:a,classWeekday:n,lessonsCount:o=10,withDraftPlan:s=!1}){let r=Mt(o),l=await this._newCourse({name:e,region:a,classWeekday:n,lessonsCount:r,lessonTitles:s?Na(r):void 0});if(s)for(let u of La().filter(i=>i.lesson<=r))await this.saveItem(l.id,u);return l}async listMyCourses(){return(await this.kv.list("courses/")).map(a=>a.value).sort((a,n)=>a.createdAt-n.createdAt)}getCourse(e){return this.kv.get(`courses/${e}`)}async updateCourse(e,a){let n=await this.getCourse(e);if(!n)throw new he("not-found","No encontramos el curso.");let o={...n,...a};return await this.kv.set(`courses/${e}`,o),a.name&&await this.kv.set(`codes/${n.code}`,{courseId:e,name:o.name}),o}async listStaff(){return[{email:"Este dispositivo",role:"owner"}]}async addStaff(){throw new he("demo","Sumar docentes requiere el modo piloto (con Firebase). En el demo, todo queda en este dispositivo.")}async removeStaff(){throw new he("demo","No disponible en el modo demo.")}async listItems(e){return(await this.kv.list(`courses/${e}/items/`)).map(n=>n.value).sort((n,o)=>n.lesson-o.lesson||n.order-o.order)}async saveItem(e,a){let n=a.id||ke("it"),o=a.id?await this.kv.get(`courses/${e}/items/${n}`):null,s={...Ha(o,a),id:n};return await this.kv.set(`courses/${e}/items/${n}`,s),s}async deleteItem(e,a){for(let n of(await this.listMedia(e)).filter(o=>o.itemId===a))await this.deleteMedia(e,n,{keepItem:!0});await this.kv.delete(`courses/${e}/items/${a}`)}async listMedia(e){return(await this.kv.list(`courses/${e}/media/`)).map(n=>n.value).sort((n,o)=>n.createdAt-o.createdAt)}async addMedia(e,{itemId:a,blob:n,signerId:o,angle:s,width:r,height:l,fps:u,durationMs:i,mimeType:p},m){let c=ke("md");await this.kv.setBlob(c,n);let f={id:c,itemId:a,signerId:o||null,angle:s||"frente",src:`local:${c}`,mimeType:p||n.type||"video/webm",width:r||null,height:l||null,fps:u||null,durationMs:i||null,sizeBytes:n.size,createdAt:Date.now()};await this.kv.set(`courses/${e}/media/${c}`,f);let g=await this.kv.get(`courses/${e}/items/${a}`);return g&&!g.primaryMediaId&&await this.saveItem(e,{id:a,primaryMediaId:c}),m==null||m(1),f}async deleteMedia(e,a,{keepItem:n=!1}={}){var s,r;await this.kv.delete(`courses/${e}/media/${a.id}`),(s=a.src)!=null&&s.startsWith("local:")&&await this.kv.deleteBlob(a.id);let o=this.urls.get(a.id);if(o&&(URL.revokeObjectURL(o),this.urls.delete(a.id)),!n){let l=await this.kv.get(`courses/${e}/items/${a.itemId}`);if(l&&l.primaryMediaId===a.id){let u=(await this.listMedia(e)).filter(i=>i.itemId===a.itemId);await this.saveItem(e,{id:l.id,primaryMediaId:((r=u[0])==null?void 0:r.id)||null,validatedBy:u.length?l.validatedBy:null})}}}async listSigners(e){return(await this.kv.list(`courses/${e}/signers/`)).map(n=>n.value).sort((n,o)=>n.createdAt-o.createdAt)}async saveSigner(e,a){let n=a.id||ke("sg"),o=a.id?await this.kv.get(`courses/${e}/signers/${n}`):null,s={createdAt:Date.now(),...o,...a,id:n,updatedAt:Date.now()};return await this.kv.set(`courses/${e}/signers/${n}`,s),s}async deleteSigner(e,a){await this.kv.delete(`courses/${e}/signers/${a}`)}async publish(e,{onlyValidated:a=!0}={}){let n=await this.getCourse(e),[o,s,r]=await Promise.all([this.listItems(e),this.listMedia(e),this.listSigners(e)]),l=(n.publishedVersion||0)+1,u=Et({course:n,items:o,media:s,signers:r,version:l,onlyValidated:a});if(u.items.length===0)throw new he("empty","No hay se\xF1as listas para publicar.");return await this.kv.set(`courses/${e}/packs/${l}`,u),await this.updateCourse(e,{publishedVersion:l,publishedAt:u.publishedAt}),{version:l,count:u.items.length}}async listPacks(e){return(await this.kv.list(`courses/${e}/packs/`)).map(n=>({version:n.value.version,publishedAt:n.value.publishedAt,count:n.value.items.length})).sort((n,o)=>o.version-n.version)}async findCourseByCode(e){let a=await this.kv.get(`codes/${e}`);return a?{courseId:a.courseId,name:a.name}:null}async joinCourse(e,a){let n=`courses/${e}/participants/${this.session.uid}`,o=await this.kv.get(n),s=se(),r=o?{...o,alias:a}:Ga(this.session.uid,a,s);return await this.kv.set(n,r),o||await this.logEvents(e,[{t:"join",at:Date.now(),d:s}]),r}getParticipant(e){return this.kv.get(`courses/${e}/participants/${this.session.uid}`)}async updateParticipant(e,a){let n=`courses/${e}/participants/${this.session.uid}`,o=await this.kv.get(n);await this.kv.set(n,{...o,...a})}async getPack(e){let a=await this.getCourse(e);return!a||!a.publishedVersion?null:this.kv.get(`courses/${e}/packs/${a.publishedVersion}`)}async logEvents(e,a){a.length&&await this.kv.set(`courses/${e}/events/${ke("ev")}`,{uid:this.session.uid,events:a})}async flushEvents(){}async listParticipants(e){return(await this.kv.list(`courses/${e}/participants/`)).map(n=>n.value)}async listEvents(e){return(await this.kv.list(`courses/${e}/events/`)).flatMap(n=>n.value.events.map(o=>({...o,uid:n.value.uid})))}async simulate(e){var l,u;let a=await this.getCourse(e);await this.clearSimulation(e);let n=se(),o=await this.listItems(e),{participants:s,events:r}=Ua({n:40,startKey:Z(n,-13),todayKey:n,classWeekday:a.classWeekday??3,windowDays:((u=(l=a.pilot)==null?void 0:l.thresholds)==null?void 0:u.windowDays)||10,lessonsCount:a.lessonsCount||10,itemIds:o.map(i=>i.id),seed:Math.floor(Math.random()*1e6)});for(let i of s)await this.kv.set(`courses/${e}/participants/${i.uid}`,{...i,srs:{}}),await this.kv.set(`courses/${e}/events/sim_${i.uid}`,{uid:i.uid,simulated:!0,events:r.filter(p=>p.uid===i.uid).map(({uid:p,...m})=>m)})}async clearSimulation(e){for(let a of await this.kv.list(`courses/${e}/participants/`))a.value.simulated&&await this.kv.delete(a.path);for(let a of await this.kv.list(`courses/${e}/events/`))a.value.simulated&&await this.kv.delete(a.path)}async mediaSrc(e){let a=(e==null?void 0:e.src)||"";if(a.startsWith("demo:"))return Ya(a.slice(5));if(a.startsWith("local:")){let n=a.slice(6);if(this.urls.has(n))return this.urls.get(n);let o=await this.kv.getBlob(n);if(!o)return null;let s=URL.createObjectURL(o);return this.urls.set(n,s),s}return a||null}};var ro=!1;async function Xa(){var n;let t=globalThis.ENTRECLASES_CONFIG||{},e=!1;try{e=new URLSearchParams(((n=globalThis.location)==null?void 0:n.search)||"").has("demo")}catch{e=!1}if(!ro&&t.firebase&&t.firebase.projectId&&!e){let{FirebaseStore:o}=await import("./chunks/firebase-store.stub-F6QADB2W.js"),s=new o(t);return await s.init(),s}let a=new at;return await a.init(),a}var Ae=new Map,It="entreclases.",H={get(t,e=null){try{let a=localStorage.getItem(It+t);return a===null?Ae.has(t)?Ae.get(t):e:JSON.parse(a)}catch{return Ae.has(t)?Ae.get(t):e}},set(t,e){Ae.set(t,e);try{localStorage.setItem(It+t,JSON.stringify(e))}catch{}},remove(t){Ae.delete(t);try{localStorage.removeItem(It+t)}catch{}}};async function Za(t,e,a="text/csv"){let n=new Blob([e],{type:`${a};charset=utf-8`}),o=URL.createObjectURL(n),s=document.createElement("a");return s.href=o,s.download=t,document.body.appendChild(s),s.click(),s.remove(),setTimeout(()=>URL.revokeObjectURL(o),4e3),"saved"}var Re=!1,L=(...t)=>t.filter(Boolean).join(" "),Rt=t=>`${String(t).replace(".",",")}\xD7`;function Pt(t,e=1){return t==null||Number.isNaN(t)?"\u2014":Number(t).toFixed(e).replace(".",",")}function Lt(t){return t?t<1024*1024?`${Math.round(t/1024)} KB`:`${(t/1024/1024).toFixed(1).replace(".",",")} MB`:""}function Nt(t){return t?`${(t/1e3).toFixed(1).replace(".",",")} s`:""}function nt(t){if(!t)return"\u2014";let e=new Date(t);return`${e.getDate()}/${e.getMonth()+1} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function G(t,e=[]){let[a,n]=x({loading:!0,data:null,error:null}),[o,s]=x(0);P(()=>{let l=!0;return n(u=>({...u,loading:!0,error:null})),Promise.resolve().then(t).then(u=>l&&n({loading:!1,data:u,error:null}),u=>l&&n({loading:!1,data:null,error:u})),()=>{l=!1}},[...e,o]);let r=be(()=>s(l=>l+1),[]);return{...a,reload:r}}async function Ja(t){try{return await navigator.clipboard.writeText(t),!0}catch{return!1}}async function en(t,e,a="text/csv"){try{return await Za(t,e,a)}catch{return null}}function tn(t){return Re?null:`${location.href.split("#")[0].split("?")[0]}#/unirse/${t}`}function ot(t,e,a){let n=U([]),o=be(async()=>{let r=n.current.splice(0);if(r.length&&e)try{await t.logEvents(e,r)}catch(l){console.warn("No se pudieron guardar eventos",l)}},[t,e]),s=be((r,l={})=>{let u={t:r,at:Date.now(),d:se()};a&&(u.v=a);for(let[i,p]of Object.entries(l))p!=null&&(u[i]=p);n.current.push(u),n.current.length>=12&&o()},[a,o]);return P(()=>{let r=()=>{document.visibilityState==="hidden"&&o()};return document.addEventListener("visibilitychange",r),()=>{document.removeEventListener("visibilitychange",r),o()}},[o]),{track:s,flush:o}}function an(t,e){let a=new Set(t||[]),n=e;if(!a.has(n)){let s=new Date(`${e}T12:00:00Z`);s.setUTCDate(s.getUTCDate()-1),n=s.toISOString().slice(0,10)}let o=0;for(;a.has(n);){o+=1;let s=new Date(`${n}T12:00:00Z`);s.setUTCDate(s.getUTCDate()-1),n=s.toISOString().slice(0,10)}return o}function nn({size:t=28}){return d`<svg class="logo" width=${t} height=${t} viewBox="0 0 32 32" aria-hidden="true">
    <rect x="1" y="1" width="30" height="30" rx="8" fill="var(--accent)" />
    <path d="M7 11V7h4M21 7h4v4M25 21v4h-4M11 25H7v-4" fill="none" stroke="var(--on-accent)" stroke-width="2.2" stroke-linecap="round" />
    <path d="M10.5 19.5c2.5-6 8.5-7 11-3" fill="none" stroke="var(--on-accent)" stroke-width="2.2" stroke-linecap="round" opacity="0.55" />
    <circle cx="21.5" cy="16.5" r="2.6" fill="var(--on-accent)" />
  </svg>`}function q({label:t="Cargando\u2026"}){return d`<div class="loading" role="status"><span class="spinner" aria-hidden="true"></span>${t}</div>`}function F({error:t,onRetry:e}){let a=(t==null?void 0:t.message)||String(t||"Algo sali\xF3 mal.");return d`<div class="notice notice-bad" role="alert">
    <p>${a}</p>
    ${e&&d`<button class="btn btn-ghost" onClick=${e}>Reintentar</button>`}
  </div>`}function te({title:t,children:e,action:a}){return d`<div class="empty">
    <p class="empty-title">${t}</p>
    ${e&&d`<div class="empty-body">${e}</div>`}
    ${a}
  </div>`}function K({tone:t="neutral",children:e,title:a}){return d`<span class=${L("chip",`chip-${t}`)} title=${a}>${e}</span>`}function st({status:t}){return t===Y.VALIDATED?d`<${K} tone="ok">Validada<//>`:t===Y.RECORDED?d`<${K} tone="warn">Grabada, sin validar<//>`:d`<${K}>Pendiente de grabación<//>`}function Me({kind:t}){return t==="phrase"?d`<${K} tone="accent">Frase<//>`:d`<${K} tone="ink">Seña<//>`}function le({label:t,question:e="\xBFSeguro?",confirmLabel:a="S\xED, confirmar",onConfirm:n,className:o="btn btn-ghost",disabled:s}){let[r,l]=x(!1),[u,i]=x(!1);return r?d`<span class="confirm" role="group" aria-label=${e}>
    <span class="confirm-q">${e}</span>
    <button type="button" class="btn btn-danger btn-sm" disabled=${u}
      onClick=${async()=>{i(!0);try{await n()}finally{i(!1),l(!1)}}}>${a}</button>
    <button type="button" class="btn btn-ghost btn-sm" onClick=${()=>l(!1)}>Cancelar</button>
  </span>`:d`<button type="button" class=${o} disabled=${s} onClick=${()=>l(!0)}>${t}</button>`}function Pe({title:t,onClose:e,children:a,wide:n=!1}){let o=U(null);return P(()=>{var l;let s=document.activeElement;(l=o.current)==null||l.focus();let r=u=>{u.key==="Escape"&&e()};return document.addEventListener("keydown",r),document.body.classList.add("no-scroll"),()=>{var u;document.removeEventListener("keydown",r),document.body.classList.remove("no-scroll"),(u=s==null?void 0:s.focus)==null||u.call(s)}},[]),d`<div class="sheet-backdrop" onClick=${s=>s.target===s.currentTarget&&e()}>
    <section class=${L("sheet",n&&"sheet-wide")} role="dialog" aria-modal="true" aria-label=${t} tabindex="-1" ref=${o}>
      <header class="sheet-head">
        <h2>${t}</h2>
        <button type="button" class="icon-btn" aria-label="Cerrar" onClick=${e}>✕</button>
      </header>
      <div class="sheet-body">${a}</div>
    </section>
  </div>`}function on({id:t,label:e,value:a,onCopied:n}){let o=U(null);return d`<div class="field">
    <label for=${t}>${e}</label>
    <div class="copy-row">
      <input id=${t} ref=${o} readonly value=${a} onFocus=${s=>s.target.select()} />
      <button type="button" class="btn btn-ghost"
        onClick=${async()=>{var s;try{await navigator.clipboard.writeText(a),n==null||n(!0)}catch{(s=o.current)==null||s.select(),n==null||n(!1)}}}>Copiar</button>
    </div>
  </div>`}function rt({value:t,max:e,label:a}){let n=e?Math.round(t/e*100):0;return d`<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax=${e} aria-valuenow=${t} aria-label=${a}>
    <span style=${`width:${n}%`}></span>
  </div>`}var io={NotAllowedError:"No hay permiso para usar la c\xE1mara. Habilitalo en la configuraci\xF3n del navegador para este sitio.",SecurityError:"La c\xE1mara no est\xE1 disponible en esta vista. Abr\xED la app desde su direcci\xF3n propia (https).",NotFoundError:"No encontramos una c\xE1mara en este dispositivo.",OverconstrainedError:"La c\xE1mara no admite la configuraci\xF3n pedida.",NotReadableError:"La c\xE1mara est\xE1 en uso por otra app. Cerrala y prob\xE1 de nuevo.",NotSupportedError:"Este navegador no permite usar la c\xE1mara ac\xE1. Prob\xE1 con Chrome actualizado.",AbortError:"Se cort\xF3 el acceso a la c\xE1mara. Prob\xE1 de nuevo."};function lo(){var t,e;return!!((e=(t=globalThis.navigator)==null?void 0:t.mediaDevices)!=null&&e.getUserMedia)}function jt(t){let e=io[t==null?void 0:t.name]||"No pudimos abrir la c\xE1mara.",a=new Error(e);return a.code=(t==null?void 0:t.name)||"Error",a}async function it({facingMode:t="user",width:e=1280,height:a=720,frameRate:n=50}={}){if(!lo())throw jt({name:"NotSupportedError"});try{return await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:t,width:{ideal:e},height:{ideal:a},frameRate:{ideal:n}}})}catch(o){if((o==null?void 0:o.name)==="OverconstrainedError")try{return await navigator.mediaDevices.getUserMedia({audio:!1,video:{facingMode:t}})}catch(s){throw jt(s)}throw jt(o)}}function ve(t){t==null||t.getTracks().forEach(e=>e.stop())}function lt(t){var a;let e=(a=t==null?void 0:t.getVideoTracks)==null?void 0:a.call(t)[0];return e?e.getSettings():{}}var co=[.25,.5,.75,1];function sn(t,e){let[a,n]=x(null),[o,s]=x(null),r=e==null?void 0:e.id;return P(()=>{let l=!0;if(n(null),s(null),!!e)return t.mediaSrc(e).then(u=>{l&&(u?n(u):s("No encontramos este video."))}).catch(()=>l&&s("No pudimos cargar el video.")),()=>{l=!1}},[r]),[a,o]}function pe({store:t,media:e=[],initialRate:a=1,compact:n=!1,label:o="Video de la se\xF1a",showCaption:s=!0}){let[r,l]=x(0),[u,i]=x(a),[p,m]=x(!1),[c,f]=x(!1),[g,y]=x(!1),$=U(null),h=e[Math.min(r,e.length-1)],[b,w]=sn(t,h);P(()=>{l(0)},[e.map(_=>_.id).join("|")]),P(()=>{let _=$.current;!_||!b||(y(!1),_.muted=!0,_.playbackRate=u,c||_.play().catch(()=>f(!0)))},[b]),P(()=>{$.current&&($.current.playbackRate=u)},[u]);let S=()=>{let _=$.current;_&&(_.paused?(_.play().catch(()=>{}),f(!1)):(_.pause(),f(!0)))},C=w||(g?"Este navegador no puede reproducir el video.":null);return d`<figure class=${L("stage",n&&"compact")}>
    <div class="stage-frame">
      ${C?d`<p class="stage-msg">${C}</p>`:d`<video ref=${$} src=${b||void 0} muted playsinline loop autoplay preload="auto" aria-label=${o}
            class=${L(p&&"mirrored")}
            onLoadedData=${_=>{_.currentTarget.playbackRate=u}}
            onError=${()=>b&&y(!0)}
            onClick=${S}></video>`}
      <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>
      <span class="readout" aria-hidden="true">${Rt(u)}${p?" \xB7 espejo":""}${c?" \xB7 pausa":""}</span>
    </div>
    <div class="stage-controls">
      <button type="button" class="ctl" onClick=${S} aria-label=${c?"Reproducir":"Pausar"}>${c?"\u25B6":"\u275A\u275A"}</button>
      <div class="speeds" role="group" aria-label="Velocidad">
        ${co.map(_=>d`<button type="button" class="ctl speed" aria-pressed=${u===_} onClick=${()=>i(_)}>${Rt(_)}</button>`)}
      </div>
      <button type="button" class="ctl" aria-pressed=${p} onClick=${()=>m(!p)} title="Ver la seña como en un espejo">Espejo</button>
      ${e.length>1&&d`<button type="button" class="ctl" onClick=${()=>l((r+1)%e.length)} title="Ver otra toma">
        Toma ${r+1}/${e.length}
      </button>`}
    </div>
    ${s&&h&&(h.signer||h.angle)&&d`<figcaption>${h.signer?`Se\xF1a de ${h.signer}`:""}${h.signer&&h.angle?" \xB7 ":""}${h.angle?`vista ${h.angle}`:""}</figcaption>`}
  </figure>`}function rn({store:t,media:e,label:a}){let[n,o]=sn(t,e==null?void 0:e[0]),s=U(null);return P(()=>{let r=s.current;r&&n&&(r.muted=!0,r.play().catch(()=>{}))},[n]),o?d`<div class="tile-msg">${o}</div>`:d`<video ref=${s} src=${n||void 0} muted playsinline loop autoplay preload="auto" aria-label=${a}></video>`}function ct({store:t,item:e,onGrade:a,onClose:n}){var p;let o=U(null),[s,r]=x("opening"),[l,u]=x(null);P(()=>{let m=null,c=!0;it({facingMode:"user",width:640,height:480,frameRate:30}).then(g=>{if(!c){ve(g);return}m=g;let y=o.current;y&&(y.srcObject=g,y.play().catch(()=>{})),r("on")}).catch(g=>{c&&(u(g.message),r("off"))});let f=g=>{g.key==="Escape"&&n()};return document.addEventListener("keydown",f),document.body.classList.add("no-scroll"),()=>{c=!1,ve(m),document.removeEventListener("keydown",f),document.body.classList.remove("no-scroll")}},[]);let i=((p=e.meanings)==null?void 0:p[0])||"";return d`<div class="overlay mirror-practice" role="dialog" aria-modal="true" aria-label=${`Practicar \xAB${i}\xBB frente al espejo`}>
    <header class="overlay-head">
      <div>
        <p class="eyebrow">Espejo</p>
        <h2>${i}</h2>
      </div>
      <button type="button" class="icon-btn" aria-label="Cerrar espejo" onClick=${n}>✕</button>
    </header>
    <div class="mirror-grid">
      <${pe} store=${t} media=${e.media} initialRate=${.5} compact label=${`Se\xF1a de \xAB${i}\xBB`} />
      <figure class="selfview">
        <video ref=${o} muted playsinline autoplay class=${L("mirrored",s!=="on"&&"hidden-video")} aria-label="Tu cámara, como un espejo"></video>
        ${s==="opening"&&d`<p class="stage-msg">Abriendo la cámara…</p>`}
        ${s==="off"&&d`<p class="stage-msg">${l} Igual podés practicar mirando el video.</p>`}
        <figcaption>Tu espejo · no se graba ni se envía</figcaption>
      </figure>
    </div>
    <footer class="overlay-foot">
      <p id="selfcheck-q">¿Cómo te salió?</p>
      <div class="selfcheck" role="group" aria-labelledby="selfcheck-q">
        <button type="button" class="btn btn-ghost" onClick=${()=>a("again")}>Me costó</button>
        <button type="button" class="btn btn-ghost" onClick=${()=>a("hard")}>Más o menos</button>
        <button type="button" class="btn btn-primary" onClick=${()=>a("good")}>Me salió</button>
      </div>
    </footer>
  </div>`}var ln=[0,1,2,4,7,14,30],ae=Object.freeze({AGAIN:"again",HARD:"hard",GOOD:"good"});function zt(t){return{box:0,due:t,reps:0,lapses:0,last:null}}function cn(t,e,a){let n=t?{...t}:zt(a);return n.reps+=1,n.last=a,e===ae.AGAIN?(n.box=1,n.lapses+=1):e===ae.HARD?n.box=Math.max(1,n.box):n.box=Math.min(n.box+1,ln.length-1),n.due=Z(a,Math.max(1,ln[n.box])),n}function dn(t){return!t||t.length===0?null:t.includes(ae.AGAIN)?ae.AGAIN:t.includes(ae.HARD)?ae.HARD:ae.GOOD}function uo(t,e){return!!t&&t.due<=e}function Le(t,e,a){return Object.entries(t||{}).filter(([n,o])=>(!a||a.has(n))&&o.reps>0&&uo(o,e)).sort(([,n],[,o])=>n.due===o.due?n.box-o.box:n.due<o.due?-1:1).map(([n])=>n)}function me(t){return new Set(Object.entries(t||{}).filter(([,e])=>e.reps>0).map(([e])=>e))}function ce(t){return((t==null?void 0:t.items)||[]).filter(e=>e.media&&e.media.length>0)}function dt(t,e){return ce(t).filter(a=>a.lesson===e).sort((a,n)=>(a.order??0)-(n.order??0))}function po(t){return[...new Set(ce(t).map(e=>e.lesson))].sort((e,a)=>e-a)}function ye(t,e){let a=((t==null?void 0:t.lessons)||[]).find(n=>n.n===e);return a&&a.title?a.title:`Lecci\xF3n ${e}`}function mo(t,e){let a=me(e);return po(t).map(n=>{let o=dt(t,n),s=o.filter(r=>a.has(r.id)).length;return{n,title:ye(t,n),total:o.length,learned:s,complete:s===o.length}})}function ut(t,e,a){let n=mo(t,e==null?void 0:e.srs),o=n.length,s=n.filter(l=>l.complete).length;if(o===0)return{state:"empty",next:null,total:o,completedCount:s,progress:n};let r=n.find(l=>!l.complete);return r?(e==null?void 0:e.lastLessonDate)===a?{state:"wait-tomorrow",next:r,total:o,completedCount:s,progress:n}:{state:"ready",next:r,total:o,completedCount:s,progress:n}:{state:"all-done",next:null,total:o,completedCount:s,progress:n}}function un(t,e,a){let n=me(a);return dt(t,e).filter(o=>!n.has(o.id))}function pn(t,e){return ce(t).filter(a=>a.lesson<=e)}function mn(t,e,a){H.set("courseId",t);let n=H.get("courses",[]).filter(o=>o.courseId!==t);H.set("courses",[{courseId:t,code:e,name:a},...n].slice(0,8))}function fn(){let{store:t,navigate:e,notify:a}=M(),n=t.mode==="demo",[o,s]=x(!1);return d`<section class="hero">
      <p class="eyebrow">Lengua de Señas Argentina</p>
      <h1 class="display">Practicá entre una clase y la otra.</h1>
      <p class="lead">
        Videos de tu docente, cámara lenta, espejo y un repaso corto cada día para no olvidar lo que viste en clase.
      </p>
      <div class="hero-actions">
        <button type="button" class="btn btn-primary btn-lg" onClick=${()=>e("unirse")}>Tengo un código de curso</button>
        ${n?d`<button type="button" class="btn btn-ghost btn-lg" disabled=${o} onClick=${async()=>{s(!0);try{let l=await t.findCourseByCode("PRUEBA");if(!l){a("No encontramos el curso de muestra. Pod\xE9s reiniciar el demo desde Estudio.","bad");return}await t.joinCourse(l.courseId,H.get("alias","Vos")),mn(l.courseId,"PRUEBA",l.name),e("hoy")}finally{s(!1)}}}>Probar el curso de muestra</button>`:d`<a class="btn btn-ghost btn-lg" href="?demo">Ver una demostración</a>`}
      </div>
      <p class="hero-foot">
        <a href="#/estudio" onClick=${l=>{l.preventDefault(),e("estudio")}}>Soy docente o coordino un curso →</a>
      </p>
    </section>
    <section class="howto">
      <h2 class="section-title">Cómo funciona</h2>
      <ol class="steps">
        <li><strong>Tu docente graba las señas</strong> de cada clase y las publica en la app.</li>
        <li><strong>Cada día hacés una lección corta:</strong> mirás la seña, la practicás frente al espejo y respondés.</li>
        <li><strong>El repaso te las vuelve a mostrar</strong> justo antes de que se te olviden.</li>
      </ol>
      <p class="muted small">La cámara se usa solo en tu teléfono, como un espejo. No se graba ni se envía nada.</p>
    </section>`}function gn({code:t=""}){let{store:e,navigate:a,notify:n}=M(),[o,s]=x(Ye(t)),[r,l]=x(H.get("alias","")),[u,i]=x(!1),[p,m]=x(!1),[c,f]=x(null);return d`<form class="card form" onSubmit=${async y=>{y.preventDefault(),f(null);let $=Ye(o);if(!Aa($)){f("El c\xF3digo tiene 6 letras y n\xFAmeros (sin O, I, L, 0 ni 1). Revisalo con tu docente.");return}if(r.trim().length<2){f("Escrib\xED c\xF3mo quer\xE9s que te llamemos (al menos 2 letras).");return}if(!u){f("Para sumarte, acept\xE1 que tu docente vea tu avance.");return}m(!0);try{let h=await e.findCourseByCode($);if(!h){f("No encontramos ese c\xF3digo. Revisalo o ped\xEDselo a tu docente.");return}await e.joinCourse(h.courseId,r.trim()),H.set("alias",r.trim()),mn(h.courseId,$,h.name),n(`Te sumaste a \xAB${h.name}\xBB`),a("hoy")}catch(h){f(h.message||"No pudimos sumarte al curso. Prob\xE1 de nuevo.")}finally{m(!1)}}} novalidate>
    <h1 class="title">Sumate a tu curso</h1>
    <div class="field">
      <label for="join-code">Código del curso</label>
      <input id="join-code" class="code-input" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="8"
        placeholder="ABC234" value=${o} onInput=${y=>s(Ye(y.target.value))} />
      <p class="hint">Te lo da tu docente: 6 letras y números.</p>
    </div>
    <div class="field">
      <label for="join-alias">¿Cómo te llamamos?</label>
      <input id="join-alias" maxlength="30" autocomplete="nickname" value=${r} onInput=${y=>l(y.target.value)} />
      <p class="hint">Tu docente lo ve en el panel del curso. Puede ser un apodo.</p>
    </div>
    <label class="check">
      <input id="join-agree" type="checkbox" checked=${u} onChange=${y=>i(y.target.checked)} />
      <span>Acepto que mi docente vea mi avance: días de práctica y respuestas. La cámara no graba nada.</span>
    </label>
    ${c&&d`<p class="form-error" role="alert">${c}</p>`}
    <button type="submit" class="btn btn-primary btn-lg btn-block" disabled=${p}>${p?"Entrando\u2026":"Entrar al curso"}</button>
  </form>`}function bn(){let{store:t}=M(),e=H.get("courseId"),a=G(async()=>{if(!e)return null;let[n,o,s]=await Promise.all([t.getCourse(e),t.getPack(e),t.getParticipant(e)]);return{course:n,pack:o,participant:s}},[e]);return{courseId:e,...a}}function hn({courseId:t}){let{navigate:e}=M(),a=H.get("courses",[]).find(n=>n.courseId===t);return d`<${te} title="Necesitás sumarte a este curso en este dispositivo"
    action=${d`<button type="button" class="btn btn-primary" onClick=${()=>e(a?`unirse/${a.code}`:"unirse")}>Sumarme</button>`}>
    Si ya te habías sumado desde otro teléfono, volvé a entrar con el mismo código.
  <//>`}function fo({today:t,practiced:e,classWeekday:a}){let n=Ta(t),o=Array.from({length:7},(r,l)=>Z(n,l)),s=a!=null&&a!=="";return d`<ol class="week" aria-label="Tu semana">
    ${o.map(r=>{let l=ue(r),u=s&&Number(a)===l,i=e.has(r),p=`${ie[l]} ${Number(r.slice(8))}${i?", practicaste":""}${u?", d\xEDa de clase":""}${r===t?", hoy":""}`;return d`<li class=${L("week-day",r===t&&"is-today",u&&"is-class",i&&"is-done",r>t&&"is-future")} aria-label=${p}>
        <span class="wd" aria-hidden="true">${Ia[l]}</span>
        <span class="dn" aria-hidden="true">${Number(r.slice(8))}</span>
        <span class="mark" aria-hidden="true"></span>
        ${u&&d`<span class="tag" aria-hidden="true">clase</span>`}
      </li>`})}
  </ol>`}function vn(){let{navigate:t}=M(),{courseId:e,data:a,loading:n,error:o,reload:s}=bn(),r=se();if(P(()=>{e||t("bienvenida")},[e]),!e||n)return d`<${q} />`;if(o)return d`<${F} error=${o} onRetry=${s} />`;if(!(a!=null&&a.course))return d`<${te} title="No encontramos tu curso"
      action=${d`<button type="button" class="btn btn-primary" onClick=${()=>t("unirse")}>Sumarme a un curso</button>`}>
      Puede que tu docente lo haya cerrado o que el código haya cambiado.
    <//>`;if(!a.participant)return d`<${hn} courseId=${e} />`;let{course:l,pack:u,participant:i}=a,p=ut(u,i,r),m=new Set(ce(u).map(S=>S.id)),c=Le(i.srs,r,m),f=[...me(i.srs)].filter(S=>m.has(S)).length,g=new Set(i.practiceDates||[]),y=an(i.practiceDates,r),$=p.next,h=$?dt(u,$.n):[],b=h.filter(S=>S.kind==="sign").length,w=h.filter(S=>S.kind==="phrase").length;return d`<div class="today">
    <header class="page-head">
      <p class="eyebrow">${l.name}</p>
      <h1 class="title">Hoy, ${Ra(r).replace(/ \d{4}$/,"")}</h1>
    </header>

    <${fo} today=${r} practiced=${g} classWeekday=${l.classWeekday} />

    <section class="card lesson-card" aria-labelledby="lesson-title">
      ${p.state==="empty"&&d`<p class="eyebrow">Lecciones</p>
        <h2 id="lesson-title" class="card-title">Todavía no hay lecciones publicadas</h2>
        <p class="muted">Cuando tu docente publique las primeras señas, aparecen acá.</p>`}
      ${p.state==="ready"&&d`<p class="eyebrow">Lección ${$.n} de ${p.total}</p>
        <h2 id="lesson-title" class="card-title">${ye(u,$.n)}</h2>
        <p class="muted">${[b&&`${b} ${b===1?"se\xF1a":"se\xF1as"}`,w&&`${w} ${w===1?"frase":"frases"}`].filter(Boolean).join(" y ")} · unos 8 minutos</p>
        <button type="button" class="btn btn-primary btn-lg btn-block" onClick=${()=>t("leccion")}>
          ${$.learned>0?"Seguir la lecci\xF3n":"Empezar la lecci\xF3n"}
        </button>`}
      ${p.state==="wait-tomorrow"&&d`<p class="eyebrow">Lección de hoy: hecha</p>
        <h2 id="lesson-title" class="card-title">Mañana sigue «${ye(u,$.n)}»</h2>
        <p class="muted">Una lección por día ayuda a que lo aprendido se asiente. Mientras tanto, podés repasar.</p>`}
      ${p.state==="all-done"&&d`<p class="eyebrow">${p.total} de ${p.total} lecciones</p>
        <h2 id="lesson-title" class="card-title">Hiciste todas las lecciones publicadas</h2>
        <p class="muted">Seguí con el repaso diario. Cuando tu docente publique más, aparecen acá.</p>`}
    </section>

    <section class="card review-card" aria-labelledby="review-title">
      <div>
        <p class="eyebrow">Repaso</p>
        <h2 id="review-title" class="card-title">${c.length?`${c.length} ${c.length===1?"se\xF1a":"se\xF1as"} para hoy`:"Nada pendiente hoy"}</h2>
      </div>
      <button type="button" class=${L("btn",c.length?"btn-primary":"btn-ghost")} disabled=${f===0}
        onClick=${()=>t("repaso")}>${c.length?"Repasar":"Repasar igual"}</button>
    </section>

    <dl class="stats">
      <div><dt>Días con práctica</dt><dd>${g.size}</dd></div>
      <div><dt>Señas aprendidas</dt><dd>${f}</dd></div>
      <div><dt>Racha</dt><dd>${y} ${y===1?"d\xEDa":"d\xEDas"}</dd></div>
    </dl>

    <${go} current=${e} />
  </div>`}function go({current:t}){let{navigate:e}=M(),n=H.get("courses",[]).filter(o=>o.courseId!==t);return d`<details class="switcher">
    <summary>Cambiar de curso</summary>
    <ul>
      ${n.map(o=>d`<li><button type="button" class="link-btn" onClick=${()=>{H.set("courseId",o.courseId),e("hoy"),location.reload()}}>${o.name} <span class="muted">(${o.code})</span></button></li>`)}
      <li><button type="button" class="link-btn" onClick=${()=>e("unirse")}>Sumarme a otro curso con un código</button></li>
    </ul>
  </details>`}function yn(){var h,b;let{store:t,navigate:e}=M(),{courseId:a,data:n,loading:o,error:s,reload:r}=bn(),[l,u]=x(""),[i,p]=x(null),[m,c]=x(!1),{track:f}=ot(t,a,(h=n==null?void 0:n.pack)==null?void 0:h.version),g=ee(()=>{if(!(n!=null&&n.pack)||!(n!=null&&n.participant))return[];let w=me(n.participant.srs);return ce(n.pack).filter(S=>w.has(S.id))},[n]);if(P(()=>{a||e("bienvenida")},[a]),!a||o)return d`<${q} />`;if(s)return d`<${F} error=${s} onRetry=${r} />`;if(!(n!=null&&n.participant))return d`<${hn} courseId=${a} />`;let y=l.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""),$=y?g.filter(w=>w.meanings.join(" ").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(y)):g;return d`<div class="mysigns">
    <header class="page-head">
      <p class="eyebrow">${((b=n.course)==null?void 0:b.name)||""}</p>
      <h1 class="title">Mis señas</h1>
    </header>
    ${g.length===0?d`<${te} title="Todavía no aprendiste señas"
          action=${d`<button type="button" class="btn btn-primary" onClick=${()=>e("hoy")}>Ir a la lección de hoy</button>`}>
          Las señas aparecen acá a medida que hacés las lecciones.
        <//>`:d`<div class="field">
            <label for="signs-search">Buscar por palabra</label>
            <input id="signs-search" type="search" value=${l} onInput=${w=>u(w.target.value)} placeholder="Ej.: gracias" />
          </div>
          <ul class="sign-list">
            ${$.map(w=>d`<li>
                <button type="button" class="sign-row" onClick=${()=>p(w)}>
                  <span class="sign-row-main">${J(w)}</span>
                  <span class="sign-row-meta"><${Me} kind=${w.kind} /> <span class="muted">Lección ${w.lesson}</span></span>
                </button>
              </li>`)}
          </ul>
          ${$.length===0&&d`<p class="muted">No hay señas que coincidan con «${l}».</p>`}`}
    ${i&&!m&&d`<${Pe} title=${J(i)} onClose=${()=>p(null)}>
      <${pe} store=${t} media=${i.media} label=${`Se\xF1a de \xAB${J(i)}\xBB`} />
      ${i.meanings.length>1&&d`<p><strong>También:</strong> ${i.meanings.slice(1).join(", ")}</p>`}
      ${i.notes&&d`<p class="note">${i.notes}</p>`}
      ${i.region&&d`<p class="muted small">Variante: ${i.region}</p>`}
      <button type="button" class="btn btn-ghost btn-block" onClick=${()=>{f("mirror",{i:i.id}),c(!0)}}>Practicar frente al espejo</button>
    <//>`}
    ${i&&m&&d`<${ct} store=${t} item=${i}
      onGrade=${w=>{f("self",{i:i.id,g:w}),c(!1)}}
      onClose=${()=>c(!1)} />`}
  </div>`}function bo(t){return[...new Map(t.map(e=>[e.id,e])).values()]}function ho(t,e,a,n,o=Math.random){let s=a.srs||{},r=ce(e),l=new Set(r.map(y=>y.id)),u=new Map(r.map(y=>[y.id,y])),i=me(s),p=r.filter(y=>i.has(y.id));if(t==="lesson"){let y=ut(e,a,n);if(y.state!=="ready")return{kind:"blocked",reason:y.state,status:y};let $=y.next.n,h=un(e,$,s),b=new Set(h.map(E=>E.id)),w=pn(e,$),S=Va(h,w,o),C=Le(s,n,l).filter(E=>!b.has(E)).map(E=>u.get(E)),_=At(C,bo([...w,...p]),o,8);return{kind:"lesson",lesson:$,title:ye(e,$),byId:u,steps:[...h.map(E=>({type:"learn",item:E})),...S.map(E=>({type:"question",q:E,phase:"recognize"})),..._.map(E=>({type:"question",q:E,phase:"review"}))]}}let m=Le(s,n,l),c=!1;m.length===0&&(m=De([...i].filter(y=>l.has(y)),o).slice(0,8),c=!0);let f=m.map(y=>u.get(y)).filter(Boolean),g=At(f,p.length>=2?p:r,o,15);return g.length===0?{kind:"blocked",reason:"review-empty"}:{kind:"review",extra:c,byId:u,steps:g.map(y=>({type:"question",q:y,phase:"review"}))}}function Bt({mode:t}){let{store:e}=M(),a=H.get("courseId"),{data:n,loading:o,error:s,reload:r}=G(async()=>{if(!a)return null;let[l,u,i]=await Promise.all([e.getCourse(a),e.getPack(a),e.getParticipant(a)]);return{course:l,pack:u,participant:i}},[a,t]);return o?d`<div class="session"><${q} label="Preparando la sesión…" /></div>`:s?d`<div class="session"><${F} error=${s} onRetry=${r} /></div>`:!(n!=null&&n.participant)||!(n!=null&&n.pack)?d`<div class="session"><${$n} reason=${n!=null&&n.pack?"join":"empty"} /></div>`:d`<${vo} key=${t} mode=${t} courseId=${a} ...${n} />`}function $n({reason:t,status:e}){var r;let{navigate:a}=M(),n={"wait-tomorrow":["Ya hiciste la lecci\xF3n de hoy",`La lecci\xF3n ${((r=e==null?void 0:e.next)==null?void 0:r.n)??""} se habilita ma\xF1ana. Mientras tanto, pod\xE9s repasar.`],"all-done":["Hiciste todas las lecciones publicadas","Segu\xED con el repaso diario hasta que tu docente publique m\xE1s."],empty:["Todav\xEDa no hay lecciones publicadas","Cuando tu docente publique las primeras se\xF1as, aparecen en Hoy."],"review-empty":["Todav\xEDa no hay se\xF1as para repasar","Hac\xE9 la primera lecci\xF3n y ma\xF1ana vas a tener tu primer repaso."],join:["Necesit\xE1s sumarte al curso","Entr\xE1 con el c\xF3digo que te dio tu docente."]},[o,s]=n[t]||n.empty;return d`<main class="session-body">
    <${te} title=${o}
      action=${d`<div class="row-actions">
        ${t==="wait-tomorrow"&&d`<button type="button" class="btn btn-primary" onClick=${()=>a("repaso")}>Repasar</button>`}
        <button type="button" class="btn btn-ghost" onClick=${()=>a(t==="join"?"unirse":"hoy")}>${t==="join"?"Sumarme":"Volver a Hoy"}</button>
      </div>`}>${s}<//>
  </main>`}function vo({mode:t,courseId:e,course:a,pack:n,participant:o}){let{store:s,navigate:r,notify:l}=M(),u=se(),i=ee(()=>ho(t,n,o,u),[]),{track:p,flush:m}=ot(s,e,n.version),[c,f]=x(i.steps||[]),[g,y]=x(0),[$,h]=x(null),[b,w]=x(null),[S,C]=x(!1),_=U(new Map),E=U({answered:0,correct:0,learned:0,started:Date.now()}),k=U(!1);if(i.kind==="blocked")return d`<div class="session"><${$n} reason=${i.reason} status=${i.status} /></div>`;let B=(W,ne)=>{_.current.has(W)||_.current.set(W,[]),_.current.get(W).push(ne)},D=async()=>{if(k.current)return;k.current=!0;let W={...o.srs||{}},ne=new Set(c.map(Q=>Q.type==="learn"?Q.item.id:Q.q.itemId));for(let Q of ne){let Ne=dn(_.current.get(Q))||ae.GOOD;i.extra&&Ne===ae.GOOD||(W[Q]=cn(W[Q]||zt(u),Ne,u))}let T=[...new Set([...o.practiceDates||[],u])].slice(-120),N={srs:W,practiceDates:T,lastActiveAt:Date.now()};i.kind==="lesson"&&(N.lastLessonDate=u);try{await s.updateParticipant(e,N)}catch(Q){l("No pudimos guardar tu avance. Revis\xE1 la conexi\xF3n.","bad"),console.error(Q)}p(i.kind==="lesson"?"lesson_done":"review_done",{l:i.lesson}),await m(),w({...E.current,minutes:Math.max(1,Math.round((Date.now()-E.current.started)/6e4))})},I=()=>{g+1>=c.length?D():y(g+1)};if(b)return d`<div class="session"><${xo} plan=${i} pack=${n} summary=${b} /></div>`;let R=c[g],xe=R.type==="learn"?"Aprender":R.phase==="recognize"?"Reconocer":"Repaso";return d`<div class="session">
    <header class="session-bar">
      ${S?d`<span class="confirm" role="group" aria-label="Salir de la sesión">
            <span class="confirm-q">¿Salir? Se pierde el avance de esta sesión.</span>
            <button type="button" class="btn btn-danger btn-sm" onClick=${()=>{m(),r("hoy")}}>Salir</button>
            <button type="button" class="btn btn-ghost btn-sm" onClick=${()=>C(!1)}>Seguir</button>
          </span>`:d`<button type="button" class="icon-btn" aria-label="Salir de la sesión"
            onClick=${()=>g===0?r("hoy"):C(!0)}>✕</button>
          <${rt} value=${g} max=${c.length} label="Avance de la sesión" />
          <span class="session-step">${xe}</span>`}
    </header>
    <main class="session-body">
      ${R.type==="learn"?d`<${yo} key=${`l-${g}`} step=${g} item=${R.item} plan=${i}
            onMirror=${()=>{p("mirror",{i:R.item.id}),h(R.item)}}
            onNext=${()=>{p("learn",{i:R.item.id,l:i.lesson}),E.current.learned+=1,I()}} />`:d`<${$o} key=${`q-${g}`} index=${g} step=${R} byId=${i.byId}
            onAnswer=${(W,ne)=>{let T=qa(R.q,W);p("answer",{i:R.q.itemId,ok:T,ms:ne,q:R.q.type,s:R.phase,l:i.lesson}),R.retry||(E.current.answered+=1,T&&(E.current.correct+=1)),B(R.q.itemId,T?ae.GOOD:ae.AGAIN),!T&&!R.retry&&f(N=>[...N,{...R,retry:!0}])}}
            onNext=${I} />`}
    </main>
    ${$&&d`<${ct} store=${s} item=${$}
      onGrade=${W=>{p("self",{i:$.id,g:W}),B($.id,W),h(null)}}
      onClose=${()=>h(null)} />`}
  </div>`}function yo({step:t,item:e,plan:a,onMirror:n,onNext:o}){let{store:s}=M(),r=J(e);return d`<article class="learn-card" data-step=${t}>
    <header class="learn-head">
      <p class="eyebrow">${a.kind==="lesson"?`Lecci\xF3n ${a.lesson} \xB7 ${a.title}`:"Repaso"}</p>
      <h1 class="display meaning">${r}</h1>
      <div class="chips"><${Me} kind=${e.kind} />${e.region&&d`<span class="muted small">Variante: ${e.region}</span>`}</div>
    </header>
    <${pe} store=${s} media=${e.media} label=${`Se\xF1a de \xAB${r}\xBB`} />
    ${e.meanings.length>1&&d`<p><strong>También:</strong> ${e.meanings.slice(1).join(", ")}</p>`}
    ${e.notes&&d`<p class="note">${e.notes}</p>`}
    <div class="learn-actions">
      <button type="button" class="btn btn-ghost btn-lg" onClick=${n}>Practicar frente al espejo</button>
      <button type="button" class="btn btn-primary btn-lg" onClick=${o}>Siguiente</button>
    </div>
  </article>`}function $o({index:t,step:e,byId:a,onAnswer:n,onNext:o}){let{store:s}=M(),{q:r}=e,l=a.get(r.itemId),[u,i]=x(null),p=U(Date.now()),m=u!==null,c=m&&u===r.answerId,f=J(l),g=$=>{m||(i($),n($,Date.now()-p.current))},y=$=>L(m&&$===r.answerId&&"is-correct",m&&$===u&&$!==r.answerId&&"is-wrong",m&&$!==u&&$!==r.answerId&&"is-dim");return d`<article class="question" data-step=${t} data-answer=${r.answerId} data-type=${r.type}>
    ${e.retry&&d`<p class="eyebrow">Otra vez</p>`}
    ${r.type==="video-to-text"?d`<h1 class="title">${l.kind==="phrase"?"\xBFQu\xE9 dice esta frase?":"\xBFQu\xE9 significa esta se\xF1a?"}</h1>
          <${pe} store=${s} media=${l.media} label="Video de la pregunta" showCaption=${!1} />
          <div class="options" role="group" aria-label="Opciones">
            ${r.options.map($=>d`<button type="button" class=${L("option",y($.id))} data-option-id=${$.id} disabled=${m&&$.id!==u&&$.id!==r.answerId}
                aria-pressed=${u===$.id} onClick=${()=>g($.id)}>${$.label}</button>`)}
          </div>`:d`<h1 class="title">¿Cuál es la seña de «${f}»?</h1>
          <div class="video-options" role="group" aria-label="Opciones en video">
            ${r.options.map(($,h)=>{var b;return d`<button type="button" class=${L("video-option",y($.id))} data-option-id=${$.id}
                aria-label=${`Opci\xF3n ${h+1}`} aria-pressed=${u===$.id} onClick=${()=>g($.id)}>
                <${rn} store=${s} media=${(b=a.get($.id))==null?void 0:b.media} label=${`Video de la opci\xF3n ${h+1}`} />
                <span class="video-option-n">${h+1}</span>
              </button>`})}
          </div>`}
    ${m&&d`<div class=${L("feedback",c?"feedback-ok":"feedback-bad")} role="status">
      <p>${c?"\xA1Bien!":d`Era <strong>«${f}»</strong>. La vas a volver a ver.`}</p>
      <button type="button" class="btn btn-primary btn-lg" autofocus onClick=${o}>Continuar</button>
    </div>`}
  </article>`}function xo({plan:t,pack:e,summary:a}){let{navigate:n}=M(),o=t.kind==="lesson"?t.lesson+1:null,s=o&&ce(e).some(r=>r.lesson===o);return d`<main class="session-body">
    <section class="summary">
      <p class="eyebrow">${t.kind==="lesson"?`Lecci\xF3n ${t.lesson} \xB7 ${t.title}`:"Repaso"}</p>
      <h1 class="display">${t.kind==="lesson"?"\xA1Lecci\xF3n completa!":"\xA1Repaso hecho!"}</h1>
      <dl class="stats">
        <div><dt>Aciertos</dt><dd>${a.correct} de ${a.answered}</dd></div>
        ${t.kind==="lesson"&&d`<div><dt>Señas nuevas</dt><dd>${a.learned}</dd></div>`}
        <div><dt>Minutos</dt><dd>${a.minutes}</dd></div>
      </dl>
      <p class="lead">
        ${t.kind==="lesson"?s?`Ma\xF1ana se habilita la lecci\xF3n ${o}: \xAB${ye(e,o)}\xBB.`:"Por ahora no hay m\xE1s lecciones publicadas. Ma\xF1ana te espera el repaso.":"Las que te costaron vuelven ma\xF1ana; las que salieron bien, en unos d\xEDas."}
      </p>
      <button type="button" class="btn btn-primary btn-lg btn-block" onClick=${()=>n("hoy")}>Volver a Hoy</button>
    </section>
  </main>`}function Vt(t,e,a=";"){let n=r=>{if(r==null)return"";let l=String(r);return/["\n\r]/.test(l)||l.includes(a)?`"${l.replaceAll('"','""')}"`:l},o=e.map(r=>n(r.label)).join(a),s=t.map(r=>e.map(l=>n(typeof l.value=="function"?l.value(r):r[l.key])).join(a));return"\uFEFF"+[o,...s].join(`\r
`)}function xn(t,e=1){return t==null||Number.isNaN(t)?"":Number(t).toFixed(e).replace(".",",")}var wn={confirma:["ok","\u2713"],"confirma-uso":["ok","\u2713"],refuta:["bad","\u2715"],"no-concluyente":["warn","?"],"en-curso":["accent","\u25D0"],"sin-datos":["neutral","\xB7"]};function _n({course:t,onCourseChange:e}){var w,S,C;let{store:a,notify:n}=M(),o=G(async()=>{let[_,E]=await Promise.all([a.listParticipants(t.id),a.listEvents(t.id)]);return{participants:_,events:E}},[t.id]),[s,r]=x(!1),l=se(),u={...Ee,...((w=t.pilot)==null?void 0:w.thresholds)||{}},i=!!((S=t.pilot)!=null&&S.paymentSignal),p=ee(()=>o.data?Fa({participants:o.data.participants,events:o.data.events,classWeekday:t.classWeekday,thresholds:u,paymentSignal:i,todayKey:l}):null,[o.data,t.pilot,t.classWeekday]);if(o.loading&&!o.data)return d`<${q} label="Calculando el panel…" />`;if(o.error)return d`<${F} error=${o.error} onRetry=${o.reload} />`;let{summary:m,verdict:c,stats:f}=p,g=o.data.participants.some(_=>_.simulated),[y,$]=wn[c.code]||wn["sin-datos"],h=p.thresholds,b=async _=>{let E,k;if(_==="participants")k=`entreclases-participantes-${t.code}-${l}.csv`,E=Vt(f,[{label:"Alumno",key:"alias"},{label:"Se sum\xF3",key:"joinedDate"},{label:`D\xEDas activos (primeros ${h.windowDays})`,key:"activeInWindow"},{label:"Lecciones completas",key:"lessonsDone"},{label:"Respuestas",key:"answers"},{label:"Aciertos %",value:D=>D.accuracy===null?"":xn(D.accuracy*100)},{label:"Complet\xF3",value:D=>D.completed?"s\xED":"no"},{label:"\xDAltimo uso",value:D=>D.lastAt?new Date(D.lastAt).toISOString():""}]);else{k=`entreclases-eventos-${t.code}-${l}.csv`;let D=new Map(o.data.participants.map(I=>[I.uid,I.alias]));E=Vt(o.data.events,[{label:"Alumno",value:I=>D.get(I.uid)||I.uid},{label:"Fecha",key:"d"},{label:"Hora",value:I=>I.at?new Date(I.at).toISOString():""},{label:"Evento",key:"t"},{label:"\xCDtem",key:"i"},{label:"Lecci\xF3n",key:"l"},{label:"Correcto",value:I=>I.ok===void 0?"":I.ok?"s\xED":"no"},{label:"Autoevaluaci\xF3n",key:"g"},{label:"Tiempo de respuesta (ms)",key:"ms"},{label:"Versi\xF3n de contenido",key:"v"}])}let B=await en(k,E);B==="saved"?n("Archivo listo"):n(B==="declined"?"Descarga cancelada":await Ja(E)?"Copiado: pegalo en una planilla":"No se pudo exportar en esta vista","warn")};return d`<section class="panel-tab">
    ${g&&d`<div class="notice notice-warn sim-banner"><p><strong>Datos simulados.</strong> Hay alumnos de ejemplo generados para entender el panel. No son personas reales.</p></div>`}

    <div class=${L("verdict card",`verdict-${y}`)} role="status">
      <span class="verdict-icon" aria-hidden="true">${$}</span>
      <div>
        <p class="eyebrow">Veredicto del piloto</p>
        <h2 class="verdict-title">${c.title}</h2>
        <p>${c.detail}</p>
        ${c.preClassFlag&&d`<p class="text-warn"><strong>Atención:</strong> ${X((C=m.preClass)==null?void 0:C.share)} de los días de práctica caen el ${ie[m.preClass.weekday]}, el día antes de la clase.</p>`}
      </div>
    </div>

    <dl class="kpis kpis-criteria" aria-label="Criterios del piloto">
      <${$e} label=${`Practicaron ${h.minActiveDays}+ de ${h.windowDays} d\xEDas`} value=${X(m.completionShare)}
        note=${`Meta: ${X(h.confirmShare)} o m\xE1s`} status=${m.completionShare===null?null:m.completionShare>=h.confirmShare?"ok":"warn"} />
      <${$e} label=${`Llegaron a la lecci\xF3n ${h.reachLesson}`} value=${X(m.reachShare)}
        note=${`Se refuta con menos de ${X(h.refuteShare)}`} status=${m.reachShare===null?null:m.reachShare<h.refuteShare?"bad":"ok"} />
      ${m.preClass&&d`<${$e} label="Práctica el día antes de clase" value=${X(m.preClass.share)}
        note=${`Alerta desde ${X(h.preClassShare)}`} status=${m.preClass.share>=h.preClassShare?"warn":"ok"} />`}
    </dl>
    <dl class="kpis" aria-label="Uso">
      <${$e} label="Alumnos" value=${m.n} note=${m.n?`${m.ended} con la ventana terminada`:"Todav\xEDa nadie se sum\xF3"} />
      <${$e} label="Días activos, promedio" value=${Pt(m.avgActiveDays)} note=${`de ${h.windowDays}`} />
      <${$e} label="Aciertos, promedio" value=${X(m.avgAccuracy)} />
      <${$e} label="Minutos por día, mediana" value=${Pt(m.medianMinutes,0)} />
    </dl>

    ${m.n>0&&d`<div class="charts">
      <${_o} stats=${f} thr=${h} />
      <${ko} retention=${m.retention} />
    </div>`}

    ${m.n>0&&d`<div class="card">
      <h2 class="card-title">Alumnos</h2>
      <div class="table-wrap">
        <table class="data">
          <thead><tr><th scope="col">Alumno</th><th scope="col">Se sumó</th><th scope="col" class="num">Días activos</th><th scope="col" class="num">Lecciones</th><th scope="col" class="num">Aciertos</th><th scope="col">Último uso</th><th scope="col">Estado</th></tr></thead>
          <tbody>
            ${f.slice().sort((_,E)=>E.activeInWindow-_.activeInWindow||_.alias.localeCompare(E.alias)).map(_=>d`<tr>
                  <th scope="row">${_.alias}</th>
                  <td>${Pa(_.joinedDate)}</td>
                  <td class="num">${_.activeInWindow}</td>
                  <td class="num">${_.lessonsDone}</td>
                  <td class="num">${X(_.accuracy)}</td>
                  <td>${nt(_.lastAt)}</td>
                  <td>${_.completed?d`<span class="state state-ok">✓ Completó</span>`:_.windowEnded?d`<span class="state state-bad">✕ No llegó</span>`:d`<span class="state">◐ En curso</span>`}</td>
                </tr>`)}
          </tbody>
        </table>
      </div>
    </div>`}

    <div class="card">
      <h2 class="card-title">Exportar</h2>
      <p class="muted">Planillas para Excel o Google Sheets (separador punto y coma).</p>
      <div class="row-actions">
        <button type="button" class="btn btn-ghost" onClick=${()=>b("participants")}>Participantes (CSV)</button>
        <button type="button" class="btn btn-ghost" onClick=${()=>b("events")}>Eventos (CSV)</button>
      </div>
    </div>

    <${So} course=${t} thr=${h} paymentSignal=${i} onSaved=${e} />

    ${a.mode==="demo"&&d`<div class="card">
      <h2 class="card-title">Probar el panel con una cohorte simulada</h2>
      <p class="muted">Genera 40 alumnos de ejemplo con distintos hábitos (constantes, irregulares, que abandonan y que practican solo antes de clase). Quedan marcados como simulados.</p>
      <div class="row-actions">
        <button type="button" class="btn btn-primary" disabled=${s} onClick=${async()=>{r(!0);try{await a.simulate(t.id),n("Cohorte simulada cargada"),o.reload()}finally{r(!1)}}}>Simular 40 alumnos</button>
        ${g&&d`<${le} label="Borrar la simulación" question="¿Borrar los alumnos simulados?" confirmLabel="Sí, borrar"
          onConfirm=${async()=>{await a.clearSimulation(t.id),n("Simulaci\xF3n borrada"),o.reload()}} />`}
      </div>
    </div>`}
  </section>`}function $e({label:t,value:e,note:a,status:n}){let o=n==="ok"?"\u2713":n==="bad"?"\u2715":n==="warn"?"!":null;return d`<div class=${L("kpi",n&&`kpi-${n}`)}>
    <dt>${t}</dt>
    <dd>
      <span class="kpi-value">${e}</span>
      ${o&&d`<span class="kpi-mark" aria-label=${n==="ok"?"cumple":n==="bad"?"no cumple":"atenci\xF3n"}>${o}</span>`}
    </dd>
    ${a&&d`<dd class="kpi-note">${a}</dd>`}
  </div>`}function kn({id:t,title:e,subtitle:a,data:n,yMax:o,yTicks:s,fmtTick:r,band:l,tableHead:u}){let[i,p]=x(null),m=n.length;return d`<figure class="card chart" aria-labelledby=${`${t}-t`}>
    <figcaption>
      <h3 id=${`${t}-t`} class="card-title">${e}</h3>
      ${a&&d`<p class="muted small">${a}</p>`}
    </figcaption>
    <div class="bars" onPointerLeave=${()=>p(null)}>
      <div class="bars-plot">
        ${s.map(c=>d`<div class="gridline" style=${`bottom:${c/o*100}%`}><span>${r(c)}</span></div>`)}
        ${l&&d`<div class="bars-band" style=${`left:${l.from/m*100}%;width:${(m-l.from)/m*100}%`}><span>${l.label}</span></div>`}
        <ol class="bars-cols" style=${`--n:${m}`}>
          ${n.map((c,f)=>d`<li class=${L("bar-col",i===f&&"is-hover")}>
              <button type="button" class="bar-hit" aria-label=${c.aria}
                onPointerEnter=${()=>p(f)} onFocus=${()=>p(f)} onBlur=${()=>p(null)} onClick=${()=>p(f)}>
                ${c.value>0&&d`<span class="bar" style=${`height:${Math.max(1.5,c.value/o*100)}%`}></span>`}
              </button>
            </li>`)}
        </ol>
        ${i!==null&&d`<div class="tooltip" role="presentation" style=${`left:${(i+.5)/m*100}%;bottom:${Math.min(92,n[i].value/o*100+6)}%`}>
          <strong>${n[i].valueLabel}</strong><span>${n[i].detail}</span>
        </div>`}
      </div>
      <ol class="bars-x" style=${`--n:${m}`} aria-hidden="true">${n.map(c=>d`<li>${c.x}</li>`)}</ol>
    </div>
    <details class="chart-table">
      <summary>Ver como tabla</summary>
      <div class="table-wrap">
        <table class="data">
          <thead><tr>${u.map(c=>d`<th scope="col">${c}</th>`)}</tr></thead>
          <tbody>${n.map(c=>d`<tr><th scope="row">${c.x}</th><td class="num">${c.valueLabel}</td><td>${c.detail}</td></tr>`)}</tbody>
        </table>
      </div>
    </details>
  </figure>`}function wo(t){if(t<=4)return 4;let e=t<=10?2:t<=25?5:10;return Math.ceil(t/e)*e}function _o({stats:t,thr:e}){let a=Array.from({length:e.windowDays+1},(s,r)=>t.filter(l=>l.activeInWindow===r).length),n=wo(Math.max(...a)),o=n/4;return d`<${kn} id="chart-days" title="Días con práctica por alumno"
    subtitle=${`Cu\xE1ntos alumnos practicaron 0, 1, 2\u2026 de sus primeros ${e.windowDays} d\xEDas`}
    data=${a.map((s,r)=>({x:String(r),value:s,valueLabel:`${s} ${s===1?"alumno":"alumnos"}`,detail:`${r} ${r===1?"d\xEDa":"d\xEDas"} con pr\xE1ctica`,aria:`${r} d\xEDas: ${s} alumnos`}))}
    yMax=${n} yTicks=${[o,o*2,o*3,n]} fmtTick=${s=>String(Math.round(s))}
    band=${{from:e.minActiveDays,label:`Meta: ${e.minActiveDays}+ d\xEDas`}}
    tableHead=${["D\xEDas","Alumnos","Detalle"]} />`}function ko({retention:t}){return d`<${kn} id="chart-retention" title="Práctica por día de la cohorte"
    subtitle="De quienes ya llegaron a ese día, qué parte practicó"
    data=${t.map(e=>({x:`D${e.day}`,value:e.share===null?0:e.share,valueLabel:e.share===null?"\u2014":X(e.share),detail:e.eligible?`${e.active} de ${e.eligible}`:"Todav\xEDa nadie lleg\xF3 a este d\xEDa",aria:`D\xEDa ${e.day}: ${e.share===null?"sin datos":`${X(e.share)}, ${e.active} de ${e.eligible}`}`}))}
    yMax=${1} yTicks=${[.25,.5,.75,1]} fmtTick=${e=>X(e)}
    tableHead=${["D\xEDa","Practic\xF3","Alumnos"]} />`}function So({course:t,thr:e,paymentSignal:a,onSaved:n}){var i;let{store:o,notify:s}=M(),[r,l]=x({windowDays:e.windowDays,minActiveDays:e.minActiveDays,confirmPct:Math.round(e.confirmShare*100),reachLesson:e.reachLesson,refutePct:Math.round(e.refuteShare*100),preClassPct:Math.round(e.preClassShare*100),paymentSignal:a,notes:((i=t.pilot)==null?void 0:i.notes)||""}),u=p=>m=>l({...r,[p]:Number(m.target.value)});return d`<details class="card criteria">
    <summary class="card-title">Criterios del piloto</summary>
    <p class="muted">Acordalos antes de arrancar para no reinterpretar los resultados después. Son orientativos.</p>
    <form class="form" onSubmit=${async p=>{p.preventDefault();try{await o.updateCourse(t.id,{pilot:{...t.pilot||{},thresholds:{windowDays:Math.max(1,r.windowDays),minActiveDays:Math.max(1,Math.min(r.minActiveDays,r.windowDays)),confirmShare:r.confirmPct/100,reachLesson:Math.max(1,r.reachLesson),refuteShare:r.refutePct/100,preClassShare:r.preClassPct/100},paymentSignal:r.paymentSignal,notes:r.notes.trim()}}),s("Criterios guardados"),n()}catch(m){s(m.message||"No se pudieron guardar.","bad")}}}>
      <div class="field-row">
        <div class="field"><label for="cr-window">Duración de la cohorte (días)</label><input id="cr-window" type="number" min="1" max="60" value=${r.windowDays} onInput=${u("windowDays")} /></div>
        <div class="field"><label for="cr-min">Días de práctica para «completó»</label><input id="cr-min" type="number" min="1" max="60" value=${r.minActiveDays} onInput=${u("minActiveDays")} /></div>
        <div class="field"><label for="cr-confirm">Confirma si completa (%)</label><input id="cr-confirm" type="number" min="1" max="100" value=${r.confirmPct} onInput=${u("confirmPct")} /></div>
      </div>
      <div class="field-row">
        <div class="field"><label for="cr-reach">Lección a alcanzar</label><input id="cr-reach" type="number" min="1" max="60" value=${r.reachLesson} onInput=${u("reachLesson")} /></div>
        <div class="field"><label for="cr-refute">Refuta si llega menos de (%)</label><input id="cr-refute" type="number" min="0" max="100" value=${r.refutePct} onInput=${u("refutePct")} /></div>
        <div class="field"><label for="cr-preclass">Alerta «solo antes de clase» desde (%)</label><input id="cr-preclass" type="number" min="1" max="100" value=${r.preClassPct} onInput=${u("preClassPct")} /></div>
      </div>
      <label class="check">
        <input id="cr-pay" type="checkbox" checked=${r.paymentSignal} onChange=${p=>l({...r,paymentSignal:p.target.checked})} />
        <span>Hay señal de pago: la institución aceptó un piloto pago o hubo pre-compras</span>
      </label>
      <div class="field"><label for="cr-notes">Notas (entrevistas, acuerdos)</label><textarea id="cr-notes" rows="3" maxlength="2000" value=${r.notes} onInput=${p=>l({...r,notes:p.target.value})}></textarea></div>
      <button type="submit" class="btn btn-primary">Guardar criterios</button>
    </form>
  </details>`}var Sn=[["contenido","Contenido"],["senantes","Se\xF1antes"],["equipo","Equipo"],["publicar","Publicar"],["panel","Panel del piloto"]];function Cn(){let{store:t,session:e,navigate:a,notify:n}=M(),o=t.mode==="demo",s=o||e&&!e.isAnonymous,r=G(()=>s?t.listMyCourses():Promise.resolve([]),[s,e==null?void 0:e.uid]),[l,u]=x(!1);return s?d`<div class="studio-home">
    <header class="page-head">
      <p class="eyebrow">Estudio docente</p>
      <h1 class="title">Tus cursos</h1>
      ${!o&&(e==null?void 0:e.email)&&d`<p class="muted small">Sesión: ${e.email} · <button type="button" class="link-btn" onClick=${()=>t.signOut()}>Salir</button></p>`}
    </header>
    ${r.loading&&d`<${q} />`}
    ${r.error&&d`<${F} error=${r.error} onRetry=${r.reload} />`}
    ${r.data&&(r.data.length?d`<ul class="course-list">
          ${r.data.map(i=>d`<li>
              <a class="course-card" href=${`#/estudio/${i.id}`} onClick=${p=>{p.preventDefault(),a(`estudio/${i.id}`)}}>
                <span class="course-name">${i.name}</span>
                <span class="course-meta">
                  <span class="code-chip" aria-label=${`C\xF3digo ${i.code}`}>${i.code}</span>
                  ${i.publishedVersion?d`<${K} tone="ok">Publicado v${i.publishedVersion}<//>`:d`<${K}>Sin publicar<//>`}
                  ${i.classWeekday!==null&&i.classWeekday!==void 0&&d`<span class="muted small">Clase: ${ie[i.classWeekday]}</span>`}
                </span>
              </a>
            </li>`)}
        </ul>`:d`<${te} title="Todavía no tenés cursos">Creá el primero con el formulario de abajo.<//>`)}
    <${Co} onCreated=${i=>a(`estudio/${i.id}`)} />
    ${o&&d`<section class="card danger-zone">
      <h2 class="card-title">Reiniciar el demo</h2>
      <p class="muted">Borra todo lo guardado en este dispositivo y vuelve a cargar los dos cursos de ejemplo.</p>
      <${le} label="Reiniciar demo" question="¿Borrar todo lo del demo?" confirmLabel="Sí, reiniciar"
        onConfirm=${async()=>{await t.resetDemo(),n("Demo reiniciado"),r.reload()}} />
    </section>`}
  </div>`:d`<section class="card narrow-card">
      <p class="eyebrow">Estudio docente</p>
      <h1 class="title">Entrá con tu cuenta de Google</h1>
      <p class="muted">Con tu cuenta podés crear cursos, grabar las señas y ver el avance del grupo. Los alumnos no necesitan cuenta: entran con el código del curso.</p>
      <button type="button" class="btn btn-primary btn-lg btn-block" disabled=${l}
        onClick=${async()=>{u(!0);try{await t.signInStaff()}catch(i){n(i.message||"No pudimos iniciar sesi\xF3n.","bad")}finally{u(!1)}}}>Entrar con Google</button>
    </section>`}function Dn({id:t,value:e,onChange:a}){return d`<select id=${t} value=${e==null?"":String(e)} onChange=${n=>a(n.target.value===""?null:Number(n.target.value))}>
    <option value="">Sin día fijo</option>
    ${[1,2,3,4,5,6,0].map(n=>d`<option value=${String(n)}>${ie[n]}</option>`)}
  </select>`}function Co({onCreated:t}){let{store:e,notify:a}=M(),[n,o]=x({name:"",region:"Litoral (Rosario)",classWeekday:null,lessonsCount:10,withDraftPlan:!0}),[s,r]=x(!1),[l,u]=x(null),i=p=>m=>o({...n,[p]:m});return d`<details class="card create-course">
    <summary class="card-title">Crear un curso nuevo</summary>
    <form class="form" onSubmit=${async p=>{if(p.preventDefault(),u(null),n.name.trim().length<3){u("Pon\xE9 un nombre de al menos 3 letras.");return}r(!0);try{let m=await e.createCourse({...n,name:n.name.trim()});a(`Curso creado. C\xF3digo: ${m.code}`),t(m)}catch(m){u(m.message||"No pudimos crear el curso.")}finally{r(!1)}}}>
      <div class="field">
        <label for="cc-name">Nombre del curso</label>
        <input id="cc-name" value=${n.name} maxlength="80" placeholder="LSA Nivel 1 · Círculo de Sordos · martes" onInput=${p=>i("name")(p.target.value)} />
      </div>
      <div class="field-row">
        <div class="field">
          <label for="cc-region">Variante regional</label>
          <input id="cc-region" value=${n.region} maxlength="60" onInput=${p=>i("region")(p.target.value)} />
        </div>
        <div class="field">
          <label for="cc-day">Día de clase</label>
          <${Dn} id="cc-day" value=${n.classWeekday} onChange=${i("classWeekday")} />
        </div>
        <div class="field">
          <label for="cc-lessons">Lecciones</label>
          <input id="cc-lessons" type="number" min="1" max="60" value=${n.lessonsCount} onInput=${p=>i("lessonsCount")(Number(p.target.value))} />
        </div>
      </div>
      <label class="check">
        <input id="cc-draft" type="checkbox" checked=${n.withDraftPlan} onChange=${p=>i("withDraftPlan")(p.target.checked)} />
        <span>Cargar el plan borrador (10 lecciones de 5 señas y 2 frases) para revisarlo con el/la docente sordo/a</span>
      </label>
      ${l&&d`<p class="form-error" role="alert">${l}</p>`}
      <button type="submit" class="btn btn-primary" disabled=${s}>${s?"Creando\u2026":"Crear curso"}</button>
    </form>
  </details>`}function En({courseId:t,tab:e}){let{store:a,navigate:n}=M(),o=G(()=>a.getCourse(t),[t]),[s,r]=x(!1);if(o.loading&&!o.data)return d`<${q} />`;if(o.error)return d`<${F} error=${o.error} onRetry=${o.reload} />`;if(!o.data)return d`<${te} title="No encontramos este curso o no tenés acceso"
      action=${d`<button type="button" class="btn btn-primary" onClick=${()=>n("estudio")}>Volver al estudio</button>`}>
      Pedile a quien lo creó que te sume desde la pestaña Equipo.
    <//>`;let l=o.data,u=Sn.some(([i])=>i===e)?e:"contenido";return d`<div class="studio-course">
    <header class="page-head course-head">
      <div>
        <p class="eyebrow"><a href="#/estudio" onClick=${i=>{i.preventDefault(),n("estudio")}}>Estudio</a> / Curso</p>
        <h1 class="title">${l.name}</h1>
        <p class="muted small">
          Código <span class="code-chip">${l.code}</span>
          ${l.region&&d` · ${l.region}`}
          ${l.classWeekday!==null&&l.classWeekday!==void 0&&d` · Clase: ${ie[l.classWeekday]}`}
          ${" \xB7 "}${l.publishedVersion?`Publicado v${l.publishedVersion}`:"Sin publicar"}
        </p>
      </div>
      <button type="button" class="btn btn-ghost" onClick=${()=>r(!0)}>Editar datos</button>
    </header>
    <nav class="tabs" aria-label="Secciones del curso">
      ${Sn.map(([i,p])=>d`<a href=${`#/estudio/${t}/${i}`} class="tab" aria-current=${u===i?"page":void 0}
          onClick=${m=>{m.preventDefault(),n(`estudio/${t}/${i}`)}}>${p}</a>`)}
    </nav>
    ${u==="contenido"&&d`<${Ao} course=${l} onCourseChange=${o.reload} />`}
    ${u==="senantes"&&d`<${To} course=${l} />`}
    ${u==="equipo"&&d`<${Ro} course=${l} />`}
    ${u==="publicar"&&d`<${Po} course=${l} onPublished=${o.reload} />`}
    ${u==="panel"&&d`<${_n} course=${l} onCourseChange=${o.reload} />`}
    ${s&&d`<${Do} course=${l} onClose=${()=>r(!1)} onSaved=${()=>{r(!1),o.reload()}} />`}
  </div>`}function Do({course:t,onClose:e,onSaved:a}){let{store:n,notify:o}=M(),[s,r]=x({name:t.name,region:t.region||"",classWeekday:t.classWeekday??null,lessonsCount:t.lessonsCount||10}),[l,u]=x(!1),i=p=>m=>r({...s,[p]:m});return d`<${Pe} title="Datos del curso" onClose=${e}>
    <form class="form" onSubmit=${async p=>{p.preventDefault(),u(!0);try{let m=Math.max(1,Math.min(60,Number(s.lessonsCount)||1)),c=Array.from({length:m},(f,g)=>{var y;return((y=t.lessonTitles)==null?void 0:y[g])||{n:g+1,title:""}});await n.updateCourse(t.id,{name:s.name.trim()||t.name,region:s.region.trim(),classWeekday:s.classWeekday,lessonsCount:m,lessonTitles:c}),o("Datos guardados"),a()}catch(m){o(m.message||"No se pudo guardar.","bad")}finally{u(!1)}}}>
      <div class="field"><label for="ec-name">Nombre</label><input id="ec-name" value=${s.name} maxlength="80" onInput=${p=>i("name")(p.target.value)} /></div>
      <div class="field"><label for="ec-region">Variante regional</label><input id="ec-region" value=${s.region} maxlength="60" onInput=${p=>i("region")(p.target.value)} /></div>
      <div class="field-row">
        <div class="field"><label for="ec-day">Día de clase</label><${Dn} id="ec-day" value=${s.classWeekday} onChange=${i("classWeekday")} /></div>
        <div class="field"><label for="ec-lessons">Lecciones</label><input id="ec-lessons" type="number" min="1" max="60" value=${s.lessonsCount} onInput=${p=>i("lessonsCount")(p.target.value)} /></div>
      </div>
      <p class="hint">El día de clase sirve para detectar si el grupo practica solo la noche anterior.</p>
      <button type="submit" class="btn btn-primary" disabled=${l}>Guardar</button>
    </form>
  <//>`}var Eo=[["todas","Todas"],[Y.PENDING,"Pendientes"],[Y.RECORDED,"Sin validar"],[Y.VALIDATED,"Validadas"]];function Ao({course:t,onCourseChange:e}){let{store:a,navigate:n,notify:o}=M(),s=G(async()=>{let[c,f]=await Promise.all([a.listItems(t.id),a.listMedia(t.id)]);return{items:c,media:f}},[t.id]),[r,l]=x("todas"),u=ee(()=>{if(!s.data)return[];let c=Ce(s.data.media);return s.data.items.map(f=>{var g;return{...f,takes:((g=c.get(f.id))==null?void 0:g.length)||0,status:Ze(f,c.get(f.id))}})},[s.data]);if(s.loading&&!s.data)return d`<${q} />`;if(s.error)return d`<${F} error=${s.error} onRetry=${s.reload} />`;let i=c=>u.filter(f=>f.status===c).length,p=Array.from({length:t.lessonsCount||1},(c,f)=>f+1),m=async(c,f)=>{let g=p.map(y=>{var $;return(($=t.lessonTitles)==null?void 0:$.find(h=>h.n===y))||{n:y,title:""}});if((g[c-1].title||"")!==f){g[c-1]={n:c,title:f};try{await a.updateCourse(t.id,{lessonTitles:g}),e()}catch(y){o(y.message||"No se pudo guardar el t\xEDtulo.","bad")}}};return d`<section class="content-tab">
    <div class="content-summary card">
      <div class="summary-counts">
        <p><strong>${u.length}</strong> ítems · <strong>${i(Y.VALIDATED)}</strong> validados · <strong>${i(Y.RECORDED)}</strong> sin validar · <strong>${i(Y.PENDING)}</strong> pendientes</p>
        <${rt} value=${i(Y.VALIDATED)} max=${u.length||1} label="Ítems validados" />
      </div>
      <div class="filters" role="group" aria-label="Filtrar por estado">
        ${Eo.map(([c,f])=>d`<button type="button" class="ctl" aria-pressed=${r===c} onClick=${()=>l(c)}>${f}</button>`)}
      </div>
    </div>
    ${p.map(c=>{var y,$;let f=u.filter(h=>h.lesson===c&&(r==="todas"||h.status===r)),g=(($=(y=t.lessonTitles)==null?void 0:y.find(h=>h.n===c))==null?void 0:$.title)||"";return d`<section class="lesson-block" aria-label=${`Lecci\xF3n ${c}`}>
        <header class="lesson-block-head">
          <span class="lesson-n">Lección ${c}</span>
          <input class="lesson-title-input" aria-label=${`T\xEDtulo de la lecci\xF3n ${c}`} value=${g} placeholder="Título (opcional)" maxlength="60"
            onBlur=${h=>m(c,h.target.value.trim())} onKeyDown=${h=>h.key==="Enter"&&h.target.blur()} />
        </header>
        ${f.length===0&&r==="todas"&&d`<p class="muted small">Sin ítems todavía.</p>`}
        <ul class="item-list">
          ${f.map(h=>d`<li>
              <a class="item-row" href=${`#/estudio/${t.id}/item/${h.id}`} onClick=${b=>{b.preventDefault(),n(`estudio/${t.id}/item/${h.id}`)}}>
                <span class="item-main"><${Me} kind=${h.kind} /> <span class="item-meaning">${J(h)||"Sin significado"}</span></span>
                <span class="item-meta"><${st} status=${h.status} />${h.takes>0&&d`<span class="muted small">${h.takes} ${h.takes===1?"toma":"tomas"}</span>`}</span>
              </a>
            </li>`)}
        </ul>
        <div class="row-actions">
          <button type="button" class="btn btn-ghost btn-sm" onClick=${()=>n(`estudio/${t.id}/item/nuevo-sign-${c}`)}>+ Seña</button>
          <button type="button" class="btn btn-ghost btn-sm" onClick=${()=>n(`estudio/${t.id}/item/nuevo-phrase-${c}`)}>+ Frase</button>
        </div>
      </section>`})}
  </section>`}var Mo={name:"",region:"",role:"docente",consent:{appUse:!0,territories:"Argentina",years:5,aiTraining:!1,derivatives:!1,revocation:"Puede pedir la baja de sus videos con 30 d\xEDas de aviso.",signedAt:"",documentRef:""}};function qt(t){return!!(t&&t.consent&&t.consent.appUse&&t.consent.signedAt)}function To({course:t}){let{store:e,notify:a}=M(),n=G(async()=>{let[r,l]=await Promise.all([e.listSigners(t.id),e.listMedia(t.id)]);return{signers:r.filter(u=>!u.sample),media:l}},[t.id]),[o,s]=x(null);return n.loading&&!n.data?d`<${q} />`:n.error?d`<${F} error=${n.error} onRetry=${n.reload} />`:d`<section class="signers-tab">
    <div class="notice">
      <p><strong>Antes de grabar:</strong> registrá a cada persona que aparece en los videos y su consentimiento firmado. Sin consentimiento cargado, la app no deja grabar con esa persona.</p>
    </div>
    ${n.data.signers.length===0?d`<${te} title="Todavía no hay señantes registrados">Empezá por el/la docente sordo/a del curso.<//>`:d`<ul class="signer-list">
          ${n.data.signers.map(r=>{var u;let l=n.data.media.filter(i=>i.signerId===r.id).length;return d`<li class="card signer-card">
              <div>
                <p class="signer-name">${r.name} <span class="muted small">· ${r.role}${r.region?` \xB7 ${r.region}`:""}</span></p>
                <p class="small">
                  ${qt(r)?d`<${K} tone="ok">Consentimiento ${r.consent.signedAt}<//>`:d`<${K} tone="bad">Falta consentimiento<//>`}
                  ${" "}${(u=r.consent)!=null&&u.aiTraining?d`<${K}>Autoriza IA<//>`:d`<${K}>No autoriza IA<//>`}
                  ${" "}<span class="muted">${l} ${l===1?"toma":"tomas"}</span>
                </p>
              </div>
              <div class="row-actions">
                <button type="button" class="btn btn-ghost btn-sm" onClick=${()=>s(structuredClone(r))}>Editar</button>
                <${le} label="Borrar" className="btn btn-ghost btn-sm" disabled=${l>0}
                  question="¿Borrar a esta persona?" confirmLabel="Sí, borrar"
                  onConfirm=${async()=>{await e.deleteSigner(t.id,r.id),a("Se\xF1ante borrado"),n.reload()}} />
              </div>
            </li>`})}
        </ul>`}
    <button type="button" class="btn btn-primary" onClick=${()=>s(structuredClone(Mo))}>Registrar señante</button>
    ${o&&d`<${Io} course=${t} initial=${o} onClose=${()=>s(null)}
      onSaved=${()=>{s(null),n.reload()}} />`}
  </section>`}function Io({course:t,initial:e,onClose:a,onSaved:n}){let{store:o,notify:s}=M(),[r,l]=x(e),[u,i]=x(null),p=(m,c)=>l({...r,consent:{...r.consent,[m]:c}});return d`<${Pe} title=${r.id?"Editar se\xF1ante":"Registrar se\xF1ante"} onClose=${a}>
    <form class="form" onSubmit=${async m=>{if(m.preventDefault(),i(null),r.name.trim().length<2){i("Falta el nombre.");return}if(!r.consent.appUse||!r.consent.signedAt){i("Para grabar hace falta el consentimiento de uso en la app con su fecha de firma.");return}try{await o.saveSigner(t.id,{...r,name:r.name.trim(),consent:{...r.consent,years:Number(r.consent.years)||null}}),s("Se\xF1ante guardado"),n()}catch(c){i(c.message||"No se pudo guardar.")}}}>
      <div class="field-row">
        <div class="field"><label for="sg-name">Nombre</label><input id="sg-name" value=${r.name} maxlength="60" onInput=${m=>l({...r,name:m.target.value})} /></div>
        <div class="field"><label for="sg-role">Rol</label>
          <select id="sg-role" value=${r.role} onChange=${m=>l({...r,role:m.target.value})}>
            <option value="docente">Docente</option><option value="señante">Señante</option>
          </select>
        </div>
      </div>
      <div class="field"><label for="sg-region">Región de su variante</label><input id="sg-region" value=${r.region} maxlength="60" placeholder="Rosario" onInput=${m=>l({...r,region:m.target.value})} /></div>
      <fieldset class="consent">
        <legend>Consentimiento de uso de imagen</legend>
        <p class="hint">Registrá lo que dice el documento firmado (en papel o PDF). La app no reemplaza ese documento.</p>
        <label class="check"><input id="sg-app" type="checkbox" checked=${r.consent.appUse} onChange=${m=>p("appUse",m.target.checked)} /><span>Autoriza el uso de sus videos en la app y materiales del curso</span></label>
        <div class="field-row">
          <div class="field"><label for="sg-terr">Territorios</label><input id="sg-terr" value=${r.consent.territories} onInput=${m=>p("territories",m.target.value)} /></div>
          <div class="field"><label for="sg-years">Plazo (años)</label><input id="sg-years" type="number" min="1" max="99" value=${r.consent.years} onInput=${m=>p("years",m.target.value)} /></div>
        </div>
        <label class="check"><input id="sg-ai" type="checkbox" checked=${r.consent.aiTraining} onChange=${m=>p("aiTraining",m.target.checked)} /><span>Autoriza usar sus videos para entrenar modelos de IA</span></label>
        <label class="check"><input id="sg-der" type="checkbox" checked=${r.consent.derivatives} onChange=${m=>p("derivatives",m.target.checked)} /><span>Autoriza obras derivadas (recortes, compilados)</span></label>
        <div class="field"><label for="sg-rev">Condiciones de baja</label><input id="sg-rev" value=${r.consent.revocation} onInput=${m=>p("revocation",m.target.value)} /></div>
        <div class="field-row">
          <div class="field"><label for="sg-date">Fecha de firma</label><input id="sg-date" type="date" value=${r.consent.signedAt} onInput=${m=>p("signedAt",m.target.value)} /></div>
          <div class="field"><label for="sg-doc">Dónde está el documento</label><input id="sg-doc" value=${r.consent.documentRef} placeholder="Carpeta Drive / acta en papel" onInput=${m=>p("documentRef",m.target.value)} /></div>
        </div>
      </fieldset>
      ${u&&d`<p class="form-error" role="alert">${u}</p>`}
      <button type="submit" class="btn btn-primary">Guardar</button>
    </form>
  <//>`}function Ro({course:t}){let{store:e,notify:a}=M(),n=e.mode==="demo",o=G(()=>e.listStaff(t.id),[t.id]),[s,r]=x(""),[l,u]=x(!1);return n?d`<div class="notice">
      <p>En el modo demo todo queda en este dispositivo. Con el modo piloto (Firebase) podés sumar al equipo a cualquier persona con cuenta de Google: el/la docente sordo/a, intérpretes o quien coordine.</p>
    </div>`:d`<section class="team-tab">
    ${o.loading&&d`<${q} />`}
    ${o.error&&d`<${F} error=${o.error} onRetry=${o.reload} />`}
    ${o.data&&d`<ul class="staff-list">
      ${o.data.map(i=>d`<li class="card staff-row">
          <span>${i.email} ${i.role==="owner"&&d`<${K} tone="accent">Creó el curso<//>`}</span>
          ${i.role!=="owner"&&d`<${le} label="Quitar" className="btn btn-ghost btn-sm" question="¿Quitar del equipo?" confirmLabel="Sí, quitar"
            onConfirm=${async()=>{await e.removeStaff(t.id,i.email),a("Quitado del equipo"),o.reload()}} />`}
        </li>`)}
    </ul>`}
    <form class="form card" onSubmit=${async i=>{i.preventDefault();let p=s.trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p)){a("Escrib\xED un correo v\xE1lido.","bad");return}u(!0);try{await e.addStaff(t.id,p),r(""),a("Sumado al equipo"),o.reload()}catch(m){a(m.message||"No se pudo sumar.","bad")}finally{u(!1)}}}>
      <div class="field">
        <label for="staff-email">Sumar al equipo (cuenta de Google)</label>
        <input id="staff-email" type="email" value=${s} placeholder="docente@gmail.com" onInput=${i=>r(i.target.value)} />
        <p class="hint">Podrá grabar, validar, publicar y ver el panel.</p>
      </div>
      <button type="submit" class="btn btn-primary" disabled=${l}>Sumar</button>
    </form>
  </section>`}function Po({course:t,onPublished:e}){let{store:a,notify:n}=M(),o=G(async()=>{let[c,f,g]=await Promise.all([a.listItems(t.id),a.listMedia(t.id),a.listPacks(t.id)]);return{items:c,media:f,packs:g}},[t.id,t.publishedVersion]),[s,r]=x(!0),[l,u]=x(!1);if(o.loading&&!o.data)return d`<${q} />`;if(o.error)return d`<${F} error=${o.error} onRetry=${o.reload} />`;let i=Dt(o.data.items,o.data.media,{onlyValidated:s}),p=new Map;for(let c of i)p.set(c.lesson,(p.get(c.lesson)||0)+1);let m=tn(t.code);return d`<section class="publish-tab">
    <div class="card invite">
      <p class="eyebrow">Para los alumnos</p>
      <p class="big-code" aria-label=${`C\xF3digo del curso: ${t.code.split("").join(" ")}`}>${t.code}</p>
      <p class="muted">Los alumnos entran a la app, tocan «Tengo un código de curso» y lo escriben.</p>
      ${m&&d`<${on} id="invite-link" label="Enlace directo para compartir (WhatsApp, mail)" value=${m}
        onCopied=${c=>n(c?"Enlace copiado":"Seleccion\xE1 el enlace y copialo",c?"ok":"warn")} />`}
    </div>
    <div class="card">
      <h2 class="card-title">Publicar una versión nueva</h2>
      <label class="check">
        <input id="pub-only-validated" type="checkbox" checked=${s} onChange=${c=>r(c.target.checked)} />
        <span>Publicar solo lo validado por el/la docente sordo/a (recomendado)</span>
      </label>
      ${i.length?d`<p>${`Se publican ${i.length} ${i.length===1?"\xEDtem":"\xEDtems"}: `}${[...p.entries()].sort((c,f)=>c[0]-f[0]).map(([c,f])=>`lecci\xF3n ${c} (${f})`).join(", ")}.</p>`:d`<p class="muted">Todavía no hay ítems ${s?"grabados y validados":"grabados"}.</p>`}
      <p class="hint">Los alumnos ven la versión nueva la próxima vez que abren la app. Lo que ya aprendieron se conserva.</p>
      <button type="button" class="btn btn-primary" disabled=${l||i.length===0}
        onClick=${async()=>{u(!0);try{let c=await a.publish(t.id,{onlyValidated:s});n(`Publicada la versi\xF3n ${c.version} con ${c.count} \xEDtems`),e(),o.reload()}catch(c){n(c.message||"No se pudo publicar.","bad")}finally{u(!1)}}}>${l?"Publicando\u2026":`Publicar versi\xF3n ${(t.publishedVersion||0)+1}`}</button>
    </div>
    ${o.data.packs.length>0&&d`<div class="card">
      <h2 class="card-title">Versiones publicadas</h2>
      <ul class="versions">
        ${o.data.packs.map(c=>d`<li><strong>v${c.version}</strong> · ${c.count} ítems · ${nt(c.publishedAt)}</li>`)}
      </ul>
    </div>`}
    ${Re&&d`<p class="muted small">En la vista previa no hay enlace para compartir: los datos quedan en este navegador.</p>`}
  </section>`}var Lo=["video/mp4;codecs=avc1.42E01E","video/mp4;codecs=avc1","video/mp4","video/webm;codecs=vp9","video/webm;codecs=vp8","video/webm"];function Ut(){return typeof globalThis.MediaRecorder<"u"}function No(){return Ut()?Lo.find(t=>MediaRecorder.isTypeSupported(t))||"":null}function An(t,{maxMs:e=8e3,bitsPerSecond:a=15e5}={}){let n=No(),o=new MediaRecorder(t,{...n?{mimeType:n}:{},videoBitsPerSecond:a}),s=[],r=performance.now(),l=null,u=new Promise((i,p)=>{o.ondataavailable=m=>{m.data&&m.data.size&&s.push(m.data)},o.onerror=m=>p(m.error||new Error("Fall\xF3 la grabaci\xF3n.")),o.onstop=()=>{clearTimeout(l);let m=(o.mimeType||n||"video/webm").split(";")[0],c=new Blob(s,{type:m}),f=lt(t);i({blob:c,mimeType:m,durationMs:Math.round(performance.now()-r),width:f.width||null,height:f.height||null,fps:f.frameRate?Math.round(f.frameRate):null})}});return o.start(250),l=setTimeout(()=>{o.state!=="inactive"&&o.stop()},e),{stop(){o.state!=="inactive"&&o.stop()},done:u,startedAt:r}}function Mn(t,e=6e3){return new Promise(a=>{let n=URL.createObjectURL(t),o=document.createElement("video");o.preload="metadata",o.muted=!0;let s=!1,r=u=>{s||(s=!0,clearTimeout(l),o.removeAttribute("src"),o.load(),URL.revokeObjectURL(n),a(u))},l=setTimeout(()=>r({playable:!1,durationMs:null,width:null,height:null}),e);o.onloadedmetadata=()=>{let u={playable:!0,width:o.videoWidth||null,height:o.videoHeight||null};if(o.duration===1/0||Number.isNaN(o.duration)){o.ontimeupdate=()=>{o.ontimeupdate=null,r({...u,durationMs:Number.isFinite(o.duration)?Math.round(o.duration*1e3):null})},o.currentTime=1e7;return}r({...u,durationMs:Math.round(o.duration*1e3)})},o.onerror=()=>r({playable:!1,durationMs:null,width:null,height:null}),o.src=n})}var jo=20*1024*1024,zo=[["configuracion","Configuraci\xF3n (forma de la mano)"],["ubicacion","Ubicaci\xF3n"],["movimiento","Movimiento"],["orientacion","Orientaci\xF3n de la palma"],["rnm","Rasgos no manuales (cara, cuerpo)"]];function Bo(t,e){return[t,...String(e||"").split("/")].map(a=>a.trim()).filter(Boolean)}function Tn({courseId:t,itemId:e}){var Ot,Ft,Wt;let{store:a,navigate:n,notify:o}=M(),s=String(e||"").startsWith("nuevo"),[,r,l]=s?e.split("-"):[],u=G(async()=>{let[v,A,O,je]=await Promise.all([a.getCourse(t),a.listItems(t),a.listMedia(t),a.listSigners(t)]);if(!v)return null;let Ht=A.find(we=>we.id===e);if(s){let we=Number(l)||1,Ln=Math.max(0,...A.filter(pt=>pt.lesson===we).map(pt=>pt.order||0))+1;Ht={kind:r==="phrase"?"phrase":"sign",meanings:[],lesson:we,order:Ln,notes:"",region:v.region||"",params:{}}}return{course:v,items:A,item:Ht,media:O,signers:je.filter(we=>!we.sample)}},[t,e]),[i,p]=x(null),[m,c]=x(!1),[f,g]=x(!1),[y,$]=x(""),[h,b]=x("frente"),[w,S]=x(null),C=U(null);P(()=>{var A,O;let v=(A=u.data)==null?void 0:A.item;v&&p({kind:v.kind,main:((O=v.meanings)==null?void 0:O[0])||"",others:(v.meanings||[]).slice(1).join(" / "),lesson:v.lesson,order:v.order,notes:v.notes||"",region:v.region||u.data.course.region||"",params:{...v.params||{}}})},[u.data]);let _=ee(()=>{var v;return(((v=u.data)==null?void 0:v.signers)||[]).filter(qt)},[u.data]);if(P(()=>{!y&&_.length&&$(_[0].id)},[_.length]),u.loading&&!u.data)return d`<${q} />`;if(u.error)return d`<${F} error=${u.error} onRetry=${u.reload} />`;if(!u.data||!u.data.item)return d`<${te} title="No encontramos este ítem"
      action=${d`<button type="button" class="btn btn-primary" onClick=${()=>n(`estudio/${t}`)}>Volver al contenido</button>`} />`;if(!i)return d`<${q} />`;let{course:E,item:k,items:B}=u.data,D=s?[]:u.data.media.filter(v=>v.itemId===k.id),I=Ze(k,D),R=v=>A=>p({...i,[v]:A}),xe=new Map(u.data.signers.map(v=>[v.id,v])),W=Ce(u.data.media),ne=B.slice().sort((v,A)=>v.lesson-A.lesson||v.order-A.order),T=ne.findIndex(v=>v.id===k.id),N=T>=0?ne.slice(T+1).find(v=>!(W.get(v.id)||[]).length):null,Q=async v=>{v==null||v.preventDefault();let A=Bo(i.main,i.others);if(!A.length)return o("Escrib\xED al menos un significado en espa\xF1ol.","bad"),null;c(!0);try{let O=await a.saveItem(t,{...s?{}:{id:k.id},kind:i.kind,meanings:A,lesson:Number(i.lesson)||1,order:Number(i.order)||0,notes:i.notes.trim(),region:i.region.trim(),params:i.params});return o("Guardado"),s?n(`estudio/${t}/item/${O.id}`):u.reload(),O}catch(O){return o(O.message||"No se pudo guardar.","bad"),null}finally{c(!1)}},Ne=async v=>{if(v){if(v.size>jo){o("El video pesa m\xE1s de 20 MB. Recortalo o grabalo con la c\xE1mara de la app.","bad");return}S({progress:0,name:v.name});try{let A=await Mn(v);if(!A.playable){o("Este navegador no puede reproducir ese archivo. Si viene de un iPhone, grabalo en \xABM\xE1s compatible\xBB (H.264) o us\xE1 \xABGrabar con la c\xE1mara\xBB.","bad");return}if(A.durationMs&&A.durationMs>3e4){o("El video dura m\xE1s de 30 s. Las se\xF1as sueltas duran 2 a 5 s y las frases menos de 15 s.","bad");return}await a.addMedia(t,{itemId:k.id,blob:v,signerId:y,angle:h,width:A.width,height:A.height,durationMs:A.durationMs,mimeType:v.type},O=>S({progress:O,name:v.name})),o("Toma subida"),u.reload()}catch(A){o(A.message||"No se pudo subir el video.","bad")}finally{S(null),C.current&&(C.current.value="")}}},Pn=async(v,A)=>{try{await a.saveItem(t,{id:k.id,validatedBy:v?A||"Docente":null,validatedAt:v?Date.now():null}),o(v?"Marcada como validada":"Validaci\xF3n quitada"),u.reload()}catch(O){o(O.message||"No se pudo guardar.","bad")}};return d`<div class="item-editor">
    <header class="page-head">
      <p class="eyebrow"><a href=${`#/estudio/${t}`} onClick=${v=>{v.preventDefault(),n(`estudio/${t}`)}}>← ${E.name}</a></p>
      <h1 class="title">${s?i.kind==="phrase"?"Nueva frase":"Nueva se\xF1a":i.main||"Sin significado"}</h1>
      ${!s&&d`<p><${st} status=${I} /></p>`}
    </header>

    <div class="editor-grid">
      <form class="card form" onSubmit=${Q}>
        <fieldset class="segmented">
          <legend>Tipo</legend>
          <label><input type="radio" name="kind" value="sign" checked=${i.kind==="sign"} onChange=${()=>R("kind")("sign")} /> <span>Seña</span></label>
          <label><input type="radio" name="kind" value="phrase" checked=${i.kind==="phrase"} onChange=${()=>R("kind")("phrase")} /> <span>Frase</span></label>
        </fieldset>
        <div class="field">
          <label for="it-main">Significado en español</label>
          <input id="it-main" value=${i.main} maxlength="80" placeholder=${i.kind==="phrase"?"\xBFC\xF3mo te llam\xE1s?":"gracias"} onInput=${v=>R("main")(v.target.value)} />
        </div>
        <div class="field">
          <label for="it-others">Otros significados (opcional)</label>
          <input id="it-others" value=${i.others} maxlength="120" placeholder="Separalos con / " onInput=${v=>R("others")(v.target.value)} />
        </div>
        <div class="field-row">
          <div class="field">
            <label for="it-lesson">Lección</label>
            <select id="it-lesson" value=${String(i.lesson)} onChange=${v=>R("lesson")(Number(v.target.value))}>
              ${Array.from({length:E.lessonsCount||1},(v,A)=>{var O,je;return d`<option value=${String(A+1)}>${A+1}${(je=(O=E.lessonTitles)==null?void 0:O[A])!=null&&je.title?` \xB7 ${E.lessonTitles[A].title}`:""}</option>`})}
            </select>
          </div>
          <div class="field">
            <label for="it-order">Orden</label>
            <input id="it-order" type="number" min="0" value=${i.order} onInput=${v=>R("order")(v.target.value)} />
          </div>
        </div>
        <div class="field">
          <label for="it-notes">Nota para los alumnos (opcional)</label>
          <textarea id="it-notes" rows="2" maxlength="300" placeholder="Ej.: fijate en la expresión de la cara" value=${i.notes} onInput=${v=>R("notes")(v.target.value)}></textarea>
        </div>
        <div class="field">
          <label for="it-region">Variante regional</label>
          <input id="it-region" value=${i.region} maxlength="60" onInput=${v=>R("region")(v.target.value)} />
        </div>
        <details class="params">
          <summary>Datos lingüísticos (opcional)</summary>
          <p class="hint">Sirven para buscar señas por forma y, más adelante, para entrenar herramientas con consentimiento.</p>
          ${zo.map(([v,A])=>d`<div class="field">
              <label for=${`it-p-${v}`}>${A}</label>
              <input id=${`it-p-${v}`} value=${i.params[v]||""} maxlength="80" onInput=${O=>R("params")({...i.params,[v]:O.target.value})} />
            </div>`)}
        </details>
        <div class="row-actions">
          <button type="submit" class="btn btn-primary" disabled=${m}>${m?"Guardando\u2026":"Guardar"}</button>
          ${!s&&d`<${le} label="Borrar ítem" question="¿Borrar el ítem y sus tomas?" confirmLabel="Sí, borrar"
            onConfirm=${async()=>{await a.deleteItem(t,k.id),o("\xCDtem borrado"),n(`estudio/${t}`)}} />`}
        </div>
      </form>

      <section class="card takes-panel" aria-labelledby="takes-title">
        <h2 id="takes-title" class="card-title">Tomas en video</h2>
        ${s?d`<p class="muted">Guardá el ítem para poder grabar o subir el video.</p>`:d`
            ${D.length===0&&d`<p class="muted">Todavía no hay video. Grabá la seña con la cámara o subí un archivo.</p>`}
            <ul class="takes">
              ${D.map(v=>{var A;return d`<li class=${L("take",k.primaryMediaId===v.id&&"is-primary")}>
                  <${pe} store=${a} media=${[v]} compact showCaption=${!1} label=${`Toma de \xAB${i.main}\xBB`} />
                  <div class="take-meta">
                    <p>${((A=xe.get(v.signerId))==null?void 0:A.name)||"Sin se\xF1ante"} · vista ${v.angle||"frente"}</p>
                    <p class="muted small">${[v.width&&v.height&&`${v.width}\xD7${v.height}`,v.fps&&`${v.fps} fps`,Nt(v.durationMs),Lt(v.sizeBytes)].filter(Boolean).join(" \xB7 ")}</p>
                    <div class="row-actions">
                      ${k.primaryMediaId===v.id?d`<${K} tone="accent">Principal<//>`:d`<button type="button" class="btn btn-ghost btn-sm" onClick=${async()=>{await a.saveItem(t,{id:k.id,primaryMediaId:v.id}),u.reload()}}>Usar como principal</button>`}
                      <${le} label="Borrar" className="btn btn-ghost btn-sm" question="¿Borrar esta toma?" confirmLabel="Sí, borrar"
                        onConfirm=${async()=>{await a.deleteMedia(t,v),o("Toma borrada"),u.reload()}} />
                    </div>
                  </div>
                </li>`})}
            </ul>
            ${_.length===0?d`<div class="notice notice-warn">
                  <p>Para grabar, primero registrá a la persona que aparece en el video y su consentimiento.</p>
                  <button type="button" class="btn btn-primary btn-sm" onClick=${()=>n(`estudio/${t}/senantes`)}>Ir a Señantes</button>
                </div>`:d`<div class="take-setup">
                  <div class="field-row">
                    <div class="field">
                      <label for="take-signer">Quién seña</label>
                      <select id="take-signer" value=${y} onChange=${v=>$(v.target.value)}>
                        ${_.map(v=>d`<option value=${v.id}>${v.name}</option>`)}
                      </select>
                    </div>
                    <div class="field">
                      <label for="take-angle">Vista</label>
                      <select id="take-angle" value=${h} onChange=${v=>b(v.target.value)}>
                        <option value="frente">De frente</option>
                        <option value="45°">A 45°</option>
                        <option value="perfil">De perfil</option>
                      </select>
                    </div>
                  </div>
                  <div class="row-actions">
                    ${Ut()&&d`<button type="button" class="btn btn-primary" onClick=${()=>g(!0)}>Grabar con la cámara</button>`}
                    <button type="button" class="btn btn-ghost" disabled=${!!w} onClick=${()=>{var v;return(v=C.current)==null?void 0:v.click()}}>
                      ${w?`Subiendo\u2026 ${Math.round((w.progress||0)*100)} %`:"Subir un video"}
                    </button>
                    <input ref=${C} id="take-file" type="file" accept="video/*" class="visually-hidden" tabindex="-1" aria-label="Elegir un video para subir"
                      onChange=${v=>{var A;return Ne((A=v.target.files)==null?void 0:A[0])}} />
                  </div>
                </div>`}
            ${D.length>0&&d`<${Vo} item=${k} onChange=${Pn} defaultBy=${((Ot=_.find(v=>v.role==="docente"))==null?void 0:Ot.name)||((Ft=_[0])==null?void 0:Ft.name)||""} />`}
            ${N&&d`<p class="next-pending">
              <a href=${`#/estudio/${t}/item/${N.id}`} onClick=${v=>{v.preventDefault(),n(`estudio/${t}/item/${N.id}`)}}>Siguiente pendiente: «${((Wt=N.meanings)==null?void 0:Wt[0])||"sin significado"}» (lección ${N.lesson}) →</a>
            </p>`}
          `}
      </section>
    </div>

    ${f&&d`<${Uo} courseId=${t} item=${k} meaning=${i.main} signer=${xe.get(y)} angle=${h}
      onClose=${()=>g(!1)}
      onSaved=${()=>{g(!1),o("Toma guardada"),u.reload()}} />`}
  </div>`}function Vo({item:t,onChange:e,defaultBy:a}){let[n,o]=x(t.validatedBy||a),[s,r]=x(!!t.validatedBy);return P(()=>{r(!!t.validatedBy),t.validatedBy&&o(t.validatedBy)},[t.validatedBy]),d`<div class=${L("validation",s&&"is-validated")}>
    <label class="check">
      <input id="it-validated" type="checkbox" checked=${s}
        onChange=${l=>{r(l.target.checked),e(l.target.checked,n)}} />
      <span>Validé esta seña: es correcta y está bien grabada</span>
    </label>
    <div class="field">
      <label for="it-validated-by">Validada por</label>
      <input id="it-validated-by" value=${n} maxlength="60" disabled=${s} onInput=${l=>o(l.target.value)} />
    </div>
  </div>`}var qo=["Fondo liso y mate (gris o azul)","Ropa lisa y oscura, sin accesorios","Luz de frente, sin sombras en la cara","Encuadre de la cabeza a la cadera","Empezar y terminar con las manos en reposo"];function Uo({courseId:t,item:e,meaning:a,signer:n,angle:o,onClose:s,onSaved:r}){var ne;let{store:l,notify:u}=M(),i=U(null),p=U(null),m=U(null),[c,f]=x("user"),[g,y]=x("opening"),[$,h]=x(null),[b,w]=x({}),[S,C]=x(3),[_,E]=x(0),[k,B]=x(null);P(()=>{let T=!0;return y("opening"),h(null),it({facingMode:c}).then(N=>{if(!T){ve(N);return}ve(p.current),p.current=N,w(lt(N)),i.current&&(i.current.srcObject=N,i.current.play().catch(()=>{})),y("live")}).catch(N=>{T&&(h(N.message),y("error"))}),()=>{T=!1}},[c]),P(()=>(document.body.classList.add("no-scroll"),()=>{var T;document.body.classList.remove("no-scroll"),(T=m.current)==null||T.stop(),ve(p.current)}),[]),P(()=>()=>k&&URL.revokeObjectURL(k.url),[k]);let D=()=>{let T=An(p.current,{maxMs:8e3});m.current=T,E(0),y("recording"),T.done.then(N=>{B({...N,url:URL.createObjectURL(N.blob)}),y("review")}).catch(N=>{h(N.message),y("error")})};P(()=>{if(g!=="countdown")return;if(S===0){D();return}let T=setTimeout(()=>C(N=>N-1),1e3);return()=>clearTimeout(T)},[g,S]),P(()=>{var Q;if(g!=="recording")return;let T=((Q=m.current)==null?void 0:Q.startedAt)??performance.now(),N=setInterval(()=>E(Math.floor((performance.now()-T)/100)/10),100);return()=>clearInterval(N)},[g]);let I=b.frameRate?Math.round(b.frameRate):null,R=b.width&&b.height?b.width/b.height:4/3,xe=`aspect-ratio:${R};max-width:min(100%, calc(62vh * ${R.toFixed(4)}))`,W=async()=>{y("saving");try{await l.addMedia(t,{itemId:e.id,blob:k.blob,signerId:n==null?void 0:n.id,angle:o,width:k.width,height:k.height,fps:k.fps,durationMs:k.durationMs,mimeType:k.mimeType}),r()}catch(T){u(T.message||"No se pudo guardar la toma.","bad"),y("review")}};return d`<div class="overlay recorder" role="dialog" aria-modal="true" aria-label=${`Grabar \xAB${a}\xBB`}>
    <header class="overlay-head">
      <div>
        <p class="eyebrow">Grabando · ${(n==null?void 0:n.name)||""} · vista ${o}</p>
        <h2>${a}</h2>
      </div>
      <button type="button" class="icon-btn" aria-label="Cerrar grabador" onClick=${s}>✕</button>
    </header>
    <div class="rec-stage">
      <div class=${L("rec-frame",c==="user"&&g!=="review"&&"selfie")} style=${xe}>
        <video ref=${i} muted playsinline autoplay class=${L(g==="review"&&"hidden-video")} aria-label="Vista de la cámara"></video>
        ${g==="review"&&k&&d`<video src=${k.url} muted playsinline autoplay loop aria-label="Toma grabada"></video>`}
        ${g!=="review"&&d`<svg class="guide" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="8" x2="100" y2="8" />
          <line x1="0" y1="92" x2="100" y2="92" />
          <line x1="50" y1="0" x2="50" y2="100" class="center" />
          <rect x="12" y="8" width="76" height="84" class="space" />
        </svg>
        <span class="guide-label top">cabeza</span><span class="guide-label bottom">cadera</span>`}
        ${g==="countdown"&&d`<span class="countdown" aria-live="assertive">${S||""}</span>`}
        ${g==="recording"&&d`<span class="rec-badge"><span class="rec-dot"></span> REC ${String(_).replace(".",",")} s</span>`}
        ${(g==="opening"||g==="error")&&d`<p class="stage-msg">${g==="opening"?"Abriendo la c\xE1mara\u2026":$}</p>`}
      </div>
      <aside class="rec-side">
        ${g==="review"?d`<p><strong>Así lo van a ver los alumnos.</strong> Revisá que se vea la cara y las manos completas.</p>
            <p class="muted small">${[(k==null?void 0:k.width)&&(k==null?void 0:k.height)&&`${k.width}\xD7${k.height}`,(k==null?void 0:k.fps)&&`${k.fps} fps`,Nt(k==null?void 0:k.durationMs),Lt((ne=k==null?void 0:k.blob)==null?void 0:ne.size)].filter(Boolean).join(" \xB7 ")}</p>`:d`<ul class="checklist">${qo.map(T=>d`<li>${T}</li>`)}</ul>
            ${I&&d`<p class=${L("small",I<30?"text-warn":"muted")}>${b.width}×${b.height} · ${I} fps${I<30?": pocos cuadros, la c\xE1mara lenta se ver\xE1 cortada.":I>=50?": ideal para c\xE1mara lenta.":""}</p>`}
            ${c==="user"&&d`<p class="muted small">La vista previa está espejada para ubicarte; el video se guarda sin espejar.</p>`}`}
      </aside>
    </div>
    <footer class="overlay-foot rec-actions">
      ${g==="live"&&d`<button type="button" class="btn btn-ghost" onClick=${()=>f(c==="user"?"environment":"user")}>
          ${c==="user"?"Usar c\xE1mara trasera":"Usar c\xE1mara frontal"}
        </button>
        <button type="button" class="btn btn-rec" onClick=${()=>{C(3),y("countdown")}}>Grabar (cuenta 3 s)</button>`}
      ${g==="recording"&&d`<button type="button" class="btn btn-rec" onClick=${()=>{var T;return(T=m.current)==null?void 0:T.stop()}}>Detener</button>`}
      ${g==="review"&&d`<button type="button" class="btn btn-ghost" onClick=${()=>{B(null),y("live")}}>Repetir</button>
        <button type="button" class="btn btn-primary" onClick=${W}>Guardar toma</button>`}
      ${g==="saving"&&d`<span class="muted">Guardando…</span>`}
      ${g==="error"&&d`<button type="button" class="btn btn-ghost" onClick=${s}>Cerrar</button>`}
    </footer>
  </div>`}function In(){var a;let t="";try{t=((a=globalThis.location)==null?void 0:a.hash)||""}catch{t=""}let e=t.replace(/^#\/?/,"").split("/").filter(Boolean).map(n=>decodeURIComponent(n));return{parts:e,key:e.join("/")}}function Oo(){let[t,e]=x(In);P(()=>{let n=()=>{e(In()),window.scrollTo(0,0)};return window.addEventListener("hashchange",n),()=>window.removeEventListener("hashchange",n)},[]);let a=be(n=>{let o=n.replace(/^#?\/?/,""),s=o.split("/").filter(Boolean);try{globalThis.location.hash.replace(/^#\/?/,"")===o?e({parts:s,key:s.join("/")}):globalThis.location.hash=`#/${o}`}catch{e({parts:s,key:s.join("/")}),window.scrollTo(0,0)}},[]);return[t,a]}function Rn(){let[t,e]=x(null),[a,n]=x(null),[o,s]=x(null),[r,l]=x(null),[u,i]=Oo();P(()=>{let c=()=>{};return Xa().then(f=>{e(f),c=f.onSessionChange(s),typeof window<"u"&&(window.__entreclases={store:f})}).catch(f=>n(f)),()=>c()},[]);let p=be((c,f="ok")=>{l({message:c,tone:f,id:Date.now()})},[]);if(P(()=>{if(!r)return;let c=setTimeout(()=>l(null),3600);return()=>clearTimeout(c)},[r]),a)return d`<main class="page"><h1 class="title">No pudimos abrir Entreclases</h1><${F} error=${a} onRetry=${()=>location.reload()} /></main>`;if(!t)return d`<main class="page"><${q} label="Abriendo Entreclases…" /></main>`;let m={store:t,session:o,route:u,navigate:i,notify:p};return d`<${kt.Provider} value=${m}>
    <${Fo} />
    ${r&&d`<div class=${L("toast",`toast-${r.tone}`)} role="status" key=${r.id}>${r.message}</div>`}
  <//>`}function Fo(){let{store:t,session:e,route:a,navigate:n}=M(),[o,s,r,l]=a.parts;switch(o){case void 0:return d`<${Wo} />`;case"bienvenida":return d`<${fe} area="student"><${fn} /><//>`;case"unirse":return d`<${fe} area="student"><${gn} code=${s||""} /><//>`;case"hoy":return d`<${fe} area="student"><${vn} /><//>`;case"senas":return d`<${fe} area="student"><${yn} /><//>`;case"leccion":return d`<${Bt} mode="lesson" />`;case"repaso":return d`<${Bt} mode="review" />`;case"estudio":return!s||t.mode==="firebase"&&(!e||e.isAnonymous)?d`<${fe} area="studio"><${Cn} /><//>`:r==="item"?d`<${fe} area="studio" wide><${Tn} courseId=${s} itemId=${l} /><//>`:d`<${fe} area="studio" wide><${En} courseId=${s} tab=${r||"contenido"} /><//>`;default:return d`<${fe} area="student">
        <h1 class="title">No encontramos esa pantalla</h1>
        <button class="btn btn-primary" onClick=${()=>n("")}>Ir al inicio</button>
      <//>`}}function Wo(){let{navigate:t}=M();return P(()=>{t(H.get("courseId")?"hoy":"bienvenida")},[]),d`<main class="page"><${q} /></main>`}function fe({area:t,wide:e=!1,children:a}){let{store:n,session:o,route:s,navigate:r}=M(),l=n.mode==="demo",u=l||o&&!o.isAnonymous,i=!!H.get("courseId"),p=s.parts[0],m=(c,f)=>d`<a href=${`#/${c}`} aria-current=${p===c.split("/")[0]?"page":void 0}
      onClick=${g=>{g.preventDefault(),r(c)}}>${f}</a>`;return d`<div class=${L("app",`area-${t}`)}>
    <header class="topbar">
      <a class="brand" href="#/" onClick=${c=>{c.preventDefault(),r("")}}><${nn} /><span>Entreclases</span></a>
      ${l&&d`<span class="mode-badge" title="Todo queda guardado solo en este dispositivo">${Re?"Vista previa":"Demo"}</span>`}
      <nav class="topnav" aria-label="Secciones">
        ${i&&m("hoy","Hoy")}
        ${i&&m("senas","Mis se\xF1as")}
        ${u&&m("estudio","Estudio")}
      </nav>
    </header>
    <main class=${L("page",e&&"wide")}>${a}</main>
  </div>`}var Ho=!1,Go=!1;la(d`<${Rn} />`,document.getElementById("app"));!Ho&&!Go&&"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(t=>console.warn("Service worker no registrado:",t))});
