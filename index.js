const Discord = require("discord.js")
require('discord-reply')
const fetch = require('node-fetch')

const song = fetch("https://api.reyfm.de/v4/channel?chn=1")

const client = new Discord.Client()
const config = require("./config.json")

const deleteafter = 20000

const commandcooldown = 2000
const commandRecently = new Set()

const activity = 'ILIKERADIO 🎵!play🎵'
const acttype = "LISTENING"

client.on("error", (ex) => {
    console.error("ERROR " + ex)
})

if (config.debug) {
client.on('debug', console.log)
}
const Enmap = require("enmap");
const radio = require('./radio')
radio(client)
client.settings = new Enmap({
        name: "settings",
      });
      

var fetchUrl = require("fetch").fetchUrl;

const colors = require('colors')
const { truncateSync } = require("fs")

client.on('ready', () => {
        let stateswitch = 0;
        setInterval(() => {
              
                fetchUrl("https://api.reyfm.de/v4/channel?chn=5", function(error, meta, body){
                        if(error) return console.log(error.stack.toString().red)
                        try {
                            var data = JSON.parse(String(body))
                            
                            var songInfo = {
                                name: data.channel.now.title,
                       
                                listeners: data.all_listeners,
                             
                                artist: data.channel.now.artist, 
                                thumbnail: data.channel.now.cover_urls["240x240"],
                                duration: data.channel.now.info.duration,
                                description: data.channel.description,
                                url: String(data.channel.stream_urls.high).replace("//", "/")
                            }
                          
                            
                            if (stateswitch === 0) client.user.setActivity(`${songInfo.name}`, { type: 'LISTENING' }) && stateswitch++;
                            else if (stateswitch === 1) { stateswitch = 0; client.user.setActivity(`Listeners: ${songInfo.listeners}`, { type: "LISTENING" })};


                            console.log(JSON.parse(String(body)));
           
                        } catch (error) {
                            console.log(error.stack.toString().red)
                        }
                })
        }, 10000)

        setInterval(() => {
                fetchUrl("https://api.reyfm.de/v4/channel?chn=5", function(error, meta, body){
                        if(error) return console.log(error.stack.toString().red)
                        try {
                            var data = JSON.parse(String(body))
                            
                            var songInfo = {
                                name: data.channel.now.title,
                       
                                listeners: data.all_listeners,
                             
                                artist: data.channel.now.artist, 
                                thumbnail: data.channel.now.cover_urls["240x240"],
                                duration: data.channel.now.info.duration,
                                description: data.channel.description,
                                url: String(data.channel.stream_urls.high).replace("//", "/")
                            }
                console.log(songInfo.name)
                // https://discord.com/api/webhooks/841643311130738688/qpXZzmS5kHjfLSd_CCTYOBdAYXBan-fUXWtAVmP1lyAoIhMsJtf6Z4yt8dZDIWdjGyVf
                   const hook = new Discord.WebhookClient('841643311130738688', 'qpXZzmS5kHjfLSd_CCTYOBdAYXBan-fUXWtAVmP1lyAoIhMsJtf6Z4yt8dZDIWdjGyVf');
                   hook.send(
                           new Discord.MessageEmbed()
                           .setAuthor('Log', client.user.displayAvatarURL({dynamic: true}), 'https://www.reyfm.de')
                           .addField('Information', `Artist: \`${songInfo.artist}\`\n\nSong: \`${songInfo.name}\`\n\nDuration: \`${songInfo.duration}\`\n\nlisteners: \`${songInfo.listeners}\``)
                           .setColor('EFEEEE')
                           
                   )
                } catch (error) {
                        console.log(error.stack.toString().red)
                    }
                 })
        },100000)
    

})

client.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})



client.on("guildCreate", guild => {
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)

})

