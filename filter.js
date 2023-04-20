"use strict";

const filterModule = (() => {
	const postIdentifier = "div[data-pagelet^='FeedUnit_']";
	const commentSectionBreak = 'div.xzueoph';
	const sponsored = '<span class="b6zbclly myohyog2 l9j0dhe7 aenfhxwr l94mrbxd ihxqhq3m nc684nl6 t5a262vz sdhka5h4">';
	let skipComments = true;
	let keywords = [];

	async function grabKeywords() {
		await chrome.storage.local.get(["toxicKeywords"], (data) => {
			if (data.toxicKeywords) {
				keywords = data.toxicKeywords;
			}
		});
	}

	function filterPosts() {
		const posts = document.querySelectorAll(postIdentifier);
		const numberOfPosts = posts.length;
		const toxicWords = keywords.slice();
		const toxicWordsSize = toxicWords.length;
		if (toxicWordsSize > 0) {
			for (let i = 0; i < numberOfPosts; i++) {
				let postInnerText = posts[i].innerText.toLowerCase();
				let postInnerHTML = posts[i].innerHTML.split(sponsored);
				let postLabel = postInnerHTML.map((letter) => letter[0]).join('').toLowerCase();
				let commentSection = posts[i].querySelector(commentSectionBreak);
				if (skipComments && commentSection) {
					let commentSectionInnerText = commentSection.innerText.toLowerCase();
					postInnerText = postInnerText.replace(new RegExp(commentSectionInnerText , "g"), "");
					postInnerText = postInnerText.replace(/(\r\n|\n|\r)/gm, " ");
				}
				for (let k = 0; k < toxicWordsSize; k++) {
					let toxic = toxicWords[k].split("|");
					if (toxic[1] === "T") {
						if (toxic[0] === "sponsored") {
							if (posts[i].innerHTML.toLowerCase().includes("suggested for you") || postLabel.includes("sponsored")) {
								console.log(`found: ${toxic[0]}\npost content: ${postInnerText}`);
								posts[i].remove();
								return true;
							}
						}
						else if (postInnerText.split(" ").includes(toxic[0])) {
							console.log(`found: ${toxic[0]}\npost content: ${postInnerText}`);
							posts[i].remove();
							return true;
						}
					}
				}
			}
		}
		return false;
	}


	return {
		filterPosts,
		grabKeywords,
	};
})();

function cleanFeed() {
	let found = filterModule.filterPosts();
	if (found) {
		cleanFeed();
	} else {
		setTimeout(cleanFeed, 1000);
	}
}


filterModule.grabKeywords();
cleanFeed();

chrome.storage.onChanged.addListener((changes) => {
	if (changes.hasOwnProperty("toxicKeywords")) {
		filterModule.grabKeywords();
	}
});