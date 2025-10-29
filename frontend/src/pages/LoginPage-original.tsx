import LoginForm from '../components/LoginForm';
import DemoContactCard from '../components/DemoContactCard';
import { useTenant } from '../hooks/useTenant';
import './LoginPage.css';

const LoginPage = () => {
    const tenantInfo = useTenant();
    const isDemoTenant = tenantInfo.id === 'demo';

    return (
        <div className="login-page">
            <LoginForm />
            {isDemoTenant && (
                <div className="demo-contact-container">
                    <DemoContactCard />
                </div>
            )}
        </div>
    );
};

export default LoginPage;