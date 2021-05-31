<p align="center">
	<img src="assets/ChunkChain_Logo.svg" width="50%" />
</p>


Chunkchain is a free and open-source blockchain simulation tool. It is designed to support any lectures in lower and higher education related to blockchain or distributed ledger technology. Since hands-on learning experiences are crucial for developed a more in-depth understanding, this tool showcases the technology of distributed ledgers in a varity of use cases.

Its objectives are:

* see some use cases how blockchain works
* easy simple exchange of protocols or the methods
* get a profound understanding what happens in the background
* see opportunities and potentials to start working on own idea

## Use Case: The Chat Platform

The chat platform based on a distributed P2P network enables getting more understanding of the different layers of blockchain. By enabling single 1:1 chats with messages, in the background, it shall be possible to see how transaction speed relies on the selected consensus mechanism and how you can buy yourself your messages.

* Type of blockchain: Public blockchain
* Consensus mechanism: Proof-of-Work

## Setup Guide

This application is very flexible from design perspective. There is no installation mandatory. Make sure that WebRTC is activated in every participating browser.

### Option 1: Using public STUN servers

In logic.js there are at the command of Bugout announce, freely available STUN servers listed (search for "wss://" in the document).

**Attention:** This list could deprecate over time and some public servers may not be available anymore!

With this, you only need to:

* distribute the code of this entire folder to all participants
* let each user run the index.html file

Alternatively, you can set up an own web server where you host these files and provide the link to the index.html

### Option 2: Run your own WebTorrent

While the freely accessible web torrents (STUN servers) can be sometimes reasonably slow, you can setup your own web torrent on your local maschine.

I've used this web torrent: https://github.com/webtorrent/bittorrent-tracker.

You can then expose this to your local network by either port opening or you use "ngrok http 8000", to create an ngrok link (https://ngrok.com).

Nonetheless, you need to manually add the address to your torrent in the logic.js. Search for "wss://" in the document and replace the existing array entries with your torrent address.

With this, you only need to:

* distribute the code of this entire folder to all participants
* let each user run the index.html file

Alternatively, you can set up an own web server where you host these files and provide the link to the index.html
