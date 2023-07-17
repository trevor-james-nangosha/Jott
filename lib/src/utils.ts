// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import dayjs, { Dayjs } from "dayjs";
import { Request } from "express";
import { mkdirSync, existsSync } from "node:fs";
import { homedir } from "os";
import { join } from "path";
import winston from "winston";

// ------------------------- dayjs date utils ---------------------------------
export function isDateToday(date: Dayjs): boolean {
	return dayjs().diff(date, "day") <= 0;
}

// ------------------------- request utils -------------------------------
export function parseEntryFromRequest(req: Request) {
	const body = req.body;
	const { id, date, content } = body;

	return { id, date, content };
}

// ------------------------- file utils -------------------------------
export function makeDir(dir: string) {
	try {
		if (existsSync(dir)) {
			console.log(`Directory ${dir} already exists.`);
		} else {
			mkdirSync(dir, { recursive: true });
		}
	} catch (error) {
		console.error(error);
	}
}

export function getAppEnvBaseDir() {
	const APP_BASE_DIR = join(homedir(), "jottt");

	if (process.env?.NODE_ENV === "production") {
		return join(APP_BASE_DIR, "prod")
	}
	return join(APP_BASE_DIR, "dev")
}


export function getLogger() {
	const logger = winston.createLogger({
		level: "info",
		format: winston.format.simple(),
		defaultMeta: { service: "appServer" },
		transports: [
			new winston.transports.Console({ level: "debug" }),
			new winston.transports.File({ filename: join(getAppEnvBaseDir(), "logs", "errors.log"), level: "error" }),
			new winston.transports.File({ filename: join(getAppEnvBaseDir(), "logs", "jottt.log"), level: "info" }),
		],
	})

	return logger;
}