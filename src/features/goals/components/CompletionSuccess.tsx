/**
 * Completion Success Component
 *
 * Displays a celebration animation and message when a goal is completed.
 */

import { useEffect, useState } from 'react';

import { CheckCircleFilled, TrophyOutlined, StarFilled, FireOutlined } from '@ant-design/icons';
import { Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';

import type { CompletionEvent, CelebrationData } from '@/features/goals/types/completion';
import type { Goal } from '@/types/goal.types';

interface CompletionSuccessProps {
  goal: Goal;
  completion: CompletionEvent;
  onClose?: () => void;
  onViewGoal?: () => void;
  showConfetti?: boolean;
}

export function CompletionSuccess({
  goal,
  completion,
  onClose,
  onViewGoal,
  showConfetti = true,
}: CompletionSuccessProps): JSX.Element {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const celebration = completion.celebration;

  useEffect(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const getIcon = () => {
    switch (celebration.type) {
      case 'enthusiastic':
        return <FireOutlined style={{ fontSize: 64, color: '#ff4d4f' }} />;
      case 'moderate':
        return <TrophyOutlined style={{ fontSize: 64, color: '#faad14' }} />;
      default:
        return <CheckCircleFilled style={{ fontSize: 64, color: '#52c41a' }} />;
    }
  };

  const getStatus = () => {
    switch (celebration.type) {
      case 'enthusiastic':
        return 'success';
      case 'moderate':
        return 'success';
      default:
        return 'info';
    }
  };

  const handleBackdropClick = (): void => {
    onClose?.();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
      role="presentation"
    >
      {showConfetti && celebration.animation && celebration.type !== 'subtle' && (
        <ConfettiAnimation type={celebration.type} />
      )}
      <div
        style={{
          transform: isVisible ? 'scale(1)' : 'scale(0.8)',
          opacity: isVisible ? 1 : 0,
          transition: 'all 0.3s ease-out',
        }}
      >
        <Result
          status={getStatus()}
          icon={getIcon()}
          title={
            <span id="completion-title" style={{ fontSize: '1.5rem' }}>
              {celebration.message || t('completionSuccess.goalCompleted')}
            </span>
          }
          subTitle={
            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: 8, fontSize: '1.1rem' }}>{goal.title}</p>
              <p style={{ color: '#888', margin: 0 }}>
                {t('completionSuccess.completedIn', { duration: formatDuration(completion.metrics.totalTime) })}
              </p>
              {celebration.badge && (
                <div
                  style={{
                    marginTop: 16,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #fa8c16 0%, #ffc069 100%)',
                    borderRadius: 20,
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                >
                  <StarFilled /> {celebration.badge}
                </div>
              )}
            </div>
          }
          extra={
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {onViewGoal && (
                <Button type="primary" size="large" onClick={onViewGoal}>
                  {t('completionSuccess.viewGoal')}
                </Button>
              )}
              {onClose && (
                <Button size="large" onClick={onClose}>
                  {t('completionSuccess.close')}
                </Button>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

interface ConfettiAnimationProps {
  type: CelebrationData['type'];
}

function ConfettiAnimation({ type }: ConfettiAnimationProps): JSX.Element {
  const [particles] = useState(() =>
    Array.from({ length: type === 'enthusiastic' ? 100 : 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ['#ff4d4f', '#faad14', '#52c41a', '#1890ff', '#722ed1'][Math.floor(Math.random() * 5)],
      size: 8 + Math.random() * 8,
    }))
  );

  if (type === 'subtle') {
    return <></>;
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: -20,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti-fall ${particle.duration}s linear ${particle.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default CompletionSuccess;
