import Axios from 'axios';
import { ErrorMessage, Field, Form as FormikForm, Formik } from 'formik';
import Link from 'next/link';
import Router from 'next/router';
import { useContext } from 'react';
import { Offcanvas, Button, Form, Modal } from 'react-bootstrap';
import * as Yup from 'yup';
import Context from '../Context';
import BsFormik from '../components/BsFormik';
import Image from 'next/image';

export const Login = () => {
	const { loginShow, setLoginShow } = useContext(Context);

	const initialValues = {
		email: '',
		password: '',
	};
	const validationSchema = Yup.object().shape({
		email: Yup.string().email('Invalid Email').required('Email is required.'),
		password: Yup.string()
			.required('No password provided.')
			.min(8, 'Password is too short - should be 8 chars minimum.'),
	});

	const login = (values) => {
		const { email, password } = values;
		console.log('Login');
		Axios.post('/login', { email, password })
			.then((r) => {
				localStorage.setItem(
					'auth-token',
					r.headers.authorization.split(' ')[1]
				);
				Router.reload();
			})
			.catch(console.error);
	};

	return (
		<>
			<Offcanvas
				placement="end"
				show={loginShow}
				onHide={() => setLoginShow(false)}
			>
				<Offcanvas.Header closeButton>
					<Offcanvas.Title>Artist Login</Offcanvas.Title>
				</Offcanvas.Header>
				<Offcanvas.Body className="position-relative">
					<div className="text-center">
						<Image src="/launch.svg" alt="" width="220" height="220" />
					</div>
					<Formik
						initialValues={initialValues}
						validationSchema={validationSchema}
						onSubmit={login}
					>
						{({ values, errors, touched, isSubmitting }) => (
							<FormikForm>
								<Form.Group className="mb-3">
									<BsFormik
										name="email"
										label="Email"
										isInvalid={errors.email && touched.email}
									/>
								</Form.Group>

								<Form.Group className="mb-3">
									<BsFormik
										name="password"
										label="Password"
										isInvalid={errors.password && touched.password}
									/>
								</Form.Group>
								<Button variant="success" type="submit" disabled={isSubmitting}>
									Submit
								</Button>
								<small className="ms-2">
									New to Odeo.in?{' '}
									<Link href="/signup">
										<a>SignUp</a>
									</Link>
								</small>
							</FormikForm>
						)}
					</Formik>
					<Link href="/password-reset">
						<a className="d-block mt-3">
							<small>Forgot password?</small>
						</a>
					</Link>
				</Offcanvas.Body>
			</Offcanvas>
		</>
	);
};