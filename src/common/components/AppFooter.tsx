import React from 'react';
import { Layout, Space, Typography, Divider } from 'antd';
import { LinkedinOutlined, GlobalOutlined } from '@ant-design/icons';

const { Footer } = Layout;
const { Text, Link } = Typography;

const linkStyle = {
  color: 'rgba(0, 0, 0, 0.65)',
  transition: 'all 0.3s ease',
};

const iconStyle = {
  fontSize: 20,
  color: 'rgba(0, 0, 0, 0.65)',
  transition: 'all 0.3s ease',
};

const AppFooter: React.FC = () => {
  const [hoveredIcon, setHoveredIcon] = React.useState<string | null>(null);
  const [hoveredLink, setHoveredLink] = React.useState<string | null>(null);

  return (
    <Footer 
      style={{ 
        background: '#fff',
        padding: '24px 0',
        color: 'rgba(0, 0, 0, 0.65)',
        fontSize: 14,
        boxShadow: '0 -1px 2px rgba(0, 0, 0, 0.03)'
      }}
    >
      <div style={{ 
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 50px',
        width: '100%'
      }}>
        <Space 
          split={<Divider type="vertical" />}
          style={{
            paddingRight: 24
          }}
        >
          <Text strong>© 2025 AKB-SOFTWARE</Text>
          <Link 
            href="https://www.akb.com.vn/about" 
            target="_blank"
            style={{
              ...linkStyle,
              color: hoveredLink === 'about' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'
            }}
            onMouseEnter={() => setHoveredLink('about')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            About Us
          </Link>
          <Link 
            href="https://www.akb.com.vn/contact" 
            target="_blank"
            style={{
              ...linkStyle,
              color: hoveredLink === 'contact' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'
            }}
            onMouseEnter={() => setHoveredLink('contact')}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Contact
          </Link>
        </Space>

        <Space 
          size="large"
          style={{
            paddingLeft: 24
          }}
        >
          <Link 
            href="https://linkedin.com/company/akb-software" 
            target="_blank"
            style={{
              transform: hoveredIcon === 'linkedin' ? 'translateY(-2px)' : 'none',
              display: 'inline-block'
            }}
          >
            <LinkedinOutlined 
              style={{
                ...iconStyle,
                color: hoveredIcon === 'linkedin' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'
              }}
              onMouseEnter={() => setHoveredIcon('linkedin')}
              onMouseLeave={() => setHoveredIcon(null)}
            />
          </Link>
          <Link 
            href="https://www.akb.com.vn" 
            target="_blank"
            style={{
              transform: hoveredIcon === 'web' ? 'translateY(-2px)' : 'none',
              display: 'inline-block'
            }}
          >
            <GlobalOutlined 
              style={{
                ...iconStyle,
                color: hoveredIcon === 'web' ? '#1890ff' : 'rgba(0, 0, 0, 0.65)'
              }}
              onMouseEnter={() => setHoveredIcon('web')}
              onMouseLeave={() => setHoveredIcon(null)}
            />
          </Link>
        </Space>
      </div>
    </Footer>
  );
};

export default AppFooter;