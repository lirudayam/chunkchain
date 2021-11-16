<p align="center">
	<img src="assets/ChunkChain_Logo.svg" width="50%" />
</p>

# English (German below)

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


# Deutsch

Chunkchain ist ein freies und quelloffenes Blockchain-Simulationstool. Es wurde entwickelt, um den Unterrichte repsektive Vorlesungen in der unteren und höheren Bildung im Zusammenhang mit Blockchain oder Distributed-Ledger-Technologie zu unterstützen. Da praktische Lernerfahrungen für die Entwicklung eines tieferen Verständnisses entscheidend sind, zeigt dieses Tool die Technologie der verteilten Ledger in einer Vielzahl von Anwendungsfällen.

Ziele sind:

* einige Anwendungsfälle sehen, wie Blockchain funktioniert
* einfacher Austausch von Protokollen oder Methoden
* ein tiefes Verständnis dafür zu bekommen, was im Hintergrund passiert
* Möglichkeiten und Potenziale erkennen, um mit der Arbeit an eigenen Ideen zu beginnen

## Anwendungsfall: Die Chat-Plattform

Die Chat-Plattform, die auf einem verteilten P2P-Netzwerk basiert, ermöglicht ein besseres Verständnis der verschiedenen Schichten der Blockchain. Durch die Aktivierung einzelner 1:1-Chats mit Nachrichten im Hintergrund, soll es möglich sein, zu sehen, wie die Transaktionsgeschwindigkeit von dem gewählten Konsensmechanismus abhängt und wie man sich seine Nachrichten kaufen kann.

* Art der Blockchain: Öffentliche Blockchain
* Konsensmechanismus: Proof-of-Work

## Anleitung zur Einrichtung

Diese Anwendung ist vom Design her sehr flexibel. Es ist keine Installation erforderlich. Stellen Sie sicher, dass WebRTC in jedem teilnehmenden Browser aktiviert ist.

### Option 1: Verwendung öffentlicher STUN-Server

In logic.js sind auf Befehl von Bugout announce, frei verfügbare STUN-Server aufgelistet (Suche nach "wss://" im Dokument).

**Achtung:** Diese Liste könnte mit der Zeit veraltet sein und einige öffentliche Server könnten nicht mehr verfügbar sein!

Damit müssen Sie nur noch:

* den Code dieses gesamten Ordners an alle Teilnehmer verteilen
* jeden Benutzer die Datei index.html ausführen zu lassen

Alternativ können Sie auch einen eigenen Webserver einrichten, auf dem Sie diese Dateien hosten und den Link zur index.html bereitstellen

### Option 2: Betreiben Sie Ihren eigenen WebTorrent

Während die frei zugänglichen WebTorrents (STUN-Server) manchmal recht langsam sein können, können Sie Ihren eigenen WebTorrent auf Ihrer lokalen Maschine einrichten.

Ich habe diesen WebTorrent verwendet: https://github.com/webtorrent/bittorrent-tracker.

Sie können diesen dann für Ihr lokales Netzwerk freigeben, indem Sie entweder einen Port öffnen oder "ngrok http 8000" verwenden, um einen ngrok-Link zu erstellen (https://ngrok.com).

Dennoch müssen Sie die Adresse manuell in der logic.js zu Ihrem Torrent hinzufügen. Suchen Sie im Dokument nach "wss://" und ersetzen Sie die vorhandenen Array-Einträge durch Ihre Torrent-Adresse.

Damit müssen Sie nur noch:

* den Code des gesamten Ordners an alle Teilnehmer verteilen
* jeden Benutzer die Datei index.html ausführen lassen

Alternativ können Sie auch einen eigenen Webserver einrichten, auf dem Sie diese Dateien hosten und den Link zur index.html bereitstellen
