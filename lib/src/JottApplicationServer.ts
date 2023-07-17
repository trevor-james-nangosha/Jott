import express, { Request, Response, json, urlencoded, NextFunction } from "express";
import cors from "cors";
import { JotttDatabase } from "./JotttDatabase";
import { KnexConnection } from "./types";
import { getLogger, parseEntryFromRequest } from "./utils";

const logger = getLogger()

export default class JottApplicationServer {
	public app;
	public server;
	public serverActive = false;
	public db: JotttDatabase;

	public constructor(conn: KnexConnection, appBaseDir: string) {
		this.db = new JotttDatabase(conn, appBaseDir);
		this.app = express();
		this.app.use(this.logger);
		this.app.use(json());
		this.app.use(urlencoded());
		this.app.use(cors());

		this.registerRoutes();

		this.server = this.app.listen(4001, () => {
			this.serverActive = true;
			logger.info("Server listening on port 4001");
		});
	}

	public killServer() {
		this.server.close(() => {
			logger.info("Closing server connections.");
			this.serverActive = false;
			process.exit(0);
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private logger(req: Request, _res: Response, next: NextFunction) {
		logger.info(`${new Date().toUTCString()} ${req.method} ${req.url}`);

		next()
	}

	private registerRoutes() {
		this.app.get("/", (req, res) => {
			res.send("hello, world");
		});

		this.app.get("/entries", async (req, res) => {
			const date = req.query.date as string;
			res.json(await this.db.readOperation(date, null));
		});

		this.app.post("/entries", async (req, res) => {
			const entry = parseEntryFromRequest(req);

			await this.db
				.postOperation(entry)
				.then(() => {
					res.status(201).send({
						message: "Entry saved successfully",
					});
				})
				.catch((error) => {
					logger.error(error);
					res.status(500).send({ message: "Could not save entry." });
				});
		});
	}
}
