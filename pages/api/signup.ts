import { NextApiRequest, NextApiResponse } from 'next';
import runMiddleware from '../../utils/runMiddleware';
import connectDB from '../../middleware/connectDB';
import cors from '../../middleware/cors';
import { sign } from 'jsonwebtoken';
import { hash } from 'bcrypt';
import { User, IUser } from '../../models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	await runMiddleware(req, res, cors);

	switch (req.method) {
		case 'POST':
			if (!req.body) return res.status(400).json({ msg: 'Request Invalid' });

			const {
				fullName,
				username,
				email,
				phone,
				password,
				confirmPassword,
				dateOfBirth,
				address,
				aadhar,
				imageUrl,
				contentToDisplay,
				meta,
			} = req.body;

			if (
				!fullName ||
				!username ||
				!email ||
				!phone ||
				!password ||
				!confirmPassword ||
				!dateOfBirth ||
				!address ||
				!imageUrl ||
				!contentToDisplay ||
				!meta
			)
				return res
					.status(400)
					.json({ msg: 'Please enter all the required fields' });

			if (password !== confirmPassword)
				return res.status(400).json({ msg: "Passwords don't match" });

			const unameExists = await User.findOne({ username });
			const emailExists = await User.findOne({ email });
			const phoneExists = await User.findOne({ phone });
			const aadharExists = await User.findOne({ aadhar });

			if (unameExists)
				return res.status(400).json({ msg: 'Username already exists' });
			if (emailExists)
				return res.status(400).json({ msg: 'Email already registered' });
			if (phoneExists)
				return res.status(400).json({ msg: 'Phone Number already registered' });
			if (aadharExists)
				return res
					.status(400)
					.json({ msg: 'Aadhar Number already registered' });

			if (!unameExists && !emailExists && !phoneExists && !aadharExists) {
				try {
					const hashedPwd = await hash(password, 12);
					const newUsr = new User({
						fullName,
						username,
						email,
						phone,
						password: hashedPwd,
						dateOfBirth,
						address,
						imageUrl,
						contentToDisplay,
						meta,
					});

					const createdUsr = await newUsr.save();
					if (createdUsr) {
						const token = sign(
							{ user: createdUsr.id },
							// @ts-ignore
							process.env.JWT_SECRET,
							{ expiresIn: '15d' }
						);
						return res.status(200).json({
							msg: 'User signed up successfully',
							data: {
								username,
								email,
								phone,
							},
							token,
						});
					}
				} catch (err) {
					console.error('SignUp Error:', err);
					return res.status(500).json({ msg: 'Something went wrong' });
				}
			}
			break;
		default:
			return res.status(405).end('Method Not Allowed'); //Method Not Allowed
	}
};

export default connectDB(handler);

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
// 	.eyJ1c2VyIjp7Im1ldGEiOnsiZ2VucmUiOlsiQm9sbHl3b29kIl0sImV2ZW50cyI6WyJSaW5nIENlcmVtb255Il19LCJ5b3V0dWJlTGlua3MiOltdLCJyb2xlIjoiVU5WRVJJRklFRF9BUlRJU1QiLCJfaWQiOiI2MGU3NTA2NGYzNjAyMjBlMjA4MTUyZDciLCJmdWxsTmFtZSI6IkpvaG4gRG9lIiwidXNlcm5hbWUiOiJqb2huZG9lIiwiZW1haWwiOiJhYmNAeHl6LmNvbSIsInBob25lIjoiKzkxOTg3NjU0MzIxMCIsInBhc3N3b3JkIjoiJDJiJDEyJGszQ243aWVKUU5NeW9RRW5QSC4uTk9VSGYweHAwQ3I2bjJOck9INjVOZmlXLkhxTVVRaGNXIiwiZGF0ZU9mQmlydGgiOiIyMC0wNS0yMDAwIiwiYWRkcmVzcyI6IllvdXIgSGVhcnQiLCJpbWFnZVVybCI6Imh0dHBzOiAvL3BpY3N1bS5waG90b3MvMjAwIiwiY29udGVudFRvRGlzcGxheSI6W3siX2lkIjoiNjBlNzUwNjRmMzYwMjIwZTIwODE1MmQ4IiwidGl0bGUiOiJZb3V0dWJlIFZpZGVvIiwiZGVzY3JpcHRpb24iOiJNeSBZb3V0dWJlIFZpZGVvIiwibWVkaWFVcmwiOiJodHRwczogLy9waWNzdW0ucGhvdG9zLzIwMCJ9XSwiY3JlYXRlZEF0IjoiMjAyMS0wNy0wOFQxOToyMjoxMi40NzFaIiwidXBkYXRlZEF0IjoiMjAyMS0wNy0wOFQxOToyMjoxMi40NzFaIiwiX192IjowfSwiaWF0IjoxNjI1NzcyMTMyLCJleHAiOjE2MjcwNjgxMzJ9
// 	.d1EB6ij0tmWnRptGUGn23mE_QvmAoc7Xow2QOxHH7k;