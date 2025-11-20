import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../config/firebase-config";
import { useGetCurrentUser } from '../hooks/useGetCurrentUser';
import { useGetLogin } from '../hooks/useGetLogin';

const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isAuth } = useGetCurrentUser();
	const { getLogin } = useGetLogin();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) {
      navigate('/inventory');
    }
  }, [isAuth, navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);

		const provider = new GoogleAuthProvider();
		const result = await signInWithPopup(auth, provider);

		if (!result) return;

		const emailInquire = await getLogin(result.user.email!);

		if (emailInquire.success) {
			const user = result.user;

			const userInfo = {
				username: user.displayName ?? "",
				isAuth: true,
			};

			localStorage.setItem("currentUser", JSON.stringify(userInfo));
			navigate("/inventory");
		}

    setIsLoading(false);
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full px-6 py-3 rounded-lg font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Signing in..."
            ) : (
              <>
                <img
                  src="/google-logo.png"
                  alt="Google logo"
                  className="h-8"
                />
                Sign in with Google
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default Login;