client.on("guildDelete", guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`)

})



client.on("message", async message => {
  if(message.author.bot) return
        if(message.content.indexOf(config.prefix) !== 0) return
                if (commandRecently.has(message.author.id)) {
                        message.delete().catch(O_o=>{})
                        message.channel.send(`Slow down, not so fast! You'll soon be hearing them sweet tunes! (COOLDOWN: ${commandcooldown/1000}s ) - ${message.author}`)
                        .then(msg => { 
                                msg.delete({ timeout: deleteafter }) 
                        })
                } else {
                        const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
                        const command = args.shift().toLowerCase()

                        if (command === "eval") {
                                if(message.author.id !== config.botOwner) {
                                        // Someone sent a command we recognize but the user is not bot owner. => Do nothing just ignore the command.
                                        return
                                }
                        try {
                                message.delete().catch(O_o=>{})
                                const evalargs = message.content.split(" ").slice(1)
                                const code = evalargs.join(" ")
                                let evaled = eval(code)
                                
                                if (typeof evaled !== "string")
                                    evaled = require("util").inspect(evaled)

                                        message.channel.send(clean(evaled), {code:"xl"})
                                        .then(msg => { 
                                                msg.delete({ timeout: 120000 }) 
                                        })
                                } catch (err) {
                                        message.reply(`\`ERROR\` \`\`\`xl\n${clean(err)}\n\`\`\``)
                                        .then(msg => { 
                                                msg.delete({ timeout: 120000 }) 
                                        })
                        }
  }




if(command == 'stop') {
		if (!message.member.voice.channel) return
                        message.member.voice.channel.leave()
                        message.delete().catch(O_o=>{})
		return
	}

  if(command === "play") {

	if (!message.member.voice.channel) { 
		message.delete().catch(O_o=>{})
                message.channel.send('You are not in a voice channel, **join a voice chat and try again!**')
                .then(msg => { 
                        msg.delete({ timeout: deleteafter }) 
                })
	        return
	} else {
        

                message.member.voice.channel.join()
                .then(connection => {

                        const dispatcher =   connection.play('https://listen.reyfm.de/hitsonly_320kbps.mp3')
                        dispatcher.setVolume(0.05)


                              
                      

                        // source file is iso-8859-15 but it is converted to utf-8 automatically
                        fetchUrl("https://api.reyfm.de/v4/channel?chn=5", function(error, meta, body){
                         if(error) return console.log(error.stack.toString().red)
                         try {
                            var data = JSON.parse(String(body))
                            var songInfo = {
                              name: data.channel.now.title,
                              artist: data.channel.now.artist, 
                              thumbnail: data.channel.now.cover_urls["240x240"],
                              duration: data.channel.now.info.duration,
                              listeners: data.channel.listeners,
                              description: data.channel.description,
                              url: String(data.channel.stream_urls.high).replace("//", "/")
                            }
                         

                                
                        const embed = new Discord.MessageEmbed()
                        .addField('Information', `Artist: \`${songInfo.artist}\`\n\nSong: \`${songInfo.name}\`\n\nDuration: \`${songInfo.duration}\`\n\nlisteners: \`${songInfo.listeners}\``)
                        .setColor('EFEEEE')
                        .setDescription('Hello, this is **Public Radio**\n I wanted to thank **REYFM** for the great **API** without this **API** I would otherwise not exist')
                        .setAuthor('Public Radio', client.user.displayAvatarURL({dynamic: true}), 'https://www.reyfm.de')
                        .setFooter(message.guild.name, message.guild.iconURL({dynamic: true}))
                        .setTimestamp()
                        .setThumbnail(songInfo.thumbnail)

                        message.lineReply(embed)
                           }   catch (error) {
                                      console.log(error.stack.toString().red)
                        message.lineReply(
                                'Something went wrong try again'
                        )

                           }
                        })
               
                })

        }

  }
  if(command === "reyfm") {
          message.lineReply(
         new Discord.MessageEmbed()
          .setAuthor('REYFM', 'https://cdn.discordapp.com/attachments/840692823292248094/840695444618346536/reyfm.png', 'https://www.reyfm.de')
          .setDescription('REYFM is one of the most successful web radio stations in Germany.\n\nREYFM gave us an API for our public radio.\n We thank you very much')
          .addField('From REYFM', `REYFM let's you listen to 15+ music streams for free - nonstop. With the best and latest music only for you!`)
          .addField('Socials', '<:website:839075872974569513> | [Website](https://www.reyfm.de)\n\n<:discord_icon:834749738603118632> | [Discord](https://discord.com/invite/cHAvYMV)')
          .setThumbnail('https://cdn.discordapp.com/attachments/840692823292248094/840696843129978921/8485d285bcfd11efd98e64ac68843029.jpg')
          .setColor('EFEEEE')
          .setFooter(message.guild.name, message.guild.iconURL({dynamic: true}))
          .setTimestamp()
          )
  }
  if(command === "help") {
        message.lineReply(
                new Discord.MessageEmbed()
               .setAuthor('Public Radio', client.user.displayAvatarURL({dynamic: true}), 'https://www.reyfm.de')
               .setDescription(`**Infomormation**\n\n\`%help\` | \`%reyfm\` | \`%invite\`\n\n**Radio Command**\n\n\`%play\` | \`%stop\` | \`&queue\`\n\n**Setup Commands**\n\n\`%radio-setup\`\n\n**Discord Together**\n\nYoutube: \`%ytt\` | \`%youtubetogether\` \n\nBetrayal: \`%betrayal\` | \`%betrayal.io\` \n\nFishing: \`%fishing\` | \`%fishington.io\``)
               .setColor('EFEEEE')
               .setFooter(message.guild.name, message.guild.iconURL({dynamic: true}))
               .setTimestamp()
        )
}
if(command === "invite") {
        message.lineReply(
                `**https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot**`
        )
}
if(command === "queue") {
        fetchUrl("https://api.reyfm.de/v4/channel?chn=5", function(error, meta, body){
                if(error) return console.log(error.stack.toString().red)
                try {
                        var data = JSON.parse(String(body))
                        var songInfo = {
                         eins: data.channel.next["1"].title,
                         zwei: data.channel.next["2"].title,
                         drei: data.channel.next["3"].title,
                         name: data.channel.now.title,
                        }
                message.lineReply(
                        new Discord.MessageEmbed()
        
                        .setAuthor('Queue', client.user.displayAvatarURL({dynamic: true}), 'https://www.reyfm.de')
                        .addField('Now Playing', `Title: \`${songInfo.name}\``)
                        .addField('Queue', `Next: \`${songInfo.eins}\`\n\n 2:\`${songInfo.zwei}\`\n\n 3: \`${songInfo.drei}\` `)
                        .setColor('EFEEEE')
                        .setFooter(message.guild.name, message.guild.iconURL({dynamic: true}))
                        .setTimestamp()
                )

                } catch(error) {
                        console.log(error.stack.toString().red)
                        message.lineReply(
                                'Something went wrong try again'
                        )
                        
                }
               
        })
}
if (command === "radio-setup") {
        if(!message.guild.me.hasPermission("ADMINISTRATOR")) return  message.reply(new Discord.MessageEmbed()     .setColor(config.color)
        .setFooter(client.user.username + "", client.user.displayAvatarURL()).setTitle(":x: I have have enough Permissions!"));
        if (!message.member.hasPermission("ADMINISTRATOR")) return message.reply(new Discord.MessageEmbed()     .setColor(config.color)
        .setFooter(client.user.username + "", client.user.displayAvatarURL()).setTitle(":x: You don't have enough Permissions!"));
        let {
          channel
        } = message.member.voice;
        if (channel) {
          message.reply(new Discord.MessageEmbed()
            .setTitle(" Setup Complete for Music Channel")
          
            .setDescription(`Vocice Channel: \`${channel.name}\`\n`)
            .setColor('EFEEEE')
            .setFooter(message.guild.name, message.guild.iconURL({dynamic: true}))
            .setTimestamp()
      
            
          );
          client.settings.set(message.guild.id, channel.id, `channel`);
        } else {
          message.guild.channels.create("Radio 24/7", {
            type: 'voice',
            bitrate: 8000,
            userLimit: 10,
            permissionOverwrites: [ //update the permissions
              { //the role "EVERYONE" is just able to VIEW_CHANNEL and CONNECT
                id: message.guild.id,
                allow: ['VIEW_CHANNEL', "CONNECT"],
                deny: ["SPEAK"]
              },
            ],
          }).then(vc => {
            if (message.channel.parent) vc.setParent(message.channel.parent.id)
            message.reply(new Discord.MessageEmbed()
            .setTitle(" Setup Complete for Music Channel")
              
              .setDescription(`Vocice Channel: \`${vc.name}\``)
              .setColor('EFEEEE')
              .setFooter(message.guild.name, message.guild.iconURL({dynamic: true}))
              .setTimestamp()
            );
            client.settings.set(message.guild.id, vc.id, `channel`);
          })
        }
}
}
})

