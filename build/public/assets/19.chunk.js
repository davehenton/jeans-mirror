webpackJsonp([19],{

/***/ 1161:
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * jQuery Mousewheel 3.1.13
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 */

(function (factory) {
    if ( true ) {
        // AMD. Register as an anonymous module.
        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(72)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
    } else if (typeof exports === 'object') {
        // Node/CommonJS style for Browserify
        module.exports = factory;
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    var toFix  = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
        toBind = ( 'onwheel' in document || document.documentMode >= 9 ) ?
                    ['wheel'] : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
        slice  = Array.prototype.slice,
        nullLowestDeltaTimeout, lowestDelta;

    if ( $.event.fixHooks ) {
        for ( var i = toFix.length; i; ) {
            $.event.fixHooks[ toFix[--i] ] = $.event.mouseHooks;
        }
    }

    var special = $.event.special.mousewheel = {
        version: '3.1.12',

        setup: function() {
            if ( this.addEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.addEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = handler;
            }
            // Store the line height and page height for this particular element
            $.data(this, 'mousewheel-line-height', special.getLineHeight(this));
            $.data(this, 'mousewheel-page-height', special.getPageHeight(this));
        },

        teardown: function() {
            if ( this.removeEventListener ) {
                for ( var i = toBind.length; i; ) {
                    this.removeEventListener( toBind[--i], handler, false );
                }
            } else {
                this.onmousewheel = null;
            }
            // Clean up the data we added to the element
            $.removeData(this, 'mousewheel-line-height');
            $.removeData(this, 'mousewheel-page-height');
        },

        getLineHeight: function(elem) {
            var $elem = $(elem),
                $parent = $elem['offsetParent' in $.fn ? 'offsetParent' : 'parent']();
            if (!$parent.length) {
                $parent = $('body');
            }
            return parseInt($parent.css('fontSize'), 10) || parseInt($elem.css('fontSize'), 10) || 16;
        },

        getPageHeight: function(elem) {
            return $(elem).height();
        },

        settings: {
            adjustOldDeltas: true, // see shouldAdjustOldDeltas() below
            normalizeOffset: true  // calls getBoundingClientRect for each event
        }
    };

    $.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind('mousewheel', fn) : this.trigger('mousewheel');
        },

        unmousewheel: function(fn) {
            return this.unbind('mousewheel', fn);
        }
    });


    function handler(event) {
        var orgEvent   = event || window.event,
            args       = slice.call(arguments, 1),
            delta      = 0,
            deltaX     = 0,
            deltaY     = 0,
            absDelta   = 0,
            offsetX    = 0,
            offsetY    = 0;
        event = $.event.fix(orgEvent);
        event.type = 'mousewheel';

        // Old school scrollwheel delta
        if ( 'detail'      in orgEvent ) { deltaY = orgEvent.detail * -1;      }
        if ( 'wheelDelta'  in orgEvent ) { deltaY = orgEvent.wheelDelta;       }
        if ( 'wheelDeltaY' in orgEvent ) { deltaY = orgEvent.wheelDeltaY;      }
        if ( 'wheelDeltaX' in orgEvent ) { deltaX = orgEvent.wheelDeltaX * -1; }

        // Firefox < 17 horizontal scrolling related to DOMMouseScroll event
        if ( 'axis' in orgEvent && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
            deltaX = deltaY * -1;
            deltaY = 0;
        }

        // Set delta to be deltaY or deltaX if deltaY is 0 for backwards compatabilitiy
        delta = deltaY === 0 ? deltaX : deltaY;

        // New school wheel delta (wheel event)
        if ( 'deltaY' in orgEvent ) {
            deltaY = orgEvent.deltaY * -1;
            delta  = deltaY;
        }
        if ( 'deltaX' in orgEvent ) {
            deltaX = orgEvent.deltaX;
            if ( deltaY === 0 ) { delta  = deltaX * -1; }
        }

        // No change actually happened, no reason to go any further
        if ( deltaY === 0 && deltaX === 0 ) { return; }

        // Need to convert lines and pages to pixels if we aren't already in pixels
        // There are three delta modes:
        //   * deltaMode 0 is by pixels, nothing to do
        //   * deltaMode 1 is by lines
        //   * deltaMode 2 is by pages
        if ( orgEvent.deltaMode === 1 ) {
            var lineHeight = $.data(this, 'mousewheel-line-height');
            delta  *= lineHeight;
            deltaY *= lineHeight;
            deltaX *= lineHeight;
        } else if ( orgEvent.deltaMode === 2 ) {
            var pageHeight = $.data(this, 'mousewheel-page-height');
            delta  *= pageHeight;
            deltaY *= pageHeight;
            deltaX *= pageHeight;
        }

        // Store lowest absolute delta to normalize the delta values
        absDelta = Math.max( Math.abs(deltaY), Math.abs(deltaX) );

        if ( !lowestDelta || absDelta < lowestDelta ) {
            lowestDelta = absDelta;

            // Adjust older deltas if necessary
            if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
                lowestDelta /= 40;
            }
        }

        // Adjust older deltas if necessary
        if ( shouldAdjustOldDeltas(orgEvent, absDelta) ) {
            // Divide all the things by 40!
            delta  /= 40;
            deltaX /= 40;
            deltaY /= 40;
        }

        // Get a whole, normalized value for the deltas
        delta  = Math[ delta  >= 1 ? 'floor' : 'ceil' ](delta  / lowestDelta);
        deltaX = Math[ deltaX >= 1 ? 'floor' : 'ceil' ](deltaX / lowestDelta);
        deltaY = Math[ deltaY >= 1 ? 'floor' : 'ceil' ](deltaY / lowestDelta);

        // Normalise offsetX and offsetY properties
        if ( special.settings.normalizeOffset && this.getBoundingClientRect ) {
            var boundingRect = this.getBoundingClientRect();
            offsetX = event.clientX - boundingRect.left;
            offsetY = event.clientY - boundingRect.top;
        }

        // Add information to the event object
        event.deltaX = deltaX;
        event.deltaY = deltaY;
        event.deltaFactor = lowestDelta;
        event.offsetX = offsetX;
        event.offsetY = offsetY;
        // Go ahead and set deltaMode to 0 since we converted to pixels
        // Although this is a little odd since we overwrite the deltaX/Y
        // properties with normalized deltas.
        event.deltaMode = 0;

        // Add event and delta to the front of the arguments
        args.unshift(event, delta, deltaX, deltaY);

        // Clearout lowestDelta after sometime to better
        // handle multiple device types that give different
        // a different lowestDelta
        // Ex: trackpad = 3 and mouse wheel = 120
        if (nullLowestDeltaTimeout) { clearTimeout(nullLowestDeltaTimeout); }
        nullLowestDeltaTimeout = setTimeout(nullLowestDelta, 200);

        return ($.event.dispatch || $.event.handle).apply(this, args);
    }

    function nullLowestDelta() {
        lowestDelta = null;
    }

    function shouldAdjustOldDeltas(orgEvent, absDelta) {
        // If this is an older event and the delta is divisable by 120,
        // then we are assuming that the browser is treating this as an
        // older mouse wheel event and that we should divide the deltas
        // by 40 to try and get a more usable deltaFactor.
        // Side note, this actually impacts the reported scroll distance
        // in older browsers and can cause scrolling to be slower than native.
        // Turn this off by setting $.event.special.mousewheel.settings.adjustOldDeltas to false.
        return special.settings.adjustOldDeltas && orgEvent.type === 'mousewheel' && absDelta % 120 === 0;
    }

}));


/***/ }),

/***/ 1254:
/***/ (function(module, exports, __webpack_require__) {

!function t(e,r){ true?module.exports=r():"function"==typeof define&&define.amd?define([],r):"object"==typeof exports?exports.Raphael=r():e.Raphael=r()}(this,function(){return function(t){function e(i){if(r[i])return r[i].exports;var n=r[i]={exports:{},id:i,loaded:!1};return t[i].call(n.exports,n,n.exports,e),n.loaded=!0,n.exports}var r={};return e.m=t,e.c=r,e.p="",e(0)}([function(t,e,r){var i,n;i=[r(1),r(3),r(4)],n=function(t){return t}.apply(e,i),!(void 0!==n&&(t.exports=n))},function(t,e,r){var i,n;i=[r(2)],n=function(t){function e(r){if(e.is(r,"function"))return w?r():t.on("raphael.DOMload",r);if(e.is(r,Q))return e._engine.create[z](e,r.splice(0,3+e.is(r[0],$))).add(r);var i=Array.prototype.slice.call(arguments,0);if(e.is(i[i.length-1],"function")){var n=i.pop();return w?n.call(e._engine.create[z](e,i)):t.on("raphael.DOMload",function(){n.call(e._engine.create[z](e,i))})}return e._engine.create[z](e,arguments)}function r(t){if("function"==typeof t||Object(t)!==t)return t;var e=new t.constructor;for(var i in t)t[A](i)&&(e[i]=r(t[i]));return e}function i(t,e){for(var r=0,i=t.length;r<i;r++)if(t[r]===e)return t.push(t.splice(r,1)[0])}function n(t,e,r){function n(){var a=Array.prototype.slice.call(arguments,0),s=a.join("␀"),o=n.cache=n.cache||{},l=n.count=n.count||[];return o[A](s)?(i(l,s),r?r(o[s]):o[s]):(l.length>=1e3&&delete o[l.shift()],l.push(s),o[s]=t[z](e,a),r?r(o[s]):o[s])}return n}function a(){return this.hex}function s(t,e){for(var r=[],i=0,n=t.length;n-2*!e>i;i+=2){var a=[{x:+t[i-2],y:+t[i-1]},{x:+t[i],y:+t[i+1]},{x:+t[i+2],y:+t[i+3]},{x:+t[i+4],y:+t[i+5]}];e?i?n-4==i?a[3]={x:+t[0],y:+t[1]}:n-2==i&&(a[2]={x:+t[0],y:+t[1]},a[3]={x:+t[2],y:+t[3]}):a[0]={x:+t[n-2],y:+t[n-1]}:n-4==i?a[3]=a[2]:i||(a[0]={x:+t[i],y:+t[i+1]}),r.push(["C",(-a[0].x+6*a[1].x+a[2].x)/6,(-a[0].y+6*a[1].y+a[2].y)/6,(a[1].x+6*a[2].x-a[3].x)/6,(a[1].y+6*a[2].y-a[3].y)/6,a[2].x,a[2].y])}return r}function o(t,e,r,i,n){var a=-3*e+9*r-9*i+3*n,s=t*a+6*e-12*r+6*i;return t*s-3*e+3*r}function l(t,e,r,i,n,a,s,l,h){null==h&&(h=1),h=h>1?1:h<0?0:h;for(var u=h/2,c=12,f=[-.1252,.1252,-.3678,.3678,-.5873,.5873,-.7699,.7699,-.9041,.9041,-.9816,.9816],p=[.2491,.2491,.2335,.2335,.2032,.2032,.1601,.1601,.1069,.1069,.0472,.0472],d=0,g=0;g<c;g++){var v=u*f[g]+u,x=o(v,t,r,n,s),y=o(v,e,i,a,l),m=x*x+y*y;d+=p[g]*Y.sqrt(m)}return u*d}function h(t,e,r,i,n,a,s,o,h){if(!(h<0||l(t,e,r,i,n,a,s,o)<h)){var u=1,c=u/2,f=u-c,p,d=.01;for(p=l(t,e,r,i,n,a,s,o,f);H(p-h)>d;)c/=2,f+=(p<h?1:-1)*c,p=l(t,e,r,i,n,a,s,o,f);return f}}function u(t,e,r,i,n,a,s,o){if(!(W(t,r)<G(n,s)||G(t,r)>W(n,s)||W(e,i)<G(a,o)||G(e,i)>W(a,o))){var l=(t*i-e*r)*(n-s)-(t-r)*(n*o-a*s),h=(t*i-e*r)*(a-o)-(e-i)*(n*o-a*s),u=(t-r)*(a-o)-(e-i)*(n-s);if(u){var c=l/u,f=h/u,p=+c.toFixed(2),d=+f.toFixed(2);if(!(p<+G(t,r).toFixed(2)||p>+W(t,r).toFixed(2)||p<+G(n,s).toFixed(2)||p>+W(n,s).toFixed(2)||d<+G(e,i).toFixed(2)||d>+W(e,i).toFixed(2)||d<+G(a,o).toFixed(2)||d>+W(a,o).toFixed(2)))return{x:c,y:f}}}}function c(t,e){return p(t,e)}function f(t,e){return p(t,e,1)}function p(t,r,i){var n=e.bezierBBox(t),a=e.bezierBBox(r);if(!e.isBBoxIntersect(n,a))return i?0:[];for(var s=l.apply(0,t),o=l.apply(0,r),h=W(~~(s/5),1),c=W(~~(o/5),1),f=[],p=[],d={},g=i?0:[],v=0;v<h+1;v++){var x=e.findDotsAtSegment.apply(e,t.concat(v/h));f.push({x:x.x,y:x.y,t:v/h})}for(v=0;v<c+1;v++)x=e.findDotsAtSegment.apply(e,r.concat(v/c)),p.push({x:x.x,y:x.y,t:v/c});for(v=0;v<h;v++)for(var y=0;y<c;y++){var m=f[v],b=f[v+1],_=p[y],w=p[y+1],k=H(b.x-m.x)<.001?"y":"x",B=H(w.x-_.x)<.001?"y":"x",C=u(m.x,m.y,b.x,b.y,_.x,_.y,w.x,w.y);if(C){if(d[C.x.toFixed(4)]==C.y.toFixed(4))continue;d[C.x.toFixed(4)]=C.y.toFixed(4);var S=m.t+H((C[k]-m[k])/(b[k]-m[k]))*(b.t-m.t),A=_.t+H((C[B]-_[B])/(w[B]-_[B]))*(w.t-_.t);S>=0&&S<=1.001&&A>=0&&A<=1.001&&(i?g++:g.push({x:C.x,y:C.y,t1:G(S,1),t2:G(A,1)}))}}return g}function d(t,r,i){t=e._path2curve(t),r=e._path2curve(r);for(var n,a,s,o,l,h,u,c,f,d,g=i?0:[],v=0,x=t.length;v<x;v++){var y=t[v];if("M"==y[0])n=l=y[1],a=h=y[2];else{"C"==y[0]?(f=[n,a].concat(y.slice(1)),n=f[6],a=f[7]):(f=[n,a,n,a,l,h,l,h],n=l,a=h);for(var m=0,b=r.length;m<b;m++){var _=r[m];if("M"==_[0])s=u=_[1],o=c=_[2];else{"C"==_[0]?(d=[s,o].concat(_.slice(1)),s=d[6],o=d[7]):(d=[s,o,s,o,u,c,u,c],s=u,o=c);var w=p(f,d,i);if(i)g+=w;else{for(var k=0,B=w.length;k<B;k++)w[k].segment1=v,w[k].segment2=m,w[k].bez1=f,w[k].bez2=d;g=g.concat(w)}}}}}return g}function g(t,e,r,i,n,a){null!=t?(this.a=+t,this.b=+e,this.c=+r,this.d=+i,this.e=+n,this.f=+a):(this.a=1,this.b=0,this.c=0,this.d=1,this.e=0,this.f=0)}function v(){return this.x+j+this.y}function x(){return this.x+j+this.y+j+this.width+" × "+this.height}function y(t,e,r,i,n,a){function s(t){return((c*t+u)*t+h)*t}function o(t,e){var r=l(t,e);return((d*r+p)*r+f)*r}function l(t,e){var r,i,n,a,o,l;for(n=t,l=0;l<8;l++){if(a=s(n)-t,H(a)<e)return n;if(o=(3*c*n+2*u)*n+h,H(o)<1e-6)break;n-=a/o}if(r=0,i=1,n=t,n<r)return r;if(n>i)return i;for(;r<i;){if(a=s(n),H(a-t)<e)return n;t>a?r=n:i=n,n=(i-r)/2+r}return n}var h=3*e,u=3*(i-e)-h,c=1-h-u,f=3*r,p=3*(n-r)-f,d=1-f-p;return o(t,1/(200*a))}function m(t,e){var r=[],i={};if(this.ms=e,this.times=1,t){for(var n in t)t[A](n)&&(i[ht(n)]=t[n],r.push(ht(n)));r.sort(Bt)}this.anim=i,this.top=r[r.length-1],this.percents=r}function b(r,i,n,a,s,o){n=ht(n);var l,h,u,c=[],f,p,d,v=r.ms,x={},m={},b={};if(a)for(w=0,B=Ee.length;w<B;w++){var _=Ee[w];if(_.el.id==i.id&&_.anim==r){_.percent!=n?(Ee.splice(w,1),u=1):h=_,i.attr(_.totalOrigin);break}}else a=+m;for(var w=0,B=r.percents.length;w<B;w++){if(r.percents[w]==n||r.percents[w]>a*r.top){n=r.percents[w],p=r.percents[w-1]||0,v=v/r.top*(n-p),f=r.percents[w+1],l=r.anim[n];break}a&&i.attr(r.anim[r.percents[w]])}if(l){if(h)h.initstatus=a,h.start=new Date-h.ms*a;else{for(var C in l)if(l[A](C)&&(pt[A](C)||i.paper.customAttributes[A](C)))switch(x[C]=i.attr(C),null==x[C]&&(x[C]=ft[C]),m[C]=l[C],pt[C]){case $:b[C]=(m[C]-x[C])/v;break;case"colour":x[C]=e.getRGB(x[C]);var S=e.getRGB(m[C]);b[C]={r:(S.r-x[C].r)/v,g:(S.g-x[C].g)/v,b:(S.b-x[C].b)/v};break;case"path":var T=Qt(x[C],m[C]),E=T[1];for(x[C]=T[0],b[C]=[],w=0,B=x[C].length;w<B;w++){b[C][w]=[0];for(var M=1,N=x[C][w].length;M<N;M++)b[C][w][M]=(E[w][M]-x[C][w][M])/v}break;case"transform":var L=i._,z=le(L[C],m[C]);if(z)for(x[C]=z.from,m[C]=z.to,b[C]=[],b[C].real=!0,w=0,B=x[C].length;w<B;w++)for(b[C][w]=[x[C][w][0]],M=1,N=x[C][w].length;M<N;M++)b[C][w][M]=(m[C][w][M]-x[C][w][M])/v;else{var F=i.matrix||new g,R={_:{transform:L.transform},getBBox:function(){return i.getBBox(1)}};x[C]=[F.a,F.b,F.c,F.d,F.e,F.f],se(R,m[C]),m[C]=R._.transform,b[C]=[(R.matrix.a-F.a)/v,(R.matrix.b-F.b)/v,(R.matrix.c-F.c)/v,(R.matrix.d-F.d)/v,(R.matrix.e-F.e)/v,(R.matrix.f-F.f)/v]}break;case"csv":var j=I(l[C])[q](k),D=I(x[C])[q](k);if("clip-rect"==C)for(x[C]=D,b[C]=[],w=D.length;w--;)b[C][w]=(j[w]-x[C][w])/v;m[C]=j;break;default:for(j=[][P](l[C]),D=[][P](x[C]),b[C]=[],w=i.paper.customAttributes[C].length;w--;)b[C][w]=((j[w]||0)-(D[w]||0))/v}var V=l.easing,O=e.easing_formulas[V];if(!O)if(O=I(V).match(st),O&&5==O.length){var Y=O;O=function(t){return y(t,+Y[1],+Y[2],+Y[3],+Y[4],v)}}else O=St;if(d=l.start||r.start||+new Date,_={anim:r,percent:n,timestamp:d,start:d+(r.del||0),status:0,initstatus:a||0,stop:!1,ms:v,easing:O,from:x,diff:b,to:m,el:i,callback:l.callback,prev:p,next:f,repeat:o||r.times,origin:i.attr(),totalOrigin:s},Ee.push(_),a&&!h&&!u&&(_.stop=!0,_.start=new Date-v*a,1==Ee.length))return Ne();u&&(_.start=new Date-_.ms*a),1==Ee.length&&Me(Ne)}t("raphael.anim.start."+i.id,i,r)}}function _(t){for(var e=0;e<Ee.length;e++)Ee[e].el.paper==t&&Ee.splice(e--,1)}e.version="2.2.0",e.eve=t;var w,k=/[, ]+/,B={circle:1,rect:1,path:1,ellipse:1,text:1,image:1},C=/\{(\d+)\}/g,S="prototype",A="hasOwnProperty",T={doc:document,win:window},E={was:Object.prototype[A].call(T.win,"Raphael"),is:T.win.Raphael},M=function(){this.ca=this.customAttributes={}},N,L="appendChild",z="apply",P="concat",F="ontouchstart"in T.win||T.win.DocumentTouch&&T.doc instanceof DocumentTouch,R="",j=" ",I=String,q="split",D="click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[q](j),V={mousedown:"touchstart",mousemove:"touchmove",mouseup:"touchend"},O=I.prototype.toLowerCase,Y=Math,W=Y.max,G=Y.min,H=Y.abs,X=Y.pow,U=Y.PI,$="number",Z="string",Q="array",J="toString",K="fill",tt=Object.prototype.toString,et={},rt="push",it=e._ISURL=/^url\(['"]?(.+?)['"]?\)$/i,nt=/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i,at={NaN:1,Infinity:1,"-Infinity":1},st=/^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/,ot=Y.round,lt="setAttribute",ht=parseFloat,ut=parseInt,ct=I.prototype.toUpperCase,ft=e._availableAttrs={"arrow-end":"none","arrow-start":"none",blur:0,"clip-rect":"0 0 1e9 1e9",cursor:"default",cx:0,cy:0,fill:"#fff","fill-opacity":1,font:'10px "Arial"',"font-family":'"Arial"',"font-size":"10","font-style":"normal","font-weight":400,gradient:0,height:0,href:"http://raphaeljs.com/","letter-spacing":0,opacity:1,path:"M0,0",r:0,rx:0,ry:0,src:"",stroke:"#000","stroke-dasharray":"","stroke-linecap":"butt","stroke-linejoin":"butt","stroke-miterlimit":0,"stroke-opacity":1,"stroke-width":1,target:"_blank","text-anchor":"middle",title:"Raphael",transform:"",width:0,x:0,y:0,"class":""},pt=e._availableAnimAttrs={blur:$,"clip-rect":"csv",cx:$,cy:$,fill:"colour","fill-opacity":$,"font-size":$,height:$,opacity:$,path:"path",r:$,rx:$,ry:$,stroke:"colour","stroke-opacity":$,"stroke-width":$,transform:"transform",width:$,x:$,y:$},dt=/[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]/g,gt=/[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/,vt={hs:1,rg:1},xt=/,?([achlmqrstvxz]),?/gi,yt=/([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi,mt=/([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi,bt=/(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/gi,_t=e._radial_gradient=/^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/,wt={},kt=function(t,e){return t.key-e.key},Bt=function(t,e){return ht(t)-ht(e)},Ct=function(){},St=function(t){return t},At=e._rectPath=function(t,e,r,i,n){return n?[["M",t+n,e],["l",r-2*n,0],["a",n,n,0,0,1,n,n],["l",0,i-2*n],["a",n,n,0,0,1,-n,n],["l",2*n-r,0],["a",n,n,0,0,1,-n,-n],["l",0,2*n-i],["a",n,n,0,0,1,n,-n],["z"]]:[["M",t,e],["l",r,0],["l",0,i],["l",-r,0],["z"]]},Tt=function(t,e,r,i){return null==i&&(i=r),[["M",t,e],["m",0,-i],["a",r,i,0,1,1,0,2*i],["a",r,i,0,1,1,0,-2*i],["z"]]},Et=e._getPath={path:function(t){return t.attr("path")},circle:function(t){var e=t.attrs;return Tt(e.cx,e.cy,e.r)},ellipse:function(t){var e=t.attrs;return Tt(e.cx,e.cy,e.rx,e.ry)},rect:function(t){var e=t.attrs;return At(e.x,e.y,e.width,e.height,e.r)},image:function(t){var e=t.attrs;return At(e.x,e.y,e.width,e.height)},text:function(t){var e=t._getBBox();return At(e.x,e.y,e.width,e.height)},set:function(t){var e=t._getBBox();return At(e.x,e.y,e.width,e.height)}},Mt=e.mapPath=function(t,e){if(!e)return t;var r,i,n,a,s,o,l;for(t=Qt(t),n=0,s=t.length;n<s;n++)for(l=t[n],a=1,o=l.length;a<o;a+=2)r=e.x(l[a],l[a+1]),i=e.y(l[a],l[a+1]),l[a]=r,l[a+1]=i;return t};if(e._g=T,e.type=T.win.SVGAngle||T.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure","1.1")?"SVG":"VML","VML"==e.type){var Nt=T.doc.createElement("div"),Lt;if(Nt.innerHTML='<v:shape adj="1"/>',Lt=Nt.firstChild,Lt.style.behavior="url(#default#VML)",!Lt||"object"!=typeof Lt.adj)return e.type=R;Nt=null}e.svg=!(e.vml="VML"==e.type),e._Paper=M,e.fn=N=M.prototype=e.prototype,e._id=0,e.is=function(t,e){return e=O.call(e),"finite"==e?!at[A](+t):"array"==e?t instanceof Array:"null"==e&&null===t||e==typeof t&&null!==t||"object"==e&&t===Object(t)||"array"==e&&Array.isArray&&Array.isArray(t)||tt.call(t).slice(8,-1).toLowerCase()==e},e.angle=function(t,r,i,n,a,s){if(null==a){var o=t-i,l=r-n;return o||l?(180+180*Y.atan2(-l,-o)/U+360)%360:0}return e.angle(t,r,a,s)-e.angle(i,n,a,s)},e.rad=function(t){return t%360*U/180},e.deg=function(t){return Math.round(180*t/U%360*1e3)/1e3},e.snapTo=function(t,r,i){if(i=e.is(i,"finite")?i:10,e.is(t,Q)){for(var n=t.length;n--;)if(H(t[n]-r)<=i)return t[n]}else{t=+t;var a=r%t;if(a<i)return r-a;if(a>t-i)return r-a+t}return r};var zt=e.createUUID=function(t,e){return function(){return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(t,e).toUpperCase()}}(/[xy]/g,function(t){var e=16*Y.random()|0,r="x"==t?e:3&e|8;return r.toString(16)});e.setWindow=function(r){t("raphael.setWindow",e,T.win,r),T.win=r,T.doc=T.win.document,e._engine.initWin&&e._engine.initWin(T.win)};var Pt=function(t){if(e.vml){var r=/^\s+|\s+$/g,i;try{var a=new ActiveXObject("htmlfile");a.write("<body>"),a.close(),i=a.body}catch(s){i=createPopup().document.body}var o=i.createTextRange();Pt=n(function(t){try{i.style.color=I(t).replace(r,R);var e=o.queryCommandValue("ForeColor");return e=(255&e)<<16|65280&e|(16711680&e)>>>16,"#"+("000000"+e.toString(16)).slice(-6)}catch(n){return"none"}})}else{var l=T.doc.createElement("i");l.title="Raphaël Colour Picker",l.style.display="none",T.doc.body.appendChild(l),Pt=n(function(t){return l.style.color=t,T.doc.defaultView.getComputedStyle(l,R).getPropertyValue("color")})}return Pt(t)},Ft=function(){return"hsb("+[this.h,this.s,this.b]+")"},Rt=function(){return"hsl("+[this.h,this.s,this.l]+")"},jt=function(){return this.hex},It=function(t,r,i){if(null==r&&e.is(t,"object")&&"r"in t&&"g"in t&&"b"in t&&(i=t.b,r=t.g,t=t.r),null==r&&e.is(t,Z)){var n=e.getRGB(t);t=n.r,r=n.g,i=n.b}return(t>1||r>1||i>1)&&(t/=255,r/=255,i/=255),[t,r,i]},qt=function(t,r,i,n){t*=255,r*=255,i*=255;var a={r:t,g:r,b:i,hex:e.rgb(t,r,i),toString:jt};return e.is(n,"finite")&&(a.opacity=n),a};e.color=function(t){var r;return e.is(t,"object")&&"h"in t&&"s"in t&&"b"in t?(r=e.hsb2rgb(t),t.r=r.r,t.g=r.g,t.b=r.b,t.hex=r.hex):e.is(t,"object")&&"h"in t&&"s"in t&&"l"in t?(r=e.hsl2rgb(t),t.r=r.r,t.g=r.g,t.b=r.b,t.hex=r.hex):(e.is(t,"string")&&(t=e.getRGB(t)),e.is(t,"object")&&"r"in t&&"g"in t&&"b"in t?(r=e.rgb2hsl(t),t.h=r.h,t.s=r.s,t.l=r.l,r=e.rgb2hsb(t),t.v=r.b):(t={hex:"none"},t.r=t.g=t.b=t.h=t.s=t.v=t.l=-1)),t.toString=jt,t},e.hsb2rgb=function(t,e,r,i){this.is(t,"object")&&"h"in t&&"s"in t&&"b"in t&&(r=t.b,e=t.s,i=t.o,t=t.h),t*=360;var n,a,s,o,l;return t=t%360/60,l=r*e,o=l*(1-H(t%2-1)),n=a=s=r-l,t=~~t,n+=[l,o,0,0,o,l][t],a+=[o,l,l,o,0,0][t],s+=[0,0,o,l,l,o][t],qt(n,a,s,i)},e.hsl2rgb=function(t,e,r,i){this.is(t,"object")&&"h"in t&&"s"in t&&"l"in t&&(r=t.l,e=t.s,t=t.h),(t>1||e>1||r>1)&&(t/=360,e/=100,r/=100),t*=360;var n,a,s,o,l;return t=t%360/60,l=2*e*(r<.5?r:1-r),o=l*(1-H(t%2-1)),n=a=s=r-l/2,t=~~t,n+=[l,o,0,0,o,l][t],a+=[o,l,l,o,0,0][t],s+=[0,0,o,l,l,o][t],qt(n,a,s,i)},e.rgb2hsb=function(t,e,r){r=It(t,e,r),t=r[0],e=r[1],r=r[2];var i,n,a,s;return a=W(t,e,r),s=a-G(t,e,r),i=0==s?null:a==t?(e-r)/s:a==e?(r-t)/s+2:(t-e)/s+4,i=(i+360)%6*60/360,n=0==s?0:s/a,{h:i,s:n,b:a,toString:Ft}},e.rgb2hsl=function(t,e,r){r=It(t,e,r),t=r[0],e=r[1],r=r[2];var i,n,a,s,o,l;return s=W(t,e,r),o=G(t,e,r),l=s-o,i=0==l?null:s==t?(e-r)/l:s==e?(r-t)/l+2:(t-e)/l+4,i=(i+360)%6*60/360,a=(s+o)/2,n=0==l?0:a<.5?l/(2*a):l/(2-2*a),{h:i,s:n,l:a,toString:Rt}},e._path2string=function(){return this.join(",").replace(xt,"$1")};var Dt=e._preload=function(t,e){var r=T.doc.createElement("img");r.style.cssText="position:absolute;left:-9999em;top:-9999em",r.onload=function(){e.call(this),this.onload=null,T.doc.body.removeChild(this)},r.onerror=function(){T.doc.body.removeChild(this)},T.doc.body.appendChild(r),r.src=t};e.getRGB=n(function(t){if(!t||(t=I(t)).indexOf("-")+1)return{r:-1,g:-1,b:-1,hex:"none",error:1,toString:a};if("none"==t)return{r:-1,g:-1,b:-1,hex:"none",toString:a};!(vt[A](t.toLowerCase().substring(0,2))||"#"==t.charAt())&&(t=Pt(t));var r,i,n,s,o,l,h,u=t.match(nt);return u?(u[2]&&(s=ut(u[2].substring(5),16),n=ut(u[2].substring(3,5),16),i=ut(u[2].substring(1,3),16)),u[3]&&(s=ut((l=u[3].charAt(3))+l,16),n=ut((l=u[3].charAt(2))+l,16),i=ut((l=u[3].charAt(1))+l,16)),u[4]&&(h=u[4][q](gt),i=ht(h[0]),"%"==h[0].slice(-1)&&(i*=2.55),n=ht(h[1]),"%"==h[1].slice(-1)&&(n*=2.55),s=ht(h[2]),"%"==h[2].slice(-1)&&(s*=2.55),"rgba"==u[1].toLowerCase().slice(0,4)&&(o=ht(h[3])),h[3]&&"%"==h[3].slice(-1)&&(o/=100)),u[5]?(h=u[5][q](gt),i=ht(h[0]),"%"==h[0].slice(-1)&&(i*=2.55),n=ht(h[1]),"%"==h[1].slice(-1)&&(n*=2.55),s=ht(h[2]),"%"==h[2].slice(-1)&&(s*=2.55),("deg"==h[0].slice(-3)||"°"==h[0].slice(-1))&&(i/=360),"hsba"==u[1].toLowerCase().slice(0,4)&&(o=ht(h[3])),h[3]&&"%"==h[3].slice(-1)&&(o/=100),e.hsb2rgb(i,n,s,o)):u[6]?(h=u[6][q](gt),i=ht(h[0]),"%"==h[0].slice(-1)&&(i*=2.55),n=ht(h[1]),"%"==h[1].slice(-1)&&(n*=2.55),s=ht(h[2]),"%"==h[2].slice(-1)&&(s*=2.55),("deg"==h[0].slice(-3)||"°"==h[0].slice(-1))&&(i/=360),"hsla"==u[1].toLowerCase().slice(0,4)&&(o=ht(h[3])),h[3]&&"%"==h[3].slice(-1)&&(o/=100),e.hsl2rgb(i,n,s,o)):(u={r:i,g:n,b:s,toString:a},u.hex="#"+(16777216|s|n<<8|i<<16).toString(16).slice(1),e.is(o,"finite")&&(u.opacity=o),u)):{r:-1,g:-1,b:-1,hex:"none",error:1,toString:a}},e),e.hsb=n(function(t,r,i){return e.hsb2rgb(t,r,i).hex}),e.hsl=n(function(t,r,i){return e.hsl2rgb(t,r,i).hex}),e.rgb=n(function(t,e,r){function i(t){return t+.5|0}return"#"+(16777216|i(r)|i(e)<<8|i(t)<<16).toString(16).slice(1)}),e.getColor=function(t){var e=this.getColor.start=this.getColor.start||{h:0,s:1,b:t||.75},r=this.hsb2rgb(e.h,e.s,e.b);return e.h+=.075,e.h>1&&(e.h=0,e.s-=.2,e.s<=0&&(this.getColor.start={h:0,s:1,b:e.b})),r.hex},e.getColor.reset=function(){delete this.start},e.parsePathString=function(t){if(!t)return null;var r=Vt(t);if(r.arr)return Yt(r.arr);var i={a:7,c:6,h:1,l:2,m:2,r:4,q:4,s:4,t:2,v:1,z:0},n=[];return e.is(t,Q)&&e.is(t[0],Q)&&(n=Yt(t)),n.length||I(t).replace(yt,function(t,e,r){var a=[],s=e.toLowerCase();if(r.replace(bt,function(t,e){e&&a.push(+e)}),"m"==s&&a.length>2&&(n.push([e][P](a.splice(0,2))),s="l",e="m"==e?"l":"L"),"r"==s)n.push([e][P](a));else for(;a.length>=i[s]&&(n.push([e][P](a.splice(0,i[s]))),i[s]););}),n.toString=e._path2string,r.arr=Yt(n),n},e.parseTransformString=n(function(t){if(!t)return null;var r={r:3,s:4,t:2,m:6},i=[];return e.is(t,Q)&&e.is(t[0],Q)&&(i=Yt(t)),i.length||I(t).replace(mt,function(t,e,r){var n=[],a=O.call(e);r.replace(bt,function(t,e){e&&n.push(+e)}),i.push([e][P](n))}),i.toString=e._path2string,i});var Vt=function(t){var e=Vt.ps=Vt.ps||{};return e[t]?e[t].sleep=100:e[t]={sleep:100},setTimeout(function(){for(var r in e)e[A](r)&&r!=t&&(e[r].sleep--,!e[r].sleep&&delete e[r])}),e[t]};e.findDotsAtSegment=function(t,e,r,i,n,a,s,o,l){var h=1-l,u=X(h,3),c=X(h,2),f=l*l,p=f*l,d=u*t+3*c*l*r+3*h*l*l*n+p*s,g=u*e+3*c*l*i+3*h*l*l*a+p*o,v=t+2*l*(r-t)+f*(n-2*r+t),x=e+2*l*(i-e)+f*(a-2*i+e),y=r+2*l*(n-r)+f*(s-2*n+r),m=i+2*l*(a-i)+f*(o-2*a+i),b=h*t+l*r,_=h*e+l*i,w=h*n+l*s,k=h*a+l*o,B=90-180*Y.atan2(v-y,x-m)/U;return(v>y||x<m)&&(B+=180),{x:d,y:g,m:{x:v,y:x},n:{x:y,y:m},start:{x:b,y:_},end:{x:w,y:k},alpha:B}},e.bezierBBox=function(t,r,i,n,a,s,o,l){e.is(t,"array")||(t=[t,r,i,n,a,s,o,l]);var h=Zt.apply(null,t);return{x:h.min.x,y:h.min.y,x2:h.max.x,y2:h.max.y,width:h.max.x-h.min.x,height:h.max.y-h.min.y}},e.isPointInsideBBox=function(t,e,r){return e>=t.x&&e<=t.x2&&r>=t.y&&r<=t.y2},e.isBBoxIntersect=function(t,r){var i=e.isPointInsideBBox;return i(r,t.x,t.y)||i(r,t.x2,t.y)||i(r,t.x,t.y2)||i(r,t.x2,t.y2)||i(t,r.x,r.y)||i(t,r.x2,r.y)||i(t,r.x,r.y2)||i(t,r.x2,r.y2)||(t.x<r.x2&&t.x>r.x||r.x<t.x2&&r.x>t.x)&&(t.y<r.y2&&t.y>r.y||r.y<t.y2&&r.y>t.y)},e.pathIntersection=function(t,e){return d(t,e)},e.pathIntersectionNumber=function(t,e){return d(t,e,1)},e.isPointInsidePath=function(t,r,i){var n=e.pathBBox(t);return e.isPointInsideBBox(n,r,i)&&d(t,[["M",r,i],["H",n.x2+10]],1)%2==1},e._removedFactory=function(e){return function(){t("raphael.log",null,"Raphaël: you are calling to method “"+e+"” of removed object",e)}};var Ot=e.pathBBox=function(t){var e=Vt(t);if(e.bbox)return r(e.bbox);if(!t)return{x:0,y:0,width:0,height:0,x2:0,y2:0};t=Qt(t);for(var i=0,n=0,a=[],s=[],o,l=0,h=t.length;l<h;l++)if(o=t[l],"M"==o[0])i=o[1],n=o[2],a.push(i),s.push(n);else{var u=Zt(i,n,o[1],o[2],o[3],o[4],o[5],o[6]);a=a[P](u.min.x,u.max.x),s=s[P](u.min.y,u.max.y),i=o[5],n=o[6]}var c=G[z](0,a),f=G[z](0,s),p=W[z](0,a),d=W[z](0,s),g=p-c,v=d-f,x={x:c,y:f,x2:p,y2:d,width:g,height:v,cx:c+g/2,cy:f+v/2};return e.bbox=r(x),x},Yt=function(t){var i=r(t);return i.toString=e._path2string,i},Wt=e._pathToRelative=function(t){var r=Vt(t);if(r.rel)return Yt(r.rel);e.is(t,Q)&&e.is(t&&t[0],Q)||(t=e.parsePathString(t));var i=[],n=0,a=0,s=0,o=0,l=0;"M"==t[0][0]&&(n=t[0][1],a=t[0][2],s=n,o=a,l++,i.push(["M",n,a]));for(var h=l,u=t.length;h<u;h++){var c=i[h]=[],f=t[h];if(f[0]!=O.call(f[0]))switch(c[0]=O.call(f[0]),c[0]){case"a":c[1]=f[1],c[2]=f[2],c[3]=f[3],c[4]=f[4],c[5]=f[5],c[6]=+(f[6]-n).toFixed(3),c[7]=+(f[7]-a).toFixed(3);break;case"v":c[1]=+(f[1]-a).toFixed(3);break;case"m":s=f[1],o=f[2];default:for(var p=1,d=f.length;p<d;p++)c[p]=+(f[p]-(p%2?n:a)).toFixed(3)}else{c=i[h]=[],"m"==f[0]&&(s=f[1]+n,o=f[2]+a);for(var g=0,v=f.length;g<v;g++)i[h][g]=f[g]}var x=i[h].length;switch(i[h][0]){case"z":n=s,a=o;break;case"h":n+=+i[h][x-1];break;case"v":a+=+i[h][x-1];break;default:n+=+i[h][x-2],a+=+i[h][x-1]}}return i.toString=e._path2string,r.rel=Yt(i),i},Gt=e._pathToAbsolute=function(t){var r=Vt(t);if(r.abs)return Yt(r.abs);if(e.is(t,Q)&&e.is(t&&t[0],Q)||(t=e.parsePathString(t)),!t||!t.length)return[["M",0,0]];var i=[],n=0,a=0,o=0,l=0,h=0;"M"==t[0][0]&&(n=+t[0][1],a=+t[0][2],o=n,l=a,h++,i[0]=["M",n,a]);for(var u=3==t.length&&"M"==t[0][0]&&"R"==t[1][0].toUpperCase()&&"Z"==t[2][0].toUpperCase(),c,f,p=h,d=t.length;p<d;p++){if(i.push(c=[]),f=t[p],f[0]!=ct.call(f[0]))switch(c[0]=ct.call(f[0]),c[0]){case"A":c[1]=f[1],c[2]=f[2],c[3]=f[3],c[4]=f[4],c[5]=f[5],c[6]=+(f[6]+n),c[7]=+(f[7]+a);break;case"V":c[1]=+f[1]+a;break;case"H":c[1]=+f[1]+n;break;case"R":for(var g=[n,a][P](f.slice(1)),v=2,x=g.length;v<x;v++)g[v]=+g[v]+n,g[++v]=+g[v]+a;i.pop(),i=i[P](s(g,u));break;case"M":o=+f[1]+n,l=+f[2]+a;default:for(v=1,x=f.length;v<x;v++)c[v]=+f[v]+(v%2?n:a)}else if("R"==f[0])g=[n,a][P](f.slice(1)),i.pop(),i=i[P](s(g,u)),c=["R"][P](f.slice(-2));else for(var y=0,m=f.length;y<m;y++)c[y]=f[y];switch(c[0]){case"Z":n=o,a=l;break;case"H":n=c[1];break;case"V":a=c[1];break;case"M":o=c[c.length-2],l=c[c.length-1];default:n=c[c.length-2],a=c[c.length-1]}}return i.toString=e._path2string,r.abs=Yt(i),i},Ht=function(t,e,r,i){return[t,e,r,i,r,i]},Xt=function(t,e,r,i,n,a){var s=1/3,o=2/3;return[s*t+o*r,s*e+o*i,s*n+o*r,s*a+o*i,n,a]},Ut=function(t,e,r,i,a,s,o,l,h,u){var c=120*U/180,f=U/180*(+a||0),p=[],d,g=n(function(t,e,r){var i=t*Y.cos(r)-e*Y.sin(r),n=t*Y.sin(r)+e*Y.cos(r);return{x:i,y:n}});if(u)S=u[0],A=u[1],B=u[2],C=u[3];else{d=g(t,e,-f),t=d.x,e=d.y,d=g(l,h,-f),l=d.x,h=d.y;var v=Y.cos(U/180*a),x=Y.sin(U/180*a),y=(t-l)/2,m=(e-h)/2,b=y*y/(r*r)+m*m/(i*i);b>1&&(b=Y.sqrt(b),r=b*r,i=b*i);var _=r*r,w=i*i,k=(s==o?-1:1)*Y.sqrt(H((_*w-_*m*m-w*y*y)/(_*m*m+w*y*y))),B=k*r*m/i+(t+l)/2,C=k*-i*y/r+(e+h)/2,S=Y.asin(((e-C)/i).toFixed(9)),A=Y.asin(((h-C)/i).toFixed(9));S=t<B?U-S:S,A=l<B?U-A:A,S<0&&(S=2*U+S),A<0&&(A=2*U+A),o&&S>A&&(S-=2*U),!o&&A>S&&(A-=2*U)}var T=A-S;if(H(T)>c){var E=A,M=l,N=h;A=S+c*(o&&A>S?1:-1),l=B+r*Y.cos(A),h=C+i*Y.sin(A),p=Ut(l,h,r,i,a,0,o,M,N,[A,E,B,C])}T=A-S;var L=Y.cos(S),z=Y.sin(S),F=Y.cos(A),R=Y.sin(A),j=Y.tan(T/4),I=4/3*r*j,D=4/3*i*j,V=[t,e],O=[t+I*z,e-D*L],W=[l+I*R,h-D*F],G=[l,h];if(O[0]=2*V[0]-O[0],O[1]=2*V[1]-O[1],u)return[O,W,G][P](p);p=[O,W,G][P](p).join()[q](",");for(var X=[],$=0,Z=p.length;$<Z;$++)X[$]=$%2?g(p[$-1],p[$],f).y:g(p[$],p[$+1],f).x;return X},$t=function(t,e,r,i,n,a,s,o,l){var h=1-l;return{x:X(h,3)*t+3*X(h,2)*l*r+3*h*l*l*n+X(l,3)*s,y:X(h,3)*e+3*X(h,2)*l*i+3*h*l*l*a+X(l,3)*o}},Zt=n(function(t,e,r,i,n,a,s,o){var l=n-2*r+t-(s-2*n+r),h=2*(r-t)-2*(n-r),u=t-r,c=(-h+Y.sqrt(h*h-4*l*u))/2/l,f=(-h-Y.sqrt(h*h-4*l*u))/2/l,p=[e,o],d=[t,s],g;return H(c)>"1e12"&&(c=.5),H(f)>"1e12"&&(f=.5),c>0&&c<1&&(g=$t(t,e,r,i,n,a,s,o,c),d.push(g.x),p.push(g.y)),f>0&&f<1&&(g=$t(t,e,r,i,n,a,s,o,f),d.push(g.x),p.push(g.y)),l=a-2*i+e-(o-2*a+i),h=2*(i-e)-2*(a-i),u=e-i,c=(-h+Y.sqrt(h*h-4*l*u))/2/l,f=(-h-Y.sqrt(h*h-4*l*u))/2/l,H(c)>"1e12"&&(c=.5),H(f)>"1e12"&&(f=.5),c>0&&c<1&&(g=$t(t,e,r,i,n,a,s,o,c),d.push(g.x),p.push(g.y)),f>0&&f<1&&(g=$t(t,e,r,i,n,a,s,o,f),d.push(g.x),p.push(g.y)),{min:{x:G[z](0,d),y:G[z](0,p)},max:{x:W[z](0,d),y:W[z](0,p)}}}),Qt=e._path2curve=n(function(t,e){var r=!e&&Vt(t);if(!e&&r.curve)return Yt(r.curve);for(var i=Gt(t),n=e&&Gt(e),a={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},s={x:0,y:0,bx:0,by:0,X:0,Y:0,qx:null,qy:null},o=(function(t,e,r){var i,n,a={T:1,Q:1};if(!t)return["C",e.x,e.y,e.x,e.y,e.x,e.y];switch(!(t[0]in a)&&(e.qx=e.qy=null),t[0]){case"M":e.X=t[1],e.Y=t[2];break;case"A":t=["C"][P](Ut[z](0,[e.x,e.y][P](t.slice(1))));break;case"S":"C"==r||"S"==r?(i=2*e.x-e.bx,n=2*e.y-e.by):(i=e.x,n=e.y),t=["C",i,n][P](t.slice(1));break;case"T":"Q"==r||"T"==r?(e.qx=2*e.x-e.qx,e.qy=2*e.y-e.qy):(e.qx=e.x,e.qy=e.y),t=["C"][P](Xt(e.x,e.y,e.qx,e.qy,t[1],t[2]));break;case"Q":e.qx=t[1],e.qy=t[2],t=["C"][P](Xt(e.x,e.y,t[1],t[2],t[3],t[4]));break;case"L":t=["C"][P](Ht(e.x,e.y,t[1],t[2]));break;case"H":t=["C"][P](Ht(e.x,e.y,t[1],e.y));break;case"V":t=["C"][P](Ht(e.x,e.y,e.x,t[1]));break;case"Z":t=["C"][P](Ht(e.x,e.y,e.X,e.Y))}return t}),l=function(t,e){if(t[e].length>7){t[e].shift();for(var r=t[e];r.length;)u[e]="A",n&&(c[e]="A"),t.splice(e++,0,["C"][P](r.splice(0,6)));t.splice(e,1),g=W(i.length,n&&n.length||0)}},h=function(t,e,r,a,s){t&&e&&"M"==t[s][0]&&"M"!=e[s][0]&&(e.splice(s,0,["M",a.x,a.y]),r.bx=0,r.by=0,r.x=t[s][1],r.y=t[s][2],g=W(i.length,n&&n.length||0))},u=[],c=[],f="",p="",d=0,g=W(i.length,n&&n.length||0);d<g;d++){i[d]&&(f=i[d][0]),"C"!=f&&(u[d]=f,d&&(p=u[d-1])),i[d]=o(i[d],a,p),"A"!=u[d]&&"C"==f&&(u[d]="C"),l(i,d),n&&(n[d]&&(f=n[d][0]),"C"!=f&&(c[d]=f,d&&(p=c[d-1])),n[d]=o(n[d],s,p),"A"!=c[d]&&"C"==f&&(c[d]="C"),l(n,d)),h(i,n,a,s,d),h(n,i,s,a,d);var v=i[d],x=n&&n[d],y=v.length,m=n&&x.length;a.x=v[y-2],a.y=v[y-1],a.bx=ht(v[y-4])||a.x,a.by=ht(v[y-3])||a.y,s.bx=n&&(ht(x[m-4])||s.x),s.by=n&&(ht(x[m-3])||s.y),s.x=n&&x[m-2],s.y=n&&x[m-1]}return n||(r.curve=Yt(i)),n?[i,n]:i},null,Yt),Jt=e._parseDots=n(function(t){for(var r=[],i=0,n=t.length;i<n;i++){var a={},s=t[i].match(/^([^:]*):?([\d\.]*)/);if(a.color=e.getRGB(s[1]),a.color.error)return null;a.opacity=a.color.opacity,a.color=a.color.hex,s[2]&&(a.offset=s[2]+"%"),r.push(a)}for(i=1,n=r.length-1;i<n;i++)if(!r[i].offset){for(var o=ht(r[i-1].offset||0),l=0,h=i+1;h<n;h++)if(r[h].offset){l=r[h].offset;break}l||(l=100,h=n),l=ht(l);for(var u=(l-o)/(h-i+1);i<h;i++)o+=u,r[i].offset=o+"%"}return r}),Kt=e._tear=function(t,e){t==e.top&&(e.top=t.prev),t==e.bottom&&(e.bottom=t.next),t.next&&(t.next.prev=t.prev),t.prev&&(t.prev.next=t.next)},te=e._tofront=function(t,e){e.top!==t&&(Kt(t,e),t.next=null,t.prev=e.top,e.top.next=t,e.top=t)},ee=e._toback=function(t,e){e.bottom!==t&&(Kt(t,e),t.next=e.bottom,t.prev=null,e.bottom.prev=t,e.bottom=t)},re=e._insertafter=function(t,e,r){Kt(t,r),e==r.top&&(r.top=t),e.next&&(e.next.prev=t),t.next=e.next,t.prev=e,e.next=t},ie=e._insertbefore=function(t,e,r){Kt(t,r),e==r.bottom&&(r.bottom=t),e.prev&&(e.prev.next=t),t.prev=e.prev,e.prev=t,t.next=e},ne=e.toMatrix=function(t,e){var r=Ot(t),i={_:{transform:R},getBBox:function(){return r}};return se(i,e),i.matrix},ae=e.transformPath=function(t,e){return Mt(t,ne(t,e))},se=e._extractTransform=function(t,r){if(null==r)return t._.transform;r=I(r).replace(/\.{3}|\u2026/g,t._.transform||R);var i=e.parseTransformString(r),n=0,a=0,s=0,o=1,l=1,h=t._,u=new g;if(h.transform=i||[],i)for(var c=0,f=i.length;c<f;c++){var p=i[c],d=p.length,v=I(p[0]).toLowerCase(),x=p[0]!=v,y=x?u.invert():0,m,b,_,w,k;"t"==v&&3==d?x?(m=y.x(0,0),b=y.y(0,0),_=y.x(p[1],p[2]),w=y.y(p[1],p[2]),u.translate(_-m,w-b)):u.translate(p[1],p[2]):"r"==v?2==d?(k=k||t.getBBox(1),u.rotate(p[1],k.x+k.width/2,k.y+k.height/2),n+=p[1]):4==d&&(x?(_=y.x(p[2],p[3]),w=y.y(p[2],p[3]),u.rotate(p[1],_,w)):u.rotate(p[1],p[2],p[3]),n+=p[1]):"s"==v?2==d||3==d?(k=k||t.getBBox(1),u.scale(p[1],p[d-1],k.x+k.width/2,k.y+k.height/2),o*=p[1],l*=p[d-1]):5==d&&(x?(_=y.x(p[3],p[4]),w=y.y(p[3],p[4]),u.scale(p[1],p[2],_,w)):u.scale(p[1],p[2],p[3],p[4]),o*=p[1],l*=p[2]):"m"==v&&7==d&&u.add(p[1],p[2],p[3],p[4],p[5],p[6]),h.dirtyT=1,t.matrix=u}t.matrix=u,h.sx=o,h.sy=l,h.deg=n,h.dx=a=u.e,h.dy=s=u.f,1==o&&1==l&&!n&&h.bbox?(h.bbox.x+=+a,h.bbox.y+=+s):h.dirtyT=1},oe=function(t){var e=t[0];switch(e.toLowerCase()){case"t":return[e,0,0];case"m":return[e,1,0,0,1,0,0];case"r":return 4==t.length?[e,0,t[2],t[3]]:[e,0];case"s":return 5==t.length?[e,1,1,t[3],t[4]]:3==t.length?[e,1,1]:[e,1]}},le=e._equaliseTransform=function(t,r){r=I(r).replace(/\.{3}|\u2026/g,t),t=e.parseTransformString(t)||[],r=e.parseTransformString(r)||[];for(var i=W(t.length,r.length),n=[],a=[],s=0,o,l,h,u;s<i;s++){if(h=t[s]||oe(r[s]),u=r[s]||oe(h),h[0]!=u[0]||"r"==h[0].toLowerCase()&&(h[2]!=u[2]||h[3]!=u[3])||"s"==h[0].toLowerCase()&&(h[3]!=u[3]||h[4]!=u[4]))return;for(n[s]=[],a[s]=[],o=0,l=W(h.length,u.length);o<l;o++)o in h&&(n[s][o]=h[o]),o in u&&(a[s][o]=u[o])}return{from:n,to:a}};e._getContainer=function(t,r,i,n){var a;if(a=null!=n||e.is(t,"object")?t:T.doc.getElementById(t),null!=a)return a.tagName?null==r?{container:a,width:a.style.pixelWidth||a.offsetWidth,height:a.style.pixelHeight||a.offsetHeight}:{container:a,width:r,height:i}:{container:1,x:t,y:r,width:i,height:n}},e.pathToRelative=Wt,e._engine={},e.path2curve=Qt,e.matrix=function(t,e,r,i,n,a){return new g(t,e,r,i,n,a)},function(t){function r(t){return t[0]*t[0]+t[1]*t[1]}function i(t){var e=Y.sqrt(r(t));t[0]&&(t[0]/=e),t[1]&&(t[1]/=e)}t.add=function(t,e,r,i,n,a){var s=[[],[],[]],o=[[this.a,this.c,this.e],[this.b,this.d,this.f],[0,0,1]],l=[[t,r,n],[e,i,a],[0,0,1]],h,u,c,f;for(t&&t instanceof g&&(l=[[t.a,t.c,t.e],[t.b,t.d,t.f],[0,0,1]]),h=0;h<3;h++)for(u=0;u<3;u++){for(f=0,c=0;c<3;c++)f+=o[h][c]*l[c][u];s[h][u]=f}this.a=s[0][0],this.b=s[1][0],this.c=s[0][1],this.d=s[1][1],this.e=s[0][2],this.f=s[1][2]},t.invert=function(){var t=this,e=t.a*t.d-t.b*t.c;return new g(t.d/e,-t.b/e,-t.c/e,t.a/e,(t.c*t.f-t.d*t.e)/e,(t.b*t.e-t.a*t.f)/e)},t.clone=function(){return new g(this.a,this.b,this.c,this.d,this.e,this.f)},t.translate=function(t,e){
this.add(1,0,0,1,t,e)},t.scale=function(t,e,r,i){null==e&&(e=t),(r||i)&&this.add(1,0,0,1,r,i),this.add(t,0,0,e,0,0),(r||i)&&this.add(1,0,0,1,-r,-i)},t.rotate=function(t,r,i){t=e.rad(t),r=r||0,i=i||0;var n=+Y.cos(t).toFixed(9),a=+Y.sin(t).toFixed(9);this.add(n,a,-a,n,r,i),this.add(1,0,0,1,-r,-i)},t.x=function(t,e){return t*this.a+e*this.c+this.e},t.y=function(t,e){return t*this.b+e*this.d+this.f},t.get=function(t){return+this[I.fromCharCode(97+t)].toFixed(4)},t.toString=function(){return e.svg?"matrix("+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)].join()+")":[this.get(0),this.get(2),this.get(1),this.get(3),0,0].join()},t.toFilter=function(){return"progid:DXImageTransform.Microsoft.Matrix(M11="+this.get(0)+", M12="+this.get(2)+", M21="+this.get(1)+", M22="+this.get(3)+", Dx="+this.get(4)+", Dy="+this.get(5)+", sizingmethod='auto expand')"},t.offset=function(){return[this.e.toFixed(4),this.f.toFixed(4)]},t.split=function(){var t={};t.dx=this.e,t.dy=this.f;var n=[[this.a,this.c],[this.b,this.d]];t.scalex=Y.sqrt(r(n[0])),i(n[0]),t.shear=n[0][0]*n[1][0]+n[0][1]*n[1][1],n[1]=[n[1][0]-n[0][0]*t.shear,n[1][1]-n[0][1]*t.shear],t.scaley=Y.sqrt(r(n[1])),i(n[1]),t.shear/=t.scaley;var a=-n[0][1],s=n[1][1];return s<0?(t.rotate=e.deg(Y.acos(s)),a<0&&(t.rotate=360-t.rotate)):t.rotate=e.deg(Y.asin(a)),t.isSimple=!(+t.shear.toFixed(9)||t.scalex.toFixed(9)!=t.scaley.toFixed(9)&&t.rotate),t.isSuperSimple=!+t.shear.toFixed(9)&&t.scalex.toFixed(9)==t.scaley.toFixed(9)&&!t.rotate,t.noRotation=!+t.shear.toFixed(9)&&!t.rotate,t},t.toTransformString=function(t){var e=t||this[q]();return e.isSimple?(e.scalex=+e.scalex.toFixed(4),e.scaley=+e.scaley.toFixed(4),e.rotate=+e.rotate.toFixed(4),(e.dx||e.dy?"t"+[e.dx,e.dy]:R)+(1!=e.scalex||1!=e.scaley?"s"+[e.scalex,e.scaley,0,0]:R)+(e.rotate?"r"+[e.rotate,0,0]:R)):"m"+[this.get(0),this.get(1),this.get(2),this.get(3),this.get(4),this.get(5)]}}(g.prototype);for(var he=function(){this.returnValue=!1},ue=function(){return this.originalEvent.preventDefault()},ce=function(){this.cancelBubble=!0},fe=function(){return this.originalEvent.stopPropagation()},pe=function(t){var e=T.doc.documentElement.scrollTop||T.doc.body.scrollTop,r=T.doc.documentElement.scrollLeft||T.doc.body.scrollLeft;return{x:t.clientX+r,y:t.clientY+e}},de=function(){return T.doc.addEventListener?function(t,e,r,i){var n=function(t){var e=pe(t);return r.call(i,t,e.x,e.y)};if(t.addEventListener(e,n,!1),F&&V[e]){var a=function(e){for(var n=pe(e),a=e,s=0,o=e.targetTouches&&e.targetTouches.length;s<o;s++)if(e.targetTouches[s].target==t){e=e.targetTouches[s],e.originalEvent=a,e.preventDefault=ue,e.stopPropagation=fe;break}return r.call(i,e,n.x,n.y)};t.addEventListener(V[e],a,!1)}return function(){return t.removeEventListener(e,n,!1),F&&V[e]&&t.removeEventListener(V[e],a,!1),!0}}:T.doc.attachEvent?function(t,e,r,i){var n=function(t){t=t||T.win.event;var e=T.doc.documentElement.scrollTop||T.doc.body.scrollTop,n=T.doc.documentElement.scrollLeft||T.doc.body.scrollLeft,a=t.clientX+n,s=t.clientY+e;return t.preventDefault=t.preventDefault||he,t.stopPropagation=t.stopPropagation||ce,r.call(i,t,a,s)};t.attachEvent("on"+e,n);var a=function(){return t.detachEvent("on"+e,n),!0};return a}:void 0}(),ge=[],ve=function(e){for(var r=e.clientX,i=e.clientY,n=T.doc.documentElement.scrollTop||T.doc.body.scrollTop,a=T.doc.documentElement.scrollLeft||T.doc.body.scrollLeft,s,o=ge.length;o--;){if(s=ge[o],F&&e.touches){for(var l=e.touches.length,h;l--;)if(h=e.touches[l],h.identifier==s.el._drag.id){r=h.clientX,i=h.clientY,(e.originalEvent?e.originalEvent:e).preventDefault();break}}else e.preventDefault();var u=s.el.node,c,f=u.nextSibling,p=u.parentNode,d=u.style.display;T.win.opera&&p.removeChild(u),u.style.display="none",c=s.el.paper.getElementByPoint(r,i),u.style.display=d,T.win.opera&&(f?p.insertBefore(u,f):p.appendChild(u)),c&&t("raphael.drag.over."+s.el.id,s.el,c),r+=a,i+=n,t("raphael.drag.move."+s.el.id,s.move_scope||s.el,r-s.el._drag.x,i-s.el._drag.y,r,i,e)}},xe=function(r){e.unmousemove(ve).unmouseup(xe);for(var i=ge.length,n;i--;)n=ge[i],n.el._drag={},t("raphael.drag.end."+n.el.id,n.end_scope||n.start_scope||n.move_scope||n.el,r);ge=[]},ye=e.el={},me=D.length;me--;)!function(t){e[t]=ye[t]=function(r,i){return e.is(r,"function")&&(this.events=this.events||[],this.events.push({name:t,f:r,unbind:de(this.shape||this.node||T.doc,t,r,i||this)})),this},e["un"+t]=ye["un"+t]=function(r){for(var i=this.events||[],n=i.length;n--;)i[n].name!=t||!e.is(r,"undefined")&&i[n].f!=r||(i[n].unbind(),i.splice(n,1),!i.length&&delete this.events);return this}}(D[me]);ye.data=function(r,i){var n=wt[this.id]=wt[this.id]||{};if(0==arguments.length)return n;if(1==arguments.length){if(e.is(r,"object")){for(var a in r)r[A](a)&&this.data(a,r[a]);return this}return t("raphael.data.get."+this.id,this,n[r],r),n[r]}return n[r]=i,t("raphael.data.set."+this.id,this,i,r),this},ye.removeData=function(t){return null==t?wt[this.id]={}:wt[this.id]&&delete wt[this.id][t],this},ye.getData=function(){return r(wt[this.id]||{})},ye.hover=function(t,e,r,i){return this.mouseover(t,r).mouseout(e,i||r)},ye.unhover=function(t,e){return this.unmouseover(t).unmouseout(e)};var be=[];ye.drag=function(r,i,n,a,s,o){function l(l){(l.originalEvent||l).preventDefault();var h=l.clientX,u=l.clientY,c=T.doc.documentElement.scrollTop||T.doc.body.scrollTop,f=T.doc.documentElement.scrollLeft||T.doc.body.scrollLeft;if(this._drag.id=l.identifier,F&&l.touches)for(var p=l.touches.length,d;p--;)if(d=l.touches[p],this._drag.id=d.identifier,d.identifier==this._drag.id){h=d.clientX,u=d.clientY;break}this._drag.x=h+f,this._drag.y=u+c,!ge.length&&e.mousemove(ve).mouseup(xe),ge.push({el:this,move_scope:a,start_scope:s,end_scope:o}),i&&t.on("raphael.drag.start."+this.id,i),r&&t.on("raphael.drag.move."+this.id,r),n&&t.on("raphael.drag.end."+this.id,n),t("raphael.drag.start."+this.id,s||a||this,l.clientX+f,l.clientY+c,l)}return this._drag={},be.push({el:this,start:l}),this.mousedown(l),this},ye.onDragOver=function(e){e?t.on("raphael.drag.over."+this.id,e):t.unbind("raphael.drag.over."+this.id)},ye.undrag=function(){for(var r=be.length;r--;)be[r].el==this&&(this.unmousedown(be[r].start),be.splice(r,1),t.unbind("raphael.drag.*."+this.id));!be.length&&e.unmousemove(ve).unmouseup(xe),ge=[]},N.circle=function(t,r,i){var n=e._engine.circle(this,t||0,r||0,i||0);return this.__set__&&this.__set__.push(n),n},N.rect=function(t,r,i,n,a){var s=e._engine.rect(this,t||0,r||0,i||0,n||0,a||0);return this.__set__&&this.__set__.push(s),s},N.ellipse=function(t,r,i,n){var a=e._engine.ellipse(this,t||0,r||0,i||0,n||0);return this.__set__&&this.__set__.push(a),a},N.path=function(t){t&&!e.is(t,Z)&&!e.is(t[0],Q)&&(t+=R);var r=e._engine.path(e.format[z](e,arguments),this);return this.__set__&&this.__set__.push(r),r},N.image=function(t,r,i,n,a){var s=e._engine.image(this,t||"about:blank",r||0,i||0,n||0,a||0);return this.__set__&&this.__set__.push(s),s},N.text=function(t,r,i){var n=e._engine.text(this,t||0,r||0,I(i));return this.__set__&&this.__set__.push(n),n},N.set=function(t){!e.is(t,"array")&&(t=Array.prototype.splice.call(arguments,0,arguments.length));var r=new ze(t);return this.__set__&&this.__set__.push(r),r.paper=this,r.type="set",r},N.setStart=function(t){this.__set__=t||this.set()},N.setFinish=function(t){var e=this.__set__;return delete this.__set__,e},N.getSize=function(){var t=this.canvas.parentNode;return{width:t.offsetWidth,height:t.offsetHeight}},N.setSize=function(t,r){return e._engine.setSize.call(this,t,r)},N.setViewBox=function(t,r,i,n,a){return e._engine.setViewBox.call(this,t,r,i,n,a)},N.top=N.bottom=null,N.raphael=e;var _e=function(t){var e=t.getBoundingClientRect(),r=t.ownerDocument,i=r.body,n=r.documentElement,a=n.clientTop||i.clientTop||0,s=n.clientLeft||i.clientLeft||0,o=e.top+(T.win.pageYOffset||n.scrollTop||i.scrollTop)-a,l=e.left+(T.win.pageXOffset||n.scrollLeft||i.scrollLeft)-s;return{y:o,x:l}};N.getElementByPoint=function(t,e){var r=this,i=r.canvas,n=T.doc.elementFromPoint(t,e);if(T.win.opera&&"svg"==n.tagName){var a=_e(i),s=i.createSVGRect();s.x=t-a.x,s.y=e-a.y,s.width=s.height=1;var o=i.getIntersectionList(s,null);o.length&&(n=o[o.length-1])}if(!n)return null;for(;n.parentNode&&n!=i.parentNode&&!n.raphael;)n=n.parentNode;return n==r.canvas.parentNode&&(n=i),n=n&&n.raphael?r.getById(n.raphaelid):null},N.getElementsByBBox=function(t){var r=this.set();return this.forEach(function(i){e.isBBoxIntersect(i.getBBox(),t)&&r.push(i)}),r},N.getById=function(t){for(var e=this.bottom;e;){if(e.id==t)return e;e=e.next}return null},N.forEach=function(t,e){for(var r=this.bottom;r;){if(t.call(e,r)===!1)return this;r=r.next}return this},N.getElementsByPoint=function(t,e){var r=this.set();return this.forEach(function(i){i.isPointInside(t,e)&&r.push(i)}),r},ye.isPointInside=function(t,r){var i=this.realPath=Et[this.type](this);return this.attr("transform")&&this.attr("transform").length&&(i=e.transformPath(i,this.attr("transform"))),e.isPointInsidePath(i,t,r)},ye.getBBox=function(t){if(this.removed)return{};var e=this._;return t?(!e.dirty&&e.bboxwt||(this.realPath=Et[this.type](this),e.bboxwt=Ot(this.realPath),e.bboxwt.toString=x,e.dirty=0),e.bboxwt):((e.dirty||e.dirtyT||!e.bbox)&&(!e.dirty&&this.realPath||(e.bboxwt=0,this.realPath=Et[this.type](this)),e.bbox=Ot(Mt(this.realPath,this.matrix)),e.bbox.toString=x,e.dirty=e.dirtyT=0),e.bbox)},ye.clone=function(){if(this.removed)return null;var t=this.paper[this.type]().attr(this.attr());return this.__set__&&this.__set__.push(t),t},ye.glow=function(t){if("text"==this.type)return null;t=t||{};var e={width:(t.width||10)+(+this.attr("stroke-width")||1),fill:t.fill||!1,opacity:null==t.opacity?.5:t.opacity,offsetx:t.offsetx||0,offsety:t.offsety||0,color:t.color||"#000"},r=e.width/2,i=this.paper,n=i.set(),a=this.realPath||Et[this.type](this);a=this.matrix?Mt(a,this.matrix):a;for(var s=1;s<r+1;s++)n.push(i.path(a).attr({stroke:e.color,fill:e.fill?e.color:"none","stroke-linejoin":"round","stroke-linecap":"round","stroke-width":+(e.width/r*s).toFixed(3),opacity:+(e.opacity/r).toFixed(3)}));return n.insertBefore(this).translate(e.offsetx,e.offsety)};var we={},ke=function(t,r,i,n,a,s,o,u,c){return null==c?l(t,r,i,n,a,s,o,u):e.findDotsAtSegment(t,r,i,n,a,s,o,u,h(t,r,i,n,a,s,o,u,c))},Be=function(t,r){return function(i,n,a){i=Qt(i);for(var s,o,l,h,u="",c={},f,p=0,d=0,g=i.length;d<g;d++){if(l=i[d],"M"==l[0])s=+l[1],o=+l[2];else{if(h=ke(s,o,l[1],l[2],l[3],l[4],l[5],l[6]),p+h>n){if(r&&!c.start){if(f=ke(s,o,l[1],l[2],l[3],l[4],l[5],l[6],n-p),u+=["C"+f.start.x,f.start.y,f.m.x,f.m.y,f.x,f.y],a)return u;c.start=u,u=["M"+f.x,f.y+"C"+f.n.x,f.n.y,f.end.x,f.end.y,l[5],l[6]].join(),p+=h,s=+l[5],o=+l[6];continue}if(!t&&!r)return f=ke(s,o,l[1],l[2],l[3],l[4],l[5],l[6],n-p),{x:f.x,y:f.y,alpha:f.alpha}}p+=h,s=+l[5],o=+l[6]}u+=l.shift()+l}return c.end=u,f=t?p:r?c:e.findDotsAtSegment(s,o,l[0],l[1],l[2],l[3],l[4],l[5],1),f.alpha&&(f={x:f.x,y:f.y,alpha:f.alpha}),f}},Ce=Be(1),Se=Be(),Ae=Be(0,1);e.getTotalLength=Ce,e.getPointAtLength=Se,e.getSubpath=function(t,e,r){if(this.getTotalLength(t)-r<1e-6)return Ae(t,e).end;var i=Ae(t,r,1);return e?Ae(i,e).end:i},ye.getTotalLength=function(){var t=this.getPath();if(t)return this.node.getTotalLength?this.node.getTotalLength():Ce(t)},ye.getPointAtLength=function(t){var e=this.getPath();if(e)return Se(e,t)},ye.getPath=function(){var t,r=e._getPath[this.type];if("text"!=this.type&&"set"!=this.type)return r&&(t=r(this)),t},ye.getSubpath=function(t,r){var i=this.getPath();if(i)return e.getSubpath(i,t,r)};var Te=e.easing_formulas={linear:function(t){return t},"<":function(t){return X(t,1.7)},">":function(t){return X(t,.48)},"<>":function(t){var e=.48-t/1.04,r=Y.sqrt(.1734+e*e),i=r-e,n=X(H(i),1/3)*(i<0?-1:1),a=-r-e,s=X(H(a),1/3)*(a<0?-1:1),o=n+s+.5;return 3*(1-o)*o*o+o*o*o},backIn:function(t){var e=1.70158;return t*t*((e+1)*t-e)},backOut:function(t){t-=1;var e=1.70158;return t*t*((e+1)*t+e)+1},elastic:function(t){return t==!!t?t:X(2,-10*t)*Y.sin((t-.075)*(2*U)/.3)+1},bounce:function(t){var e=7.5625,r=2.75,i;return t<1/r?i=e*t*t:t<2/r?(t-=1.5/r,i=e*t*t+.75):t<2.5/r?(t-=2.25/r,i=e*t*t+.9375):(t-=2.625/r,i=e*t*t+.984375),i}};Te.easeIn=Te["ease-in"]=Te["<"],Te.easeOut=Te["ease-out"]=Te[">"],Te.easeInOut=Te["ease-in-out"]=Te["<>"],Te["back-in"]=Te.backIn,Te["back-out"]=Te.backOut;var Ee=[],Me=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){setTimeout(t,16)},Ne=function(){for(var r=+new Date,i=0;i<Ee.length;i++){var n=Ee[i];if(!n.el.removed&&!n.paused){var a=r-n.start,s=n.ms,o=n.easing,l=n.from,h=n.diff,u=n.to,c=n.t,f=n.el,p={},d,g={},v;if(n.initstatus?(a=(n.initstatus*n.anim.top-n.prev)/(n.percent-n.prev)*s,n.status=n.initstatus,delete n.initstatus,n.stop&&Ee.splice(i--,1)):n.status=(n.prev+(n.percent-n.prev)*(a/s))/n.anim.top,!(a<0))if(a<s){var x=o(a/s);for(var y in l)if(l[A](y)){switch(pt[y]){case $:d=+l[y]+x*s*h[y];break;case"colour":d="rgb("+[Le(ot(l[y].r+x*s*h[y].r)),Le(ot(l[y].g+x*s*h[y].g)),Le(ot(l[y].b+x*s*h[y].b))].join(",")+")";break;case"path":d=[];for(var m=0,_=l[y].length;m<_;m++){d[m]=[l[y][m][0]];for(var w=1,k=l[y][m].length;w<k;w++)d[m][w]=+l[y][m][w]+x*s*h[y][m][w];d[m]=d[m].join(j)}d=d.join(j);break;case"transform":if(h[y].real)for(d=[],m=0,_=l[y].length;m<_;m++)for(d[m]=[l[y][m][0]],w=1,k=l[y][m].length;w<k;w++)d[m][w]=l[y][m][w]+x*s*h[y][m][w];else{var B=function(t){return+l[y][t]+x*s*h[y][t]};d=[["m",B(0),B(1),B(2),B(3),B(4),B(5)]]}break;case"csv":if("clip-rect"==y)for(d=[],m=4;m--;)d[m]=+l[y][m]+x*s*h[y][m];break;default:var C=[][P](l[y]);for(d=[],m=f.paper.customAttributes[y].length;m--;)d[m]=+C[m]+x*s*h[y][m]}p[y]=d}f.attr(p),function(e,r,i){setTimeout(function(){t("raphael.anim.frame."+e,r,i)})}(f.id,f,n.anim)}else{if(function(r,i,n){setTimeout(function(){t("raphael.anim.frame."+i.id,i,n),t("raphael.anim.finish."+i.id,i,n),e.is(r,"function")&&r.call(i)})}(n.callback,f,n.anim),f.attr(u),Ee.splice(i--,1),n.repeat>1&&!n.next){for(v in u)u[A](v)&&(g[v]=n.totalOrigin[v]);n.el.attr(g),b(n.anim,n.el,n.anim.percents[0],null,n.totalOrigin,n.repeat-1)}n.next&&!n.stop&&b(n.anim,n.el,n.next,null,n.totalOrigin,n.repeat)}}}Ee.length&&Me(Ne)},Le=function(t){return t>255?255:t<0?0:t};ye.animateWith=function(t,r,i,n,a,s){var o=this;if(o.removed)return s&&s.call(o),o;var l=i instanceof m?i:e.animation(i,n,a,s),h,u;b(l,o,l.percents[0],null,o.attr());for(var c=0,f=Ee.length;c<f;c++)if(Ee[c].anim==r&&Ee[c].el==t){Ee[f-1].start=Ee[c].start;break}return o},ye.onAnimation=function(e){return e?t.on("raphael.anim.frame."+this.id,e):t.unbind("raphael.anim.frame."+this.id),this},m.prototype.delay=function(t){var e=new m(this.anim,this.ms);return e.times=this.times,e.del=+t||0,e},m.prototype.repeat=function(t){var e=new m(this.anim,this.ms);return e.del=this.del,e.times=Y.floor(W(t,0))||1,e},e.animation=function(t,r,i,n){if(t instanceof m)return t;!e.is(i,"function")&&i||(n=n||i||null,i=null),t=Object(t),r=+r||0;var a={},s,o;for(o in t)t[A](o)&&ht(o)!=o&&ht(o)+"%"!=o&&(s=!0,a[o]=t[o]);if(s)return i&&(a.easing=i),n&&(a.callback=n),new m({100:a},r);if(n){var l=0;for(var h in t){var u=ut(h);t[A](h)&&u>l&&(l=u)}l+="%",!t[l].callback&&(t[l].callback=n)}return new m(t,r)},ye.animate=function(t,r,i,n){var a=this;if(a.removed)return n&&n.call(a),a;var s=t instanceof m?t:e.animation(t,r,i,n);return b(s,a,s.percents[0],null,a.attr()),a},ye.setTime=function(t,e){return t&&null!=e&&this.status(t,G(e,t.ms)/t.ms),this},ye.status=function(t,e){var r=[],i=0,n,a;if(null!=e)return b(t,this,-1,G(e,1)),this;for(n=Ee.length;i<n;i++)if(a=Ee[i],a.el.id==this.id&&(!t||a.anim==t)){if(t)return a.status;r.push({anim:a.anim,status:a.status})}return t?0:r},ye.pause=function(e){for(var r=0;r<Ee.length;r++)Ee[r].el.id!=this.id||e&&Ee[r].anim!=e||t("raphael.anim.pause."+this.id,this,Ee[r].anim)!==!1&&(Ee[r].paused=!0);return this},ye.resume=function(e){for(var r=0;r<Ee.length;r++)if(Ee[r].el.id==this.id&&(!e||Ee[r].anim==e)){var i=Ee[r];t("raphael.anim.resume."+this.id,this,i.anim)!==!1&&(delete i.paused,this.status(i.anim,i.status))}return this},ye.stop=function(e){for(var r=0;r<Ee.length;r++)Ee[r].el.id!=this.id||e&&Ee[r].anim!=e||t("raphael.anim.stop."+this.id,this,Ee[r].anim)!==!1&&Ee.splice(r--,1);return this},t.on("raphael.remove",_),t.on("raphael.clear",_),ye.toString=function(){return"Raphaël’s object"};var ze=function(t){if(this.items=[],this.length=0,this.type="set",t)for(var e=0,r=t.length;e<r;e++)!t[e]||t[e].constructor!=ye.constructor&&t[e].constructor!=ze||(this[this.items.length]=this.items[this.items.length]=t[e],this.length++)},Pe=ze.prototype;Pe.push=function(){for(var t,e,r=0,i=arguments.length;r<i;r++)t=arguments[r],!t||t.constructor!=ye.constructor&&t.constructor!=ze||(e=this.items.length,this[e]=this.items[e]=t,this.length++);return this},Pe.pop=function(){return this.length&&delete this[this.length--],this.items.pop()},Pe.forEach=function(t,e){for(var r=0,i=this.items.length;r<i;r++)if(t.call(e,this.items[r],r)===!1)return this;return this};for(var Fe in ye)ye[A](Fe)&&(Pe[Fe]=function(t){return function(){var e=arguments;return this.forEach(function(r){r[t][z](r,e)})}}(Fe));return Pe.attr=function(t,r){if(t&&e.is(t,Q)&&e.is(t[0],"object"))for(var i=0,n=t.length;i<n;i++)this.items[i].attr(t[i]);else for(var a=0,s=this.items.length;a<s;a++)this.items[a].attr(t,r);return this},Pe.clear=function(){for(;this.length;)this.pop()},Pe.splice=function(t,e,r){t=t<0?W(this.length+t,0):t,e=W(0,G(this.length-t,e));var i=[],n=[],a=[],s;for(s=2;s<arguments.length;s++)a.push(arguments[s]);for(s=0;s<e;s++)n.push(this[t+s]);for(;s<this.length-t;s++)i.push(this[t+s]);var o=a.length;for(s=0;s<o+i.length;s++)this.items[t+s]=this[t+s]=s<o?a[s]:i[s-o];for(s=this.items.length=this.length-=e-o;this[s];)delete this[s++];return new ze(n)},Pe.exclude=function(t){for(var e=0,r=this.length;e<r;e++)if(this[e]==t)return this.splice(e,1),!0},Pe.animate=function(t,r,i,n){(e.is(i,"function")||!i)&&(n=i||null);var a=this.items.length,s=a,o,l=this,h;if(!a)return this;n&&(h=function(){!--a&&n.call(l)}),i=e.is(i,Z)?i:h;var u=e.animation(t,r,i,h);for(o=this.items[--s].animate(u);s--;)this.items[s]&&!this.items[s].removed&&this.items[s].animateWith(o,u,u),this.items[s]&&!this.items[s].removed||a--;return this},Pe.insertAfter=function(t){for(var e=this.items.length;e--;)this.items[e].insertAfter(t);return this},Pe.getBBox=function(){for(var t=[],e=[],r=[],i=[],n=this.items.length;n--;)if(!this.items[n].removed){var a=this.items[n].getBBox();t.push(a.x),e.push(a.y),r.push(a.x+a.width),i.push(a.y+a.height)}return t=G[z](0,t),e=G[z](0,e),r=W[z](0,r),i=W[z](0,i),{x:t,y:e,x2:r,y2:i,width:r-t,height:i-e}},Pe.clone=function(t){t=this.paper.set();for(var e=0,r=this.items.length;e<r;e++)t.push(this.items[e].clone());return t},Pe.toString=function(){return"Raphaël‘s set"},Pe.glow=function(t){var e=this.paper.set();return this.forEach(function(r,i){var n=r.glow(t);null!=n&&n.forEach(function(t,r){e.push(t)})}),e},Pe.isPointInside=function(t,e){var r=!1;return this.forEach(function(i){if(i.isPointInside(t,e))return r=!0,!1}),r},e.registerFont=function(t){if(!t.face)return t;this.fonts=this.fonts||{};var e={w:t.w,face:{},glyphs:{}},r=t.face["font-family"];for(var i in t.face)t.face[A](i)&&(e.face[i]=t.face[i]);if(this.fonts[r]?this.fonts[r].push(e):this.fonts[r]=[e],!t.svg){e.face["units-per-em"]=ut(t.face["units-per-em"],10);for(var n in t.glyphs)if(t.glyphs[A](n)){var a=t.glyphs[n];if(e.glyphs[n]={w:a.w,k:{},d:a.d&&"M"+a.d.replace(/[mlcxtrv]/g,function(t){return{l:"L",c:"C",x:"z",t:"m",r:"l",v:"c"}[t]||"M"})+"z"},a.k)for(var s in a.k)a[A](s)&&(e.glyphs[n].k[s]=a.k[s])}}return t},N.getFont=function(t,r,i,n){if(n=n||"normal",i=i||"normal",r=+r||{normal:400,bold:700,lighter:300,bolder:800}[r]||400,e.fonts){var a=e.fonts[t];if(!a){var s=new RegExp("(^|\\s)"+t.replace(/[^\w\d\s+!~.:_-]/g,R)+"(\\s|$)","i");for(var o in e.fonts)if(e.fonts[A](o)&&s.test(o)){a=e.fonts[o];break}}var l;if(a)for(var h=0,u=a.length;h<u&&(l=a[h],l.face["font-weight"]!=r||l.face["font-style"]!=i&&l.face["font-style"]||l.face["font-stretch"]!=n);h++);return l}},N.print=function(t,r,i,n,a,s,o,l){s=s||"middle",o=W(G(o||0,1),-1),l=W(G(l||1,3),1);var h=I(i)[q](R),u=0,c=0,f=R,p;if(e.is(n,"string")&&(n=this.getFont(n)),n){p=(a||16)/n.face["units-per-em"];for(var d=n.face.bbox[q](k),g=+d[0],v=d[3]-d[1],x=0,y=+d[1]+("baseline"==s?v+ +n.face.descent:v/2),m=0,b=h.length;m<b;m++){if("\n"==h[m])u=0,w=0,c=0,x+=v*l;else{var _=c&&n.glyphs[h[m-1]]||{},w=n.glyphs[h[m]];u+=c?(_.w||n.w)+(_.k&&_.k[h[m]]||0)+n.w*o:0,c=1}w&&w.d&&(f+=e.transformPath(w.d,["t",u*p,x*p,"s",p,p,g,y,"t",(t-g)/p,(r-y)/p]))}}return this.path(f).attr({fill:"#000",stroke:"none"})},N.add=function(t){if(e.is(t,"array"))for(var r=this.set(),i=0,n=t.length,a;i<n;i++)a=t[i]||{},B[A](a.type)&&r.push(this[a.type]().attr(a));return r},e.format=function(t,r){var i=e.is(r,Q)?[0][P](r):arguments;return t&&e.is(t,Z)&&i.length-1&&(t=t.replace(C,function(t,e){return null==i[++e]?R:i[e]})),t||R},e.fullfill=function(){var t=/\{([^\}]+)\}/g,e=/(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g,r=function(t,r,i){var n=i;return r.replace(e,function(t,e,r,i,a){e=e||i,n&&(e in n&&(n=n[e]),"function"==typeof n&&a&&(n=n()))}),n=(null==n||n==i?t:n)+""};return function(e,i){return String(e).replace(t,function(t,e){return r(t,e,i)})}}(),e.ninja=function(){if(E.was)T.win.Raphael=E.is;else{window.Raphael=void 0;try{delete window.Raphael}catch(t){}}return e},e.st=Pe,t.on("raphael.DOMload",function(){w=!0}),function(t,r,i){function n(){/in/.test(t.readyState)?setTimeout(n,9):e.eve("raphael.DOMload")}null==t.readyState&&t.addEventListener&&(t.addEventListener(r,i=function(){t.removeEventListener(r,i,!1),t.readyState="complete"},!1),t.readyState="loading"),n()}(document,"DOMContentLoaded"),e}.apply(e,i),!(void 0!==n&&(t.exports=n))},function(t,e,r){var i,n;!function(r){var a="0.5.0",s="hasOwnProperty",o=/[\.\/]/,l=/\s*,\s*/,h="*",u=function(){},c=function(t,e){return t-e},f,p,d={n:{}},g=function(){for(var t=0,e=this.length;t<e;t++)if("undefined"!=typeof this[t])return this[t]},v=function(){for(var t=this.length;--t;)if("undefined"!=typeof this[t])return this[t]},x=Object.prototype.toString,y=String,m=Array.isArray||function(t){return t instanceof Array||"[object Array]"==x.call(t)};eve=function(t,e){var r=d,i=p,n=Array.prototype.slice.call(arguments,2),a=eve.listeners(t),s=0,o=!1,l,h=[],u={},x=[],y=f,m=[];x.firstDefined=g,x.lastDefined=v,f=t,p=0;for(var b=0,_=a.length;b<_;b++)"zIndex"in a[b]&&(h.push(a[b].zIndex),a[b].zIndex<0&&(u[a[b].zIndex]=a[b]));for(h.sort(c);h[s]<0;)if(l=u[h[s++]],x.push(l.apply(e,n)),p)return p=i,x;for(b=0;b<_;b++)if(l=a[b],"zIndex"in l)if(l.zIndex==h[s]){if(x.push(l.apply(e,n)),p)break;do if(s++,l=u[h[s]],l&&x.push(l.apply(e,n)),p)break;while(l)}else u[l.zIndex]=l;else if(x.push(l.apply(e,n)),p)break;return p=i,f=y,x},eve._events=d,eve.listeners=function(t){var e=m(t)?t:t.split(o),r=d,i,n,a,s,l,u,c,f,p=[r],g=[];for(s=0,l=e.length;s<l;s++){for(f=[],u=0,c=p.length;u<c;u++)for(r=p[u].n,n=[r[e[s]],r[h]],a=2;a--;)i=n[a],i&&(f.push(i),g=g.concat(i.f||[]));p=f}return g},eve.separator=function(t){t?(t=y(t).replace(/(?=[\.\^\]\[\-])/g,"\\"),t="["+t+"]",o=new RegExp(t)):o=/[\.\/]/},eve.on=function(t,e){if("function"!=typeof e)return function(){};for(var r=m(t)?m(t[0])?t:[t]:y(t).split(l),i=0,n=r.length;i<n;i++)!function(t){for(var r=m(t)?t:y(t).split(o),i=d,n,a=0,s=r.length;a<s;a++)i=i.n,i=i.hasOwnProperty(r[a])&&i[r[a]]||(i[r[a]]={n:{}});for(i.f=i.f||[],a=0,s=i.f.length;a<s;a++)if(i.f[a]==e){n=!0;break}!n&&i.f.push(e)}(r[i]);return function(t){+t==+t&&(e.zIndex=+t)}},eve.f=function(t){var e=[].slice.call(arguments,1);return function(){eve.apply(null,[t,null].concat(e).concat([].slice.call(arguments,0)))}},eve.stop=function(){p=1},eve.nt=function(t){var e=m(f)?f.join("."):f;return t?new RegExp("(?:\\.|\\/|^)"+t+"(?:\\.|\\/|$)").test(e):e},eve.nts=function(){return m(f)?f:f.split(o)},eve.off=eve.unbind=function(t,e){if(!t)return void(eve._events=d={n:{}});var r=m(t)?m(t[0])?t:[t]:y(t).split(l);if(r.length>1)for(var i=0,n=r.length;i<n;i++)eve.off(r[i],e);else{r=m(t)?t:y(t).split(o);var a,u,c,i,n,f,p,g=[d];for(i=0,n=r.length;i<n;i++)for(f=0;f<g.length;f+=c.length-2){if(c=[f,1],a=g[f].n,r[i]!=h)a[r[i]]&&c.push(a[r[i]]);else for(u in a)a[s](u)&&c.push(a[u]);g.splice.apply(g,c)}for(i=0,n=g.length;i<n;i++)for(a=g[i];a.n;){if(e){if(a.f){for(f=0,p=a.f.length;f<p;f++)if(a.f[f]==e){a.f.splice(f,1);break}!a.f.length&&delete a.f}for(u in a.n)if(a.n[s](u)&&a.n[u].f){var v=a.n[u].f;for(f=0,p=v.length;f<p;f++)if(v[f]==e){v.splice(f,1);break}!v.length&&delete a.n[u].f}}else{delete a.f;for(u in a.n)a.n[s](u)&&a.n[u].f&&delete a.n[u].f}a=a.n}}},eve.once=function(t,e){var r=function(){return eve.off(t,r),e.apply(this,arguments)};return eve.on(t,r)},eve.version=a,eve.toString=function(){return"You are running Eve "+a},"undefined"!=typeof t&&t.exports?t.exports=eve:(i=[],n=function(){return eve}.apply(e,i),!(void 0!==n&&(t.exports=n)))}(this)},function(t,e,r){var i,n;i=[r(1)],n=function(t){if(!t||t.svg){var e="hasOwnProperty",r=String,i=parseFloat,n=parseInt,a=Math,s=a.max,o=a.abs,l=a.pow,h=/[, ]+/,u=t.eve,c="",f=" ",p="http://www.w3.org/1999/xlink",d={block:"M5,0 0,2.5 5,5z",classic:"M5,0 0,2.5 5,5 3.5,3 3.5,2z",diamond:"M2.5,0 5,2.5 2.5,5 0,2.5z",open:"M6,1 1,3.5 6,6",oval:"M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"},g={};t.toString=function(){return"Your browser supports SVG.\nYou are running Raphaël "+this.version};var v=function(i,n){if(n){"string"==typeof i&&(i=v(i));for(var a in n)n[e](a)&&("xlink:"==a.substring(0,6)?i.setAttributeNS(p,a.substring(6),r(n[a])):i.setAttribute(a,r(n[a])))}else i=t._g.doc.createElementNS("http://www.w3.org/2000/svg",i),i.style&&(i.style.webkitTapHighlightColor="rgba(0,0,0,0)");return i},x=function(e,n){var h="linear",u=e.id+n,f=.5,p=.5,d=e.node,g=e.paper,x=d.style,y=t._g.doc.getElementById(u);if(!y){if(n=r(n).replace(t._radial_gradient,function(t,e,r){if(h="radial",e&&r){f=i(e),p=i(r);var n=2*(p>.5)-1;l(f-.5,2)+l(p-.5,2)>.25&&(p=a.sqrt(.25-l(f-.5,2))*n+.5)&&.5!=p&&(p=p.toFixed(5)-1e-5*n)}return c}),n=n.split(/\s*\-\s*/),"linear"==h){var b=n.shift();if(b=-i(b),isNaN(b))return null;var _=[0,0,a.cos(t.rad(b)),a.sin(t.rad(b))],w=1/(s(o(_[2]),o(_[3]))||1);_[2]*=w,_[3]*=w,_[2]<0&&(_[0]=-_[2],_[2]=0),_[3]<0&&(_[1]=-_[3],_[3]=0)}var k=t._parseDots(n);if(!k)return null;if(u=u.replace(/[\(\)\s,\xb0#]/g,"_"),e.gradient&&u!=e.gradient.id&&(g.defs.removeChild(e.gradient),delete e.gradient),!e.gradient){y=v(h+"Gradient",{id:u}),e.gradient=y,v(y,"radial"==h?{fx:f,fy:p}:{x1:_[0],y1:_[1],x2:_[2],y2:_[3],gradientTransform:e.matrix.invert()}),g.defs.appendChild(y);for(var B=0,C=k.length;B<C;B++)y.appendChild(v("stop",{offset:k[B].offset?k[B].offset:B?"100%":"0%","stop-color":k[B].color||"#fff","stop-opacity":isFinite(k[B].opacity)?k[B].opacity:1}))}}return v(d,{fill:m(u),opacity:1,"fill-opacity":1}),x.fill=c,x.opacity=1,x.fillOpacity=1,1},y=function(){var t=document.documentMode;return t&&(9===t||10===t)},m=function(t){if(y())return"url('#"+t+"')";var e=document.location,r=e.protocol+"//"+e.host+e.pathname+e.search;return"url('"+r+"#"+t+"')"},b=function(t){var e=t.getBBox(1);v(t.pattern,{patternTransform:t.matrix.invert()+" translate("+e.x+","+e.y+")"})},_=function(i,n,a){if("path"==i.type){for(var s=r(n).toLowerCase().split("-"),o=i.paper,l=a?"end":"start",h=i.node,u=i.attrs,f=u["stroke-width"],p=s.length,x="classic",y,m,b,_,w,k=3,B=3,C=5;p--;)switch(s[p]){case"block":case"classic":case"oval":case"diamond":case"open":case"none":x=s[p];break;case"wide":B=5;break;case"narrow":B=2;break;case"long":k=5;break;case"short":k=2}if("open"==x?(k+=2,B+=2,C+=2,b=1,_=a?4:1,w={fill:"none",stroke:u.stroke}):(_=b=k/2,w={fill:u.stroke,stroke:"none"}),i._.arrows?a?(i._.arrows.endPath&&g[i._.arrows.endPath]--,i._.arrows.endMarker&&g[i._.arrows.endMarker]--):(i._.arrows.startPath&&g[i._.arrows.startPath]--,i._.arrows.startMarker&&g[i._.arrows.startMarker]--):i._.arrows={},"none"!=x){var S="raphael-marker-"+x,A="raphael-marker-"+l+x+k+B+"-obj"+i.id;t._g.doc.getElementById(S)?g[S]++:(o.defs.appendChild(v(v("path"),{"stroke-linecap":"round",d:d[x],id:S})),g[S]=1);var T=t._g.doc.getElementById(A),E;T?(g[A]++,E=T.getElementsByTagName("use")[0]):(T=v(v("marker"),{id:A,markerHeight:B,markerWidth:k,orient:"auto",refX:_,refY:B/2}),E=v(v("use"),{"xlink:href":"#"+S,transform:(a?"rotate(180 "+k/2+" "+B/2+") ":c)+"scale("+k/C+","+B/C+")","stroke-width":(1/((k/C+B/C)/2)).toFixed(4)}),T.appendChild(E),o.defs.appendChild(T),g[A]=1),v(E,w);var M=b*("diamond"!=x&&"oval"!=x);a?(y=i._.arrows.startdx*f||0,m=t.getTotalLength(u.path)-M*f):(y=M*f,m=t.getTotalLength(u.path)-(i._.arrows.enddx*f||0)),w={},w["marker-"+l]="url(#"+A+")",(m||y)&&(w.d=t.getSubpath(u.path,y,m)),v(h,w),i._.arrows[l+"Path"]=S,i._.arrows[l+"Marker"]=A,i._.arrows[l+"dx"]=M,i._.arrows[l+"Type"]=x,i._.arrows[l+"String"]=n}else a?(y=i._.arrows.startdx*f||0,m=t.getTotalLength(u.path)-y):(y=0,m=t.getTotalLength(u.path)-(i._.arrows.enddx*f||0)),i._.arrows[l+"Path"]&&v(h,{d:t.getSubpath(u.path,y,m)}),delete i._.arrows[l+"Path"],delete i._.arrows[l+"Marker"],delete i._.arrows[l+"dx"],delete i._.arrows[l+"Type"],delete i._.arrows[l+"String"];for(w in g)if(g[e](w)&&!g[w]){var N=t._g.doc.getElementById(w);N&&N.parentNode.removeChild(N)}}},w={"-":[3,1],".":[1,1],"-.":[3,1,1,1],"-..":[3,1,1,1,1,1],". ":[1,3],"- ":[4,3],"--":[8,3],"- .":[4,3,1,3],"--.":[8,3,1,3],"--..":[8,3,1,3,1,3]},k=function(t,e,i){if(e=w[r(e).toLowerCase()]){for(var n=t.attrs["stroke-width"]||"1",a={round:n,square:n,butt:0}[t.attrs["stroke-linecap"]||i["stroke-linecap"]]||0,s=[],o=e.length;o--;)s[o]=e[o]*n+(o%2?1:-1)*a;v(t.node,{"stroke-dasharray":s.join(",")})}else v(t.node,{"stroke-dasharray":"none"})},B=function(i,a){var l=i.node,u=i.attrs,f=l.style.visibility;l.style.visibility="hidden";for(var d in a)if(a[e](d)){if(!t._availableAttrs[e](d))continue;var g=a[d];switch(u[d]=g,d){case"blur":i.blur(g);break;case"title":var y=l.getElementsByTagName("title");if(y.length&&(y=y[0]))y.firstChild.nodeValue=g;else{y=v("title");var m=t._g.doc.createTextNode(g);y.appendChild(m),l.appendChild(y)}break;case"href":case"target":var w=l.parentNode;if("a"!=w.tagName.toLowerCase()){var B=v("a");w.insertBefore(B,l),B.appendChild(l),w=B}"target"==d?w.setAttributeNS(p,"show","blank"==g?"new":g):w.setAttributeNS(p,d,g);break;case"cursor":l.style.cursor=g;break;case"transform":i.transform(g);break;case"arrow-start":_(i,g);break;case"arrow-end":_(i,g,1);break;case"clip-rect":var C=r(g).split(h);if(4==C.length){i.clip&&i.clip.parentNode.parentNode.removeChild(i.clip.parentNode);var A=v("clipPath"),T=v("rect");A.id=t.createUUID(),v(T,{x:C[0],y:C[1],width:C[2],height:C[3]}),A.appendChild(T),i.paper.defs.appendChild(A),v(l,{"clip-path":"url(#"+A.id+")"}),i.clip=T}if(!g){var E=l.getAttribute("clip-path");if(E){var M=t._g.doc.getElementById(E.replace(/(^url\(#|\)$)/g,c));M&&M.parentNode.removeChild(M),v(l,{"clip-path":c}),delete i.clip}}break;case"path":"path"==i.type&&(v(l,{d:g?u.path=t._pathToAbsolute(g):"M0,0"}),i._.dirty=1,i._.arrows&&("startString"in i._.arrows&&_(i,i._.arrows.startString),"endString"in i._.arrows&&_(i,i._.arrows.endString,1)));break;case"width":if(l.setAttribute(d,g),i._.dirty=1,!u.fx)break;d="x",g=u.x;case"x":u.fx&&(g=-u.x-(u.width||0));case"rx":if("rx"==d&&"rect"==i.type)break;case"cx":l.setAttribute(d,g),i.pattern&&b(i),i._.dirty=1;break;case"height":if(l.setAttribute(d,g),i._.dirty=1,!u.fy)break;d="y",g=u.y;case"y":u.fy&&(g=-u.y-(u.height||0));case"ry":if("ry"==d&&"rect"==i.type)break;case"cy":l.setAttribute(d,g),i.pattern&&b(i),i._.dirty=1;break;case"r":"rect"==i.type?v(l,{rx:g,ry:g}):l.setAttribute(d,g),i._.dirty=1;break;case"src":"image"==i.type&&l.setAttributeNS(p,"href",g);break;case"stroke-width":1==i._.sx&&1==i._.sy||(g/=s(o(i._.sx),o(i._.sy))||1),l.setAttribute(d,g),u["stroke-dasharray"]&&k(i,u["stroke-dasharray"],a),
i._.arrows&&("startString"in i._.arrows&&_(i,i._.arrows.startString),"endString"in i._.arrows&&_(i,i._.arrows.endString,1));break;case"stroke-dasharray":k(i,g,a);break;case"fill":var N=r(g).match(t._ISURL);if(N){A=v("pattern");var L=v("image");A.id=t.createUUID(),v(A,{x:0,y:0,patternUnits:"userSpaceOnUse",height:1,width:1}),v(L,{x:0,y:0,"xlink:href":N[1]}),A.appendChild(L),function(e){t._preload(N[1],function(){var t=this.offsetWidth,r=this.offsetHeight;v(e,{width:t,height:r}),v(L,{width:t,height:r})})}(A),i.paper.defs.appendChild(A),v(l,{fill:"url(#"+A.id+")"}),i.pattern=A,i.pattern&&b(i);break}var z=t.getRGB(g);if(z.error){if(("circle"==i.type||"ellipse"==i.type||"r"!=r(g).charAt())&&x(i,g)){if("opacity"in u||"fill-opacity"in u){var P=t._g.doc.getElementById(l.getAttribute("fill").replace(/^url\(#|\)$/g,c));if(P){var F=P.getElementsByTagName("stop");v(F[F.length-1],{"stop-opacity":("opacity"in u?u.opacity:1)*("fill-opacity"in u?u["fill-opacity"]:1)})}}u.gradient=g,u.fill="none";break}}else delete a.gradient,delete u.gradient,!t.is(u.opacity,"undefined")&&t.is(a.opacity,"undefined")&&v(l,{opacity:u.opacity}),!t.is(u["fill-opacity"],"undefined")&&t.is(a["fill-opacity"],"undefined")&&v(l,{"fill-opacity":u["fill-opacity"]});z[e]("opacity")&&v(l,{"fill-opacity":z.opacity>1?z.opacity/100:z.opacity});case"stroke":z=t.getRGB(g),l.setAttribute(d,z.hex),"stroke"==d&&z[e]("opacity")&&v(l,{"stroke-opacity":z.opacity>1?z.opacity/100:z.opacity}),"stroke"==d&&i._.arrows&&("startString"in i._.arrows&&_(i,i._.arrows.startString),"endString"in i._.arrows&&_(i,i._.arrows.endString,1));break;case"gradient":("circle"==i.type||"ellipse"==i.type||"r"!=r(g).charAt())&&x(i,g);break;case"opacity":u.gradient&&!u[e]("stroke-opacity")&&v(l,{"stroke-opacity":g>1?g/100:g});case"fill-opacity":if(u.gradient){P=t._g.doc.getElementById(l.getAttribute("fill").replace(/^url\(#|\)$/g,c)),P&&(F=P.getElementsByTagName("stop"),v(F[F.length-1],{"stop-opacity":g}));break}default:"font-size"==d&&(g=n(g,10)+"px");var R=d.replace(/(\-.)/g,function(t){return t.substring(1).toUpperCase()});l.style[R]=g,i._.dirty=1,l.setAttribute(d,g)}}S(i,a),l.style.visibility=f},C=1.2,S=function(i,a){if("text"==i.type&&(a[e]("text")||a[e]("font")||a[e]("font-size")||a[e]("x")||a[e]("y"))){var s=i.attrs,o=i.node,l=o.firstChild?n(t._g.doc.defaultView.getComputedStyle(o.firstChild,c).getPropertyValue("font-size"),10):10;if(a[e]("text")){for(s.text=a.text;o.firstChild;)o.removeChild(o.firstChild);for(var h=r(a.text).split("\n"),u=[],f,p=0,d=h.length;p<d;p++)f=v("tspan"),p&&v(f,{dy:l*C,x:s.x}),f.appendChild(t._g.doc.createTextNode(h[p])),o.appendChild(f),u[p]=f}else for(u=o.getElementsByTagName("tspan"),p=0,d=u.length;p<d;p++)p?v(u[p],{dy:l*C,x:s.x}):v(u[0],{dy:0});v(o,{x:s.x,y:s.y}),i._.dirty=1;var g=i._getBBox(),x=s.y-(g.y+g.height/2);x&&t.is(x,"finite")&&v(u[0],{dy:x})}},A=function(t){return t.parentNode&&"a"===t.parentNode.tagName.toLowerCase()?t.parentNode:t},T=function(e,r){function i(){return("0000"+(Math.random()*Math.pow(36,5)<<0).toString(36)).slice(-5)}var n=0,a=0;this[0]=this.node=e,e.raphael=!0,this.id=i(),e.raphaelid=this.id,this.matrix=t.matrix(),this.realPath=null,this.paper=r,this.attrs=this.attrs||{},this._={transform:[],sx:1,sy:1,deg:0,dx:0,dy:0,dirty:1},!r.bottom&&(r.bottom=this),this.prev=r.top,r.top&&(r.top.next=this),r.top=this,this.next=null},E=t.el;T.prototype=E,E.constructor=T,t._engine.path=function(t,e){var r=v("path");e.canvas&&e.canvas.appendChild(r);var i=new T(r,e);return i.type="path",B(i,{fill:"none",stroke:"#000",path:t}),i},E.rotate=function(t,e,n){if(this.removed)return this;if(t=r(t).split(h),t.length-1&&(e=i(t[1]),n=i(t[2])),t=i(t[0]),null==n&&(e=n),null==e||null==n){var a=this.getBBox(1);e=a.x+a.width/2,n=a.y+a.height/2}return this.transform(this._.transform.concat([["r",t,e,n]])),this},E.scale=function(t,e,n,a){if(this.removed)return this;if(t=r(t).split(h),t.length-1&&(e=i(t[1]),n=i(t[2]),a=i(t[3])),t=i(t[0]),null==e&&(e=t),null==a&&(n=a),null==n||null==a)var s=this.getBBox(1);return n=null==n?s.x+s.width/2:n,a=null==a?s.y+s.height/2:a,this.transform(this._.transform.concat([["s",t,e,n,a]])),this},E.translate=function(t,e){return this.removed?this:(t=r(t).split(h),t.length-1&&(e=i(t[1])),t=i(t[0])||0,e=+e||0,this.transform(this._.transform.concat([["t",t,e]])),this)},E.transform=function(r){var i=this._;if(null==r)return i.transform;if(t._extractTransform(this,r),this.clip&&v(this.clip,{transform:this.matrix.invert()}),this.pattern&&b(this),this.node&&v(this.node,{transform:this.matrix}),1!=i.sx||1!=i.sy){var n=this.attrs[e]("stroke-width")?this.attrs["stroke-width"]:1;this.attr({"stroke-width":n})}return this},E.hide=function(){return this.removed||(this.node.style.display="none"),this},E.show=function(){return this.removed||(this.node.style.display=""),this},E.remove=function(){var e=A(this.node);if(!this.removed&&e.parentNode){var r=this.paper;r.__set__&&r.__set__.exclude(this),u.unbind("raphael.*.*."+this.id),this.gradient&&r.defs.removeChild(this.gradient),t._tear(this,r),e.parentNode.removeChild(e),this.removeData();for(var i in this)this[i]="function"==typeof this[i]?t._removedFactory(i):null;this.removed=!0}},E._getBBox=function(){if("none"==this.node.style.display){this.show();var t=!0}var e=!1,r;this.paper.canvas.parentElement?r=this.paper.canvas.parentElement.style:this.paper.canvas.parentNode&&(r=this.paper.canvas.parentNode.style),r&&"none"==r.display&&(e=!0,r.display="");var i={};try{i=this.node.getBBox()}catch(n){i={x:this.node.clientLeft,y:this.node.clientTop,width:this.node.clientWidth,height:this.node.clientHeight}}finally{i=i||{},e&&(r.display="none")}return t&&this.hide(),i},E.attr=function(r,i){if(this.removed)return this;if(null==r){var n={};for(var a in this.attrs)this.attrs[e](a)&&(n[a]=this.attrs[a]);return n.gradient&&"none"==n.fill&&(n.fill=n.gradient)&&delete n.gradient,n.transform=this._.transform,n}if(null==i&&t.is(r,"string")){if("fill"==r&&"none"==this.attrs.fill&&this.attrs.gradient)return this.attrs.gradient;if("transform"==r)return this._.transform;for(var s=r.split(h),o={},l=0,c=s.length;l<c;l++)r=s[l],r in this.attrs?o[r]=this.attrs[r]:t.is(this.paper.customAttributes[r],"function")?o[r]=this.paper.customAttributes[r].def:o[r]=t._availableAttrs[r];return c-1?o:o[s[0]]}if(null==i&&t.is(r,"array")){for(o={},l=0,c=r.length;l<c;l++)o[r[l]]=this.attr(r[l]);return o}if(null!=i){var f={};f[r]=i}else null!=r&&t.is(r,"object")&&(f=r);for(var p in f)u("raphael.attr."+p+"."+this.id,this,f[p]);for(p in this.paper.customAttributes)if(this.paper.customAttributes[e](p)&&f[e](p)&&t.is(this.paper.customAttributes[p],"function")){var d=this.paper.customAttributes[p].apply(this,[].concat(f[p]));this.attrs[p]=f[p];for(var g in d)d[e](g)&&(f[g]=d[g])}return B(this,f),this},E.toFront=function(){if(this.removed)return this;var e=A(this.node);e.parentNode.appendChild(e);var r=this.paper;return r.top!=this&&t._tofront(this,r),this},E.toBack=function(){if(this.removed)return this;var e=A(this.node),r=e.parentNode;r.insertBefore(e,r.firstChild),t._toback(this,this.paper);var i=this.paper;return this},E.insertAfter=function(e){if(this.removed||!e)return this;var r=A(this.node),i=A(e.node||e[e.length-1].node);return i.nextSibling?i.parentNode.insertBefore(r,i.nextSibling):i.parentNode.appendChild(r),t._insertafter(this,e,this.paper),this},E.insertBefore=function(e){if(this.removed||!e)return this;var r=A(this.node),i=A(e.node||e[0].node);return i.parentNode.insertBefore(r,i),t._insertbefore(this,e,this.paper),this},E.blur=function(e){var r=this;if(0!==+e){var i=v("filter"),n=v("feGaussianBlur");r.attrs.blur=e,i.id=t.createUUID(),v(n,{stdDeviation:+e||1.5}),i.appendChild(n),r.paper.defs.appendChild(i),r._blur=i,v(r.node,{filter:"url(#"+i.id+")"})}else r._blur&&(r._blur.parentNode.removeChild(r._blur),delete r._blur,delete r.attrs.blur),r.node.removeAttribute("filter");return r},t._engine.circle=function(t,e,r,i){var n=v("circle");t.canvas&&t.canvas.appendChild(n);var a=new T(n,t);return a.attrs={cx:e,cy:r,r:i,fill:"none",stroke:"#000"},a.type="circle",v(n,a.attrs),a},t._engine.rect=function(t,e,r,i,n,a){var s=v("rect");t.canvas&&t.canvas.appendChild(s);var o=new T(s,t);return o.attrs={x:e,y:r,width:i,height:n,rx:a||0,ry:a||0,fill:"none",stroke:"#000"},o.type="rect",v(s,o.attrs),o},t._engine.ellipse=function(t,e,r,i,n){var a=v("ellipse");t.canvas&&t.canvas.appendChild(a);var s=new T(a,t);return s.attrs={cx:e,cy:r,rx:i,ry:n,fill:"none",stroke:"#000"},s.type="ellipse",v(a,s.attrs),s},t._engine.image=function(t,e,r,i,n,a){var s=v("image");v(s,{x:r,y:i,width:n,height:a,preserveAspectRatio:"none"}),s.setAttributeNS(p,"href",e),t.canvas&&t.canvas.appendChild(s);var o=new T(s,t);return o.attrs={x:r,y:i,width:n,height:a,src:e},o.type="image",o},t._engine.text=function(e,r,i,n){var a=v("text");e.canvas&&e.canvas.appendChild(a);var s=new T(a,e);return s.attrs={x:r,y:i,"text-anchor":"middle",text:n,"font-family":t._availableAttrs["font-family"],"font-size":t._availableAttrs["font-size"],stroke:"none",fill:"#000"},s.type="text",B(s,s.attrs),s},t._engine.setSize=function(t,e){return this.width=t||this.width,this.height=e||this.height,this.canvas.setAttribute("width",this.width),this.canvas.setAttribute("height",this.height),this._viewBox&&this.setViewBox.apply(this,this._viewBox),this},t._engine.create=function(){var e=t._getContainer.apply(0,arguments),r=e&&e.container,i=e.x,n=e.y,a=e.width,s=e.height;if(!r)throw new Error("SVG container not found.");var o=v("svg"),l="overflow:hidden;",h;return i=i||0,n=n||0,a=a||512,s=s||342,v(o,{height:s,version:1.1,width:a,xmlns:"http://www.w3.org/2000/svg","xmlns:xlink":"http://www.w3.org/1999/xlink"}),1==r?(o.style.cssText=l+"position:absolute;left:"+i+"px;top:"+n+"px",t._g.doc.body.appendChild(o),h=1):(o.style.cssText=l+"position:relative",r.firstChild?r.insertBefore(o,r.firstChild):r.appendChild(o)),r=new t._Paper,r.width=a,r.height=s,r.canvas=o,r.clear(),r._left=r._top=0,h&&(r.renderfix=function(){}),r.renderfix(),r},t._engine.setViewBox=function(t,e,r,i,n){u("raphael.setViewBox",this,this._viewBox,[t,e,r,i,n]);var a=this.getSize(),o=s(r/a.width,i/a.height),l=this.top,h=n?"xMidYMid meet":"xMinYMin",c,p;for(null==t?(this._vbSize&&(o=1),delete this._vbSize,c="0 0 "+this.width+f+this.height):(this._vbSize=o,c=t+f+e+f+r+f+i),v(this.canvas,{viewBox:c,preserveAspectRatio:h});o&&l;)p="stroke-width"in l.attrs?l.attrs["stroke-width"]:1,l.attr({"stroke-width":p}),l._.dirty=1,l._.dirtyT=1,l=l.prev;return this._viewBox=[t,e,r,i,!!n],this},t.prototype.renderfix=function(){var t=this.canvas,e=t.style,r;try{r=t.getScreenCTM()||t.createSVGMatrix()}catch(i){r=t.createSVGMatrix()}var n=-r.e%1,a=-r.f%1;(n||a)&&(n&&(this._left=(this._left+n)%1,e.left=this._left+"px"),a&&(this._top=(this._top+a)%1,e.top=this._top+"px"))},t.prototype.clear=function(){t.eve("raphael.clear",this);for(var e=this.canvas;e.firstChild;)e.removeChild(e.firstChild);this.bottom=this.top=null,(this.desc=v("desc")).appendChild(t._g.doc.createTextNode("Created with Raphaël "+t.version)),e.appendChild(this.desc),e.appendChild(this.defs=v("defs"))},t.prototype.remove=function(){u("raphael.remove",this),this.canvas.parentNode&&this.canvas.parentNode.removeChild(this.canvas);for(var e in this)this[e]="function"==typeof this[e]?t._removedFactory(e):null};var M=t.st;for(var N in E)E[e](N)&&!M[e](N)&&(M[N]=function(t){return function(){var e=arguments;return this.forEach(function(r){r[t].apply(r,e)})}}(N))}}.apply(e,i),!(void 0!==n&&(t.exports=n))},function(t,e,r){var i,n;i=[r(1)],n=function(t){if(!t||t.vml){var e="hasOwnProperty",r=String,i=parseFloat,n=Math,a=n.round,s=n.max,o=n.min,l=n.abs,h="fill",u=/[, ]+/,c=t.eve,f=" progid:DXImageTransform.Microsoft",p=" ",d="",g={M:"m",L:"l",C:"c",Z:"x",m:"t",l:"r",c:"v",z:"x"},v=/([clmz]),?([^clmz]*)/gi,x=/ progid:\S+Blur\([^\)]+\)/g,y=/-?[^,\s-]+/g,m="position:absolute;left:0;top:0;width:1px;height:1px;behavior:url(#default#VML)",b=21600,_={path:1,rect:1,image:1},w={circle:1,ellipse:1},k=function(e){var i=/[ahqstv]/gi,n=t._pathToAbsolute;if(r(e).match(i)&&(n=t._path2curve),i=/[clmz]/g,n==t._pathToAbsolute&&!r(e).match(i)){var s=r(e).replace(v,function(t,e,r){var i=[],n="m"==e.toLowerCase(),s=g[e];return r.replace(y,function(t){n&&2==i.length&&(s+=i+g["m"==e?"l":"L"],i=[]),i.push(a(t*b))}),s+i});return s}var o=n(e),l,h;s=[];for(var u=0,c=o.length;u<c;u++){l=o[u],h=o[u][0].toLowerCase(),"z"==h&&(h="x");for(var f=1,x=l.length;f<x;f++)h+=a(l[f]*b)+(f!=x-1?",":d);s.push(h)}return s.join(p)},B=function(e,r,i){var n=t.matrix();return n.rotate(-e,.5,.5),{dx:n.x(r,i),dy:n.y(r,i)}},C=function(t,e,r,i,n,a){var s=t._,o=t.matrix,u=s.fillpos,c=t.node,f=c.style,d=1,g="",v,x=b/e,y=b/r;if(f.visibility="hidden",e&&r){if(c.coordsize=l(x)+p+l(y),f.rotation=a*(e*r<0?-1:1),a){var m=B(a,i,n);i=m.dx,n=m.dy}if(e<0&&(g+="x"),r<0&&(g+=" y")&&(d=-1),f.flip=g,c.coordorigin=i*-x+p+n*-y,u||s.fillsize){var _=c.getElementsByTagName(h);_=_&&_[0],c.removeChild(_),u&&(m=B(a,o.x(u[0],u[1]),o.y(u[0],u[1])),_.position=m.dx*d+p+m.dy*d),s.fillsize&&(_.size=s.fillsize[0]*l(e)+p+s.fillsize[1]*l(r)),c.appendChild(_)}f.visibility="visible"}};t.toString=function(){return"Your browser doesn’t support SVG. Falling down to VML.\nYou are running Raphaël "+this.version};var S=function(t,e,i){for(var n=r(e).toLowerCase().split("-"),a=i?"end":"start",s=n.length,o="classic",l="medium",h="medium";s--;)switch(n[s]){case"block":case"classic":case"oval":case"diamond":case"open":case"none":o=n[s];break;case"wide":case"narrow":h=n[s];break;case"long":case"short":l=n[s]}var u=t.node.getElementsByTagName("stroke")[0];u[a+"arrow"]=o,u[a+"arrowlength"]=l,u[a+"arrowwidth"]=h},A=function(n,l){n.attrs=n.attrs||{};var c=n.node,f=n.attrs,g=c.style,v,x=_[n.type]&&(l.x!=f.x||l.y!=f.y||l.width!=f.width||l.height!=f.height||l.cx!=f.cx||l.cy!=f.cy||l.rx!=f.rx||l.ry!=f.ry||l.r!=f.r),y=w[n.type]&&(f.cx!=l.cx||f.cy!=l.cy||f.r!=l.r||f.rx!=l.rx||f.ry!=l.ry),m=n;for(var B in l)l[e](B)&&(f[B]=l[B]);if(x&&(f.path=t._getPath[n.type](n),n._.dirty=1),l.href&&(c.href=l.href),l.title&&(c.title=l.title),l.target&&(c.target=l.target),l.cursor&&(g.cursor=l.cursor),"blur"in l&&n.blur(l.blur),(l.path&&"path"==n.type||x)&&(c.path=k(~r(f.path).toLowerCase().indexOf("r")?t._pathToAbsolute(f.path):f.path),n._.dirty=1,"image"==n.type&&(n._.fillpos=[f.x,f.y],n._.fillsize=[f.width,f.height],C(n,1,1,0,0,0))),"transform"in l&&n.transform(l.transform),y){var A=+f.cx,E=+f.cy,M=+f.rx||+f.r||0,L=+f.ry||+f.r||0;c.path=t.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x",a((A-M)*b),a((E-L)*b),a((A+M)*b),a((E+L)*b),a(A*b)),n._.dirty=1}if("clip-rect"in l){var z=r(l["clip-rect"]).split(u);if(4==z.length){z[2]=+z[2]+ +z[0],z[3]=+z[3]+ +z[1];var P=c.clipRect||t._g.doc.createElement("div"),F=P.style;F.clip=t.format("rect({1}px {2}px {3}px {0}px)",z),c.clipRect||(F.position="absolute",F.top=0,F.left=0,F.width=n.paper.width+"px",F.height=n.paper.height+"px",c.parentNode.insertBefore(P,c),P.appendChild(c),c.clipRect=P)}l["clip-rect"]||c.clipRect&&(c.clipRect.style.clip="auto")}if(n.textpath){var R=n.textpath.style;l.font&&(R.font=l.font),l["font-family"]&&(R.fontFamily='"'+l["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g,d)+'"'),l["font-size"]&&(R.fontSize=l["font-size"]),l["font-weight"]&&(R.fontWeight=l["font-weight"]),l["font-style"]&&(R.fontStyle=l["font-style"])}if("arrow-start"in l&&S(m,l["arrow-start"]),"arrow-end"in l&&S(m,l["arrow-end"],1),null!=l.opacity||null!=l.fill||null!=l.src||null!=l.stroke||null!=l["stroke-width"]||null!=l["stroke-opacity"]||null!=l["fill-opacity"]||null!=l["stroke-dasharray"]||null!=l["stroke-miterlimit"]||null!=l["stroke-linejoin"]||null!=l["stroke-linecap"]){var j=c.getElementsByTagName(h),I=!1;if(j=j&&j[0],!j&&(I=j=N(h)),"image"==n.type&&l.src&&(j.src=l.src),l.fill&&(j.on=!0),null!=j.on&&"none"!=l.fill&&null!==l.fill||(j.on=!1),j.on&&l.fill){var q=r(l.fill).match(t._ISURL);if(q){j.parentNode==c&&c.removeChild(j),j.rotate=!0,j.src=q[1],j.type="tile";var D=n.getBBox(1);j.position=D.x+p+D.y,n._.fillpos=[D.x,D.y],t._preload(q[1],function(){n._.fillsize=[this.offsetWidth,this.offsetHeight]})}else j.color=t.getRGB(l.fill).hex,j.src=d,j.type="solid",t.getRGB(l.fill).error&&(m.type in{circle:1,ellipse:1}||"r"!=r(l.fill).charAt())&&T(m,l.fill,j)&&(f.fill="none",f.gradient=l.fill,j.rotate=!1)}if("fill-opacity"in l||"opacity"in l){var V=((+f["fill-opacity"]+1||2)-1)*((+f.opacity+1||2)-1)*((+t.getRGB(l.fill).o+1||2)-1);V=o(s(V,0),1),j.opacity=V,j.src&&(j.color="none")}c.appendChild(j);var O=c.getElementsByTagName("stroke")&&c.getElementsByTagName("stroke")[0],Y=!1;!O&&(Y=O=N("stroke")),(l.stroke&&"none"!=l.stroke||l["stroke-width"]||null!=l["stroke-opacity"]||l["stroke-dasharray"]||l["stroke-miterlimit"]||l["stroke-linejoin"]||l["stroke-linecap"])&&(O.on=!0),("none"==l.stroke||null===l.stroke||null==O.on||0==l.stroke||0==l["stroke-width"])&&(O.on=!1);var W=t.getRGB(l.stroke);O.on&&l.stroke&&(O.color=W.hex),V=((+f["stroke-opacity"]+1||2)-1)*((+f.opacity+1||2)-1)*((+W.o+1||2)-1);var G=.75*(i(l["stroke-width"])||1);if(V=o(s(V,0),1),null==l["stroke-width"]&&(G=f["stroke-width"]),l["stroke-width"]&&(O.weight=G),G&&G<1&&(V*=G)&&(O.weight=1),O.opacity=V,l["stroke-linejoin"]&&(O.joinstyle=l["stroke-linejoin"]||"miter"),O.miterlimit=l["stroke-miterlimit"]||8,l["stroke-linecap"]&&(O.endcap="butt"==l["stroke-linecap"]?"flat":"square"==l["stroke-linecap"]?"square":"round"),"stroke-dasharray"in l){var H={"-":"shortdash",".":"shortdot","-.":"shortdashdot","-..":"shortdashdotdot",". ":"dot","- ":"dash","--":"longdash","- .":"dashdot","--.":"longdashdot","--..":"longdashdotdot"};O.dashstyle=H[e](l["stroke-dasharray"])?H[l["stroke-dasharray"]]:d}Y&&c.appendChild(O)}if("text"==m.type){m.paper.canvas.style.display=d;var X=m.paper.span,U=100,$=f.font&&f.font.match(/\d+(?:\.\d*)?(?=px)/);g=X.style,f.font&&(g.font=f.font),f["font-family"]&&(g.fontFamily=f["font-family"]),f["font-weight"]&&(g.fontWeight=f["font-weight"]),f["font-style"]&&(g.fontStyle=f["font-style"]),$=i(f["font-size"]||$&&$[0])||10,g.fontSize=$*U+"px",m.textpath.string&&(X.innerHTML=r(m.textpath.string).replace(/</g,"&#60;").replace(/&/g,"&#38;").replace(/\n/g,"<br>"));var Z=X.getBoundingClientRect();m.W=f.w=(Z.right-Z.left)/U,m.H=f.h=(Z.bottom-Z.top)/U,m.X=f.x,m.Y=f.y+m.H/2,("x"in l||"y"in l)&&(m.path.v=t.format("m{0},{1}l{2},{1}",a(f.x*b),a(f.y*b),a(f.x*b)+1));for(var Q=["x","y","text","font","font-family","font-weight","font-style","font-size"],J=0,K=Q.length;J<K;J++)if(Q[J]in l){m._.dirty=1;break}switch(f["text-anchor"]){case"start":m.textpath.style["v-text-align"]="left",m.bbx=m.W/2;break;case"end":m.textpath.style["v-text-align"]="right",m.bbx=-m.W/2;break;default:m.textpath.style["v-text-align"]="center",m.bbx=0}m.textpath.style["v-text-kern"]=!0}},T=function(e,a,s){e.attrs=e.attrs||{};var o=e.attrs,l=Math.pow,h,u,c="linear",f=".5 .5";if(e.attrs.gradient=a,a=r(a).replace(t._radial_gradient,function(t,e,r){return c="radial",e&&r&&(e=i(e),r=i(r),l(e-.5,2)+l(r-.5,2)>.25&&(r=n.sqrt(.25-l(e-.5,2))*(2*(r>.5)-1)+.5),f=e+p+r),d}),a=a.split(/\s*\-\s*/),"linear"==c){var g=a.shift();if(g=-i(g),isNaN(g))return null}var v=t._parseDots(a);if(!v)return null;if(e=e.shape||e.node,v.length){e.removeChild(s),s.on=!0,s.method="none",s.color=v[0].color,s.color2=v[v.length-1].color;for(var x=[],y=0,m=v.length;y<m;y++)v[y].offset&&x.push(v[y].offset+p+v[y].color);s.colors=x.length?x.join():"0% "+s.color,"radial"==c?(s.type="gradientTitle",s.focus="100%",s.focussize="0 0",s.focusposition=f,s.angle=0):(s.type="gradient",s.angle=(270-g)%360),e.appendChild(s)}return 1},E=function(e,r){this[0]=this.node=e,e.raphael=!0,this.id=t._oid++,e.raphaelid=this.id,this.X=0,this.Y=0,this.attrs={},this.paper=r,this.matrix=t.matrix(),this._={transform:[],sx:1,sy:1,dx:0,dy:0,deg:0,dirty:1,dirtyT:1},!r.bottom&&(r.bottom=this),this.prev=r.top,r.top&&(r.top.next=this),r.top=this,this.next=null},M=t.el;E.prototype=M,M.constructor=E,M.transform=function(e){if(null==e)return this._.transform;var i=this.paper._viewBoxShift,n=i?"s"+[i.scale,i.scale]+"-1-1t"+[i.dx,i.dy]:d,a;i&&(a=e=r(e).replace(/\.{3}|\u2026/g,this._.transform||d)),t._extractTransform(this,n+e);var s=this.matrix.clone(),o=this.skew,l=this.node,h,u=~r(this.attrs.fill).indexOf("-"),c=!r(this.attrs.fill).indexOf("url(");if(s.translate(1,1),c||u||"image"==this.type)if(o.matrix="1 0 0 1",o.offset="0 0",h=s.split(),u&&h.noRotation||!h.isSimple){l.style.filter=s.toFilter();var f=this.getBBox(),g=this.getBBox(1),v=f.x-g.x,x=f.y-g.y;l.coordorigin=v*-b+p+x*-b,C(this,1,1,v,x,0)}else l.style.filter=d,C(this,h.scalex,h.scaley,h.dx,h.dy,h.rotate);else l.style.filter=d,o.matrix=r(s),o.offset=s.offset();return null!==a&&(this._.transform=a,t._extractTransform(this,a)),this},M.rotate=function(t,e,n){if(this.removed)return this;if(null!=t){if(t=r(t).split(u),t.length-1&&(e=i(t[1]),n=i(t[2])),t=i(t[0]),null==n&&(e=n),null==e||null==n){var a=this.getBBox(1);e=a.x+a.width/2,n=a.y+a.height/2}return this._.dirtyT=1,this.transform(this._.transform.concat([["r",t,e,n]])),this}},M.translate=function(t,e){return this.removed?this:(t=r(t).split(u),t.length-1&&(e=i(t[1])),t=i(t[0])||0,e=+e||0,this._.bbox&&(this._.bbox.x+=t,this._.bbox.y+=e),this.transform(this._.transform.concat([["t",t,e]])),this)},M.scale=function(t,e,n,a){if(this.removed)return this;if(t=r(t).split(u),t.length-1&&(e=i(t[1]),n=i(t[2]),a=i(t[3]),isNaN(n)&&(n=null),isNaN(a)&&(a=null)),t=i(t[0]),null==e&&(e=t),null==a&&(n=a),null==n||null==a)var s=this.getBBox(1);return n=null==n?s.x+s.width/2:n,a=null==a?s.y+s.height/2:a,this.transform(this._.transform.concat([["s",t,e,n,a]])),this._.dirtyT=1,this},M.hide=function(){return!this.removed&&(this.node.style.display="none"),this},M.show=function(){return!this.removed&&(this.node.style.display=d),this},M.auxGetBBox=t.el.getBBox,M.getBBox=function(){var t=this.auxGetBBox();if(this.paper&&this.paper._viewBoxShift){var e={},r=1/this.paper._viewBoxShift.scale;return e.x=t.x-this.paper._viewBoxShift.dx,e.x*=r,e.y=t.y-this.paper._viewBoxShift.dy,e.y*=r,e.width=t.width*r,e.height=t.height*r,e.x2=e.x+e.width,e.y2=e.y+e.height,e}return t},M._getBBox=function(){return this.removed?{}:{x:this.X+(this.bbx||0)-this.W/2,y:this.Y-this.H,width:this.W,height:this.H}},M.remove=function(){if(!this.removed&&this.node.parentNode){this.paper.__set__&&this.paper.__set__.exclude(this),t.eve.unbind("raphael.*.*."+this.id),t._tear(this,this.paper),this.node.parentNode.removeChild(this.node),this.shape&&this.shape.parentNode.removeChild(this.shape);for(var e in this)this[e]="function"==typeof this[e]?t._removedFactory(e):null;this.removed=!0}},M.attr=function(r,i){if(this.removed)return this;if(null==r){var n={};for(var a in this.attrs)this.attrs[e](a)&&(n[a]=this.attrs[a]);return n.gradient&&"none"==n.fill&&(n.fill=n.gradient)&&delete n.gradient,n.transform=this._.transform,n}if(null==i&&t.is(r,"string")){if(r==h&&"none"==this.attrs.fill&&this.attrs.gradient)return this.attrs.gradient;for(var s=r.split(u),o={},l=0,f=s.length;l<f;l++)r=s[l],r in this.attrs?o[r]=this.attrs[r]:t.is(this.paper.customAttributes[r],"function")?o[r]=this.paper.customAttributes[r].def:o[r]=t._availableAttrs[r];return f-1?o:o[s[0]]}if(this.attrs&&null==i&&t.is(r,"array")){for(o={},l=0,f=r.length;l<f;l++)o[r[l]]=this.attr(r[l]);return o}var p;null!=i&&(p={},p[r]=i),null==i&&t.is(r,"object")&&(p=r);for(var d in p)c("raphael.attr."+d+"."+this.id,this,p[d]);if(p){for(d in this.paper.customAttributes)if(this.paper.customAttributes[e](d)&&p[e](d)&&t.is(this.paper.customAttributes[d],"function")){var g=this.paper.customAttributes[d].apply(this,[].concat(p[d]));this.attrs[d]=p[d];for(var v in g)g[e](v)&&(p[v]=g[v])}p.text&&"text"==this.type&&(this.textpath.string=p.text),A(this,p)}return this},M.toFront=function(){return!this.removed&&this.node.parentNode.appendChild(this.node),this.paper&&this.paper.top!=this&&t._tofront(this,this.paper),this},M.toBack=function(){return this.removed?this:(this.node.parentNode.firstChild!=this.node&&(this.node.parentNode.insertBefore(this.node,this.node.parentNode.firstChild),t._toback(this,this.paper)),this)},M.insertAfter=function(e){return this.removed?this:(e.constructor==t.st.constructor&&(e=e[e.length-1]),e.node.nextSibling?e.node.parentNode.insertBefore(this.node,e.node.nextSibling):e.node.parentNode.appendChild(this.node),t._insertafter(this,e,this.paper),this)},M.insertBefore=function(e){return this.removed?this:(e.constructor==t.st.constructor&&(e=e[0]),e.node.parentNode.insertBefore(this.node,e.node),t._insertbefore(this,e,this.paper),this)},M.blur=function(e){var r=this.node.runtimeStyle,i=r.filter;return i=i.replace(x,d),0!==+e?(this.attrs.blur=e,r.filter=i+p+f+".Blur(pixelradius="+(+e||1.5)+")",r.margin=t.format("-{0}px 0 0 -{0}px",a(+e||1.5))):(r.filter=i,r.margin=0,delete this.attrs.blur),this},t._engine.path=function(t,e){var r=N("shape");r.style.cssText=m,r.coordsize=b+p+b,r.coordorigin=e.coordorigin;var i=new E(r,e),n={fill:"none",stroke:"#000"};t&&(n.path=t),i.type="path",i.path=[],i.Path=d,A(i,n),e.canvas&&e.canvas.appendChild(r);var a=N("skew");return a.on=!0,r.appendChild(a),i.skew=a,i.transform(d),i},t._engine.rect=function(e,r,i,n,a,s){var o=t._rectPath(r,i,n,a,s),l=e.path(o),h=l.attrs;return l.X=h.x=r,l.Y=h.y=i,l.W=h.width=n,l.H=h.height=a,h.r=s,h.path=o,l.type="rect",l},t._engine.ellipse=function(t,e,r,i,n){var a=t.path(),s=a.attrs;return a.X=e-i,a.Y=r-n,a.W=2*i,a.H=2*n,a.type="ellipse",A(a,{cx:e,cy:r,rx:i,ry:n}),a},t._engine.circle=function(t,e,r,i){var n=t.path(),a=n.attrs;return n.X=e-i,n.Y=r-i,n.W=n.H=2*i,n.type="circle",A(n,{cx:e,cy:r,r:i}),n},t._engine.image=function(e,r,i,n,a,s){var o=t._rectPath(i,n,a,s),l=e.path(o).attr({stroke:"none"}),u=l.attrs,c=l.node,f=c.getElementsByTagName(h)[0];return u.src=r,l.X=u.x=i,l.Y=u.y=n,l.W=u.width=a,l.H=u.height=s,u.path=o,l.type="image",f.parentNode==c&&c.removeChild(f),f.rotate=!0,f.src=r,f.type="tile",l._.fillpos=[i,n],l._.fillsize=[a,s],c.appendChild(f),C(l,1,1,0,0,0),l},t._engine.text=function(e,i,n,s){var o=N("shape"),l=N("path"),h=N("textpath");i=i||0,n=n||0,s=s||"",l.v=t.format("m{0},{1}l{2},{1}",a(i*b),a(n*b),a(i*b)+1),l.textpathok=!0,h.string=r(s),h.on=!0,o.style.cssText=m,o.coordsize=b+p+b,o.coordorigin="0 0";var u=new E(o,e),c={fill:"#000",stroke:"none",font:t._availableAttrs.font,text:s};u.shape=o,u.path=l,u.textpath=h,u.type="text",u.attrs.text=r(s),u.attrs.x=i,u.attrs.y=n,u.attrs.w=1,u.attrs.h=1,A(u,c),o.appendChild(h),o.appendChild(l),e.canvas.appendChild(o);var f=N("skew");return f.on=!0,o.appendChild(f),u.skew=f,u.transform(d),u},t._engine.setSize=function(e,r){var i=this.canvas.style;return this.width=e,this.height=r,e==+e&&(e+="px"),r==+r&&(r+="px"),i.width=e,i.height=r,i.clip="rect(0 "+e+" "+r+" 0)",this._viewBox&&t._engine.setViewBox.apply(this,this._viewBox),this},t._engine.setViewBox=function(e,r,i,n,a){t.eve("raphael.setViewBox",this,this._viewBox,[e,r,i,n,a]);var s=this.getSize(),o=s.width,l=s.height,h,u;return a&&(h=l/n,u=o/i,i*h<o&&(e-=(o-i*h)/2/h),n*u<l&&(r-=(l-n*u)/2/u)),this._viewBox=[e,r,i,n,!!a],this._viewBoxShift={dx:-e,dy:-r,scale:s},this.forEach(function(t){t.transform("...")}),this};var N;t._engine.initWin=function(t){var e=t.document;e.styleSheets.length<31?e.createStyleSheet().addRule(".rvml","behavior:url(#default#VML)"):e.styleSheets[0].addRule(".rvml","behavior:url(#default#VML)");try{!e.namespaces.rvml&&e.namespaces.add("rvml","urn:schemas-microsoft-com:vml"),N=function(t){return e.createElement("<rvml:"+t+' class="rvml">')}}catch(r){N=function(t){return e.createElement("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="rvml">')}}},t._engine.initWin(t._g.win),t._engine.create=function(){var e=t._getContainer.apply(0,arguments),r=e.container,i=e.height,n,a=e.width,s=e.x,o=e.y;if(!r)throw new Error("VML container not found.");var l=new t._Paper,h=l.canvas=t._g.doc.createElement("div"),u=h.style;return s=s||0,o=o||0,a=a||512,i=i||342,l.width=a,l.height=i,a==+a&&(a+="px"),i==+i&&(i+="px"),l.coordsize=1e3*b+p+1e3*b,l.coordorigin="0 0",l.span=t._g.doc.createElement("span"),l.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;",h.appendChild(l.span),u.cssText=t.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden",a,i),1==r?(t._g.doc.body.appendChild(h),u.left=s+"px",u.top=o+"px",u.position="absolute"):r.firstChild?r.insertBefore(h,r.firstChild):r.appendChild(h),l.renderfix=function(){},l},t.prototype.clear=function(){t.eve("raphael.clear",this),this.canvas.innerHTML=d,this.span=t._g.doc.createElement("span"),this.span.style.cssText="position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;",this.canvas.appendChild(this.span),this.bottom=this.top=null},t.prototype.remove=function(){t.eve("raphael.remove",this),this.canvas.parentNode.removeChild(this.canvas);for(var e in this)this[e]="function"==typeof this[e]?t._removedFactory(e):null;return!0};var L=t.st;for(var z in M)M[e](z)&&!L[e](z)&&(L[z]=function(t){return function(){var e=arguments;return this.forEach(function(r){r[t].apply(r,e)})}}(z))}}.apply(e,i),!(void 0!==n&&(t.exports=n))}])});

/***/ }),

/***/ 1375:
/***/ (function(module, exports, __webpack_require__) {

/*** IMPORTS FROM imports-loader ***/
var $ = __webpack_require__(72);
(function() {

/*!
 *
 * Jquery Mapael - Dynamic maps jQuery plugin (based on raphael.js)
 * Requires jQuery, raphael.js and jquery.mousewheel
 *
 * Version: 2.1.0
 *
 * Copyright (c) 2017 Vincent Brouté (https://www.vincentbroute.fr/mapael)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 *
 * Thanks to Indigo744
 *
 */
(function (factory) {
    if (true) {
        // CommonJS
        module.exports = factory(__webpack_require__(72), __webpack_require__(1254), __webpack_require__(1161));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'raphael', 'mousewheel'], factory);
    } else {
        // Browser globals
        factory(jQuery, Raphael, jQuery.fn.mousewheel);
    }
}(function ($, Raphael, mousewheel, undefined) {

    "use strict";

    // The plugin name (used on several places)
    var pluginName = "mapael";

    // Version number of jQuery Mapael. See http://semver.org/ for more information.
    var version = "2.1.0";

    /*
     * Mapael constructor
     * Init instance vars and call init()
     * @param container the DOM element on which to apply the plugin
     * @param options the complete options to use
     */
    var Mapael = function (container, options) {
        var self = this;

        // the global container (DOM element object)
        self.container = container;

        // the global container (jQuery object)
        self.$container = $(container);

        // the global options
        self.options = self.extendDefaultOptions(options);

        // zoom TimeOut handler (used to set and clear)
        self.zoomTO = 0;

        // zoom center coordinate (set at touchstart)
        self.zoomCenterX = 0;
        self.zoomCenterY = 0;

        // Zoom pinch (set at touchstart and touchmove)
        self.previousPinchDist = 0;

        // Zoom data
        self.zoomData = {
            zoomLevel: 0,
            zoomX: 0,
            zoomY: 0,
            panX: 0,
            panY: 0
        };

        // resize TimeOut handler (used to set and clear)
        self.resizeTO = 0;

        // Panning: tell if panning action is in progress
        self.panning = false;

        // Panning TimeOut handler (used to set and clear)
        self.panningTO = 0;

        // Animate view box Interval handler (used to set and clear)
        self.animationIntervalID = null;

        // Map subcontainer jQuery object
        self.$map = $("." + self.options.map.cssClass, self.container);

        // Save initial HTML content (used by destroy method)
        self.initialMapHTMLContent = self.$map.html();

        // Allow to store legend containers and initial contents (used by destroy method)
        self.createdLegends = {};

        // The tooltip jQuery object
        self.$tooltip = {};

        // The paper Raphael object
        self.paper = {};

        // The areas object list
        self.areas = {};

        // The plots object list
        self.plots = {};

        // The links object list
        self.links = {};

        // The map configuration object (taken from map file)
        self.mapConf = {};

        // Let's start the initialization
        self.init();
    };

    /*
     * Mapael Prototype
     * Defines all methods and properties needed by Mapael
     * Each mapael object inherits their properties and methods from this prototype
     */
    Mapael.prototype = {

        /*
         * Version number
         */
        version: version,

        /*
         * Initialize the plugin
         * Called by the constructor
         */
        init: function () {
            var self = this;

            // Init check for class existence
            if (self.options.map.cssClass === "" || $("." + self.options.map.cssClass, self.container).length === 0) {
                throw new Error("The map class `" + self.options.map.cssClass + "` doesn't exists");
            }

            // Create the tooltip container
            self.$tooltip = $("<div>").addClass(self.options.map.tooltip.cssClass).css("display", "none");

            // Get the map container, empty it then append tooltip
            self.$map.empty().append(self.$tooltip);

            // Get the map from $.mapael or $.fn.mapael (backward compatibility)
            if ($[pluginName] && $[pluginName].maps && $[pluginName].maps[self.options.map.name]) {
                // Mapael version >= 2.x
                self.mapConf = $[pluginName].maps[self.options.map.name];
            } else if ($.fn[pluginName] && $.fn[pluginName].maps && $.fn[pluginName].maps[self.options.map.name]) {
                // Mapael version <= 1.x - DEPRECATED
                self.mapConf = $.fn[pluginName].maps[self.options.map.name];
                if (window.console && window.console.warn) {
                    window.console.warn("Extending $.fn.mapael is deprecated (map '" + self.options.map.name + "')");
                }
            } else {
                throw new Error("Unknown map '" + self.options.map.name + "'");
            }

            // Create Raphael paper
            self.paper = new Raphael(self.$map[0], self.mapConf.width, self.mapConf.height);

            // issue #135: Check for Raphael bug on text element boundaries
            if (self.isRaphaelBBoxBugPresent() === true) {
                self.destroy();
                throw new Error("Can't get boundary box for text (is your container hidden? See #135)");
            }

            // add plugin class name on element
            self.$container.addClass(pluginName);

            if (self.options.map.tooltip.css) self.$tooltip.css(self.options.map.tooltip.css);
            self.paper.setViewBox(0, 0, self.mapConf.width, self.mapConf.height, false);

            // Handle map size
            if (self.options.map.width) {
                // NOT responsive: map has a fixed width
                self.paper.setSize(self.options.map.width, self.mapConf.height * (self.options.map.width / self.mapConf.width));

                // Create the legends for plots taking into account the scale of the map
                self.createLegends("plot", self.plots, (self.options.map.width / self.mapConf.width));
            } else {
                // Responsive: handle resizing of the map
                self.handleMapResizing();
            }

            // Draw map areas
            $.each(self.mapConf.elems, function (id) {
                var elemOptions = self.getElemOptions(
                    self.options.map.defaultArea,
                    (self.options.areas[id] ? self.options.areas[id] : {}),
                    self.options.legend.area
                );
                self.areas[id] = {"mapElem": self.paper.path(self.mapConf.elems[id]).attr(elemOptions.attrs)};
            });

            // Hook that allows to add custom processing on the map
            if (self.options.map.beforeInit) self.options.map.beforeInit(self.$container, self.paper, self.options);

            // Init map areas in a second loop (prevent texts to be hidden by map elements)
            $.each(self.mapConf.elems, function (id) {
                var elemOptions = self.getElemOptions(
                    self.options.map.defaultArea,
                    (self.options.areas[id] ? self.options.areas[id] : {}),
                    self.options.legend.area
                );
                self.initElem(self.areas[id], elemOptions, id);
            });

            // Draw links
            self.links = self.drawLinksCollection(self.options.links);

            // Draw plots
            $.each(self.options.plots, function (id) {
                self.plots[id] = self.drawPlot(id);
            });

            // Attach zoom event
            self.$container.on("zoom." + pluginName, function (e, zoomOptions) {
                self.onZoomEvent(e, zoomOptions);
            });

            if (self.options.map.zoom.enabled) {
                // Enable zoom
                self.initZoom(self.mapConf.width, self.mapConf.height, self.options.map.zoom);
            }

            // Set initial zoom
            if (self.options.map.zoom.init !== undefined) {
                if (self.options.map.zoom.init.animDuration === undefined) {
                    self.options.map.zoom.init.animDuration = 0;
                }
                self.$container.trigger("zoom", self.options.map.zoom.init);
            }

            // Create the legends for areas
            self.createLegends("area", self.areas, 1);

            // Attach update event
            self.$container.on("update." + pluginName, function (e, opt) {
                self.onUpdateEvent(e, opt);
            });

            // Attach showElementsInRange event
            self.$container.on("showElementsInRange." + pluginName, function (e, opt) {
                self.onShowElementsInRange(e, opt);
            });

            // Hook that allows to add custom processing on the map
            if (self.options.map.afterInit) self.options.map.afterInit(self.$container, self.paper, self.areas, self.plots, self.options);

            $(self.paper.desc).append(" and Mapael " + self.version + " (https://www.vincentbroute.fr/mapael/)");
        },

        /*
         * Destroy mapael
         * This function effectively detach mapael from the container
         *   - Set the container back to the way it was before mapael instanciation
         *   - Remove all data associated to it (memory can then be free'ed by browser)
         *
         * This method can be call directly by user:
         *     $(".mapcontainer").data("mapael").destroy();
         *
         * This method is also automatically called if the user try to call mapael
         * on a container already containing a mapael instance
         */
        destroy: function () {
            var self = this;

            // Detach all event listeners attached to the container
            self.$container.off("." + pluginName);
            self.$map.off("." + pluginName);

            // Detach the global resize event handler
            if (self.onResizeEvent) $(window).off("resize." + pluginName, self.onResizeEvent);

            // Empty the container (this will also detach all event listeners)
            self.$map.empty();

            // Replace initial HTML content
            self.$map.html(self.initialMapHTMLContent);

            // Empty legend containers and replace initial HTML content
            for (var id in self.createdLegends) {
                self.createdLegends[id].container.empty();
                self.createdLegends[id].container.html(self.createdLegends[id].initialHTMLContent);
            }

            // Remove mapael class
            self.$container.removeClass(pluginName);

            // Remove the data
            self.$container.removeData(pluginName);

            // Remove all internal reference
            self.container = undefined;
            self.$container = undefined;
            self.options = undefined;
            self.paper = undefined;
            self.$map = undefined;
            self.$tooltip = undefined;
            self.mapConf = undefined;
            self.areas = undefined;
            self.plots = undefined;
            self.links = undefined;
        },

        handleMapResizing: function () {
            var self = this;

            // onResizeEvent: call when the window element trigger the resize event
            // We create it inside this function (and not in the prototype) in order to have a closure
            // Otherwise, in the prototype, 'this' when triggered is *not* the mapael object but the global window
            self.onResizeEvent = function () {
                // Clear any previous setTimeout (avoid too much triggering)
                clearTimeout(self.resizeTO);
                // setTimeout to wait for the user to finish its resizing
                self.resizeTO = setTimeout(function () {
                    self.$map.trigger("resizeEnd");
                }, 150);
            };

            // Attach resize handler
            $(window).on("resize." + pluginName, self.onResizeEvent);

            // Attach resize end handler, and call it once
            self.$map.on("resizeEnd." + pluginName, function (e, isInit) {
                var containerWidth = self.$map.width();

                if (self.paper.width != containerWidth) {
                    var newScale = containerWidth / self.mapConf.width;
                    // Set new size
                    self.paper.setSize(containerWidth, self.mapConf.height * newScale);

                    // Create plots legend again to take into account the new scale
                    if (isInit || self.options.legend.redrawOnResize) {
                        self.createLegends("plot", self.plots, newScale);
                    }
                }
            }).trigger("resizeEnd", [true]);
        },

        /*
         * Extend the user option with the default one
         * @param options the user options
         * @return new options object
         */
        extendDefaultOptions: function (options) {

            // Extend default options with user options
            options = $.extend(true, {}, Mapael.prototype.defaultOptions, options);

            // Extend legend default options
            $.each(['area', 'plot'], function (key, type) {
                if ($.isArray(options.legend[type])) {
                    for (var i = 0; i < options.legend[type].length; ++i)
                        options.legend[type][i] = $.extend(true, {}, Mapael.prototype.legendDefaultOptions[type], options.legend[type][i]);
                } else {
                    options.legend[type] = $.extend(true, {}, Mapael.prototype.legendDefaultOptions[type], options.legend[type]);
                }
            });

            return options;
        },

        /*
         * Init the element "elem" on the map (drawing, setting attributes, events, tooltip, ...)
         */
        initElem: function (elem, elemOptions, id) {
            var self = this;
            var bbox = {};
            var textPosition = {};

            // Assign value attribute to element
            if (elemOptions.value !== undefined){
                elem.value = elemOptions.value;
            }

            // Init the label related to the element
            if (elemOptions.text && elemOptions.text.content !== undefined) {
                // Set a text label in the area
                bbox = elem.mapElem.getBBox();
                textPosition = self.getTextPosition(bbox, elemOptions.text.position, elemOptions.text.margin);
                elemOptions.text.attrs["text-anchor"] = textPosition.textAnchor;
                elem.textElem = self.paper.text(textPosition.x, textPosition.y, elemOptions.text.content).attr(elemOptions.text.attrs);
                $(elem.textElem.node).attr("data-id", id);
            }

            // Set user event handlers
            if (elemOptions.eventHandlers) self.setEventHandlers(id, elemOptions, elem.mapElem, elem.textElem);

            // Set hover option for mapElem
            self.setHoverOptions(elem.mapElem, elemOptions.attrs, elemOptions.attrsHover);

            // Set hover option for textElem
            if (elem.textElem) self.setHoverOptions(elem.textElem, elemOptions.text.attrs, elemOptions.text.attrsHover);

            // Set hover behavior only if attrsHover is set for area or for text
            if (($.isEmptyObject(elemOptions.attrsHover) === false) ||
                (elem.textElem && $.isEmptyObject(elemOptions.text.attrsHover) === false)) {
                // Set hover behavior
                self.setHover(elem.mapElem, elem.textElem);
            }

            // Init the tooltip
            if (elemOptions.tooltip) {
                elem.mapElem.tooltip = elemOptions.tooltip;
                self.setTooltip(elem.mapElem);

                if (elemOptions.text && elemOptions.text.content !== undefined) {
                    elem.textElem.tooltip = elemOptions.tooltip;
                    self.setTooltip(elem.textElem);
                }
            }

            // Init the link
            if (elemOptions.href) {
                elem.mapElem.href = elemOptions.href;
                elem.mapElem.target = elemOptions.target;
                self.setHref(elem.mapElem);

                if (elemOptions.text && elemOptions.text.content !== undefined) {
                    elem.textElem.href = elemOptions.href;
                    elem.textElem.target = elemOptions.target;
                    self.setHref(elem.textElem);
                }
            }

            if (elemOptions.cssClass !== undefined) {
                $(elem.mapElem.node).addClass(elemOptions.cssClass);
            }

            $(elem.mapElem.node).attr("data-id", id);
        },

        /*
         * Init zoom and panning for the map
         * @param mapWidth
         * @param mapHeight
         * @param zoomOptions
         */
        initZoom: function (mapWidth, mapHeight, zoomOptions) {
            var self = this;
            var mousedown = false;
            var previousX = 0;
            var previousY = 0;
            var fnZoomButtons = {
                "reset": function () {
                    self.$container.trigger("zoom", {"level": 0});
                },
                "in": function () {
                    self.$container.trigger("zoom", {"level": "+1"});
                },
                "out": function () {
                    self.$container.trigger("zoom", {"level": -1});
                }
            };

            // init Zoom data
            $.extend(self.zoomData, {
                zoomLevel: 0,
                panX: 0,
                panY: 0
            });

            // init zoom buttons
            $.each(zoomOptions.buttons, function(type, opt) {
                if (fnZoomButtons[type] === undefined) throw new Error("Unknown zoom button '" + type + "'");
                // Create div with classes, contents and title (for tooltip)
                var $button = $("<div>").addClass(opt.cssClass)
                    .html(opt.content)
                    .attr("title", opt.title);
                // Assign click event
                $button.on("click." + pluginName, fnZoomButtons[type]);
                // Append to map
                self.$map.append($button);
            });

            // Update the zoom level of the map on mousewheel
            if (self.options.map.zoom.mousewheel) {
                self.$map.on("mousewheel." + pluginName, function (e) {
                    var zoomLevel = (e.deltaY > 0) ? 1 : -1;
                    var coord = self.mapPagePositionToXY(e.pageX, e.pageY);

                    self.$container.trigger("zoom", {
                        "fixedCenter": true,
                        "level": self.zoomData.zoomLevel + zoomLevel,
                        "x": coord.x,
                        "y": coord.y
                    });

                    e.preventDefault();
                });
            }

            // Update the zoom level of the map on touch pinch
            if (self.options.map.zoom.touch) {
                self.$map.on("touchstart." + pluginName, function (e) {
                    if (e.originalEvent.touches.length === 2) {
                        self.zoomCenterX = (e.originalEvent.touches[0].pageX + e.originalEvent.touches[1].pageX) / 2;
                        self.zoomCenterY = (e.originalEvent.touches[0].pageY + e.originalEvent.touches[1].pageY) / 2;
                        self.previousPinchDist = Math.sqrt(Math.pow((e.originalEvent.touches[1].pageX - e.originalEvent.touches[0].pageX), 2) + Math.pow((e.originalEvent.touches[1].pageY - e.originalEvent.touches[0].pageY), 2));
                    }
                });

                self.$map.on("touchmove." + pluginName, function (e) {
                    var pinchDist = 0;
                    var zoomLevel = 0;

                    if (e.originalEvent.touches.length === 2) {
                        pinchDist = Math.sqrt(Math.pow((e.originalEvent.touches[1].pageX - e.originalEvent.touches[0].pageX), 2) + Math.pow((e.originalEvent.touches[1].pageY - e.originalEvent.touches[0].pageY), 2));

                        if (Math.abs(pinchDist - self.previousPinchDist) > 15) {
                            var coord = self.mapPagePositionToXY(self.zoomCenterX, self.zoomCenterY);
                            zoomLevel = (pinchDist - self.previousPinchDist) / Math.abs(pinchDist - self.previousPinchDist);
                            self.$container.trigger("zoom", {
                                "fixedCenter": true,
                                "level": self.zoomData.zoomLevel + zoomLevel,
                                "x": coord.x,
                                "y": coord.y
                            });
                            self.previousPinchDist = pinchDist;
                        }
                        return false;
                    }
                });
            }

            // When the user drag the map, prevent to move the clicked element instead of dragging the map (behaviour seen with Firefox)
            self.$map.on("dragstart", function() {
                return false;
            });

            // Panning
            $("body").on("mouseup." + pluginName + (zoomOptions.touch ? " touchend." + pluginName : ""), function () {
                mousedown = false;
                setTimeout(function () {
                    self.panning = false;
                }, 50);
            });

            self.$map.on("mousedown." + pluginName + (zoomOptions.touch ? " touchstart." + pluginName : ""), function (e) {
                if (e.pageX !== undefined) {
                    mousedown = true;
                    previousX = e.pageX;
                    previousY = e.pageY;
                } else {
                    if (e.originalEvent.touches.length === 1) {
                        mousedown = true;
                        previousX = e.originalEvent.touches[0].pageX;
                        previousY = e.originalEvent.touches[0].pageY;
                    }
                }
            }).on("mousemove." + pluginName + (zoomOptions.touch ? " touchmove." + pluginName : ""), function (e) {
                var currentLevel = self.zoomData.zoomLevel;
                var pageX = 0;
                var pageY = 0;

                if (e.pageX !== undefined) {
                    pageX = e.pageX;
                    pageY = e.pageY;
                } else {
                    if (e.originalEvent.touches.length === 1) {
                        pageX = e.originalEvent.touches[0].pageX;
                        pageY = e.originalEvent.touches[0].pageY;
                    } else {
                        mousedown = false;
                    }
                }

                if (mousedown && currentLevel !== 0) {
                    var offsetX = (previousX - pageX) / (1 + (currentLevel * zoomOptions.step)) * (mapWidth / self.paper.width);
                    var offsetY = (previousY - pageY) / (1 + (currentLevel * zoomOptions.step)) * (mapHeight / self.paper.height);
                    var panX = Math.min(Math.max(0, self.paper._viewBox[0] + offsetX), (mapWidth - self.paper._viewBox[2]));
                    var panY = Math.min(Math.max(0, self.paper._viewBox[1] + offsetY), (mapHeight - self.paper._viewBox[3]));

                    if (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
                        $.extend(self.zoomData, {
                            panX: panX,
                            panY: panY,
                            zoomX: panX + self.paper._viewBox[2] / 2,
                            zoomY: panY + self.paper._viewBox[3] / 2
                        });
                        self.paper.setViewBox(panX, panY, self.paper._viewBox[2], self.paper._viewBox[3]);

                        clearTimeout(self.panningTO);
                        self.panningTO = setTimeout(function () {
                            self.$map.trigger("afterPanning", {
                                x1: panX,
                                y1: panY,
                                x2: (panX + self.paper._viewBox[2]),
                                y2: (panY + self.paper._viewBox[3])
                            });
                        }, 150);

                        previousX = pageX;
                        previousY = pageY;
                        self.panning = true;
                    }
                    return false;
                }
            });
        },

        /*
         * Map a mouse position to a map position
         *      Transformation principle:
         *          ** start with (pageX, pageY) absolute mouse coordinate
         *          - Apply translation: take into accounts the map offset in the page
         *          ** from this point, we have relative mouse coordinate
         *          - Apply homothetic transformation: take into accounts initial factor of map sizing (fullWidth / actualWidth)
         *          - Apply homothetic transformation: take into accounts the zoom factor
         *          ** from this point, we have relative map coordinate
         *          - Apply translation: take into accounts the current panning of the map
         *          ** from this point, we have absolute map coordinate
         * @param pageX: mouse client coordinate on X
         * @param pageY: mouse client coordinate on Y
         * @return map coordinate {x, y}
         */
        mapPagePositionToXY: function(pageX, pageY) {
            var self = this;
            var offset = self.$map.offset();
            var initFactor = (self.options.map.width) ? (self.mapConf.width / self.options.map.width) : (self.mapConf.width / self.$map.width());
            var zoomFactor = 1 / (1 + (self.zoomData.zoomLevel * self.options.map.zoom.step));
            return {
                x: (zoomFactor * initFactor * (pageX - offset.left)) + self.zoomData.panX,
                y: (zoomFactor * initFactor * (pageY - offset.top)) + self.zoomData.panY
            };
        },

        /*
         * Zoom on the map at a specific level focused on specific coordinates
         * If no coordinates are specified, the zoom will be focused on the center of the map
         * options :
         *    "level" : level of the zoom between minLevel and maxLevel
         *    "x" or "latitude" : x coordinate or latitude of the point to focus on
         *    "y" or "longitude" : y coordinate or longitude of the point to focus on
         *    "fixedCenter" : set to true in order to preserve the position of x,y in the canvas when zoomed
         *    "animDuration" : zoom duration
         */
        onZoomEvent: function (e, zoomOptions) {
            var self = this;
            var newLevel = self.zoomData.zoomLevel;
            var panX = 0;
            var panY = 0;
            var previousZoomLevel = (1 + self.zoomData.zoomLevel * self.options.map.zoom.step);
            var zoomLevel = 0;
            var animDuration = (zoomOptions.animDuration !== undefined) ? zoomOptions.animDuration : self.options.map.zoom.animDuration;
            var offsetX = 0;
            var offsetY = 0;
            var coords = {};

            // Get user defined zoom level
            if (zoomOptions.level !== undefined) {
                if (typeof zoomOptions.level === "string") {
                    // level is a string, either "n", "+n" or "-n"
                    if ((zoomOptions.level.slice(0, 1) === '+') || (zoomOptions.level.slice(0, 1) === '-')) {
                        // zoomLevel is relative
                        newLevel = self.zoomData.zoomLevel + parseInt(zoomOptions.level);
                    } else {
                        // zoomLevel is absolute
                        newLevel = parseInt(zoomOptions.level);
                    }
                } else {
                    // level is integer
                    if (zoomOptions.level < 0) {
                        // zoomLevel is relative
                        newLevel = self.zoomData.zoomLevel + zoomOptions.level;
                    } else {
                        // zoomLevel is absolute
                        newLevel = zoomOptions.level;
                    }
                }
                // Make sure we stay in the boundaries
                newLevel = Math.min(Math.max(newLevel, self.options.map.zoom.minLevel), self.options.map.zoom.maxLevel);
            }

            zoomLevel = (1 + newLevel * self.options.map.zoom.step);

            if (zoomOptions.latitude !== undefined && zoomOptions.longitude !== undefined) {
                coords = self.mapConf.getCoords(zoomOptions.latitude, zoomOptions.longitude);
                zoomOptions.x = coords.x;
                zoomOptions.y = coords.y;
            }

            if (zoomOptions.x === undefined)
                zoomOptions.x = self.paper._viewBox[0] + self.paper._viewBox[2] / 2;

            if (zoomOptions.y === undefined)
                zoomOptions.y = (self.paper._viewBox[1] + self.paper._viewBox[3] / 2);

            if (newLevel === 0) {
                panX = 0;
                panY = 0;
            } else if (zoomOptions.fixedCenter !== undefined && zoomOptions.fixedCenter === true) {
                offsetX = self.zoomData.panX + ((zoomOptions.x - self.zoomData.panX) * (zoomLevel - previousZoomLevel)) / zoomLevel;
                offsetY = self.zoomData.panY + ((zoomOptions.y - self.zoomData.panY) * (zoomLevel - previousZoomLevel)) / zoomLevel;

                panX = Math.min(Math.max(0, offsetX), (self.mapConf.width - (self.mapConf.width / zoomLevel)));
                panY = Math.min(Math.max(0, offsetY), (self.mapConf.height - (self.mapConf.height / zoomLevel)));
            } else {
                panX = Math.min(Math.max(0, zoomOptions.x - (self.mapConf.width / zoomLevel) / 2), (self.mapConf.width - (self.mapConf.width / zoomLevel)));
                panY = Math.min(Math.max(0, zoomOptions.y - (self.mapConf.height / zoomLevel) / 2), (self.mapConf.height - (self.mapConf.height / zoomLevel)));
            }

            // Update zoom level of the map
            if (zoomLevel == previousZoomLevel && panX == self.zoomData.panX && panY == self.zoomData.panY) return;

            if (animDuration > 0) {
                self.animateViewBox(panX, panY, self.mapConf.width / zoomLevel, self.mapConf.height / zoomLevel, animDuration, self.options.map.zoom.animEasing);
            } else {
                self.paper.setViewBox(panX, panY, self.mapConf.width / zoomLevel, self.mapConf.height / zoomLevel);
                clearTimeout(self.zoomTO);
                self.zoomTO = setTimeout(function () {
                    self.$map.trigger("afterZoom", {
                        x1: panX,
                        y1: panY,
                        x2: (panX + (self.mapConf.width / zoomLevel)),
                        y2: (panY + (self.mapConf.height / zoomLevel))
                    });
                }, 150);
            }

            $.extend(self.zoomData, {
                zoomLevel: newLevel,
                panX: panX,
                panY: panY,
                zoomX: panX + self.paper._viewBox[2] / 2,
                zoomY: panY + self.paper._viewBox[3] / 2
            });
        },

        /*
         * Show some element in range defined by user
         * Triggered by user $(".mapcontainer").trigger("showElementsInRange", [opt]);
         *
         * @param opt the options
         *  opt.hiddenOpacity opacity for hidden element (default = 0.3)
         *  opt.animDuration animation duration in ms (default = 0)
         *  opt.afterShowRange callback
         *  opt.ranges the range to show:
         *  Example:
         *  opt.ranges = {
         *      'plot' : {
         *          0 : {                        // valueIndex
         *              'min': 1000,
         *              'max': 1200
         *          },
         *          1 : {                        // valueIndex
         *              'min': 10,
         *              'max': 12
         *          }
         *      },
         *      'area' : {
         *          {'min': 10, 'max': 20}    // No valueIndex, only an object, use 0 as valueIndex (easy case)
         *      }
         *  }
         */
        onShowElementsInRange: function(e, opt) {
            var self = this;

            // set animDuration to default if not defined
            if (opt.animDuration === undefined) {
                opt.animDuration = 0;
            }

            // set hiddenOpacity to default if not defined
            if (opt.hiddenOpacity === undefined) {
                opt.hiddenOpacity = 0.3;
            }

            // handle area
            if (opt.ranges && opt.ranges.area) {
                self.showElemByRange(opt.ranges.area, self.areas, opt.hiddenOpacity, opt.animDuration);
            }

            // handle plot
            if (opt.ranges && opt.ranges.plot) {
                self.showElemByRange(opt.ranges.plot, self.plots, opt.hiddenOpacity, opt.animDuration);
            }

            // handle link
            if (opt.ranges && opt.ranges.link) {
                self.showElemByRange(opt.ranges.link, self.links, opt.hiddenOpacity, opt.animDuration);
            }

            // Call user callback
            if (opt.afterShowRange) opt.afterShowRange();
        },

        /*
         * Show some element in range
         * @param ranges: the ranges
         * @param elems: list of element on which to check against previous range
         * @hiddenOpacity: the opacity when hidden
         * @animDuration: the animation duration
         */
        showElemByRange: function(ranges, elems, hiddenOpacity, animDuration) {
            var self = this;
            // Hold the final opacity value for all elements consolidated after applying each ranges
            // This allow to set the opacity only once for each elements
            var elemsFinalOpacity = {};

            // set object with one valueIndex to 0 if we have directly the min/max
            if (ranges.min !== undefined || ranges.max !== undefined) {
                ranges = {0: ranges};
            }

            // Loop through each valueIndex
            $.each(ranges, function (valueIndex) {
                var range = ranges[valueIndex];
                // Check if user defined at least a min or max value
                if (range.min === undefined && range.max === undefined) {
                    return true; // skip this iteration (each loop), goto next range
                }
                // Loop through each elements
                $.each(elems, function (id) {
                    var elemValue = elems[id].value;
                    // set value with one valueIndex to 0 if not object
                    if (typeof elemValue !== "object") {
                        elemValue = [elemValue];
                    }
                    // Check existence of this value index
                    if (elemValue[valueIndex] === undefined) {
                        return true; // skip this iteration (each loop), goto next element
                    }
                    // Check if in range
                    if ((range.min !== undefined && elemValue[valueIndex] < range.min) ||
                        (range.max !== undefined && elemValue[valueIndex] > range.max)) {
                        // Element not in range
                        elemsFinalOpacity[id] = hiddenOpacity;
                    } else {
                        // Element in range
                        elemsFinalOpacity[id] = 1;
                    }
                });
            });
            // Now that we looped through all ranges, we can really assign the final opacity
            $.each(elemsFinalOpacity, function (id) {
                self.setElementOpacity(elems[id], elemsFinalOpacity[id], animDuration);
            });
        },

        /*
         * Set element opacity
         * Handle elem.mapElem and elem.textElem
         * @param elem the element
         * @param opacity the opacity to apply
         * @param animDuration the animation duration to use
         */
        setElementOpacity: function(elem, opacity, animDuration) {
            // Ensure no animation is running
            //elem.mapElem.stop();
            //if (elem.textElem) elem.textElem.stop();

            // If final opacity is not null, ensure element is shown before proceeding
            if (opacity > 0) {
                elem.mapElem.show();
                if (elem.textElem) elem.textElem.show();
            }
            if (animDuration > 0) {
                // Animate attribute
                elem.mapElem.animate({"opacity": opacity}, animDuration, "linear", function () {
                    // If final attribute is 0, hide
                    if (opacity === 0) elem.mapElem.hide();
                });
                // Handle text element
                if (elem.textElem) {
                    // Animate attribute
                    elem.textElem.animate({"opacity": opacity}, animDuration, "linear", function () {
                        // If final attribute is 0, hide
                        if (opacity === 0) elem.textElem.hide();
                    });
                }
            } else {
                // Set attribute
                elem.mapElem.attr({"opacity": opacity});
                // For null opacity, hide it
                if (opacity === 0) elem.mapElem.hide();
                // Handle text elemen
                if (elem.textElem) {
                    // Set attribute
                    elem.textElem.attr({"opacity": opacity});
                    // For null opacity, hide it
                    if (opacity === 0) elem.textElem.hide();
                }
            }
        },

        /*
         *
         * Update the current map
         * Refresh attributes and tooltips for areas and plots
         * @param opt option for the refresh :
         *  opt.mapOptions: options to update for plots and areas
         *  opt.replaceOptions: whether mapsOptions should entirely replace current map options, or just extend it
         *  opt.opt.newPlots new plots to add to the map
         *  opt.newLinks new links to add to the map
         *  opt.deletePlotKeys plots to delete from the map (array, or "all" to remove all plots)
         *  opt.deleteLinkKeys links to remove from the map (array, or "all" to remove all links)
         *  opt.setLegendElemsState the state of legend elements to be set : show (default) or hide
         *  opt.animDuration animation duration in ms (default = 0)
         *  opt.afterUpdate Hook that allows to add custom processing on the map
         */
        onUpdateEvent: function (e, opt) {
            var self = this;
            // Abort if opt is undefined
            if (typeof opt !== "object")  return;

            var i = 0;
            var animDuration = (opt.animDuration) ? opt.animDuration : 0;

            // This function remove an element using animation (or not, depending on animDuration)
            // Used for deletePlotKeys and deleteLinkKeys
            var fnRemoveElement = function (elem) {
                // Unset all event handlers
                self.unsetHover(elem.mapElem, elem.textElem);
                if (animDuration > 0) {
                    elem.mapElem.animate({"opacity": 0}, animDuration, "linear", function () {
                        elem.mapElem.remove();
                    });
                    if (elem.textElem) {
                        elem.textElem.animate({"opacity": 0}, animDuration, "linear", function () {
                            elem.textElem.remove();
                        });
                    }
                } else {
                    elem.mapElem.remove();
                    if (elem.textElem) {
                        elem.textElem.remove();
                    }
                }
            };

            // This function show an element using animation
            // Used for newPlots and newLinks
            var fnShowElement = function (elem) {
                // Starts with hidden elements
                elem.mapElem.attr({opacity: 0});
                if (elem.textElem) elem.textElem.attr({opacity: 0});
                // Set final element opacity
                self.setElementOpacity(
                    elem,
                    (elem.mapElem.originalAttrs.opacity !== undefined) ? elem.mapElem.originalAttrs.opacity : 1,
                    animDuration
                );
            };

            if (typeof opt.mapOptions === "object") {
                if (opt.replaceOptions === true) self.options = self.extendDefaultOptions(opt.mapOptions);
                else $.extend(true, self.options, opt.mapOptions);

                // IF we update areas, plots or legend, then reset all legend state to "show"
                if (opt.mapOptions.areas !== undefined || opt.mapOptions.plots !== undefined || opt.mapOptions.legend !== undefined) {
                    $("[data-type='elem']", self.$container).each(function (id, elem) {
                        if ($(elem).attr('data-hidden') === "1") {
                            // Toggle state of element by clicking
                            $(elem).trigger("click", [false, animDuration]);
                        }
                    });
                }
            }

            // Delete plots by name if deletePlotKeys is array
            if (typeof opt.deletePlotKeys === "object") {
                for (; i < opt.deletePlotKeys.length; i++) {
                    if (self.plots[opt.deletePlotKeys[i]] !== undefined) {
                        fnRemoveElement(self.plots[opt.deletePlotKeys[i]]);
                        delete self.plots[opt.deletePlotKeys[i]];
                    }
                }
                // Delete ALL plots if deletePlotKeys is set to "all"
            } else if (opt.deletePlotKeys === "all") {
                $.each(self.plots, function (id, elem) {
                    fnRemoveElement(elem);
                });
                // Empty plots object
                self.plots = {};
            }

            // Delete links by name if deleteLinkKeys is array
            if (typeof opt.deleteLinkKeys === "object") {
                for (i = 0; i < opt.deleteLinkKeys.length; i++) {
                    if (self.links[opt.deleteLinkKeys[i]] !== undefined) {
                        fnRemoveElement(self.links[opt.deleteLinkKeys[i]]);
                        delete self.links[opt.deleteLinkKeys[i]];
                    }
                }
                // Delete ALL links if deleteLinkKeys is set to "all"
            } else if (opt.deleteLinkKeys === "all") {
                $.each(self.links, function (id, elem) {
                    fnRemoveElement(elem);
                });
                // Empty links object
                self.links = {};
            }

            // New plots
            if (typeof opt.newPlots === "object") {
                $.each(opt.newPlots, function (id) {
                    if (self.plots[id] === undefined) {
                        self.options.plots[id] = opt.newPlots[id];
                        self.plots[id] = self.drawPlot(id);
                        if (animDuration > 0) {
                            fnShowElement(self.plots[id]);
                        }
                    }
                });
            }

            // New links
            if (typeof opt.newLinks === "object") {
                var newLinks = self.drawLinksCollection(opt.newLinks);
                $.extend(self.links, newLinks);
                $.extend(self.options.links, opt.newLinks);
                if (animDuration > 0) {
                    $.each(newLinks, function (id) {
                        fnShowElement(newLinks[id]);
                    });
                }
            }

            // Update areas attributes and tooltips
            $.each(self.areas, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions === "object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultArea === "object")
                        || (typeof opt.mapOptions.areas === "object" && typeof opt.mapOptions.areas[id] === "object")
                        || (typeof opt.mapOptions.legend === "object" && typeof opt.mapOptions.legend.area === "object")
                    ))
                    || opt.replaceOptions === true
                ) {
                    var elemOptions = self.getElemOptions(
                        self.options.map.defaultArea,
                        (self.options.areas[id] ? self.options.areas[id] : {}),
                        self.options.legend.area
                    );
                    self.updateElem(elemOptions, self.areas[id], animDuration);
                }
            });

            // Update plots attributes and tooltips
            $.each(self.plots, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions ==="object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultPlot === "object")
                        || (typeof opt.mapOptions.plots === "object" && typeof opt.mapOptions.plots[id] === "object")
                        || (typeof opt.mapOptions.legend === "object" && typeof opt.mapOptions.legend.plot === "object")
                    ))
                    || opt.replaceOptions === true
                ) {
                    var elemOptions = self.getElemOptions(
                        self.options.map.defaultPlot,
                        (self.options.plots[id] ? self.options.plots[id] : {}),
                        self.options.legend.plot
                    );
                    if (elemOptions.type == "square") {
                        elemOptions.attrs.width = elemOptions.size;
                        elemOptions.attrs.height = elemOptions.size;
                        elemOptions.attrs.x = self.plots[id].mapElem.attrs.x - (elemOptions.size - self.plots[id].mapElem.attrs.width) / 2;
                        elemOptions.attrs.y = self.plots[id].mapElem.attrs.y - (elemOptions.size - self.plots[id].mapElem.attrs.height) / 2;
                    } else if (elemOptions.type == "image") {
                        elemOptions.attrs.width = elemOptions.width;
                        elemOptions.attrs.height = elemOptions.height;
                        elemOptions.attrs.x = self.plots[id].mapElem.attrs.x - (elemOptions.width - self.plots[id].mapElem.attrs.width) / 2;
                        elemOptions.attrs.y = self.plots[id].mapElem.attrs.y - (elemOptions.height - self.plots[id].mapElem.attrs.height) / 2;
                    } else if (elemOptions.type == "svg") {
                        if (elemOptions.attrs.transform !== undefined) {
                            elemOptions.attrs.transform = self.plots[id].mapElem.baseTransform + elemOptions.attrs.transform;
                        }
                    }else { // Default : circle
                        elemOptions.attrs.r = elemOptions.size / 2;
                    }

                    self.updateElem(elemOptions, self.plots[id], animDuration);
                }
            });

            // Update links attributes and tooltips
            $.each(self.links, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions === "object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultLink === "object")
                        || (typeof opt.mapOptions.links === "object" && typeof opt.mapOptions.links[id] === "object")
                    ))
                    || opt.replaceOptions === true
                ) {
                    var elemOptions = self.getElemOptions(
                        self.options.map.defaultLink,
                        (self.options.links[id] ? self.options.links[id] : {}),
                        {}
                    );

                    self.updateElem(elemOptions, self.links[id], animDuration);
                }
            });

            // Update legends
            if (opt.mapOptions && (
                    (typeof opt.mapOptions.legend === "object")
                    || (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultArea === "object")
                    || (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultPlot === "object")
                )) {
                // Show all elements on the map before updating the legends
                $("[data-type='elem']", self.$container).each(function (id, elem) {
                    if ($(elem).attr('data-hidden') === "1") {
                        $(elem).trigger("click", [false, animDuration]);
                    }
                });

                self.createLegends("area", self.areas, 1);
                if (self.options.map.width) {
                    self.createLegends("plot", self.plots, (self.options.map.width / self.mapConf.width));
                } else {
                    self.createLegends("plot", self.plots, (self.$map.width() / self.mapConf.width));
                }
            }

            // Hide/Show all elements based on showlegendElems
            //      Toggle (i.e. click) only if:
            //          - slice legend is shown AND we want to hide
            //          - slice legend is hidden AND we want to show
            if (typeof opt.setLegendElemsState === "object") {
                // setLegendElemsState is an object listing the legend we want to hide/show
                $.each(opt.setLegendElemsState, function (legendCSSClass, action) {
                    // Search for the legend
                    var $legend = self.$container.find("." + legendCSSClass)[0];
                    if ($legend !== undefined) {
                        // Select all elem inside this legend
                        $("[data-type='elem']", $legend).each(function (id, elem) {
                            if (($(elem).attr('data-hidden') === "0" && action === "hide") ||
                                ($(elem).attr('data-hidden') === "1" && action === "show")) {
                                // Toggle state of element by clicking
                                $(elem).trigger("click", [false, animDuration]);
                            }
                        });
                    }
                });
            } else {
                // setLegendElemsState is a string, or is undefined
                // Default : "show"
                var action = (opt.setLegendElemsState === "hide") ? "hide" : "show";

                $("[data-type='elem']", self.$container).each(function (id, elem) {
                    if (($(elem).attr('data-hidden') === "0" && action === "hide") ||
                        ($(elem).attr('data-hidden') === "1" && action === "show")) {
                        // Toggle state of element by clicking
                        $(elem).trigger("click", [false, animDuration]);
                    }
                });
            }
            if (opt.afterUpdate) opt.afterUpdate(self.$container, self.paper, self.areas, self.plots, self.options);
        },

        /*
         * Draw all links between plots on the paper
         */
        drawLinksCollection: function (linksCollection) {
            var self = this;
            var p1 = {};
            var p2 = {};
            var coordsP1 = {};
            var coordsP2 = {};
            var links = {};

            $.each(linksCollection, function (id) {
                var elemOptions = self.getElemOptions(self.options.map.defaultLink, linksCollection[id], {});

                if (typeof linksCollection[id].between[0] == 'string') {
                    p1 = self.options.plots[linksCollection[id].between[0]];
                } else {
                    p1 = linksCollection[id].between[0];
                }

                if (typeof linksCollection[id].between[1] == 'string') {
                    p2 = self.options.plots[linksCollection[id].between[1]];
                } else {
                    p2 = linksCollection[id].between[1];
                }

                if (p1.latitude !== undefined && p1.longitude !== undefined) {
                    coordsP1 = self.mapConf.getCoords(p1.latitude, p1.longitude);
                } else {
                    coordsP1.x = p1.x;
                    coordsP1.y = p1.y;
                }

                if (p2.latitude !== undefined && p2.longitude !== undefined) {
                    coordsP2 = self.mapConf.getCoords(p2.latitude, p2.longitude);
                } else {
                    coordsP2.x = p2.x;
                    coordsP2.y = p2.y;
                }
                links[id] = self.drawLink(id, coordsP1.x, coordsP1.y, coordsP2.x, coordsP2.y, elemOptions);
            });
            return links;
        },

        /*
         * Draw a curved link between two couples of coordinates a(xa,ya) and b(xb, yb) on the paper
         */
        drawLink: function (id, xa, ya, xb, yb, elemOptions) {
            var self = this;
            var elem = {};
            // Compute the "curveto" SVG point, d(x,y)
            // c(xc, yc) is the center of (xa,ya) and (xb, yb)
            var xc = (xa + xb) / 2;
            var yc = (ya + yb) / 2;

            // Equation for (cd) : y = acd * x + bcd (d is the cure point)
            var acd = -1 / ((yb - ya) / (xb - xa));
            var bcd = yc - acd * xc;

            // dist(c,d) = dist(a,b) (=abDist)
            var abDist = Math.sqrt((xb - xa) * (xb - xa) + (yb - ya) * (yb - ya));

            // Solution for equation dist(cd) = sqrt((xd - xc)² + (yd - yc)²)
            // dist(c,d)² = (xd - xc)² + (yd - yc)²
            // We assume that dist(c,d) = dist(a,b)
            // so : (xd - xc)² + (yd - yc)² - dist(a,b)² = 0
            // With the factor : (xd - xc)² + (yd - yc)² - (factor*dist(a,b))² = 0
            // (xd - xc)² + (acd*xd + bcd - yc)² - (factor*dist(a,b))² = 0
            var a = 1 + acd * acd;
            var b = -2 * xc + 2 * acd * bcd - 2 * acd * yc;
            var c = xc * xc + bcd * bcd - bcd * yc - yc * bcd + yc * yc - ((elemOptions.factor * abDist) * (elemOptions.factor * abDist));
            var delta = b * b - 4 * a * c;
            var x = 0;
            var y = 0;

            // There are two solutions, we choose one or the other depending on the sign of the factor
            if (elemOptions.factor > 0) {
                x = (-b + Math.sqrt(delta)) / (2 * a);
                y = acd * x + bcd;
            } else {
                x = (-b - Math.sqrt(delta)) / (2 * a);
                y = acd * x + bcd;
            }

            elem.mapElem = self.paper.path("m " + xa + "," + ya + " C " + x + "," + y + " " + xb + "," + yb + " " + xb + "," + yb + "").attr(elemOptions.attrs);
            self.initElem(elem, elemOptions, id);

            return elem;
        },

        /*
         * Check wether newAttrs object bring modifications to originalAttrs object
         */
        isAttrsChanged: function(originalAttrs, newAttrs) {
            for (var key in newAttrs) {
                if (typeof originalAttrs[key] === 'undefined' || newAttrs[key] !== originalAttrs[key]) {
                    return true;
                }
            }
            return false;
        },

        /*
         * Update the element "elem" on the map with the new elemOptions options
         */
        updateElem: function (elemOptions, elem, animDuration) {
            var self = this;
            var bbox;
            var textPosition;
            var plotOffsetX;
            var plotOffsetY;

            if (elemOptions.value !== undefined)
                elem.value = elemOptions.value;

            if (elemOptions.toFront === true) {
                elem.mapElem.toFront();
            }

            // Update the label
            if (elem.textElem) {
                if (elemOptions.text !== undefined && elemOptions.text.content !== undefined && elemOptions.text.content != elem.textElem.attrs.text)
                    elem.textElem.attr({text: elemOptions.text.content});

                bbox = elem.mapElem.getBBox();

                if (elemOptions.size || (elemOptions.width && elemOptions.height)) {
                    if (elemOptions.type == "image" || elemOptions.type == "svg") {
                        plotOffsetX = (elemOptions.width - bbox.width) / 2;
                        plotOffsetY = (elemOptions.height - bbox.height) / 2;
                    } else {
                        plotOffsetX = (elemOptions.size - bbox.width) / 2;
                        plotOffsetY = (elemOptions.size - bbox.height) / 2;
                    }
                    bbox.x -= plotOffsetX;
                    bbox.x2 += plotOffsetX;
                    bbox.y -= plotOffsetY;
                    bbox.y2 += plotOffsetY;
                }

                textPosition = self.getTextPosition(bbox, elemOptions.text.position, elemOptions.text.margin);
                if (textPosition.x != elem.textElem.attrs.x || textPosition.y != elem.textElem.attrs.y) {
                    if (animDuration > 0) {
                        elem.textElem.attr({"text-anchor": textPosition.textAnchor});
                        elem.textElem.animate({x: textPosition.x, y: textPosition.y}, animDuration);
                    } else
                        elem.textElem.attr({
                            x: textPosition.x,
                            y: textPosition.y,
                            "text-anchor": textPosition.textAnchor
                        });
                }

                self.setHoverOptions(elem.textElem, elemOptions.text.attrs, elemOptions.text.attrsHover);
                if (animDuration > 0)
                    elem.textElem.animate(elemOptions.text.attrs, animDuration);
                else
                    elem.textElem.attr(elemOptions.text.attrs);
            }

            // Update elements attrs and attrsHover
            self.setHoverOptions(elem.mapElem, elemOptions.attrs, elemOptions.attrsHover);

            if (self.isAttrsChanged(elem.mapElem.attrs, elemOptions.attrs)) {
                if (animDuration > 0)
                    elem.mapElem.animate(elemOptions.attrs, animDuration);
                else
                    elem.mapElem.attr(elemOptions.attrs);
            }

            // Update dimensions of SVG plots
            if (elemOptions.type == "svg") {

                if (bbox === undefined) {
                    bbox = elem.mapElem.getBBox();
                }
                elem.mapElem.transform("m" + (elemOptions.width / elem.mapElem.originalWidth) + ",0,0," + (elemOptions.height / elem.mapElem.originalHeight) + "," + bbox.x + "," + bbox.y);
            }

            // Update the tooltip
            if (elemOptions.tooltip) {
                if (elem.mapElem.tooltip === undefined) {
                    self.setTooltip(elem.mapElem);
                    if (elem.textElem) self.setTooltip(elem.textElem);
                }
                elem.mapElem.tooltip = elemOptions.tooltip;
                if (elem.textElem) elem.textElem.tooltip = elemOptions.tooltip;
            }

            // Update the link
            if (elemOptions.href !== undefined) {
                if (elem.mapElem.href === undefined) {
                    self.setHref(elem.mapElem);
                    if (elem.textElem) self.setHref(elem.textElem);
                }
                elem.mapElem.href = elemOptions.href;
                elem.mapElem.target = elemOptions.target;
                if (elem.textElem) {
                    elem.textElem.href = elemOptions.href;
                    elem.textElem.target = elemOptions.target;
                }
            }
        },

        /*
         * Draw the plot
         */
        drawPlot: function (id) {
            var self = this;
            var plot = {};
            var coords = {};
            var elemOptions = self.getElemOptions(
                self.options.map.defaultPlot,
                (self.options.plots[id] ? self.options.plots[id] : {}),
                self.options.legend.plot
            );

            if (elemOptions.x !== undefined && elemOptions.y !== undefined)
                coords = {x: elemOptions.x, y: elemOptions.y};
            else if (elemOptions.plotsOn !== undefined && self.areas[elemOptions.plotsOn].mapElem !== undefined){
                var path = self.areas[elemOptions.plotsOn].mapElem;
                var bbox = path.getBBox();
                var _x = Math.floor(bbox.x + bbox.width/2.0);
                var _y = Math.floor(bbox.y + bbox.height/2.0);
                coords = {x: _x, y: _y};
            }
            else
                coords = self.mapConf.getCoords(elemOptions.latitude, elemOptions.longitude);

            if (elemOptions.type == "square") {
                plot = {
                    "mapElem": self.paper.rect(
                        coords.x - (elemOptions.size / 2),
                        coords.y - (elemOptions.size / 2),
                        elemOptions.size,
                        elemOptions.size
                    ).attr(elemOptions.attrs)
                };
            } else if (elemOptions.type == "image") {
                plot = {
                    "mapElem": self.paper.image(
                        elemOptions.url,
                        coords.x - elemOptions.width / 2,
                        coords.y - elemOptions.height / 2,
                        elemOptions.width,
                        elemOptions.height
                    ).attr(elemOptions.attrs)
                };
            } else if (elemOptions.type == "svg") {
                if (elemOptions.attrs.transform === undefined) {
                    elemOptions.attrs.transform = "";
                }

                plot = {"mapElem": self.paper.path(elemOptions.path)};
                plot.mapElem.originalWidth = plot.mapElem.getBBox().width;
                plot.mapElem.originalHeight = plot.mapElem.getBBox().height;

                plot.mapElem.baseTransform = "m" + (elemOptions.width / plot.mapElem.originalWidth) + ",0,0," + (elemOptions.height / plot.mapElem.originalHeight) + "," + (coords.x - elemOptions.width / 2) + "," + (coords.y - elemOptions.height / 2);
                elemOptions.attrs.transform = plot.mapElem.baseTransform + elemOptions.attrs.transform;
                plot.mapElem.attr(elemOptions.attrs);
            } else { // Default = circle
                plot = {"mapElem": self.paper.circle(coords.x, coords.y, elemOptions.size / 2).attr(elemOptions.attrs)};
            }
            self.initElem(plot, elemOptions, id);
            return plot;
        },

        /*
         * Set target link on elem
         */
        setHref: function (elem) {
            var self = this;
            elem.attr({cursor: "pointer"});
            $(elem.node).on("click." + pluginName, function () {
                if (!self.panning && elem.href)
                    window.open(elem.href, elem.target);
            });
        },

        /*
         * Set a tooltip for the areas and plots
         * @param elem area or plot element
         * @param content the content to set in the tooltip
         */
        setTooltip: function (elem) {
            var self = this;
            var tooltipTO = 0;
            var cssClass = self.$tooltip.attr('class');



            var updateTooltipPosition = function (x, y) {

                var offsetLeft = 10;
                var offsetTop = 20;

                if (typeof elem.tooltip.offset === "object") {
                    if (typeof elem.tooltip.offset.left !== "undefined") {
                        offsetLeft = elem.tooltip.offset.left;
                    }
                    if (typeof elem.tooltip.offset.top !== "undefined") {
                        offsetTop = elem.tooltip.offset.top;
                    }
                }

                var tooltipPosition = {
                    "left": Math.min(self.$map.width() - self.$tooltip.outerWidth() - 5, x - self.$map.offset().left + offsetLeft),
                    "top": Math.min(self.$map.height() - self.$tooltip.outerHeight() - 5, y - self.$map.offset().top + offsetTop)
                };

                if (typeof elem.tooltip.overflow === "object") {
                    if (elem.tooltip.overflow.right === true) {
                        tooltipPosition.left = x - self.$map.offset().left + 10;
                    }
                    if (selem.tooltip.overflow.bottom === true) {
                        tooltipPosition.top = y - self.$map.offset().top + 20;
                    }
                }

                self.$tooltip.css(tooltipPosition);
            };

            $(elem.node).on("mouseover." + pluginName, function (e) {
                tooltipTO = setTimeout(
                    function () {
                        self.$tooltip.attr("class", cssClass);
                        if (elem.tooltip !== undefined) {
                            if (elem.tooltip.content !== undefined) {
                                // if tooltip.content is function, call it. Otherwise, assign it directly.
                                var content = (typeof elem.tooltip.content === "function") ? elem.tooltip.content(elem) : elem.tooltip.content;
                                self.$tooltip.html(content).css("display", "block");
                            }
                            if (elem.tooltip.cssClass !== undefined) {
                                self.$tooltip.addClass(elem.tooltip.cssClass);
                            }
                        }
                        updateTooltipPosition(e.pageX, e.pageY);
                    }, 120
                );
            }).on("mouseout." + pluginName, function () {
                clearTimeout(tooltipTO);
                self.$tooltip.css("display", "none");
            }).on("mousemove." + pluginName, function (e) {
                updateTooltipPosition(e.pageX, e.pageY);
            });
        },

        /*
         * Set user defined handlers for events on areas and plots
         * @param id the id of the element
         * @param elemOptions the element parameters
         * @param mapElem the map element to set callback on
         * @param textElem the optional text within the map element
         */
        setEventHandlers: function (id, elemOptions, mapElem, textElem) {
            var self = this;
            $.each(elemOptions.eventHandlers, function (event) {
                (function (event) {
                    $(mapElem.node).on(event, function (e) {
                        if (!self.panning) elemOptions.eventHandlers[event](e, id, mapElem, textElem, elemOptions);
                    });
                    if (textElem) {
                        $(textElem.node).on(event, function (e) {
                            if (!self.panning) elemOptions.eventHandlers[event](e, id, mapElem, textElem, elemOptions);
                        });
                    }
                })(event);
            });
        },

        /*
         * Draw a legend for areas and / or plots
         * @param legendOptions options for the legend to draw
         * @param legendType the type of the legend : "area" or "plot"
         * @param elems collection of plots or areas on the maps
         * @param legendIndex index of the legend in the conf array
         */
        drawLegend: function (legendOptions, legendType, elems, scale, legendIndex) {
            var self = this;
            var $legend = {};
            var legendPaper = {};
            var width = 0;
            var height = 0;
            var title = null;
            var elem = {};
            var elemBBox = {};
            var label = {};
            var i = 0;
            var x = 0;
            var y = 0;
            var yCenter = 0;
            var sliceOptions = [];
            var length = 0;

            $legend = $("." + legendOptions.cssClass, self.$container);

            if (typeof self.createdLegends[legendOptions.cssClass] ==='undefined') {
                self.createdLegends[legendOptions.cssClass] = {
                    container: $legend,
                    initialHTMLContent: $legend.html()
                };
            }

            $legend.empty();

            legendPaper = new Raphael($legend.get(0));
            // Set some data to object
            $(legendPaper.canvas).attr({"data-type": legendType, "data-index": legendIndex});

            height = width = 0;

            // Set the title of the legend
            if (legendOptions.title && legendOptions.title !== "") {
                title = legendPaper.text(legendOptions.marginLeftTitle, 0, legendOptions.title).attr(legendOptions.titleAttrs);
                title.attr({y: 0.5 * title.getBBox().height});

                width = legendOptions.marginLeftTitle + title.getBBox().width;
                height += legendOptions.marginBottomTitle + title.getBBox().height;
            }

            // Calculate attrs (and width, height and r (radius)) for legend elements, and yCenter for horizontal legends

            for (i = 0, length = legendOptions.slices.length; i < length; ++i) {
                var yCenterCurrent = 0;

                sliceOptions[i] = $.extend(true, {}, (legendType == "plot") ? self.options.map.defaultPlot : self.options.map.defaultArea, legendOptions.slices[i]);

                if (legendOptions.slices[i].legendSpecificAttrs === undefined) {
                    legendOptions.slices[i].legendSpecificAttrs = {};
                }

                $.extend(true, sliceOptions[i].attrs, legendOptions.slices[i].legendSpecificAttrs);

                if (legendType == "area") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = 30;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = 20;
                } else if (sliceOptions[i].type == "square") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = sliceOptions[i].size;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = sliceOptions[i].size;
                } else if (sliceOptions[i].type == "image" || sliceOptions[i].type == "svg") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = sliceOptions[i].width;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = sliceOptions[i].height;
                } else {
                    if (sliceOptions[i].attrs.r === undefined)
                        sliceOptions[i].attrs.r = sliceOptions[i].size / 2;
                }

                // Compute yCenter for this legend slice
                yCenterCurrent = legendOptions.marginBottomTitle;
                // Add title height if it exists
                if (title) {
                    yCenterCurrent += title.getBBox().height;
                }
                if (legendType == "plot" && (sliceOptions[i].type === undefined || sliceOptions[i].type == "circle")) {
                    yCenterCurrent += scale * sliceOptions[i].attrs.r;
                } else {
                    yCenterCurrent += scale * sliceOptions[i].attrs.height / 2;
                }
                // Update yCenter if current larger
                yCenter = Math.max(yCenter, yCenterCurrent);
            }

            if (legendOptions.mode == "horizontal") {
                width = legendOptions.marginLeft;
            }

            // Draw legend elements (circle, square or image in vertical or horizontal mode)
            for (i = 0, length = sliceOptions.length; i < length; ++i) {
                if (sliceOptions[i].display === undefined || sliceOptions[i].display === true) {
                    if (legendType == "area") {
                        if (legendOptions.mode == "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        elem = legendPaper.rect(x, y, scale * (sliceOptions[i].attrs.width), scale * (sliceOptions[i].attrs.height));
                    } else if (sliceOptions[i].type == "square") {
                        if (legendOptions.mode == "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        elem = legendPaper.rect(x, y, scale * (sliceOptions[i].attrs.width), scale * (sliceOptions[i].attrs.height));

                    } else if (sliceOptions[i].type == "image" || sliceOptions[i].type == "svg") {
                        if (legendOptions.mode == "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        if (sliceOptions[i].type == "image") {
                            elem = legendPaper.image(
                                sliceOptions[i].url, x, y, scale * sliceOptions[i].attrs.width, scale * sliceOptions[i].attrs.height);
                        } else {
                            elem = legendPaper.path(sliceOptions[i].path);

                            if (sliceOptions[i].attrs.transform === undefined) {
                                sliceOptions[i].attrs.transform = "";
                            }
                            sliceOptions[i].attrs.transform = "m" + ((scale * sliceOptions[i].width) / elem.getBBox().width) + ",0,0," + ((scale * sliceOptions[i].height) / elem.getBBox().height) + "," + x + "," + y + sliceOptions[i].attrs.transform;
                        }
                    } else {
                        if (legendOptions.mode == "horizontal") {
                            x = width + legendOptions.marginLeft + scale * (sliceOptions[i].attrs.r);
                            y = yCenter;
                        } else {
                            x = legendOptions.marginLeft + scale * (sliceOptions[i].attrs.r);
                            y = height + scale * (sliceOptions[i].attrs.r);
                        }
                        elem = legendPaper.circle(x, y, scale * (sliceOptions[i].attrs.r));
                    }

                    // Set attrs to the element drawn above
                    delete sliceOptions[i].attrs.width;
                    delete sliceOptions[i].attrs.height;
                    delete sliceOptions[i].attrs.r;
                    elem.attr(sliceOptions[i].attrs);
                    elemBBox = elem.getBBox();

                    // Draw the label associated with the element
                    if (legendOptions.mode == "horizontal") {
                        x = width + legendOptions.marginLeft + elemBBox.width + legendOptions.marginLeftLabel;
                        y = yCenter;
                    } else {
                        x = legendOptions.marginLeft + elemBBox.width + legendOptions.marginLeftLabel;
                        y = height + (elemBBox.height / 2);
                    }

                    label = legendPaper.text(x, y, sliceOptions[i].label).attr(legendOptions.labelAttrs);

                    // Update the width and height for the paper
                    if (legendOptions.mode == "horizontal") {
                        var currentHeight = legendOptions.marginBottom + elemBBox.height;
                        width += legendOptions.marginLeft + elemBBox.width + legendOptions.marginLeftLabel + label.getBBox().width;
                        if (sliceOptions[i].type != "image" && legendType != "area") {
                            currentHeight += legendOptions.marginBottomTitle;
                        }
                        // Add title height if it exists
                        if (title) {
                            currentHeight += title.getBBox().height;
                        }
                        height = Math.max(height, currentHeight);
                    } else {
                        width = Math.max(width, legendOptions.marginLeft + elemBBox.width + legendOptions.marginLeftLabel + label.getBBox().width);
                        height += legendOptions.marginBottom + elemBBox.height;
                    }

                    $(elem.node).attr({"data-type": "elem", "data-index": i, "data-hidden": 0});
                    $(label.node).attr({"data-type": "label", "data-index": i, "data-hidden": 0});

                    // Hide map elements when the user clicks on a legend item
                    if (legendOptions.hideElemsOnClick.enabled) {
                        // Hide/show elements when user clicks on a legend element
                        label.attr({cursor: "pointer"});
                        elem.attr({cursor: "pointer"});

                        self.setHoverOptions(elem, sliceOptions[i].attrs, sliceOptions[i].attrs);
                        self.setHoverOptions(label, legendOptions.labelAttrs, legendOptions.labelAttrsHover);
                        self.setHover(elem, label);
                        self.handleClickOnLegendElem(legendOptions, legendOptions.slices[i], label, elem, elems, legendIndex);
                    }
                }
            }

            // VMLWidth option allows you to set static width for the legend
            // only for VML render because text.getBBox() returns wrong values on IE6/7
            if (Raphael.type != "SVG" && legendOptions.VMLWidth)
                width = legendOptions.VMLWidth;

            legendPaper.setSize(width, height);
        },

        /*
         * Allow to hide elements of the map when the user clicks on a related legend item
         * @param legendOptions options for the legend to draw
         * @param sliceOptions options of the slice
         * @param label label of the legend item
         * @param elem element of the legend item
         * @param elems collection of plots or areas displayed on the map
         * @param legendIndex index of the legend in the conf array
         */
        handleClickOnLegendElem: function (legendOptions, sliceOptions, label, elem, elems, legendIndex) {
            var self = this;

            /**
             *
             * @param e
             * @param hideOtherElems : option used for the 'exclusive' mode to enabled only one item from the legend
             * at once
             * @param animDuration : used in the 'update' event in order to apply the same animDuration on the legend items
             */
            var hideMapElems = function (e, hideOtherElems, animDuration) {
                var elemValue = 0;
                var hidden = $(label.node).attr('data-hidden');
                var hiddenNewAttr = (hidden === '0') ? {"data-hidden": '1'} : {"data-hidden": '0'};

                // Check animDuration: if not set, this is a regular click, use the value specified in options
                if (animDuration === undefined) animDuration = legendOptions.hideElemsOnClick.animDuration;

                if (hidden === '0') {
                    if (animDuration > 0) label.animate({"opacity": 0.5}, animDuration);
                    else label.attr({"opacity": 0.5});
                } else {
                    if (animDuration > 0) label.animate({"opacity": 1}, animDuration);
                    else label.attr({"opacity": 1});
                }

                $.each(elems, function (id) {
                    // Retreive stored data of element
                    //      'hidden-by' contains the list of legendIndex that is hiding this element
                    var hiddenBy = elems[id].mapElem.data('hidden-by');
                    // Set to empty object if undefined
                    if (hiddenBy === undefined) hiddenBy = {};

                    if ($.isArray(elems[id].value)) {
                        elemValue = elems[id].value[legendIndex];
                    } else {
                        elemValue = elems[id].value;
                    }

                    // Hide elements whose value matches with the slice of the clicked legend item
                    if (self.getLegendSlice(elemValue, legendOptions) === sliceOptions) {
                        (function (id) {
                            if (hidden === '0') { // we want to hide this element
                                hiddenBy[legendIndex] = true; // add legendIndex to the data object for later use
                                self.setElementOpacity(elems[id], legendOptions.hideElemsOnClick.opacity, animDuration);
                            } else { // We want to show this element
                                delete hiddenBy[legendIndex]; // Remove this legendIndex from object
                                // Check if another legendIndex is defined
                                // We will show this element only if no legend is no longer hiding it
                                if ($.isEmptyObject(hiddenBy)) {
                                    self.setElementOpacity(
                                        elems[id],
                                        elems[id].mapElem.originalAttrs.opacity !== undefined ? elems[id].mapElem.originalAttrs.opacity : 1,
                                        animDuration
                                    );
                                }
                            }
                            // Update elem data with new values
                            elems[id].mapElem.data('hidden-by', hiddenBy);
                        })(id);
                    }
                });

                $(elem.node).attr(hiddenNewAttr);
                $(label.node).attr(hiddenNewAttr);

                if ((hideOtherElems === undefined || hideOtherElems === true)
                    && legendOptions.exclusive !== undefined && legendOptions.exclusive === true
                ) {
                    $("[data-type='elem'][data-hidden=0]", self.$container).each(function () {
                        if ($(this).attr('data-index') !== $(elem.node).attr('data-index')) {
                            $(this).trigger("click", false);
                        }
                    });
                }
            };
            $(label.node).on("click." + pluginName, hideMapElems);
            $(elem.node).on("click." + pluginName, hideMapElems);

            if (sliceOptions.clicked !== undefined && sliceOptions.clicked === true) {
                $(elem.node).trigger("click", false);
            }
        },

        /*
         * Create all legends for a specified type (area or plot)
         * @param legendType the type of the legend : "area" or "plot"
         * @param elems collection of plots or areas displayed on the map
         * @param scale scale ratio of the map
         */
        createLegends: function (legendType, elems, scale) {
            var self = this;
            var legendsOptions = self.options.legend[legendType];

            if (!$.isArray(self.options.legend[legendType])) {
                legendsOptions = [self.options.legend[legendType]];
            }

            for (var j = 0; j < legendsOptions.length; ++j) {
                // Check for class existence
                if (legendsOptions[j].cssClass === "" || $("." + legendsOptions[j].cssClass, self.$container).length === 0) {
                    throw new Error("The legend class `" + legendsOptions[j].cssClass + "` doesn't exists.");
                }
                if (legendsOptions[j].display === true && $.isArray(legendsOptions[j].slices) && legendsOptions[j].slices.length > 0) {
                    self.drawLegend(legendsOptions[j], legendType, elems, scale, j);
                }
            }
        },

        /*
         * Set the attributes on hover and the attributes to restore for a map element
         * @param elem the map element
         * @param originalAttrs the original attributes to restore on mouseout event
         * @param attrsHover the attributes to set on mouseover event
         */
        setHoverOptions: function (elem, originalAttrs, attrsHover) {
            // Disable transform option on hover for VML (IE<9) because of several bugs
            if (Raphael.type != "SVG") delete attrsHover.transform;
            elem.attrsHover = attrsHover;

            if (elem.attrsHover.transform) elem.originalAttrs = $.extend({transform: "s1"}, originalAttrs);
            else elem.originalAttrs = originalAttrs;
        },

        /*
         * Set the hover behavior (mouseover & mouseout) for plots and areas
         * @param mapElem the map element
         * @param textElem the optional text element (within the map element)
         */
        setHover: function (mapElem, textElem) {
            var self = this;
            var $mapElem = {};
            var $textElem = {};
            var mouseoverTimeout = 0;
            var mouseoutTimeout = 0;
            var overBehaviour = function () {
                clearTimeout(mouseoutTimeout);
                mouseoverTimeout = setTimeout(function () {
                    self.elemHover(mapElem, textElem);
                }, 120);
            };
            var outBehaviour = function () {
                clearTimeout(mouseoverTimeout);
                mouseoutTimeout = setTimeout(function(){
                    self.elemOut(mapElem, textElem);
                }, 120);
            };

            $mapElem = $(mapElem.node);
            $mapElem.on("mouseover." + pluginName, overBehaviour);
            $mapElem.on("mouseout." + pluginName, outBehaviour);

            if (textElem) {
                $textElem = $(textElem.node);
                $textElem.on("mouseover." + pluginName, overBehaviour);
                $(textElem.node).on("mouseout." + pluginName, outBehaviour);
            }
        },

        /*
         * Remove the hover behavior for plots and areas
         * @param mapElem the map element
         * @param textElem the optional text element (within the map element)
         */
        unsetHover: function (mapElem, textElem) {
            $(mapElem.node).off("." + pluginName);
            if (textElem) $(textElem.node).off("." + pluginName);
        },

        /*
         * Set he behaviour for "mouseover" event
         * @param mapElem mapElem the map element
         * @param textElem the optional text element (within the map element)
         */
        elemHover: function (mapElem, textElem) {
            var self = this;
            // Set mapElem
            if (mapElem.attrsHover.animDuration > 0) mapElem.animate(mapElem.attrsHover, mapElem.attrsHover.animDuration);
            else mapElem.attr(mapElem.attrsHover);
            // Set textElem
            if (textElem) {
                if (textElem.attrsHover.animDuration > 0) textElem.animate(textElem.attrsHover, textElem.attrsHover.animDuration);
                else textElem.attr(textElem.attrsHover);
            }
            // workaround for older version of Raphael
            if (self.paper.safari) self.paper.safari();
        },

        /*
         * Set he behaviour for "mouseout" event
         * @param mapElem the map element
         * @param textElem the optional text element (within the map element)
         */
        elemOut: function (mapElem, textElem) {
            var self = this;
            // Set mapElem
            if (mapElem.attrsHover.animDuration > 0) mapElem.animate(mapElem.originalAttrs, mapElem.attrsHover.animDuration);
            else mapElem.attr(mapElem.originalAttrs);
            // Set textElem
            if (textElem) {
                if (textElem.attrsHover.animDuration > 0) textElem.animate(textElem.originalAttrs, textElem.attrsHover.animDuration);
                else textElem.attr(textElem.originalAttrs);
            }

            // workaround for older version of Raphael
            if (self.paper.safari) self.paper.safari();
        },

        /*
         * Get element options by merging default options, element options and legend options
         * @param defaultOptions
         * @param elemOptions
         * @param legendOptions
         */
        getElemOptions: function (defaultOptions, elemOptions, legendOptions) {
            var self = this;
            var options = $.extend(true, {}, defaultOptions, elemOptions);
            if (options.value !== undefined) {
                if ($.isArray(legendOptions)) {
                    for (var i = 0, length = legendOptions.length; i < length; ++i) {
                        options = $.extend(true, {}, options, self.getLegendSlice(options.value[i], legendOptions[i]));
                    }
                } else {
                    options = $.extend(true, {}, options, self.getLegendSlice(options.value, legendOptions));
                }
            }
            return options;
        },

        /*
         * Get the coordinates of the text relative to a bbox and a position
         * @param bbox the boundary box of the element
         * @param textPosition the wanted text position (inner, right, left, top or bottom)
         * @param margin number or object {x: val, y:val} margin between the bbox and the text
         */
        getTextPosition: function (bbox, textPosition, margin) {
            var textX = 0;
            var textY = 0;
            var textAnchor = "";

            if (typeof margin === "number") {
                if (textPosition === "bottom" || textPosition === "top") {
                    margin = {x: 0, y: margin};
                } else if (textPosition === "right" || textPosition === "left") {
                    margin = {x: margin, y: 0};
                } else {
                    margin = {x: 0, y: 0};
                }
            }

            switch (textPosition) {
                case "bottom" :
                    textX = ((bbox.x + bbox.x2) / 2) + margin.x;
                    textY = bbox.y2 + margin.y;
                    textAnchor = "middle";
                    break;
                case "top" :
                    textX = ((bbox.x + bbox.x2) / 2) + margin.x;
                    textY = bbox.y - margin.y;
                    textAnchor = "middle";
                    break;
                case "left" :
                    textX = bbox.x - margin.x;
                    textY = ((bbox.y + bbox.y2) / 2) + margin.y;
                    textAnchor = "end";
                    break;
                case "right" :
                    textX = bbox.x2 + margin.x;
                    textY = ((bbox.y + bbox.y2) / 2) + margin.y;
                    textAnchor = "start";
                    break;
                default : // "inner" position
                    textX = ((bbox.x + bbox.x2) / 2) + margin.x;
                    textY = ((bbox.y + bbox.y2) / 2) + margin.y;
                    textAnchor = "middle";
            }
            return {"x": textX, "y": textY, "textAnchor": textAnchor};
        },

        /*
         * Get the legend conf matching with the value
         * @param value the value to match with a slice in the legend
         * @param legend the legend params object
         * @return the legend slice matching with the value
         */
        getLegendSlice: function (value, legend) {
            for (var i = 0, length = legend.slices.length; i < length; ++i) {
                if ((legend.slices[i].sliceValue !== undefined && value == legend.slices[i].sliceValue)
                    || ((legend.slices[i].sliceValue === undefined)
                    && (legend.slices[i].min === undefined || value >= legend.slices[i].min)
                    && (legend.slices[i].max === undefined || value <= legend.slices[i].max))
                ) {
                    return legend.slices[i];
                }
            }
            return {};
        },

        /*
         * Animated view box changes
         * As from http://code.voidblossom.com/animating-viewbox-easing-formulas/,
         * (from https://github.com/theshaun works on mapael)
         * @param x coordinate of the point to focus on
         * @param y coordinate of the point to focus on
         * @param w map defined width
         * @param h map defined height
         * @param duration defined length of time for animation
         * @param easingFunction defined Raphael supported easing_formula to use
         * @param callback method when animated action is complete
         */
        animateViewBox: function (x, y, w, h, duration, easingFunction) {
            var self = this;
            var cx = self.paper._viewBox ? self.paper._viewBox[0] : 0;
            var dx = x - cx;
            var cy = self.paper._viewBox ? self.paper._viewBox[1] : 0;
            var dy = y - cy;
            var cw = self.paper._viewBox ? self.paper._viewBox[2] : self.paper.width;
            var dw = w - cw;
            var ch = self.paper._viewBox ? self.paper._viewBox[3] : self.paper.height;
            var dh = h - ch;
            var interval = 25;
            var steps = duration / interval;
            var currentStep = 0;
            var easingFormula;

            easingFunction = easingFunction || "linear";
            easingFormula = Raphael.easing_formulas[easingFunction];

            clearInterval(self.animationIntervalID);

            self.animationIntervalID = setInterval(function () {
                    var ratio = currentStep / steps;
                    self.paper.setViewBox(cx + dx * easingFormula(ratio),
                        cy + dy * easingFormula(ratio),
                        cw + dw * easingFormula(ratio),
                        ch + dh * easingFormula(ratio), false);
                    if (currentStep++ >= steps) {
                        clearInterval(self.animationIntervalID);
                        clearTimeout(self.zoomTO);
                        self.zoomTO = setTimeout(function () {
                            self.$map.trigger("afterZoom", {x1: x, y1: y, x2: (x + w), y2: (y + h)});
                        }, 150);
                    }
                }, interval
            );
        },

        /*
         * Check for Raphael bug regarding drawing while beeing hidden (under display:none)
         * See https://github.com/neveldo/jQuery-Mapael/issues/135
         * @return true/false
         *
         * Wants to override this behavior? Use prototype overriding:
         *     $.mapael.prototype.isRaphaelBBoxBugPresent = function() {return false;};
         */
        isRaphaelBBoxBugPresent: function(){
            var self = this;
            // Draw text, then get its boundaries
            var text_elem = self.paper.text(-50, -50, "TEST");
            var text_elem_bbox = text_elem.getBBox();
            // remove element
            text_elem.remove();
            // If it has no height and width, then the paper is hidden
            return (text_elem_bbox.width === 0 && text_elem_bbox.height === 0);
        },

        // Default map options
        defaultOptions: {
            map: {
                cssClass: "map",
                tooltip: {
                    cssClass: "mapTooltip"
                },
                defaultArea: {
                    attrs: {
                        fill: "#343434",
                        stroke: "#5d5d5d",
                        "stroke-width": 1,
                        "stroke-linejoin": "round"
                    },
                    attrsHover: {
                        fill: "#f38a03",
                        animDuration: 300
                    },
                    text: {
                        position: "inner",
                        margin: 10,
                        attrs: {
                            "font-size": 15,
                            fill: "#c7c7c7"
                        },
                        attrsHover: {
                            fill: "#eaeaea",
                            "animDuration": 300
                        }
                    },
                    target: "_self",
                    cssClass: "area"
                },
                defaultPlot: {
                    type: "circle",
                    size: 15,
                    attrs: {
                        fill: "#0088db",
                        stroke: "#fff",
                        "stroke-width": 0,
                        "stroke-linejoin": "round"
                    },
                    attrsHover: {
                        "stroke-width": 3,
                        animDuration: 300
                    },
                    text: {
                        position: "right",
                        margin: 10,
                        attrs: {
                            "font-size": 15,
                            fill: "#c7c7c7"
                        },
                        attrsHover: {
                            fill: "#eaeaea",
                            animDuration: 300
                        }
                    },
                    target: "_self",
                    cssClass: "plot"
                },
                defaultLink: {
                    factor: 0.5,
                    attrs: {
                        stroke: "#0088db",
                        "stroke-width": 2
                    },
                    attrsHover: {
                        animDuration: 300
                    },
                    text: {
                        position: "inner",
                        margin: 10,
                        attrs: {
                            "font-size": 15,
                            fill: "#c7c7c7"
                        },
                        attrsHover: {
                            fill: "#eaeaea",
                            animDuration: 300
                        }
                    },
                    target: "_self",
                    cssClass: "link"
                },
                zoom: {
                    enabled: false,
                    minLevel: 0,
                    maxLevel: 10,
                    step: 0.25,
                    mousewheel: true,
                    touch: true,
                    animDuration: 200,
                    animEasing: "linear",
                    buttons: {
                        "reset": {
                            cssClass: "zoomButton zoomReset",
                            content: "&#8226;", // bullet sign
                            title: "Reset zoom"
                        },
                        "in": {
                            cssClass: "zoomButton zoomIn",
                            content: "+",
                            title: "Zoom in"
                        },
                        "out": {
                            cssClass: "zoomButton zoomOut",
                            content: "&#8722;", // minus sign
                            title: "Zoom out"
                        }
                    }
                }
            },
            legend: {
                redrawOnResize: true,
                area: [],
                plot: []
            },
            areas: {},
            plots: {},
            links: {}
        },

        // Default legends option
        legendDefaultOptions: {
            area: {
                cssClass: "areaLegend",
                display: true,
                marginLeft: 10,
                marginLeftTitle: 5,
                marginBottomTitle: 10,
                marginLeftLabel: 10,
                marginBottom: 10,
                titleAttrs: {
                    "font-size": 16,
                    fill: "#343434",
                    "text-anchor": "start"
                },
                labelAttrs: {
                    "font-size": 12,
                    fill: "#343434",
                    "text-anchor": "start"
                },
                labelAttrsHover: {
                    fill: "#787878",
                    animDuration: 300
                },
                hideElemsOnClick: {
                    enabled: true,
                    opacity: 0.2,
                    animDuration: 300
                },
                slices: [],
                mode: "vertical"
            },
            plot: {
                cssClass: "plotLegend",
                display: true,
                marginLeft: 10,
                marginLeftTitle: 5,
                marginBottomTitle: 10,
                marginLeftLabel: 10,
                marginBottom: 10,
                titleAttrs: {
                    "font-size": 16,
                    fill: "#343434",
                    "text-anchor": "start"
                },
                labelAttrs: {
                    "font-size": 12,
                    fill: "#343434",
                    "text-anchor": "start"
                },
                labelAttrsHover: {
                    fill: "#787878",
                    animDuration: 300
                },
                hideElemsOnClick: {
                    enabled: true,
                    opacity: 0.2,
                    animDuration: 300
                },
                slices: [],
                mode: "vertical"
            }
        }

    };

    // Extend jQuery with Mapael
    if ($[pluginName] === undefined) $[pluginName] = Mapael;

    // Add jQuery DOM function
    $.fn[pluginName] = function (options) {
        // Call Mapael on each element
        return this.each(function () {
            // Avoid leaking problem on multiple instanciation by removing an old mapael object on a container
            if ($.data(this, pluginName)) {
                $.data(this, pluginName).destroy();
            }
            // Create Mapael and save it as jQuery data
            // This allow external access to Mapael using $(".mapcontainer").data("mapael")
            $.data(this, pluginName, new Mapael(this, options));
        });
    };

    return Mapael;

}));

}.call(window));

/***/ }),

/***/ 1391:
/***/ (function(module, exports, __webpack_require__) {

/*!
 *
 * Jquery Mapael - Dynamic maps jQuery plugin (based on raphael.js)
 * Requires jQuery, raphael.js and jquery.mousewheel
 *
 * Version: 2.1.0
 *
 * Copyright (c) 2017 Vincent Brouté (https://www.vincentbroute.fr/mapael)
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 *
 * Thanks to Indigo744
 *
 */
(function (factory) {
    if (true) {
        // CommonJS
        module.exports = factory(__webpack_require__(72), __webpack_require__(1254), __webpack_require__(1161));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'raphael', 'mousewheel'], factory);
    } else {
        // Browser globals
        factory(jQuery, Raphael, jQuery.fn.mousewheel);
    }
}(function ($, Raphael, mousewheel, undefined) {

    "use strict";

    // The plugin name (used on several places)
    var pluginName = "mapael";

    // Version number of jQuery Mapael. See http://semver.org/ for more information.
    var version = "2.1.0";

    /*
     * Mapael constructor
     * Init instance vars and call init()
     * @param container the DOM element on which to apply the plugin
     * @param options the complete options to use
     */
    var Mapael = function (container, options) {
        var self = this;

        // the global container (DOM element object)
        self.container = container;

        // the global container (jQuery object)
        self.$container = $(container);

        // the global options
        self.options = self.extendDefaultOptions(options);

        // zoom TimeOut handler (used to set and clear)
        self.zoomTO = 0;

        // zoom center coordinate (set at touchstart)
        self.zoomCenterX = 0;
        self.zoomCenterY = 0;

        // Zoom pinch (set at touchstart and touchmove)
        self.previousPinchDist = 0;

        // Zoom data
        self.zoomData = {
            zoomLevel: 0,
            zoomX: 0,
            zoomY: 0,
            panX: 0,
            panY: 0
        };

        // resize TimeOut handler (used to set and clear)
        self.resizeTO = 0;

        // Panning: tell if panning action is in progress
        self.panning = false;

        // Panning TimeOut handler (used to set and clear)
        self.panningTO = 0;

        // Animate view box Interval handler (used to set and clear)
        self.animationIntervalID = null;

        // Map subcontainer jQuery object
        self.$map = $("." + self.options.map.cssClass, self.container);

        // Save initial HTML content (used by destroy method)
        self.initialMapHTMLContent = self.$map.html();

        // Allow to store legend containers and initial contents (used by destroy method)
        self.createdLegends = {};

        // The tooltip jQuery object
        self.$tooltip = {};

        // The paper Raphael object
        self.paper = {};

        // The areas object list
        self.areas = {};

        // The plots object list
        self.plots = {};

        // The links object list
        self.links = {};

        // The map configuration object (taken from map file)
        self.mapConf = {};

        // Let's start the initialization
        self.init();
    };

    /*
     * Mapael Prototype
     * Defines all methods and properties needed by Mapael
     * Each mapael object inherits their properties and methods from this prototype
     */
    Mapael.prototype = {

        /*
         * Version number
         */
        version: version,

        /*
         * Initialize the plugin
         * Called by the constructor
         */
        init: function () {
            var self = this;

            // Init check for class existence
            if (self.options.map.cssClass === "" || $("." + self.options.map.cssClass, self.container).length === 0) {
                throw new Error("The map class `" + self.options.map.cssClass + "` doesn't exists");
            }

            // Create the tooltip container
            self.$tooltip = $("<div>").addClass(self.options.map.tooltip.cssClass).css("display", "none");

            // Get the map container, empty it then append tooltip
            self.$map.empty().append(self.$tooltip);

            // Get the map from $.mapael or $.fn.mapael (backward compatibility)
            if ($[pluginName] && $[pluginName].maps && $[pluginName].maps[self.options.map.name]) {
                // Mapael version >= 2.x
                self.mapConf = $[pluginName].maps[self.options.map.name];
            } else if ($.fn[pluginName] && $.fn[pluginName].maps && $.fn[pluginName].maps[self.options.map.name]) {
                // Mapael version <= 1.x - DEPRECATED
                self.mapConf = $.fn[pluginName].maps[self.options.map.name];
                if (window.console && window.console.warn) {
                    window.console.warn("Extending $.fn.mapael is deprecated (map '" + self.options.map.name + "')");
                }
            } else {
                throw new Error("Unknown map '" + self.options.map.name + "'");
            }

            // Create Raphael paper
            self.paper = new Raphael(self.$map[0], self.mapConf.width, self.mapConf.height);

            // issue #135: Check for Raphael bug on text element boundaries
            if (self.isRaphaelBBoxBugPresent() === true) {
                self.destroy();
                throw new Error("Can't get boundary box for text (is your container hidden? See #135)");
            }

            // add plugin class name on element
            self.$container.addClass(pluginName);

            if (self.options.map.tooltip.css) self.$tooltip.css(self.options.map.tooltip.css);
            self.paper.setViewBox(0, 0, self.mapConf.width, self.mapConf.height, false);

            // Handle map size
            if (self.options.map.width) {
                // NOT responsive: map has a fixed width
                self.paper.setSize(self.options.map.width, self.mapConf.height * (self.options.map.width / self.mapConf.width));

                // Create the legends for plots taking into account the scale of the map
                self.createLegends("plot", self.plots, (self.options.map.width / self.mapConf.width));
            } else {
                // Responsive: handle resizing of the map
                self.handleMapResizing();
            }

            // Draw map areas
            $.each(self.mapConf.elems, function (id) {
                var elemOptions = self.getElemOptions(
                    self.options.map.defaultArea,
                    (self.options.areas[id] ? self.options.areas[id] : {}),
                    self.options.legend.area
                );
                self.areas[id] = {"mapElem": self.paper.path(self.mapConf.elems[id]).attr(elemOptions.attrs)};
            });

            // Hook that allows to add custom processing on the map
            if (self.options.map.beforeInit) self.options.map.beforeInit(self.$container, self.paper, self.options);

            // Init map areas in a second loop (prevent texts to be hidden by map elements)
            $.each(self.mapConf.elems, function (id) {
                var elemOptions = self.getElemOptions(
                    self.options.map.defaultArea,
                    (self.options.areas[id] ? self.options.areas[id] : {}),
                    self.options.legend.area
                );
                self.initElem(self.areas[id], elemOptions, id);
            });

            // Draw links
            self.links = self.drawLinksCollection(self.options.links);

            // Draw plots
            $.each(self.options.plots, function (id) {
                self.plots[id] = self.drawPlot(id);
            });

            // Attach zoom event
            self.$container.on("zoom." + pluginName, function (e, zoomOptions) {
                self.onZoomEvent(e, zoomOptions);
            });

            if (self.options.map.zoom.enabled) {
                // Enable zoom
                self.initZoom(self.mapConf.width, self.mapConf.height, self.options.map.zoom);
            }

            // Set initial zoom
            if (self.options.map.zoom.init !== undefined) {
                if (self.options.map.zoom.init.animDuration === undefined) {
                    self.options.map.zoom.init.animDuration = 0;
                }
                self.$container.trigger("zoom", self.options.map.zoom.init);
            }

            // Create the legends for areas
            self.createLegends("area", self.areas, 1);

            // Attach update event
            self.$container.on("update." + pluginName, function (e, opt) {
                self.onUpdateEvent(e, opt);
            });

            // Attach showElementsInRange event
            self.$container.on("showElementsInRange." + pluginName, function (e, opt) {
                self.onShowElementsInRange(e, opt);
            });

            // Hook that allows to add custom processing on the map
            if (self.options.map.afterInit) self.options.map.afterInit(self.$container, self.paper, self.areas, self.plots, self.options);

            $(self.paper.desc).append(" and Mapael " + self.version + " (https://www.vincentbroute.fr/mapael/)");
        },

        /*
         * Destroy mapael
         * This function effectively detach mapael from the container
         *   - Set the container back to the way it was before mapael instanciation
         *   - Remove all data associated to it (memory can then be free'ed by browser)
         *
         * This method can be call directly by user:
         *     $(".mapcontainer").data("mapael").destroy();
         *
         * This method is also automatically called if the user try to call mapael
         * on a container already containing a mapael instance
         */
        destroy: function () {
            var self = this;

            // Detach all event listeners attached to the container
            self.$container.off("." + pluginName);
            self.$map.off("." + pluginName);

            // Detach the global resize event handler
            if (self.onResizeEvent) $(window).off("resize." + pluginName, self.onResizeEvent);

            // Empty the container (this will also detach all event listeners)
            self.$map.empty();

            // Replace initial HTML content
            self.$map.html(self.initialMapHTMLContent);

            // Empty legend containers and replace initial HTML content
            for (var id in self.createdLegends) {
                self.createdLegends[id].container.empty();
                self.createdLegends[id].container.html(self.createdLegends[id].initialHTMLContent);
            }

            // Remove mapael class
            self.$container.removeClass(pluginName);

            // Remove the data
            self.$container.removeData(pluginName);

            // Remove all internal reference
            self.container = undefined;
            self.$container = undefined;
            self.options = undefined;
            self.paper = undefined;
            self.$map = undefined;
            self.$tooltip = undefined;
            self.mapConf = undefined;
            self.areas = undefined;
            self.plots = undefined;
            self.links = undefined;
        },

        handleMapResizing: function () {
            var self = this;

            // onResizeEvent: call when the window element trigger the resize event
            // We create it inside this function (and not in the prototype) in order to have a closure
            // Otherwise, in the prototype, 'this' when triggered is *not* the mapael object but the global window
            self.onResizeEvent = function () {
                // Clear any previous setTimeout (avoid too much triggering)
                clearTimeout(self.resizeTO);
                // setTimeout to wait for the user to finish its resizing
                self.resizeTO = setTimeout(function () {
                    self.$map.trigger("resizeEnd");
                }, 150);
            };

            // Attach resize handler
            $(window).on("resize." + pluginName, self.onResizeEvent);

            // Attach resize end handler, and call it once
            self.$map.on("resizeEnd." + pluginName, function (e, isInit) {
                var containerWidth = self.$map.width();

                if (self.paper.width != containerWidth) {
                    var newScale = containerWidth / self.mapConf.width;
                    // Set new size
                    self.paper.setSize(containerWidth, self.mapConf.height * newScale);

                    // Create plots legend again to take into account the new scale
                    if (isInit || self.options.legend.redrawOnResize) {
                        self.createLegends("plot", self.plots, newScale);
                    }
                }
            }).trigger("resizeEnd", [true]);
        },

        /*
         * Extend the user option with the default one
         * @param options the user options
         * @return new options object
         */
        extendDefaultOptions: function (options) {

            // Extend default options with user options
            options = $.extend(true, {}, Mapael.prototype.defaultOptions, options);

            // Extend legend default options
            $.each(['area', 'plot'], function (key, type) {
                if ($.isArray(options.legend[type])) {
                    for (var i = 0; i < options.legend[type].length; ++i)
                        options.legend[type][i] = $.extend(true, {}, Mapael.prototype.legendDefaultOptions[type], options.legend[type][i]);
                } else {
                    options.legend[type] = $.extend(true, {}, Mapael.prototype.legendDefaultOptions[type], options.legend[type]);
                }
            });

            return options;
        },

        /*
         * Init the element "elem" on the map (drawing, setting attributes, events, tooltip, ...)
         */
        initElem: function (elem, elemOptions, id) {
            var self = this;
            var bbox = {};
            var textPosition = {};

            // Assign value attribute to element
            if (elemOptions.value !== undefined){
                elem.value = elemOptions.value;
            }

            // Init the label related to the element
            if (elemOptions.text && elemOptions.text.content !== undefined) {
                // Set a text label in the area
                bbox = elem.mapElem.getBBox();
                textPosition = self.getTextPosition(bbox, elemOptions.text.position, elemOptions.text.margin);
                elemOptions.text.attrs["text-anchor"] = textPosition.textAnchor;
                elem.textElem = self.paper.text(textPosition.x, textPosition.y, elemOptions.text.content).attr(elemOptions.text.attrs);
                $(elem.textElem.node).attr("data-id", id);
            }

            // Set user event handlers
            if (elemOptions.eventHandlers) self.setEventHandlers(id, elemOptions, elem.mapElem, elem.textElem);

            // Set hover option for mapElem
            self.setHoverOptions(elem.mapElem, elemOptions.attrs, elemOptions.attrsHover);

            // Set hover option for textElem
            if (elem.textElem) self.setHoverOptions(elem.textElem, elemOptions.text.attrs, elemOptions.text.attrsHover);

            // Set hover behavior only if attrsHover is set for area or for text
            if (($.isEmptyObject(elemOptions.attrsHover) === false) ||
                (elem.textElem && $.isEmptyObject(elemOptions.text.attrsHover) === false)) {
                // Set hover behavior
                self.setHover(elem.mapElem, elem.textElem);
            }

            // Init the tooltip
            if (elemOptions.tooltip) {
                elem.mapElem.tooltip = elemOptions.tooltip;
                self.setTooltip(elem.mapElem);

                if (elemOptions.text && elemOptions.text.content !== undefined) {
                    elem.textElem.tooltip = elemOptions.tooltip;
                    self.setTooltip(elem.textElem);
                }
            }

            // Init the link
            if (elemOptions.href) {
                elem.mapElem.href = elemOptions.href;
                elem.mapElem.target = elemOptions.target;
                self.setHref(elem.mapElem);

                if (elemOptions.text && elemOptions.text.content !== undefined) {
                    elem.textElem.href = elemOptions.href;
                    elem.textElem.target = elemOptions.target;
                    self.setHref(elem.textElem);
                }
            }

            if (elemOptions.cssClass !== undefined) {
                $(elem.mapElem.node).addClass(elemOptions.cssClass);
            }

            $(elem.mapElem.node).attr("data-id", id);
        },

        /*
         * Init zoom and panning for the map
         * @param mapWidth
         * @param mapHeight
         * @param zoomOptions
         */
        initZoom: function (mapWidth, mapHeight, zoomOptions) {
            var self = this;
            var mousedown = false;
            var previousX = 0;
            var previousY = 0;
            var fnZoomButtons = {
                "reset": function () {
                    self.$container.trigger("zoom", {"level": 0});
                },
                "in": function () {
                    self.$container.trigger("zoom", {"level": "+1"});
                },
                "out": function () {
                    self.$container.trigger("zoom", {"level": -1});
                }
            };

            // init Zoom data
            $.extend(self.zoomData, {
                zoomLevel: 0,
                panX: 0,
                panY: 0
            });

            // init zoom buttons
            $.each(zoomOptions.buttons, function(type, opt) {
                if (fnZoomButtons[type] === undefined) throw new Error("Unknown zoom button '" + type + "'");
                // Create div with classes, contents and title (for tooltip)
                var $button = $("<div>").addClass(opt.cssClass)
                    .html(opt.content)
                    .attr("title", opt.title);
                // Assign click event
                $button.on("click." + pluginName, fnZoomButtons[type]);
                // Append to map
                self.$map.append($button);
            });

            // Update the zoom level of the map on mousewheel
            if (self.options.map.zoom.mousewheel) {
                self.$map.on("mousewheel." + pluginName, function (e) {
                    var zoomLevel = (e.deltaY > 0) ? 1 : -1;
                    var coord = self.mapPagePositionToXY(e.pageX, e.pageY);

                    self.$container.trigger("zoom", {
                        "fixedCenter": true,
                        "level": self.zoomData.zoomLevel + zoomLevel,
                        "x": coord.x,
                        "y": coord.y
                    });

                    e.preventDefault();
                });
            }

            // Update the zoom level of the map on touch pinch
            if (self.options.map.zoom.touch) {
                self.$map.on("touchstart." + pluginName, function (e) {
                    if (e.originalEvent.touches.length === 2) {
                        self.zoomCenterX = (e.originalEvent.touches[0].pageX + e.originalEvent.touches[1].pageX) / 2;
                        self.zoomCenterY = (e.originalEvent.touches[0].pageY + e.originalEvent.touches[1].pageY) / 2;
                        self.previousPinchDist = Math.sqrt(Math.pow((e.originalEvent.touches[1].pageX - e.originalEvent.touches[0].pageX), 2) + Math.pow((e.originalEvent.touches[1].pageY - e.originalEvent.touches[0].pageY), 2));
                    }
                });

                self.$map.on("touchmove." + pluginName, function (e) {
                    var pinchDist = 0;
                    var zoomLevel = 0;

                    if (e.originalEvent.touches.length === 2) {
                        pinchDist = Math.sqrt(Math.pow((e.originalEvent.touches[1].pageX - e.originalEvent.touches[0].pageX), 2) + Math.pow((e.originalEvent.touches[1].pageY - e.originalEvent.touches[0].pageY), 2));

                        if (Math.abs(pinchDist - self.previousPinchDist) > 15) {
                            var coord = self.mapPagePositionToXY(self.zoomCenterX, self.zoomCenterY);
                            zoomLevel = (pinchDist - self.previousPinchDist) / Math.abs(pinchDist - self.previousPinchDist);
                            self.$container.trigger("zoom", {
                                "fixedCenter": true,
                                "level": self.zoomData.zoomLevel + zoomLevel,
                                "x": coord.x,
                                "y": coord.y
                            });
                            self.previousPinchDist = pinchDist;
                        }
                        return false;
                    }
                });
            }

            // When the user drag the map, prevent to move the clicked element instead of dragging the map (behaviour seen with Firefox)
            self.$map.on("dragstart", function() {
                return false;
            });

            // Panning
            $("body").on("mouseup." + pluginName + (zoomOptions.touch ? " touchend." + pluginName : ""), function () {
                mousedown = false;
                setTimeout(function () {
                    self.panning = false;
                }, 50);
            });

            self.$map.on("mousedown." + pluginName + (zoomOptions.touch ? " touchstart." + pluginName : ""), function (e) {
                if (e.pageX !== undefined) {
                    mousedown = true;
                    previousX = e.pageX;
                    previousY = e.pageY;
                } else {
                    if (e.originalEvent.touches.length === 1) {
                        mousedown = true;
                        previousX = e.originalEvent.touches[0].pageX;
                        previousY = e.originalEvent.touches[0].pageY;
                    }
                }
            }).on("mousemove." + pluginName + (zoomOptions.touch ? " touchmove." + pluginName : ""), function (e) {
                var currentLevel = self.zoomData.zoomLevel;
                var pageX = 0;
                var pageY = 0;

                if (e.pageX !== undefined) {
                    pageX = e.pageX;
                    pageY = e.pageY;
                } else {
                    if (e.originalEvent.touches.length === 1) {
                        pageX = e.originalEvent.touches[0].pageX;
                        pageY = e.originalEvent.touches[0].pageY;
                    } else {
                        mousedown = false;
                    }
                }

                if (mousedown && currentLevel !== 0) {
                    var offsetX = (previousX - pageX) / (1 + (currentLevel * zoomOptions.step)) * (mapWidth / self.paper.width);
                    var offsetY = (previousY - pageY) / (1 + (currentLevel * zoomOptions.step)) * (mapHeight / self.paper.height);
                    var panX = Math.min(Math.max(0, self.paper._viewBox[0] + offsetX), (mapWidth - self.paper._viewBox[2]));
                    var panY = Math.min(Math.max(0, self.paper._viewBox[1] + offsetY), (mapHeight - self.paper._viewBox[3]));

                    if (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
                        $.extend(self.zoomData, {
                            panX: panX,
                            panY: panY,
                            zoomX: panX + self.paper._viewBox[2] / 2,
                            zoomY: panY + self.paper._viewBox[3] / 2
                        });
                        self.paper.setViewBox(panX, panY, self.paper._viewBox[2], self.paper._viewBox[3]);

                        clearTimeout(self.panningTO);
                        self.panningTO = setTimeout(function () {
                            self.$map.trigger("afterPanning", {
                                x1: panX,
                                y1: panY,
                                x2: (panX + self.paper._viewBox[2]),
                                y2: (panY + self.paper._viewBox[3])
                            });
                        }, 150);

                        previousX = pageX;
                        previousY = pageY;
                        self.panning = true;
                    }
                    return false;
                }
            });
        },

        /*
         * Map a mouse position to a map position
         *      Transformation principle:
         *          ** start with (pageX, pageY) absolute mouse coordinate
         *          - Apply translation: take into accounts the map offset in the page
         *          ** from this point, we have relative mouse coordinate
         *          - Apply homothetic transformation: take into accounts initial factor of map sizing (fullWidth / actualWidth)
         *          - Apply homothetic transformation: take into accounts the zoom factor
         *          ** from this point, we have relative map coordinate
         *          - Apply translation: take into accounts the current panning of the map
         *          ** from this point, we have absolute map coordinate
         * @param pageX: mouse client coordinate on X
         * @param pageY: mouse client coordinate on Y
         * @return map coordinate {x, y}
         */
        mapPagePositionToXY: function(pageX, pageY) {
            var self = this;
            var offset = self.$map.offset();
            var initFactor = (self.options.map.width) ? (self.mapConf.width / self.options.map.width) : (self.mapConf.width / self.$map.width());
            var zoomFactor = 1 / (1 + (self.zoomData.zoomLevel * self.options.map.zoom.step));
            return {
                x: (zoomFactor * initFactor * (pageX - offset.left)) + self.zoomData.panX,
                y: (zoomFactor * initFactor * (pageY - offset.top)) + self.zoomData.panY
            };
        },

        /*
         * Zoom on the map at a specific level focused on specific coordinates
         * If no coordinates are specified, the zoom will be focused on the center of the map
         * options :
         *    "level" : level of the zoom between minLevel and maxLevel
         *    "x" or "latitude" : x coordinate or latitude of the point to focus on
         *    "y" or "longitude" : y coordinate or longitude of the point to focus on
         *    "fixedCenter" : set to true in order to preserve the position of x,y in the canvas when zoomed
         *    "animDuration" : zoom duration
         */
        onZoomEvent: function (e, zoomOptions) {
            var self = this;
            var newLevel = self.zoomData.zoomLevel;
            var panX = 0;
            var panY = 0;
            var previousZoomLevel = (1 + self.zoomData.zoomLevel * self.options.map.zoom.step);
            var zoomLevel = 0;
            var animDuration = (zoomOptions.animDuration !== undefined) ? zoomOptions.animDuration : self.options.map.zoom.animDuration;
            var offsetX = 0;
            var offsetY = 0;
            var coords = {};

            // Get user defined zoom level
            if (zoomOptions.level !== undefined) {
                if (typeof zoomOptions.level === "string") {
                    // level is a string, either "n", "+n" or "-n"
                    if ((zoomOptions.level.slice(0, 1) === '+') || (zoomOptions.level.slice(0, 1) === '-')) {
                        // zoomLevel is relative
                        newLevel = self.zoomData.zoomLevel + parseInt(zoomOptions.level);
                    } else {
                        // zoomLevel is absolute
                        newLevel = parseInt(zoomOptions.level);
                    }
                } else {
                    // level is integer
                    if (zoomOptions.level < 0) {
                        // zoomLevel is relative
                        newLevel = self.zoomData.zoomLevel + zoomOptions.level;
                    } else {
                        // zoomLevel is absolute
                        newLevel = zoomOptions.level;
                    }
                }
                // Make sure we stay in the boundaries
                newLevel = Math.min(Math.max(newLevel, self.options.map.zoom.minLevel), self.options.map.zoom.maxLevel);
            }

            zoomLevel = (1 + newLevel * self.options.map.zoom.step);

            if (zoomOptions.latitude !== undefined && zoomOptions.longitude !== undefined) {
                coords = self.mapConf.getCoords(zoomOptions.latitude, zoomOptions.longitude);
                zoomOptions.x = coords.x;
                zoomOptions.y = coords.y;
            }

            if (zoomOptions.x === undefined)
                zoomOptions.x = self.paper._viewBox[0] + self.paper._viewBox[2] / 2;

            if (zoomOptions.y === undefined)
                zoomOptions.y = (self.paper._viewBox[1] + self.paper._viewBox[3] / 2);

            if (newLevel === 0) {
                panX = 0;
                panY = 0;
            } else if (zoomOptions.fixedCenter !== undefined && zoomOptions.fixedCenter === true) {
                offsetX = self.zoomData.panX + ((zoomOptions.x - self.zoomData.panX) * (zoomLevel - previousZoomLevel)) / zoomLevel;
                offsetY = self.zoomData.panY + ((zoomOptions.y - self.zoomData.panY) * (zoomLevel - previousZoomLevel)) / zoomLevel;

                panX = Math.min(Math.max(0, offsetX), (self.mapConf.width - (self.mapConf.width / zoomLevel)));
                panY = Math.min(Math.max(0, offsetY), (self.mapConf.height - (self.mapConf.height / zoomLevel)));
            } else {
                panX = Math.min(Math.max(0, zoomOptions.x - (self.mapConf.width / zoomLevel) / 2), (self.mapConf.width - (self.mapConf.width / zoomLevel)));
                panY = Math.min(Math.max(0, zoomOptions.y - (self.mapConf.height / zoomLevel) / 2), (self.mapConf.height - (self.mapConf.height / zoomLevel)));
            }

            // Update zoom level of the map
            if (zoomLevel == previousZoomLevel && panX == self.zoomData.panX && panY == self.zoomData.panY) return;

            if (animDuration > 0) {
                self.animateViewBox(panX, panY, self.mapConf.width / zoomLevel, self.mapConf.height / zoomLevel, animDuration, self.options.map.zoom.animEasing);
            } else {
                self.paper.setViewBox(panX, panY, self.mapConf.width / zoomLevel, self.mapConf.height / zoomLevel);
                clearTimeout(self.zoomTO);
                self.zoomTO = setTimeout(function () {
                    self.$map.trigger("afterZoom", {
                        x1: panX,
                        y1: panY,
                        x2: (panX + (self.mapConf.width / zoomLevel)),
                        y2: (panY + (self.mapConf.height / zoomLevel))
                    });
                }, 150);
            }

            $.extend(self.zoomData, {
                zoomLevel: newLevel,
                panX: panX,
                panY: panY,
                zoomX: panX + self.paper._viewBox[2] / 2,
                zoomY: panY + self.paper._viewBox[3] / 2
            });
        },

        /*
         * Show some element in range defined by user
         * Triggered by user $(".mapcontainer").trigger("showElementsInRange", [opt]);
         *
         * @param opt the options
         *  opt.hiddenOpacity opacity for hidden element (default = 0.3)
         *  opt.animDuration animation duration in ms (default = 0)
         *  opt.afterShowRange callback
         *  opt.ranges the range to show:
         *  Example:
         *  opt.ranges = {
         *      'plot' : {
         *          0 : {                        // valueIndex
         *              'min': 1000,
         *              'max': 1200
         *          },
         *          1 : {                        // valueIndex
         *              'min': 10,
         *              'max': 12
         *          }
         *      },
         *      'area' : {
         *          {'min': 10, 'max': 20}    // No valueIndex, only an object, use 0 as valueIndex (easy case)
         *      }
         *  }
         */
        onShowElementsInRange: function(e, opt) {
            var self = this;

            // set animDuration to default if not defined
            if (opt.animDuration === undefined) {
                opt.animDuration = 0;
            }

            // set hiddenOpacity to default if not defined
            if (opt.hiddenOpacity === undefined) {
                opt.hiddenOpacity = 0.3;
            }

            // handle area
            if (opt.ranges && opt.ranges.area) {
                self.showElemByRange(opt.ranges.area, self.areas, opt.hiddenOpacity, opt.animDuration);
            }

            // handle plot
            if (opt.ranges && opt.ranges.plot) {
                self.showElemByRange(opt.ranges.plot, self.plots, opt.hiddenOpacity, opt.animDuration);
            }

            // handle link
            if (opt.ranges && opt.ranges.link) {
                self.showElemByRange(opt.ranges.link, self.links, opt.hiddenOpacity, opt.animDuration);
            }

            // Call user callback
            if (opt.afterShowRange) opt.afterShowRange();
        },

        /*
         * Show some element in range
         * @param ranges: the ranges
         * @param elems: list of element on which to check against previous range
         * @hiddenOpacity: the opacity when hidden
         * @animDuration: the animation duration
         */
        showElemByRange: function(ranges, elems, hiddenOpacity, animDuration) {
            var self = this;
            // Hold the final opacity value for all elements consolidated after applying each ranges
            // This allow to set the opacity only once for each elements
            var elemsFinalOpacity = {};

            // set object with one valueIndex to 0 if we have directly the min/max
            if (ranges.min !== undefined || ranges.max !== undefined) {
                ranges = {0: ranges};
            }

            // Loop through each valueIndex
            $.each(ranges, function (valueIndex) {
                var range = ranges[valueIndex];
                // Check if user defined at least a min or max value
                if (range.min === undefined && range.max === undefined) {
                    return true; // skip this iteration (each loop), goto next range
                }
                // Loop through each elements
                $.each(elems, function (id) {
                    var elemValue = elems[id].value;
                    // set value with one valueIndex to 0 if not object
                    if (typeof elemValue !== "object") {
                        elemValue = [elemValue];
                    }
                    // Check existence of this value index
                    if (elemValue[valueIndex] === undefined) {
                        return true; // skip this iteration (each loop), goto next element
                    }
                    // Check if in range
                    if ((range.min !== undefined && elemValue[valueIndex] < range.min) ||
                        (range.max !== undefined && elemValue[valueIndex] > range.max)) {
                        // Element not in range
                        elemsFinalOpacity[id] = hiddenOpacity;
                    } else {
                        // Element in range
                        elemsFinalOpacity[id] = 1;
                    }
                });
            });
            // Now that we looped through all ranges, we can really assign the final opacity
            $.each(elemsFinalOpacity, function (id) {
                self.setElementOpacity(elems[id], elemsFinalOpacity[id], animDuration);
            });
        },

        /*
         * Set element opacity
         * Handle elem.mapElem and elem.textElem
         * @param elem the element
         * @param opacity the opacity to apply
         * @param animDuration the animation duration to use
         */
        setElementOpacity: function(elem, opacity, animDuration) {
            // Ensure no animation is running
            //elem.mapElem.stop();
            //if (elem.textElem) elem.textElem.stop();

            // If final opacity is not null, ensure element is shown before proceeding
            if (opacity > 0) {
                elem.mapElem.show();
                if (elem.textElem) elem.textElem.show();
            }
            if (animDuration > 0) {
                // Animate attribute
                elem.mapElem.animate({"opacity": opacity}, animDuration, "linear", function () {
                    // If final attribute is 0, hide
                    if (opacity === 0) elem.mapElem.hide();
                });
                // Handle text element
                if (elem.textElem) {
                    // Animate attribute
                    elem.textElem.animate({"opacity": opacity}, animDuration, "linear", function () {
                        // If final attribute is 0, hide
                        if (opacity === 0) elem.textElem.hide();
                    });
                }
            } else {
                // Set attribute
                elem.mapElem.attr({"opacity": opacity});
                // For null opacity, hide it
                if (opacity === 0) elem.mapElem.hide();
                // Handle text elemen
                if (elem.textElem) {
                    // Set attribute
                    elem.textElem.attr({"opacity": opacity});
                    // For null opacity, hide it
                    if (opacity === 0) elem.textElem.hide();
                }
            }
        },

        /*
         *
         * Update the current map
         * Refresh attributes and tooltips for areas and plots
         * @param opt option for the refresh :
         *  opt.mapOptions: options to update for plots and areas
         *  opt.replaceOptions: whether mapsOptions should entirely replace current map options, or just extend it
         *  opt.opt.newPlots new plots to add to the map
         *  opt.newLinks new links to add to the map
         *  opt.deletePlotKeys plots to delete from the map (array, or "all" to remove all plots)
         *  opt.deleteLinkKeys links to remove from the map (array, or "all" to remove all links)
         *  opt.setLegendElemsState the state of legend elements to be set : show (default) or hide
         *  opt.animDuration animation duration in ms (default = 0)
         *  opt.afterUpdate Hook that allows to add custom processing on the map
         */
        onUpdateEvent: function (e, opt) {
            var self = this;
            // Abort if opt is undefined
            if (typeof opt !== "object")  return;

            var i = 0;
            var animDuration = (opt.animDuration) ? opt.animDuration : 0;

            // This function remove an element using animation (or not, depending on animDuration)
            // Used for deletePlotKeys and deleteLinkKeys
            var fnRemoveElement = function (elem) {
                // Unset all event handlers
                self.unsetHover(elem.mapElem, elem.textElem);
                if (animDuration > 0) {
                    elem.mapElem.animate({"opacity": 0}, animDuration, "linear", function () {
                        elem.mapElem.remove();
                    });
                    if (elem.textElem) {
                        elem.textElem.animate({"opacity": 0}, animDuration, "linear", function () {
                            elem.textElem.remove();
                        });
                    }
                } else {
                    elem.mapElem.remove();
                    if (elem.textElem) {
                        elem.textElem.remove();
                    }
                }
            };

            // This function show an element using animation
            // Used for newPlots and newLinks
            var fnShowElement = function (elem) {
                // Starts with hidden elements
                elem.mapElem.attr({opacity: 0});
                if (elem.textElem) elem.textElem.attr({opacity: 0});
                // Set final element opacity
                self.setElementOpacity(
                    elem,
                    (elem.mapElem.originalAttrs.opacity !== undefined) ? elem.mapElem.originalAttrs.opacity : 1,
                    animDuration
                );
            };

            if (typeof opt.mapOptions === "object") {
                if (opt.replaceOptions === true) self.options = self.extendDefaultOptions(opt.mapOptions);
                else $.extend(true, self.options, opt.mapOptions);

                // IF we update areas, plots or legend, then reset all legend state to "show"
                if (opt.mapOptions.areas !== undefined || opt.mapOptions.plots !== undefined || opt.mapOptions.legend !== undefined) {
                    $("[data-type='elem']", self.$container).each(function (id, elem) {
                        if ($(elem).attr('data-hidden') === "1") {
                            // Toggle state of element by clicking
                            $(elem).trigger("click", [false, animDuration]);
                        }
                    });
                }
            }

            // Delete plots by name if deletePlotKeys is array
            if (typeof opt.deletePlotKeys === "object") {
                for (; i < opt.deletePlotKeys.length; i++) {
                    if (self.plots[opt.deletePlotKeys[i]] !== undefined) {
                        fnRemoveElement(self.plots[opt.deletePlotKeys[i]]);
                        delete self.plots[opt.deletePlotKeys[i]];
                    }
                }
                // Delete ALL plots if deletePlotKeys is set to "all"
            } else if (opt.deletePlotKeys === "all") {
                $.each(self.plots, function (id, elem) {
                    fnRemoveElement(elem);
                });
                // Empty plots object
                self.plots = {};
            }

            // Delete links by name if deleteLinkKeys is array
            if (typeof opt.deleteLinkKeys === "object") {
                for (i = 0; i < opt.deleteLinkKeys.length; i++) {
                    if (self.links[opt.deleteLinkKeys[i]] !== undefined) {
                        fnRemoveElement(self.links[opt.deleteLinkKeys[i]]);
                        delete self.links[opt.deleteLinkKeys[i]];
                    }
                }
                // Delete ALL links if deleteLinkKeys is set to "all"
            } else if (opt.deleteLinkKeys === "all") {
                $.each(self.links, function (id, elem) {
                    fnRemoveElement(elem);
                });
                // Empty links object
                self.links = {};
            }

            // New plots
            if (typeof opt.newPlots === "object") {
                $.each(opt.newPlots, function (id) {
                    if (self.plots[id] === undefined) {
                        self.options.plots[id] = opt.newPlots[id];
                        self.plots[id] = self.drawPlot(id);
                        if (animDuration > 0) {
                            fnShowElement(self.plots[id]);
                        }
                    }
                });
            }

            // New links
            if (typeof opt.newLinks === "object") {
                var newLinks = self.drawLinksCollection(opt.newLinks);
                $.extend(self.links, newLinks);
                $.extend(self.options.links, opt.newLinks);
                if (animDuration > 0) {
                    $.each(newLinks, function (id) {
                        fnShowElement(newLinks[id]);
                    });
                }
            }

            // Update areas attributes and tooltips
            $.each(self.areas, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions === "object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultArea === "object")
                        || (typeof opt.mapOptions.areas === "object" && typeof opt.mapOptions.areas[id] === "object")
                        || (typeof opt.mapOptions.legend === "object" && typeof opt.mapOptions.legend.area === "object")
                    ))
                    || opt.replaceOptions === true
                ) {
                    var elemOptions = self.getElemOptions(
                        self.options.map.defaultArea,
                        (self.options.areas[id] ? self.options.areas[id] : {}),
                        self.options.legend.area
                    );
                    self.updateElem(elemOptions, self.areas[id], animDuration);
                }
            });

            // Update plots attributes and tooltips
            $.each(self.plots, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions ==="object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultPlot === "object")
                        || (typeof opt.mapOptions.plots === "object" && typeof opt.mapOptions.plots[id] === "object")
                        || (typeof opt.mapOptions.legend === "object" && typeof opt.mapOptions.legend.plot === "object")
                    ))
                    || opt.replaceOptions === true
                ) {
                    var elemOptions = self.getElemOptions(
                        self.options.map.defaultPlot,
                        (self.options.plots[id] ? self.options.plots[id] : {}),
                        self.options.legend.plot
                    );
                    if (elemOptions.type == "square") {
                        elemOptions.attrs.width = elemOptions.size;
                        elemOptions.attrs.height = elemOptions.size;
                        elemOptions.attrs.x = self.plots[id].mapElem.attrs.x - (elemOptions.size - self.plots[id].mapElem.attrs.width) / 2;
                        elemOptions.attrs.y = self.plots[id].mapElem.attrs.y - (elemOptions.size - self.plots[id].mapElem.attrs.height) / 2;
                    } else if (elemOptions.type == "image") {
                        elemOptions.attrs.width = elemOptions.width;
                        elemOptions.attrs.height = elemOptions.height;
                        elemOptions.attrs.x = self.plots[id].mapElem.attrs.x - (elemOptions.width - self.plots[id].mapElem.attrs.width) / 2;
                        elemOptions.attrs.y = self.plots[id].mapElem.attrs.y - (elemOptions.height - self.plots[id].mapElem.attrs.height) / 2;
                    } else if (elemOptions.type == "svg") {
                        if (elemOptions.attrs.transform !== undefined) {
                            elemOptions.attrs.transform = self.plots[id].mapElem.baseTransform + elemOptions.attrs.transform;
                        }
                    }else { // Default : circle
                        elemOptions.attrs.r = elemOptions.size / 2;
                    }

                    self.updateElem(elemOptions, self.plots[id], animDuration);
                }
            });

            // Update links attributes and tooltips
            $.each(self.links, function (id) {
                // Avoid updating unchanged elements
                if ((typeof opt.mapOptions === "object" &&
                    (
                        (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultLink === "object")
                        || (typeof opt.mapOptions.links === "object" && typeof opt.mapOptions.links[id] === "object")
                    ))
                    || opt.replaceOptions === true
                ) {
                    var elemOptions = self.getElemOptions(
                        self.options.map.defaultLink,
                        (self.options.links[id] ? self.options.links[id] : {}),
                        {}
                    );

                    self.updateElem(elemOptions, self.links[id], animDuration);
                }
            });

            // Update legends
            if (opt.mapOptions && (
                    (typeof opt.mapOptions.legend === "object")
                    || (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultArea === "object")
                    || (typeof opt.mapOptions.map === "object" && typeof opt.mapOptions.map.defaultPlot === "object")
                )) {
                // Show all elements on the map before updating the legends
                $("[data-type='elem']", self.$container).each(function (id, elem) {
                    if ($(elem).attr('data-hidden') === "1") {
                        $(elem).trigger("click", [false, animDuration]);
                    }
                });

                self.createLegends("area", self.areas, 1);
                if (self.options.map.width) {
                    self.createLegends("plot", self.plots, (self.options.map.width / self.mapConf.width));
                } else {
                    self.createLegends("plot", self.plots, (self.$map.width() / self.mapConf.width));
                }
            }

            // Hide/Show all elements based on showlegendElems
            //      Toggle (i.e. click) only if:
            //          - slice legend is shown AND we want to hide
            //          - slice legend is hidden AND we want to show
            if (typeof opt.setLegendElemsState === "object") {
                // setLegendElemsState is an object listing the legend we want to hide/show
                $.each(opt.setLegendElemsState, function (legendCSSClass, action) {
                    // Search for the legend
                    var $legend = self.$container.find("." + legendCSSClass)[0];
                    if ($legend !== undefined) {
                        // Select all elem inside this legend
                        $("[data-type='elem']", $legend).each(function (id, elem) {
                            if (($(elem).attr('data-hidden') === "0" && action === "hide") ||
                                ($(elem).attr('data-hidden') === "1" && action === "show")) {
                                // Toggle state of element by clicking
                                $(elem).trigger("click", [false, animDuration]);
                            }
                        });
                    }
                });
            } else {
                // setLegendElemsState is a string, or is undefined
                // Default : "show"
                var action = (opt.setLegendElemsState === "hide") ? "hide" : "show";

                $("[data-type='elem']", self.$container).each(function (id, elem) {
                    if (($(elem).attr('data-hidden') === "0" && action === "hide") ||
                        ($(elem).attr('data-hidden') === "1" && action === "show")) {
                        // Toggle state of element by clicking
                        $(elem).trigger("click", [false, animDuration]);
                    }
                });
            }
            if (opt.afterUpdate) opt.afterUpdate(self.$container, self.paper, self.areas, self.plots, self.options);
        },

        /*
         * Draw all links between plots on the paper
         */
        drawLinksCollection: function (linksCollection) {
            var self = this;
            var p1 = {};
            var p2 = {};
            var coordsP1 = {};
            var coordsP2 = {};
            var links = {};

            $.each(linksCollection, function (id) {
                var elemOptions = self.getElemOptions(self.options.map.defaultLink, linksCollection[id], {});

                if (typeof linksCollection[id].between[0] == 'string') {
                    p1 = self.options.plots[linksCollection[id].between[0]];
                } else {
                    p1 = linksCollection[id].between[0];
                }

                if (typeof linksCollection[id].between[1] == 'string') {
                    p2 = self.options.plots[linksCollection[id].between[1]];
                } else {
                    p2 = linksCollection[id].between[1];
                }

                if (p1.latitude !== undefined && p1.longitude !== undefined) {
                    coordsP1 = self.mapConf.getCoords(p1.latitude, p1.longitude);
                } else {
                    coordsP1.x = p1.x;
                    coordsP1.y = p1.y;
                }

                if (p2.latitude !== undefined && p2.longitude !== undefined) {
                    coordsP2 = self.mapConf.getCoords(p2.latitude, p2.longitude);
                } else {
                    coordsP2.x = p2.x;
                    coordsP2.y = p2.y;
                }
                links[id] = self.drawLink(id, coordsP1.x, coordsP1.y, coordsP2.x, coordsP2.y, elemOptions);
            });
            return links;
        },

        /*
         * Draw a curved link between two couples of coordinates a(xa,ya) and b(xb, yb) on the paper
         */
        drawLink: function (id, xa, ya, xb, yb, elemOptions) {
            var self = this;
            var elem = {};
            // Compute the "curveto" SVG point, d(x,y)
            // c(xc, yc) is the center of (xa,ya) and (xb, yb)
            var xc = (xa + xb) / 2;
            var yc = (ya + yb) / 2;

            // Equation for (cd) : y = acd * x + bcd (d is the cure point)
            var acd = -1 / ((yb - ya) / (xb - xa));
            var bcd = yc - acd * xc;

            // dist(c,d) = dist(a,b) (=abDist)
            var abDist = Math.sqrt((xb - xa) * (xb - xa) + (yb - ya) * (yb - ya));

            // Solution for equation dist(cd) = sqrt((xd - xc)² + (yd - yc)²)
            // dist(c,d)² = (xd - xc)² + (yd - yc)²
            // We assume that dist(c,d) = dist(a,b)
            // so : (xd - xc)² + (yd - yc)² - dist(a,b)² = 0
            // With the factor : (xd - xc)² + (yd - yc)² - (factor*dist(a,b))² = 0
            // (xd - xc)² + (acd*xd + bcd - yc)² - (factor*dist(a,b))² = 0
            var a = 1 + acd * acd;
            var b = -2 * xc + 2 * acd * bcd - 2 * acd * yc;
            var c = xc * xc + bcd * bcd - bcd * yc - yc * bcd + yc * yc - ((elemOptions.factor * abDist) * (elemOptions.factor * abDist));
            var delta = b * b - 4 * a * c;
            var x = 0;
            var y = 0;

            // There are two solutions, we choose one or the other depending on the sign of the factor
            if (elemOptions.factor > 0) {
                x = (-b + Math.sqrt(delta)) / (2 * a);
                y = acd * x + bcd;
            } else {
                x = (-b - Math.sqrt(delta)) / (2 * a);
                y = acd * x + bcd;
            }

            elem.mapElem = self.paper.path("m " + xa + "," + ya + " C " + x + "," + y + " " + xb + "," + yb + " " + xb + "," + yb + "").attr(elemOptions.attrs);
            self.initElem(elem, elemOptions, id);

            return elem;
        },

        /*
         * Check wether newAttrs object bring modifications to originalAttrs object
         */
        isAttrsChanged: function(originalAttrs, newAttrs) {
            for (var key in newAttrs) {
                if (typeof originalAttrs[key] === 'undefined' || newAttrs[key] !== originalAttrs[key]) {
                    return true;
                }
            }
            return false;
        },

        /*
         * Update the element "elem" on the map with the new elemOptions options
         */
        updateElem: function (elemOptions, elem, animDuration) {
            var self = this;
            var bbox;
            var textPosition;
            var plotOffsetX;
            var plotOffsetY;

            if (elemOptions.value !== undefined)
                elem.value = elemOptions.value;

            if (elemOptions.toFront === true) {
                elem.mapElem.toFront();
            }

            // Update the label
            if (elem.textElem) {
                if (elemOptions.text !== undefined && elemOptions.text.content !== undefined && elemOptions.text.content != elem.textElem.attrs.text)
                    elem.textElem.attr({text: elemOptions.text.content});

                bbox = elem.mapElem.getBBox();

                if (elemOptions.size || (elemOptions.width && elemOptions.height)) {
                    if (elemOptions.type == "image" || elemOptions.type == "svg") {
                        plotOffsetX = (elemOptions.width - bbox.width) / 2;
                        plotOffsetY = (elemOptions.height - bbox.height) / 2;
                    } else {
                        plotOffsetX = (elemOptions.size - bbox.width) / 2;
                        plotOffsetY = (elemOptions.size - bbox.height) / 2;
                    }
                    bbox.x -= plotOffsetX;
                    bbox.x2 += plotOffsetX;
                    bbox.y -= plotOffsetY;
                    bbox.y2 += plotOffsetY;
                }

                textPosition = self.getTextPosition(bbox, elemOptions.text.position, elemOptions.text.margin);
                if (textPosition.x != elem.textElem.attrs.x || textPosition.y != elem.textElem.attrs.y) {
                    if (animDuration > 0) {
                        elem.textElem.attr({"text-anchor": textPosition.textAnchor});
                        elem.textElem.animate({x: textPosition.x, y: textPosition.y}, animDuration);
                    } else
                        elem.textElem.attr({
                            x: textPosition.x,
                            y: textPosition.y,
                            "text-anchor": textPosition.textAnchor
                        });
                }

                self.setHoverOptions(elem.textElem, elemOptions.text.attrs, elemOptions.text.attrsHover);
                if (animDuration > 0)
                    elem.textElem.animate(elemOptions.text.attrs, animDuration);
                else
                    elem.textElem.attr(elemOptions.text.attrs);
            }

            // Update elements attrs and attrsHover
            self.setHoverOptions(elem.mapElem, elemOptions.attrs, elemOptions.attrsHover);

            if (self.isAttrsChanged(elem.mapElem.attrs, elemOptions.attrs)) {
                if (animDuration > 0)
                    elem.mapElem.animate(elemOptions.attrs, animDuration);
                else
                    elem.mapElem.attr(elemOptions.attrs);
            }

            // Update dimensions of SVG plots
            if (elemOptions.type == "svg") {

                if (bbox === undefined) {
                    bbox = elem.mapElem.getBBox();
                }
                elem.mapElem.transform("m" + (elemOptions.width / elem.mapElem.originalWidth) + ",0,0," + (elemOptions.height / elem.mapElem.originalHeight) + "," + bbox.x + "," + bbox.y);
            }

            // Update the tooltip
            if (elemOptions.tooltip) {
                if (elem.mapElem.tooltip === undefined) {
                    self.setTooltip(elem.mapElem);
                    if (elem.textElem) self.setTooltip(elem.textElem);
                }
                elem.mapElem.tooltip = elemOptions.tooltip;
                if (elem.textElem) elem.textElem.tooltip = elemOptions.tooltip;
            }

            // Update the link
            if (elemOptions.href !== undefined) {
                if (elem.mapElem.href === undefined) {
                    self.setHref(elem.mapElem);
                    if (elem.textElem) self.setHref(elem.textElem);
                }
                elem.mapElem.href = elemOptions.href;
                elem.mapElem.target = elemOptions.target;
                if (elem.textElem) {
                    elem.textElem.href = elemOptions.href;
                    elem.textElem.target = elemOptions.target;
                }
            }
        },

        /*
         * Draw the plot
         */
        drawPlot: function (id) {
            var self = this;
            var plot = {};
            var coords = {};
            var elemOptions = self.getElemOptions(
                self.options.map.defaultPlot,
                (self.options.plots[id] ? self.options.plots[id] : {}),
                self.options.legend.plot
            );

            if (elemOptions.x !== undefined && elemOptions.y !== undefined)
                coords = {x: elemOptions.x, y: elemOptions.y};
            else if (elemOptions.plotsOn !== undefined && self.areas[elemOptions.plotsOn].mapElem !== undefined){
                var path = self.areas[elemOptions.plotsOn].mapElem;
                var bbox = path.getBBox();
                var _x = Math.floor(bbox.x + bbox.width/2.0);
                var _y = Math.floor(bbox.y + bbox.height/2.0);
                coords = {x: _x, y: _y};
            }
            else
                coords = self.mapConf.getCoords(elemOptions.latitude, elemOptions.longitude);

            if (elemOptions.type == "square") {
                plot = {
                    "mapElem": self.paper.rect(
                        coords.x - (elemOptions.size / 2),
                        coords.y - (elemOptions.size / 2),
                        elemOptions.size,
                        elemOptions.size
                    ).attr(elemOptions.attrs)
                };
            } else if (elemOptions.type == "image") {
                plot = {
                    "mapElem": self.paper.image(
                        elemOptions.url,
                        coords.x - elemOptions.width / 2,
                        coords.y - elemOptions.height / 2,
                        elemOptions.width,
                        elemOptions.height
                    ).attr(elemOptions.attrs)
                };
            } else if (elemOptions.type == "svg") {
                if (elemOptions.attrs.transform === undefined) {
                    elemOptions.attrs.transform = "";
                }

                plot = {"mapElem": self.paper.path(elemOptions.path)};
                plot.mapElem.originalWidth = plot.mapElem.getBBox().width;
                plot.mapElem.originalHeight = plot.mapElem.getBBox().height;

                plot.mapElem.baseTransform = "m" + (elemOptions.width / plot.mapElem.originalWidth) + ",0,0," + (elemOptions.height / plot.mapElem.originalHeight) + "," + (coords.x - elemOptions.width / 2) + "," + (coords.y - elemOptions.height / 2);
                elemOptions.attrs.transform = plot.mapElem.baseTransform + elemOptions.attrs.transform;
                plot.mapElem.attr(elemOptions.attrs);
            } else { // Default = circle
                plot = {"mapElem": self.paper.circle(coords.x, coords.y, elemOptions.size / 2).attr(elemOptions.attrs)};
            }
            self.initElem(plot, elemOptions, id);
            return plot;
        },

        /*
         * Set target link on elem
         */
        setHref: function (elem) {
            var self = this;
            elem.attr({cursor: "pointer"});
            $(elem.node).on("click." + pluginName, function () {
                if (!self.panning && elem.href)
                    window.open(elem.href, elem.target);
            });
        },

        /*
         * Set a tooltip for the areas and plots
         * @param elem area or plot element
         * @param content the content to set in the tooltip
         */
        setTooltip: function (elem) {
            var self = this;
            var tooltipTO = 0;
            var cssClass = self.$tooltip.attr('class');



            var updateTooltipPosition = function (x, y) {

                var offsetLeft = 10;
                var offsetTop = 20;

                if (typeof elem.tooltip.offset === "object") {
                    if (typeof elem.tooltip.offset.left !== "undefined") {
                        offsetLeft = elem.tooltip.offset.left;
                    }
                    if (typeof elem.tooltip.offset.top !== "undefined") {
                        offsetTop = elem.tooltip.offset.top;
                    }
                }

                var tooltipPosition = {
                    "left": Math.min(self.$map.width() - self.$tooltip.outerWidth() - 5, x - self.$map.offset().left + offsetLeft),
                    "top": Math.min(self.$map.height() - self.$tooltip.outerHeight() - 5, y - self.$map.offset().top + offsetTop)
                };

                if (typeof elem.tooltip.overflow === "object") {
                    if (elem.tooltip.overflow.right === true) {
                        tooltipPosition.left = x - self.$map.offset().left + 10;
                    }
                    if (selem.tooltip.overflow.bottom === true) {
                        tooltipPosition.top = y - self.$map.offset().top + 20;
                    }
                }

                self.$tooltip.css(tooltipPosition);
            };

            $(elem.node).on("mouseover." + pluginName, function (e) {
                tooltipTO = setTimeout(
                    function () {
                        self.$tooltip.attr("class", cssClass);
                        if (elem.tooltip !== undefined) {
                            if (elem.tooltip.content !== undefined) {
                                // if tooltip.content is function, call it. Otherwise, assign it directly.
                                var content = (typeof elem.tooltip.content === "function") ? elem.tooltip.content(elem) : elem.tooltip.content;
                                self.$tooltip.html(content).css("display", "block");
                            }
                            if (elem.tooltip.cssClass !== undefined) {
                                self.$tooltip.addClass(elem.tooltip.cssClass);
                            }
                        }
                        updateTooltipPosition(e.pageX, e.pageY);
                    }, 120
                );
            }).on("mouseout." + pluginName, function () {
                clearTimeout(tooltipTO);
                self.$tooltip.css("display", "none");
            }).on("mousemove." + pluginName, function (e) {
                updateTooltipPosition(e.pageX, e.pageY);
            });
        },

        /*
         * Set user defined handlers for events on areas and plots
         * @param id the id of the element
         * @param elemOptions the element parameters
         * @param mapElem the map element to set callback on
         * @param textElem the optional text within the map element
         */
        setEventHandlers: function (id, elemOptions, mapElem, textElem) {
            var self = this;
            $.each(elemOptions.eventHandlers, function (event) {
                (function (event) {
                    $(mapElem.node).on(event, function (e) {
                        if (!self.panning) elemOptions.eventHandlers[event](e, id, mapElem, textElem, elemOptions);
                    });
                    if (textElem) {
                        $(textElem.node).on(event, function (e) {
                            if (!self.panning) elemOptions.eventHandlers[event](e, id, mapElem, textElem, elemOptions);
                        });
                    }
                })(event);
            });
        },

        /*
         * Draw a legend for areas and / or plots
         * @param legendOptions options for the legend to draw
         * @param legendType the type of the legend : "area" or "plot"
         * @param elems collection of plots or areas on the maps
         * @param legendIndex index of the legend in the conf array
         */
        drawLegend: function (legendOptions, legendType, elems, scale, legendIndex) {
            var self = this;
            var $legend = {};
            var legendPaper = {};
            var width = 0;
            var height = 0;
            var title = null;
            var elem = {};
            var elemBBox = {};
            var label = {};
            var i = 0;
            var x = 0;
            var y = 0;
            var yCenter = 0;
            var sliceOptions = [];
            var length = 0;

            $legend = $("." + legendOptions.cssClass, self.$container);

            if (typeof self.createdLegends[legendOptions.cssClass] ==='undefined') {
                self.createdLegends[legendOptions.cssClass] = {
                    container: $legend,
                    initialHTMLContent: $legend.html()
                };
            }

            $legend.empty();

            legendPaper = new Raphael($legend.get(0));
            // Set some data to object
            $(legendPaper.canvas).attr({"data-type": legendType, "data-index": legendIndex});

            height = width = 0;

            // Set the title of the legend
            if (legendOptions.title && legendOptions.title !== "") {
                title = legendPaper.text(legendOptions.marginLeftTitle, 0, legendOptions.title).attr(legendOptions.titleAttrs);
                title.attr({y: 0.5 * title.getBBox().height});

                width = legendOptions.marginLeftTitle + title.getBBox().width;
                height += legendOptions.marginBottomTitle + title.getBBox().height;
            }

            // Calculate attrs (and width, height and r (radius)) for legend elements, and yCenter for horizontal legends

            for (i = 0, length = legendOptions.slices.length; i < length; ++i) {
                var yCenterCurrent = 0;

                sliceOptions[i] = $.extend(true, {}, (legendType == "plot") ? self.options.map.defaultPlot : self.options.map.defaultArea, legendOptions.slices[i]);

                if (legendOptions.slices[i].legendSpecificAttrs === undefined) {
                    legendOptions.slices[i].legendSpecificAttrs = {};
                }

                $.extend(true, sliceOptions[i].attrs, legendOptions.slices[i].legendSpecificAttrs);

                if (legendType == "area") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = 30;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = 20;
                } else if (sliceOptions[i].type == "square") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = sliceOptions[i].size;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = sliceOptions[i].size;
                } else if (sliceOptions[i].type == "image" || sliceOptions[i].type == "svg") {
                    if (sliceOptions[i].attrs.width === undefined)
                        sliceOptions[i].attrs.width = sliceOptions[i].width;
                    if (sliceOptions[i].attrs.height === undefined)
                        sliceOptions[i].attrs.height = sliceOptions[i].height;
                } else {
                    if (sliceOptions[i].attrs.r === undefined)
                        sliceOptions[i].attrs.r = sliceOptions[i].size / 2;
                }

                // Compute yCenter for this legend slice
                yCenterCurrent = legendOptions.marginBottomTitle;
                // Add title height if it exists
                if (title) {
                    yCenterCurrent += title.getBBox().height;
                }
                if (legendType == "plot" && (sliceOptions[i].type === undefined || sliceOptions[i].type == "circle")) {
                    yCenterCurrent += scale * sliceOptions[i].attrs.r;
                } else {
                    yCenterCurrent += scale * sliceOptions[i].attrs.height / 2;
                }
                // Update yCenter if current larger
                yCenter = Math.max(yCenter, yCenterCurrent);
            }

            if (legendOptions.mode == "horizontal") {
                width = legendOptions.marginLeft;
            }

            // Draw legend elements (circle, square or image in vertical or horizontal mode)
            for (i = 0, length = sliceOptions.length; i < length; ++i) {
                if (sliceOptions[i].display === undefined || sliceOptions[i].display === true) {
                    if (legendType == "area") {
                        if (legendOptions.mode == "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        elem = legendPaper.rect(x, y, scale * (sliceOptions[i].attrs.width), scale * (sliceOptions[i].attrs.height));
                    } else if (sliceOptions[i].type == "square") {
                        if (legendOptions.mode == "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        elem = legendPaper.rect(x, y, scale * (sliceOptions[i].attrs.width), scale * (sliceOptions[i].attrs.height));

                    } else if (sliceOptions[i].type == "image" || sliceOptions[i].type == "svg") {
                        if (legendOptions.mode == "horizontal") {
                            x = width + legendOptions.marginLeft;
                            y = yCenter - (0.5 * scale * sliceOptions[i].attrs.height);
                        } else {
                            x = legendOptions.marginLeft;
                            y = height;
                        }

                        if (sliceOptions[i].type == "image") {
                            elem = legendPaper.image(
                                sliceOptions[i].url, x, y, scale * sliceOptions[i].attrs.width, scale * sliceOptions[i].attrs.height);
                        } else {
                            elem = legendPaper.path(sliceOptions[i].path);

                            if (sliceOptions[i].attrs.transform === undefined) {
                                sliceOptions[i].attrs.transform = "";
                            }
                            sliceOptions[i].attrs.transform = "m" + ((scale * sliceOptions[i].width) / elem.getBBox().width) + ",0,0," + ((scale * sliceOptions[i].height) / elem.getBBox().height) + "," + x + "," + y + sliceOptions[i].attrs.transform;
                        }
                    } else {
                        if (legendOptions.mode == "horizontal") {
                            x = width + legendOptions.marginLeft + scale * (sliceOptions[i].attrs.r);
                            y = yCenter;
                        } else {
                            x = legendOptions.marginLeft + scale * (sliceOptions[i].attrs.r);
                            y = height + scale * (sliceOptions[i].attrs.r);
                        }
                        elem = legendPaper.circle(x, y, scale * (sliceOptions[i].attrs.r));
                    }

                    // Set attrs to the element drawn above
                    delete sliceOptions[i].attrs.width;
                    delete sliceOptions[i].attrs.height;
                    delete sliceOptions[i].attrs.r;
                    elem.attr(sliceOptions[i].attrs);
                    elemBBox = elem.getBBox();

                    // Draw the label associated with the element
                    if (legendOptions.mode == "horizontal") {
                        x = width + legendOptions.marginLeft + elemBBox.width + legendOptions.marginLeftLabel;
                        y = yCenter;
                    } else {
                        x = legendOptions.marginLeft + elemBBox.width + legendOptions.marginLeftLabel;
                        y = height + (elemBBox.height / 2);
                    }

                    label = legendPaper.text(x, y, sliceOptions[i].label).attr(legendOptions.labelAttrs);

                    // Update the width and height for the paper
                    if (legendOptions.mode == "horizontal") {
                        var currentHeight = legendOptions.marginBottom + elemBBox.height;
                        width += legendOptions.marginLeft + elemBBox.width + legendOptions.marginLeftLabel + label.getBBox().width;
                        if (sliceOptions[i].type != "image" && legendType != "area") {
                            currentHeight += legendOptions.marginBottomTitle;
                        }
                        // Add title height if it exists
                        if (title) {
                            currentHeight += title.getBBox().height;
                        }
                        height = Math.max(height, currentHeight);
                    } else {
                        width = Math.max(width, legendOptions.marginLeft + elemBBox.width + legendOptions.marginLeftLabel + label.getBBox().width);
                        height += legendOptions.marginBottom + elemBBox.height;
                    }

                    $(elem.node).attr({"data-type": "elem", "data-index": i, "data-hidden": 0});
                    $(label.node).attr({"data-type": "label", "data-index": i, "data-hidden": 0});

                    // Hide map elements when the user clicks on a legend item
                    if (legendOptions.hideElemsOnClick.enabled) {
                        // Hide/show elements when user clicks on a legend element
                        label.attr({cursor: "pointer"});
                        elem.attr({cursor: "pointer"});

                        self.setHoverOptions(elem, sliceOptions[i].attrs, sliceOptions[i].attrs);
                        self.setHoverOptions(label, legendOptions.labelAttrs, legendOptions.labelAttrsHover);
                        self.setHover(elem, label);
                        self.handleClickOnLegendElem(legendOptions, legendOptions.slices[i], label, elem, elems, legendIndex);
                    }
                }
            }

            // VMLWidth option allows you to set static width for the legend
            // only for VML render because text.getBBox() returns wrong values on IE6/7
            if (Raphael.type != "SVG" && legendOptions.VMLWidth)
                width = legendOptions.VMLWidth;

            legendPaper.setSize(width, height);
        },

        /*
         * Allow to hide elements of the map when the user clicks on a related legend item
         * @param legendOptions options for the legend to draw
         * @param sliceOptions options of the slice
         * @param label label of the legend item
         * @param elem element of the legend item
         * @param elems collection of plots or areas displayed on the map
         * @param legendIndex index of the legend in the conf array
         */
        handleClickOnLegendElem: function (legendOptions, sliceOptions, label, elem, elems, legendIndex) {
            var self = this;

            /**
             *
             * @param e
             * @param hideOtherElems : option used for the 'exclusive' mode to enabled only one item from the legend
             * at once
             * @param animDuration : used in the 'update' event in order to apply the same animDuration on the legend items
             */
            var hideMapElems = function (e, hideOtherElems, animDuration) {
                var elemValue = 0;
                var hidden = $(label.node).attr('data-hidden');
                var hiddenNewAttr = (hidden === '0') ? {"data-hidden": '1'} : {"data-hidden": '0'};

                // Check animDuration: if not set, this is a regular click, use the value specified in options
                if (animDuration === undefined) animDuration = legendOptions.hideElemsOnClick.animDuration;

                if (hidden === '0') {
                    if (animDuration > 0) label.animate({"opacity": 0.5}, animDuration);
                    else label.attr({"opacity": 0.5});
                } else {
                    if (animDuration > 0) label.animate({"opacity": 1}, animDuration);
                    else label.attr({"opacity": 1});
                }

                $.each(elems, function (id) {
                    // Retreive stored data of element
                    //      'hidden-by' contains the list of legendIndex that is hiding this element
                    var hiddenBy = elems[id].mapElem.data('hidden-by');
                    // Set to empty object if undefined
                    if (hiddenBy === undefined) hiddenBy = {};

                    if ($.isArray(elems[id].value)) {
                        elemValue = elems[id].value[legendIndex];
                    } else {
                        elemValue = elems[id].value;
                    }

                    // Hide elements whose value matches with the slice of the clicked legend item
                    if (self.getLegendSlice(elemValue, legendOptions) === sliceOptions) {
                        (function (id) {
                            if (hidden === '0') { // we want to hide this element
                                hiddenBy[legendIndex] = true; // add legendIndex to the data object for later use
                                self.setElementOpacity(elems[id], legendOptions.hideElemsOnClick.opacity, animDuration);
                            } else { // We want to show this element
                                delete hiddenBy[legendIndex]; // Remove this legendIndex from object
                                // Check if another legendIndex is defined
                                // We will show this element only if no legend is no longer hiding it
                                if ($.isEmptyObject(hiddenBy)) {
                                    self.setElementOpacity(
                                        elems[id],
                                        elems[id].mapElem.originalAttrs.opacity !== undefined ? elems[id].mapElem.originalAttrs.opacity : 1,
                                        animDuration
                                    );
                                }
                            }
                            // Update elem data with new values
                            elems[id].mapElem.data('hidden-by', hiddenBy);
                        })(id);
                    }
                });

                $(elem.node).attr(hiddenNewAttr);
                $(label.node).attr(hiddenNewAttr);

                if ((hideOtherElems === undefined || hideOtherElems === true)
                    && legendOptions.exclusive !== undefined && legendOptions.exclusive === true
                ) {
                    $("[data-type='elem'][data-hidden=0]", self.$container).each(function () {
                        if ($(this).attr('data-index') !== $(elem.node).attr('data-index')) {
                            $(this).trigger("click", false);
                        }
                    });
                }
            };
            $(label.node).on("click." + pluginName, hideMapElems);
            $(elem.node).on("click." + pluginName, hideMapElems);

            if (sliceOptions.clicked !== undefined && sliceOptions.clicked === true) {
                $(elem.node).trigger("click", false);
            }
        },

        /*
         * Create all legends for a specified type (area or plot)
         * @param legendType the type of the legend : "area" or "plot"
         * @param elems collection of plots or areas displayed on the map
         * @param scale scale ratio of the map
         */
        createLegends: function (legendType, elems, scale) {
            var self = this;
            var legendsOptions = self.options.legend[legendType];

            if (!$.isArray(self.options.legend[legendType])) {
                legendsOptions = [self.options.legend[legendType]];
            }

            for (var j = 0; j < legendsOptions.length; ++j) {
                // Check for class existence
                if (legendsOptions[j].cssClass === "" || $("." + legendsOptions[j].cssClass, self.$container).length === 0) {
                    throw new Error("The legend class `" + legendsOptions[j].cssClass + "` doesn't exists.");
                }
                if (legendsOptions[j].display === true && $.isArray(legendsOptions[j].slices) && legendsOptions[j].slices.length > 0) {
                    self.drawLegend(legendsOptions[j], legendType, elems, scale, j);
                }
            }
        },

        /*
         * Set the attributes on hover and the attributes to restore for a map element
         * @param elem the map element
         * @param originalAttrs the original attributes to restore on mouseout event
         * @param attrsHover the attributes to set on mouseover event
         */
        setHoverOptions: function (elem, originalAttrs, attrsHover) {
            // Disable transform option on hover for VML (IE<9) because of several bugs
            if (Raphael.type != "SVG") delete attrsHover.transform;
            elem.attrsHover = attrsHover;

            if (elem.attrsHover.transform) elem.originalAttrs = $.extend({transform: "s1"}, originalAttrs);
            else elem.originalAttrs = originalAttrs;
        },

        /*
         * Set the hover behavior (mouseover & mouseout) for plots and areas
         * @param mapElem the map element
         * @param textElem the optional text element (within the map element)
         */
        setHover: function (mapElem, textElem) {
            var self = this;
            var $mapElem = {};
            var $textElem = {};
            var mouseoverTimeout = 0;
            var mouseoutTimeout = 0;
            var overBehaviour = function () {
                clearTimeout(mouseoutTimeout);
                mouseoverTimeout = setTimeout(function () {
                    self.elemHover(mapElem, textElem);
                }, 120);
            };
            var outBehaviour = function () {
                clearTimeout(mouseoverTimeout);
                mouseoutTimeout = setTimeout(function(){
                    self.elemOut(mapElem, textElem);
                }, 120);
            };

            $mapElem = $(mapElem.node);
            $mapElem.on("mouseover." + pluginName, overBehaviour);
            $mapElem.on("mouseout." + pluginName, outBehaviour);

            if (textElem) {
                $textElem = $(textElem.node);
                $textElem.on("mouseover." + pluginName, overBehaviour);
                $(textElem.node).on("mouseout." + pluginName, outBehaviour);
            }
        },

        /*
         * Remove the hover behavior for plots and areas
         * @param mapElem the map element
         * @param textElem the optional text element (within the map element)
         */
        unsetHover: function (mapElem, textElem) {
            $(mapElem.node).off("." + pluginName);
            if (textElem) $(textElem.node).off("." + pluginName);
        },

        /*
         * Set he behaviour for "mouseover" event
         * @param mapElem mapElem the map element
         * @param textElem the optional text element (within the map element)
         */
        elemHover: function (mapElem, textElem) {
            var self = this;
            // Set mapElem
            if (mapElem.attrsHover.animDuration > 0) mapElem.animate(mapElem.attrsHover, mapElem.attrsHover.animDuration);
            else mapElem.attr(mapElem.attrsHover);
            // Set textElem
            if (textElem) {
                if (textElem.attrsHover.animDuration > 0) textElem.animate(textElem.attrsHover, textElem.attrsHover.animDuration);
                else textElem.attr(textElem.attrsHover);
            }
            // workaround for older version of Raphael
            if (self.paper.safari) self.paper.safari();
        },

        /*
         * Set he behaviour for "mouseout" event
         * @param mapElem the map element
         * @param textElem the optional text element (within the map element)
         */
        elemOut: function (mapElem, textElem) {
            var self = this;
            // Set mapElem
            if (mapElem.attrsHover.animDuration > 0) mapElem.animate(mapElem.originalAttrs, mapElem.attrsHover.animDuration);
            else mapElem.attr(mapElem.originalAttrs);
            // Set textElem
            if (textElem) {
                if (textElem.attrsHover.animDuration > 0) textElem.animate(textElem.originalAttrs, textElem.attrsHover.animDuration);
                else textElem.attr(textElem.originalAttrs);
            }

            // workaround for older version of Raphael
            if (self.paper.safari) self.paper.safari();
        },

        /*
         * Get element options by merging default options, element options and legend options
         * @param defaultOptions
         * @param elemOptions
         * @param legendOptions
         */
        getElemOptions: function (defaultOptions, elemOptions, legendOptions) {
            var self = this;
            var options = $.extend(true, {}, defaultOptions, elemOptions);
            if (options.value !== undefined) {
                if ($.isArray(legendOptions)) {
                    for (var i = 0, length = legendOptions.length; i < length; ++i) {
                        options = $.extend(true, {}, options, self.getLegendSlice(options.value[i], legendOptions[i]));
                    }
                } else {
                    options = $.extend(true, {}, options, self.getLegendSlice(options.value, legendOptions));
                }
            }
            return options;
        },

        /*
         * Get the coordinates of the text relative to a bbox and a position
         * @param bbox the boundary box of the element
         * @param textPosition the wanted text position (inner, right, left, top or bottom)
         * @param margin number or object {x: val, y:val} margin between the bbox and the text
         */
        getTextPosition: function (bbox, textPosition, margin) {
            var textX = 0;
            var textY = 0;
            var textAnchor = "";

            if (typeof margin === "number") {
                if (textPosition === "bottom" || textPosition === "top") {
                    margin = {x: 0, y: margin};
                } else if (textPosition === "right" || textPosition === "left") {
                    margin = {x: margin, y: 0};
                } else {
                    margin = {x: 0, y: 0};
                }
            }

            switch (textPosition) {
                case "bottom" :
                    textX = ((bbox.x + bbox.x2) / 2) + margin.x;
                    textY = bbox.y2 + margin.y;
                    textAnchor = "middle";
                    break;
                case "top" :
                    textX = ((bbox.x + bbox.x2) / 2) + margin.x;
                    textY = bbox.y - margin.y;
                    textAnchor = "middle";
                    break;
                case "left" :
                    textX = bbox.x - margin.x;
                    textY = ((bbox.y + bbox.y2) / 2) + margin.y;
                    textAnchor = "end";
                    break;
                case "right" :
                    textX = bbox.x2 + margin.x;
                    textY = ((bbox.y + bbox.y2) / 2) + margin.y;
                    textAnchor = "start";
                    break;
                default : // "inner" position
                    textX = ((bbox.x + bbox.x2) / 2) + margin.x;
                    textY = ((bbox.y + bbox.y2) / 2) + margin.y;
                    textAnchor = "middle";
            }
            return {"x": textX, "y": textY, "textAnchor": textAnchor};
        },

        /*
         * Get the legend conf matching with the value
         * @param value the value to match with a slice in the legend
         * @param legend the legend params object
         * @return the legend slice matching with the value
         */
        getLegendSlice: function (value, legend) {
            for (var i = 0, length = legend.slices.length; i < length; ++i) {
                if ((legend.slices[i].sliceValue !== undefined && value == legend.slices[i].sliceValue)
                    || ((legend.slices[i].sliceValue === undefined)
                    && (legend.slices[i].min === undefined || value >= legend.slices[i].min)
                    && (legend.slices[i].max === undefined || value <= legend.slices[i].max))
                ) {
                    return legend.slices[i];
                }
            }
            return {};
        },

        /*
         * Animated view box changes
         * As from http://code.voidblossom.com/animating-viewbox-easing-formulas/,
         * (from https://github.com/theshaun works on mapael)
         * @param x coordinate of the point to focus on
         * @param y coordinate of the point to focus on
         * @param w map defined width
         * @param h map defined height
         * @param duration defined length of time for animation
         * @param easingFunction defined Raphael supported easing_formula to use
         * @param callback method when animated action is complete
         */
        animateViewBox: function (x, y, w, h, duration, easingFunction) {
            var self = this;
            var cx = self.paper._viewBox ? self.paper._viewBox[0] : 0;
            var dx = x - cx;
            var cy = self.paper._viewBox ? self.paper._viewBox[1] : 0;
            var dy = y - cy;
            var cw = self.paper._viewBox ? self.paper._viewBox[2] : self.paper.width;
            var dw = w - cw;
            var ch = self.paper._viewBox ? self.paper._viewBox[3] : self.paper.height;
            var dh = h - ch;
            var interval = 25;
            var steps = duration / interval;
            var currentStep = 0;
            var easingFormula;

            easingFunction = easingFunction || "linear";
            easingFormula = Raphael.easing_formulas[easingFunction];

            clearInterval(self.animationIntervalID);

            self.animationIntervalID = setInterval(function () {
                    var ratio = currentStep / steps;
                    self.paper.setViewBox(cx + dx * easingFormula(ratio),
                        cy + dy * easingFormula(ratio),
                        cw + dw * easingFormula(ratio),
                        ch + dh * easingFormula(ratio), false);
                    if (currentStep++ >= steps) {
                        clearInterval(self.animationIntervalID);
                        clearTimeout(self.zoomTO);
                        self.zoomTO = setTimeout(function () {
                            self.$map.trigger("afterZoom", {x1: x, y1: y, x2: (x + w), y2: (y + h)});
                        }, 150);
                    }
                }, interval
            );
        },

        /*
         * Check for Raphael bug regarding drawing while beeing hidden (under display:none)
         * See https://github.com/neveldo/jQuery-Mapael/issues/135
         * @return true/false
         *
         * Wants to override this behavior? Use prototype overriding:
         *     $.mapael.prototype.isRaphaelBBoxBugPresent = function() {return false;};
         */
        isRaphaelBBoxBugPresent: function(){
            var self = this;
            // Draw text, then get its boundaries
            var text_elem = self.paper.text(-50, -50, "TEST");
            var text_elem_bbox = text_elem.getBBox();
            // remove element
            text_elem.remove();
            // If it has no height and width, then the paper is hidden
            return (text_elem_bbox.width === 0 && text_elem_bbox.height === 0);
        },

        // Default map options
        defaultOptions: {
            map: {
                cssClass: "map",
                tooltip: {
                    cssClass: "mapTooltip"
                },
                defaultArea: {
                    attrs: {
                        fill: "#343434",
                        stroke: "#5d5d5d",
                        "stroke-width": 1,
                        "stroke-linejoin": "round"
                    },
                    attrsHover: {
                        fill: "#f38a03",
                        animDuration: 300
                    },
                    text: {
                        position: "inner",
                        margin: 10,
                        attrs: {
                            "font-size": 15,
                            fill: "#c7c7c7"
                        },
                        attrsHover: {
                            fill: "#eaeaea",
                            "animDuration": 300
                        }
                    },
                    target: "_self",
                    cssClass: "area"
                },
                defaultPlot: {
                    type: "circle",
                    size: 15,
                    attrs: {
                        fill: "#0088db",
                        stroke: "#fff",
                        "stroke-width": 0,
                        "stroke-linejoin": "round"
                    },
                    attrsHover: {
                        "stroke-width": 3,
                        animDuration: 300
                    },
                    text: {
                        position: "right",
                        margin: 10,
                        attrs: {
                            "font-size": 15,
                            fill: "#c7c7c7"
                        },
                        attrsHover: {
                            fill: "#eaeaea",
                            animDuration: 300
                        }
                    },
                    target: "_self",
                    cssClass: "plot"
                },
                defaultLink: {
                    factor: 0.5,
                    attrs: {
                        stroke: "#0088db",
                        "stroke-width": 2
                    },
                    attrsHover: {
                        animDuration: 300
                    },
                    text: {
                        position: "inner",
                        margin: 10,
                        attrs: {
                            "font-size": 15,
                            fill: "#c7c7c7"
                        },
                        attrsHover: {
                            fill: "#eaeaea",
                            animDuration: 300
                        }
                    },
                    target: "_self",
                    cssClass: "link"
                },
                zoom: {
                    enabled: false,
                    minLevel: 0,
                    maxLevel: 10,
                    step: 0.25,
                    mousewheel: true,
                    touch: true,
                    animDuration: 200,
                    animEasing: "linear",
                    buttons: {
                        "reset": {
                            cssClass: "zoomButton zoomReset",
                            content: "&#8226;", // bullet sign
                            title: "Reset zoom"
                        },
                        "in": {
                            cssClass: "zoomButton zoomIn",
                            content: "+",
                            title: "Zoom in"
                        },
                        "out": {
                            cssClass: "zoomButton zoomOut",
                            content: "&#8722;", // minus sign
                            title: "Zoom out"
                        }
                    }
                }
            },
            legend: {
                redrawOnResize: true,
                area: [],
                plot: []
            },
            areas: {},
            plots: {},
            links: {}
        },

        // Default legends option
        legendDefaultOptions: {
            area: {
                cssClass: "areaLegend",
                display: true,
                marginLeft: 10,
                marginLeftTitle: 5,
                marginBottomTitle: 10,
                marginLeftLabel: 10,
                marginBottom: 10,
                titleAttrs: {
                    "font-size": 16,
                    fill: "#343434",
                    "text-anchor": "start"
                },
                labelAttrs: {
                    "font-size": 12,
                    fill: "#343434",
                    "text-anchor": "start"
                },
                labelAttrsHover: {
                    fill: "#787878",
                    animDuration: 300
                },
                hideElemsOnClick: {
                    enabled: true,
                    opacity: 0.2,
                    animDuration: 300
                },
                slices: [],
                mode: "vertical"
            },
            plot: {
                cssClass: "plotLegend",
                display: true,
                marginLeft: 10,
                marginLeftTitle: 5,
                marginBottomTitle: 10,
                marginLeftLabel: 10,
                marginBottom: 10,
                titleAttrs: {
                    "font-size": 16,
                    fill: "#343434",
                    "text-anchor": "start"
                },
                labelAttrs: {
                    "font-size": 12,
                    fill: "#343434",
                    "text-anchor": "start"
                },
                labelAttrsHover: {
                    fill: "#787878",
                    animDuration: 300
                },
                hideElemsOnClick: {
                    enabled: true,
                    opacity: 0.2,
                    animDuration: 300
                },
                slices: [],
                mode: "vertical"
            }
        }

    };

    // Extend jQuery with Mapael
    if ($[pluginName] === undefined) $[pluginName] = Mapael;

    // Add jQuery DOM function
    $.fn[pluginName] = function (options) {
        // Call Mapael on each element
        return this.each(function () {
            // Avoid leaking problem on multiple instanciation by removing an old mapael object on a container
            if ($.data(this, pluginName)) {
                $.data(this, pluginName).destroy();
            }
            // Create Mapael and save it as jQuery data
            // This allow external access to Mapael using $(".mapcontainer").data("mapael")
            $.data(this, pluginName, new Mapael(this, options));
        });
    };

    return Mapael;

}));


/***/ }),

/***/ 1671:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(14)(true);
// imports


// module
exports.push([module.i, "/**\n * Customized version of bootstrap using variables from _variables.scss.\n * This file is loaded via separate loader thus allowing to use original bootstrap classes (e.g. .btn-default) through out the app.\n */\n/*\n * Typography\n * ======================================================================== */\n/**\n * Custom application mixins available through out the app\n */\n._1ej2d6FNze2oEg5f-QBT_l {\n  position: relative;\n  margin: -15px -20px 0;\n  /* Mapael */ }\n  ._1ej2d6FNze2oEg5f-QBT_l .mapTooltip {\n    position: absolute;\n    padding: 2px;\n    background-color: #fff;\n    border: 1px solid #ccc;\n    border-radius: 0.3rem;\n    font-size: 0.875rem;\n    color: #495057; }\n  ._1ej2d6FNze2oEg5f-QBT_l .zoomIn,\n  ._1ej2d6FNze2oEg5f-QBT_l .zoomOut {\n    position: absolute;\n    bottom: 10px;\n    left: 10px;\n    width: 20px;\n    height: 20px;\n    box-sizing: content-box;\n    border: 1px solid #ccc;\n    background-color: #fff;\n    color: #495057;\n    line-height: 20px;\n    text-align: center;\n    border-radius: 0.3rem;\n    cursor: pointer;\n    font-weight: 700;\n    user-select: none; }\n  ._1ej2d6FNze2oEg5f-QBT_l .zoomOut {\n    left: 36px; }\n  ._1ej2d6FNze2oEg5f-QBT_l .map {\n    position: relative; }\n  ._1ej2d6FNze2oEg5f-QBT_l .stats {\n    position: absolute;\n    z-index: 1;\n    top: 0;\n    left: 0;\n    margin: 5% 10%; }\n", "", {"version":3,"sources":["D:/FREELANCES/Tesis Jean Claude Esquerra/Code/src/pages/dashboard/components/mapael-map/MapaelMap.scss"],"names":[],"mappings":"AAAA;;;GAGG;AACH;;8EAE8E;AAC9E;;GAEG;AACH;EACE,mBAAmB;EACnB,sBAAsB;EACtB,YAAY,EAAE;EACd;IACE,mBAAmB;IACnB,aAAa;IACb,uBAAuB;IACvB,uBAAuB;IACvB,sBAAsB;IACtB,oBAAoB;IACpB,eAAe,EAAE;EACnB;;IAEE,mBAAmB;IACnB,aAAa;IACb,WAAW;IACX,YAAY;IACZ,aAAa;IACb,wBAAwB;IACxB,uBAAuB;IACvB,uBAAuB;IACvB,eAAe;IACf,kBAAkB;IAClB,mBAAmB;IACnB,sBAAsB;IACtB,gBAAgB;IAChB,iBAAiB;IACjB,kBAAkB,EAAE;EACtB;IACE,WAAW,EAAE;EACf;IACE,mBAAmB,EAAE;EACvB;IACE,mBAAmB;IACnB,WAAW;IACX,OAAO;IACP,QAAQ;IACR,eAAe,EAAE","file":"MapaelMap.scss","sourcesContent":["/**\n * Customized version of bootstrap using variables from _variables.scss.\n * This file is loaded via separate loader thus allowing to use original bootstrap classes (e.g. .btn-default) through out the app.\n */\n/*\n * Typography\n * ======================================================================== */\n/**\n * Custom application mixins available through out the app\n */\n.mapael {\n  position: relative;\n  margin: -15px -20px 0;\n  /* Mapael */ }\n  .mapael :global .mapTooltip {\n    position: absolute;\n    padding: 2px;\n    background-color: #fff;\n    border: 1px solid #ccc;\n    border-radius: 0.3rem;\n    font-size: 0.875rem;\n    color: #495057; }\n  .mapael :global .zoomIn,\n  .mapael :global .zoomOut {\n    position: absolute;\n    bottom: 10px;\n    left: 10px;\n    width: 20px;\n    height: 20px;\n    box-sizing: content-box;\n    border: 1px solid #ccc;\n    background-color: #fff;\n    color: #495057;\n    line-height: 20px;\n    text-align: center;\n    border-radius: 0.3rem;\n    cursor: pointer;\n    font-weight: 700;\n    user-select: none; }\n  .mapael :global .zoomOut {\n    left: 36px; }\n  .mapael :global .map {\n    position: relative; }\n  .mapael :global .stats {\n    position: absolute;\n    z-index: 1;\n    top: 0;\n    left: 0;\n    margin: 5% 10%; }\n"],"sourceRoot":""}]);

// exports
exports.locals = {
	"mapael": "_1ej2d6FNze2oEg5f-QBT_l"
};

/***/ }),

/***/ 1788:
/***/ (function(module, exports, __webpack_require__) {

/*** IMPORTS FROM imports-loader ***/
var $ = __webpack_require__(72);
(function() {

/*!
 *
 * Jquery Mapael - Dynamic maps jQuery plugin (based on raphael.js)
 * Requires jQuery and Mapael
 *
 * Map of USA by state
 * 
 * @source http://the55.net/_11/sketch/us_map
 */
(function (factory) {
    if (true) {
        // CommonJS
        module.exports = factory(__webpack_require__(72), __webpack_require__(1391));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'mapael'], factory);
    } else {
        // Browser globals
        factory(jQuery, jQuery.mapael);
    }
}(function ($, Mapael) {

    "use strict";
    
    $.extend(true, Mapael,
        {
            maps :{
                usa_states : {
                    width : 959,
                    height : 593,
                    latLngToGrid: function(lat, lng, phi1, phi2, midLng, scale) {
                        var pi =Math.PI
                            , midLat = (phi1 + phi2) / 2
                            , n, tmp1, tmp2, tmp3, x, y, p;

                        n = (Math.sin(phi1 / 180 * pi) + Math.sin(phi2 / 180 * pi)) / 2;
                        tmp1 = Math.sqrt(Math.cos(phi1 / 180 * pi)) + 2 * n * Math.sin(phi1 / 180 * pi);
                        tmp2 = scale * Math.pow(tmp1 - 2 * n * Math.sin(midLat / 180 * pi),0.5) / n;
                        tmp3 = n * (lng - midLng);
                        p = scale * Math.pow(tmp1 - 2 * n * Math.sin(lat / 180 * pi),0.5) / n;
                        x = p * Math.sin(tmp3 / 180 * pi);
                        y = tmp2 - p * Math.cos(tmp3 / 180 * pi);
                        
                        return([x,y]);
                    },
                    getCoords : function (lat, lon) {
                        var coords = {},
                            xOffset,
                            yOffset,
                            scaleX,
                            scaleY,
                            phi1,
                            phi2,
                            midLng,
                            scale;
                        if(lat > 51) { // alaska
                            phi1= 15;
                            phi2= 105;
                            midLng = -134;
                            scale = 530;
                            coords = this.latLngToGrid(lat, lon, phi1, phi2, midLng, scale);
                            xOffset = 190;
                            yOffset = 543;
                            scaleX= 1;
                            scaleY= -1;

                        } else if (lon < -140) { // hawaii
                            phi1= 0;
                            phi2= 26;
                            midLng = -166;
                            scale = 1280;
                            coords = this.latLngToGrid(lat, lon, phi1, phi2, midLng, scale);
                            xOffset = 115;
                            yOffset = 723;
                            scaleX= 1;
                            scaleY= -1;
                        } else {
                            xOffset = -17;
                            yOffset = -22;
                            scaleX = 10.05;
                            scaleY = 6.26;

                            coords[0] = 50.0 + 124.03149777329222 * ((1.9694462586094064-(lat* Math.PI / 180)) * Math.sin(0.6010514667026994 * (lon + 96) * Math.PI / 180));
                            coords[1] = 50.0 + 1.6155950752393982 * 124.03149777329222 * 0.02613325650382181 - 1.6155950752393982* 124.03149777329222 * (1.3236744353715044- (1.9694462586094064-(lat* Math.PI / 180)) * Math.cos(0.6010514667026994 * (lon + 96) * Math.PI / 180));
                        }
                        return {x : (coords[0] * scaleX + xOffset), y : (coords[1] * scaleY + yOffset)};
                    },
                    elems : {
                        "HI" : "m 233.08751,519.30948 1.93993,-3.55655 2.26326,-0.32332 0.32332,0.8083 -2.1016,3.07157 -2.42491,0 z m 10.18466,-3.71821 6.14313,2.58657 2.10159,-0.32332 1.61661,-3.87987 -0.64664,-3.39488 -4.2032,-0.48498 -4.04153,1.77827 -0.96996,3.71821 z m 30.71563,10.023 3.7182,5.49647 2.42492,-0.32332 1.13163,-0.48498 1.45495,1.29329 3.71821,-0.16166 0.96997,-1.45495 -2.90991,-1.77827 -1.93993,-3.71822 -2.1016,-3.55654 -5.8198,2.9099 -0.64664,1.77828 z m 20.20765,8.89137 1.29329,-1.93994 4.68817,0.96996 0.64665,-0.48498 6.14312,0.64664 -0.32332,1.2933 -2.58658,1.45494 -4.36485,-0.32332 -5.49648,-1.6166 z m 5.33482,5.17315 1.93994,3.87987 3.07155,-1.13163 0.32333,-1.61662 -1.61661,-2.10159 -3.71821,-0.32332 0,1.29329 z m 6.95143,-1.13163 2.26326,-2.9099 4.68817,2.42492 4.36485,1.13163 4.36486,2.74824 0,1.93993 -3.55654,1.77828 -4.84985,0.96996 -2.42491,-1.45495 -4.84984,-6.62811 z m 16.65111,15.51947 1.61661,-1.29328 3.39489,1.61662 7.59807,3.55654 3.39489,2.10159 1.6166,2.42492 1.93994,4.36485 4.04153,2.58658 -0.32332,1.2933 -3.87987,3.23322 -4.20319,1.45495 -1.45495,-0.64664 -3.07157,1.77826 -2.42491,3.23323 -2.26326,2.9099 -1.77828,-0.16166 -3.55654,-2.58658 -0.32332,-4.52651 0.64664,-2.42492 -1.61661,-5.65814 -2.1016,-1.77828 -0.16166,-2.58658 2.26326,-0.96996 2.1016,-3.07156 0.48498,-0.96997 -1.61661,-1.77828 -0.32332,-2.1016 z",
                        "AK" : "m 158.07671,453.67502 -0.32332,85.35713 1.6166,0.96996 3.07157,0.16166 1.45494,-1.13162 2.58658,0 0.16167,2.9099 6.95143,6.78977 0.48499,2.58658 3.39488,-1.93994 0.64665,-0.16166 0.32332,-3.07156 1.45494,-1.61661 1.13164,-0.16166 1.93993,-1.45496 3.07156,2.1016 0.64665,2.90991 1.93993,1.13162 1.13163,2.42492 3.87988,1.77827 3.39488,5.98147 2.74823,3.87986 2.26326,2.74825 1.45496,3.7182 5.01149,1.77828 5.17317,2.10159 0.96996,4.36486 0.48498,3.07156 -0.96996,3.39489 -1.77828,2.26325 -1.61661,-0.8083 -1.45495,-3.07157 -2.74824,-1.45494 -1.77827,-1.13164 -0.80831,0.80831 1.45495,2.74825 0.16166,3.7182 -1.13163,0.48498 -1.93993,-1.93993 -2.10159,-1.29329 0.48498,1.61661 1.29328,1.77828 -0.8083,0.8083 c 0,0 -0.8083,-0.32332 -1.29328,-0.96997 -0.485,-0.64664 -2.1016,-3.39488 -2.1016,-3.39488 l -0.96997,-2.26326 c 0,0 -0.32332,1.29329 -0.96997,0.96996 -0.64665,-0.32332 -1.29329,-1.45494 -1.29329,-1.45494 l 1.77827,-1.93994 -1.45495,-1.45495 0,-5.0115 -0.8083,0 -0.8083,3.39488 -1.13164,0.485 -0.96996,-3.71822 -0.64665,-3.71821 -0.80831,-0.48498 0.32333,5.65815 0,1.13162 -1.45496,-1.29328 -3.55654,-5.98147 -2.1016,-0.48498 -0.64664,-3.71821 -1.61661,-2.9099 -1.61662,-1.13164 0,-2.26325 2.1016,-1.29329 -0.48498,-0.32332 -2.58658,0.64664 -3.39489,-2.42491 -2.58658,-2.90991 -4.84983,-2.58658 -4.04154,-2.58658 1.2933,-3.23322 0,-1.61661 -1.77828,1.61661 -2.9099,1.13163 -3.71821,-1.13163 -5.65815,-2.42491 -5.49647,0 -0.64664,0.48498 -6.46645,-3.87988 -2.1016,-0.32332 -2.74824,-5.8198 -3.55655,0.32332 -3.55655,1.45495 0.48499,4.52652 1.13162,-2.9099 0.96998,0.32332 -1.45496,4.36485 3.23322,-2.74824 0.64665,1.61661 -3.87987,4.36485 -1.29329,-0.32332 -0.48498,-1.93994 -1.29329,-0.8083 -1.29329,1.13163 -2.74824,-1.77827 -3.07157,2.1016 -1.77826,2.10159 -3.39489,2.1016 -4.68818,-0.16167 -0.48498,-2.10159 3.7182,-0.64665 0,-1.29328 -2.26326,-0.64666 0.96998,-2.42491 2.26325,-3.87987 0,-1.77827 0.16166,-0.80831 4.36486,-2.26326 0.96996,1.29329 2.74825,0 -1.29329,-2.58657 -3.71822,-0.32333 -5.01149,2.74824 -2.42492,3.39488 -1.77827,2.58659 -1.13163,2.26326 -4.20319,1.45494 -3.07157,2.58658 -0.323321,1.61662 2.263257,0.96997 0.808313,2.10158 -2.748249,3.23323 -6.466439,4.2032 -7.759747,4.20319 -2.101597,1.13162 -5.334818,1.13164 -5.334826,2.26325 1.778275,1.29329 -1.454954,1.45495 -0.484982,1.13163 -2.748238,-0.96997 -3.23322,0.16166 -0.808312,2.26326 -0.969963,0 0.323321,-2.42492 -3.556551,1.2933 -2.909899,0.96996 -3.394886,-1.29329 -2.909901,1.93993 -3.233224,0 -2.101597,1.2933 -1.616612,0.8083 -2.101595,-0.32332 -2.58658,-1.13163 -2.263257,0.64665 -0.969967,0.96996 -1.616613,-1.13162 0,-1.93994 3.071564,-1.29329 6.304787,0.64665 4.364853,-1.61662 2.101596,-2.10159 2.909902,-0.64665 1.778273,-0.80831 2.748241,0.16166 1.616612,1.2933 0.969963,-0.32332 2.263257,-2.74824 3.07157,-0.96998 3.39488,-0.64664 1.293294,-0.32332 0.646642,0.48498 0.808312,0 1.293284,-3.71821 4.041533,-1.45494 1.939936,-3.71821 2.263259,-4.52652 1.616615,-1.45495 0.323321,-2.58658 -1.616615,1.29329 -3.394893,0.64665 -0.646642,-2.42492 -1.293284,-0.32332 -0.969973,0.96996 -0.16166,2.90991 -1.454955,-0.16167 -1.454944,-5.8198 -1.293294,1.29328 -1.131624,-0.48498 -0.32332,-1.93993 -4.041533,0.16166 -2.101596,1.13163 -2.586578,-0.32332 1.454944,-1.45495 0.484981,-2.58658 -0.646641,-1.93994 1.454954,-0.96996 1.293284,-0.16166 -0.646642,-1.77828 0,-4.36485 -0.969963,-0.96997 -0.808312,1.45495 -6.143123,0 -1.454951,-1.29329 -0.646645,-3.87986 -2.101596,-3.55656 0,-0.96996 2.101596,-0.80831 0.161661,-2.1016 1.131628,-1.13162 -0.808305,-0.48498 -1.29329,0.48498 -1.131628,-2.74824 0.969967,-5.01151 4.526514,-3.23321 2.586575,-1.61662 1.939936,-3.7182 2.748249,-1.2933 2.586578,1.13164 0.323321,2.42492 2.424917,-0.32334 3.23322,-2.42491 1.616615,0.64665 0.969962,0.64664 1.616615,0 2.263259,-1.29329 0.808313,-4.36486 c 0,0 0.323321,-2.90989 0.969963,-3.39488 0.646642,-0.48498 0.969963,-0.96996 0.969963,-0.96996 l -1.131623,-1.93994 -2.58658,0.80831 -3.23323,0.8083 -1.939936,-0.48498 -3.556541,-1.77828 -5.011495,-0.16166 -3.556551,-3.7182 0.484981,-3.87987 0.646652,-2.42492 -2.101596,-1.77827 -1.939938,-3.71822 0.484983,-0.8083 6.789771,-0.48498 2.101596,0 0.969963,0.96996 0.646652,0 -0.16166,-1.61661 3.879862,-0.64664 2.586577,0.32332 1.454955,1.13163 -1.454955,2.1016 -0.484981,1.45494 2.748249,1.61662 5.011497,1.77827 1.778276,-0.96996 -2.263257,-4.36485 -0.969974,-3.23323 0.969974,-0.80831 -3.394891,-1.93993 -0.484983,-1.13164 0.484983,-1.6166 -0.808304,-3.87987 -2.909909,-4.68818 -2.424918,-4.20319 2.909909,-1.93994 3.233222,0 1.778276,0.64665 4.203192,-0.16166 3.718205,-3.55654 1.131633,-3.07157 3.718212,-2.42492 1.616604,0.96997 2.748239,-0.64665 3.718209,-2.1016 1.13164,-0.16166 0.96996,0.80832 4.52651,-0.16167 2.74824,-3.07156 1.13163,0 3.55655,2.42491 1.93993,2.1016 -0.48498,1.13163 0.64664,1.13163 1.61662,-1.61661 3.87987,0.32332 0.32332,3.7182 1.93994,1.45496 7.11309,0.64664 6.30479,4.20319 1.45494,-0.96996 5.17317,2.58658 2.10159,-0.64664 1.93994,-0.80832 4.84983,1.93994 4.36486,2.9099 z m -115.102797,28.93736 2.101596,5.33482 -0.161662,0.96997 -2.909902,-0.32333 -1.778273,-4.04153 -1.778273,-1.45494 -2.424919,0 -0.16166,-2.58659 1.778273,-2.42492 1.131629,2.42492 1.45495,1.45495 2.748241,0.64665 z m -2.58658,33.46387 3.718209,0.80831 3.718207,0.96996 0.808307,0.96998 -1.616612,3.7182 -3.071564,-0.16166 -3.394885,-3.55654 -0.161662,-2.74825 z m -20.692636,-14.06452 1.13163,2.58657 1.131628,1.61662 -1.131628,0.8083 -2.101597,-3.07156 0,-1.93993 0.969967,0 z m -13.7412027,73.07087 3.3948853,-2.26326 3.3948854,-0.96997 2.58658,0.32332 0.484983,1.61661 1.939935,0.48499 1.939934,-1.93993 -0.323322,-1.61661 2.748241,-0.64665 2.909902,2.58658 -1.131629,1.77827 -4.364852,1.13163 -2.748242,-0.48498 -3.718207,-1.13163 -4.3648533,1.45495 -1.616612,0.32332 -1.1316284,-0.64664 z m 48.9833487,-4.52651 1.616612,1.93993 2.101593,-1.61661 -1.454948,-1.2933 -2.263257,0.96998 z m 2.909902,3.07155 1.131624,-2.26325 2.101597,0.32332 -0.808303,1.93993 -2.424918,0 z m 23.602535,-1.93993 1.454954,1.77827 0.969974,-1.13162 -0.808313,-1.93994 -1.616615,1.29329 z m 8.72971,-12.44791 1.131633,5.8198 2.909899,0.80831 5.011495,-2.90991 4.364853,-2.58658 -1.6166,-2.42491 0.48498,-2.42492 -2.1016,1.29329 -2.909898,-0.80831 1.616605,-1.13162 1.939933,0.8083 3.87987,-1.77828 0.48499,-1.45494 -2.42492,-0.80831 0.8083,-1.93994 -2.74824,1.93994 -4.688172,3.55655 -4.849834,2.9099 -1.293294,1.13163 z m 42.35524,-19.88433 2.42492,-1.45495 -0.96997,-1.77828 -1.77827,0.96997 0.32332,2.26326 z",
                        "FL" : "m 759.8167,439.1428 2.26566,7.3186 3.7297,9.74226 5.33479,9.3763 3.71819,6.30476 4.84982,5.49646 4.04151,3.71819 1.6166,2.90989 -1.13162,1.29328 -0.8083,1.29328 2.90988,7.43639 2.90989,2.90988 2.58657,5.3348 3.55653,5.81978 4.52649,8.24468 1.29329,7.59804 0.48498,11.96288 0.64664,1.77826 -0.32332,3.39487 -2.42491,1.29329 0.32332,1.93992 -0.64664,1.93993 0.32332,2.4249 0.48498,1.93993 -2.74822,3.23321 -3.07155,1.45494 -3.87985,0.16166 -1.45495,1.61661 -2.4249,0.96996 -1.29329,-0.48498 -1.13162,-0.96996 -0.32332,-2.90989 -0.80831,-3.39487 -3.39487,-5.17314 -3.55653,-2.26324 -3.87985,-0.32332 -0.8083,1.29328 -3.07155,-4.36483 -0.64664,-3.55653 -2.58657,-4.04151 -1.77826,-1.13163 -1.61661,2.10159 -1.77826,-0.32332 -2.10159,-5.01148 -2.90989,-3.87985 -2.90989,-5.33479 -2.58656,-3.07155 -3.55653,-3.71819 2.10158,-2.42491 3.23321,-5.49646 -0.16166,-1.6166 -4.52649,-0.96996 -1.61661,0.64664 0.32333,0.64664 2.58656,0.96996 -1.45494,4.5265 -0.8083,0.48498 -1.77827,-4.04151 -1.29328,-4.84982 -0.32332,-2.74823 1.45494,-4.68815 0,-9.53797 -3.07155,-3.71819 -1.29328,-3.07155 -5.17314,-1.29328 -1.93992,-0.64664 -1.61661,-2.58657 -3.39487,-1.61661 -1.13162,-3.39487 -2.74823,-0.96996 -2.42491,-3.71819 -4.20317,-1.45494 -2.90989,-1.45495 -2.58656,0 -4.04152,0.80831 -0.16166,1.93992 0.80831,0.96996 -0.48499,1.13163 -3.07154,-0.16166 -3.71819,3.55653 -3.55654,1.93992 -3.87985,0 -3.23321,1.29329 -0.32332,-2.74823 -1.6166,-1.93993 -2.90989,-1.13162 -1.6166,-1.45495 -8.08303,-3.87985 -7.59804,-1.77826 -4.36483,0.64664 -5.98144,0.48498 -5.98144,2.10159 -3.47924,0.61296 -0.23792,-8.04975 -2.58657,-1.93992 -1.77827,-1.77827 0.32332,-3.07156 10.18462,-1.29328 25.5424,-2.90989 6.78975,-0.64664 5.436,0.28027 2.58657,3.87986 1.45494,1.45494 8.09816,0.51522 10.81975,-0.64664 21.51239,-1.29329 5.44572,-0.67437 5.10758,0.20451 0.42683,2.90989 2.233,0.8083 0.23494,-4.63 -1.52822,-4.17295 1.3084,-1.43983 5.55463,0.45475 5.17314,0.32332 z m 12.54541,132.40508 2.42492,-0.64664 1.29328,-0.24249 1.45496,-2.34409 2.34408,-1.61661 1.29329,0.48499 1.69744,0.32332 0.40415,1.05079 -3.4757,1.21246 -4.2032,1.45495 -2.34408,1.21246 -0.88914,-0.88914 z m 13.4987,-5.01149 1.21246,1.0508 2.74824,-2.10159 5.33481,-4.20319 3.7182,-3.87987 2.50575,-6.6281 0.96997,-1.69744 0.16166,-3.39488 -0.72748,0.48498 -0.96996,2.82907 -1.45496,4.60733 -3.23322,5.254 -4.36484,4.20318 -3.39488,1.93993 -2.50575,1.53578 z",
                        "NH" : "m 880.79902,142.42476 0.869,-1.0765 1.09022,-3.29102 -2.54308,-0.91347 -0.48499,-3.07156 -3.87985,-1.13162 -0.32332,-2.74824 -7.27475,-23.44082 -4.60142,-14.542988 -0.89708,-0.0051 -0.64664,1.616605 -0.64664,-0.484981 -0.96997,-0.969963 -1.45494,1.939925 -0.0485,5.032054 0.31165,5.667218 1.93992,2.74824 0,4.04152 -3.7182,5.06278 -2.58657,1.13164 0,1.13162 1.13163,1.77827 0,8.56802 -0.80831,9.21467 -0.16166,4.84982 0.96997,1.2933 -0.16166,4.52649 -0.48499,1.77828 0.96881,0.70922 16.78767,-4.42455 2.17487,-0.60245 1.84357,-2.77333 3.60523,-1.61312 z",
                        "MI" : "M581.61931,82.059006 L 583.4483,80.001402 L 585.62022,79.201221 L 590.99286,75.314624 L 593.27908,74.743065 L 593.73634,75.200319 L 588.59232,80.344339 L 585.27728,82.287628 L 583.21967,83.202124 L 581.61931,82.059006 z M 667.79369,114.18719 L 668.44033,116.69293 L 671.67355,116.85459 L 672.96684,115.64213 C 672.96684,115.64213 672.88601,114.18719 672.56269,114.02552 C 672.23936,113.86386 670.94608,112.16642 670.94608,112.16642 L 668.76366,112.40891 L 667.14704,112.57057 L 666.82372,113.7022 L 667.79369,114.18719 z M 567.49209,111.21318 L 568.20837,110.63278 L 570.9566,109.82447 L 574.51313,107.56123 L 574.51313,106.59126 L 575.15978,105.94462 L 581.14121,104.97466 L 583.56612,103.03473 L 587.93095,100.93315 L 588.09261,99.639864 L 590.03254,96.729975 L 591.8108,95.921673 L 593.10409,94.143408 L 595.36733,91.880161 L 599.73217,89.455254 L 604.42032,88.970273 L 605.55194,90.101896 L 605.22862,91.071859 L 601.51043,92.041822 L 600.05549,95.113371 L 597.79224,95.921673 L 597.30726,98.34658 L 594.88235,101.57979 L 594.55903,104.16636 L 595.36733,104.65134 L 596.3373,103.51972 L 599.89383,100.60983 L 601.18711,101.90311 L 603.45036,101.90311 L 606.68357,102.87307 L 608.13851,104.0047 L 609.59345,107.07625 L 612.34168,109.82447 L 616.22153,109.66281 L 617.67648,108.69285 L 619.29308,109.98613 L 620.90969,110.47112 L 622.20297,109.66281 L 623.33459,109.66281 L 624.9512,108.69285 L 628.99271,105.13632 L 632.38758,104.0047 L 639.01566,103.68138 L 643.54215,101.74145 L 646.12872,100.44817 L 647.58367,100.60983 L 647.58367,106.26794 L 648.06865,106.59126 L 650.97853,107.39957 L 652.91846,106.91458 L 659.06156,105.29798 L 660.19318,104.16636 L 661.64813,104.65134 L 661.64813,111.60274 L 664.88134,114.67429 L 666.17462,115.32093 L 667.4679,116.29089 L 666.17462,116.61421 L 665.36632,116.29089 L 661.64813,115.80591 L 659.54654,116.45255 L 657.28329,116.29089 L 654.05008,117.74584 L 652.27182,117.74584 L 646.45204,116.45255 L 641.27891,116.61421 L 639.33898,119.20078 L 632.38758,119.84742 L 629.96267,120.65572 L 628.83105,123.72727 L 627.53777,124.8589 L 627.05279,124.69724 L 625.59784,123.08063 L 621.07135,125.50554 L 620.42471,125.50554 L 619.29308,123.88893 L 618.48478,124.05059 L 616.54486,128.41543 L 615.57489,132.45694 L 612.39377,139.45774 L 611.21701,138.42347 L 609.84527,137.39215 L 607.90449,127.10413 L 604.36001,125.73408 L 602.30743,123.44785 L 590.18707,120.70437 L 587.3318,119.67473 L 579.10138,117.50199 L 571.21139,116.35887 L 567.49209,111.21318 z,M697.8,177.2L694.6,168.9L692.3,159.9L689.9,156.7L687.3,154.9L685.7,156L681.8,157.8L679.9,162.8L677.1,166.5L676,167.2L674.5,166.5 C 674.5,166.5 671.9,165.1 672.1,164.4 C 672.3,163.8 672.6,159.4 672.6,159.4L676,158.1L676.8,154.7L677.4,152.1L679.9,150.5L679.5,140.5L677.9,138.2L676.6,137.4L675.8,135.3L676.6,134.5L678.2,134.8L678.4,133.2L676,131L674.7,128.4L672.1,128.4L667.6,126.9L662.1,123.5L659.3,123.5L658.7,124.2L657.7,123.7L654.6,121.4L651.7,123.2L648.8,125.5L649.2,129L650.1,129.3L652.2,129.8L652.7,130.6L650.1,131.4L647.5,131.8L646.1,133.5L645.8,135.6L646.1,137.3L646.4,142.8L642.8,144.9L642.2,144.7L642.2,140.5L643.5,138.1L644.1,135.6L643.3,134.8L641.4,135.6L640.4,139.8L637.7,141L635.9,142.9L635.7,143.9L636.4,144.7L635.7,147.3L633.5,147.8L633.5,148.9L634.3,151.3L633.1,157.5L631.5,161.5L632.2,166.2L632.7,167.3L631.9,169.8L631.5,170.6L631.2,173.3L634.8,179.3L637.7,185.8L639.1,190.6L638.3,195.3L637.3,201.3L634.9,206.4L634.6,209.2L631.3,212.3L635.8,212.1L657.2,209.9L664.4,208.9L664.5,210.5L671.4,209.3L681.7,207.8L685.5,207.4L685.7,206.8L685.8,205.3L687.9,201.6L689.9,199.9L689.7,194.8L691.3,193.2L692.4,192.9L692.6,189.3L694.2,186.3L695.2,186.9L695.4,187.5L696.2,187.7L698.1,186.7L697.8,177.2z",
                        "VT" : "m 844.48416,154.05791 0.3167,-5.34563 -2.89071,-10.78417 -0.64664,-0.32332 -2.9099,-1.29329 0.8083,-2.90989 -0.8083,-2.10159 -2.70005,-4.63998 0.96997,-3.87986 -0.80831,-5.17315 -2.42491,-6.46644 -0.80557,-4.92251 26.41936,-6.73182 0.3087,5.52221 1.91626,2.74223 0,4.04152 -3.70715,5.05799 -2.58657,1.14267 -0.011,1.12057 1.30997,1.51912 -0.31093,8.09797 -0.60943,9.25886 -0.22795,5.55694 0.96996,1.29329 -0.16166,4.57069 -0.48498,1.68989 1.01418,0.72716 -7.43755,1.50671 -4.50174,0.72383 z",
                        "ME" : "m 922.83976,78.830719 1.93993,2.101586 2.26325,3.718191 0,1.939926 -2.10159,4.688153 -1.93993,0.646642 -3.39487,3.071549 -4.84981,5.496454 c 0,0 -0.64664,0 -1.29328,0 -0.64664,0 -0.96997,-2.101584 -0.96997,-2.101584 l -1.77826,0.16166 -0.96996,1.454944 -2.42491,1.45495 -0.96996,1.45494 1.6166,1.45494 -0.48498,0.64665 -0.48498,2.74822 -1.93993,-0.16166 0,-1.6166 -0.32332,-1.29329 -1.45494,0.32333 -1.77827,-3.23321 -2.10158,1.29328 1.29328,1.45494 0.32332,1.13163 -0.8083,1.29328 0.32332,3.07155 0.16166,1.6166 -1.6166,2.58657 -2.90989,0.48498 -0.32332,2.90989 -5.3348,3.07155 -1.29328,0.48498 -1.61661,-1.45494 -3.07155,3.55653 0.96997,3.23321 -1.45495,1.29328 -0.16166,4.36483 -1.12328,6.25936 -2.46225,-1.15595 -0.48499,-3.07156 -3.87985,-1.13163 -0.32332,-2.74824 -7.27475,-23.44082 -4.69858,-14.639742 1.42054,-0.118165 1.51379,0.409899 0,-2.586568 1.3083,-4.496456 2.58657,-4.688153 1.45495,-4.041512 -1.93993,-2.424907 0,-5.981437 0.8083,-0.969963 0.80831,-2.748228 -0.16166,-1.454944 -0.16167,-4.849814 1.77827,-4.849814 2.90989,-8.891326 2.10158,-4.203172 1.29329,0 1.29328,0.16166 0,1.131623 1.29329,2.263247 2.74822,0.646642 0.80831,-0.808303 0,-0.969962 4.04151,-2.909889 1.77826,-1.778265 1.45495,0.161661 5.98143,2.424907 1.93993,0.969962 9.05299,29.907187 5.98143,0 0.80831,1.939926 0.16166,4.849814 2.90988,2.263246 0.80831,0 0.16166,-0.484981 -0.48498,-1.131623 2.74822,-0.161661 z m -20.93175,30.147531 1.53578,-1.53578 1.37412,1.0508 0.56581,2.42492 -1.69744,0.88913 -1.77827,-2.82907 z m 6.70893,-5.90062 1.77827,1.8591 c 0,0 1.29329,0.0808 1.29329,-0.2425 0,-0.32332 0.24249,-2.02076 0.24249,-2.02076 l 0.88914,-0.8083 -0.80831,-1.77828 -2.02076,0.72748 -1.37412,2.26326 z",
                        "RI" : "m 874.07001,178.89536 -3.69579,-14.95599 6.26928,-1.84514 2.19113,1.92712 3.30649,4.32065 2.6879,4.40209 -2.99934,1.62479 -1.29328,-0.16166 -1.13162,1.77827 -2.42491,1.93992 -2.90986,0.96995 z",
                        "NY" : "m 830.37944,188.7456 -1.13163,-0.96996 -2.58658,-0.16166 -2.26324,-1.93992 -1.63061,-6.12913 -3.45846,0.0905 -2.44371,-2.7082 -19.38532,4.38194 -43.00178,8.72969 -7.52965,1.22799 -0.73816,-6.46834 1.4281,-1.12538 1.29328,-1.13162 0.96997,-1.61661 1.77826,-1.13162 1.93993,-1.77827 0.48498,-1.6166 2.10158,-2.74823 1.13163,-0.96996 -0.16166,-0.96997 -1.29329,-3.07154 -1.77826,-0.16166 -1.93993,-6.1431 2.90989,-1.77827 4.36483,-1.45494 4.04152,-1.29329 3.23321,-0.48498 6.30475,-0.16166 1.93993,1.29329 1.6166,0.16166 2.10159,-1.29329 2.58657,-1.13162 5.17313,-0.48498 2.10159,-1.77827 1.77826,-3.23321 1.61661,-1.93992 2.10158,0 1.93993,-1.13163 0.16166,-2.26324 -1.45494,-2.10159 -0.32332,-1.45494 1.13162,-2.10159 0,-1.45494 -1.77827,0 -1.77826,-0.8083 -0.8083,-1.13163 -0.16166,-2.58657 5.81977,-5.49645 0.64664,-0.8083 1.45495,-2.90989 2.90989,-4.5265 2.74823,-3.71819 2.10158,-2.4249 2.4151,-1.82561 3.08136,-1.24594 5.49645,-1.29329 3.23321,0.16166 4.5265,-1.45494 7.56519,-2.07117 0.51979,4.97967 2.42492,6.46644 0.8083,5.17315 -0.96996,3.87986 2.58657,4.5265 0.8083,2.10159 -0.8083,2.9099 2.9099,1.29328 0.64664,0.32332 3.07156,10.99294 -0.53629,5.05967 -0.48498,10.83127 0.8083,5.49647 0.8083,3.55654 1.45495,7.27474 0,8.08304 -1.13163,2.26325 1.83933,1.99279 0.79655,1.67842 -1.93992,1.77827 0.32332,1.29328 1.29328,-0.32332 1.45495,-1.29328 2.26324,-2.58657 1.13163,-0.64664 1.6166,0.64664 2.26325,0.16166 7.92136,-3.87985 2.90989,-2.74823 1.29328,-1.45494 4.20317,1.6166 -3.39487,3.55653 -3.87985,2.90989 -7.11306,5.33479 -2.58656,0.96997 -5.81978,1.93992 -4.04151,1.13163 -1.17474,-0.53293 -0.24402,-3.68853 0.48498,-2.74824 -0.16166,-2.10158 -2.81351,-1.699 -4.5265,-0.96997 -3.87986,-1.13162 -3.7182,-1.77828 z",
                        "PA" : "m 825.1237,224.69205 1.30842,-0.271 2.32953,-1.25325 1.21188,-2.48307 1.61661,-2.26325 3.23321,-3.07156 0,-0.8083 -2.42491,-1.6166 -3.55654,-2.42492 -0.96996,-2.58657 -2.74824,-0.32332 -0.16166,-1.13163 -0.8083,-2.74823 2.26326,-1.13162 0.16166,-2.42492 -1.2933,-1.29329 0.16166,-1.61661 1.93994,-3.07155 0,-3.07156 2.69763,-2.64588 -0.92028,-0.67498 -2.52408,-0.19291 -2.29449,-1.93992 -1.54992,-6.11606 -3.50458,0.10052 -2.45523,-2.70333 -18.09099,4.19777 -43.00178,8.72969 -8.89135,1.45494 -0.62067,-6.52139 -5.36253,5.06765 -1.29329,0.48498 -4.20229,3.00889 2.91076,19.13745 2.48166,9.72936 3.5718,19.26149 3.26931,-0.63768 11.94358,-1.50247 37.92663,-7.6652 14.87621,-2.82332 8.30035,-1.62236 0.26711,-0.23853 2.1016,-1.61662 2.10158,-0.68084 z",
                        "NJ" : "m 829.67942,188.46016 -2.32255,2.73427 0,3.07156 -1.93994,3.07155 -0.16166,1.61662 1.2933,1.29328 -0.16166,2.42492 -2.26326,1.13162 0.8083,2.74823 0.16166,1.13163 2.74824,0.32332 0.96996,2.58657 3.55654,2.42492 2.42491,1.6166 0,0.80831 -2.98321,2.69656 -1.61661,2.26324 -1.45495,2.74824 -2.26325,1.29328 -0.46245,1.60248 -0.2425,1.21246 -0.60923,2.60674 1.09227,2.24419 3.23321,2.90989 4.84981,2.26325 4.04151,0.64664 0.16166,1.45494 -0.8083,0.96996 0.32332,2.74823 0.8083,0 2.10159,-2.4249 0.8083,-4.84982 2.74823,-4.04151 3.07155,-6.46642 1.13162,-5.49645 -0.64664,-1.13163 -0.16166,-9.37631 -1.61661,-3.39486 -1.13162,0.8083 -2.74823,0.32332 -0.48498,-0.48498 1.13163,-0.96997 2.10158,-1.93992 0.0631,-1.09383 -0.38439,-3.43384 0.57337,-2.74824 -0.11747,-1.96901 -2.80754,-1.75035 -5.09214,-1.17576 -4.13744,-1.38163 -3.58563,-1.64569 z",
                        "DE" : "m 825.6261,228.2791 0.36831,-2.14689 0.37507,-1.69105 -1.623,0.39776 -1.61546,0.46756 -2.20626,1.7643 1.72012,5.04288 2.26326,5.65812 2.10158,9.69965 1.61662,6.30478 5.01148,-0.16166 6.14212,-1.18068 -2.26423,-7.38627 -0.96997,0.48498 -3.55653,-2.4249 -1.77826,-4.68816 -1.93993,-3.55653 -3.14712,-2.87031 -0.86416,-2.09812 0.36636,-1.61546 z",
                        "MD" : "m 839.79175,252.41476 -6.00855,1.20384 -5.1429,0.11746 -1.84356,-6.92233 -1.92481,-9.16932 -2.57262,-6.18845 -1.28838,-4.39833 -7.50602,1.62236 -14.87621,2.82332 -37.45143,7.5509 1.1313,5.01166 0.96996,5.65811 0.32332,-0.32332 2.1016,-2.4249 2.26324,-2.61766 2.42491,-0.61556 1.45496,-1.45495 1.77826,-2.58657 1.29328,0.64665 2.90989,-0.32333 2.58658,-2.10158 2.00689,-1.45327 1.84523,-0.48498 1.64435,1.12995 2.90989,1.45494 1.93992,1.77827 1.21246,1.53578 4.12235,1.69743 0,2.90989 5.49646,1.29329 1.14444,0.54198 1.4119,-2.02832 2.88197,1.97016 -1.27817,2.48193 -0.76527,3.98566 -1.77826,2.58657 0,2.10159 0.64664,1.77827 5.06395,1.35569 4.3111,-0.0617 3.07154,0.96997 2.10159,0.32332 0.96996,-2.10159 -1.45494,-2.10158 0,-1.77827 -2.42491,-2.10159 -2.10158,-5.49645 1.29328,-5.3348 -0.16166,-2.10158 -1.29328,-1.29329 c 0,0 1.45494,-1.6166 1.45494,-2.26324 0,-0.64665 0.48498,-2.10159 0.48498,-2.10159 l 1.93993,-1.29328 1.93992,-1.61661 0.48498,0.96997 -1.45494,1.6166 -1.29328,3.71819 0.32332,1.13162 1.77826,0.32332 0.48498,5.49646 -2.10158,0.96996 0.32332,3.55653 0.48498,-0.16166 1.13162,-1.93992 1.61661,1.77826 -1.61661,1.29329 -0.32332,3.39487 2.58657,3.39487 3.87985,0.48498 1.61661,-0.8083 3.23655,4.18293 1.35835,0.5363 6.65367,-2.79695 2.00758,-4.02387 -0.43596,-4.90798 z m -15.96958,9.02872 1.13162,2.50575 0.16166,1.77827 1.13163,1.8591 c 0,0 0.88914,-0.88914 0.88914,-1.21246 0,-0.32332 -0.72747,-3.07156 -0.72747,-3.07156 l -0.72748,-2.34409 -1.8591,0.48499 z",
                        "VA" : "m 831.63885,266.06892 -0.14391,-1.94703 6.45343,-2.54988 -0.77041,3.21784 -2.91995,3.77911 -0.41809,4.58582 0.46175,3.39044 -1.82797,4.97816 -2.16427,1.91614 -1.47034,-4.64081 0.44589,-5.44911 1.587,-4.18307 0.76687,-3.09761 z m 3.34019,28.30136 -58.17418,12.57543 -37.42697,5.27907 -6.67833,-0.37518 -2.58525,1.92638 -7.33913,0.22069 -8.38211,0.97767 -10.91496,1.61462 10.46943,-5.6112 -0.0131,-2.07493 1.52005,-2.14613 10.55378,-11.50143 3.94672,4.47746 3.78301,0.96398 2.54346,-1.14032 2.23722,-1.31116 2.53661,1.34352 3.91417,-1.42776 1.87673,-4.55634 2.60092,0.54002 2.85524,-2.13125 1.79927,0.4936 2.82721,-3.67657 0.34825,-2.08311 -0.96366,-1.27557 1.00277,-1.86663 5.27427,-12.27715 0.61677,-5.73508 1.22889,-0.52354 2.17853,2.44287 3.93586,-0.30117 1.92921,-7.57363 2.79399,-0.56086 1.04975,-2.74107 2.57982,-2.34688 2.77183,-5.69519 0.0849,-5.06755 9.82151,3.82282 c 0.68085,0.34042 0.83288,-5.04915 0.83288,-5.04915 l 3.65256,1.59833 0.0683,2.93816 5.78425,1.29949 2.13295,1.1762 1.65992,2.05569 -0.65455,3.64867 -1.94744,2.59098 0.10985,2.05907 0.58896,1.85291 4.97875,1.26843 4.45127,0.0399 3.06883,0.95864 1.94351,0.3093 0.71481,3.08846 3.19044,0.40253 0.86807,1.20002 -0.43949,4.69008 1.37473,1.10255 -0.47895,1.93039 1.22941,0.78977 -0.2218,1.3846 -2.69399,-0.0949 0.089,1.61552 2.28099,1.54287 0.12154,1.4119 1.77311,1.78538 0.49179,2.52413 -2.55304,1.38131 1.57222,1.4943 5.80102,-1.68583 3.60762,6.01193 z",
                        "WV" : "m 761.18551,238.96731 1.11201,4.94453 1.08344,6.03133 2.13029,-2.58034 2.26324,-3.07156 2.53838,-0.61555 1.45495,-1.45494 1.77827,-2.58657 1.44498,0.64664 2.90989,-0.32332 2.58658,-2.10159 2.00689,-1.45326 1.84523,-0.48499 1.30392,1.01647 3.64325,1.82163 1.93993,1.77827 1.37412,1.29328 -0.76172,5.55494 -5.83491,-2.54122 -4.24525,-1.62202 -0.10114,5.17843 -2.74764,5.53673 -2.53003,2.42666 -1.19209,2.74939 -2.64358,0.5001 -0.89784,3.60188 -1.04323,3.94967 -3.96824,0.34074 -2.32373,-2.43888 -1.07115,0.55941 -0.63268,5.4697 -1.35029,3.5345 -4.9584,10.95497 0.89669,1.1607 -0.20586,1.90854 -2.80869,3.88447 -1.8085,-0.54429 -2.96805,2.15974 -2.54238,-0.57221 -1.99923,4.55557 c 0,0 -3.25931,1.43022 -3.92291,1.36772 -0.16051,-0.0151 -2.4691,-1.2491 -2.4691,-1.2491 l -2.33652,1.37937 -2.4098,1.0444 -3.74469,-0.88912 -1.1214,-1.16828 -2.19222,-3.02336 -3.14259,-1.98812 -1.71157,-3.62324 -4.28488,-3.46819 -0.64665,-2.26325 -2.58657,-1.45495 -0.80831,-1.6166 -0.24249,-5.25398 2.18242,-0.0808 1.93994,-0.8083 0.16166,-2.74823 1.6166,-1.45495 0.16166,-5.01148 0.96996,-3.87986 1.29329,-0.64664 1.29328,1.13162 0.48499,1.77827 1.77827,-0.96997 0.48498,-1.6166 -1.13162,-1.77827 0,-2.42491 0.96996,-1.29329 2.26325,-3.39487 1.29328,-1.45494 2.1016,0.48498 2.26324,-1.61662 3.07155,-3.39487 2.26326,-3.87986 0.32332,-5.65811 0.48498,-5.01149 0,-4.68816 -1.13162,-3.07155 0.96996,-1.45496 1.28348,-1.29328 3.49125,19.82712 4.63101,-0.75115 12.42832,-1.79965 z",
                        "OH" : "m 735.32497,193.32832 -6.09354,4.05335 -3.87985,2.26325 -3.39487,3.71819 -4.04151,3.87985 -3.23321,0.8083 -2.90989,0.48498 -5.49646,2.58657 -2.10158,0.16166 -3.39487,-3.07155 -5.17314,0.64665 -2.58656,-1.45495 -2.38107,-1.35083 -4.89257,0.70341 -10.18462,1.61661 -11.20687,2.18473 1.29329,14.63028 1.77827,13.74117 2.58656,23.4408 0.56582,4.83117 4.12235,-0.12902 2.42491,-0.80831 3.3638,1.50314 2.07049,4.36483 5.13894,-0.0171 1.89174,2.1187 1.76117,-0.0653 2.53839,-1.34146 2.50417,0.3715 5.42128,0.48268 1.72697,-2.13268 2.34565,-1.29328 2.07049,-0.68085 0.64664,2.74824 1.77828,0.96996 3.47569,2.34407 2.18242,-0.0808 1.33312,-0.49248 0.18471,-2.76153 1.58536,-1.45496 0.0992,-4.79272 c 0,0 1.02396,-4.10906 1.02396,-4.10906 l 1.29927,-0.60128 1.32135,1.14774 0.53815,1.69702 1.71913,-1.03742 0.43898,-1.46075 -1.11669,-1.90306 0.0663,-2.31443 0.749,-1.07231 2.15276,-3.30648 1.05022,-1.54334 2.10159,0.48498 2.26325,-1.61661 3.07155,-3.39487 2.77149,-4.07873 0.32033,-5.05551 0.48498,-5.01149 -0.17678,-5.30688 -0.95484,-2.89478 0.35124,-1.18978 1.80439,-1.75011 -2.28879,-9.04733 -2.90989,-19.36177 z",
                        "IN" : "m 619.56954,299.97132 0.0653,-2.85858 0.48499,-4.52651 2.26324,-2.90988 1.77828,-3.87987 2.58656,-4.20317 -0.48498,-5.81979 -1.77826,-2.74823 -0.32332,-3.23321 0.8083,-5.49647 -0.48498,-6.95141 -1.2933,-16.00441 -1.29328,-15.35776 -0.97047,-11.72002 3.07106,0.88951 1.45495,0.96996 1.13162,-0.32332 2.10159,-1.93992 2.82957,-1.61699 5.0928,-0.16204 21.98587,-2.26326 5.57573,-0.53316 1.50314,15.95621 4.25135,36.84155 0.59846,5.7716 -0.3715,2.26325 1.22798,1.79537 0.0964,1.37255 -2.52129,1.59951 -3.53943,1.55131 -3.20213,0.55028 -0.59846,4.86693 -4.57469,3.31247 -2.79642,4.01044 0.32332,2.37673 -0.58134,1.5342 -3.32647,0 -1.58553,-1.6166 -2.49331,1.2622 -2.68296,1.50314 0.16167,3.05445 -1.19379,0.25803 -0.46788,-1.01814 -2.16688,-1.50314 -3.25032,1.34148 -1.55131,3.00625 -1.43784,-0.8083 -1.45495,-1.59951 -4.46434,0.48499 -5.59283,0.96996 -2.90989,1.55132 z",
                        "IL" : "m 619.54145,300.34244 0.0312,-3.22971 0.56739,-4.64596 2.33253,-2.91586 1.86665,-4.07576 2.23302,-3.99533 -0.3715,-5.2524 -2.00521,-3.54257 -0.0964,-3.34668 0.69483,-5.26951 -0.82541,-7.17837 -1.06634,-15.77745 -1.29328,-15.01734 -0.92228,-11.6392 -0.27251,-0.92139 -0.8083,-2.58657 -1.29328,-3.71819 -1.61661,-1.77827 -1.45494,-2.58656 -0.23357,-5.48896 -45.79643,2.59825 0.22862,2.37195 2.28623,0.68587 0.91448,1.14311 0.45725,1.82898 3.88658,3.42934 0.68588,2.28623 -0.68588,3.42934 -1.82898,3.65796 -0.68586,2.51484 -2.28623,1.82899 -1.82898,0.68587 -5.25832,1.37173 -0.68587,1.82898 -0.68587,2.05761 0.68587,1.37174 1.82898,1.60036 -0.22862,4.1152 -1.82899,1.60036 -0.68586,1.60036 0,2.74347 -1.82898,0.45724 -1.60036,1.14312 -0.22862,1.37174 0.22862,2.0576 -1.71467,1.31457 -1.0288,2.80064 0.45724,3.65795 2.28623,7.31593 7.31593,7.54455 5.48693,3.65796 -0.22862,4.34383 0.9145,1.37174 6.40143,0.45724 2.74347,1.37174 -0.68586,3.65796 -2.28623,5.94419 -0.68587,3.20072 2.28622,3.88658 6.40144,5.25832 4.57246,0.68587 2.05759,5.0297 2.05761,3.20071 -0.91449,2.97209 1.60036,4.11521 1.82898,2.05761 1.41403,-0.88069 0.90766,-2.07479 2.21308,-1.7472 2.13147,-0.6144 2.60253,1.1798 3.62699,1.3757 1.18895,-0.29823 0.19987,-2.25845 -1.2873,-2.41179 0.30422,-2.37672 1.8384,-1.34745 3.02254,-0.81029 1.2609,-0.45852 -0.61261,-1.38688 -0.79137,-2.35437 1.4326,-0.98096 1.15747,-3.21403 z",
                        "CT" : "m 874.06831,178.86288 -3.67743,-14.87881 -4.71882,0.92031 -21.22878,4.74309 1.00019,3.22567 1.45495,7.27474 0.17678,8.96692 -1.22002,2.17487 1.92079,1.93234 4.27153,-3.90564 3.55653,-3.23321 1.93992,-2.10159 0.80831,0.64664 2.74822,-1.45494 5.17314,-1.13162 7.79469,-3.17877 z",
                        "WI" : "m 615.06589,197.36866 -0.0667,-3.15742 -1.17911,-4.5265 -0.64664,-6.14309 -1.13162,-2.42491 0.96996,-3.07155 0.8083,-2.90989 1.45495,-2.58656 -0.64665,-3.39487 -0.64664,-3.55653 0.48498,-1.77827 1.93993,-2.42491 0.16166,-2.74823 -0.8083,-1.29328 0.64664,-2.58657 -0.45252,-4.17071 2.74823,-5.65811 2.90989,-6.78974 0.16166,-2.26325 -0.32332,-0.96996 -0.80831,0.48498 -4.20317,6.30476 -2.74823,4.04151 -1.93992,1.77827 -0.8083,2.26324 -1.95495,0.8083 -1.13162,1.93993 -1.45495,-0.32332 -0.16166,-1.77827 1.29329,-2.4249 2.10158,-4.68816 1.77827,-1.6166 0.99083,-2.35785 -2.56045,-1.90134 -1.97482,-10.36699 -3.54747,-1.34198 -1.94626,-2.30833 -12.12971,-2.72164 -2.87589,-1.01205 -8.21312,-2.16729 -7.91792,-1.15875 -3.76516,-5.13067 -0.7504,0.55401 -1.19791,-0.16166 -0.64665,-1.13162 -1.33401,0.29655 -1.13163,0.16166 -1.77826,0.96996 -0.96997,-0.64664 0.64665,-1.93993 1.93992,-3.07155 1.13162,-1.13162 -1.93992,-1.45494 -2.10159,0.8083 -2.90989,1.93992 -7.43638,3.23321 -2.90989,0.64664 -2.90988,-0.48498 -0.98173,-0.87825 -2.1167,2.83518 -0.22862,2.74347 0,8.45903 -1.14312,1.60037 -5.25832,3.88657 -2.28622,5.94419 0.45724,0.22862 2.51485,2.05761 0.68586,3.20072 -1.82898,3.20071 0,3.88659 0.45725,6.63005 2.97209,2.9721 3.42935,0 1.82898,3.20072 3.42933,0.45724 3.88659,5.71557 7.0873,4.11521 2.0576,2.74347 0.9145,7.43024 0.68586,3.31502 2.28623,1.60036 0.22862,1.37174 -2.0576,3.42933 0.22862,3.20073 2.51485,3.88658 2.51485,1.14311 2.97209,0.45724 1.34234,1.38012 45.29836,-2.66945 z",
                        "NC" : "m 834.98153,294.31554 2.085,4.91735 3.55653,6.46642 2.4249,2.42491 0.64664,2.26325 -2.4249,0.16166 0.8083,0.64664 -0.32332,4.20317 -2.58657,1.29328 -0.64664,2.10159 -1.29328,2.90989 -3.7182,1.6166 -2.4249,-0.32332 -1.45495,-0.16166 -1.6166,-1.29328 0.32332,1.29328 0,0.96997 1.93993,0 0.8083,1.29328 -1.93993,6.30476 4.20317,0 0.64665,1.6166 2.26324,-2.26324 1.29329,-0.48499 -1.93993,3.55653 -3.07155,4.84982 -1.29328,0 -1.13163,-0.48498 -2.74822,0.64664 -5.17314,2.42491 -6.46642,5.33479 -3.39487,4.68815 -1.93992,6.46642 -0.48498,2.42491 -4.68816,0.48498 -5.45313,1.33666 -9.94641,-8.20253 -12.60954,-7.59805 -2.90989,-0.80831 -12.60953,1.45495 -4.27646,0.75015 -1.6166,-3.23322 -2.97036,-2.1167 -16.48939,0.48498 -7.27474,0.8083 -9.05299,4.52651 -6.14311,2.58656 -21.17755,2.58658 0.50009,-4.05433 1.77827,-1.45494 2.74824,-0.64665 0.64664,-3.7182 4.20318,-2.74822 3.87985,-1.45496 4.20319,-3.55653 4.36483,-2.10159 0.64664,-3.07156 3.87986,-3.87985 0.64664,-0.16166 c 0,0 0,1.13163 0.80831,1.13163 0.8083,0 1.93993,0.32332 1.93993,0.32332 l 2.26325,-3.55654 2.10159,-0.64665 2.26324,0.32333 1.61662,-3.55653 2.90989,-2.58658 0.48498,-2.10159 0.1875,-3.64819 4.2765,-0.0225 7.19859,-0.85579 15.75723,-2.25243 15.13604,-2.08657 21.64048,-4.71935 19.98332,-4.25857 11.17694,-2.40581 5.04998,-1.15688 z m 4.27046,33.20657 2.58658,-2.50575 3.15238,-2.58658 1.53578,-0.64664 0.16166,-2.02076 -0.64664,-6.14312 -1.45495,-2.34408 -0.64665,-1.8591 0.72748,-0.2425 2.74824,5.49648 0.40415,4.44567 -0.16166,3.39489 -3.39488,1.53577 -2.82907,2.42492 -1.13162,1.21246 -1.0508,-0.16166 z",
                        "DC" : "m 805.81945,250.84384 -1.85828,-1.82417 -1.23263,-0.68629 1.44301,-2.02247 2.88909,1.9485 -1.24119,2.58443 z",
                        "MA" : "m 899.62349,173.25394 2.17192,-0.68588 0.45726,-1.71467 1.0288,0.11431 1.0288,2.28624 -1.25742,0.45724 -3.8866,0.11432 0.45724,-0.57156 z m -9.37354,0.80018 2.28622,-2.62917 1.60037,0 1.82899,1.48605 -2.40054,1.0288 -2.17192,1.0288 -1.14312,-0.91448 z m -34.79913,-21.98819 17.64687,-4.64068 2.26326,-0.64664 1.91408,-2.79571 3.73677,-1.66331 2.88924,4.41284 -2.42491,5.17314 -0.32332,1.45494 1.93993,2.58657 1.13162,-0.8083 1.77827,0 2.26324,2.58656 3.87986,5.98144 3.55653,0.48498 2.26324,-0.96996 1.77827,-1.77827 -0.80831,-2.74822 -2.10158,-1.61661 -1.45495,0.8083 -0.96996,-1.29328 0.48498,-0.48498 2.10159,-0.16166 1.77826,0.8083 1.93993,2.42491 0.96996,2.90989 0.32332,2.4249 -4.20317,1.45495 -3.87985,1.93992 -3.87985,4.5265 -1.93993,1.45494 0,-0.96996 2.42491,-1.45495 0.48498,-1.77826 -0.8083,-3.07155 -2.90989,1.45494 -0.8083,1.45495 0.48498,2.26324 -2.06633,1.00043 -2.7472,-4.52713 -3.39488,-4.36484 -2.0705,-1.81247 -6.53327,1.8762 -5.09233,1.05079 -20.67516,4.59221 -0.66776,-4.76785 0.64664,-10.58877 4.28927,-0.88914 6.78975,-1.2933 z",
                        "TN" : "m 696.67788,318.25411 -51.89309,5.01149 -15.75956,1.77826 -4.6212,0.51271 -3.86835,-0.0277 -0.22097,4.10083 -8.18538,0.26401 -6.95141,0.64664 -8.09083,-0.12386 -1.41378,7.07286 -1.69623,5.48005 -3.29317,2.75084 -1.34874,4.38106 -0.32332,2.58657 -4.04152,2.26324 1.45494,3.55654 -0.96996,4.36484 -0.96838,0.78965 108.15855,-10.40755 0.40327,-3.95494 1.81073,-1.49039 2.83415,-0.74945 0.67193,-3.71698 4.0986,-2.70496 4.04693,-1.49403 4.08358,-3.57033 4.43609,-2.02546 0.52126,-3.06735 4.0646,-3.98499 0.5508,-0.11417 c 0,0 0.0312,1.13162 0.83955,1.13162 0.8083,0 1.93993,0.35457 1.93993,0.35457 l 2.26325,-3.58779 2.07034,-0.64664 2.27511,0.29521 1.59831,-3.53286 2.95525,-2.64391 0.42168,-1.93911 0.30896,-3.71115 -2.14655,-0.19977 -2.60168,2.02833 -6.99331,0.0291 -18.35929,2.38682 -8.06109,1.9082 z",
                        "AR" : "m 593.82477,343.05296 -3.97988,0.7167 -5.11215,-0.63403 0.4207,-1.60207 2.97975,-2.56669 0.94338,-3.65625 -1.82898,-2.9721 -78.41757,2.51485 1.60036,6.85869 -1e-5,8.23042 1.37175,10.97399 0.22862,37.83693 2.28623,1.94329 2.97209,-1.37173 2.74348,1.14311 0.68034,6.5733 55.62126,-1.1406 1.14563,-2.09037 -0.28662,-3.54951 -1.82563,-2.9721 1.59869,-1.48521 -1.59869,-2.5115 0.6842,-2.50983 1.36839,-5.60543 2.51819,-2.06263 -0.68587,-2.28456 3.65797,-5.37179 2.74347,-1.36839 -0.11348,-1.49358 -0.34544,-1.82564 2.85695,-5.59873 2.40304,-1.25659 0.38413,-3.42763 1.77067,-1.2417 -3.14352,-0.48427 -1.34146,-4.01044 2.80408,-2.37671 0.55026,-2.0192 1.27948,-4.04661 1.06619,-3.25539 z",
                        "MO" : "m 558.44022,248.11316 -2.51987,-3.08725 -1.14312,-2.28623 -64.35723,2.40054 -2.28626,0.11431 1.25743,2.51485 -0.22862,2.28622 2.51484,3.88659 3.0864,4.11521 3.08641,2.74347 2.16123,0.22862 1.49673,0.9145 0,2.97209 -1.82897,1.60036 -0.45726,2.28622 2.05761,3.42935 2.51486,2.97209 2.51484,1.82898 1.37173,11.65975 0.31414,36.07221 0.22862,4.68675 0.45724,5.38351 22.43299,-0.86682 23.20603,-0.68587 20.80466,-0.80101 11.65474,-0.2303 2.1694,3.426 -0.68419,3.3075 -3.08725,2.40304 -0.57239,1.83734 5.37849,0.45726 3.89496,-0.68588 1.71718,-5.49363 0.65142,-5.85679 2.09803,-2.55516 2.59603,-1.48689 0.0514,-3.05024 1.01602,-1.93648 -1.69423,-2.54377 -1.33093,0.98426 -1.99262,-2.22724 -1.28503,-4.759 0.80101,-2.5182 -1.94413,-3.42766 -1.83064,-4.5758 -4.79941,-0.79934 -6.9688,-5.59875 -1.71886,-4.11353 0.79935,-3.20072 2.05927,-6.05767 0.45892,-2.86363 -1.94914,-1.03131 -6.85534,-0.79767 -1.02797,-1.71216 -0.1118,-4.23036 -5.48694,-3.43101 -6.97551,-7.7715 -2.28622,-7.31593 -0.23029,-4.22532 0.80101,-2.2879 z",
                        "GA" : "m 672.29229,355.5518 0,2.18242 0.16166,2.1016 0.64664,3.39487 3.39488,7.92137 2.42491,9.86131 1.45494,6.14311 1.61661,4.84981 1.45495,6.95141 2.10159,6.30477 2.58657,3.39488 0.48498,3.39487 1.93993,0.8083 0.16166,2.1016 -1.77827,4.84981 -0.48498,3.23322 -0.16166,1.93993 1.61661,4.36484 0.32332,5.3348 -0.80831,2.42491 0.64665,0.80831 1.45495,0.8083 0.2047,3.21809 2.23301,3.34953 2.25044,2.16205 7.92138,0.16166 10.81975,-0.64664 21.51239,-1.29328 5.44572,-0.67437 4.57725,0.0277 0.16166,2.90989 2.58657,0.8083 0.32332,-4.36484 -1.61661,-4.5265 1.13163,-1.6166 5.81978,0.8083 4.97741,0.31778 -0.77542,-6.29879 2.26324,-10.02295 1.45495,-4.20318 -0.48499,-2.58656 3.33441,-6.2443 -0.5103,-1.35168 -1.91341,0.70458 -2.58656,-1.2933 -0.64665,-2.10159 -1.29328,-3.55653 -2.26326,-2.10159 -2.58656,-0.64664 -1.61661,-4.84982 -2.92501,-6.335 -4.20317,-1.93993 -2.1016,-1.93993 -1.29329,-2.58657 -2.10158,-1.93993 -2.26325,-1.29329 -2.26325,-2.90989 -3.07155,-2.26324 -4.52651,-1.77828 -0.48498,-1.45494 -2.42491,-2.90989 -0.48498,-1.45495 -3.39488,-4.97048 -3.51987,0.0992 -3.75491,-2.35614 -1.41828,-1.29328 -0.32332,-1.77827 0.8708,-1.93992 2.22664,-1.11014 -0.63394,-2.09722 -41.86975,4.98893 z",
                        "SC" : "m 764.94328,408.16488 -1.77706,0.9695 -2.58657,-1.29329 -0.64664,-2.10159 -1.29328,-3.55653 -2.26326,-2.1016 -2.58657,-0.64664 -1.6166,-4.84981 -2.74824,-5.98145 -4.20317,-1.93994 -2.1016,-1.93992 -1.29328,-2.58657 -2.10159,-1.93994 -2.26325,-1.29328 -2.26325,-2.90989 -3.07155,-2.26324 -4.52651,-1.77828 -0.48498,-1.45494 -2.4249,-2.90989 -0.48499,-1.45496 -3.39488,-5.17313 -3.39487,0.16166 -4.04152,-2.42492 -1.29328,-1.29328 -0.32332,-1.77827 0.8083,-1.93992 2.26325,-0.96998 -0.51082,-2.28908 5.7681,-2.33657 9.1155,-4.589 7.77473,-0.80831 16.1144,-0.42248 2.63825,1.87743 1.6791,3.35822 4.30235,-0.60998 12.60953,-1.45496 2.90989,0.80831 12.60954,7.59806 10.10808,8.12168 -5.42117,5.45834 -2.58657,6.1431 -0.48498,6.30476 -1.6166,0.8083 -1.13163,2.74823 -2.4249,0.64664 -2.10159,3.55653 -2.74823,2.74823 -2.26324,3.39487 -1.61661,0.8083 -3.55653,3.39487 -2.90989,0.16166 0.96997,3.23321 -5.01148,5.49646 -2.10159,1.29328 z",
                        "KY" : "m 725.9944,295.2707 -2.29332,2.40168 -3.57819,3.99404 -4.92455,5.46467 -1.21577,1.71577 -0.0625,2.10158 -4.37986,2.16409 -5.65812,3.39488 -7.23187,1.79885 -51.86789,4.89886 -15.75956,1.77826 -4.6212,0.51271 -3.86835,-0.0277 -0.22695,4.22028 -8.17941,0.14456 -6.95141,0.64664 -7.98748,-0.0602 1.20778,-1.32008 2.49954,-1.54085 0.22863,-3.20073 0.91449,-1.82898 -1.60682,-2.5389 0.80183,-1.90681 2.26326,-1.77826 2.10158,-0.64665 2.74823,1.29329 3.55654,1.29328 1.13163,-0.32332 0.16166,-2.26325 -1.29329,-2.42491 0.32332,-2.26325 1.93993,-1.45494 2.58658,-0.64665 1.6166,-0.64664 -0.8083,-1.77827 -0.64664,-1.93993 1.50662,-0.9958 c 0.003,-0.0371 1.25396,-3.52229 1.23829,-3.65781 l 3.05322,-1.47868 5.31979,-0.96996 4.49404,-0.48498 1.39244,1.62743 1.52827,0.8708 1.59077,-3.10821 3.18708,-1.28262 2.20509,1.48403 0.41056,0.99904 1.17352,-0.26401 -0.16167,-2.95293 3.13087,-1.74919 2.14809,-1.07348 1.52936,1.66081 3.31815,-0.0442 0.58733,-1.57125 -0.36751,-2.26324 2.60053,-3.9985 4.77655,-3.4379 0.70595,-4.83586 2.92502,-0.45591 3.79146,-1.64568 2.44332,-1.70824 -0.19833,-1.56493 -1.14245,-1.45494 0.56582,-2.99491 4.18485,-0.1175 2.29991,-0.7458 3.34739,1.4291 2.05411,4.36484 5.13229,0.0108 2.05101,2.20819 1.61545,-0.1477 2.60169,-1.27817 5.23706,0.57337 2.57492,0.21751 1.68758,-2.05624 2.61795,-1.42588 1.88178,-0.7071 0.64664,2.83663 2.04343,1.05834 2.64276,2.08249 0.11747,5.67324 0.8083,1.57241 2.58972,1.55628 0.77164,2.29451 4.15989,3.43694 1.80531,3.62324 2.45655,1.65852 z",
                        "AL" : "m 631.30647,460.41572 -1.4906,-14.3215 -2.74824,-18.75264 0.16166,-14.06449 0.8083,-31.03885 -0.16166,-16.65106 0.16509,-6.41906 44.48448,-3.61945 -0.1478,2.18242 0.16166,2.1016 0.64665,3.39487 3.39488,7.92137 2.4249,9.86131 1.45495,6.14311 1.6166,4.84982 1.45496,6.95141 2.10158,6.30476 2.58657,3.39489 0.48498,3.39486 1.93994,0.80831 0.16166,2.10159 -1.77828,4.84982 -0.48498,3.23322 -0.16166,1.93992 1.61662,4.36485 0.32332,5.33479 -0.80832,2.42492 0.64666,0.8083 1.45494,0.8083 0.32814,2.88882 -5.59766,-0.35355 -6.78975,0.64665 -25.5424,2.90988 -10.41156,1.40677 -0.22138,2.8774 1.77827,1.77827 2.58657,1.93992 0.58086,7.93544 -5.54206,2.5729 -2.74822,-0.32332 2.74822,-1.93993 0,-0.96996 -3.07154,-5.98144 -2.26325,-0.64664 -1.45495,4.36483 -1.29328,2.74823 -0.64664,-0.16166 -2.74823,0 z",
                        "LA" : "m 607.96706,459.16125 -3.28461,-3.16614 1.00991,-5.50023 -0.66135,-0.89308 -9.26167,1.00656 -25.02832,0.45892 -0.68419,-2.39468 0.91281,-8.4557 3.31588,-5.94585 5.03136,-8.69102 -0.57407,-2.39802 1.25659,-0.68085 0.45893,-1.95249 -2.28624,-2.05593 -0.11179,-1.94245 -1.83066,-4.34551 -0.14705,-6.3386 -55.47379,0.92397 0.0286,9.57357 0.68587,9.37353 0.68587,3.88658 2.51485,4.11521 0.91449,5.02971 4.34383,5.48693 0.22862,3.20072 0.68587,0.68587 -0.68587,8.45904 -2.97209,5.02969 1.60036,2.05761 -0.68588,2.51484 -0.68586,7.31593 -1.37174,3.20071 0.12246,3.61645 4.68648,-1.52015 12.11335,0.20701 10.34627,3.55653 6.46642,1.13163 3.71819,-1.45495 3.23321,1.13163 3.23321,0.96996 0.8083,-2.10159 -3.23321,-1.13162 -2.58657,0.48498 -2.74823,-1.6166 c 0,0 0.16167,-1.29329 0.80831,-1.45495 0.64664,-0.16166 3.07155,-0.96996 3.07155,-0.96996 l 1.77826,1.45494 1.77827,-0.96996 3.23321,0.64664 1.45494,2.42491 0.32332,2.26325 4.52649,0.32332 1.77827,1.77826 -0.8083,1.61661 -1.29329,0.8083 1.61661,1.6166 8.40634,3.55653 3.55653,-1.29328 0.96997,-2.42491 2.58656,-0.64664 1.77827,-1.45494 1.29328,0.96996 0.8083,2.90989 -2.26324,0.8083 0.64664,0.64664 3.39487,-1.29328 2.26325,-3.39487 0.8083,-0.48498 -2.10159,-0.32332 0.8083,-1.61661 -0.16166,-1.45494 2.10159,-0.48498 1.13162,-1.29329 0.64664,0.8083 c 0,0 -0.16166,3.07155 0.64665,3.07155 0.8083,0 4.20317,0.64665 4.20317,0.64665 l 4.04151,1.93992 0.96996,1.45495 2.90989,0 1.13163,0.96996 2.26324,-3.07155 0,-1.45495 -1.29328,0 -3.39487,-2.74822 -5.81978,-0.80831 -3.23321,-2.26324 1.13163,-2.74823 2.26324,0.32332 0.16166,-0.64664 -1.77826,-0.96996 0,-0.48499 3.23321,0 1.77826,-3.07154 -1.29328,-1.93993 -0.32332,-2.74823 -1.45495,0.16166 -1.93992,2.10159 -0.64664,2.58657 -3.07155,-0.64665 -0.96997,-1.77826 1.77827,-1.93993 1.90333,-3.4456 -1.0611,-2.41227 -1.16564,-3.98133 z",
                        "MS" : "m 631.55882,459.34458 -0.25426,1.25615 -5.17314,0 -1.45494,-0.8083 -2.10159,-0.32332 -6.78974,1.93992 -1.77826,-0.8083 -2.58657,4.20317 -1.10254,0.77802 -1.12383,-2.48798 -1.14312,-3.88659 -3.42933,-3.20071 1.1431,-5.54455 -0.68586,-0.91449 -1.82898,0.22862 -7.91792,0.87337 -24.5465,0.37337 -0.76974,-2.22536 0.87337,-8.3768 3.11684,-5.67281 5.22707,-9.1449 -0.44574,-2.4326 1.23686,-0.65625 0.43587,-1.91947 -2.31748,-2.07898 -0.11512,-2.14148 -1.83572,-4.12109 -0.109,-5.96277 1.32753,-2.48097 -0.2233,-3.41575 -1.76949,-3.08259 1.52642,-1.48221 -1.57061,-2.49954 0.45725,-1.65221 1.5774,-6.52637 2.48595,-2.03635 -0.64167,-2.36697 3.65797,-5.30253 2.83186,-1.35642 -0.22097,-1.67516 -0.28813,-1.6811 2.87606,-5.56767 2.34572,-1.23151 0.15163,-0.89301 37.34348,-3.88117 0.18486,6.28333 0.16166,16.65106 -0.8083,31.03885 -0.16166,14.06449 2.74824,18.75264 1.48437,13.39529 z",
                        "IA" : "m 569.19154,199.5843 0.26438,2.7862 2.22372,0.57726 0.95394,1.22533 0.50001,1.85536 3.79284,3.35865 0.68587,2.3915 -0.67434,3.42447 -1.58231,3.23198 -0.79934,2.74179 -2.17275,1.60204 -1.71551,0.5724 -5.57902,1.8602 -1.39146,3.84869 0.72864,1.37174 1.84051,1.68259 -0.28293,4.03629 -1.76315,1.53786 -0.77141,1.64314 0.12722,2.77632 -1.88631,0.45724 -1.62545,1.10491 -0.27879,1.35263 0.27879,2.11492 -1.55102,1.11607 -2.47053,-3.13328 -1.26257,-2.44987 -65.73582,2.51485 -0.91803,0.16544 -2.0524,-4.51596 -0.22862,-6.63007 -1.60036,-4.11521 -0.68586,-5.25831 -2.28623,-3.65797 -0.91448,-4.80107 -2.74348,-7.54455 -1.14311,-5.37264 -1.37174,-2.17191 -1.60036,-2.74346 1.95398,-4.84383 1.37174,-5.71557 -2.74347,-2.05761 -0.45725,-2.74347 0.9145,-2.51485 1.71467,0 82.654,-1.26948 0.83426,4.18312 2.25218,1.56097 0.25671,1.42309 -2.02954,3.38931 0.19041,3.20552 2.51486,3.7982 2.52679,1.29362 3.07928,0.50305 0.65834,0.83236 z",
                        "MN" : "m 475.23781,128.82439 -0.45725,-8.45904 -1.82898,-7.31592 -1.82898,-13.488725 -0.45725,-9.830778 -1.82898,-3.429343 -1.60036,-5.029695 0,-10.28802 0.68586,-3.886587 -1.82093,-5.451667 30.13242,0.03527 0.32332,-8.244684 0.64664,-0.161661 2.26325,0.484982 1.93992,0.808302 0.8083,5.496456 1.45495,6.143098 1.6166,1.616605 4.84982,0 0.32332,1.454944 6.30476,0.323321 0,2.101586 4.84981,0 0.32332,-1.293284 1.13162,-1.131623 2.26325,-0.646642 1.29328,0.969963 2.90989,0 3.87985,2.586567 5.3348,2.424907 2.42491,0.484982 0.48498,-0.969963 1.45494,-0.484982 0.48498,2.909889 2.58657,1.293284 0.48498,-0.484982 1.29329,0.161661 0,2.101586 2.58656,0.969963 3.07155,0 1.61661,-0.808303 3.23321,-3.233209 2.58656,-0.484981 0.80831,1.778265 0.48498,1.293283 0.96996,0 0.96996,-0.808302 8.89133,-0.323321 1.77826,3.071549 0.64665,0 0.71361,-1.084279 4.43991,-0.370665 -0.6121,2.279459 -3.93872,1.837125 -9.24578,4.061128 -4.77474,2.006897 -3.07155,2.586568 -2.42491,3.55653 -2.26324,3.879851 -1.77827,0.808304 -4.52649,5.01147 -1.29329,0.16166 -4.32778,2.75712 -2.46288,3.20511 -0.22862,3.19139 0.0944,8.04335 -1.37604,1.68875 -5.08154,3.75997 -2.23008,5.98241 2.87175,2.23371 0.67989,3.22698 -1.85524,3.23893 0.17079,3.74802 0.36886,6.7304 3.02825,3.00199 3.329,0 1.89111,3.1326 3.37917,0.50327 3.85916,5.67147 7.08729,4.11675 2.14315,2.87512 0.67115,6.43951 -81.2115,1.14479 -0.33792,-35.67685 -0.45724,-2.97209 -4.11521,-3.42934 -1.14312,-1.82898 0,-1.60037 2.0576,-1.60035 1.37174,-1.37174 0.22863,-3.20072 z",
                        "OK" : "m 380.34313,320.82146 -16.68418,-1.27331 -0.88022,10.95243 20.46538,1.15688 32.05555,1.3036 -2.3346,24.41865 -0.45725,17.83257 0.22863,1.60036 4.34383,3.65796 2.0576,1.14311 0.68587,-0.22862 0.68587,-2.05761 1.37174,1.82899 2.0576,0 0,-1.37174 2.74347,1.37174 -0.45724,3.88658 4.11521,0.22862 2.51484,1.14312 4.11521,0.68587 2.51485,1.82898 2.28623,-2.0576 3.42934,0.68586 2.51485,3.42934 0.91448,0 0,2.28623 2.28623,0.68586 2.28622,-2.28622 1.82899,0.68586 2.51484,0 0.9145,2.51486 6.30107,2.07897 1.37174,-0.68586 1.82898,-4.11521 1.14311,0 1.14312,2.0576 4.11521,0.68587 3.65795,1.37174 2.9721,0.91449 1.82899,-0.91449 0.68586,-2.51485 4.34383,0 2.0576,0.91449 2.74347,-2.05761 1.14312,0 0.68587,1.60036 4.1152,0 1.60036,-2.0576 1.82899,0.45724 2.0576,2.51486 3.20071,1.82897 3.20073,0.9145 1.94108,1.11893 -0.3891,-37.21701 -1.37175,-10.97398 -0.16046,-8.87234 -1.43989,-6.53773 -0.7782,-7.17964 -0.0681,-3.81622 -12.13684,0.31874 -46.41004,-0.45724 -45.03891,-2.05762 -24.2912,-1.37173 z",
                        "TX" : "m 361.46423,330.57358 22.69079,1.08594 31.09269,1.14312 -2.33461,23.4558 -0.29676,18.15352 0.0681,2.08179 4.34383,3.81843 1.98665,1.44716 1.18421,-0.55969 0.37337,-1.81772 1.14032,1.80362 2.11164,0.0439 -0.003,-1.44709 1.66994,0.96727 1.1387,0.40887 -0.35927,3.96765 4.08819,0.0935 2.92532,1.19717 3.95474,0.52538 2.38138,2.07898 2.1241,-2.07617 3.72494,0.61491 2.22091,3.22494 1.07496,0.32096 -0.16047,1.96527 2.21361,0.79229 2.33015,-2.0548 2.13302,0.61492 2.22938,0.0355 0.93307,2.43544 6.32809,2.11445 1.59305,-0.76693 1.48947,-4.17771 0.34072,0 0.90649,0.0816 1.22905,2.06863 3.92988,0.66528 3.337,1.12288 3.42563,1.19597 1.84058,-0.975 0.71376,-2.51484 4.45322,0.0442 1.80874,0.93078 2.79925,-2.10651 1.10364,0.0442 0.85104,1.60507 4.05472,0 1.51887,-2.02862 1.86737,0.40724 1.94603,2.40328 3.52057,2.04415 2.85876,0.80981 1.51362,0.79984 2.4467,1.99732 3.04304,-1.32779 2.69109,1.13888 0.56381,6.10594 -0.0398,9.70217 0.68586,9.53401 0.70218,3.60511 2.67533,4.41986 0.89818,4.95073 4.21595,5.53802 0.19602,3.14494 0.74637,0.78584 -0.73007,8.38007 -2.8721,5.0065 1.53297,2.15287 -0.63008,2.33808 -0.66957,7.40432 -1.50432,3.338 0.29488,3.50235 -5.66488,1.58518 -9.86129,4.5265 -0.96996,1.93992 -2.58657,1.93993 -2.10158,1.45494 -1.29329,0.8083 -5.65811,5.3348 -2.74823,2.10159 -5.3348,3.2332 -5.65811,2.42491 -6.30476,3.39487 -1.77826,1.45495 -5.81978,3.55653 -3.39487,0.64664 -3.87985,5.49645 -4.04151,0.32333 -0.96997,1.93992 2.26325,1.93993 -1.45495,5.49645 -1.29328,4.5265 -1.13162,3.87985 -0.8083,4.52649 0.8083,2.42491 1.77826,6.9514 0.96997,6.14309 1.77826,2.74823 -0.96996,1.45495 -3.07155,1.93992 -5.65812,-3.87985 -5.49645,-1.13162 -1.29329,0.48498 -3.23321,-0.64664 -4.20317,-3.07155 -5.17313,-1.13162 -7.59805,-3.39487 -2.10158,-3.87986 -1.29329,-6.46641 -3.2332,-1.93993 -0.64665,-2.26325 0.64665,-0.64664 0.32332,-3.39487 -1.29329,-0.64664 -0.64664,-0.96996 1.29328,-4.36484 -1.6166,-2.26324 -3.23321,-1.29329 -3.39487,-4.36483 -3.55653,-6.62808 -4.20317,-2.58657 0.16166,-1.93992 -5.3348,-12.2862 -0.8083,-4.20317 -1.77826,-1.93992 -0.16166,-1.45495 -5.98144,-5.33479 -2.58657,-3.07155 0,-1.13163 -2.58657,-2.10158 -6.78974,-1.13163 -7.43638,-0.64664 -3.07155,-2.26324 -4.52649,1.77826 -3.55653,1.45495 -2.26325,3.2332 -0.96996,3.7182 -4.36483,6.14309 -2.42491,2.42491 -2.58657,-0.96996 -1.77826,-1.13163 -1.93993,-0.64664 -3.87985,-2.26324 0,-0.64665 -1.77826,-1.93992 -5.17314,-2.10159 -7.43638,-7.7597 -2.26325,-4.68815 0,-8.08303 -3.23321,-6.46642 -0.48498,-2.74822 -1.6166,-0.96997 -1.13163,-2.10158 -5.01147,-2.10159 -1.29328,-1.6166 -7.11307,-7.92137 -1.29328,-3.23321 -4.68816,-2.26325 -1.45495,-4.36487 -2.58659,-2.90987 -1.93991,-0.48496 -0.64923,-4.67764 8.00187,0.68589 29.03499,2.74345 29.03508,1.60036 2.23353,-19.46182 3.88655,-55.55502 1.60039,-18.74732 1.37174,0.0286 m 99.02935,229.66274 -0.56581,-7.11308 -2.74824,-7.19392 -0.56582,-7.03225 1.53578,-8.24471 3.31406,-6.87059 3.4757,-5.41565 3.1524,-3.55655 0.64664,0.2425 -4.769,6.6281 -4.36484,6.54728 -2.02077,6.62809 -0.32332,5.17316 0.88913,6.14312 2.58658,7.19392 0.48498,5.17314 0.16166,1.45496 -0.88913,0.24248 z",
                        "NM" : "m 288.15255,424.01315 -0.77541,-4.7481 8.64378,0.5254 30.17176,2.9459 27.26816,1.68989 2.21527,-18.70747 3.85736,-55.87597 1.73768,-19.38923 1.5717,0.12856 0.8254,-11.16339 -104.00445,-10.63595 -17.49735,120.43481 15.46067,1.98915 1.29328,-10.02295 29.23215,2.82935 z",
                        "KS" : "m 507.88059,324.38028 -12.61826,0.20443 -46.08909,-0.45723 -44.55748,-2.05763 -24.62974,-1.25741 3.89379,-64.59497 22.08346,0.67517 40.28913,0.8414 44.30124,0.98758 5.09563,0 2.1844,2.1624 2.01766,-0.0214 1.6403,1.01247 -0.0625,3.00923 -1.82898,1.72537 -0.33225,2.23217 1.84308,3.40233 2.95236,3.19506 2.32735,1.61446 1.30077,11.24082 0.18913,36.08573 z",
                        "NE" : "m 486.09787,240.70058 3.23061,7.01991 -0.12863,2.30252 3.45922,5.49388 2.71929,3.15234 -5.04948,0 -43.48256,-0.93868 -40.78686,-0.8903 -22.25222,-0.78387 1.07277,-21.32785 -32.31824,-2.92025 4.34383,-44.00986 15.54633,1.02881 20.11879,1.1431 17.83257,1.14312 23.77676,1.14311 10.74526,-0.45724 2.0576,2.28622 4.80108,2.9721 1.14311,0.91449 4.34383,-1.37174 3.88659,-0.45724 2.74347,-0.22863 1.82898,1.37174 4.05743,1.60036 2.97209,1.60036 0.45725,1.60036 0.91449,2.0576 1.82898,0 0.79798,0.0462 0.89423,4.68182 2.92026,8.46792 0.57253,3.75671 2.52349,3.77425 0.56959,5.11414 1.60724,4.24037 0.25234,6.47426 z",
                        "SD" : "m 476.44687,204.02465 -0.0474,-0.58087 -2.89571,-4.84544 1.86023,-4.71211 1.49273,-5.88654 -2.78187,-2.07971 -0.38516,-2.74346 0.7924,-2.55435 3.18851,0.0152 -0.12308,-5.00614 -0.3333,-30.17425 -0.61773,-3.76758 -4.07232,-3.33093 -0.98263,-1.67696 -0.0625,-1.60882 2.02212,-1.5294 1.53222,-1.66567 0.24496,-2.65679 -58.25709,-1.60035 -54.79921,-3.44909 -5.32527,63.69119 14.59027,0.9038 19.94985,1.20561 17.74305,0.92859 23.77676,1.30358 11.9827,-0.42464 1.9663,2.24518 5.19464,3.25335 0.76389,0.72275 4.54144,-1.45281 6.54054,-0.61491 1.6753,1.33627 4.20451,1.59613 2.94506,1.63583 0.39898,1.48381 1.03949,2.24088 2.23737,-0.20136 z",
                        "ND" : "m 475.30528,128.91846 -0.61491,-8.43367 -1.67695,-6.81592 -1.89149,-13.02422 -0.45724,-10.987026 -1.73946,-3.077142 -1.75661,-5.194396 0.0312,-10.44427 0.62336,-3.824087 -1.8341,-5.467761 -28.64225,-0.564027 -18.59095,-0.646642 -26.51232,-1.293284 -22.94634,-2.133869 -6.99324,67.176834 54.93224,3.34365 58.06901,1.38583 z",
                        "WY" : "m 360.37668,143.27587 -106.7426,-13.45706 -14.08348,88.45803 113.26461,13.58549 7.56147,-88.58646 z",
                        "MT" : "M 369.20952,56.969133 338.5352,54.1613 l -29.26055,-3.55653 -29.26054,-4.041512 -32.3321,-5.334795 -18.42929,-3.39487 -32.72365,-6.932736 -4.47902,21.347532 3.42934,7.544541 -1.37174,4.572452 1.82898,4.572451 3.20073,1.371739 4.62082,10.769453 2.6951,3.176523 0.45724,1.143118 3.42934,1.143118 0.45725,2.057593 -7.0873,17.603953 0,2.51485 2.51485,3.20071 0.91448,0 4.80107,-2.97209 0.68588,-1.14312 1.60036,0.68587 -0.22863,5.25832 2.74348,12.57425 2.97209,2.51484 0.91448,0.68587 1.82899,2.28622 -0.45725,3.42935 0.68587,3.42933 1.14312,0.9145 2.28622,-2.28623 2.74347,0 3.20072,1.60036 2.51485,-0.91449 4.11521,0 3.65795,1.60036 2.74348,-0.45725 0.45724,-2.9721 2.97209,-0.68586 1.37174,1.37174 0.45725,3.20071 1.42587,0.83464 1.88695,-11.03474 106.74567,13.42892 8.80221,-86.299157 z",
                        "CO" : "m 380.03242,320.96457 4.90324,-86.32496 -113.38856,-12.64396 -12.21382,87.93916 120.69914,11.02976 z",
                        "ID" : "m 148.47881,176.48395 8.77087,-35.22072 1.37174,-4.22952 2.51484,-5.94418 -1.25742,-2.28623 -2.51486,0.11431 -0.80017,-1.0288 0.45725,-1.14311 0.34292,-3.08641 4.45815,-5.48695 1.82898,-0.45724 1.14311,-1.14311 0.57156,-3.20072 0.91448,-0.68586 3.88659,-5.82988 3.88659,-4.34383 0.22862,-3.772268 -3.42934,-2.629163 -1.53555,-4.400983 13.62491,-63.341691 13.51759,2.528111 -4.40808,21.383013 3.56035,7.485352 -1.58111,4.66084 1.96985,4.641233 3.13822,1.255191 3.83534,9.556588 3.51269,4.437154 0.50725,1.143118 3.34095,1.143118 0.36885,2.097075 -6.97101,17.376092 -0.16518,2.56593 2.63112,3.3217 0.90508,-0.0489 4.91129,-3.0256 0.67742,-1.09497 1.56231,0.65886 -0.27844,5.35372 2.73925,12.58271 3.91783,3.17791 1.68118,2.16545 -0.71661,4.08386 1.06622,2.80741 1.06163,1.09128 2.47929,-2.35142 2.84816,0.0489 2.91925,1.3352 2.78002,-0.68193 3.79426,-0.16048 3.9789,1.60036 2.74348,-0.29676 0.49674,-3.03731 2.93259,-0.76483 1.26017,1.51591 0.44093,2.94496 1.42434,1.21321 -8.386,53.60866 c 0,0 -87.96599,-16.70061 -94.95939,-18.20435 z",
                        "UT" : "m 259.49836,310.10509 -83.74903,-11.87225 20.58761,-112.54135 46.78031,8.74514 -1.4848,10.63042 -2.31162,13.17266 7.80769,0.92837 16.40652,1.80479 8.21097,0.85564 -12.24765,88.27658 z",
                        "AZ" : "m 144.9112,382.62909 -2.62701,2.15833 -0.32332,1.45495 0.48498,0.96996 18.91427,10.66959 12.12454,7.59804 14.7111,8.56801 16.81269,10.02295 12.2862,2.42491 24.95116,2.70491 17.25561,-119.12707 -83.73563,-11.91725 -3.09239,16.41246 -1.60629,0.0153 -1.71467,2.62916 -2.51485,-0.11432 -1.25742,-2.74347 -2.74347,-0.34293 -0.9145,-1.14311 -0.91448,0 -0.9145,0.57156 -1.94329,1.0288 -0.1143,6.97298 -0.22864,1.71467 -0.57154,12.57424 -1.48605,2.17191 -0.57156,3.31503 2.74347,4.91539 1.25742,5.82988 0.80019,1.0288 1.0288,0.57156 -0.11432,2.28622 -1.60035,1.37173 -3.42934,1.71467 -1.94329,1.9433 -1.48605,3.65795 -0.57156,4.91539 -2.85778,2.74347 -2.0576,0.68587 0.13569,0.82988 -0.45725,1.71467 0.45725,0.80018 3.65796,0.57154 -0.57156,2.74348 -1.48605,2.17191 -3.77227,0.91449 z",
                        "NV" : "m 196.39273,185.57552 -23.63891,128.82275 -1.83224,0.34915 -1.57276,2.40618 -2.37294,0.0107 -1.47195,-2.74347 -2.61847,-0.37842 -0.77092,-1.10763 -1.03783,-0.054 -2.77837,1.64429 -0.31026,6.78548 -0.36209,5.77717 -0.34857,8.59281 -1.4471,2.08916 -2.43892,-1.07403 -69.079886,-104.20119 18.989116,-67.58491 93.0921,20.66601 z",
                        "OR" : "m 148.72184,175.53153 8.8497,-34.80151 1.05079,-4.22952 2.35437,-5.62323 -0.61551,-1.16288 -2.51486,-0.0462 -1.2816,-1.6707 0.45724,-1.46407 0.50341,-3.24688 4.45815,-5.48695 1.82898,-1.09915 1.14311,-1.14311 1.48604,-3.56563 4.04706,-5.6694 3.56563,-3.8624 0.22862,-3.451314 -3.26886,-2.468682 -1.78341,-4.642625 -12.66377,-3.61197 -15.08909,-3.54365 -15.43202,0.114306 -0.45724,-1.371729 -5.48695,2.057604 -4.45814,-0.571559 -2.40054,-1.600361 -1.25742,0.685875 -4.68676,-0.228632 -1.71467,-1.371729 -5.25832,-2.057604 -0.800182,0.114316 -4.34383,-1.486056 -1.943291,1.828983 -6.172812,-0.342927 -5.944183,-4.115209 0.685865,-0.80018 0.228621,-7.773173 -2.286225,-3.886577 -4.115208,-0.571559 -0.685865,-2.514847 -2.353932,-0.466565 -5.798525,2.058784 -2.263247,6.466418 -3.233209,10.022949 -3.23321,6.466419 -5.011474,14.064461 -6.466419,13.579473 -8.083023,12.60952 -1.939926,2.90989 -0.808302,8.568 0.386095,12.08023 112.578342,26.32133 z",
                        "WA" : "m 102.07324,7.6117734 4.36483,1.4549443 9.69963,2.7482283 8.568,1.939925 20.0459,5.658117 22.95579,5.658116 15.22312,3.207173 -13.63236,63.585811 -12.445,-3.525318 -15.50801,-3.570679 -15.22929,0.03324 -0.45557,-1.344699 -5.59922,2.179293 -4.59543,-0.736744 -2.14697,-1.584054 -1.31321,0.657976 -4.73566,-0.140243 -1.69836,-1.349633 -5.26304,-2.112303 -0.734971,0.146918 -4.389122,-1.524448 -1.893298,1.817379 -6.265906,-0.298733 -5.925698,-4.125702 0.778957,-0.932763 0.121223,-7.677452 -2.281999,-3.839701 -4.115208,-0.60704 -0.67741,-2.510616 -2.275512,-0.456932 -3.554948,1.230576 -2.263247,-3.219247 0.323321,-2.909889 2.748228,-0.323321 1.616605,-4.041511 -2.586568,-1.131624 0.161661,-3.718191 4.364833,-0.646641 -2.748228,-2.748228 -1.454945,-7.113061 0.646642,-2.909888 0,-7.921363 -1.778265,-3.23321 2.263247,-9.376307 2.101586,0.484981 2.424907,2.909889 2.748228,2.586567 3.233209,1.939926 4.526493,2.101586 3.071551,0.646642 2.909889,1.454944 3.394873,0.969963 2.263246,-0.16166 0,-2.424908 1.293284,-1.131623 2.101582,-1.293284 0.32333,1.131624 0.32332,1.778265 -2.263251,0.484981 -0.323321,2.101586 1.778262,1.454945 1.13163,2.424907 0.64664,1.939925 1.45494,-0.16166 0.16166,-1.293284 -0.96996,-1.293284 -0.48498,-3.233209 0.8083,-1.778265 -0.64664,-1.454944 0,-2.263247 1.77827,-3.55653 -1.13163,-2.586568 -2.42491,-4.8498139 0.32333,-0.8083023 1.13162,-0.8083024 z m -9.456692,5.9789646 2.020764,-0.16166 0.484982,1.374119 1.535779,-1.616615 2.344082,0 0.808303,1.535779 -1.53578,1.69744 0.646652,0.808313 -0.727477,2.020761 -1.374119,0.404146 c 0,0 -0.889138,0.08084 -0.889138,-0.242485 0,-0.323321 1.454955,-2.586578 1.454955,-2.586578 l -1.69744,-0.565817 -0.323321,1.454954 -0.727478,0.646642 -1.535782,-2.263257 -0.484982,-2.505742 z",
                        "CA" : "m 144.69443,382.19813 3.94008,-0.48862 1.48604,-2.01144 0.54454,-2.94109 -3.55152,-0.59012 -0.51417,-0.66822 0.4775,-2.03231 -0.15928,-0.58967 1.92257,-0.61959 3.04278,-2.83268 0.58156,-4.9951 1.3799,-3.40211 1.94329,-2.16626 3.51887,-1.58967 1.65439,-1.60483 0.0687,-2.10884 -0.99333,-0.58001 -1.02315,-1.07273 -1.15522,-5.84845 -2.6852,-4.83009 0.56581,-3.505 -2.41958,-1.02931 -69.061322,-104.1784 18.902112,-67.60149 -67.079863,-15.69796 -1.506896,4.73324 -0.161661,7.43638 -5.173135,11.80121 -3.071548,2.58657 -0.323321,1.13162 -1.778266,0.80831 -1.454944,4.20317 -0.808302,3.23321 2.748228,4.20317 1.616605,4.20317 1.131623,3.55653 -0.323321,6.46642 -1.778265,3.07155 -0.646642,5.81978 -0.969963,3.71819 1.778265,3.87985 2.748228,4.52649 2.263247,4.84982 1.293283,4.04151 -0.32332,3.23321 -0.323321,0.48498 0,2.10158 5.658116,6.30476 -0.484981,2.42491 -0.646642,2.26325 -0.646642,1.93992 0.16166,8.24469 2.101586,3.71819 1.939926,2.58656 2.748228,0.48499 0.969963,2.74822 -1.131623,3.55653 -2.101587,1.61661 -1.131623,0 -0.808302,3.87985 0.484981,2.90989 3.23321,4.36483 1.616604,5.3348 1.454944,4.68815 1.293284,3.07155 3.39487,5.81978 1.454944,2.58656 0.484982,2.90989 1.616604,0.96996 0,2.42491 -0.808302,1.93993 -1.778265,7.11306 -0.484982,1.93992 2.424908,2.74823 4.203172,0.48498 4.526493,1.77827 3.879851,2.10158 2.909889,0 2.909888,3.07155 2.586567,4.84982 1.131624,2.26324 3.879851,2.10159 4.849814,0.8083 1.454944,2.10159 0.646642,3.23321 -1.454944,0.64664 0.323321,0.96996 3.233211,0.8083 2.748228,0.16167 3.159889,-1.68685 3.879854,4.20317 0.808302,2.26325 2.586572,4.20317 0.32332,3.23321 0,9.37631 0.48498,1.77826 10.02295,1.45495 19.72257,2.74822 13.84504,1.3497 z m -88.135212,-43.71668 1.293288,1.53578 -0.16166,1.29329 -3.233221,-0.0808 -0.565814,-1.21246 -0.646644,-1.45495 3.314051,-0.0808 z m 1.939932,0 1.212458,-0.64664 3.556543,2.10159 3.07156,1.21245 -0.889136,0.64666 -4.526509,-0.2425 -1.61661,-1.61661 -0.808306,-1.45495 z m 20.692614,19.80348 1.778265,2.34408 0.808313,0.96997 1.535779,0.56581 0.565807,-1.45495 -0.969963,-1.77827 -2.667403,-2.02076 -1.050798,0.16166 0,1.21246 z m -1.454955,8.64886 1.778276,3.15239 1.212458,1.93994 -1.454954,0.24248 -1.293284,-1.21245 c 0,0 -0.727477,-1.45495 -0.727477,-1.85911 0,-0.40414 0,-2.18242 0,-2.18242 l 0.484981,-0.0808 z"
                    }
                }
            }
        }
    );

    return Mapael;

}));
}.call(window));

/***/ }),

/***/ 1817:
/***/ (function(module, exports, __webpack_require__) {


    var content = __webpack_require__(1671);
    var insertCss = __webpack_require__(40);

    if (typeof content === 'string') {
      content = [[module.i, content, '']];
    }

    module.exports = content.locals || {};
    module.exports._getContent = function() { return content; };
    module.exports._getCss = function() { return content.toString(); };
    module.exports._insertCss = function(options) { return insertCss(content, options) };
    
    // Hot Module Replacement
    // https://webpack.github.io/docs/hot-module-replacement
    // Only activated in browser context
    if (false) {
      var removeCss = function() {};
      module.hot.accept("!!../../../../../node_modules/css-loader/index.js?sourceMap&modules&localIdentName=!../../../../../node_modules/sass-loader/lib/loader.js!./MapaelMap.scss", function() {
        content = require("!!../../../../../node_modules/css-loader/index.js?sourceMap&modules&localIdentName=!../../../../../node_modules/sass-loader/lib/loader.js!./MapaelMap.scss");

        if (typeof content === 'string') {
          content = [[module.id, content, '']];
        }

        removeCss = insertCss(content, { replace: true });
      });
      module.hot.dispose(function() { removeCss(); });
    }
  

/***/ }),

/***/ 842:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_react___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_react__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__ = __webpack_require__(47);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_jquery__ = __webpack_require__(72);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_imports_loader_jquery_this_window_jquery_mapael_js_maps_usa_states__ = __webpack_require__(1788);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_imports_loader_jquery_this_window_jquery_mapael_js_maps_usa_states___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_imports_loader_jquery_this_window_jquery_mapael_js_maps_usa_states__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_imports_loader_jquery_this_window_jquery_mapael_js_jquery_mapael__ = __webpack_require__(1375);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_imports_loader_jquery_this_window_jquery_mapael_js_jquery_mapael___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_imports_loader_jquery_this_window_jquery_mapael_js_jquery_mapael__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__animate_number_AnimateNumber__ = __webpack_require__(314);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__MapaelMap_scss__ = __webpack_require__(1817);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__MapaelMap_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6__MapaelMap_scss__);
var _jsxFileName = 'D:\\FREELANCES\\Tesis Jean Claude Esquerra\\Code\\src\\pages\\dashboard\\components\\mapael-map\\MapaelMap.js';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }




/* eslint-disable */



/* eslint-enable */




var MapaelMap = function (_React$Component) {
  _inherits(MapaelMap, _React$Component);

  function MapaelMap() {
    _classCallCheck(this, MapaelMap);

    return _possibleConstructorReturn(this, (MapaelMap.__proto__ || Object.getPrototypeOf(MapaelMap)).apply(this, arguments));
  }

  _createClass(MapaelMap, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var state = '';
      var geoLocationData = {
        map: {
          name: 'usa_states',
          defaultArea: {
            attrs: {
              fill: '#e5e7f1',
              stroke: '#fafbff'
            },
            attrsHover: {
              fill: '#e9ebf6',
              animDuration: 50
            },
            tooltip: {
              content: function content() {
                return '<strong>' + state + '</strong>';
              }
            },
            eventHandlers: {
              mouseover: function mouseover(e, id) {
                state = id;
              }
            }
          },
          defaultPlot: {
            size: 17,
            attrs: {
              fill: '#ffc247',
              stroke: '#fff',
              'stroke-width': 0,
              'stroke-linejoin': 'round'
            },
            attrsHover: {
              'stroke-width': 1,
              animDuration: 100
            }
          },
          zoom: {
            enabled: true,
            step: 0.75,
            mousewheel: false
          }
        },
        plots: {
          ny: {
            latitude: 40.717079,
            longitude: -74.00116,
            tooltip: { content: 'New York' }
          },
          on: {
            latitude: 33.145235,
            longitude: -83.811834,
            size: 18,
            tooltip: { content: 'Oconee National Forest' }
          },
          sf: {
            latitude: 37.792032,
            longitude: -122.394613,
            size: 12,
            tooltip: { content: 'San Francisco' }
          },
          la: {
            latitude: 26.935080,
            longitude: -80.851766,
            size: 26,
            tooltip: { content: 'Lake Okeechobee' }
          },
          gc: {
            latitude: 36.331308,
            longitude: -83.336050,
            size: 10,
            tooltip: { content: 'Grainger County' }
          },
          cc: {
            latitude: 36.269356,
            longitude: -76.587477,
            size: 22,
            tooltip: { content: 'Chowan County' }
          },
          ll: {
            latitude: 30.700644,
            longitude: -95.145249,
            tooltip: { content: 'Lake Livingston' }
          },
          tc: {
            latitude: 34.546708,
            longitude: -90.211471,
            size: 14,
            tooltip: { content: 'Tunica County' }
          },
          lc: {
            latitude: 32.628599,
            longitude: -103.675115,
            tooltip: { content: 'Lea County' }
          },
          uc: {
            latitude: 40.456692,
            longitude: -83.522688,
            size: 11,
            tooltip: { content: 'Union County' }
          },
          lm: {
            latitude: 33.844630,
            longitude: -118.157483,
            tooltip: { content: 'Lakewood Mutual' }
          }
        }
      };
      __WEBPACK_IMPORTED_MODULE_2_jquery___default()('#mapael').mapael(geoLocationData);
    }
  }, {
    key: 'render',
    value: function render() {
      return __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
        'div',
        { className: 'mapael ' + __WEBPACK_IMPORTED_MODULE_6__MapaelMap_scss___default.a.mapael, id: 'mapael', __source: {
            fileName: _jsxFileName,
            lineNumber: 127
          },
          __self: this
        },
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'div',
          { className: 'stats', __source: {
              fileName: _jsxFileName,
              lineNumber: 128
            },
            __self: this
          },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'h6',
            { className: 'mt-1', __source: {
                fileName: _jsxFileName,
                lineNumber: 129
              },
              __self: this
            },
            'GEO-LOCATIONS'
          ),
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'p',
            { className: 'h3 m-0', __source: {
                fileName: _jsxFileName,
                lineNumber: 130
              },
              __self: this
            },
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
              'span',
              { className: 'mr-xs fw-normal', __source: {
                  fileName: _jsxFileName,
                  lineNumber: 131
                },
                __self: this
              },
              __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
                __WEBPACK_IMPORTED_MODULE_5__animate_number_AnimateNumber__["a" /* default */],
                {
                  __source: {
                    fileName: _jsxFileName,
                    lineNumber: 131
                  },
                  __self: this
                },
                '1 656 843'
              )
            ),
            __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement('i', { className: 'fa fa-map-marker', __source: {
                fileName: _jsxFileName,
                lineNumber: 132
              },
              __self: this
            })
          )
        ),
        __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
          'div',
          { className: 'map', __source: {
              fileName: _jsxFileName,
              lineNumber: 135
            },
            __self: this
          },
          __WEBPACK_IMPORTED_MODULE_0_react___default.a.createElement(
            'span',
            {
              __source: {
                fileName: _jsxFileName,
                lineNumber: 136
              },
              __self: this
            },
            'Alternative content for the map'
          )
        )
      );
    }
  }]);

  return MapaelMap;
}(__WEBPACK_IMPORTED_MODULE_0_react___default.a.Component);

/* harmony default export */ __webpack_exports__["default"] = (__WEBPACK_IMPORTED_MODULE_1_isomorphic_style_loader_lib_withStyles___default()(__WEBPACK_IMPORTED_MODULE_6__MapaelMap_scss___default.a)(MapaelMap));

/***/ })

});
//# sourceMappingURL=19.chunk.js.map