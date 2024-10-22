import { useState } from 'react';
import { Button, Input, Switch, cn, Card, CardBody } from '@nextui-org/react';
import { CheckCircledIcon, CircleIcon, EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import { toast } from 'sonner';

export const Security = ({ user }: any) => {
	const [fields, setFields] = useState(user);
	const [showPsswrd1, setShowPsswrd1] = useState(false);
	const [showPsswrd2, setShowPsswrd2] = useState(false);
	const [showPsswrd3, setShowPsswrd3] = useState(false);
	const [passwordHelp, setPasswordHelp] = useState(false);
	const toggle1 = () => setShowPsswrd1(!showPsswrd1);
	const toggle2 = () => setShowPsswrd2(!showPsswrd2);
	const toggle3 = () => setShowPsswrd3(!showPsswrd3);

	const [passwordValidation, setPasswordValidation] = useState({
		hasMinLength: false,
		hasUpperCase: false,
		hasLowerCase: false,
		hasDigit: false,
		hasSpecialChar: false,
		confirmPasswordMatch: false,
	});

	const checkLength = (value: string) => {
		if (value.length >= 8) {
			return true;
		} else {
			return false;
		}
	};

	const checkPassword = (value: string, checkPoint: any) => {
		if (value.match(checkPoint)) {
			return true;
		} else {
			return false;
		}
	};

	const confirmPassword = (value: string) => {
		if (value === fields.newPassword) {
			return setPasswordValidation({
				...passwordValidation,
				confirmPasswordMatch: true,
			});
		} else {
			return setPasswordValidation({
				...passwordValidation,
				confirmPasswordMatch: false,
			});
		}
	};

	const update = async (field: string, value: any, e?: React.ChangeEvent<HTMLInputElement>) => {
		e?.preventDefault();

		if (field === 'password') value = [value.password, value.newPassword];

		await axios
			.put(`/api/members/${fields.id}`, { [field]: value })
			.then((res) => {
				field === 'otpEnabled' && setFields({ ...fields, otpEnabled: value });
				if (res?.data.error) toast.error(res?.data.error);
				if (res?.data.warning) toast.warning(res?.data.warning);
				if (res?.data.success) toast.success(res?.data.success);
			})
			.catch();
	};

	const validatePassword = (value: any) => {
		const upper = /(?=.*?[A-Z])/;
		const lower = /(?=.*?[a-z])/;
		const digit = /(?=.*?[0-9])/;
		const special = /(?=.*?[#?!@$ %^&*-])/;

		setPasswordValidation({
			...passwordValidation,
			hasMinLength: checkLength(value),
			hasUpperCase: checkPassword(value, upper),
			hasLowerCase: checkPassword(value, lower),
			hasDigit: checkPassword(value, digit),
			hasSpecialChar: checkPassword(value, special),
		});
		setFields({ ...fields, newPassword: value });
		setPasswordHelp(true);
	};

	const PasswordHelp = () => {
		return (
			<div className='grid grid-cols-2 md:gap-2'>
				<div>
					<div className='text-muted-foreground text-xs flex'>
						{passwordValidation.hasMinLength ? (
							<CheckCircledIcon className='me-2 text-success' />
						) : (
							<CircleIcon className='me-2' />
						)}
						<span className={passwordValidation.hasMinLength ? 'line-through' : ''}>Min length (8)</span>
					</div>
					<div className='text-muted-foreground text-xs flex'>
						{passwordValidation.hasUpperCase ? (
							<CheckCircledIcon className='me-2 text-success' />
						) : (
							<CircleIcon className='me-2' />
						)}
						<span className={passwordValidation.hasUpperCase ? 'line-through' : ''}>
							Upper letter (A-Z)
						</span>
					</div>
					<div className='text-muted-foreground text-xs flex'>
						{passwordValidation.hasLowerCase ? (
							<CheckCircledIcon className='me-2 text-success' />
						) : (
							<CircleIcon className='me-2' />
						)}
						<span className={passwordValidation.hasLowerCase ? 'line-through' : ''}>
							Lower letter (a-z)
						</span>
					</div>
				</div>
				<div>
					<div className='text-muted-foreground text-xs flex'>
						{passwordValidation.hasSpecialChar ? (
							<CheckCircledIcon className='me-2 text-success' />
						) : (
							<CircleIcon className='me-2' />
						)}
						<span className={passwordValidation.hasSpecialChar ? 'line-through' : ''}>
							Special character
						</span>
					</div>
					<div className='text-muted-foreground text-xs flex'>
						{passwordValidation.confirmPasswordMatch ? (
							<CheckCircledIcon className='me-2 text-success' />
						) : (
							<CircleIcon className='me-2' />
						)}
						<span className={passwordValidation.confirmPasswordMatch ? 'line-through' : ''}>
							Passwords match
						</span>
					</div>
				</div>
			</div>
		);
	};

	return (
		<Card className='border-none max-w-md w-full rounded-md m-auto mt-3 text-default-foreground' shadow='sm'>
			<CardBody className='grid grid-cols-1 gap-8 items-center justify-center py-4 px-8'>
				<form onSubmit={(e) => update('password', fields, e)} className='flex flex-col gap-3 mt-4 '>
					<span className='font-semibold'>Change password</span>
					<Input
						size='sm'
						isRequired
						radius='none'
						label='Old Password'
						type={showPsswrd1 ? 'text' : 'password'}
						onValueChange={(v) => setFields({ ...fields, password: v })}
						endContent={
							<Button
								size='sm'
								isIconOnly
								variant='light'
								className='p-0 rounded-full m-auto'
								onClick={toggle1}
							>
								{showPsswrd1 ? <EyeOpenIcon /> : <EyeClosedIcon />}
							</Button>
						}
					/>
					<Input
						size='sm'
						isRequired
						radius='none'
						label='New Password'
						type={showPsswrd2 ? 'text' : 'password'}
						onKeyUp={(e) => validatePassword(e.target.value)}
						endContent={
							<Button
								size='sm'
								isIconOnly
								variant='light'
								className='p-0 rounded-full m-auto'
								onClick={toggle2}
							>
								{showPsswrd2 ? <EyeOpenIcon /> : <EyeClosedIcon />}
							</Button>
						}
						isDisabled={!fields.password}
					/>
					<Input
						size='sm'
						isRequired
						radius='none'
						label='Confirm Password'
						type={showPsswrd3 ? 'text' : 'password'}
						onKeyUp={(e) => confirmPassword(e.target.value)}
						endContent={
							<Button
								size='sm'
								isIconOnly
								variant='light'
								className='p-0 rounded-full m-auto'
								onClick={toggle3}
							>
								{showPsswrd3 ? <EyeOpenIcon /> : <EyeClosedIcon />}
							</Button>
						}
						description={passwordHelp && <PasswordHelp />}
						isDisabled={
							!fields.password ||
							!fields.newPassword ||
							fields.password == fields.newPassword ||
							!passwordValidation.hasDigit ||
							!passwordValidation.hasLowerCase ||
							!passwordValidation.hasMinLength ||
							!passwordValidation.hasUpperCase
						}
					/>
					<Button
						size='md'
						color='primary'
						type='submit'
						radius='none'
						isDisabled={!fields.password || !fields.newPassword || !passwordValidation.confirmPasswordMatch}
					>
						UPDATE PASSWORD
					</Button>
				</form>
				<hr className='w-[80%] mx-auto' />
				<Switch
					onValueChange={(e) => update('otpEnabled', e)}
					defaultSelected={fields.otpEnabled}
					classNames={{
						base: cn(
							'inline-flex flex-row-reverse w-full max-w-full hover:bg-default-200 items-center mb-4',
							'justify-between cursor-pointer  rounded-none py-1.5 px-3 gap-2 border-2 border-transparent  bg-content2'
						),
						wrapper: 'p-0 h-4 overflow-visible',
						thumb: cn(
							'w-6 h-6 border-2 shadow-lg  bg-content1',
							'group-data-[hover=true]:border-primary',
							//selected
							'group-data-[selected=true]:ml-6',
							// pressed
							'group-data-[pressed=true]:w-7',
							'group-data-[selected]:group-data-[pressed]:ml-4'
						),
					}}
				>
					<div className='flex flex-col gap-1'>
						<span className='font-semibold text-default-foreground'>
							OTP enabled: {fields.otpEnabled ? 'Yes' : 'No'}
						</span>
						<small className='text-tiny text-default-400 flex gap-1 items-center'>
							When login an One-Time-Password (OTP) confimation will be send to your email
						</small>
					</div>
				</Switch>
			</CardBody>
		</Card>
	);
};
