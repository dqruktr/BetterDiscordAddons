/**
 * @name RevealAllSpoilers
 * @author DevilBro
 * @authorId 278543574059057154
 * @version 1.0.8
 * @description Allows you to reveal all Spoilers within a Message/Status by holding the Ctrl Key and clicking a Spoiler
 * @invite Jx3TjNS
 * @donate https://www.paypal.me/MircoWittrien
 * @patreon https://www.patreon.com/MircoWittrien
 * @website https://mwittrien.github.io/
 * @source https://github.com/mwittrien/BetterDiscordAddons/tree/master/Plugins/RevealAllSpoilers/
 * @updateUrl https://mwittrien.github.io/BetterDiscordAddons/Plugins/RevealAllSpoilers/RevealAllSpoilers.plugin.js
 */

module.exports = (_ => {
	const config = {
		"info": {
			"name": "RevealAllSpoilers",
			"author": "DevilBro",
			"version": "1.0.8",
			"description": "Allows you to reveal all Spoilers within a Message/Status by holding the Ctrl Key and clicking a Spoiler"
		},
		"changeLog": {
			"fixed": {
				"Replies": "No longer reveals spoilers within reply preview if revealing all spoilers within a message."
			}
		}
	};

	return (window.Lightcord || window.LightCord) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return "Do not use LightCord!";}
		load () {BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)");}
		start() {}
		stop() {}
	} : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`;}
		
		downloadLibrary () {
			require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
				if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", {type: "success"}));
				else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
			});
		}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						this.downloadLibrary();
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		return class RevealAllSpoilers extends Plugin {
			onLoad () {
				this.patchedModules = {
					after: {
						Spoiler: "render"
					}
				};
			}
			
			onStart () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			onStop () {
				BDFDB.PatchUtils.forceAllUpdates(this);
			}
			
			processSpoiler (e) {
				BDFDB.PatchUtils.patch(this, e.instance, "revealSpoiler", {after: e2 => {
					if (e2.methodArguments[0].ctrlKey) {
						BDFDB.ListenerUtils.stopEvent(e2.methodArguments[0]);
						let parent = BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, e2.methodArguments[0].target) || e2.methodArguments[0].target.parentElement;
						if (parent) for (let spoiler of parent.querySelectorAll(BDFDB.dotCN.spoilerhidden)) if (!BDFDB.DOMUtils.getParent(BDFDB.dotCN.messagerepliedmessagepreview, spoiler)) spoiler.click();
					}
				}}, {force: true, noCache: true});
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
