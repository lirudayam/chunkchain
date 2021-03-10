// Our interfaces for chats
// using short codes to decrease network traffic and RAM consumption
const oChatInterface = {
  s: "", // s - sender
  r: "", // r - recipient
  m: "", // m - message
  c: 0, // c - coins
  t: 0, // t - unix timestamp
  h: "", // h - hash,
  b: false, // b - encrypted
};

const oBlockInterface = {
  h: "", // h - hash
  p: "", // p - previous block
  t: 0, // t - time
  n: 0, // n - nonce
  b: 0, // b - block_index
  r: "", // r - miner
  l: [], // l - list of transactions
};

// Enums for types of messages
const oMsgKeys = {
  A: "Outgoing message into unconfirmed transactions",
  B: "New block found",
  C: "Copy of blockchain",
  N: "Announce nickname",
  S: "Shared nickname dictionary",
  "M+": "New miner",
  "M-": "Participant stops mining",
};
const oBadges = {
  L2: "Blockchain-Kenner Abzeichen",
  L5: "Blockchain-Experte Abzeichen",
};
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
  var min = "A".charCodeAt(0);
  var max = "Z".charCodeAt(0);
  var factor = 13;
  var result = "";
  sStr = sStr.toUpperCase();

  for (var i = 0; i < sStr.length; i++) {
    result += re.test(sStr[i])
      ? String.fromCharCode(
          ((sStr.charCodeAt(i) - min + factor) % (max - min + 1)) + min
        )
      : sStr[i];
  }

  return result;
}

function _reverse(sStr) {
  return sStr.split("").reverse().join("");
}

const caesarShift = function (str, amount) {
    // Wrap the amount
    if (amount < 0) {
      return caesarShift(str, amount + 26);
    }
  
    // Make an output variable
    var output = "";
  
    // Go through each character
    for (var i = 0; i < str.length; i++) {
      // Get the character we'll be appending
      var c = str[i];
  
      // If it's a letter...
      if (c.match(/[a-z]/i)) {
        // Get its code
        var code = str.charCodeAt(i);
  
        // Uppercase letters
        if (code >= 65 && code <= 90) {
          c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
        }
  
        // Lowercase letters
        else if (code >= 97 && code <= 122) {
          c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
        }
      }
  
      // Append
      output += c;
    }
  
    // All done!
    return output;
}

/**
 * Vignere Cipher Algorithm
 */

/**
 * Check if the Character is letter or not
 * @param {String} str - character to check
 * @return {object} An array with the character or null if isn't a letter
 */
function isLetter (str) {
  return str.length === 1 && str.match(/[a-zA-Z]/i)
}

/**
 * Check if is Uppercase or Lowercase
 * @param {String} character - character to check
 * @return {Boolean} result of the checking
 */
function isUpperCase (character) {
  if (character === character.toUpperCase()) {
    return true
  }
  if (character === character.toLowerCase()) {
    return false
  }
}

/**
 * Encrypt a Vigenere cipher
 * @param {String} message - string to be encrypted
 * @param {String} key - key for encrypt
 * @return {String} result - encrypted string
 */
const vignereEncrypt = (message, key) => {
  let result = ''

  for (let i = 0, j = 0; i < message.length; i++) {
    const c = message.charAt(i)
    if (isLetter(c)) {
      if (isUpperCase(c)) {
        result += String.fromCharCode((c.charCodeAt(0) + key.toUpperCase().charCodeAt(j) - 2 * 65) % 26 + 65) // A: 65
      } else {
        result += String.fromCharCode((c.charCodeAt(0) + key.toLowerCase().charCodeAt(j) - 2 * 97) % 26 + 97) // a: 97
      }
    } else {
      result += c
    }
    j = ++j % key.length
  }
  return result
}

/**
 * Decrypt a Vigenere cipher
 * @param {String} message - string to be decrypted
 * @param {String} key - key for decrypt
 * @return {String} result - decrypted string
 */
