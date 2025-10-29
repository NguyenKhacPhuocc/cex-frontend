/**
 * EXAMPLE: Cách sử dụng useAuth hook
 * 
 * Hook này cung cấp authentication state và user info
 * Tự động kiểm tra token validity và refresh khi cần
 */

'use client';

import { useAuth } from './useAuth';

export default function ExampleComponent() {
    const { user, role, isLogin, isLoading, refetch } = useAuth();

    // 1. Hiển thị loading state
    if (isLoading) {
        return <div>Loading...</div>;
    }

    // 2. Kiểm tra login state
    if (!isLogin) {
        return (
            <div>
                <p>Please login to continue</p>
                <a href="/login">Go to Login</a>
            </div>
        );
    }

    // 3. Hiển thị user info
    return (
        <div>
            <h1>Welcome {user?.username}!</h1>
            <p>Email: {user?.email}</p>
            <p>Role: {role}</p>

            {/* 4. Conditional rendering based on role */}
            {role === 'admin' && (
                <div>
                    <h2>Admin Panel</h2>
                    <button>Manage Users</button>
                </div>
            )}

            {/* 5. Manual refetch nếu cần */}
            <button onClick={() => refetch()}>
                Refresh Auth Status
            </button>
        </div>
    );
}

/**
 * USAGE EXAMPLES:
 * 
 * 1. Protected Route Component:
 * ```tsx
 * function ProtectedPage() {
 *   const { isLogin, isLoading } = useAuth();
 *   
 *   if (isLoading) return <Spinner />;
 *   if (!isLogin) return <Navigate to="/login" />;
 *   
 *   return <YourProtectedContent />;
 * }
 * ```
 * 
 * 2. Show/Hide based on role:
 * ```tsx
 * function Navbar() {
 *   const { role, user } = useAuth();
 *   
 *   return (
 *     <nav>
 *       {role === 'admin' && <AdminLink />}
 *       {user && <ProfileDropdown user={user} />}
 *     </nav>
 *   );
 * }
 * ```
 * 
 * 3. Logout function:
 * ```tsx
 * function LogoutButton() {
 *   const { refetch } = useAuth();
 *   
 *   const handleLogout = async () => {
 *     // Clear tokens
 *     localStorage.removeItem('accessToken');
 *     sessionStorage.removeItem('accessToken');
 *     
 *     // Call logout API
 *     await fetch('/api/auth/logout', { method: 'POST' });
 *     
 *     // Refresh auth state
 *     refetch();
 *   };
 *   
 *   return <button onClick={handleLogout}>Logout</button>;
 * }
 * ```
 * 
 * 4. API Request with auth:
 * ```tsx
 * function DataFetchComponent() {
 *   const { isLogin } = useAuth();
 *   
 *   const fetchData = async () => {
 *     const token = localStorage.getItem('accessToken');
 *     
 *     const response = await fetch('/api/data', {
 *       headers: {
 *         'Authorization': `Bearer ${token}`
 *       }
 *     });
 *     
 *     return response.json();
 *   };
 *   
 *   // ... rest of component
 * }
 * ```
 */

