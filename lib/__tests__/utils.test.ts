/* eslint-disable @typescript-eslint/no-var-requires */
const dayjs = require("dayjs");
const { isDateToday } = require("../src/utils");
import { Request } from "express";
import { getAppEnvBaseDir, parseEntryFromRequest } from "../src/utils";
import { homedir } from "os";
import { join } from "path";

describe("utils functionality", () => {
	test("Should return true if the date passed is today", () => {
		const today = dayjs(new Date());
		expect(isDateToday(today)).toBe(true);
	});

	test("Should return false if the date passed is today", () => {
		const today = dayjs(new Date("2021-01-01"));
		expect(isDateToday(today)).toBe(false);
	});

	test("Should get entry from request body", () => {
		const requestBody = {
			id: "123",
			date: "2021-01-01",
			content: "test",
		};

		const req = {
			body: requestBody,
		} as Request;

		const entry = parseEntryFromRequest(req);
		expect(entry.id).toBe(requestBody.id);
		expect(entry.date).toBe(requestBody.date);
		expect(entry.content).toBe(requestBody.content);
	});

    test("should return dev directory for dev node environment", () => {
        const devDir = join(homedir(), "jottt", "dev")
        expect(getAppEnvBaseDir()).toBe(devDir)
	});
});
