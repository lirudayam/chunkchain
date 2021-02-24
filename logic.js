// Our interfaces for chats
// using short codes to decrease network traffic and RAM consumption
const oChatInterface = {
	s: "", // s - sender
	r: "", // r - recipient
	m: "", // m - message
	c: 0, // c - coins
	t: 0, // t - unix timestamp
	h: "" // h - hash
};

const oBlockInterface = {
	h: "", // h - hash
	p: "", // p - previous block
	t: 0, // t - time
	n: 0, // n - nonce
	b: 0, // b - block_index
	r: "", // r - miner
	l: [] // l - list of transactions
};

// Enums for types of messages
const oMsgKeys = {
	"A": "Outgoing message into unconfirmed transactions",
	"B": "New block found",
	"C": "Copy of blockchain",
	"N": "Announce nickname",
	"S": "Shared nickname dictionary",
	"M+": "New miner",
	"M-": "Participant stops mining"
}
const aKeys = Object.keys(oMsgKeys);

let aBlockchain = [];
let bMining = true;

let iNumberOfMiners = 0;

let oNickNames = {};

var oBlock = Object.assign({}, oBlockInterface);
let oMiningIntervalCaller = null;

// Public-Private Key Simulation functions
// Herefore we simulate that the Bugout Address is the public key
// Hence we pretend some kind of reverse engineering from the public key

function _rot13(sStr) {
	var re = new RegExp("[a-z]", "i");
	var min = 'A'.charCodeAt(0);
	var max = 'Z'.charCodeAt(0);
	var factor = 13;
	var result = "";
	sStr = sStr.toUpperCase();

	for (var i = 0; i < sStr.length; i++) {
		result += (re.test(sStr[i]) ?
			String.fromCharCode((sStr.charCodeAt(i) - min + factor) % (max - min + 1) + min) : sStr[i]);
	}

	return result;
}

function _reverse(sStr) {
	return sStr.split("").reverse().join("");
}

function getPrivateKey(sBugoutAddress) {
	return _reverse(_rot13(sBugoutAddress)).toLowerCase();
}


// Functions to encrypt our messages and to decrypt them
function createTxHash(oChat, sPrivateKey) {
	oChat.t = moment().valueOf();
	var sComboundString = oChat.s + oChat.r + oChat.m + oChat.c + oChat.t;
	var sHashString = CryptoJS.enc.Hex.stringify(CryptoJS.SHA1(sComboundString.toString()));

	// sign the hash with the private key
	oChat.h = CryptoJS.AES.encrypt(sHashString, sPrivateKey).toString();

	return oChat;
}

function verifyTx(oChat) {
	var sComboundString = oChat.s + oChat.r + oChat.m + oChat.c + oChat.t;

	// simulate an asymmetric encyrption
	var sPrivatePersonKey = getPrivateKey(oChat.s);

	var sEncryptCombound = CryptoJS.enc.Hex.stringify(CryptoJS.SHA1(sComboundString.toString()));
	return CryptoJS.AES.decrypt(oChat.h, sPrivatePersonKey).toString(CryptoJS.enc.Utf8) === sEncryptCombound && oChat.t < moment().valueOf();
}

// Functions to create a block
function startNewBlock() {
	oBlock = null;
	oBlock = Object.assign({}, oBlockInterface);
	oBlock.l = [];
}

function verifyBlock(oBlock) {
	var sComboundString = oBlock.l.map((tx) => tx.h).join("");

	// replace this soon with the real previous block
	sComboundString += oBlock.p;
	sComboundString += oBlock.t;
	sComboundString += oBlock.n;

	return oBlock.h === CryptoJS.SHA1(sComboundString).toString();
}

function calculateBlockHash(oBlock, nonce) {
	var sComboundString = oBlock.l.map((tx) => tx.h).join("");

	// replace this soon with the real previous block
	sComboundString += oBlock.p;
	sComboundString += oBlock.t;
	sComboundString += nonce;
	return CryptoJS.SHA1(sComboundString).toString();
}

function proofOfWorkMining(difficulty) {
	var nonce = 0;
	var hash = "";

	if (oMiningIntervalCaller !== null) {
		clearInterval(oMiningIntervalCaller);
	}

	const miningFn = () => {
		if (bMining && oBlock.l.length > 3 && hash.substr(0, difficulty) !== Array(difficulty + 1).join("0")) {
			oBlock.t = moment().valueOf();
			nonce++;
			hash = calculateBlockHash(oBlock, nonce);

			if (hash.substr(0, difficulty) === Array(difficulty + 1).join("0")) {
				fnScope.feedNews.push({
					'type': 'S',
					'nonce': nonce
				});

				oBlock.h = hash;
				oBlock.n = nonce;

				b.send("B" + JSON.stringify(oBlock));
				//aBlockchain.push(oBlock);
				startNewBlock();
				clearInterval(oMiningIntervalCaller);
				return nonce;
			}
		}
	}
	oMiningIntervalCaller = setInterval(miningFn, 50);
}

// supporting functions
function getNickname(sAddress) {
	if (oNickNames.hasOwnProperty(sAddress)) {
		return oNickNames[sAddress]
	};
	return sAddress;
}

