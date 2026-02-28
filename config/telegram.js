import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import readline from "readline";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const API_ID = parseInt(process.env.API_ID, 10);
const API_HASH = process.env.API_HASH;
const SESSION_FILE = "./session.txt";

export class TelegramService {
	constructor() {
		this.client = null;
		this.session = new StringSession(this.loadSession());
		this.rl = null;
	}

	loadSession() {
		if (fs.existsSync(SESSION_FILE)) {
			console.log("session loaded from file.");
			return fs.readFileSync(SESSION_FILE, "utf8");
		} else {
			console.log("file session doesn't finded, now it will be created");
			return "";
		}
	}

	saveSession() {
		const sessionData = this.client.session.save();
		fs.writeFileSync(SESSION_FILE, sessionData);
		console.log("session saved in session.txt");
	}

	async initialize() {
		this.client = new TelegramClient(this.session, API_ID, API_HASH, {
			connectionRetries: 5,
			langCode: "ru",
			systemLangCode: "ru-RU",
		});

		await this.client.connect();
		console.log("client connected to server");

		try {
			await this.client.getMe();
			console.log("user is already authorized");
		} catch (err) {
			console.log("no valid session found");
			await this.startAuthFlow();
		}
	}

	async startAuthFlow() {
		if (this.client) await this.client.disconnect();

		this.client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
			connectionRetries: 5,
			langCode: "ru",
			systemLangCode: "ru-RU",
		});

		this.rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		try {
			await this.client.start({
				phoneNumber: async () => new Promise((resolve) => this.rl.question("Please enter your number: ", resolve)),
				password: async () => new Promise((resolve) => this.rl.question("Please enter your password: ", resolve)),
				phoneCode: async () => new Promise((resolve) => this.rl.question("Please enter the code you received: ", resolve)),
				onError: (err) => console.error("authorization error:", err),
			});

			console.log("you should now be connected.");
			this.saveSession();

			this.rl.close();
			this.rl = null;
		} catch (err) {
			console.error("сritical auth error:", err);
			this.rl.close();
			this.rl = null;
			throw err;
		}
	}

	getClient() {
		return this.client;
	}

	async isAuthorized() {
		if (!this.client) return false;
		try {
			await this.client.getMe();
			return true;
		} catch (err) {
			return false;
		}
	}
}
