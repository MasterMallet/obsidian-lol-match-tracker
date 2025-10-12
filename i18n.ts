// 言語タイプ
export type Language = 'en' | 'ko' | 'ja';

// 翻訳の型定義
export interface Translations {
	// 一般
	plugin_name: string;

	// 通知メッセージ
	notifications: {
		fetching_matches: string;
		success: string;
		error: string;
		api_key_missing: string;
		summoner_name_missing: string;
		friend_added: string;
		fill_all_fields: string;
	};

	// 設定画面
	settings: {
		title: string;
		api_settings: string;
		api_key: string;
		api_key_desc: string;
		api_key_placeholder: string;

		account_info: string;
		summoner_name: string;
		summoner_name_desc: string;
		summoner_name_placeholder: string;
		tag_line: string;
		tag_line_desc: string;
		tag_line_placeholder: string;
		region: string;
		region_desc: string;

		note_settings: string;
		notes_folder: string;
		notes_folder_desc: string;
		notes_folder_placeholder: string;
		friends_folder: string;
		friends_folder_desc: string;
		friends_folder_placeholder: string;
		match_count: string;
		match_count_desc: string;

		language_settings: string;
		language: string;
		language_desc: string;

		friend_management: string;
		friend_management_desc: string;
		add_friend: string;
		display_name: string;
		display_name_placeholder: string;
		summoner_placeholder: string;
		tag_placeholder: string;
		add_button: string;
		delete_button: string;

		usage_title: string;
		usage_steps: string[];
	};

	// 試合ノート
	match: {
		title: string;
		overview: string;
		result: string;
		win: string;
		loss: string;
		game_time: string;
		game_mode: string;
		match_date: string;

		performance: string;
		stats: string;
		kda: string;
		cs: string;
		damage_dealt: string;
		damage_taken: string;
		gold_earned: string;
		vision_score: string;

		build: string;
		items: string;
		summoner_spells: string;
		runes: string;

		team_composition: string;
		ally_team: string;
		enemy_team: string;
		lane_opponent: string;

		reflection: string;
		good_points: string;
		improvements: string;
		learned: string;

		auto_generated: string;
	};

	// フレンドノート
	friend_match: {
		title_with: string;
		overview: string;
		play_style: string;
		same_team: string;
		versus: string;

		my_performance: string;
		champion: string;

		friend_performance: string;
		build_details: string;

		feedback: string;
		good_points: string;
		improvements: string;
		next_time: string;

		coordination: string;
		good_coordination: string;
		improve_coordination: string;

		notes: string;
		notes_placeholder: string;

		main_match_note: string;
	};

	// ゲームモード
	game_modes: {
		[key: string]: string;
	};

	// サモナースペル
	summoner_spells: {
		[key: string]: string;
	};
}

