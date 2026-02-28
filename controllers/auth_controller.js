import { tgService } from "../index.js";

export const checkAuthStatus = async (req, res) => {
	try {
		const isAuthorized = await tgService.isAuthorized();
		res.json({ authorized: isAuthorized });
	} catch (error) {
		console.error("Ошибка проверки статуса:", error);
		res.status(500).json({ authorized: false });
	}
};
