
let main = { theme: 'lite', version: '0.804', timePrev: performance.now(), searchScript: 'no', searchStatus: 'no', searchData: '', name: '', stamp: '', loginQ: false, iframes: [], dom: 'mathsisfun', server: 'www.mathbro.com', port: '3003' }

if (location.hostname === 'localhost') main.port = '3004'


let menuVis = false
let searchVis = false
let userLang = window.navigator.userLanguage || window.navigator.language

main.decSep = (1.5).toLocaleString().charAt(1)
main.thouSep = String.fromCharCode(90 - main.decSep.charCodeAt(0))
if (main.decSep == ',') {
	main.decType = 'c'
} else {
	main.decType = ''
}

function pathAbsolute(base, relative) {
	let stack = base.split('/'),
		parts = relative.split('/')
	stack.pop() // remove current file name (or empty string)
	for (let i = 0; i < parts.length; i++) {
		if (parts[i] == '.') continue
		if (parts[i] == '..') stack.pop()
		else stack.push(parts[i])
	}
	return stack.join('/')
}

function decfmt() {
	if (main.decSep == ',') {
		fixSpells(document.body, 'd')
		let imgs = document.body.getElementsByTagName('img')
		for (let i = 0; i < imgs.length; i++) {
			if (imgs[i].getAttribute('hasdec') != null && imgs[i].getAttribute('hasdec') != '') {
				imgs[i].src = imgs[i].src.replace(/\.(gif|jpg|png)/g, 'c.$1')
			}
		}
	}
}

function doSpell() {
	if (typeof reSpell == 'undefined') return
	let userLang = window.navigator.userLanguage || window.navigator.language

	switch (userLang.toLowerCase()) {
		case 'en-us':
			break
		case 'en-au':
		case 'en-ca':
		case 'en-gb':
		case 'en-ie':
		case 'en-nz':
		case 'en-za':
			fixSpells(document.body, 's')
			break
		default:
	}
}

function fixSpells(elem, tp) {
	// check if parameter is a an ELEMENT_NODE
	if (!(elem instanceof Node) || elem.nodeType !== Node.ELEMENT_NODE) return
	let children = elem.childNodes
	for (let i = 0; children[i]; ++i) {
		let node = children[i]
		switch (node.nodeType) {
			case Node.ELEMENT_NODE: // call recursively
				fixSpells(node, tp)
				break
			case Node.TEXT_NODE: // fix spelling
				if (tp == 's') fixSpell(node)
				if (tp == 'd') fixDec(node)
				break
		}
	}
}

function fixSpell(node) {
	let s = node.nodeValue
	if (s.length < 4) return 
	if (!s.match(/(?=.*[a-zA-Z])/)) return 
	//s = "(" + s + ")"
	let sStt = s
	for (let j = 0; j < reSpell.length; j++) {
		let s0 = reSpell[j][0]
		let s1 = reSpell[j][1]
		s = s.replace(new RegExp('\\b' + s0 + '\\b', 'g'), s1)
		s = s.replace(new RegExp('\\b' + proper(s0) + '\\b', 'g'), proper(s1))
	}
	if (s != sStt) node.nodeValue = s 
}