// 英語翻訳
const en: Translations = {
	plugin_name: 'LoL Match Tracker',

	notifications: {
		fetching_matches: '🔍 Fetching match data...',
		success: '✅ Created {count} match notes',
		error: '❌ Error: {message}',
		api_key_missing: '❌ Riot API key is not configured',
		summoner_name_missing: '❌ Summoner name is not configured',
		friend_added: '✅ Added {name}',
		fill_all_fields: '❌ Please fill in all fields'
	},

	settings: {
		title: 'LoL Match Tracker Settings',
		api_settings: 'API Settings',
		api_key: 'Riot API Key',
		api_key_desc: 'Enter your API key from Riot Developer Portal (https://developer.riotgames.com/)',
		api_key_placeholder: 'RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',

		account_info: 'Account Information',
		summoner_name: 'Summoner Name',
		summoner_name_desc: 'Your Riot ID',
		summoner_name_placeholder: 'SummonerName',
		tag_line: 'Tag Line',
		tag_line_desc: 'Your tag line (part after #)',
		tag_line_placeholder: 'NA1',
		region: 'Region',
		region_desc: 'Your server region',

		note_settings: 'Note Settings',
		notes_folder: 'Notes Folder',
		notes_folder_desc: 'Folder path to save match notes',
		notes_folder_placeholder: 'LoL Matches',
		friends_folder: 'Friends Folder',
		friends_folder_desc: 'Folder path to save friend match notes',
		friends_folder_placeholder: 'LoL Matches/Friends',
		match_count: 'Number of Matches',
		match_count_desc: 'Number of matches to fetch at once (1-20)',

		language_settings: 'Language Settings',
		language: 'Language',
		language_desc: 'Interface language',

		friend_management: 'Friend Management',
		friend_management_desc: 'Friend match notes will be automatically created when playing with registered friends.',
		add_friend: 'Add New Friend',
		display_name: 'Display Name',
		display_name_placeholder: 'Display Name (e.g., John)',
		summoner_placeholder: 'Summoner Name',
		tag_placeholder: 'Tag Line',
		add_button: 'Add',
		delete_button: 'Delete',

		usage_title: 'How to Use',
		usage_steps: [
			'Get API key from Riot Developer Portal',
			'Enter settings above',
			'Register friends you frequently play with',
			'Click trophy icon in left sidebar or run "Fetch Latest Matches" from command palette (Ctrl/Cmd+P)',
			'Match notes will be automatically generated in specified folder',
			'Separate notes will be created in friends folder for matches with registered friends'
		]
	},

	match: {
		title: 'Match Overview',
		overview: 'Match Overview',
		result: 'Result',
		win: '🏆 Victory',
		loss: '💀 Defeat',
		game_time: 'Game Time',
		game_mode: 'Game Mode',
		match_date: 'Match Date',

		performance: 'Performance',
		stats: 'Stats',
		kda: 'KDA',
		cs: 'CS',
		damage_dealt: 'Damage Dealt',
		damage_taken: 'Damage Taken',
		gold_earned: 'Gold Earned',
		vision_score: 'Vision Score',

		build: 'Build',
		items: 'Items',
		summoner_spells: 'Summoner Spells',
		runes: 'Runes',

		team_composition: 'Team Composition',
		ally_team: 'Ally Team',
		enemy_team: 'Enemy Team',
		lane_opponent: 'Lane Opponent',

		reflection: 'Reflection Notes',
		good_points: 'Good Points',
		improvements: 'Improvements',
		learned: 'What I Learned',

		auto_generated: '*This note was automatically generated by LoL Match Tracker plugin*'
	},

	friend_match: {
		title_with: 'Match with {name}',
		overview: 'Match Overview',
		play_style: 'Play Style',
		same_team: '👥 Same Team',
		versus: '⚔️ Versus',

		my_performance: 'My Performance',
		champion: 'Champion',

		friend_performance: "{name}'s Performance",
		build_details: 'Build Details',

		feedback: 'Feedback for {name}',
		good_points: 'Good Points',
		improvements: 'Areas for Improvement',
		next_time: 'Things to Try Next Time',

		coordination: 'Coordination',
		good_coordination: 'Good Coordination',
		improve_coordination: 'Coordination to Improve',

		notes: 'Notes',
		notes_placeholder: '<!-- Write any observations about this match -->',

		main_match_note: '*Main match note: [[{filename}]]*'
	},

	game_modes: {
		0: 'Custom',
		400: 'Normal (Draft)',
		420: 'Ranked (Solo/Duo)',
		430: 'Normal (Blind)',
		440: 'Ranked (Flex)',
		450: 'ARAM',
		700: 'Clash',
		720: 'ARAM Clash',
		830: 'Co-op vs AI (Intro)',
		840: 'Co-op vs AI (Beginner)',
		850: 'Co-op vs AI (Intermediate)',
		900: 'URF',
		1020: 'One for All',
		1300: 'Nexus Blitz',
		1400: 'Ultimate Spellbook'
	},

	summoner_spells: {
		1: 'Cleanse',
		3: 'Exhaust',
		4: 'Flash',
		6: 'Ghost',
		7: 'Heal',
		11: 'Smite',
		12: 'Teleport',
		13: 'Clarity',
		14: 'Ignite',
		21: 'Barrier',
		32: 'Mark/Dash'
	}
};

