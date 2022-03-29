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
		await order.save();

		req.body.cart.forEach(async (item) => {
			const product = await Product.findById(item.productId);
			const colorIndex = product.options
				.map((option) => option.color)
				.indexOf(item.color);
			const sizeIndex = product.options[colorIndex].quantityPerSize
				.map((i) => i.size)
				.indexOf(item.size);
			// await Product.updateOne({_id: item._id}, {$inc: {options[1]: 0} })

			await Product.updateOne(
				{ _id: item.productId },
				{
					$inc: {
						sold: item.quantity,
						"options.$[i].quantityPerSize.$[x].quantity":
							product.options[colorIndex].quantityPerSize[
								sizeIndex
							].quantity >= item.quantity
								? -item.quantity
								: 0,
					},
				},
				{
					arrayFilters: [
						{ "i.color": item.color },
						{ "x.size": item.size },
					],
				}
			);
		});

		await session.commitTransaction();
		session.endSession();
		res.send("Congratulations! You have a good taste in fashion.");
	} catch (err) {
		await session.abortTransaction();
		session.endSession();
		logger(err);
		res.send("Error");
	}
});

module.exports = router;
