import { useRouter } from 'next/navigation';

export default function SessionExpired() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-neutral-900 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Session Expired</h2>
        <p className="text-gray-300 mb-6">
          Your session has expired. Please log in again to continue.
        </p>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-violet-600 text-white p-2 rounded-full hover:bg-violet-700 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