const vignereDecrypt = (message, key) => {
  let result = ''

  for (let i = 0, j = 0; i < message.length; i++) {
    const c = message.charAt(i)
    if (isLetter(c)) {
      if (isUpperCase(c)) {
        result += String.fromCharCode(90 - (25 - (c.charCodeAt(0) - key.toUpperCase().charCodeAt(j))) % 26)
      } else {
        result += String.fromCharCode(122 - (25 - (c.charCodeAt(0) - key.toLowerCase().charCodeAt(j))) % 26)
      }
    } else {
      result += c
    }
    j = ++j % key.length
  }
  return result
}

function stringToArrayBuffer(str){
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function arrayBufferToString(str){
    var byteArray = new Uint8Array(str);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCodePoint(byteArray[i]);
    }
    return byteString;
}

function getPrivateKey(sBugoutAddress) {
  return _reverse(_rot13(sBugoutAddress)).toLowerCase();
}

var JsonFormatter = {
  stringify: function (cipherParams) {
    // create json object with ciphertext
    var sOutputString =
      cipherParams.ciphertext.toString(CryptoJS.enc.Base64) + "#";
    sOutputString += cipherParams.iv.toString() + "#";
    sOutputString += cipherParams.salt.toString();

    return sOutputString;
  },
  parse: function (jsonStr) {
    var aArray = jsonStr.split("#");
    var jsonObj = {
      ct: aArray[0],
      iv: aArray[1],
      s: aArray[2],
    };

    // extract ciphertext from json object, and create cipher params object
    var cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(jsonObj.ct),
    });

    // optionally extract iv or salt

    if (jsonObj.iv) {
      cipherParams.iv = CryptoJS.enc.Hex.parse(jsonObj.iv);
    }

    if (jsonObj.s) {
      cipherParams.salt = CryptoJS.enc.Hex.parse(jsonObj.s);
    }

    return cipherParams;
  },
};

