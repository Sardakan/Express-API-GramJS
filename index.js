import express from "express";
import dotenv from "dotenv";
//import cors from "cors";

//Для возможности работы с фронтендом раскоментируйте 2 строки с cors
//For frontend development uncomment the two lines with cors

import { TelegramService } from "./config/telegram.js";
import authRoutes from "./routes/auth_routes.js";
import messageRoutes from "./routes/message_routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

//app.use(cors());
app.use(express.json());

const tgService = new TelegramService();

app.listen(PORT, async () => {
	console.log(`server started on port: ${PORT}`);

	try {
		await tgService.initialize();
	} catch (err) {
		console.error("critical error in client initialization: ", err);
	}
});

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);

export { tgService };