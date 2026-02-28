import { tgService } from "../index.js";

export const sendMessage = async (req, res) => {
	try {
		const { phone, message } = req.body;

		const trimmedMessage = String(message).trim();

		if (!phone || !trimmedMessage) {
			return res.status(400).json({
				success: false,
				error: "INVALID_INPUT",
			});
		}

		let normalizedPhone = String(phone).replace(/[^0-9+]/g, "");

		if (normalizedPhone.startsWith("8") && normalizedPhone.length === 11) {
			normalizedPhone = "+7" + normalizedPhone.slice(1);
		}

		if (normalizedPhone.startsWith("7") && !normalizedPhone.startsWith("+") && normalizedPhone.length === 11) {
			normalizedPhone = "+7" + normalizedPhone;
		}

		if (!normalizedPhone.startsWith("+")) {
			normalizedPhone = "+" + normalizedPhone;
		}

		const phoneRegex = /^\+\d{8,15}$/;
		if (!phoneRegex.test(normalizedPhone)) {
			return res.status(400).json({
				success: false,
				error: "INVALID_PHONE",
			});
		}

		if (!(await tgService.isAuthorized())) {
			return res.status(401).json({
				success: false,
				error: "NOT_AUTHORIZED",
			});
		}

		const client = tgService.getClient();
		let entity;

		try {
			entity = await client.getInputEntity(normalizedPhone);
		} catch (err) {
			console.error("User not found:", err);
			return res.status(400).json({
				success: false,
				error: "USER_NOT_FOUND",
			});
		}

		try {
			await client.sendMessage(entity, { message });
		} catch (err) {
			console.error("sending error:", err);

			if (err.message?.includes?.("FLOOD_WAIT")) {
				return res.status(429).json({
					success: false,
					error: "FLOOD_WAIT",
				});
			}

			return res.status(500).json({
				success: false,
				error: "SEND_FAILED",
			});
		}

		return res.json({
			success: true,
			sentTo: normalizedPhone,
		});
	} catch (error) {
		console.error("unknown error + messageController:", error);
		return res.status(500).json({
			success: false,
			error: "INTERNAL_ERROR",
		});
	}
};