function fixDec(node) {
	let s = node.nodeValue
	let sStt = s
	s = s
		.replace(/(\d),(\d\d)/g, '$1#$2')
		.replace(/(\d)\.(\d)/g, '$1,$2')
		.replace(/(\d)#(\d)/g, '$1.$2')
	if (s != sStt) {
		node.nodeValue = s 
	}
}

function doLocal() {
	decfmt()
	doSpell()
	relatedLinks()
}

function proper(s) {
	return s.charAt(0).toUpperCase() + s.substring(1, s.length).toLowerCase()
}

function tellAFriend() {
	let msg = "\nI found '" + document.title + "' here: " + location.href + '\n'
	window.location = 'mailto:?subject=' + encodeURIComponent(document.title) + '&body=' + encodeURIComponent(msg)
}

function addFavorites() {
	if (window.sidebar) {
		// Mozilla Firefox Bookmark
		window.sidebar.addPanel(document.title, location.href, '')
	} else if (window.external) {
		// IE Favorite
		window.external.AddFavorite(location.href, document.title)
	}
}

function openEnglish() {
	if (typeof tranfrom == 'undefined') tranfrom = 'index.htm'
	let path = tranfrom // only relative path to avoid spoofing
	let url = 'https://www.mathsisfun.com/' + path
	window.location = url
}

function linkToUs() {
	let dom = location.hostname
	if (dom == 'localhost') dom = `localhost/${main.dom}`
	let pgURL = dom + '/link-to-us.html'
	pgURL += '?path=' + toHex(location.pathname + location.search)
	pgURL += '&title=' + toHex(document.title)
	console.log('dom', dom, pgURL)

	window.location = 'https://' + pgURL
}

function donate() {
	let pg = location.pathname
	let pgHex = toHex(pg)
	logSend(pgHex, 'donate', window.location.hostname)

	let dom = location.hostname
	if (dom == 'localhost') dom = `localhost/${main.dom}`
	let pgURL = dom + '/donate.html'

	window.location = 'https://' + pgURL
}

function citation() {
	let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	let path = location.pathname + location.search // only relative path to avoid spoofing
	let atitle = document.title
	let md = new Date(document.lastModified)
	let mDate = md.getDate() + ' ' + months[md.getMonth()] + ' ' + md.getFullYear()
	let author = typeof Author == 'undefined' ? 'Pierce, Rod' : Author

	let data = { path: path, title: atitle, moddate: mDate, author: author }
	localStorage.setItem('citation', JSON.stringify(data))

	let urlStt = urlSttGet()
	let to = urlStt + 'citation.html'
	console.log('citation', data, to)
	window.open(to)
}

function postWith(to, p) {
	let myForm = document.createElement('form')
	myForm.method = 'post'
	myForm.action = to
	for (let k in p) {
		let myInput = document.createElement('input')
		myInput.setAttribute('name', k)
		myInput.setAttribute('value', p[k])
		myForm.appendChild(myInput)
	}
	document.body.appendChild(myForm)
	myForm.submit()
	document.body.removeChild(myForm)
}

function URLEncode(text) {
	let SAFECHARS = '0123456789' + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + "-_.!~*'()" // numeric,alpha, and RFC2396 Mark characters
	let HEX = '0123456789ABCDEF'

	let s = ''
	for (let i = 0; i < text.length; i++) {
		let ch = text.charAt(i)
		if (ch == ' ') {
			s += '+' // x-www-urlencoded, rather than %20
		} else if (SAFECHARS.indexOf(ch) != -1) {
			s += ch
		} else {
			let charCode = ch.charCodeAt(0)
			if (charCode > 255) {
				s += '+'
			} else {
				s += '%'
				s += HEX.charAt((charCode >> 4) & 0xf)
				s += HEX.charAt(charCode & 0xf)
			}
		}
	}

	return s
}

function copyToClipboard(txtArea) {
	txtArea.focus()
	txtArea.select()
	let copiedTxt = document.selection.createRange()
	copiedTxt.execCommand('Copy')
}

function toHex(s) {
	let hex = ''
	for (let i = 0; i < s.length; i++) {
		let cc = s.charCodeAt(i).toString(16)
		if (cc.length < 2) cc = '0' + cc
		hex += '' + cc
	}
	return hex
}


function adOffQ() {
	let item = localStorage.getItem('adoff')
	if (item === null) return false

	let object = JSON.parse(item)
	let dateString = object.when
	let until = new Date(dateString)
	until.setTime(until.getTime() + 8 * 24 * 60 * 60 * 1000) // plus 8 days

	let now = new Date()

	return until > now
}

function adOffSet() {
	let object = { value: false, when: new Date() }
	localStorage.setItem('adoff', JSON.stringify(object))
	location.reload() // reload page so "no ads" takes effect
}

function adOffReset() {
	let object = { value: false, when: 0 }
	localStorage.setItem('adoff', JSON.stringify(object))
	location.reload() // reload page so it takes effect
}

let adIDs = [
	{ id: 'adTop', withAdsQ: true },
	{ id: 'adend', withAdsQ: true },
	{ id: 'adsHide1', withAdsQ: true },
	{ id: 'adsShow1', withAdsQ: false },
]

function adsSet(onQ) {
	for (let i = 0; i < adIDs.length; i++) {
		let ad = adIDs[i]
		let div = document.getElementById(ad.id)
		if (div) {
			let showQ = ad.withAdsQ
			if (!onQ) showQ = !showQ
			if (showQ) {
				div.style.display = 'inline'
			} else {
				div.style.display = 'none'
			}
		}
	}
}

function adsHideHTML() {
	let s = ''
	s += '<div id="adsShow1"><a href="javascript:adsShow()">Show Ads</a></div>'
	s += '<div id="adsHide1"><a href="javascript:adsHide()">Hide Ads</a> | '

	let imgHome = location.hostname == 'localhost' ? `/${main.dom}/` : '/'
	s += '<a href="' + imgHome + 'about-ads.html">About Ads</a> </div>'

	return s
}

// do hide ads based on local storage
function adsHideSet() {
	if (adOffQ()) {
		adsSet(false)
	}
}

function adsHide() {
	adsSet(false)
	adOffSet()
}

function adsShow() {
	adsSet(true)
	adOffReset()
}

function adsDo() {
	let adType = 'adsense'

	if (adType == 'adsense') {
		adsenseDo()
	}

	if (adType == 'dummy') {
		adsDummy()
	}
}

function adsDummy() {
	let dummy = document.createElement('img')
	dummy.setAttribute('src', `/${main.dom}/images/style/320x60.jpg`)
	dummy.setAttribute('alt', 'dummy image')
	dummy.setAttribute('width', '320')
	dummy.setAttribute('height', '60')

	let dest = document.getElementById('adend')
	dest.appendChild(dummy)
}

function adsenseDo() {
	if (document.body.classList.contains('minimal')) {
			console.log('No Ads due to Minimal')
			return
	}

	let script = document.createElement('script')
	script.async = true
	script.crossOrigin = 'anonymous'
	script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1389989178296449'
	document.body.appendChild(script)

	let ins = document.createElement('ins')
	ins.className = 'adsbygoogle'
	ins.style.display = 'block'
	ins.dataset.adClient = 'ca-pub-1389989178296449'
	ins.dataset.adSlot = '2009442555'
	ins.dataset.adFormat = 'auto'
	ins.dataset.fullWidthResponsive = 'true'

	let dest = document.getElementById('adend')
	if (dest) {
		dest.appendChild(ins)

		let inlineScript = document.createElement('script')
		inlineScript.text = '(adsbygoogle = window.adsbygoogle || []).push({})'
		dest.appendChild(inlineScript)

		console.log('adsenseDo:: done')
	} else {
			console.error("Element with id 'adend' not found!")
	}
}


function adsenseDo2() {   // used up to 250119
	if (document.body.classList.contains('minimal')) {
		console.log('No Ads due to Minimal')
		return
	}

	let script = document.createElement('script')
	script.type = 'text/javascript'
	script.setAttribute('async', 'async')
	script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
	document.getElementsByTagName('body')[0].appendChild(script)

	let ins = document.createElement('ins')
	ins.setAttribute('class', 'adsbygoogle')
	ins.setAttribute('style', 'display:block;')
	ins.setAttribute('data-ad-client', 'ca-pub-1389989178296449')
	ins.setAttribute('data-ad-slot', '2009442555')
	ins.setAttribute('data-ad-format', 'auto')
	ins.setAttribute('data-full-width-responsive', 'true')

	let dest = document.getElementById('adend')
	dest.appendChild(ins)

	var inlineScript = document.createElement('script')
	inlineScript.type = 'text/javascript'
	inlineScript.text = '(adsbygoogle = window.adsbygoogle || []).push({});'
	dest.appendChild(inlineScript)
}

function printImg(s) {
	window.open(s, '_blank')
	setTimeout('pwin.print()', 2000)
}

/* Question Database */
function doQ(qid, qs) {
	let fromPath = location.pathname + location.search 
	let title = document.title
	let url = 'http://www.mathopolis.com/questions/q.html?qid=' + parseInt(qid) + '&t=mif'
	if (typeof qs == 'undefined') {
		// url += '&qs=0'
	} else {
		url += '&qs=' + qs
	}
	url += '&site=1' + '&ref=' + toHex(fromPath) + '&title=' + toHex(title)
	window.open(url, 'mathopolis')
}

function doQLocal(qid, s) {
	let wd = Math.min(window.innerWidth - 50, 800)
	let urlStt = urlSttGet() // to cope with pages at root or one level down

	console.log('wd', wd, s, '(' + urlStt + ')')
	window.open(urlStt + 'quiz/q.html?qid=' + parseInt(qid) + '&qs=' + s, 'popup', 'width=' + wd + ',height=600,left=50')


function getQ() {
	let qs = ''
	for (let i = 0; i < arguments.length; i++) {
		if (i > 0) qs += '_'
		qs += arguments[i]
	}
	let s = ''
	for (let i = 0; i < arguments.length; i++) {
		s += '<a href="javascript:doQ(' + arguments[i] + ",'" + qs + "'" + ')">Question&nbsp;' + (i + 1) + '</a> '
	}
	document.write(s)
}

function getQueryVar(varName, defaultVal = '') {
	let parms = new URLSearchParams(window.location.search)
	let val = parms.get(varName)

	return val !== null ? val : defaultVal
}

function urlSttGet() {

	let url = location.href

	url = url.replace('localhost/', '') // first remove any 'localhost/' to have consistent '/' count
	let slashN = url.split('/').length - 4 // next count '/', and subtract 3 from 'https://www.${main.dom}.com/' and 1 because split has extra 1

	let urlStt = ''
	for (let i = 0; i < slashN; i++) urlStt += '../'

	return urlStt
}

function menuHTML(type) {

	let urlStt = urlSttGet() 

	let links = [
		['index.htm', 'Home', 0],
		['algebra/index.html', 'Algebra', 0],
		['calculus/index.html', 'Calculus', 1],
		['data/index.html', 'Data', 0],
		['geometry/index.html', 'Geometry', 0],
		//  ['measure/index.html', 'Measure', 0],
		['money/index.html', 'Money', 1],
		['numbers/index.html', 'Numbers', 1],
		['physics/index.html', 'Physics', 0],
		['activity/index.html', 'Activities', 1],
		['definitions/index.html', 'Dictionary', 0],
		['games/index.html', 'Games', 0],
		['puzzles/index.html', 'Puzzles', 0],
		['worksheets/index.html', 'Worksheets', 1],
	]

	let s = ''

	let linkLen = links.length
	let i
	if (type == 0) {
		s += '<ul role="list">'
		for (i = 0; i < linkLen; i++) {
			if (links[i][2] == 0) {
				s += '<li role="listitem" tabindex="0"><a href="' + urlStt + links[i][0] + '">' + links[i][1] + '</a></li>'
				s += '\n'
			}
		}
		s += '</ul>'
	}
	if (type == 1) {
		s += '<div class="menuPop">'

		let ht = 36

		// close
		s += '<div class="menuCol">'
		s += `<a href="javascript:adsHide()">`
		s += '<img src="' + urlStt + 'images/style/no.svg" style="height:' + ht + 'px; vertical-align:middle;" alt="Calculator" />'
		s += '</a>'
		s += '</div>'

		s += '<div class="menuCol">'
		s += '<a href="' + urlStt + 'index.htm" style="text-decoration: none;  padding:0px;" aria-label="Home">'
		s += '<img src="' + urlStt + 'images/style/home.svg" style="height:' + ht + 'px; vertical-align:middle;" alt="Home" />'
		s += '</a>'
		s += '</div>'

		s += '<div class="menuCol">'
		s += '<a href="' + urlStt + 'search/search.html" style="text-decoration: none; padding:0px;" aria-label="Show Search">'
		s += '<img src="' + urlStt + 'images/style/search.svg" style="height:' + ht + 'px; vertical-align:middle;" alt="Search" />'
		s += '</a>'
		s += '</div>'

		s += '<div class="menuCol">'
		for (i = 1; i <= 8; i++) {
			s += '<a role="listitem" href="' + urlStt + links[i][0] + '">' + links[i][1] + '</a><br>'
		}
		s += '</div>'

		s += '<div class="menuCol">'
		for (i = 9; i < links.length; i++) {
			s += '<a role="listitem" href="' + urlStt + links[i][0] + '">' + links[i][1] + '</a><br>'
		}
		s += '</div>'

		let imgHome = location.hostname === 'localhost' ? `/${main.dom}/` : '/'
		
		s += '<div class="menuCol">'
		s += `<a href="javascript:adsHide()">Hide Ads</a><br>`
		s += `<a href="javascript:adsShow()">Show Ads</a><br>`
		s += `<a href="${imgHome}about-ads.html">About Ads</a><br>`
		s += `<a href="${imgHome}donate.html">Donate</a><br>`
		s += '</div>'

		s += '<div class="menuCol">'
		s += '<a href="' + urlStt + 'numbers/calculator.html" style="text-decoration: none;  padding:0px;" aria-label="Show Calculator">'
		s += '<img src="' + urlStt + 'images/style/calculator.svg" style="height:' + ht + 'px; vertical-align:middle;" alt="Calculator" />'
		s += '</a>'
		s += '</div>'



		s += '</div>'
	}	
	
	
	
	
	
	
	if (type == 11) {
		s += '<ul role="list" class="bga1" style="display:inline-block; margin-top:25px; padding:6px; border-radius:10px; border: 1px solid; z-index:2; box-shadow: 3px 2px; ">'



		let ht = 36

		s += '<li style=" padding:0px 7px;">'
		s += '<a href="' + urlStt + 'index.htm" style="text-decoration: none;  padding:0px;" aria-label="Home">'
		s += '<img src="' + urlStt + 'images/style/home.svg" style="height:' + ht + 'px; vertical-align:middle;" alt="Home" />'
		s += '</a>'
		s += '</li>'

		s += '<li style=" padding:0px 7px;">'
		s += '<a href="' + urlStt + 'search/search.html" style="text-decoration: none; padding:0px;" aria-label="Show Search">'
		s += '<img src="' + urlStt + 'images/style/search.svg" style="height:' + ht + 'px; vertical-align:middle;" alt="Search" />'
		s += '</a>'
		s += '</li>'

		s += '<li><a role="listitem" href="#">Subjects &#x25BC;</a>'
		s += '<ul>'
		for (i = 1; i <= 8; i++) {
			s += '<li><a role="listitem" href="' + urlStt + links[i][0] + '">' + links[i][1] + '</a></li>'
		}
		s += '</ul>'
		s += '</li>'

		s += '<li><a role="listitem" href="#">More &#x25BC;</a>'
		s += '<ul role="list">'
		for (i = 9; i < links.length; i++) {
			s += '<li><a role="listitem" href="' + urlStt + links[i][0] + '">' + links[i][1] + '</a></li>'
		}
		s += '</ul>'
		s += '</li>'

		let imgHome = location.hostname === 'localhost' ? `/${main.dom}/` : '/'
		
		s += '<li><a href="#">Ads &#x25BC;</a>'
		s += '<ul>'
		s += `<li><a href="javascript:adsHide()">Hide Ads</a></li>`
		s += `<li><a href="javascript:adsShow()">Show Ads</a></li>`
		s += `<li><a href="${imgHome}about-ads.html">About Ads</a></li>`
		s += `<li><a href="${imgHome}donate.html">Donate</a></li>`
		s += '</ul>'
		s += '</li>'

		s += '<li style=" padding:0px 7px;">'
		s += '<a href="' + urlStt + 'numbers/calculator.html" style="text-decoration: none;  padding:0px;" aria-label="Show Calculator">'
		s += '<img src="' + urlStt + 'calculator.svg" style="height:' + ht + 'px; vertical-align:middle;" alt="Calculator" />'
		s += '</a>'
		s += '</li>'

		s += '</ul>'
	}
	if (type == 2) {
		s += '<div id="login" style="display: inline-block; vertical-align:top; text-align:center; line-height:110%; padding:4px; ">'

		s += '</div>'

		s += ' '
		s += '<a href="javascript:menuShow()" style="text-decoration: none;" aria-label="Show Menu">'
		s += '<img src="' + urlStt + 'images/style/menu.svg" width="39" height="39" class="hov" alt="Menu" />'
		s += '</a>'

		s += '<div id="loginPop" class="pop" style="position:absolute; width:300px; left:200px; opacity:0;">'
		s += '<div id="loginContent" style="width:95%; margin: 0 0 5px 10px;">&nbsp;</div>'
		s += '<div id="loginMsg" style="width:95%; margin: 0 0 5px 10px;">&nbsp;</div>'
		s += '<button onclick="loginHide()" style="z-index:2;" class="btn" >Close</button>'
		s += '</div>'
	}

	return s
}

function menuShow() {
	console.log('menuShow', menuVis)
	let menuDiv = document.getElementById('menuSlim')
	let srchDiv = document.getElementById('search')
	if (menuVis) {
		menuDiv.style.display = 'none'
		srchDiv.style.visibility = 'visible';
		// srchDiv.style.display = 'block'
	} else {
		menuDiv.style.display = 'block'
		srchDiv.style.visibility = 'hidden';
		// srchDiv.style.display = 'none'
		// if (searchVis) searchShow() // turn off
	}
	menuVis = !menuVis
}

function searchShow() {
	console.log('searchShow', searchVis)
	let div = document.getElementById('search')
	if (searchVis) {
		div.style.display = 'none'
		div.style.position = 'relative'
	} else {
		div.style.display = 'block'
		div.style.position = 'absolute'
		if (menuVis) menuShow() // turn off
	}
	searchVis = !searchVis
}

function translateHTML() {
	//return ''
	let s = ''
	//let url = location.href; //  safe?
	s += '<div id="google_translate_element"></div>'
	s += '<script type="text/javascript">'
	s += '	function googleTranslateElementInit() {'
	s += "new google.translate.TranslateElement({pageLanguage: 'en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE}, 'google_translate_element');"
	s += '}'
	if (false) {
		s += '</script>'
		s += '	<script type="text/javascript" src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>'
	} else {
		console.log('async translate2')
		s += 'let googleTranslateScript = document.createElement("script");'
		s += 'googleTranslateScript.type = "text/javascript";'
		s += 'googleTranslateScript.async = true;'
		s += 'googleTranslateScript.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";'
		s += '( document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0] ).appendChild(googleTranslateScript);'
		s += '</script>'
	}
	return s
}

function cookMsg() {
	let s = ''

	let imgHome = location.hostname == 'localhost' ? `/${main.dom}/` : '/'
	s += 'We may use <a href="' + imgHome + 'about-ads.html">Cookies</a> &nbsp;'
	s += '<div class="btn" style="display:inline-block; cursor: pointer;" onclick="cookOK()">OK</div>'

	return s
}

function cookOK() {
	console.log('cookOK')
	document.getElementById('cookOK').style.display = 'none'
	localStorage.setItem('cookie', 'ok')
}

// function docInsert(s) {
//   let div = document.createElement('div')
//   div.innerHTML = s
//   let script = document.currentScript
//   script.parentElement.insertBefore(div, script); // Add the newly-created div before script location
// }

function linksHTML() {
	const url = encodeURIComponent(location.href)
	const title = encodeURIComponent(document.title)
	const baseLink = (href, title, id) => `<a target="_blank" rel="noopener nofollow" href="${href}" title="${title}" id="${id}" aria-label="${title}"></a>`

	// Define social media share URLs
	let facebookLink = baseLink(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`, "Share on Facebook", "linkfb")
	let twitterLink = baseLink(`https://x.com/intent/tweet?url=${url}&text=${title}`, "Tweet it on X", "linktw")
	let whatsappLink = baseLink(`https://wa.me/?text=${title} ${url}`, "Share on WhatsApp", "linkwa")
	let pinterestLink = baseLink(`https://www.pinterest.com/pin/create/button/?url=${url}&description=${title}`, "Pin it", "linkpi")

	// Construct links HTML
	let links = ''
	links += facebookLink
	links += twitterLink
	links += whatsappLink
	//links += pinterestLink
	links += '<a href="javascript:tellAFriend()" id="linkem" title="eMail a Friend" aria-label="eMail a Friend"></a>'
	links += '<a href="javascript:linkToUs()" id="linkus" title="Link To Us" aria-label="Link To Us"></a>'
	//links += '<a href="javascript:donate()" id="linkdo" title="Donate" aria-label="Donate"></a>'
	
	return links
}

function footerHTML() {
	let s = ''

	let urlStt = urlSttGet() // to cope with pages at root or one level down

	let sep = ' &cir; '

	s += '<div id="footMenu">'
	s += '<a href="javascript:donate()">Donate</a>' + sep
	s += '<a href="' + urlStt + 'search/search.html">Search</a>' + sep
	s += '<a href="' + urlStt + 'links/index.html">Index</a>' + sep
	s += '<a href="' + urlStt + 'aboutmathsisfun.html">About</a>' + sep
	s += '<a href="' + urlStt + 'contact.html">Contact</a>' + sep
	s += '<a href="javascript:citation()">Cite&nbsp;This&nbsp;Page</a>' + sep
	s += '<b><a href="' + urlStt + 'Privacy.htm">Privacy</a></b>'
	s += '</div>'

	// <a href="javascript:contribute()">contribute</a>

	return s
}

function footer2HTML() {
	let urlStt = urlSttGet() // to cope with pages at root or one level down

	let links = [
		['<div style="margin:5px 0 10px 5px;"><a href="' + urlStt + 'index.htm"><img src="' + urlStt + 'images/style/logo.svg" alt="logo"></a></div>', '', 1],
		['index.htm', 'Home', 0],
		['links/index.html', 'Index', 0],
		['aboutmathsisfun.html', 'About Us', 0],
		['contact.html', 'Contact Us', 0],
		['Privacy.htm', 'Privacy', 0],

		['<div class="footHdr">Subjects</div> ', '', 1],
		['algebra/index.html', 'Algebra', 0],
		['algebra/index-2.html', 'Algebra 2', 0],
		['calculus/index.html', 'Calculus', 0],
		['data/index.html', 'Data', 0],
		['geometry/plane-geometry.html', 'Plane Geometry', 0],
		['geometry/solid-geometry.html', 'Solid Geometry', 0],
		['measure/index.html', 'Measure', 0],
		['money/index.html', 'Money', 0],
		['numbers/index.html', 'Numbers', 0],
		['physics/index.html', 'Physics', 0],

		['<div class="footHdr">Other</div> ', '', 1],
		['activity/index.html', 'Activities', 0],
		['definitions/index.html', 'Dictionary', 0],
		['games/index.html', 'Games', 0],
		['puzzles/index.html', 'Puzzles', 0],
		['worksheets/index.html', 'Worksheets', 0],
	]

	// let sep = ' &cir; '
	let s = ''
	s += '<div class="foot">'

	for (let i = 0; i < links.length; i++) {
		let link = links[i]

		if (link[2] == 1) {
			if (i > 0) s += '</div>'
			s += '<div class="footCol">'
			s += link[0]
		} else {
			s += '<div class="footItem">'
			s += '<a href="' + urlStt + link[0] + '">' + link[1] + '</a>'
			s += '</div>\n'
		}
	}

	s += '<br><a href="javascript:citation()">Cite This Page</a>'
	s += '</div>'

	console.log('foot', s)
	return s
}

function themeChgHTML() {
	let s = ''
	s += '<label aria-label="Toggle theme">'
	s += '<input type="checkbox" onchange="themeChg()" id="themeSlider">'
	s += '<span id="themeSlider1" class="round"></span>'
	s += '</label>'
	return s
}

function themeChg() {
	let was = themeGet()
	let theme = was == 'lite' ? 'dark' : 'lite'
	themeSet(theme)
	document.getElementById('themeSlider').checked = theme == 'dark'
}

function themeGet() {
	let theme = localStorage.getItem('theme')
	//console.log('themeGet', theme)
	if (theme == null) {
		let prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
		theme = prefersDarkScheme ? 'dark' : 'lite'
		localStorage.setItem('theme', theme)
	}
	if (theme != 'lite' && theme != 'dark') {
		theme = 'lite'
		localStorage.setItem('theme', theme)
	}
	//console.log('themeGet', theme)
	return theme
}

function themeSet(theme) {
	localStorage.setItem('theme', theme)
	// console.log('themeSet', theme, document.documentElement.hasAttribute('theme'))
	// if (document.documentElement.hasAttribute('theme')) {
	// document.documentElement.removeAttribute('theme')
	// } else {
	document.documentElement.setAttribute('theme', theme)
	// }
}

// function gAnalyticsStr() {
//   let s = "";
//   s += '<script type="text/javascript">';
//   s += 'let _gaq = _gaq || [];';
//   s += "_gaq.push(['_setAccount', 'UA-29771508-1']);";
//   s += "_gaq.push(['_trackPageview']);";
//   s += '(function() {';
//   s += "let ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;";
//   s += "ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';";
//   s += "let s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);";
//   s += '})();';
//   s += '</script>';
//   return s;
// }

function logErr() {
	let pg = location.pathname
	let pgHex = toHex(pg)
	logSend(pgHex, 'err', window.location.hostname)
}

function logVisit() {
	let pg = location.pathname
	if (pg == '/') return // NB because getting too many root page visits for some reason.
	let pgHex = toHex(pg)
	logSend(pgHex, 'visit', window.location.hostname)
}
if (Math.random() < 0.1) logVisit()

function logSend(pg, viewtype, hostname) {
	let req = new XMLHttpRequest()

	let browser = (function (agent) {
		switch (true) {
			case agent.indexOf('edge') > -1:
				return 'EdgeOld'
			case agent.indexOf('edg') > -1:
				return 'Edge'
			case agent.indexOf('opr') > -1 && !!window.opr:
				return 'Opera'
			case agent.indexOf('chrome') > -1 && !!window.chrome:
				return 'Chrome'
			case agent.indexOf('trident') > -1:
				return 'IE'
			case agent.indexOf('firefox') > -1:
				return 'Firefox'
			case agent.indexOf('safari') > -1:
				return 'Safari'
			default:
				return 'Other'
		}
	})(window.navigator.userAgent.toLowerCase())
	let os = ''
	let tz = Intl.DateTimeFormat().resolvedOptions().timeZone
	let agent = navigator.userAgent.substring(0, 90)

	let params = 'type=' + viewtype
	params += '&site=mif'
	params += '&pg=' + encodeURIComponent(pg)
	params += '&lang=' + encodeURIComponent(window.navigator.language)
	params += '&ref=' + encodeURIComponent(toHex(document.referrer))
	params += '&wd=' + parseInt(window.innerWidth)
	params += '&ht=' + parseInt(window.innerHeight)
	params += '&ht=' + parseInt(window.innerHeight)
	params += '&browser=' + encodeURIComponent(browser)
	params += '&os=' + encodeURIComponent(os)
	params += '&tz=' + encodeURIComponent(tz)
	params += '&agent=' + encodeURIComponent(agent)

	// console.log('addVisit', hostname)

	req.open('POST', 'https://mi2f.com/update.php', true) // NB: false=synchronous

	req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
	//req.setRequestHeader("Content-length", params.length);
	//req.setRequestHeader("Connection", "close");
	req.send(params)
}

//window.addEventListener("scroll", onScroll);
function onScroll() {
	let scrollTop = document.documentElement ? document.documentElement.scrollTop : document.body.scrollTop
	let menu = document.getElementById('menu')
	//alert(scrollTop);
	if (scrollTop > 100) {
		menu.style.top = '0px'
		menu.style.width = '1000px'
		//menu.style.margin = "0 auto 0 auto";
		//menu.style.borderBottom = "2px solid #ffffff";
		menu.style.border = '1px solid #ffffff'
		menu.style.boxShadow = '0px 12px 12px -12px #77cc77'
		menu.style.backgroundColor = 'white'
		//menu.style.right = "0";
		//menu.style.left = "0";
		menu.style.textAlign = 'center'
		menu.style.position = 'fixed'
		menu.style.zIndex = '5000'
	} else {
		//menu.style.backgroundColor = "transparent";
		menu.style.boxShadow = 'none'
		menu.style.position = 'static'
	}
}

function relatedLinks() {
	//this.id = typeof id !== 'undefined' ? id : "searchBox";

	if (window.innerWidth < 860) {
		return // don't bother if screen not wide enough
	}
	let rels = document.getElementsByClassName('related')
	if (rels.length == 0) {
		return
	}
	let rel = rels[0]

	let links = rel.getElementsByTagName('a')
	let count = links.length

	let right = null
	let left = null
	if (count == 1) right = links[0]
	if (count > 1) {
		left = links[0]
		right = links[1]
	}

	let s = ''

	let top = 220

	if (left != null) {
		s += '<div style="position: absolute; top: ' + top + 'px; left: 0px; text-align: left; z-index:2;">'
		s += fmtMenuBox(left.href, left.text, 0)
		s += '</div>'
	}
	if (right != null) {
		s += '<div style="position: absolute; top: ' + top + 'px; right: 0px; text-align: right; z-index:2;">'
		s += fmtMenuBox(right.href, right.text, 1)
		s += '</div>'
	}

	document.getElementById('stt').innerHTML += s
	//document.getElementById("header").innerHTML += s;   // NB stops google translate from working
	//document.body.innerHTML = s + document.body.innerHTML;
	//document.getElementById("midfull").innerHTML += s;
}

function fmtMenuBox(url, txt, dirn) {
	let s = ''
	let boxID = dirn == 0 ? 'menuLt' : 'menuRt'
	s += '<a href="' + url + '"  style="text-decoration: none; color: #8ac; line-height:1.3rem; ">'
	s += '<div id="' + boxID + '">'
	s += txt
	s += '</div>'
	s += '</a>'
	return s
}

function visFlip(id) {
	let div = document.getElementById(id);
	console.log('visFlip',id, div.style.visibility)
	if (div.style.visibility === 'hidden') {
		div.style.visibility = 'visible';
	} else {
		div.style.visibility = 'hidden';
	}
}	

function vidDo(id, spanid) {
	let s = ''

	let visIndex = videoVis.indexOf(spanid)
	let visQ = visIndex > -1 ? true : false // is it currently visible?

	if (visQ) {
		// turn off
		let frame = document.getElementById(spanid + 'v1')
		frame.parentNode.removeChild(frame)
		videoVis.splice(visIndex, 1)
		visQ = false
	} else {
		// turn on
		s += '<div style="width:100vw;"></div>'
		s += '<iframe id="' + spanid + 'v1" src="https://www.youtube.com/embed/' + id + '?rel=0&autoplay=1" frameborder="0" allowfullscreen style=" vertical-align:top; "></iframe>'
		s += '<div style="width:100vw;"></div>'
		videoVis.push(spanid)
		visQ = true
	}

	let vid = document.getElementById(spanid)
	vid.innerHTML = s
	// vid.style.position = 'absolute';
	// vid.style.position = 'relative';
	vid.style.border = '5px solid blue;'
	console.log('vidDo', vid)

	if (visQ) resizeVideo(spanid)
}

function resizeVideo(spanid) {
	let v1 = document.getElementById(spanid + 'v1')
	let wd = window.innerWidth - 40
	if (wd > 640) wd = 640
	v1.style.width = wd + 'px'
	v1.style.height = wd * (340 / 640) + 80 + 'px'
}

let videoVis = []

function mainDo() {


	// Dynamically add hreflang tag to the head section
	// <link rel="alternate" hreflang="en" href="..." />
	let hreflangLink = document.createElement("link")
	hreflangLink.rel = "alternate"
	hreflangLink.hreflang = "en"
	hreflangLink.href = window.location.href
	document.head.appendChild(hreflangLink)


	if (document.getElementById('menuWide') == null) return

	document.getElementById('menuWide').innerHTML = menuHTML(0)
	document.getElementById('menuSlim').innerHTML = menuHTML(1)
	document.getElementById('menuTiny').innerHTML = menuHTML(2)

	document.getElementById('adHide').innerHTML = adsHideHTML()
	if (localStorage.getItem('cookie') != 'ok') {
		document.getElementById('cookOK').innerHTML = cookMsg()
	}

	document.getElementById('search').innerHTML = searchHTML()
	document.getElementById('linkto').innerHTML = linksHTML()

	let themeDiv = document.getElementById('themeChg')
	if (themeDiv) {
		themeDiv.innerHTML = themeChgHTML()
	} else {
		let newDiv = document.createElement('div')
		newDiv.id = 'themeChg'

		let logoDiv = document.getElementById('logo')
		if (logoDiv) {
			console.log('ADD theme div')
			logoDiv.insertAdjacentElement('afterend', newDiv)
			newDiv.innerHTML = themeChgHTML()
		}
	}

	document.getElementById('themeSlider').checked = themeGet() == 'dark' // must be on page before using

	document.getElementById('footer').innerHTML = footerHTML()

	let qDivs = document.querySelectorAll('.questions')
	//console.log('qDivs', qDivs)
	for (let i = 0; i < qDivs.length; i++) {
		qsExpand(qDivs[i])
	}

	let vidDivs = document.querySelectorAll('.video')
	//console.log('vidDivs', vidDivs)
	for (let i = 0; i < vidDivs.length; i++) {
		vidExpand(vidDivs[i], i)
	}

	let scriptDivs = document.querySelectorAll('.script')
	//console.log('scriptDivs', scriptDivs)
	for (let i = 0; i < scriptDivs.length; i++) {
		scriptExpand(scriptDivs[i])
	}

	//document.getElementById('adend').innerHTML = adEndHTML()
	adsHideSet()

	if (!adOffQ()) {
		setTimeout(adsDo, 2000)
	}

	doLocal()
	document.getElementById('searchFld').addEventListener('keyup', searchKey)

	main.sock = new MainSock()
	if (typeof mainMsg === 'function') mainMsg({ msg: 'ready' })

	loginPrompt()
	console.log('loginName', loginName())
}

function mainVar() {
	return main
}

window.addEventListener('message', function (event) {
	if (event.origin !== window.location.origin) return
	// console.log('>> main4 rcvd', event.data)

	if (event.data && event.data.msg) {
		let msg = event.data.msg

		// if (msg == 'gamesList') {
		main.sock.send(JSON.stringify(event.data))
		// }
	}

	// if (event.data === 'iframe-ready') {
	// 	let iframe = event.source
	// 	console.log('******* iframe',event)
	// 	// iframe.postMessage('main-recvd', '*')
	// 	main.iframes.push(iframe)
	// }
})

function searchHTML() {
	let s = ''
	s += '<form autocomplete="off" action="' + urlSttGet() + 'search/search.html" method="get">'
	s += '<input type="submit" id="searchBtn" name="submit" value="" aria-label="Search Button" />'
	s += '<input type="text" id="searchFld" name="query" value="" placeholder="Search" aria-label="Search" />'
	s += '<input type="hidden" name="search" value="1" />'
	s += '</form>'

	return s
}

function searchKey(ev) {
	let val = ev.target.value
	console.log('searchKey', val)

	// run external script to handle autocomplete etc (better than adding heaps of code and possible errors to main script )
	if (main.searchScript == 'no') {
		main.searchScript = 'loading'
		let script = document.createElement('script')
		script.onload = function () {
			console.log('Script loaded')
			searchDo(ev)
			main.searchScript = 'yes'
		}
		let imgHome = location.hostname == 'localhost' ? `/${main.dom}/` : '/'
		script.src = imgHome + 'search/images/search-lib.js'
		document.getElementsByTagName('head')[0].appendChild(script)
	}
	if (main.searchScript == 'yes') searchDo(ev)
	return
}

function qsExpand(node) {
	let str = node.innerHTML
	if (str.includes('getQ(')) return // don't change an existing 'inline' getQ() style

	console.log('qsExpand', str)
	let newStr = qsHTML(str)
	node.innerHTML = newStr
}

function qsHTML(qStr) {
	let qs = qStr.trim().split(/[^0-9]+/) //   use '+' (1 to many) of anything that is not a number as a separator
	let joinedStr = qs.join('_')
	let s = ''

	s += '<span style="display:inline-block; min-width:8rem;">Mathopolis:</span>'
	for (let i = 0; i < qs.length; i++) {
		s += '<a href="javascript:doQ(' + qs[i] + ",'" + joinedStr + "'" + ')">Q' + (i + 1) + '</a> '
	}

	let path = location.pathname
	path = path.split(`/${main.dom}/`).join('/') // for local
	let dir = path.substring(0, path.lastIndexOf('/'))
	console.log('dir', path, dir)

	if (dir == '/data') {
		s += '<br>'
		s += '<span style="display:inline-block; min-width:8rem;">Local popup:</span>'
		for (let i = 0; i < qs.length; i++) {
			s += '<a href="javascript:doQLocal(' + qs[i] + ",'" + joinedStr + "'" + ')">Q' + (i + 1) + '</a> '
		}
	}

	return s
}

function vidExpand(div, n) {
	let str = div.innerHTML
	if (str.trim().length <= 1) return // don't change an empty (old style) video tag

	let newStr = vidHTML(str, 'title', 'video' + n)
	//console.log('vidExpand', str, newStr)
	div.innerHTML = newStr
}

function vidHTML(id, titleid = 'title', spanid = 'video', style = 'span') {
	// it is possible that a '-' gets converted to '&minus;' in html, so revert
	id = id.replace(/&minus;/g, '-')

	// in FF, setting width AGAIN causes window to reset size
	//if (navigator.appName == "Microsoft Internet Explorer") window.onresize = resizeVideo;

	let s = ''
	switch (style) {
		case 'span':
			//s += '<div class="video">';
			s += '<a href="javascript:vidDo(\'' + id + "','" + spanid + '\')">'
			s += '<img src="' + urlSttGet() + 'images/style/video.svg" alt="Video" style="width:70px; height:37px;vertical-align:middle; border:none;" />'
			s += '</a>'
			//s += '</div>';
			s += '<span id="' + spanid + '" style=""></span>'
			break

		case 'h1':
			let title = document.getElementById(titleid).innerHTML

			s += '<div class="centerfull" style="clear:both; font-weight:400; padding: 0;">'
			s += '<div style="float:left; width:60px; text-align:left;">'
			s += '  <a href="javascript:vidDo(\'' + id + "','" + spanid + '\')">'
			s += '    <img src="' + urlSttGet() + 'images/style/video.svg" alt="Video" height="32" style="vertical-align:middle; border:none;" />'
			s += ' </a>'
			s += '</div>'
			s += '<div style="float:right; width:60px; text-align:right;">&nbsp;</div>'
			s += '  <div style="margin:0 auto;">'
			s += '    <h1>' + title + '</h1>'
			s += '  </div>'
			s += '</div>'
			break

		case 'h2':
			title = document.getElementById(titleid).innerHTML

			s += '<div style="float:right; width:100px; margin: -10px 0 5px 0;">'
			s += '  <a href="javascript:vidDo(\'' + id + "','" + spanid + '\')">'
			s += '    <img src="' + urlSttGet() + 'images/style/video.svg" alt="Video" height="32" style="vertical-align:middle; border:none;" />'
			s += ' </a>'
			s += '</div>'
			s += '    <h2>' + title + '</h2>'
			break
	}
	//console.log('vidHTML', s)
	return s
}

function initVideo(id, titleid, spanid, style) {
	// defaults
	titleid = typeof titleid !== 'undefined' ? titleid : 'title'
	spanid = typeof spanid !== 'undefined' ? spanid : 'video'
	style = typeof style !== 'undefined' ? style : 'h1'

	document.getElementById(titleid).innerHTML = vidHTML(id, titleid, spanid, style)
}

function scriptExpand(div) {
	let str = div.innerHTML
	if (str.trim().length <= 1) return

	iframeDo(div, str)
}

function htmlSafe(input) {
	// Return empty string for undefined or empty input
	if (input == undefined || input.length <= 0) return ''

	let safeInput = input.replace(/javascript/gi, 'js')
	safeInput = safeInput.replace(/script/gi, '')

	// Strip out potentially harmful characters
	safeInput = safeInput.replace(/[^a-z0-9/\-[\]=_ :;,.()\w\s!?]/gi, '')

	return safeInput
}
function sqlSafe(sql) {
	let s = ''
	const length = sql.length

	for (let i = 0; i < length; i++) {
		const char = sql[i]
		if (char === "'") {
			s += "''"
		} else if (char === '"') {
			s += '\\"'
		} else if (char === '\\') {
			s += '\\\\'
		} else {
			s += char
		}
	}

	return s
}

function putFlash6(w, h, fn, querystring, clr) {
	// w=width, h=height, fn=filename(minus '.swf'), querystring=..., clr=bg color
	if (!querystring) {
		querystring = ''
	} else {
		querystring = '?' + querystring
	}

	if (!clr) {
		clr = '#d6d9e6'
	} // default background color

	if (fn.substring(fn.lastIndexOf('.swf')) != '.swf') fn = fn + '.swf' // append .swf if absent

	var s = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,79,0" width="' + w + '" height="' + h + '" id="' + fn + '">\n'
	s += '<param name="movie" value="' + fn + querystring + '"/> '
	s += '<param name="quality" value="high"/> '
	s += '<param name="bgcolor" value="' + clr + '"/> '
	s += '<param name="menu" value="false"/> '
	s += '<param name="allowScriptAccess" value="sameDomain"/> ' //        always
	s += '<param name="allowFullScreen" value="true"/> '
	s += '<embed src="' + fn + querystring + '" quality="high" bgcolor="' + clr + '" '
	s += 'menu="false" width="' + w + '" height="' + h + '" type="application/x-shockwave-flash" '
	s += 'pluginspage="http://www.macromedia.com/go/getflashplayer" '
	s += 'swLiveConnect="true" allowscriptaccess="sameDomain" allowFullScreen="true" id="' + fn + '" name="' + fn + '"><noembed></noembed></embed>\n' //       always
	s += '</object>\n'

	document.write(s)
}

function putFlash7(w, h, swf, querystring, clr, noflash) {
	// https://github.com/ruffle-rs/ruffle/wiki/Using-Ruffle#web
	console.log('putFlash7: ' + swf)

	let s = '<div id="container"></div>'
	document.write(s)

	window.RufflePlayer = window.RufflePlayer || {}
	window.addEventListener('load', (event) => {
		const ruffle = window.RufflePlayer.newest()
		const player = ruffle.createPlayer()
		const container = document.getElementById('container')
		container.appendChild(player)
		player.load(swf)
	})
}

function putFlash8(w, h, swf, querystring, clr, noflash) {
	console.log('putFlash8: ' + swf)

	window.RufflePlayer = window.RufflePlayer || {}
	window.addEventListener('load', (event) => {
		const ruffle = window.RufflePlayer.newest()
		const player = ruffle.createPlayer()
		const container = document.getElementById('container')
		console.log('container', container)
		container.appendChild(player)
		player.load(swf)
	})
}

function iframeDo(div, fileStr, focusQ=true) {
	// create an iframe and then load filename into it
	let fileNames = fileStr.split(',')
	let filename = fileNames[fileNames.length - 1].trim() // last file name is our main app

	let imgHome = location.hostname == 'localhost' ? `/${main.dom}/` : '/'

	let sttWd = parseInt(div.getBoundingClientRect().width)
	let sttHt = parseInt(div.getBoundingClientRect().height)

	let aspect = parseFloat(div.style.gap)
	let maxQ = !isNaN(aspect)
	//console.log('iframe:', div, div.style.cssText, aspect, maxQ)

	let htQ = div.style.height.length > 0

	let iframe = document.createElement('iframe')
	//let maxQ = false
	if (htQ) {
		//if (sttHt>=1000) maxQ = true
		iframe.width = sttWd
		iframe.height = sttHt
	} else {
		iframe.height = '200' // speculative height, adjust later
	}
	iframe.style = `display:block; margin:auto; border:none; background-color:transparent; overflow:hidden;
  transition:all 0.6s ease-in-out;`
	iframe.scrolling = 'no' // sadly needed for chrome
	iframe.setAttribute('title', 'JavaScript Animation')

	let html = '<!doctype html><html><head>'
	html += '<meta http-equiv="content-type" content="text/html; charset=utf-8" />'

	// supporting files
	for (let i = 0; i < fileNames.length - 1; i++) {
		html += '<script src="' + imgHome + fileNames[i].trim() + '"></script>'
	}

	html += '<link rel="stylesheet" href="' + imgHome + 'style4.css">'
	html += '<script src="' + imgHome + 'iframe.js" defer></script>'
	html += '<style>body { background: transparent; }</style>' // don't want to double up on background in iframe
	html += '</head>'

	html += '<body style="margin:auto; text-align:center; ">'
	html += `<script defer src="${filename}"></script>`
	html += '</body>'
	html += '</html>'

	div.parentElement.insertBefore(iframe, div) // place iframe
	div.style.display = 'none' // hide 'calling' div

	iframe.contentWindow.document.open()
	iframe.contentWindow.document.write(html)
	// iframe.contentWindow.document.outerHTML=html   // doesn't work
	iframe.contentWindow.document.close()

	iframe.addEventListener('load', function () {
		main.iframes.push(iframe.contentWindow)

		if (focusQ) {
			iframe.contentWindow.focus()
			//iframe.contentWindow.addEventListener('keydown', function (ev) {
				// console.log(`Key in iframe pressed: ${ev.key}`)
				// Handle key events here
			//})
		}

		// console.log('************** iframe loaded')
		// window.parent.postMessage('iframe-ready', '*')

		let btnQ = false
		let aQ = false

		iframe.style.maxWidth = '100%'
		//let bestWd = iframe.contentDocument.body.scrollWidth
		let bestWd = 0,
			bestHt = 0
		if (htQ) {
			bestWd = sttWd
			bestHt = sttHt
		} else {
			bestWd = 0
			iframe.width = bestWd + 'px'
			bestHt = iframe.contentDocument.body.scrollHeight + 1
			iframe.height = bestHt + 'px'
		}

		setInterval(function () {
			if (maxQ) {
				// iframe.width = '100%'
				//       let aspect = iframe.contentDocument.body.scrollWidth / iframe.contentDocument.body.scrollHeight
				let wd = window.innerWidth
				let ht = window.innerHeight - 60
				let newAspect = wd / ht

				//iframe.style.border = '1px solid blue'

				// console.log('aspect',aspect,newAspect)
				if (newAspect > aspect) {
					wd = ht * aspect
				} else {
					ht = wd / aspect
				}
				//console.log('maxQ',screen.height,screen.availHeight,window.innerHeight,aspect,wd,ht)
				iframe.width = wd + 'px'
				iframe.height = ht + 'px'
				return
			}
			let wd, ht
			let byBoundingRect = false
			if (byBoundingRect) {
				let div = iframe.contentDocument.body.children[0].children[0]
				let rect = div.getBoundingClientRect()
				wd = rect.width
				ht = rect.height
			} else {
				wd = iframe.contentDocument.body.scrollWidth + 1
				ht = iframe.contentDocument.body.scrollHeight + 1
			}

			if (wd != bestWd) {
				console.log('chg wd', bestWd, 'to', wd)
				bestWd = wd
				// iframe.style.width = bestWd + 'px';
				if (!aQ) {
					iframe.width = '100%'
				} else {
					iframe.width = bestWd + 'px'
					aQ = true
				}
			}

			if (ht > bestHt || ht < bestHt - 10) {
				console.log('chg ht', bestHt, 'to', ht)
				bestHt = ht
				iframe.height = bestHt + 'px'
			}
			if (!btnQ) {
				let wd = iframe.contentDocument.body.scrollWidth + 40
				let ht = iframe.contentDocument.body.scrollHeight + 1
				let div = iframe.contentDocument.getElementById('resize')
				if (div != null) {
					let btnStr = '<button type="button" class="btn" style="z-index:2; position:absolute; right:0; bottom:0;" onclick="iframeMax(\'' + filename + "'," + wd + ',' + ht + ')">&rect;</button>'
					div.innerHTML = btnStr
					//console.log('qqq', wd, ht, btnStr)
				}
				//iframe.contentDocument.body.innerHTML += btnStr
				btnQ = true
			}
		}, 650)
	})

	// iframe.addEventListener('load', function () {
	//   iframe.style.backgroundColor = "transparent";
	//   //iframe.style.width = iframe.contentDocument.body.scrollWidth + 'px';
	//   iframe.style.width = '100%';
	//   iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px';
	// });
	//window.addEventListener('resize', function () {
	//console.log('iframe resize !!!!!!!!!!! ')
	// iframe.style.width = iframe.contentDocument.body.scrollWidth + 'px';
	//iframe.style.width = '100%';
	// iframe.style.height = '100px';
	//  iframe.style.height = iframe.contentDocument.body.scrollHeight + 'px';
	//});
}

function rpLog(id) {
	let now = performance.now()
	if (main.timeStt == undefined) {
		main.timeStt = performance.now()
		main.timePrev = performance.now()
	}

	console.log('' + id + ': ' + parseInt(now - main.timeStt) + 'ms => ' + parseInt(now - main.timePrev) + 'ms')
	main.timePrev = now
}

function loginShow(type) {
	let s = ''

	if (type == 0) {
		// not logged in
		let name = ''
		let pass = ''
		s += '<div style="position:relative; margin:auto; text-align:center; font:14px Arial;  margin: 5px 0 1px 0; padding: 5px 0 5px 0;">'
		s += 'Username: '
		s += '<input id="name" style="width: 120px; border-radius: 10px; font: 18px Arial; background-color: #eeffee; text-align:center;" value="' + name + '" />'
		s += '<br>'
		s += 'Password: '
		s += '<input id="pass" type="password" style="width: 120px; border-radius: 10px; font: 18px Arial; background-color: #eeffee; text-align:center;" value="' + pass + '" />'
		s += '</div>'

		s += '<div style="margin: 0 0 5px 10px;">'
		s += '<button id="optLogin" onclick="loginGo()" style="z-index:2;" class="btn" >Login</button>'
		s += '<button id="optNewUser" onclick="loginNew()" style="z-index:2;" class="btn" >New User</button>'
		s += '</div>'
	}

	if (type == 1) {
		// logged in
		s += `
	Hi ${loginName()}<br>
	<div style="position:relative; margin:auto; text-align:right; font:14px Arial;  margin: 5px 0 1px 0; padding: 5px 0 5px 0;">
		Password: <input id="passOld" type="password" style="width: 120px; border-radius: 10px; font: 18px Arial; background-color: #eeffee; text-align:center;" value="" />
		<br>
		New Password: <input id="passNew" type="password" style="width: 120px; border-radius: 10px; font: 18px Arial; background-color: #eeffee; text-align:center;" value="" />
		<button onclick="loginPassChg()" style="z-index:2;" class="btn" >Change Password</button>
	</div>
		<br>
		<button onclick="userGames()" style="z-index:2;" class="btn" >Games</button><br>
		<button onclick="loginOut()" style="z-index:2;" class="btn" >Logout</button>
	`
	}

	document.getElementById('loginContent').innerHTML = s

	let div = document.getElementById('loginPop')
	div.style.left = '-250px'
	div.style.opacity = 1

	document.getElementById('name').value = localStorage.getItem('user.name')
}

function loginName() {
	let name = localStorage.getItem('user.name') || ''
	if (name.length < 2) return ''

	let stamp = localStorage.getItem('user.stamp') || ''
	if (stamp.length < 2) return ''

	return name
}

function loginType() {
	let type = 'none' // or 'guest'?

	let name = localStorage.getItem('user.name') || ''
	if (name.length < 2) return type

	let userType = localStorage.getItem('user.type') || type
	if (userType == 1 || userType == 2) return 'admin'

	return 'user'
}

function loginPrompt() {
	// return
	let name = loginName()

	let s = ''
	if (name.length > 0) {
		s += '<a href="javascript:loginShow(1)" style="aria-label="Logout">'
		s += name
		s += '</a>'
	} else {
		s += '<a href="javascript:loginShow(0)" style="aria-label="Login">'
		s += 'Login'
		s += '</a>'
	}

	let div = document.getElementById('login')
	div.innerHTML = s
}

function loginGo() {
	let name = document.getElementById('name').value
	localStorage.setItem('user.name', name)
	let pass = document.getElementById('pass').value
	console.log('loginGo', name, pass)
	loginMsg()

	main.sock.login(name, pass)
}
function loginNew() {
	let name = document.getElementById('name').value
	localStorage.setItem('user.name', name) // remember for user later on
	let pass = document.getElementById('pass').value
	console.log('loginNew', name, pass) // don't store password at all
	loginMsg()

	// validate
	if (name.length < 6) {
		loginMsg('Username needs 6 or more characters')
		return
	}
	if (name.length > 20) {
		loginMsg('Username exceeds maxiumum of 20 characters')
		return
	}
	let safeRegex = /^[a-zA-Z0-9_\-!$]+$/
	if (!safeRegex.test(name)) {
		loginMsg('Username has unsafe characters')
		return
	}
	if (pass.length < 6) {
		loginMsg('Password needs 6 or more characters')
		return
	}
	if (!safeRegex.test(pass)) {
		loginMsg('Password: has unsafe characters')
		return
	}

	main.sock.loginNew(name, pass)
}
function loginPassChg() {
	let name = loginName()
	let passOld = document.getElementById('passOld').value
	let passNew = document.getElementById('passNew').value
	console.log('loginPassChg', passOld, passNew)

	// validate
	if (passNew.length < 6) {
		loginMsg('Password: 6 or more characters')
		return
	}

	main.sock.loginPassChg(name, passOld, passNew)
}
function loginOut() {
	localStorage.setItem('user.stamp', '') // unsetting stamp invalidates login
	loginPrompt()
	loginHide()
	if (typeof loginDo === 'function') loginDo()
}
function loginMsg(s = '&nbsp;') {
	console.log('loginMsg', s)
	let div = document.getElementById('loginMsg')
	if (div != null) div.innerHTML = s
}

function loginHide() {
	let div = document.getElementById('loginPop')
	div.style.left = '200px'
	div.style.opacity = 0
}
function userGames() {
	let home = location.hostname == 'localhost' ? `/${main.dom}/` : '/'
	window.location = home + 'games/user.html'
}



function fmtTm(dt) {
	let hours = dt.getHours().toString().padStart(2, '0')
	let minutes = dt.getMinutes().toString().padStart(2, '0')
	let seconds = dt.getSeconds().toString().padStart(2, '0')
	return `${hours}:${minutes}:${seconds}`
}

function getSock() {
	// this is how we get the main socket when in an iframe
	return main.sock
}

class MainSock {
	constructor(keepAliveQ = false) {
		this.keepAliveQ = keepAliveQ
		this.socket = null
		this.queue = []
		this.lines = []
		this.connectTryN = 0
	}

	send(msg) {
		// 0=CONNECTING (Socket created, connection not yet open) 1=OPEN (connection is open and ready to communicate)  2=CLOSING (connection is in the process of closing)  3=CLOSED

		if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
			this.connect()
		}

		if (this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(msg)
		} else {
			// If the WebSocket is not OPEN, queue the message
			this.queue.push(msg)
		}
	}

	send1(msg) {
		if (this.socket == null) {
			// console.log('this.queue.push',msg)
			this.queue.push(msg)
			this.connect()
		} else {
			console.log('this.socket.readyState', this.socket.readyState)
			if (this.socket.readyState === 1) {
				// console.log('this.socket.send',msg)
				this.socket.send(msg)
			}
		}
		//this.waitForConnection(function () { this.socket.send(msg); }, 1000)
	}

	waitForConnection(callback, interval) {
		if (this.socket.readyState === 1) {
			callback()
		} else {
			let self = this
			interval *= 2
			setTimeout(function () {
				self.waitForConnection(callback, interval)
			}, interval)
		}
	}
	connect() {
		// console.trace('connect', fmtTm(new Date()))

		let socket = new WebSocket(`wss://${main.server}:${main.port}/`)
		console.log('socket', socket)
		let self = this
		socket.onopen = function (ev) {
			// console.log('[open] Connection established')
			self.connectTryN = 0
			// console.log('Sending to server')

			// Empty the queue by sending queued messages.
			while (self.queue.length > 0) {
				let msg = self.queue.shift()
				// console.log('msg from queue:', msg)
				socket.send(msg)
			}

			// Make sure we only add this listener once after a successful connection.
			window.addEventListener(
				'beforeunload',
				() => {
					console.log('Browser window is closing, closing WebSocket.')
					socket.close(1000, 'Window closing') // Use standard WebSocket close code 1000 for normal closure.
				},
				{ once: true }
			)
		}
		socket.onclose = function (ev) {
			console.log(ev.wasClean ? 'Disconnected' : 'Connection break: ' + ev.code + ' ' + ev.reason)
			// if (!ev.wasClean ) {
			// 	if (this.keepAliveQ) self.attemptReconnect()
			// }
		}
		socket.onmessage = function (ev) {
			//console.log('RECV:', ev.data)
			let data
			try {
				data = JSON.parse(ev.data)
			} catch (err) {
				data = {}
				//console.log('socket message error:', err);
			}
			self.msgRcv(data)
		}
		socket.onerror = function (err) {
			console.log('Socket Error ' + err.message)
			if (self.keepAliveQ) self.attemptReconnect()

			// either it has a mainMsg function or is an iframe that we need to postMessage to
			if (typeof mainMsg === 'function') mainMsg({ msg: 'nosocket' })
			main.iframes.forEach((iframe) => {
				iframe.postMessage({ msg: 'nosocket' }, '*')
			})
		}
		this.socket = socket
		// console.log('socket running:' + this.socket)
	}

	attemptReconnect() {
		this.connectTryN++

		// Delay times for each reconnect attempt.
		let delays = [
			{ tm: 1, txt: '', why: 'unused' },
			{ tm: 5, txt: '', why: 'net glitch' },
			{ tm: 30, txt: '', why: 'server restart' },
			{ tm: 120, txt: '', why: 'bad server restart' },
			{ tm: 600, txt: '', why: 'one last try' },
		]

		if (this.connectTryN < delays.length) {
			let delay = delays[this.connectTryN].tm
			console.log(`retry connection ${this.connectTryN} at ${fmtTm(new Date())} after ${delay}s`)
			setTimeout(() => this.connect(), delay * 1000)
		} else {
			// Handle the case when all reconnect attempts fail.
			// For example, show a reconnect failure message to the user.
		}
	}

	msgRcv(data) {
		//console.log('msgRcv', JSON.stringify(data).substring(0, 200))
		// this.histAdd('msgRcv:' + JSON.stringify(data))
		switch (data.msg) {
			case 'usergood': {
				this.histAdd('Login success!')
				this.userSet('stamp', data.stamp)
				this.userSet('stampWhen', new Date())

				let row = data
				let props = { grp: row.grp, usertype: row.usertype, regdate: row.regdate, lastdate: row.lastdate, merits: row.merits, qCount: row.qCount, achieveCount: row.achieveCount, qScore: row.qScore, lastQs: row.lastQs, failQs: row.failQs, mentor: row.mentor }
				console.log('row', row)
				for (let key in row) {
					if (row.hasOwnProperty(key)) {
						// Check if the property is directly on the row object
						this.userSet(key, row[key])
					}
				}
				loginPrompt()
				loginHide()
				break
			}

			case 'usernew': {
				this.histAdd('New User success!')
				this.userSet('stamp', data.stamp)

				let date = new Date()
				let now = date.toISOString()
				let props = { grp: '', regdate: now, lastdate: now, merits: 0, qCount: 0, achieveCount: 0, qScore: 0, lastQs: '', failQs: '', mentor: '' }
				console.log('props', props)
				for (let key in props) {
					if (props.hasOwnProperty(key)) {
						this.userSet(key, props[key])
					}
				}
				loginPrompt()
				loginHide()
				break
			}

			case 'userchg':
				this.userSet('stamp', data.stamp)
				loginMsg('Change successful!')
				//loginHide()
				break

			case 'usertaken':
				loginMsg('User taken')
				this.userSet('stamp', '')
				break

			case 'userinvalid':
			case 'passinvalid':
				loginMsg('User or Password invalid')
				this.userSet('stamp', '')
				break

			case 'userfail':
				loginMsg('Incorrect name or password')
				this.userSet('stamp', '')
				break

			case 'usernot':
				loginMsg('No such user')
				break

			default:
				// either it has a mainMsg function or is an ifram that we need to postMessage to
				if (typeof mainMsg === 'function') mainMsg(data)
				main.iframes.forEach((iframe) => {
					iframe.postMessage(data, '*')
				})
		}

		// this lets other code on page also receive socket messages (safe?)
		// console.log('fdhfdhfs',typeof mainMsg === 'function')
		// if (typeof mainMsg === 'function') mainMsg(data)

		// const iframes = document.querySelectorAll('iframe');

		// // Loop through them
		// iframes.forEach((iframe) => {
		// 	// Do something with each iframe, like logging its src attribute
		// 	console.log(`Iframe src: ${iframe.src}`, iframe);
		// });
	}
	userSet(name, val) {
		localStorage.setItem(`user.${name}`, val)
		console.log('userSet', name, val)
	}

	histAdd(s) {
		console.log('hist', s.substring(0, 200))
		this.lines = this.lines.slice(Math.max(this.lines.length - 4, 0))
		this.lines.push(s)
	}

	login(name, pass) {
		//my.sttTime = performance.now()
		let data = { msg: 'login', name: name, pass: pass }
		this.send(JSON.stringify(data))
		this.histAdd('login: ' + JSON.stringify(data))
	}
	loginNew(name, pass) {
		let data = { msg: 'loginNew', name: name, pass: pass }
		this.send(JSON.stringify(data))
		this.histAdd('loginNew: ' + JSON.stringify(data))
	}
	loginPassChg(name, passOld, passNew) {
		let data = { msg: 'loginPassChg', name: name, passOld: passOld, passNew }
		this.send(JSON.stringify(data))
		console.log('loginPassChg: ' + JSON.stringify(data))
	}
	passHash(pass) {
		return '#' + pass + '#'
	}
}

themeSet(themeGet()) // can do before window loaded?
window.onload = mainDo

main.cache = {
	set: function (key, value, ttl) {
		const expire = new Date().getTime() + ttl * 1000
		const item = { value, expire }
		// Serialize the item to JSON and store in localStorage with the key
		console.log('cache set', item)
		localStorage.setItem('cache.' + key, JSON.stringify(item))
	},
	get: function (key) {
		const itemStr = localStorage.getItem('cache.' + key)
		console.log('cache get', itemStr.substring(0, 80))
		if (!itemStr) {
			return null
		}
		const item = JSON.parse(itemStr)
		return item.value
	},
	isOK: function (key) {
		const itemStr = localStorage.getItem('cache.' + key)
		if (!itemStr) {
			return false
		}
		const item = JSON.parse(itemStr)
		const currentTime = new Date().getTime()
		console.log('cache isOK', currentTime, item.expire, currentTime < item.expire)
		if (currentTime < item.expire) {
			return true
		} else {
			// If the item is expired, remove it from localStorage
			localStorage.removeItem(key)
			return false
		}
	},
}