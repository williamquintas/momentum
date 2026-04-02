import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { usePageTitle } from '@/hooks/usePageTitle';

export const NotFoundPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Set page title
  usePageTitle(t('notFound.pageNotFound'));

  return (
    <Result
      status="404"
      title="404"
      subTitle={t('notFound.sorryPageDoesNotExist')}
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          {t('notFound.backHome')}
        </Button>
      }
    />
  );
};
