import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGetLogin from '../hooks/useGetLogin';
import getCurrentUser from '../hooks/useGetCurrentUser';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const { isAuth } = getCurrentUser()
	const navigate = useNavigate();

	useEffect(() => {
		if (isAuth) {
			navigate('/inventory');
		}
	}, [isAuth, navigate]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		
		if (!username.trim()) {
			setError('Please enter a username');
			return;
		}

		if (!password.trim()) {
			setError('Please enter a password');
			return;
		}

		setIsLoading(true);

		const { getLogin } = useGetLogin();
		const result = await getLogin(username, password);
		
		if (result.success) {
			navigate('/inventory');
			const userInfo = {
				username,
				isAuth: true,
			}
			localStorage.setItem("currentUser", JSON.stringify(userInfo))
		} else {
			setError(result.error ? result.error : 'Unexpected Error')
		}

		setIsLoading(false)
	};

	return (
		<div className="flex items-center justify-center p-6 mt-8">
			<div className="max-w-md w-full">
				<div className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">
							Login
						</h1>
					</div>

					<form onSubmit={handleLogin} className="space-y-6">
						<div>
							<label 
								htmlFor="username" 
								className="block text-sm font-medium text-gray-700 mb-2">
								Username
							</label>
							<input
								id="username"
								type="text"
								value={username}
								onChange={(e) => {
									setUsername(e.target.value);
									setError('');
								}}
								placeholder="Enter your username"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"/>
						</div>

						<div>
							<label 
								htmlFor="password" 
								className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									setError('');
								}}
								placeholder="Enter your password"
								className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"/>
						</div>

						{error && (
							<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
								{error}
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full px-6 py-3 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
							{isLoading ? 'Logging In...' : 'Log In'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Login;