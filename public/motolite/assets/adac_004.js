$j(document).ready(function(){var boxAutoLink=$j(".Box-AutoLink");boxAutoLink!=undefined&&boxAutoLink.length>0&&$j(boxAutoLink).autolink({pointerStyle:"pointer",link:"a",parentLevel:"0",event:"click"}),ADAC.Mobile.init()}),ADAC.Mobile={init:function(){var useragent=navigator.userAgent;useragent=useragent.toLowerCase();var display="desktop",isavmpage=$j("body").hasClass("avm"),jqueryverstext=$j().jquery,jqueryversarray=jqueryverstext.split("."),jqueryhasclick=!1;jqueryversarray.length<2||jqueryversarray[0]<1||jqueryversarray[1]<9||(jqueryhasclick=!0),ADAC.reload=!1,ADAC.firstLoad=!0,useragent.indexOf("iphone")!=-1||useragent.indexOf("symbianos")!=-1||useragent.indexOf("ipad")!=-1||useragent.indexOf("ipod")!=-1||useragent.indexOf("android")!=-1||useragent.indexOf("blackberry")!=-1||useragent.indexOf("samsung")!=-1||useragent.indexOf("nokia")!=-1||useragent.indexOf("windows ce")!=-1||useragent.indexOf("sonyericsson")!=-1||useragent.indexOf("webos")!=-1||useragent.indexOf("wap")!=-1||useragent.indexOf("motor")!=-1||useragent.indexOf("symbian")!=-1?($j("body").addClass("page-mobile"),display="mobile"):$j("body").addClass("page-desktop"),isavmpage?display=="mobile"&&screen.availWidth<768&&($j("#viewport").remove(),$j("head").append('<meta id="viewport" name="viewport" content="width=450, minimum-scale=0.71, maximum-scale=0.71" />')):screen.availWidth<769&&screen.availHeight<800?($j("#viewport").remove(),$j("body").hasClass("ves")?$j("head").append('<meta name="viewport" content="width=550, maximum-scale=1" />'):$j("head").append('<meta name="viewport" content="width=450" />'),$j("body").addClass("page-smart-phone")):display=="mobile"&&(ADAC.reload=!0,(window.orientation==-90||window.orientation==90)&&($j("#viewport").remove(),$j("head").append('<meta id="viewport" name="viewport" content="width=700, initial-scale=1.3, maximum-scale=1.3" />'))),$j(document).width()<1200&&$j(".banner-skyscraper").addClass("static"),this.orientationChange(window.orientation);if(isavmpage&&jqueryhasclick)$j("body, #header, #main, #footer").on("click",function(e){var container=$j("#infolayer-container-box");container.is(e.target)||container.has(e.target).length!==0||$j("#infolayer-container-box").hide()})},orientationChange:function(mod){mod==0||mod==180?($j("body").addClass("page-portrait"),$j("body").removeClass("page-landscape")):(mod==-90||mod==90)&&($j("body").addClass("page-landscape"),$j("body").removeClass("page-portrait")),ADAC.reload==!0&&ADAC.firstLoad==!1&&location.reload(),ADAC.firstLoad=!1}},window.addEventListener&&window.addEventListener("orientationchange",function(){ADAC.Mobile.orientationChange(window.orientation)},!1);