function decryptMsg(oTx) {
  if (oTx.b) {
    var sKey = oTx.s === publicAddress ? oTx.r : publicAddress;
    var decrypted = CryptoJS.AES.decrypt(oTx.m, sKey, {
      format: JsonFormatter,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  return oTx.m;
}

// Functions to encrypt our messages and to decrypt them
function createTxHash(oChat, sPrivateKey) {
  oChat.t = moment().valueOf();
  var sComboundString = oChat.s + oChat.r + oChat.m + oChat.c + oChat.t;
  var sHashString = CryptoJS.enc.Hex.stringify(
    CryptoJS.SHA1(sComboundString.toString())
  );

  // sign the hash with the private key
  oChat.h = CryptoJS.AES.encrypt(sHashString, sPrivateKey).toString();

  return oChat;
}

function verifyTx(oChat) {
  var sComboundString = oChat.s + oChat.r + oChat.m + oChat.c + oChat.t;

  // simulate an asymmetric encyrption
  var sPrivatePersonKey = getPrivateKey(oChat.s);

  var sEncryptCombound = CryptoJS.enc.Hex.stringify(
    CryptoJS.SHA1(sComboundString.toString())
  );
  return (
    CryptoJS.AES.decrypt(oChat.h, sPrivatePersonKey).toString(
      CryptoJS.enc.Utf8
    ) === sEncryptCombound && oChat.t < moment().valueOf()
  );
}

// Functions to create a block
function startNewBlock() {
  oBlock = null;
  oBlock = Object.assign({}, oBlockInterface);
  oBlock.l = [];
  oBlock.b = aBlockchain.length;
  if (aBlockchain.length > 0) {
    oBlock.p = aBlockchain[aBlockchain.length - 1].h;
  } else {
    oBlock.p = "";
  }
  oBlock.r = publicAddress;
}

function simulateBlockHashCalculation(oBlock) {
  var sComboundString = oBlock.l.map((tx) => tx.h).join("");

  // replace this soon with the real previous block
  sComboundString += oBlock.p;
  sComboundString += oBlock.t;
  sComboundString += oBlock.r;
  sComboundString += oBlock.n;

  return CryptoJS.SHA1(sComboundString).toString();
}

function verifyBlock(oBlock) {
  var sComboundString = oBlock.l.map((tx) => tx.h).join("");

  // replace this soon with the real previous block
  sComboundString += oBlock.p;
  sComboundString += oBlock.t;
  sComboundString += oBlock.r;
  sComboundString += oBlock.n;

  return oBlock.h === CryptoJS.SHA1(sComboundString).toString();
}

function calculateBlockHash(oBlock, nonce) {
  var sComboundString = oBlock.l.map((tx) => tx.h).join("");

  // replace this soon with the real previous block
  sComboundString += oBlock.p;
  sComboundString += oBlock.t;
  sComboundString += oBlock.r;
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
    if (
      bMining &&
      oBlock.l.length > 3 &&
      hash.substr(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      oBlock.t = moment().valueOf();
      nonce++;
      fnScope.nonceInputPoW = nonce;
      hash = calculateBlockHash(oBlock, nonce);

      if (hash.substr(0, difficulty) === Array(difficulty + 1).join("0")) {
        oBlock.h = hash;
        oBlock.n = nonce;

        fnScope.token += 5; // give 5 tokens as reward
        b.send("B" + JSON.stringify(oBlock));
        //aBlockchain.push(oBlock);
        startNewBlock();
        clearInterval(oMiningIntervalCaller);
        return nonce;
      }
    }
  };
  oMiningIntervalCaller = setInterval(miningFn, 50);
}

const shareAccomplishment = (sKey) => {
  fnScope.highestAchievement = sKey;
  b.send(
    "U" +
      JSON.stringify({
        k: sKey,
      })
  );
};

// supporting functions
function getNickname(sAddress) {
  if (oNickNames.hasOwnProperty(sAddress)) {
    return oNickNames[sAddress];
  }
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
    "ws://192.168.178.71:8000",
    /*'wss://hub.bugout.link',
  		'wss://tracker.openwebtorrent.com',
		'wss://tracker.webtorrent.io',
		'ws://tracker.sloppyta.co',
		'wss://tracker.files.fm'*/
    //'wss://webrtc-tracker.cfapps.eu10.hana.ondemand.com:443'
  ],
  seed: localStorage["bugout-demo-seed"],
});
localStorage["bugout-demo-seed"] = b.seed;

// Register critical information
const publicAddress = b.address();
const privateKey = getPrivateKey(b.address());

const sUserNickName = prompt("Please choose a nickname", "");

log(b.address());

// Register personal nickname across the network
b.send(
  "N" +
    JSON.stringify({
      k: publicAddress,
      n: sUserNickName,
    })
);
oNickNames[publicAddress] = sUserNickName;

log(privateKey + " [ private key ]");

b.on("seen", function (address) {
  // wait until nickname has arrived
  setTimeout(() => {
    fnScope.newParticipant(getNickname(address));
  }, 1500);

  // send the nickname dicitonary as well
  b.send(address, "S" + JSON.stringify(oNickNames));
});

var previousConnections = 0;

b.on("connections", function (iConnections) {
  // added new connection
  if (iConnections > previousConnections) {
    if (aBlockchain.length > 0) {
      // whenever a new participant joins the entire blockchain will be send
      b.send(
        "C" +
          JSON.stringify({
            b: aBlockchain,
            n: iNumberOfMiners,
          })
      );
    }
  }
  previousConnections = iConnections;
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

      if (oTx.r === publicAddress) {
        if (
          !fnScope.activeConversations
            .map((convo) => convo.name)
            .includes(getNickname(address))
        ) {
          fnScope.activeConversations.push({
            name: getNickname(address),
            lastMsg: moment().unix(),
          });
        }
        var foundIndex = fnScope.activeConversations.findIndex(
          (convo) => convo.name === getNickname(address)
        );
        fnScope.activeConversations[foundIndex].lastMsg = moment().unix();

        // for the counter
        if (
          fnScope.newMessages.hasOwnProperty(getNickname(address)) &&
          fnScope.selectedConversation !== getNickname(address)
        ) {
          fnScope.newMessages[getNickname(address)] += 1;
        } else if (fnScope.selectedConversation !== getNickname(address)) {
          fnScope.newMessages[getNickname(address)] = 1;
        }
        fnScope.noOfNewMessages = Object.values(fnScope.newMessages).reduce(
          (a, b) => a + b,
          0
        );
      } else if (oTx.r === "all") {
        var foundIndex = fnScope.activeConversations.findIndex(
          (convo) => convo.name === "all"
        );
        fnScope.activeConversations[foundIndex].lastMsg = moment().unix();

        // for the counter
        if (
          fnScope.newMessages.hasOwnProperty("all") &&
          fnScope.selectedConversation !== "all"
        ) {
          fnScope.newMessages["all"] += 1;
        } else if (fnScope.selectedConversation !== "all") {
          fnScope.newMessages["all"] = 1;
        }
        fnScope.noOfNewMessages = Object.values(fnScope.newMessages).reduce(
          (a, b) => a + b,
          0
        );
      }

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
      fnScope.blockFound(
        getNickname(address),
        getNickname(address) === sUserNickName,
        oFoundBlock.l.length,
        oFoundBlock.n,
        oFoundBlock.b
      );
    }
  } else if (sFirstLetter === "C") {
    // the new blockchain is there
    var aRecievedBlockchain = JSON.parse(message.substr(1));
    if (aRecievedBlockchain.b.length > aBlockchain.length) {
      // recieved blockchain is greater than one's wn
      if (!aRecievedBlockchain.b.some((block) => !verifyBlock(block))) {
        // all blocks are standalone valid
        aBlockchain = aRecievedBlockchain.b;
        fnScope.msgArrived(true, null);
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
    for (const [sAddress, sRelatedNickName] of Object.entries(
      oNickNameDirectory
    )) {
      if (!oNickNames.hasOwnProperty(sAddress)) {
        // new participant
        if (aBlockchain.length > 0) {
          // whenever a new participant joins the entire blockchain will be send
          b.send(
            sAddress,
            "C" +
              JSON.stringify({
                b: aBlockchain,
                n: iNumberOfMiners,
              })
          );
        }
      }

      oNickNames[sAddress] = sRelatedNickName;
    }
  } else if (message.substr(0, 2) === "M+") {
    // a new miner is registered
    iNumberOfMiners += 1;
  } else if (message.substr(0, 2) === "M-") {
    // a participant stops mining
    iNumberOfMiners -= 1;
  } else if (message.substr(0, 1) === "U") {
    // accomplishment shared
    var oTx = JSON.parse(message.substr(1));
    fnScope.newAccomplishment(getNickname(address), oTx.k);
  } else {
    log(getNickname(address) + ": " + message);
  }
});

const sendMessage = (sMessage, sRecipient, sToken) => {
  var oChat = Object.assign({}, oChatInterface);
  oChat.s = publicAddress;
  if (sRecipient === "all") {
    oChat.r = "all";
    oChat.m = sMessage;
  } else {
    oChat.r = Object.keys(oNickNames).find(
      (key) => oNickNames[key] === sRecipient
    );
    if (fnScope.selection.encryptMessageFlag) {
      oChat.m = CryptoJS.AES.encrypt(sMessage, oChat.r, {
        format: JsonFormatter,
      }).toString();
      oChat.b = true;
    } else {
      oChat.m = sMessage;
    }
  }

  oChat.c = parseInt(sToken, 10);

  var oTx = createTxHash(oChat, privateKey);
  console.log(oTx);
  b.send("A" + JSON.stringify(createTxHash(oChat, privateKey)));

  proofOfWorkMining(2);
};
