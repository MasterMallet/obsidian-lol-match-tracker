import {App, Editor, MarkdownView, Modal, normalizePath, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import {I18n, Language} from "./i18n";

interface LoLTrackerSettings {
	riotApiKey: string;
	summonerName: string;
	region: string;
	tagLine: string;
	notesFolder: string;
	friendsFolder: string;
	numberOfMatches: number;
	registeredFriends: FriendInfo[];
	language: Language;
}

interface FriendInfo {
	name: string;
	tagLine: string;
	puuid?: string;
	displayName: string;
}

const DEFAULT_SETTINGS: LoLTrackerSettings = {
	riotApiKey: '',
	summonerName: '',
	region: 'jp1',
	tagLine: 'JP1',
	notesFolder: 'LoL Matches',
	friendsFolder: 'LoL Matches/Friends',
	numberOfMatches: 1,
	registeredFriends: [],
	language: 'en'
}

// Riot API用の型定義
interface RiotAccount {
	puuid: string;
	gameName: string;
	tagLine: string;
}

interface MatchParticipant {
	puuid: string;
	summonerName: string;
	championName: string;
	championId: number;
	teamPosition: string;
	kills: number;
	deaths: number;
	assists: number;
	totalMinionsKilled: number;
	neutralMinionsKilled: number;
	goldEarned: number;
	totalDamageDealtToChampions: number;
	totalDamageTaken: number;
	visionScore: number;
	win: boolean;
	item0: number;
	item1: number;
	item2: number;
	item3: number;
	item4: number;
	item5: number;
	item6: number;
	summoner1Id: number;
	summoner2Id: number;
	perks: {
		styles: Array<{
			selections: Array<{
				perk: number;
			}>;
		}>;
	};
}

interface MatchInfo {
	gameCreation: number;
	gameDuration: number;
	gameMode: string;
	queueId: number;
	participants: MatchParticipant[];
}

interface MatchData {
	metadata: {
		matchId: string;
	};
	info: MatchInfo;
}

export default class LoLMatchTrackerPlugin extends Plugin  {
	settings: LoLTrackerSettings;
	i18n: I18n;

	async onload() {
		await this.loadSettings();

		// i18nを初期化
		this.i18n = new I18n(this.settings.language);

		// リボンアイコンを追加
		this.addRibbonIcon('trophy', this.i18n.t('plugin_name'), async () => {
			await this.fetchAndCreateMatches();
		});

		// コマンドパレットに追加
		this.addCommand({
			id: 'fetch-latest-matches',
			name: this.i18n.t('notifications.fetching_matches'),
			callback: async () => {
				await this.fetchAndCreateMatches();
			}
		});

		// 設定タブを追加
		this.addSettingTab(new LoLTrackerSettingTab(this.app, this));
	}

	onunload() {

	}

	async fetchAndCreateMatches() {
		if (!this.settings.riotApiKey) {
			new Notice(this.i18n.t('notifications.api_key_missing'));
			return;
		}

		if (!this.settings.summonerName) {
			new Notice(this.i18n.t('notifications.summoner_name_missing'));
			return;
		}

		try {
			new Notice(this.i18n.t('notifications.fetching_matches'));

			// 1. 自分のアカウント情報を取得
			const account = await this.getAccountByRiotId();

			// 2. フレンドのPUUIDを取得（未取得の場合）
			await this.fetchFriendsPuuids();

			// 3. 試合IDリストを取得
			const matchIds = await this.getMatchIds(account.puuid);

			// 4. 各試合の詳細を取得してノート作成
			let successCount = 0;
			for (const matchId of matchIds) {
				try {
					const matchData = await this.getMatchData(matchId);
					await this.createMatchNote(matchData, account.puuid);

					// フレンドとのプレイをチェック
					await this.checkAndCreateFriendNotes(matchData, account.puuid);

					successCount++;
					await this.sleep(100); // レート制限対策
				} catch (error) {
					console.error(`試合 ${matchId} の取得に失敗:`, error);
				}
			}

			new Notice(this.i18n.t('notifications.success', { count: successCount.toString() }));
		} catch (error) {
			console.error('エラー:', error);
			new Notice(this.i18n.t('notifications.error', { message: error.message }));
		}
	}

	async fetchFriendsPuuids() {
		for (const friend of this.settings.registeredFriends) {
			if (!friend.puuid) {
				try {
					const account = await this.getAccountByRiotId(friend.name, friend.tagLine);
					friend.puuid = account.puuid;
					await this.saveSettings();
					await this.sleep(100);
				} catch (error) {
					console.error(`フレンド ${friend.displayName} のPUUID取得失敗:`, error);
				}
			}
		}
	}

	async checkAndCreateFriendNotes(matchData: MatchData, myPuuid: string) {
		const friendsInMatch = this.settings.registeredFriends.filter(friend =>
			matchData.info.participants.some(p => p.puuid === friend.puuid)
		);

		for (const friend of friendsInMatch) {
			await this.createFriendMatchNote(matchData, myPuuid, friend);
		}
	}

	async getAccountByRiotId(name?: string, tagLine?: string): Promise<RiotAccount> {
		const summonerName = name || this.settings.summonerName;
		const summonerTag = tagLine || this.settings.tagLine;
		const url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(summonerName)}/${encodeURIComponent(summonerTag)}`;

		const response = await fetch(url, {
			headers: {
				'X-Riot-Token': this.settings.riotApiKey
			}
		});

		if (!response.ok) {
			throw new Error(`アカウント取得失敗: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	async getMatchIds(puuid: string): Promise<string[]> {
		const routingValue = this.getRoutingValue(this.settings.region);
		const url = `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${this.settings.numberOfMatches}`;

		const response = await fetch(url, {
			headers: {
				'X-Riot-Token': this.settings.riotApiKey
			}
		});

		if (!response.ok) {
			throw new Error(`試合ID取得失敗: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	async getMatchData(matchId: string): Promise<MatchData> {
		const routingValue = this.getRoutingValue(this.settings.region);
		const url = `https://${routingValue}.api.riotgames.com/lol/match/v5/matches/${matchId}`;

		const response = await fetch(url, {
			headers: {
				'X-Riot-Token': this.settings.riotApiKey
			}
		});

		if (!response.ok) {
			throw new Error(`試合データ取得失敗: ${response.status} ${response.statusText}`);
		}

		return await response.json();
	}

	getRoutingValue(region: string): string {
		const routingMap: { [key: string]: string } = {
			'br1': 'americas',
			'eun1': 'europe',
			'euw1': 'europe',
			'jp1': 'asia',
			'kr': 'asia',
			'la1': 'americas',
			'la2': 'americas',
			'na1': 'americas',
			'oc1': 'sea',
			'ph2': 'sea',
			'ru': 'europe',
			'sg2': 'sea',
			'th2': 'sea',
			'tr1': 'europe',
			'tw2': 'sea',
			'vn2': 'sea'
		};
		return routingMap[region] || 'asia';
	}

	async createMatchNote(matchData: MatchData, puuid: string) {
		// 自分のデータを取得
		const myData = matchData.info.participants.find(p => p.puuid === puuid);
		if (!myData) {
			throw new Error('プレイヤーデータが見つかりません');
		}

		// 日付をフォーマット
		const date = new Date(matchData.info.gameCreation);
		const dateStr = date.toISOString().split('T')[0];
		const timeStr = date.toTimeString().split(' ')[0];

		// 勝敗
		const result = myData.win ? 'Win' : 'Loss';

		// ゲームモード
		const gameMode = this.getGameModeName(matchData.info.queueId);

		// ゲーム時間（分:秒）
		const duration = matchData.info.gameDuration;
		const minutes = Math.floor(duration / 60);
		const seconds = duration % 60;

		// CS計算
		const totalCs = myData.totalMinionsKilled + myData.neutralMinionsKilled;
		const csPerMin = (totalCs / (duration / 60)).toFixed(1);

		// KDA計算
		const kda = myData.deaths === 0
			? 'Perfect'
			: ((myData.kills + myData.assists) / myData.deaths).toFixed(2);

		// チーム構成
		const myTeam = matchData.info.participants.filter(p =>
			matchData.info.participants.indexOf(p) < 5 ===
			matchData.info.participants.indexOf(myData) < 5
		);
		const enemyTeam = matchData.info.participants.filter(p =>
			!myTeam.includes(p)
		);

		// 対面相手を取得
		const laneOpponent = enemyTeam.find(p => p.teamPosition === myData.teamPosition);

		// マークダウンコンテンツを生成
		const content = `---
date: ${dateStr}
time: ${timeStr}
champion: ${myData.championName}
role: ${myData.teamPosition || 'UNKNOWN'}
result: ${result}
kda: ${myData.kills}/${myData.deaths}/${myData.assists}
game_mode: ${gameMode}
match_id: ${matchData.metadata.matchId}
tags: [lol, match, ${result.toLowerCase()}, ${myData.championName.toLowerCase()}]
---

# ${this.i18n.t('match.overview')}

- **${this.i18n.t('match.result')}**: ${result === 'Win' ? this.i18n.t('match.win') : this.i18n.t('match.loss')}
- **${this.i18n.t('match.game_time')}**: ${minutes}${this.i18n.t('match.game_mode') === 'Game Mode' ? 'min' : '分'}${seconds}${this.i18n.t('match.game_mode') === 'Game Mode' ? 's' : '秒'}
- **${this.i18n.t('match.game_mode')}**: ${gameMode}
- **${this.i18n.t('match.match_date')}**: ${date.toLocaleString(this.settings.language === 'ja' ? 'ja-JP' : this.settings.language === 'ko' ? 'ko-KR' : 'en-US')}

# ${this.i18n.t('match.performance')}

## ${this.i18n.t('match.stats')}

- **${this.i18n.t('match.kda')}**: ${myData.kills} / ${myData.deaths} / ${myData.assists} (${kda})
- **${this.i18n.t('match.cs')}**: ${totalCs} (${csPerMin}/${this.i18n.t('match.game_mode') === 'Game Mode' ? 'min' : '分'})
- **${this.i18n.t('match.damage_dealt')}**: ${myData.totalDamageDealtToChampions.toLocaleString()}
- **${this.i18n.t('match.damage_taken')}**: ${myData.totalDamageTaken.toLocaleString()}
- **${this.i18n.t('match.gold_earned')}**: ${myData.goldEarned.toLocaleString()}
- **${this.i18n.t('match.vision_score')}**: ${myData.visionScore}

## ${this.i18n.t('match.build')}

**${this.i18n.t('match.items')}**:
${this.formatItems(myData)}

**${this.i18n.t('match.summoner_spells')}**: ${this.getSummonerSpellName(myData.summoner1Id)} / ${this.getSummonerSpellName(myData.summoner2Id)}

**${this.i18n.t('match.runes')}**: ${this.formatRunes(myData)}

# ${this.i18n.t('match.team_composition')}

## ${this.i18n.t('match.ally_team')}
${myTeam.map(p => `- ${p.championName} (${p.teamPosition || 'FILL'}) - ${p.kills}/${p.deaths}/${p.assists}`).join('\n')}

## ${this.i18n.t('match.enemy_team')}
${enemyTeam.map(p => `- ${p.championName} (${p.teamPosition || 'FILL'}) - ${p.kills}/${p.deaths}/${p.assists}`).join('\n')}

${laneOpponent ? `\n**${this.i18n.t('match.lane_opponent')}**: ${laneOpponent.championName} (${laneOpponent.kills}/${laneOpponent.deaths}/${laneOpponent.assists})` : ''}

# ${this.i18n.t('match.reflection')}

## ${this.i18n.t('match.good_points')}
- 

## ${this.i18n.t('match.improvements')}
- 

## ${this.i18n.t('match.learned')}
- 

---
${this.i18n.t('match.auto_generated')}
`;

		// ファイル名を生成
		const fileName = `${dateStr}_${myData.championName}_${result}.md`;
		const folderPath = normalizePath(this.settings.notesFolder);

		// フォルダが存在しない場合は作成
		if (!(await this.app.vault.adapter.exists(folderPath))) {
			await this.app.vault.createFolder(folderPath);
		}

		const filePath = normalizePath(`${folderPath}/${fileName}`);

		// ファイルが既に存在する場合は番号を追加
		let finalPath = filePath;
		let counter = 1;
		while (await this.app.vault.adapter.exists(finalPath)) {
			const nameWithoutExt = fileName.replace('.md', '');
			finalPath = normalizePath(`${folderPath}/${nameWithoutExt}_${counter}.md`);
			counter++;
		}

		// ファイルを作成
		await this.app.vault.create(finalPath, content);
	}

	async createFriendMatchNote(matchData: MatchData, myPuuid: string, friend: FriendInfo) {
		// 自分のデータを取得
		const myData = matchData.info.participants.find(p => p.puuid === myPuuid);
		// フレンドのデータを取得
		const friendData = matchData.info.participants.find(p => p.puuid === friend.puuid);

		if (!myData || !friendData) {
			return;
		}

		// 日付をフォーマット
		const date = new Date(matchData.info.gameCreation);
		const dateStr = date.toISOString().split('T')[0];
		const timeStr = date.toTimeString().split(' ')[0];

		// 勝敗
		const result = myData.win ? 'Win' : 'Loss';

		// ゲームモード
		const gameMode = this.getGameModeName(matchData.info.queueId);

		// ゲーム時間（分:秒）
		const duration = matchData.info.gameDuration;
		const minutes = Math.floor(duration / 60);
		const seconds = duration % 60;

		// フレンドのCS計算
		const friendTotalCs = friendData.totalMinionsKilled + friendData.neutralMinionsKilled;
		const friendCsPerMin = (friendTotalCs / (duration / 60)).toFixed(1);

		// フレンドのKDA計算
		const friendKda = friendData.deaths === 0
			? 'Perfect'
			: ((friendData.kills + friendData.assists) / friendData.deaths).toFixed(2);

		// 同じチームかどうか
		const sameTeam = myData.win === friendData.win;

		// マークダウンコンテンツを生成
		const content = `---
date: ${dateStr}
time: ${timeStr}
friend: ${friend.displayName}
my_champion: ${myData.championName}
friend_champion: ${friendData.championName}
result: ${result}
same_team: ${sameTeam}
game_mode: ${gameMode}
match_id: ${matchData.metadata.matchId}
tags: [lol, friend, ${friend.displayName.toLowerCase().replace(/\s+/g, '-')}, ${result.toLowerCase()}]
---

# ${this.i18n.t('friend_match.title_with', { name: friend.displayName })}

## ${this.i18n.t('friend_match.overview')}

- **${this.i18n.t('match.result')}**: ${result === 'Win' ? this.i18n.t('match.win') : this.i18n.t('match.loss')}
- **${this.i18n.t('friend_match.play_style')}**: ${sameTeam ? this.i18n.t('friend_match.same_team') : this.i18n.t('friend_match.versus')}
- **${this.i18n.t('match.game_time')}**: ${minutes}${this.i18n.t('match.game_mode') === 'Game Mode' ? 'min' : '分'}${seconds}${this.i18n.t('match.game_mode') === 'Game Mode' ? 's' : '秒'}
- **${this.i18n.t('match.game_mode')}**: ${gameMode}
- **${this.i18n.t('match.match_date')}**: ${date.toLocaleString(this.settings.language === 'ja' ? 'ja-JP' : this.settings.language === 'ko' ? 'ko-KR' : 'en-US')}

## ${this.i18n.t('friend_match.my_performance')}

- **${this.i18n.t('friend_match.champion')}**: ${myData.championName} (${myData.teamPosition || 'FILL'})
- **${this.i18n.t('match.kda')}**: ${myData.kills} / ${myData.deaths} / ${myData.assists}
- **${this.i18n.t('match.cs')}**: ${myData.totalMinionsKilled + myData.neutralMinionsKilled}
- **${this.i18n.t('match.damage_dealt')}**: ${myData.totalDamageDealtToChampions.toLocaleString()}

## ${this.i18n.t('friend_match.friend_performance', { name: friend.displayName })}

- **${this.i18n.t('friend_match.champion')}**: ${friendData.championName} (${friendData.teamPosition || 'FILL'})
- **${this.i18n.t('match.kda')}**: ${friendData.kills} / ${friendData.deaths} / ${friendData.assists} (${friendKda})
- **${this.i18n.t('match.cs')}**: ${friendTotalCs} (${friendCsPerMin}/${this.i18n.t('match.game_mode') === 'Game Mode' ? 'min' : '分'})
- **${this.i18n.t('match.damage_dealt')}**: ${friendData.totalDamageDealtToChampions.toLocaleString()}
- **${this.i18n.t('match.gold_earned')}**: ${friendData.goldEarned.toLocaleString()}
- **${this.i18n.t('match.vision_score')}**: ${friendData.visionScore}

### ${this.i18n.t('friend_match.build_details')}

**${this.i18n.t('match.items')}**: ${this.formatItems(friendData)}

**${this.i18n.t('match.summoner_spells')}**: ${this.getSummonerSpellName(friendData.summoner1Id)} / ${this.getSummonerSpellName(friendData.summoner2Id)}

**${this.i18n.t('match.runes')}**: ${this.formatRunes(friendData)}

## ${this.i18n.t('friend_match.feedback', { name: friend.displayName })}

### ${this.i18n.t('friend_match.good_points')}
- 

### ${this.i18n.t('friend_match.improvements')}
- 

### ${this.i18n.t('friend_match.next_time')}
- 

## ${this.i18n.t('friend_match.coordination')}

### ${this.i18n.t('friend_match.good_coordination')}
- 

### ${this.i18n.t('friend_match.improve_coordination')}
- 

## ${this.i18n.t('friend_match.notes')}
${this.i18n.t('friend_match.notes_placeholder')}

---
${this.i18n.t('match.auto_generated')}
${this.i18n.t('friend_match.main_match_note', { filename: `${dateStr}_${myData.championName}_${result}` })}
`;

		// ファイル名を生成
		const friendFolderName = friend.displayName.replace(/[\\/:*?"<>|]/g, '_');
		const fileName = `${dateStr}_with_${friend.displayName.replace(/\s+/g, '_')}_${result}.md`;
		const folderPath = normalizePath(`${this.settings.friendsFolder}/${friendFolderName}`);

		// フォルダが存在しない場合は作成
		if (!(await this.app.vault.adapter.exists(folderPath))) {
			await this.app.vault.createFolder(folderPath);
		}

		const filePath = normalizePath(`${folderPath}/${fileName}`);

		// ファイルが既に存在する場合は番号を追加
		let finalPath = filePath;
		let counter = 1;
		while (await this.app.vault.adapter.exists(finalPath)) {
			const nameWithoutExt = fileName.replace('.md', '');
			finalPath = normalizePath(`${folderPath}/${nameWithoutExt}_${counter}.md`);
			counter++;
		}

		// ファイルを作成
		await this.app.vault.create(finalPath, content);
	}

	formatItems(participant: MatchParticipant): string {
		const items = [
			participant.item0,
			participant.item1,
			participant.item2,
			participant.item3,
			participant.item4,
			participant.item5,
			participant.item6
		].filter(id => id !== 0);

		if (items.length === 0) return 'なし';
		return items.map(id => `Item ${id}`).join(', ');
	}

	formatRunes(participant: MatchParticipant): string {
		if (!participant.perks || !participant.perks.styles) return '不明';

		const primaryStyle = participant.perks.styles[0];
		if (!primaryStyle || !primaryStyle.selections || primaryStyle.selections.length === 0) {
			return '不明';
		}

		const keystone = primaryStyle.selections[0].perk;
		return `Keystone: ${keystone}`;
	}

	getGameModeName(queueId: number): string {
		const mode = this.i18n.t(`game_modes.${queueId}`);
		return mode !== `game_modes.${queueId}` ? mode : `${this.i18n.t('match.game_mode')} ${queueId}`;
	}

	getSummonerSpellName(spellId: number): string {
		const spell = this.i18n.t(`summoner_spells.${spellId}`);
		return spell !== `summoner_spells.${spellId}` ? spell : `Spell ${spellId}`;
	}

	sleep(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		// i18nが既に初期化されている場合は言語を更新
		if (this.i18n) {
			this.i18n.setLanguage(this.settings.language);
		}
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// 言語設定が変更された場合、i18nを更新
		if (this.i18n) {
			this.i18n.setLanguage(this.settings.language);
		}
	}
}

class LoLTrackerSettingTab extends PluginSettingTab {
	plugin: LoLMatchTrackerPlugin;

	constructor(app: App, plugin: LoLMatchTrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		const i18n = this.plugin.i18n;

		containerEl.createEl('h2', {text: i18n.t('settings.title')});

		// API設定セクション
		containerEl.createEl('h3', {text: i18n.t('settings.api_settings')});

		new Setting(containerEl)
			.setName(i18n.t('settings.api_key'))
			.setDesc(i18n.t('settings.api_key_desc'))
			.addText(text => text
				.setPlaceholder(i18n.t('settings.api_key_placeholder'))
				.setValue(this.plugin.settings.riotApiKey)
				.onChange(async (value) => {
					this.plugin.settings.riotApiKey = value;
					await this.plugin.saveSettings();
				})
				.inputEl.type = 'password');

		// アカウント情報セクション
		containerEl.createEl('h3', {text: i18n.t('settings.account_info')});

		new Setting(containerEl)
			.setName(i18n.t('settings.summoner_name'))
			.setDesc(i18n.t('settings.summoner_name_desc'))
			.addText(text => text
				.setPlaceholder(i18n.t('settings.summoner_name_placeholder'))
				.setValue(this.plugin.settings.summonerName)
				.onChange(async (value) => {
					this.plugin.settings.summonerName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(i18n.t('settings.tag_line'))
			.setDesc(i18n.t('settings.tag_line_desc'))
			.addText(text => text
				.setPlaceholder(i18n.t('settings.tag_line_placeholder'))
				.setValue(this.plugin.settings.tagLine)
				.onChange(async (value) => {
					this.plugin.settings.tagLine = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(i18n.t('settings.region'))
			.setDesc(i18n.t('settings.region_desc'))
			.addDropdown(dropdown => dropdown
				.addOption('jp1', 'Japan')
				.addOption('kr', 'Korea')
				.addOption('na1', 'North America')
				.addOption('euw1', 'Europe West')
				.addOption('eun1', 'Europe Nordic & East')
				.addOption('br1', 'Brazil')
				.addOption('la1', 'Latin America North')
				.addOption('la2', 'Latin America South')
				.addOption('oc1', 'Oceania')
				.addOption('ru', 'Russia')
				.addOption('tr1', 'Turkey')
				.addOption('sg2', 'Singapore')
				.addOption('ph2', 'Philippines')
				.addOption('th2', 'Thailand')
				.addOption('tw2', 'Taiwan')
				.addOption('vn2', 'Vietnam')
				.setValue(this.plugin.settings.region)
				.onChange(async (value) => {
					this.plugin.settings.region = value;
					await this.plugin.saveSettings();
				}));

		// 言語設定セクション
		containerEl.createEl('h3', {text: i18n.t('settings.language_settings')});

		new Setting(containerEl)
			.setName(i18n.t('settings.language'))
			.setDesc(i18n.t('settings.language_desc'))
			.addDropdown(dropdown => dropdown
				.addOption('en', 'English')
				.addOption('ko', '한국어')
				.addOption('ja', '日本語')
				.setValue(this.plugin.settings.language)
				.onChange(async (value) => {
					this.plugin.settings.language = value as Language;
					await this.plugin.saveSettings();
					this.display(); // 言語変更時に画面を再描画
				}));

		// ノート設定セクション
		containerEl.createEl('h3', {text: i18n.t('settings.note_settings')});

		new Setting(containerEl)
			.setName(i18n.t('settings.notes_folder'))
			.setDesc(i18n.t('settings.notes_folder_desc'))
			.addText(text => text
				.setPlaceholder(i18n.t('settings.notes_folder_placeholder'))
				.setValue(this.plugin.settings.notesFolder)
				.onChange(async (value) => {
					this.plugin.settings.notesFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(i18n.t('settings.friends_folder'))
			.setDesc(i18n.t('settings.friends_folder_desc'))
			.addText(text => text
				.setPlaceholder(i18n.t('settings.friends_folder_placeholder'))
				.setValue(this.plugin.settings.friendsFolder)
				.onChange(async (value) => {
					this.plugin.settings.friendsFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName(i18n.t('settings.match_count'))
			.setDesc(i18n.t('settings.match_count_desc'))
			.addSlider(slider => slider
				.setLimits(1, 20, 1)
				.setValue(this.plugin.settings.numberOfMatches)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.numberOfMatches = value;
					await this.plugin.saveSettings();
				}));

		// フレンド管理セクション
		containerEl.createEl('h3', {text: i18n.t('settings.friend_management')});

		containerEl.createEl('p', {
			text: i18n.t('settings.friend_management_desc'),
			cls: 'setting-item-description'
		});

		// 既存のフレンドリスト表示
		this.plugin.settings.registeredFriends.forEach((friend, index) => {
			new Setting(containerEl)
				.setName(friend.displayName)
				.setDesc(`${friend.name}#${friend.tagLine}`)
				.addButton(button => button
					.setButtonText(i18n.t('settings.delete_button'))
					.setWarning()
					.onClick(async () => {
						this.plugin.settings.registeredFriends.splice(index, 1);
						await this.plugin.saveSettings();
						this.display(); // 再描画
					}));
		});

		// 新しいフレンドを追加
		let newFriendName = '';
		let newFriendTag = '';
		let newFriendDisplay = '';

		new Setting(containerEl)
			.setName(i18n.t('settings.add_friend'))
			.setDesc(i18n.t('settings.summoner_name_desc'))
			.addText(text => text
				.setPlaceholder(i18n.t('settings.display_name_placeholder'))
				.onChange(value => {
					newFriendDisplay = value;
				}))
			.addText(text => text
				.setPlaceholder(i18n.t('settings.summoner_placeholder'))
				.onChange(value => {
					newFriendName = value;
				}))
			.addText(text => text
				.setPlaceholder(i18n.t('settings.tag_placeholder'))
				.onChange(value => {
					newFriendTag = value;
				}))
			.addButton(button => button
				.setButtonText(i18n.t('settings.add_button'))
				.setCta()
				.onClick(async () => {
					if (newFriendName && newFriendTag && newFriendDisplay) {
						this.plugin.settings.registeredFriends.push({
							name: newFriendName,
							tagLine: newFriendTag,
							displayName: newFriendDisplay
						});
						await this.plugin.saveSettings();
						new Notice(i18n.t('notifications.friend_added', { name: newFriendDisplay }));
						this.display(); // 再描画
					} else {
						new Notice(i18n.t('notifications.fill_all_fields'));
					}
				}));

		// 使い方セクション
		containerEl.createEl('h3', { text: i18n.t('settings.usage_title') });

		// 説明コンテナ
		const usageEl = containerEl.createEl('div', { cls: 'setting-item-description' });

		// 翻訳からステップ配列を取得
		const steps = i18n.tArray('settings.usage_steps');

		// <ol> 要素を作成して usageEl に追加
		const olEl = usageEl.createEl('ol');

		// 各ステップを <li> として追加
		for (const step of steps) {
			const liEl = olEl.createEl('li');
			liEl.setText(step);
		}
	}
}