function startMining(b) {
	if (bMining === false) {
		bMining = true;
		b.send("M+");
	}
}

function stopMining(b) {
	if (bMining === true) {
		bMining = false;
		b.send("M-");
	}
}

// Get connected with our peers via torrent server
var b = Bugout("chunkchain", {
	announce: [
		'wss://hub.bugout.link',
  		'wss://tracker.openwebtorrent.com'
	]
});

// Register critical information
const publicAddress = b.address();
const privateKey = getPrivateKey(b.address());

const sUserNickName = prompt("Please choose a nickname", "");

log(b.address());

// Register personal nickname across the network
b.send("N" + JSON.stringify({
	k: publicAddress,
	n: sUserNickName
}));
oNickNames[publicAddress] = sUserNickName;

log(privateKey + " [ private key ]");

b.on("seen", function (address) {
	// wait until nickname has arrived
	setTimeout(() => {
		fnScope.newParticipant(getNickname(address));
	}, 1500);

	// send the nickname dicitonary as well
	b.send("S" + JSON.stringify(oNickNames));

	if (aBlockchain.length > 0) {
		// whenever a new participant joins the entire blockchain will be send
		b.send("C" + JSON.stringify({
			b: aBlockchain,
			n: iNumberOfMiners
		}));
	}
});

b.on("left", function (address) {
	fnScope.participantLeft(getNickname(address));

	delete oNickNames[address];
});

b.on("message", function (address, message) {
	console.log(message);

	// check what message came in
	var sFirstLetter = message.substr(0, 1);
	if (sFirstLetter === "A") {

		var oTx = JSON.parse(message.substr(1));
		if (oTx.s === address) {
			// new unconfirmed transaction arrived
			oBlock.l.push(oTx);
			fnScope.newMessage(getNickname(address), oTx.t);

			proofOfWorkMining(2);
		}


	} else if (sFirstLetter === "B") {
		// new block arrived
		var oFoundBlock = JSON.parse(message.substr(1));
		if (verifyBlock(oFoundBlock)) {
			
			// TODO: add it to the blockchain
			oFoundBlock.l.forEach((oTx) => log(getNickname(oTx.s) + ": " + oTx.m));
			if (oMiningIntervalCaller !== null) {
				clearInterval(oMiningIntervalCaller);
			}
			aBlockchain.push(oFoundBlock);
			startNewBlock();
			fnScope.blockFound(getNickname(address), getNickname(address) === sUserNickName, oFoundBlock.l.length, oFoundBlock.n);
		}
	} else if (sFirstLetter === "C") {
		// the new blockchain is there
		var aRecievedBlockchain = JSON.parse(message.substr(1));
		if (aRecievedBlockchain.b.length > aBlockchain.length) {
			// recieved blockchain is greater than one's wn
			if (!(aRecievedBlockchain.b.some(block => !verifyBlock(block)))) {
				// all blocks are standalone valid
				aBlockchain = aRecievedBlockchain.b;
			}

			// recieved number of miners has changes
			if (aRecievedBlockchain.n !== iNumberOfMiners) {
				iNumberOfMiners = aRecievedBlockchain.n;
			}
		}

	} else if (sFirstLetter === "N") {
		// a list of new nicknames arrived
		var oNickNameObject = JSON.parse(message.substr(1));
		oNickNames[oNickNameObject.k] = oNickNameObject.n;
	} else if (sFirstLetter === "S") {
		// a list of new nicknames arrived
		var oNickNameDirectory = JSON.parse(message.substr(1));
		for (const [sAddress, sRelatedNickName] of Object.entries(oNickNameDirectory)) {
			oNickNames[sAddress] = sRelatedNickName;
		}
	} else if (message.substr(0, 2) === "M+") {
		// a new miner is registered
		iNumberOfMiners += 1;
	} else if (message.substr(0, 2) === "M-") {
		// a participant stops mining
		iNumberOfMiners -= 1;
	} else {
		log(getNickname(address) + ": " + message);
	}
});

const sendMessage = (sMessage, sRecipient, sToken) => {
	var oChat = Object.assign({}, oChatInterface);
	oChat.s = publicAddress;
	if (sRecipient === "all") {
		oChat.r = "all";
	}
	else {
		oChat.r = Object.keys(oNickNames).find(key => oNickNames[key] === sRecipient);
	}	
	oChat.m = sMessage;
	oChat.c = parseInt(sToken, 10);

	var oTx = createTxHash(oChat, privateKey);
	console.log(oTx);
	b.send("A" + JSON.stringify(createTxHash(oChat, privateKey)));

	proofOfWorkMining(2);
}

/*
document.getElementById("input").onkeydown = function (ev) {
	if (ev.keyCode == 13) {
		if (b.lastwirecount) {

			var oChat = Object.assign({}, oChatInterface);
			oChat.s = publicAddress;
			oChat.r = "all";
			oChat.m = ev.target.textContent;
			oChat.c = 10;

			var oTx = createTxHash(oChat, privateKey);
			console.log(oTx);
			b.send("A" + JSON.stringify(createTxHash(oChat, privateKey)));

			proofOfWorkMining(2);
			ev.target.textContent = "";
		}
		ev.preventDefault();
	}
}*/