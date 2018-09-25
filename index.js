const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const token = require("./token.json")
const bot = new Discord.Client({disableEverone: true});
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);

  let jsfile = files.filter(f => f.split(".").pop() === "js");
  if(jsfile.length <= 0){
    console.log("Can Not Find Commands In Our Database");
    return;
  }

  jsfile.forEach((f, i) => {
    let props = require(`./commands/${f}`)
    console.log(`${f} loaded!`);
    bot.commands.set(props);

  });

});


bot.on("ready", async () => {
  console.log(`${bot.user.username} is now online!`);
  bot.user.setActivity("HellFang Discord");
});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);

  if(cmd === `${prefix}botinfo`){
    let bicon = bot.user.displayAvatarURL;

    let botembed = new Discord.RichEmbed()
    .setDescription("Bot Information")
    .setColor("#42dcf4")
    .setThumbnail(bicon)
    .addField("Bot Name", bot.user.username)
    .addField("Created On", bot.user.createdAt);

    return message.channel.send(botembed);
  }

  if(cmd === `${prefix}serverinfo`){
    let sicon = message.guild.iconURL;

    let serverembed = new Discord.RichEmbed()
    .setDescription("Server Info")
    .setColor("#42dcf4")
    .setThumbnail(sicon)
    .addField("Server Name", message.guild.name)
    .addField("Created On", message.guild.createdAt)
    .addField("You Joined On", message.member.joinedAt)
    .addField("Total Members", message.guild.memberCount);

    return message.channel.send(serverembed);
  }

  if(cmd === `${prefix}report`){
  let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!rUser) return message.channel.send("I can not find that user in my database!");
  let reason = args.join(" ").slice(22);

  let reportembed = new Discord.RichEmbed()
  .setDescription("Reports")
  .setColor("#42dcf4")
  .addField("Reported User", `${rUser} with ID: ${rUser.id}`)
  .addField("Reported By", message.author)
  .addField("Channel", message.channel)
  .addField("Time", message.createdAt)
  .addField("Reason", reason);

  let reportschannel = message.guild.channels.find(`name`, "reports");
  if(!reportschannel) return message.channel.send("Could not find the reports channel!");

  message.delete().catch(O_o=>{});
  reportschannel.send(reportembed);
  }
});

bot.login(token.token);
