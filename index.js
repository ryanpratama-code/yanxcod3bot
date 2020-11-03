const { create, Client } = require('@open-wa/wa-automate')
const welcome = require('./lib/welcome')
const msgHandler = require('./msgHndlr')
const options = require('./options')
const { block } = require('./lib/help')

const start = async (client = new Client()) => {
        console.log('[SERVER] Server Started!')
        // Force it to keep the current session
        client.onStateChanged((state) => {
            console.log('[Client State]', state)
            if (state === 'CONFLICT' || state === 'UNLAUNCHED') client.forceRefocus()
        })
        // listening on message
        client.onMessage((async (message) => {
            client.getAmountOfLoadedMessages()
            .then((msg) => {
                if (msg >= 3000) {
                    client.cutMsgCache()
                }
            })
            msgHandler(client, message)
        }))

        client.onGlobalParicipantsChanged((async (heuh) => {
            await welcome(client, heuh)
            //left(client, heuh)
            }))
        
        client.onAddedToGroup(((chat) => {
            let totalMem = chat.groupMetadata.participants.length
            if (totalMem < 257  ) { 
            	client.sendText(chat.id, `Kalo Mau Nginvit Gua, Izin Sama Owner Bot Dulu Ya Bund\nWa OWNER : 0856-4531-9608 (Ryan Pratama)`).then(() => client.leaveGroup(chat.id)).then(() => client.deleteChat(chat.id))
            } else {
                client.sendText(chat.groupMetadata.id, `Halo Warga Grup *${chat.contact.name}* Terima Kasih Sudah Menginvite Bot Ini, Untuk Melihat Menu Silahkan Ketik *!menu*`)
            }
        }))

        /*client.onAck((x => {
            const { from, to, ack } = x
            if (x !== 3) client.sendSeen(to)
        }))*/

        // listening on Incoming Call
        client.onIncomingCall(( async (call) => {
            await client.sendText(call.peerJid, block)
            .then(() => client.contactBlock(call.peerJid, block))
        }))
    }

create('BarBar', options(true, start))
    .then(client => start(client))
    .catch((error) => console.log(error))