const express = require("express");
const { startSession } = require("mongoose");
const { Order, validate } = require("../models/order");
const { Product } = require("../models/product");
const logger = require("../helpers/logger");
const sendErr = require("../helpers/sendError");

const router = express.Router();

router.get("/", async (req, res, err) => {
	const orders = await Order.find();
	res.send(orders);
});

router.get("/:id", async (req, res, err) => {
	if (req.params.id === "pending") {
		const orders = await Order.find({ status: "pending" });
		return res.send(orders);
	}

	const order = await Order.findById(req.params.id);

	if (!order) return sendErr(res, 404, "Order with given ID not found.");

	res.send(order);
});

router.patch("/:id", async (req, res, err) => {
	const order = await Order.findByIdAndUpdate(req.params.id, {
		status: req.body.status,
	});

	if (!order) return sendErr(res, 404, "Order with given ID not found.");

	res.send({ message: "Successfully Updated." });
});

router.post("/", async (req, res, err) => {
	const { error } = validate(req.body);
	if (error) return sendErr(res, 400, error.details[0].message);

	const session = await startSession();
	try {
		session.startTransaction();

		const order = new Order({
			name: req.body.name,
			phone: req.body.phone,
			email: req.body.email,
			note: req.body.note,
			address: req.body.address,
			cart: req.body.cart,
			price: req.body.price,
			status: req.body.status,
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

				if (
					product.options[colorIndex].quantityPerSize[sizeIndex]
						.quantity < item.quantity
				) {
					throw new Error(`"${product.name}" is out of stock.`);
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
		res.send({
			message: "Order Successfully Placed.",
		});
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		logger.error(err.message, err);
		sendErr(res, 400, err.message);
	}
});

module.exports = router;