// 韓国語翻訳
const ko: Translations = {
	plugin_name: 'LoL 전적 추적기',

	notifications: {
		fetching_matches: '🔍 전적 데이터를 가져오는 중...',
		success: '✅ {count}개의 경기 노트를 생성했습니다',
		error: '❌ 오류: {message}',
		api_key_missing: '❌ Riot API 키가 설정되지 않았습니다',
		summoner_name_missing: '❌ 소환사명이 설정되지 않았습니다',
		friend_added: '✅ {name}님을 추가했습니다',
		fill_all_fields: '❌ 모든 항목을 입력해주세요'
	},

	settings: {
		title: 'LoL 전적 추적기 설정',
		api_settings: 'API 설정',
		api_key: 'Riot API 키',
		api_key_desc: 'Riot Developer Portal (https://developer.riotgames.com/)에서 발급받은 API 키를 입력하세요',
		api_key_placeholder: 'RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',

		account_info: '계정 정보',
		summoner_name: '소환사명',
		summoner_name_desc: '당신의 Riot ID',
		summoner_name_placeholder: '소환사명',
		tag_line: '태그',
		tag_line_desc: '태그라인 (# 뒤의 부분)',
		tag_line_placeholder: 'KR1',
		region: '지역',
		region_desc: '플레이하는 서버 지역',

		note_settings: '노트 설정',
		notes_folder: '노트 폴더',
		notes_folder_desc: '경기 노트를 저장할 폴더 경로',
		notes_folder_placeholder: 'LoL 전적',
		friends_folder: '친구 폴더',
		friends_folder_desc: '친구 경기 노트를 저장할 폴더 경로',
		friends_folder_placeholder: 'LoL 전적/친구',
		match_count: '가져올 경기 수',
		match_count_desc: '한 번에 가져올 경기 수 (1-20)',

		language_settings: '언어 설정',
		language: '언어',
		language_desc: '인터페이스 언어',

		friend_management: '친구 관리',
		friend_management_desc: '등록된 친구와 함께 플레이한 경기는 친구 전용 노트가 자동으로 생성됩니다.',
		add_friend: '새 친구 추가',
		display_name: '표시 이름',
		display_name_placeholder: '표시 이름 (예: 철수)',
		summoner_placeholder: '소환사명',
		tag_placeholder: '태그라인',
		add_button: '추가',
		delete_button: '삭제',

		usage_title: '사용 방법',
		usage_steps: [
			'Riot Developer Portal에서 API 키 발급',
			'위의 설정 입력',
			'자주 함께 플레이하는 친구 등록',
			'왼쪽 사이드바의 트로피 아이콘 클릭 또는 명령 팔레트(Ctrl/Cmd+P)에서 "최근 경기 가져오기" 실행',
			'지정한 폴더에 경기 노트가 자동 생성됩니다',
			'등록된 친구와의 경기는 친구 폴더에 별도 노트가 생성됩니다'
		]
	},

	match: {
		title: '경기 개요',
		overview: '경기 개요',
		result: '결과',
		win: '🏆 승리',
		loss: '💀 패배',
		game_time: '게임 시간',
		game_mode: '게임 모드',
		match_date: '경기 일시',

		performance: '성적',
		stats: '통계',
		kda: 'KDA',
		cs: 'CS',
		damage_dealt: '가한 피해량',
		damage_taken: '받은 피해량',
		gold_earned: '획득 골드',
		vision_score: '시야 점수',

		build: '빌드',
		items: '아이템',
		summoner_spells: '소환사 주문',
		runes: '룬',

		team_composition: '팀 구성',
		ally_team: '아군 팀',
		enemy_team: '적군 팀',
		lane_opponent: '라인 상대',

		reflection: '복기 노트',
		good_points: '잘한 점',
		improvements: '개선할 점',
		learned: '배운 점',

		auto_generated: '*이 노트는 LoL 전적 추적기 플러그인에 의해 자동 생성되었습니다*'
	},

	friend_match: {
		title_with: '{name}님과의 경기',
		overview: '경기 개요',
		play_style: '플레이 형태',
		same_team: '👥 같은 팀',
		versus: '⚔️ 대전',

		my_performance: '내 성적',
		champion: '챔피언',

		friend_performance: '{name}님의 성적',
		build_details: '빌드 상세',

		feedback: '{name}님에 대한 피드백',
		good_points: '잘한 점',
		improvements: '개선할 점',
		next_time: '다음에 시도할 것',

		coordination: '호흡에 대해',
		good_coordination: '좋았던 호흡',
		improve_coordination: '개선할 호흡',

		notes: '메모',
		notes_placeholder: '<!-- 이 경기에 대해 느낀 점을 자유롭게 작성 -->',

		main_match_note: '*메인 경기 노트: [[{filename}]]*'
	},

	game_modes: {
		0: '사용자 지정',
		400: '일반 (칼바람)',
		420: '랭크 (솔로/듀오)',
		430: '일반 (무작위)',
		440: '랭크 (자유 5:5)',
		450: '칼바람 나락',
		700: '격전',
		720: '칼바람 격전',
		830: 'AI 대전 (입문)',
		840: 'AI 대전 (초급)',
		850: 'AI 대전 (중급)',
		900: '우르프',
		1020: '단일 챔피언',
		1300: '넥서스 블리츠',
		1400: '궁극기 주문서'
	},

	summoner_spells: {
		1: '정화',
		3: '탈진',
		4: '점멸',
		6: '유체화',
		7: '회복',
		11: '강타',
		12: '순간이동',
		13: '명료함',
		14: '점화',
		21: '방어막',
		32: '표식/돌진'
	}
};