client.on("message", async (message) => {
        if(!message.guild || message.author.bot || !message.content.trim().startsWith(config.prefix)) return;
        // "!ytt asda" --> "ytt asda" --> ["ytt", "asda"]
        var args = message.content.slice(config.prefix.length).trim().split(" ")
        // ["ytt", "asda"] --> cmd = "ytt" & ["asda"]
        var cmd = args.shift().toLowerCase()
    
     
    
        if(cmd == "ytt" || cmd == "youtubetogether"){
                const { channel } = message.member.voice;
                if(!channel) return message.reply("You need to join a Voice Channel")
            fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
                method: "POST",
                body: JSON.stringify({
                    max_age: 86400,
                    max_uses: 0,
                    target_application_id: "755600276941176913",
                    target_type: 2,
                    temporary: false,
                    validate: null
                }),
                headers: {
                    "Authorization": `Bot ${config.token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json())
            .then(invite =>{
                if(!invite.code) return message.reply(":x: Cannot start minigame")
                message.channel.send(`Click on the Link to start the GAME:\n> https://discord.com/invite/${invite.code}`)
            })
        }else if(cmd == "betrayal" || cmd == "betrayal.io"){
                const { channel } = message.member.voice;
                if(!channel) return message.reply("You need to join a Voice Channel")
            fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
                method: "POST",
                body: JSON.stringify({
                    max_age: 86400,
                    max_uses: 0,
                    target_application_id: "773336526917861400",
                    target_type: 2,
                    temporary: false,
                    validate: null
                }),
                headers: {
                    "Authorization": `Bot ${config.token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json())
            .then(invite =>{
                if(!invite.code) return message.reply(":x: Cannot start minigame")
                message.channel.send(`Click on the Link to start the GAME:\n> https://discord.com/invite/${invite.code}`)
            })
        }else if(cmd == "fishing" || cmd == "fishington.io"){
                const { channel } = message.member.voice;
                if(!channel) return message.reply("You need to join a Voice Channel")
            fetch(`https://discord.com/api/v8/channels/${channel.id}/invites`, {
                method: "POST",
                body: JSON.stringify({
                    max_age: 86400,
                    max_uses: 0,
                    target_application_id: "814288819477020702",
                    target_type: 2,
                    temporary: false,
                    validate: null
                }),
                headers: {
                    "Authorization": `Bot ${config.token}`,
                    "Content-Type": "application/json"
                }
            }).then(res => res.json())
            .then(invite =>{
                if(!invite.code) return message.reply(":x: Cannot start minigame")
                message.channel.send(`Click on the Link to start the GAME:\n> https://discord.com/invite/${invite.code}`)
            })
        }
        })
client.login(config.token)


function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
  else
      return text
}