/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
WEATHER BOT by dugup46!
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.SLACK_TOKEN) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./resources/botkit/lib/Botkit.js');
var os = require('os');

var controller = Botkit.slackbot({
    debug: false
});

var bot = controller.spawn({
    token: process.env.SLACK_TOKEN
}).startRTM();

controller.hears(['help'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'sos',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });
    
    var help = 'Interacting with the @weather bot is simple! \n\n' + 
    'Just use `@weather radar <WFO SID> <scantype>` to call a scan.  Example `@weather radar pbz reflect` for a reflectivity scan of Pittsburgh. \n\n' +
    '*Radars)* You must provide the exact 3 letter WFO SID - You can find that list here:\n' +
	'https://www.roc.noaa.gov/wsr88d/Program/NetworkSites.aspx\n\n' +
    '*Scan Types)* Here is a list of all the types of scans I can currently run:\n' +
    '*`reflect` Base Reflecivity* - Lower level scan, most common.\n' +
    '*`velocity` Base Velocity* - Provides wind speeds and direction.\n' +
	'*`motion` Relative Storm Motion* - Provides small scale rotations and mesocyclones.\n' +
	'*`composite` Base Reflectivity* Composite - Composite scan of all BR level scans.\n' +
	'*`1hour` 1 Hour Precipitation* - Provides the level of rainfall in the past 1 hour.\n' +
	'*`total` Total Storm Precipitation* - Provides total precipitation from a storm.'
	bot.reply(message, help)
});

controller.hears(['radar'], ['direct_message', 'direct_mention'], function (bot, message) {
    
    if (message.text == "radar"){
    
		bot.startConversation(message, function(err, convo) {

			convo.ask('Which radar site do you want?', function(response, convo) {

				convo.next();

			}, {'key': 'radarsite'}); // store the results in a field called nickname

			convo.ask('Which type of radar scan do you want?', function(response, convo) {

				convo.next();

			}, {'key': 'scantype'}); // store the results in a field called nickname
			
			convo.on('end', function(convo) {
				if (convo.status == 'completed') {

					var scantype = convo.extractResponse('scantype');
					scantype = scantype.toLowerCase();
					var radarsite = convo.extractResponse('radarsite');
					radarsite = radarsite.toUpperCase();
					
					switch(scantype) {
					case "reflect":
						var scantype = "N0R"
						break;
					case "velocity":
						var scantype = "N0V"
						break;
					case "motion":
						var scantype = "N0S"
						break;
					case "1hour":
						var scantype = "N1P"
						break;
					case "composite":
						var scantype = "NCR"
						break;
					case "total":
						var scantype = "NTP"
						break;
					default:
						scantype = "N0R"
					} 
					
					var text = "Here is the " + scantype + " scan from your requested location: "
					var attachment = [{
							"title": "For a direct link to the NWS page for " + radarsite + ", click here.",
							"title_link": "http://www.weather.gov/" + radarsite + "/",
							"text": text,
							"fallback": text,
							"image_url": "http://radar.weather.gov/ridge/RadarImg/" + scantype + "/" + radarsite + "_" + scantype + "_0.gif",
							"color": "#7CD197",
					}]

					bot.reply(message, {
						attachments: attachment
					}, function (err, resp) {
						console.log(err, resp)
						})
					}
				});
			});
		} 
		
		else {
			
			var TheMessage = message.text;
			var SplitMessage = TheMessage.split(" "); 
			
			var scantype = SplitMessage[2].toLowerCase();
			var radarsite = SplitMessage[1].toUpperCase();
			
			switch(scantype) {
				case "reflect":
					var scantype = "N0R"
					break;
				case "velocity":
					var scantype = "N0V"
					break;
				case "motion":
					var scantype = "N0S"
					break;
				case "1hour":
					var scantype = "N1P"
					break;
				case "composite":
					var scantype = "NCR"
					break;
				case "total":
					var scantype = "NTP"
					break;
				default:
					scantype = "N0R"
			}
					
			var text = "Here is the " + scantype + " scan from your requested location: "
			var attachment = [{
					"title": "For a direct link to the NWS page for " + radarsite + ", click here.",
					"title_link": "http://www.weather.gov/" + radarsite + "/",
					"text": text,
					"fallback": text,
					"image_url": "http://radar.weather.gov/ridge/RadarImg/" + scantype + "/" + radarsite + "_" + scantype + "_0.gif",
					"color": "#7CD197",
			}]

			bot.reply(message, {
						attachments: attachment
					}, function (err, resp) {
						console.log(err, resp)
						});
			 
		}
})
