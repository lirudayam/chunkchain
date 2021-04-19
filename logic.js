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
const oMessageTypes = {
  OUTGOING_UNCONFIRMED: 'A',
  NEW_BLOCK: 'B',
  COPY_BLOCKCHAIN: 'C',
  ANNOUNCE_NICKNAME: 'N',
  NICKNAME_DICT: 'S',
  NEW_MINER: 'M+',
  REMOVE_MINER: "M-",
  ACCOMPLISHMENT: "U"
}

// Available Badges for completion of levels
const oBadges = {
  L2: "Blockchain-Kenner Abzeichen",
  L5: "Blockchain-Experte Abzeichen",
};

// Main Blockchain Object
let aBlockchain = [];

// Active PoW Flag
let bMining = true;

// Estimate of active miners
let iNumberOfMiners = 0;

// Nickname dictionary
let oNickNames = {};

// new empty raw block in the format of the interface
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

function arrayBufferToBase64String(arrayBuffer) {
  var byteArray = new Uint8Array(arrayBuffer)
  var byteString = ''
  for (var i=0; i<byteArray.byteLength; i++) {
    byteString += String.fromCharCode(byteArray[i])
  }
  return btoa(byteString)
}

function textToArrayBuffer(str) {
  var buf = unescape(encodeURIComponent(str)) // 2 bytes for each char
  var bufView = new Uint8Array(buf.length)
  for (var i=0; i < buf.length; i++) {
    bufView[i] = buf.charCodeAt(i)
  }
  return bufView
}

// Functions to encrypt our messages and to decrypt them
function attachTxHash(oChat, sPrivateKey) {
  oChat.t = moment().valueOf();
  // hash over all of the available tx attributes
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

  // check if hashes match and compare timestamps also
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

  // Index of Block
  oBlock.b = aBlockchain.length;

  // Reference to previous block
  if (aBlockchain.length > 0) {
    oBlock.p = aBlockchain[aBlockchain.length - 1].h;
  } else {
    oBlock.p = "";
  }

  // intended miner - only used in case of active mining
  oBlock.r = publicAddress;
}

function _calcBlockHash(oBlock, sNonce) {
  var sComboundString = oBlock.l.map((tx) => tx.h).join("");
  sComboundString += oBlock.p;
  sComboundString += oBlock.t;
  sComboundString += oBlock.r;
  sComboundString += sNonce;
  return CryptoJS.SHA1(sComboundString).toString();
}

function simulateBlockHashCalculation(oBlock) {
  return _calcBlockHash(oBlock, oBlock.n);
}

function verifyBlock(oBlock) {
  return oBlock.h === _calcBlockHash(oBlock, oBlock.n);
}

function calculateBlockHash(oBlock, nonce) {
  return _calcBlockHash(oBlock, nonce);
}

function proofOfWorkMining() {
  var nonce = 0;
  var hash = "";

  if (oMiningIntervalCaller !== null) {
    clearInterval(oMiningIntervalCaller);
  }

  const miningFn = () => {
    // dynamically adjusting the difficulty of leading zeros
    var difficulty = (iNumberOfMiners >= 10 ? 3 : 2);
    if (
      bMining &&
      oBlock.l.length > 2 &&
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
        b.send(oMessageTypes.NEW_BLOCK + JSON.stringify(oBlock));
        
        startNewBlock();
        clearInterval(oMiningIntervalCaller);
        return nonce;
      }
    }
  };
  // dynamic simulated delay of each brute force according to active miners in the network
  oMiningIntervalCaller = setInterval(miningFn, (iNumberOfMiners >= 10 ? 100 : 200));
}

const shareAccomplishment = (sKey) => {
  // set in angular scope
  fnScope.highestAchievement = sKey;

  // share with network
  b.send(
    oMessageTypes.ACCOMPLISHMENT +
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
    b.send(oMessageTypes.NEW_MINER);
  }
}

function stopMining(b) {
  if (bMining === true) {
    bMining = false;
    b.send(oMessageTypes.REMOVE_MINER);
  }
}

let publicAddress, privateKey, b, sUserNickName;

const startConnection = (fnCallback) => {
  // Get connected with our peers via torrent server
  b = Bugout("chunkchain", {
    announce: [
      "wss://9cdae7c77eeb.ngrok.io",
      'wss://hub.bugout.link',
      'wss://tracker.openwebtorrent.com',
      'wss://tracker.webtorrent.io',
      /*'ws://tracker.sloppyta.co',
      'wss://tracker.files.fm'*/
    ],
    seed: localStorage["bugout-demo-seed"]
  });
  localStorage["bugout-demo-seed"] = b.seed;

  // Register critical information
  publicAddress = b.address();
  // derive a simulated private key for the public Bugout address
  privateKey = getPrivateKey(b.address());

  // Register personal nickname across the network
  b.send(
    oMessageTypes.ANNOUNCE_NICKNAME +
      JSON.stringify({
        k: publicAddress,
        n: sUserNickName,
      })
  );

  // recognize own nickname in dictionary
  oNickNames[publicAddress] = sUserNickName;

  fnCallback();
}

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

  // share with network
  b.send(oMessageTypes.OUTGOING_UNCONFIRMED + JSON.stringify(attachTxHash(oChat, privateKey)));

  proofOfWorkMining();
};
