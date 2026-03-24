import { Outlet } from "react-router";

function AuthLayout() {
    return (
        <div className="auth-wrapper">
            <Outlet />
        </div>
    );
}

export default AuthLayout;