// 日本語翻訳
const ja: Translations = {
	plugin_name: 'LoL 試合トラッカー',

	notifications: {
		fetching_matches: '🔍 試合データを取得中...',
		success: '✅ {count}件の試合ノートを作成しました',
		error: '❌ エラー: {message}',
		api_key_missing: '❌ Riot APIキーが設定されていません',
		summoner_name_missing: '❌ サモナー名が設定されていません',
		friend_added: '✅ {name}を追加しました',
		fill_all_fields: '❌ すべての項目を入力してください'
	},

	settings: {
		title: 'LoL 試合トラッカー 設定',
		api_settings: 'API設定',
		api_key: 'Riot API キー',
		api_key_desc: 'Riot Developer Portal (https://developer.riotgames.com/) から取得したAPIキーを入力してください',
		api_key_placeholder: 'RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',

		account_info: 'アカウント情報',
		summoner_name: 'サモナー名',
		summoner_name_desc: 'あなたのRiot ID',
		summoner_name_placeholder: 'サモナー名',
		tag_line: 'タグライン',
		tag_line_desc: 'タグライン（#の後ろの部分）',
		tag_line_placeholder: 'JP1',
		region: 'リージョン',
		region_desc: 'プレイしているサーバーリージョン',

		note_settings: 'ノート設定',
		notes_folder: '保存先フォルダ',
		notes_folder_desc: '試合ノートを保存するフォルダのパス',
		notes_folder_placeholder: 'LoL試合記録',
		friends_folder: 'フレンドフォルダ',
		friends_folder_desc: 'フレンド試合ノートを保存するフォルダのパス',
		friends_folder_placeholder: 'LoL試合記録/フレンド',
		match_count: '取得試合数',
		match_count_desc: '一度に取得する試合の数（1-20）',

		language_settings: '言語設定',
		language: '言語',
		language_desc: 'インターフェース言語',

		friend_management: 'フレンド管理',
		friend_management_desc: '登録したフレンドと一緒にプレイした試合では、フレンド専用のノートが自動作成されます。',
		add_friend: '新しいフレンドを追加',
		display_name: '表示名',
		display_name_placeholder: '表示名（例: タロウ）',
		summoner_placeholder: 'サモナー名',
		tag_placeholder: 'タグライン',
		add_button: '追加',
		delete_button: '削除',

		usage_title: '使い方',
		usage_steps: [
			'Riot Developer Portal でAPIキーを取得',
			'上記の設定を入力',
			'よく一緒にプレイするフレンドを登録',
			'左サイドバーのトロフィーアイコンをクリック、またはコマンドパレット（Ctrl/Cmd+P）から「最新の試合を取得」を実行',
			'指定したフォルダに試合ノートが自動生成されます',
			'登録されたフレンドとの試合は、フレンド専用フォルダに別途ノートが作成されます'
		]
	},

	match: {
		title: '試合概要',
		overview: '試合概要',
		result: '勝敗',
		win: '🏆 勝利',
		loss: '💀 敗北',
		game_time: 'ゲーム時間',
		game_mode: 'ゲームモード',
		match_date: '試合日時',

		performance: 'パフォーマンス',
		stats: 'スタッツ',
		kda: 'KDA',
		cs: 'CS',
		damage_dealt: '与ダメージ',
		damage_taken: '被ダメージ',
		gold_earned: '獲得ゴールド',
		vision_score: 'ビジョンスコア',

		build: 'ビルド',
		items: 'アイテム',
		summoner_spells: 'サモナースペル',
		runes: 'ルーン',

		team_composition: 'チーム構成',
		ally_team: '味方チーム',
		enemy_team: '敵チーム',
		lane_opponent: '対面',

		reflection: '振り返りメモ',
		good_points: '良かった点',
		improvements: '改善点',
		learned: '学んだこと',

		auto_generated: '*このノートは LoL 試合トラッカー プラグインによって自動生成されました*'
	},

	friend_match: {
		title_with: '{name}との試合',
		overview: '試合概要',
		play_style: 'プレイ形式',
		same_team: '👥 同じチーム',
		versus: '⚔️ 対戦',

		my_performance: '自分のパフォーマンス',
		champion: 'チャンピオン',

		friend_performance: '{name}のパフォーマンス',
		build_details: 'ビルド詳細',

		feedback: '{name}へのフィードバック',
		good_points: '良かった点',
		improvements: '改善できそうな点',
		next_time: '次回試したいこと',

		coordination: '連携について',
		good_coordination: 'うまくいった連携',
		improve_coordination: '改善したい連携',

		notes: 'メモ',
		notes_placeholder: '<!-- この試合について気づいたことを自由に記入 -->',

		main_match_note: '*メイン試合ノート: [[{filename}]]*'
	},

	game_modes: {
		0: 'カスタム',
		400: 'ノーマル（ドラフト）',
		420: 'ランク（ソロ/デュオ）',
		430: 'ノーマル（ブラインド）',
		440: 'ランク（フレックス）',
		450: 'ARAM',
		700: 'クラッシュ',
		720: 'ARAM（クラッシュ）',
		830: 'Co-op vs AI（入門）',
		840: 'Co-op vs AI（初級）',
		850: 'Co-op vs AI（中級）',
		900: 'URF',
		1020: 'ワン・フォー・オール',
		1300: 'ネクサスブリッツ',
		1400: 'アルティメットスペルブック'
	},

	summoner_spells: {
		1: 'クレンズ',
		3: 'イグゾースト',
		4: 'フラッシュ',
		6: 'ゴースト',
		7: 'ヒール',
		11: 'スマイト',
		12: 'テレポート',
		13: 'クラリティ',
		14: 'イグナイト',
		21: 'バリア',
		32: 'マーク/ダッシュ'
	}
};

