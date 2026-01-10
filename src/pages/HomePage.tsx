import { Typography } from 'antd';

const { Title } = Typography;

export const HomePage = () => {
  return (
    <div>
      <Title level={1}>Goals Tracking Management System</Title>
      <Title level={3}>Welcome! The project is initialized and ready for development.</Title>
      <p>Start building features according to the specifications in the <code>specs/</code> directory.</p>
    </div>
  );
};

