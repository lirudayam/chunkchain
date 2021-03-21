startConnection(() => {
	// Register personal nickname across the network
	b.send(
		oMessageTypes.ANNOUNCE_NICKNAME +
		JSON.stringify({
			k: publicAddress,
			n: sUserNickName,
		})
	);

	const aWelcome = [
		"Hey",
		"Hallo",
		"Na, wie gehts?",
		"Herzlich willkommen hier!",
		"Hej, ich bin Bob the Bot",
		"Alles klar?",
		"Ich bin ein Roboter",
		"Hola!",
		"Viel Spass hier.",
	];

	const aRandomMsg = [
		"Hallo",
		"Alles klar?",
		"Wie geht's so?",
		"Alles gucci?",
		"Spam",
		"Test",
		"123",
		"Ist da jemand?",
		"Voll spannend",
		"Ich bin ein Bot",
		"Frankreich hat die längste Grenze mit Brasilien",
		"P2P-Netzwerke sind cool",
		"Ich suche gerade nach Blöcken und ihr?",
		"Hashes sind genial",
		"Blockchains sind super interessant",
		"Mal nicht WhatsApp vertrauen ;-)",
		"Cherophobie ist die Angst vor Spaß",
		"Pinguine sind cool",
		"Schnecken haben 4 Nasen",
		"Proof-of-Work ist ein Konsensmechanisumus",
		"Konsens heisst sich auf ein Stück Daten zu einigen",
		"Blockchains sind vorallem für Lieferketten gut",
		"Interne Produktionen brauchen keine Blockchains",
		"Blockchains helfen, wenn man sich nicht immer vertrauen kann",
		"Maximale Redudanz",
		"ABC",
		"Hashes werden sowohl für Datenbanken als auch Blockchains benötigt",
		"Asymetrische Verschlüsselung ist cool",
		"Blockchains sind leider super teuer",
		"BTC to the moon",
		"ETH to the moon",
		"Bitcoin ist im Vergleich zum Euro super international handelbar",
		"Die Kette entsteht durch die Referenz",
		"Proof-of-Work ist leider überhaupt nicht umweltfreundlich",
		"Es gibt über 11'000 Blockchain Startups",
		"Blockchain speichert immer Transaktionen ab",
		"Es gibt so viele neue Blockchains inzwischen",
		"Blockchains sind immer noch langsamer als klassische Datenbanken",
	];

	const getRandomFromArray = (array) => {
		return array[Math.floor(Math.random() * array.length)];
	};

	// recognize own nickname in dictionary
	oNickNames[publicAddress] = sUserNickName;

	// for new participants, share all nicknames one peer knows
	b.on("seen", function (address) {
		// wait until nickname has arrived
		setTimeout(() => {
			fnScope.newParticipant(getNickname(address));
		}, 1500);

		// simulate a welcome message
		setTimeout(() => {
			sendBotMessage(address, getRandomFromArray(aWelcome));
		}, 5000 + Math.round(Math.random() * 3000));

		// send the nickname dicitonary as well
		b.send(address, oMessageTypes.NICKNAME_DICT + JSON.stringify(oNickNames));
	});

	// helper variable for tracking active number of connections
	var previousConnections = 0;
	b.on("connections", function (iConnections) {
		// added new connection
		if (iConnections > previousConnections) {
			if (aBlockchain.length > 0) {
				// whenever a new participant joins the entire blockchain will be send
				iNumberOfMiners += 1;
				b.send(
					"C" +
					JSON.stringify({
						b: aBlockchain,
						n: iNumberOfMiners,
					})
				);
			}
			setTimeout(() => {
				sendBotMessage("all", getRandomFromArray(aWelcome));
			}, 3500 + Math.round(Math.random() * 3000));
		}
		previousConnections = iConnections;
	});

	// delete nickname and miner when peer leaves
	b.on("left", function (address) {
		sendBotMessage(
			"all",
			"Schade, dass " + getNickname(address) + " verschwunden ist."
		);
		fnScope.participantLeft(getNickname(address));
		iNumberOfMiners -= 1;

		delete oNickNames[address];
	});

	// delay to send random message to network
	var oSpamTimeout;

	b.on("message", function (address, message) {
		// check what message came in
		var sFirstLetter = message.substr(0, 1);
		if (sFirstLetter === oMessageTypes.OUTGOING_UNCONFIRMED) {
			var oTx = JSON.parse(message.substr(1));
			if (oTx.s === address) {
				// new unconfirmed transaction arrived
				oBlock.l.push(oTx);
				fnScope.newMessage(getNickname(address), oTx.t);

				// if participant is also reciever of the message
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

				proofOfWorkMining();

				// schedule a bot message to everyone
				clearInterval(oSpamTimeout);
				oSpamTimeout = setInterval(function () {
					sendBotMessage("all", getRandomFromArray(aRandomMsg));
				}, 7000 + Math.round(Math.random() * 7000));
			}
		} else if (sFirstLetter === oMessageTypes.NEW_BLOCK) {
			// new block arrived
			var oFoundBlock = JSON.parse(message.substr(1));
			if (verifyBlock(oFoundBlock)) {
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
		} else if (sFirstLetter === oMessageTypes.COPY_BLOCKCHAIN) {
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
		} else if (sFirstLetter === oMessageTypes.ANNOUNCE_NICKNAME) {
			// a new user is there
			var oNickNameObject = JSON.parse(message.substr(1));
			oNickNames[oNickNameObject.k] = oNickNameObject.n;
		} else if (sFirstLetter === oMessageTypes.NICKNAME_DICT) {
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
							oMessageTypes.COPY_BLOCKCHAIN +
							JSON.stringify({
								b: aBlockchain,
								n: iNumberOfMiners,
							})
						);
					}
				}

				oNickNames[sAddress] = sRelatedNickName;
			}
		} else if (message.substr(0, 2) === oMessageTypes.NEW_MINER) {
			// a new miner is registered
			iNumberOfMiners += 1;
		} else if (message.substr(0, 2) === oMessageTypes.REMOVE_MINER) {
			// a participant stops mining
			iNumberOfMiners -= 1;
		} else if (message.substr(0, 1) === oMessageTypes.ACCOMPLISHMENT) {
			// accomplishment shared
			var oTx = JSON.parse(message.substr(1));
			fnScope.newAccomplishment(getNickname(address), oTx.k);
		} else {
			log(getNickname(address) + ": " + message);
		}
	});

	const sendBotMessage = (sRecipient, sMessage) => {
		var oChat = Object.assign({}, oChatInterface);
		oChat.s = publicAddress;
		if (sRecipient === "all") {
			oChat.r = "all";
			oChat.m = sMessage;
		} else {
			oChat.r = sRecipient;
			oChat.m = sMessage;
		}

		oChat.c = parseInt(1, 10);

		// share with network
		b.send(
			oMessageTypes.OUTGOING_UNCONFIRMED +
			JSON.stringify(attachTxHash(oChat, privateKey))
		);
	};

	proofOfWorkMining();
});