// 翻訳オブジェクト
const translations: Record<Language, Translations> = {
	en,
	ko,
	ja
};

// i18nクラス
export class I18n {
	private currentLanguage: Language;

	constructor(language: Language = 'en') {
		this.currentLanguage = language;
	}

	setLanguage(language: Language) {
		this.currentLanguage = language;
	}

	getLanguage(): Language {
		return this.currentLanguage;
	}

	t(key: string, params?: Record<string, string | number>): string {
		const keys = key.split('.');
		let value: any = translations[this.currentLanguage];

		for (const k of keys) {
			if (value && typeof value === 'object') {
				value = value[k];
			} else {
				return key; // キーが見つからない場合はキーそのものを返す
			}
		}

		if (typeof value !== 'string') {
			return key;
		}

		// パラメータの置換
		if (params) {
			Object.keys(params).forEach(paramKey => {
				value = value.replace(`{${paramKey}}`, String(params[paramKey]));
			});
		}

		return value;
	}

	// 配列用のヘルパー
	tArray(key: string): string[] {
		const keys = key.split('.');
		let value: any = translations[this.currentLanguage];

		for (const k of keys) {
			if (value && typeof value === 'object') {
				value = value[k];
			} else {
				return [];
			}
		}

		return Array.isArray(value) ? value : [];
	}
}
