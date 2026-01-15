import { GithubOutlined, FileTextOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Layout, Row, Col, Typography, Space } from 'antd';

import {
  APP_NAME,
  APP_VERSION,
  COPYRIGHT_YEAR,
  COPYRIGHT_HOLDER,
  GITHUB_REPO_URL,
  GITHUB_ISSUES_URL,
  GITHUB_DISCUSSIONS_URL,
  LICENSE_TYPE,
  LICENSE_URL,
} from '@/utils/constants';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

/**
 * Footer Component
 *
 * Application footer with copyright, links, and important information.
 * Provides links to GitHub, documentation, support, and license information.
 *
 * Features:
 * - Copyright notice
 * - Links to GitHub, support, and documentation
 * - License information
 * - Version information
 * - Responsive layout
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const displayYear = currentYear > COPYRIGHT_YEAR ? `${COPYRIGHT_YEAR}-${currentYear}` : COPYRIGHT_YEAR.toString();

  return (
    <AntFooter
      style={{
        background: '#fafafa',
        borderTop: '1px solid #f0f0f0',
        padding: '24px 50px',
      }}
    >
      <Row gutter={[24, 24]}>
        {/* Links Section */}
        <Col xs={24} sm={12} md={8}>
          <Space direction="vertical" size="small">
            <Text strong>Resources</Text>
            <Space direction="vertical" size="small">
              <Link href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                <GithubOutlined /> GitHub Repository
              </Link>
              <Link href={GITHUB_DISCUSSIONS_URL} target="_blank" rel="noopener noreferrer">
                <QuestionCircleOutlined /> Support & Discussions
              </Link>
              <Link href={GITHUB_ISSUES_URL} target="_blank" rel="noopener noreferrer">
                <FileTextOutlined /> Report Issues
              </Link>
            </Space>
          </Space>
        </Col>

        {/* Legal Section */}
        <Col xs={24} sm={12} md={8}>
          <Space direction="vertical" size="small">
            <Text strong>Legal</Text>
            <Space direction="vertical" size="small">
              <Link href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
                {LICENSE_TYPE}
              </Link>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Copyright © {displayYear} {COPYRIGHT_HOLDER}
              </Text>
            </Space>
          </Space>
        </Col>

        {/* About Section */}
        <Col xs={24} sm={24} md={8}>
          <Space direction="vertical" size="small">
            <Text strong>About</Text>
            <Space direction="vertical" size="small">
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {APP_NAME} - A comprehensive goals tracking management system
              </Text>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Version {APP_VERSION}
              </Text>
            </Space>
          </Space>
        </Col>
      </Row>
    </AntFooter>
  );
};

