const express = require("express");
const { startSession } = require("mongoose");
const { Order, validate } = require("../models/order");
const { Product } = require("../models/product");
const logger = require("../helpers/logger");

const router = express.Router();

router.get("/", async (req, res, err) => {
	const orders = await Order.find();
	res.send(orders);
});

router.get("/:id", async (req, res, err) => {
	const order = await Order.findById(req.params.id);

	if (!order) return res.status(404).send("Order with given ID not found.");

	res.send(order);
});

router.post("/", async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return res.status(400).send(error.details[0].message);

	const session = await startSession();
	try {
		session.startTransaction();

		const order = new Order({
			userId: req.body.userId,
			cart: req.body.cart,
			address: req.body.address,
			paymentMethod: req.body.paymentMethod,
		});
		await order.save({ session });

		await Promise.all(
			req.body.cart.map(async (item) => {
				const product = await Product.findById(item.productId);
				if (!product) {
					throw new Error("Product with given ID not found.");
				}

				const colorIndex = product.options
					.map((option) => option.color)
					.indexOf(item.color);
				if (colorIndex < 0) {
					throw new Error(
						`This product doesn't have ${item.color} color option.`
					);
				}

				const sizeIndex = product.options[colorIndex].quantityPerSize
					.map((i) => i.size)
					.indexOf(item.size);
				if (sizeIndex < 0) {
					throw new Error(
						`This product doesn't have ${item.size} size option.`
					);
				}

				product.sold += item.quantity;
				product.options[colorIndex].quantityPerSize[
					sizeIndex
				].quantity -= item.quantity;

				await product.save({ session });
			})
		);

		await session.commitTransaction();
		session.endSession();
		res.send("Congratulations! You have a good taste in fashion.");
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		logger.error(err.message, err);
		res.send("Something failed.");
	}
});

module.exports = router;
