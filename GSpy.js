

class GSpy {
	constructor() {
		this.watchingNodesCount = 0;
		this.loadingTarget = null;
		this.watchTargetInNode = this.watchTargetInNode.bind(this);
		this.addWatcherToNode = this.addWatcherToNode.bind(this);
		this.saveLodingTargetSrc = this.saveLodingTargetSrc.bind(this);
		this.deleteNavs = this.deleteNavs.bind(this);
		this.handleDOMNodeInserted = this.handleDOMNodeInserted.bind(this);
		this.handleImageClick = this.handleImageClick.bind(this);
		this.addItemIdClick = this.addItemIdClick.bind(this);
		this.start = this.start.bind(this);

		this.parseThumbnail = this.parseThumbnail.bind(this);
		this.parseLgImage = this.parseLgImage.bind(this);
	}
	start() {
		this.deleteNavs(document);
		this.addItemIdClick(document);
		document.body.addEventListener('DOMNodeInserted', this.handleDOMNodeInserted);
	}
	handleDOMNodeInserted(e) {
		//watch new large src
		this.addWatcherToNode(e.target);
		
		//watch new small images -> add click listner
		if(e.target.querySelectorAll) {
			this.addItemIdClick(e.target);
		}
	}
	saveLodingTargetSrc(src) {
		console.log('saveLodingTargetSrc: ',src, this.loadingTarget);
		if(!this.loadingTarget) return;
		
		this.loadingTarget = null;
		this.watchingNodesCount = 0;
		
		var iframe = document.createElement('IFRAME');
		iframe.setAttribute('src', 'js-frame:GSpy:' + src);
		// For some reason we need to set a non-empty size for the iOS6 simulator...
		iframe.setAttribute('height', '1px');
		iframe.setAttribute('width', '1px');
		document.documentElement.appendChild(iframe);
		iframe.parentNode.removeChild(iframe);
		iframe = null;
	}
	deleteNavs(node) {
		let ids = ['qslc', 'navd', 'sfcnt', 'before-appbar', 'topstuff', 'taw'];
		for (var i = 0; i < ids.length; i++) {
			const el = node.getElementById(ids[i]);
			if(el) {
				el.remove();
			}
		}
	}

	parseThumbnail(node) {
		while(node) {
				if(node.tagName === 'a') {
						const id = new URLSearchParams(node.search).get('tbnid');
						if(id) 
								return id;
				}
				node = node.parentNode;
		}
	}
	parseLgImage(node) {
			while(node) {
					if(node.dataset && node.dataset['itemId']) {
							return node.dataset['itemId'];
					}
					node = node.parentNode;
			}
	}


	addItemIdClick(node) {
		const allImgs = node.querySelectorAll('.rg_ic');
		for(const img of allImgs) {
			img.addEventListener('click', this.handleImageClick);
		}
	}
	handleImageClick(e) {
		const id = this.parseThumbnail(e.target);
		if(id) {
			this.loadingTarget = id;
			this.watchingNodesCount = 0;
			console.log('handleImageClick: ', id);
		} else {
			console.error('handleImageClick: no id in parrent of ', e.target)
		}
	}
	addWatcherToNode(node) {
		if(!node || !node.getElementsByTagName) return;
		
		this.watchingNodesCount++;
		// console.log('addWatcherToNode: ',node);
		this.watchTargetInNode(node)
	}
	watchTargetInNode(node,iter) {
		if(!iter)
			iter=0;
		console.log('watchingNodesCount: '+this.watchingNodesCount);
		if(iter < 100 && node.className === 'irc_mi') {
			const src = node.src;
			if(!src) {
				//waiting for src attribute
				setTimeout(
									function(){
									this.watchTargetInNode(node,iter+1);
									}.bind(this),30
									);
			} else {
				//this new dom element with src. check id of container
				let parentNode = node;
				while(parentNode.parentNode) {
					if(parentNode.dataset['itemId'] === this.loadingTarget) {
						console.log('save src of loadingTarget');
						this.saveLodingTargetSrc(src);
						break;
					} else {
						parentNode = parentNode.parentNode;
					}
				}
				this.watchingNodesCount--;
			}
		} else {
			console.log('no src with loadingTarget in this node');
			this.watchingNodesCount--;
		}
		if(this.watchingNodesCount <= 0 && this.loadingTarget) {
			console.log('save default base 64');
			this.saveLodingTargetSrc(document.getElementById(this.loadingTarget).src);
		}
	}
}

const SPY = new GSpy();
SPY.start();